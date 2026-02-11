"use client";

import Link from "next/link";
import { ArrowRight, FileText, Link2, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/lib/utils";

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
}: NarrativeCardProps) {
  return (
    <Link href={`/narratives/${id}`}>
      <Card
        className="group cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="truncate text-base font-semibold">{title}</h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {truncate(summary, 180)}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <ScoreChip label="Momentum" value={momentum} type="momentum" />
              <ScoreChip label="Novelty" value={novelty} type="novelty" />
              <ScoreChip
                label="Saturation"
                value={saturation}
                type="saturation"
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {evidenceCount}
              </span>
              <span className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {ideaCount}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
