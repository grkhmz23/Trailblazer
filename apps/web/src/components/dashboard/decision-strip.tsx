"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LifecycleBar } from "@/components/ui/lifecycle-bar";
import {
  opportunityScore,
  opportunityColor,
  getLifecycleStage,
  lifecycleColor,
  momentumLabel,
  saturationLabel,
} from "@/lib/scores";
import { cn } from "@/lib/utils";

interface DecisionStripProps {
  narrative: {
    id: string;
    title: string;
    summary: string;
    momentum: number;
    novelty: number;
    saturation: number;
    ideaCount: number;
  };
  firstIdeaId?: string;
}

export function DecisionStrip({ narrative, firstIdeaId }: DecisionStripProps) {
  const opp = opportunityScore(narrative.momentum, narrative.novelty, narrative.saturation);
  const oppColor = opportunityColor(opp);
  const stage = getLifecycleStage(narrative.momentum, narrative.saturation);
  const stageStyle = lifecycleColor(stage);
  const mLabel = momentumLabel(narrative.momentum);
  const sLabel = saturationLabel(narrative.saturation);

  return (
    <Card className="relative overflow-hidden border-primary/15 bg-card/70 p-0">
      {/* Subtle gradient accent on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-emerald-500 to-transparent" />

      <div className="p-5 sm:p-6">
        {/* Top label */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Top Signal
          </span>
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5", stageStyle)}>
            {stage}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          {/* Left: narrative info */}
          <div className="flex-1 min-w-0">
            <Link href={`/narratives/${narrative.id}`} className="group">
              <h2 className="text-lg font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
                {narrative.title}
              </h2>
            </Link>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {narrative.summary}
            </p>

            {/* Signal tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={cn("text-[11px] font-medium", mLabel.color)}>
                {mLabel.text}
              </span>
              <span className="text-border">·</span>
              <span className={cn("text-[11px] font-medium", sLabel.color)}>
                {sLabel.text}
              </span>
              <span className="text-border">·</span>
              <span className="text-[11px] text-muted-foreground">
                {narrative.ideaCount} build ideas
              </span>
            </div>

            {/* Lifecycle */}
            <div className="mt-3">
              <LifecycleBar stage={stage} size="sm" />
            </div>
          </div>

          {/* Right: opportunity score + CTAs */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-3 shrink-0">
            <div className="text-center lg:text-right">
              <div className={cn("text-3xl font-bold data-highlight", oppColor)}>
                {opp}
              </div>
              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                Opportunity
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/narratives/${narrative.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110 transition-all"
              >
                View Ideas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {firstIdeaId && (
                <a
                  href={`/api/ideas/${firstIdeaId}/action-pack.zip`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:border-border/50 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Action Pack
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
