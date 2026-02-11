import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvestigationTrace } from "@/components/narrative/investigation-trace";
import { EvidenceList } from "@/components/narrative/evidence-list";
import { IdeaCard } from "@/components/narrative/idea-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function NarrativeDetailPage({ params }: Props) {
  const narrative = await prisma.narrative.findUnique({
    where: { id: params.id },
    include: {
      evidence: true,
      investigationSteps: { orderBy: { stepIndex: "asc" } },
      ideas: true,
      report: true,
    },
  });

  if (!narrative) return notFound();

  const steps = narrative.investigationSteps.map((s: any) => ({
    id: s.id,
    stepIndex: s.stepIndex,
    tool: s.tool,
    inputJson: s.inputJson as Record<string, unknown>,
    outputSummary: s.outputSummary,
    linksJson: s.linksJson as string[],
    createdAt: new Date(s.createdAt).toISOString(),
  }));

  const evidenceData = narrative.evidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    url: e.url,
    snippet: e.snippet,
    metricsJson: e.metricsJson as Record<string, unknown>,
  }));

  const ideasData = narrative.ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    pitch: idea.pitch,
    targetUser: idea.targetUser,
    mvpScope: idea.mvpScope,
    whyNow: idea.whyNow,
    validation: idea.validation,
    saturationJson: idea.saturationJson as {
      level: string;
      score: number;
      neighbors: Array<{ name: string; similarity: number; url: string }>;
    },
    pivot: idea.pivot,
  }));

  return (
    <div className="space-y-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to report
      </Link>

      {/* Narrative header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {narrative.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {narrative.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ScoreChip
            label="Momentum"
            value={narrative.momentum}
            type="momentum"
          />
          <ScoreChip
            label="Novelty"
            value={narrative.novelty}
            type="novelty"
          />
          <ScoreChip
            label="Saturation"
            value={narrative.saturation}
            type="saturation"
          />
        </div>
      </div>

      {/* Investigation Trace */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Investigation Trace</h2>
        <InvestigationTrace steps={steps} />
      </section>

      {/* Evidence */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Evidence ({evidenceData.length})
        </h2>
        <EvidenceList evidence={evidenceData} />
      </section>

      {/* Build Ideas */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Build Ideas ({ideasData.length})
        </h2>
        <div className="space-y-4">
          {ideasData.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>
    </div>
  );
}
