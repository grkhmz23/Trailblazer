import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvestigationTrace } from "@/components/narrative/investigation-trace";
import { EvidenceHighlights } from "@/components/narrative/evidence-highlights";
import { IdeaCard } from "@/components/narrative/idea-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { LifecycleBar } from "@/components/ui/lifecycle-bar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Lightbulb, Brain, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { getLifecycleStage, opportunityScore, opportunityColor, lifecycleColor } from "@/lib/scores";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function NarrativeDetailPage({ params }: Props) {
  let narrative;
  try {
    narrative = await prisma.narrative.findUnique({
    where: { id: params.id },
    include: {
      evidence: true,
      investigationSteps: { orderBy: { stepIndex: "asc" } },
      ideas: true,
      report: true,
    },
  });

  } catch (err) {
    console.error("[Trailblazer] Failed to load narrative:", err);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Failed to Load</h2>
          <p className="text-sm text-muted-foreground">Please try again shortly.</p>
        </div>
      </div>
    );
  }

  if (!narrative) return notFound();

  const stage = getLifecycleStage(narrative.momentum, narrative.saturation);
  const stageStyle = lifecycleColor(stage);
  const opp = opportunityScore(narrative.momentum, narrative.novelty, narrative.saturation);
  const oppColor = opportunityColor(opp);

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
        Dashboard
      </Link>

      {/* Hero header */}
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5 ${stageStyle}`}>
            {stage}
          </span>
          <span className={`text-lg font-bold data-highlight ${oppColor}`} title="Opportunity Score">
            {opp}
          </span>
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">opportunity</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3 max-w-3xl">
          {narrative.title}
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-3xl">
          {narrative.summary}
        </p>

        {/* Score strip — human labels */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ScoreChip label="Momentum" value={narrative.momentum} type="momentum" showHuman />
          <ScoreChip label="Novelty" value={narrative.novelty} type="novelty" showHuman />
          <ScoreChip label="Saturation" value={narrative.saturation} type="saturation" showHuman />
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

        {/* Lifecycle bar */}
        <div className="mt-4">
          <LifecycleBar stage={stage} />
        </div>
      </div>

      {/* Build Ideas — FIRST (most actionable) */}
      {ideasData.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "80ms" }}>
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
      )}

      {/* Evidence — highlights first */}
      <section className="animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="section-divider mb-8" />
        <div className="flex items-center gap-2.5 mb-5">
          <SearchIcon className="h-4 w-4 text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold">Key Evidence</h2>
            <p className="text-[11px] text-muted-foreground">{evidenceData.length} signals across onchain, dev, and social</p>
          </div>
        </div>
        <EvidenceHighlights evidence={evidenceData} />
      </section>

      {/* Investigation Trace — collapsed by default for judges who want depth */}
      {steps.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
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
    </div>
  );
}
