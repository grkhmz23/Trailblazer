import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { ArrowUpRight, FileText, Lightbulb } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import {
  opportunityScore,
  opportunityColor,
  getLifecycleStage,
  lifecycleColor,
} from "@/lib/scores";

interface NarrativeCardProps {
  id: string;
  title: string;
  summary: string;
  momentum: number;
  novelty: number;
  saturation: number;
  evidenceCount: number;
  ideaCount: number;
  index: number;
  totalCount?: number;
}

function getBentoSpan(index: number, total: number): string {
  if (total <= 2) return "col-span-12 lg:col-span-6";
  if (index === 0) return "col-span-12 lg:col-span-8";
  if (index === 1) return "col-span-12 lg:col-span-4";
  if (index === 2) return "col-span-12 sm:col-span-6 lg:col-span-5";
  if (index === 3) return "col-span-12 sm:col-span-6 lg:col-span-7";
  if (index % 3 === 0) return "col-span-12 sm:col-span-6 lg:col-span-4";
  if (index % 3 === 1) return "col-span-12 sm:col-span-6 lg:col-span-4";
  return "col-span-12 sm:col-span-6 lg:col-span-4";
}

export function NarrativeCard({
  id,
  title,
  summary,
  momentum,
  novelty,
  saturation,
  evidenceCount,
  ideaCount,
  index,
  totalCount = 10,
}: NarrativeCardProps) {
  const span = getBentoSpan(index, totalCount);
  const opp = opportunityScore(momentum, novelty, saturation);
  const oppColor = opportunityColor(opp);
  const stage = getLifecycleStage(momentum, saturation);
  const stageStyle = lifecycleColor(stage);

  return (
    <Link href={`/narratives/${id}`} className={cn(span, "animate-fade-up")}>
      <Card
        glow
        className="group relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover-lift hover:border-primary/20 p-5"
      >
        {/* Top row: opportunity + stage + metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold data-highlight", oppColor)}>
              {opp}
            </span>
            <span className={cn("text-[9px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5", stageStyle)}>
              {stage}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 opacity-60" />
              {evidenceCount}
            </span>
            <span className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3 opacity-60" />
              {ideaCount}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold tracking-tight leading-snug transition-colors group-hover:text-primary mb-1.5">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {truncate(summary, 180)}
        </p>

        {/* Score chips — human labels */}
        <div className="flex flex-wrap gap-1.5">
          <ScoreChip label="Momentum" value={momentum} type="momentum" size="sm" showHuman />
          <ScoreChip label="Novelty" value={novelty} type="novelty" size="sm" showHuman />
          <ScoreChip label="Saturation" value={saturation} type="saturation" size="sm" showHuman />
        </div>
      </Card>
    </Link>
  );
}
