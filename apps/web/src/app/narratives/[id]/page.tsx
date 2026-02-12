import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvestigationTrace } from "@/components/narrative/investigation-trace";
import { EvidenceList } from "@/components/narrative/evidence-list";
import { IdeaCard } from "@/components/narrative/idea-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Lightbulb, Brain, Search as SearchIcon } from "lucide-react";
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

  const evidenceData = narrative.evidence.map((e: any) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    url: e.url,
    snippet: e.snippet,
    metricsJson: e.metricsJson as Record<string, unknown>,
  }));

  const ideasData = narrative.ideas.map((idea: any) => ({
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
    <div className="space-y-10 pb-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to report
      </Link>

      {/* Hero header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight mb-3 max-w-3xl">
          {narrative.title}
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-3xl">
          {narrative.summary}
        </p>

        {/* Score strip */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ScoreChip label="Momentum" value={narrative.momentum} type="momentum" />
          <ScoreChip label="Novelty" value={narrative.novelty} type="novelty" />
          <ScoreChip label="Saturation" value={narrative.saturation} type="saturation" />
          <div className="h-4 w-px bg-border/30 mx-1 hidden sm:block" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3 w-3 opacity-60" />
            {evidenceData.length} evidence
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3 opacity-60" />
            {ideasData.length} ideas
          </span>
        </div>
      </div>

      {/* Investigation Trace */}
      {steps.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="section-divider mb-8" />
          <div className="flex items-center gap-2.5 mb-5">
            <Brain className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-base font-semibold">Investigation Trace</h2>
              <p className="text-[11px] text-muted-foreground">AI agent reasoning steps</p>
            </div>
          </div>
          <InvestigationTrace steps={steps} />
        </section>
      )}

      {/* Evidence */}
      <section className="animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="section-divider mb-8" />
        <div className="flex items-center gap-2.5 mb-5">
          <SearchIcon className="h-4 w-4 text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold">Evidence</h2>
            <p className="text-[11px] text-muted-foreground">{evidenceData.length} signals across onchain, dev, and social</p>
          </div>
        </div>
        <EvidenceList evidence={evidenceData} />
      </section>

      {/* Build Ideas */}
      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="section-divider mb-8" />
        <div className="flex items-center gap-2.5 mb-5">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <div>
            <h2 className="text-base font-semibold">Build Ideas</h2>
            <p className="text-[11px] text-muted-foreground">{ideasData.length} actionable ideas with saturation analysis</p>
          </div>
        </div>
        <div className="space-y-3">
          {ideasData.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>
    </div>
  );
}
