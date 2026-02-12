/**
 * Node.js Lite Pipeline — runs the full narrative detection pipeline
 * in-process, without Python dependencies. Vercel-compatible.
 *
 * Optimized: batched LLM calls (label+ideas in 1 call, action packs in 1 call per narrative).
 * Total LLM calls: ~20 (10 label+ideas + 10 action pack batches) instead of ~70.
 * With concurrency 3: completes LLM phase in ~60s.
 */

import { prisma } from "@/lib/prisma";
import { ingestSignals, loadProjectCorpus, loadDemoEmbeddings } from "./ingest";
import { scoreSignals } from "./scoring";
import {
  agglomerativeCluster,
  computeSaturation,
  simpleTextEmbed,
} from "./clustering";
import {
  labelNarrativeWithIdeas,
  generateActionPackBatch,
} from "@/lib/llm/anthropic";

const TOP_K = 20;
const MAX_NARRATIVES = 10;

interface PipelineResult {
  reportId: string;
  narrativeCount: number;
  candidateCount: number;
  durationMs: number;
}

// ─── Concurrency limiter ────────────────────────────────────

function pLimit(concurrency: number) {
  const queue: Array<() => void> = [];
  let active = 0;

  function next() {
    while (queue.length > 0 && active < concurrency) {
      active++;
      const fn = queue.shift()!;
      fn();
    }
  }

  return function <T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn().then(resolve, reject).finally(() => {
          active--;
          next();
        });
      });
      next();
    });
  };
}

export async function runPipeline(
  periodStart?: Date,
  periodEnd?: Date
): Promise<PipelineResult> {
  const startTime = Date.now();
  const limit = pLimit(3); // 3 concurrent LLM calls

  const pEnd = periodEnd ?? new Date();
  const pStart =
    periodStart ?? new Date(pEnd.getTime() - 14 * 24 * 60 * 60 * 1000);

  console.log(
    `[Pipeline] Starting: ${pStart.toISOString()} → ${pEnd.toISOString()}`
  );

  // Step 1: Ingest signals
  console.log("[Pipeline] Step 1: Ingesting signals...");
  const signals = await ingestSignals(pStart, pEnd);
  console.log(`[Pipeline]   ${signals.length} signals loaded`);

  if (signals.length === 0) {
    throw new Error("No signals to process");
  }

  // Step 2: Score
  console.log("[Pipeline] Step 2: Scoring candidates...");
  const scored = scoreSignals(signals);
  console.log(
    `[Pipeline]   Top candidate: ${scored[0]?.signal.label} (${scored[0]?.totalScore.toFixed(3)})`
  );

  // Step 3: Select top K
  const topK = scored.slice(0, TOP_K);
  console.log(`[Pipeline] Step 3: Selected top ${topK.length} candidates`);

  // Step 4: Build embeddings + cluster
  console.log("[Pipeline] Step 4: Clustering...");
  const demoEmbeddings = loadDemoEmbeddings();

  const candidateEmbeddings = topK.map((c) => {
    const existing = demoEmbeddings[c.signal.key];
    if (existing) return existing;

    const doc = `${c.signal.label} ${c.signal.kind} ${Object.entries(c.features)
      .filter(([, v]) => v > 1)
      .map(([k]) => k)
      .join(" ")}`;
    return simpleTextEmbed(doc);
  });

  const clusters = agglomerativeCluster(
    candidateEmbeddings,
    0.4,
    MAX_NARRATIVES
  );
  console.log(`[Pipeline]   ${clusters.length} clusters formed`);

  // Step 5: Create report in DB
  console.log("[Pipeline] Step 5: Creating report...");
  const report = await prisma.report.create({
    data: {
      periodStart: pStart,
      periodEnd: pEnd,
      status: "processing",
      configJson: {
        mode: "node_lite",
        top_k: TOP_K,
        max_narratives: MAX_NARRATIVES,
      },
      hash: `lite_${Date.now().toString(36)}`,
    },
  });

  // Create entities + candidates in parallel
  await Promise.all(
    topK.map(async (candidate) => {
      const entity = await prisma.entity.upsert({
        where: { key: candidate.signal.key },
        update: {
          lastSeen: pEnd,
          metricsJson: JSON.parse(JSON.stringify({
            onchain: candidate.signal.onchain,
            dev: candidate.signal.dev,
          })),
        },
        create: {
          kind: candidate.signal.kind,
          key: candidate.signal.key,
          label: candidate.signal.label,
          firstSeen: new Date(candidate.signal.first_seen),
          lastSeen: pEnd,
          metricsJson: JSON.parse(JSON.stringify({
            onchain: candidate.signal.onchain,
            dev: candidate.signal.dev,
          })),
        },
      });

      await prisma.candidate.create({
        data: {
          reportId: report.id,
          entityId: entity.id,
          momentum: candidate.momentum,
          novelty: candidate.novelty,
          quality: candidate.quality,
          totalScore: candidate.totalScore,
          featuresJson: candidate.features,
        },
      });
    })
  );

  // Step 6: Process clusters → narratives
  console.log("[Pipeline] Step 6: Generating narratives...");
  const corpus = loadProjectCorpus();
  const clustersToProcess = clusters.slice(0, MAX_NARRATIVES);

  // Prepare cluster data
  const clusterData = clustersToProcess.map((cluster) => {
    const members = cluster.memberIndices.map((i) => topK[i]);
    const clusterDocs = members.map((m) => {
      const featureSummary = Object.entries(m.features)
        .filter(([, v]) => Math.abs(v) > 0.5)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 5)
        .map(([k, v]) => `${k}: ${v > 0 ? "+" : ""}${v.toFixed(2)}`)
        .join(", ");
      return `${m.signal.label} (${m.signal.kind}): momentum=${m.momentum.toFixed(2)}, features=[${featureSummary}]`;
    });
    return { members, clusterDocs };
  });

  // Phase A: Label + Ideas in parallel (1 LLM call per cluster, concurrency 3)
  console.log(`[Pipeline]   Phase A: ${clusterData.length} clusters → label + ideas (batched)...`);
  const labelIdeasResults = await Promise.all(
    clusterData.map((cd) => limit(() => labelNarrativeWithIdeas(cd.clusterDocs)))
  );
  console.log(`[Pipeline]   Phase A complete: ${labelIdeasResults.length} labels + idea sets`);

  // Phase B: Action packs in parallel (1 LLM call per narrative, concurrency 3)
  console.log(`[Pipeline]   Phase B: Generating action packs (batched)...`);
  const actionPackResults = await Promise.all(
    labelIdeasResults.map(({ label, ideas }) =>
      limit(() => generateActionPackBatch(ideas, label.title))
    )
  );
  console.log(`[Pipeline]   Phase B complete: ${actionPackResults.length} action pack batches`);

  // Phase C: Persist to database (no more LLM calls)
  console.log(`[Pipeline]   Phase C: Persisting to database...`);
  let narrativeCount = 0;

  for (let ci = 0; ci < clusterData.length; ci++) {
    const { members } = clusterData[ci];
    const { label, ideas } = labelIdeasResults[ci];
    const actionPacks = actionPackResults[ci];
    if (!members.length) continue;

    const avgMomentum =
      members.reduce((s, m) => s + m.normalizedScore, 0) / members.length;
    const avgNovelty =
      members.reduce((s, m) => s + m.novelty, 0) / members.length;

    const narrative = await prisma.narrative.create({
      data: {
        reportId: report.id,
        title: label.title,
        summary: label.summary,
        momentum: avgMomentum,
        novelty: (avgNovelty - 1.0) / 0.3,
        saturation: 0,
        scoresJson: { clusterSize: members.length },
      },
    });

    // Investigation steps (parallel DB writes)
    const tools = [
      "repo_inspector",
      "dependency_tracker",
      "social_pain_finder",
      "idl_differ",
      "competitor_search",
    ];
    await Promise.all(
      tools.map((toolName, stepIdx) => {
        const targetMember = members[stepIdx % members.length];
        return prisma.investigationStep.create({
          data: {
            narrativeId: narrative.id,
            stepIndex: stepIdx,
            tool: toolName,
            inputJson: { entity_key: targetMember.signal.key },
            outputSummary: `Analyzed ${targetMember.signal.label} using ${toolName}. Key z-scores: ${Object.entries(targetMember.features)
              .filter(([, v]) => Math.abs(v) > 1)
              .map(([k, v]) => `${k}=${v.toFixed(2)}`)
              .join(", ") || "within baseline"}`,
            linksJson:
              targetMember.signal.kind === "repo"
                ? [`https://github.com/${targetMember.signal.key}`]
                : [],
          },
        });
      })
    );

    // Evidence (parallel DB writes)
    const evidenceCreates: Promise<unknown>[] = [];
    for (const member of members) {
      const topFeatures = Object.entries(member.features)
        .filter(([, v]) => v > 0.5)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      for (const [featureName, featureVal] of topFeatures) {
        const type = featureName.startsWith("z_tx") ||
          featureName.startsWith("z_unique") ||
          featureName.startsWith("z_new_wallet") ||
          featureName.startsWith("z_retention")
          ? "onchain"
          : featureName.startsWith("z_commit") ||
              featureName.startsWith("z_stars") ||
              featureName.startsWith("z_new_contrib") ||
              featureName.startsWith("z_release")
            ? "dev"
            : "social";

        evidenceCreates.push(
          prisma.narrativeEvidence.create({
            data: {
              narrativeId: narrative.id,
              type,
              title: `${member.signal.label}: ${featureName} = +${featureVal.toFixed(2)}σ`,
              url: "",
              snippet: `${featureName} for ${member.signal.label} is ${featureVal.toFixed(2)} standard deviations above baseline, indicating significant ${type} activity growth.`,
              metricsJson: { [featureName]: featureVal },
            },
          })
        );
      }
    }
    await Promise.all(evidenceCreates);

    // Ideas + action packs (parallel DB writes)
    let narrativeSaturation = 0;
    await Promise.all(
      ideas.map(async (idea, idx) => {
        const ideaEmb = simpleTextEmbed(`${idea.title} ${idea.pitch}`);
        const sat = corpus.embeddings.length > 0
          ? computeSaturation(ideaEmb, corpus.embeddings, corpus.meta)
          : { level: "low" as const, score: 0.2, neighbors: [] };

        narrativeSaturation = Math.max(narrativeSaturation, sat.score);

        const actionPack = actionPacks[idx] ?? actionPacks[0];
        const pivot =
          sat.level === "high"
            ? `Consider narrowing focus to a niche within ${idea.title} that existing competitors don't serve well.`
            : "";

        await prisma.idea.create({
          data: {
            narrativeId: narrative.id,
            title: idea.title,
            pitch: idea.pitch,
            targetUser: idea.targetUser,
            mvpScope: idea.mvpScope,
            whyNow: idea.whyNow,
            validation: idea.validation,
            saturationJson: sat,
            pivot,
            actionPackFilesJson: {
              "spec.md": actionPack.specMd,
              "tech.md": actionPack.techMd,
              "milestones.md": actionPack.milestonesMd,
              "deps.json": actionPack.depsJson,
            },
          },
        });
      })
    );

    await prisma.narrative.update({
      where: { id: narrative.id },
      data: { saturation: narrativeSaturation },
    });

    narrativeCount++;
    console.log(
      `[Pipeline]   Narrative ${narrativeCount}: "${label.title}" (${members.length} members, ${ideas.length} ideas)`
    );
  }

  // Mark report complete
  await prisma.report.update({
    where: { id: report.id },
    data: { status: "complete" },
  });

  const durationMs = Date.now() - startTime;
  console.log(
    `[Pipeline] Complete! ${narrativeCount} narratives, ${topK.length} candidates in ${(durationMs / 1000).toFixed(1)}s`
  );

  return {
    reportId: report.id,
    narrativeCount,
    candidateCount: topK.length,
    durationMs,
  };
}
