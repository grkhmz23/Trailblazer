/**
 * LLM integration — Moonshot Kimi (OpenAI-compatible API).
 *
 * Falls back to demo fixtures when MOONSHOT_API_KEY is missing or DEMO_MODE=true.
 * Retries with exponential backoff on 429/5xx.
 */

import { config } from "@/lib/config";
import {
  NarrativeLabelSchema,
  IdeasResponseSchema,
  ActionPackSchema,
  type NarrativeLabel,
  type Idea,
  type ActionPack,
} from "./schemas";
import type { z } from "zod";

// ─── Retry wrapper ──────────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("https://api.moonshot.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.moonshotApiKey}`,
        },
        body: JSON.stringify({
          model: config.moonshotModel,
          max_tokens: 4096,
          temperature: 0.4,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (res.status === 429 || res.status >= 500) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `Moonshot ${res.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Moonshot API ${res.status}: ${body}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in Moonshot response");
      return content;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error("Moonshot call failed after retries");
}

function parseJsonFromLlm<T>(raw: string, schema: z.ZodType<T>): T {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
}

// ─── Demo fallback generators ───────────────────────────────

function demoNarrativeLabel(docs: string[]): NarrativeLabel {
  const keywords = docs
    .join(" ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3);
  return {
    title: `Emerging ${keywords[0] ?? "Solana"} Narrative`,
    summary: `A cluster of ${docs.length} related signals indicate growing momentum in ${keywords.join(", ")}. Developer activity and on-chain metrics suggest early-stage adoption with potential for significant growth in the coming quarter.`,
    evidenceHints: [
      "Rising transaction counts in this category",
      "Multiple new repos targeting this use case",
      "Social mentions accelerating week-over-week",
    ],
  };
}

function demoIdeas(narrative: {
  title: string;
  summary: string;
}): Idea[] {
  return [
    {
      title: `${narrative.title} — SDK & Tooling`,
      pitch: `Developer tooling that simplifies building on top of the ${narrative.title} trend.`,
      targetUser: "Solana protocol developers",
      mvpScope:
        "TypeScript SDK + CLI for the core operations, with example integrations",
      whyNow: `The narrative is early (high novelty) with clear developer demand.`,
      validation:
        "GitHub issues and social pain points confirm tooling gap.",
    },
    {
      title: `${narrative.title} — Analytics Dashboard`,
      pitch: `Real-time analytics dashboard tracking the key metrics of ${narrative.title}.`,
      targetUser: "Traders, analysts, and protocol teams",
      mvpScope: "Web dashboard with 3-5 key charts and alert system",
      whyNow:
        "No existing tool tracks this specific narrative in real-time.",
      validation:
        "Multiple requests for better visibility into this area on forums and social.",
    },
    {
      title: `${narrative.title} — Integration Layer`,
      pitch: `Middleware that connects existing protocols to the emerging ${narrative.title} infrastructure.`,
      targetUser: "Existing DeFi protocols seeking to adopt new primitives",
      mvpScope:
        "Adapter contracts + SDK bridging legacy accounts to new architecture",
      whyNow:
        "First-mover advantage before the ecosystem standardizes.",
      validation:
        "Dependency tracking shows accelerating adoption of underlying crates.",
    },
  ];
}

function demoActionPack(
  idea: Idea,
  narrativeTitle: string
): ActionPack {
  return {
    specMd: `# ${idea.title}\n\n## Overview\n${idea.pitch}\n\n## Target User\n${idea.targetUser}\n\n## Problem Statement\nThe ${narrativeTitle} narrative reveals a clear gap in the ecosystem. ${idea.validation}\n\n## Proposed Solution\n${idea.mvpScope}\n\n## Success Metrics\n- 100+ weekly active developers within 3 months\n- Integration with 3+ major Solana protocols\n- Positive NPS from beta users\n\n## Non-Goals (v1)\n- Mobile app\n- Cross-chain support\n- Token launch\n`,
    techMd: `# Technical Plan — ${idea.title}\n\n## Architecture\n- **Runtime:** Solana (Anchor framework)\n- **Frontend:** Next.js + TypeScript\n- **Indexer:** Helius webhooks / geyser plugin\n- **Database:** PostgreSQL + pgvector for semantic search\n\n## Key Components\n1. **Smart Contracts** — Anchor programs for core logic\n2. **SDK** — TypeScript SDK published to npm\n3. **API** — REST + WebSocket for real-time data\n4. **Dashboard** — Next.js app with Tailwind\n\n## Security Considerations\n- Program upgrade authority managed by multisig\n- Rate limiting on all public endpoints\n- Input validation at every boundary\n\n## Testing Strategy\n- Unit tests for all program instructions\n- Integration tests on devnet\n- Load testing before mainnet\n`,
    milestonesMd: `# Milestones — ${idea.title}\n\n## Phase 1: Foundation (Weeks 1-3)\n- [ ] Set up monorepo + CI/CD\n- [ ] Implement core Anchor program\n- [ ] Write unit tests (90%+ coverage)\n- [ ] Deploy to devnet\n\n## Phase 2: SDK + API (Weeks 4-6)\n- [ ] TypeScript SDK with docs\n- [ ] REST API with authentication\n- [ ] Indexer for on-chain events\n- [ ] Integration tests\n\n## Phase 3: Dashboard + Launch (Weeks 7-9)\n- [ ] Frontend dashboard\n- [ ] Beta testing with 5-10 partners\n- [ ] Security audit\n- [ ] Mainnet deployment\n\n## Phase 4: Growth (Weeks 10-12)\n- [ ] Documentation + tutorials\n- [ ] Community outreach\n- [ ] Feature iteration based on feedback\n`,
    depsJson: JSON.stringify(
      {
        runtime: "solana",
        framework: "anchor",
        frontend: "next.js",
        database: "postgresql",
        key_crates: [
          "anchor-lang ^0.30",
          "solana-program ^1.18",
          "spl-token ^4.0",
        ],
        npm_packages: [
          "@solana/web3.js ^1.91",
          "@coral-xyz/anchor ^0.30",
          "next ^14",
          "prisma ^5",
        ],
        infrastructure: ["vercel", "neon-postgres", "helius-rpc"],
      },
      null,
      2
    ),
  };
}

// ─── Public API ─────────────────────────────────────────────

export async function labelNarrative(
  clusterDocs: string[]
): Promise<NarrativeLabel> {
  if (!config.hasLlm) return demoNarrativeLabel(clusterDocs);

  const raw = await callLLM(
    "You are a Solana ecosystem analyst. Given a cluster of related signal documents, produce a narrative label. Return ONLY valid JSON with keys: title (string, max 100 chars), summary (string, 2-4 sentences), evidenceHints (string array, 2-5 items).",
    `Cluster documents:\n\n${clusterDocs.map((d, i) => `[${i + 1}] ${d}`).join("\n\n")}`
  );

  return parseJsonFromLlm(raw, NarrativeLabelSchema);
}

export async function generateIdeas(
  narrative: { title: string; summary: string; evidence: string[] }
): Promise<Idea[]> {
  if (!config.hasLlm) return demoIdeas(narrative);

  const raw = await callLLM(
    "You are a startup idea generator specializing in Solana ecosystem opportunities. Given a narrative with evidence, generate 3-5 actionable build ideas. Return ONLY valid JSON: { ideas: [{ title, pitch, targetUser, mvpScope, whyNow, validation }] }.",
    `Narrative: ${narrative.title}\n\nSummary: ${narrative.summary}\n\nEvidence:\n${narrative.evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}`
  );

  const result = parseJsonFromLlm(raw, IdeasResponseSchema);
  return result.ideas;
}

export async function generateActionPack(
  idea: Idea,
  narrativeTitle: string
): Promise<ActionPack> {
  if (!config.hasLlm) return demoActionPack(idea, narrativeTitle);

  const raw = await callLLM(
    `You are a technical product manager. Given a build idea for the Solana ecosystem, generate a complete Action Pack. Return ONLY valid JSON with keys: specMd (markdown product spec), techMd (markdown technical plan), milestonesMd (markdown milestones with checkboxes), depsJson (JSON string of dependencies).`,
    `Idea: ${idea.title}\nPitch: ${idea.pitch}\nTarget: ${idea.targetUser}\nMVP: ${idea.mvpScope}\nNarrative context: ${narrativeTitle}`
  );

  return parseJsonFromLlm(raw, ActionPackSchema);
}
