import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { ArrowUpRight, FileText, Lightbulb } from "lucide-react";
import { cn, truncate } from "@/lib/utils";

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
  const isHero = index === 0 && totalCount > 2;
  const span = getBentoSpan(index, totalCount);

  return (
    <Link href={`/narratives/${id}`} className={cn(span, "animate-fade-up")}>
      <Card
        glow
        className={cn(
          "group relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover-lift",
          "hover:border-primary/20",
          isHero ? "p-6 lg:p-7" : "p-5"
        )}
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md font-mono font-bold text-primary bg-primary/8",
                isHero ? "h-8 w-8 text-sm" : "h-6 w-6 text-[11px]"
              )}
            >
              {index + 1}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 opacity-60" />
                {evidenceCount}
              </span>
              <span className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3 opacity-60" />
                {ideaCount}
              </span>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-semibold tracking-tight leading-snug transition-colors group-hover:text-primary",
            isHero ? "text-lg mb-2" : "text-sm mb-1.5"
          )}
        >
          {title}
        </h3>

        {/* Summary */}
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            isHero ? "text-[13px] mb-5 line-clamp-3" : "text-xs mb-4 line-clamp-2"
          )}
        >
          {truncate(summary, isHero ? 280 : 150)}
        </p>

        {/* Scores */}
        <div className={cn("flex flex-wrap gap-2", isHero ? "gap-2.5" : "gap-1.5")}>
          <ScoreChip label="Momentum" value={momentum} type="momentum" size={isHero ? "md" : "sm"} />
          <ScoreChip label="Novelty" value={novelty} type="novelty" size={isHero ? "md" : "sm"} />
          <ScoreChip label="Saturation" value={saturation} type="saturation" size={isHero ? "md" : "sm"} />
        </div>

        {/* Hero decorative element */}
        {isHero && (
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/3 blur-3xl pointer-events-none" />
        )}
      </Card>
    </Link>
  );
}
