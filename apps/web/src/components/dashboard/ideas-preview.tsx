"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Lightbulb } from "lucide-react";
import { cn, saturationColor } from "@/lib/utils";

interface IdeaPreview {
  id: string;
  title: string;
  pitch: string;
  targetUser: string;
  narrativeTitle: string;
  narrativeId: string;
  saturationLevel: string;
}

export function IdeasPreview({ ideas }: { ideas: IdeaPreview[] }) {
  if (ideas.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h2 className="text-base font-semibold">Build Ideas</h2>
          <span className="text-[11px] text-muted-foreground">{ideas.length}</span>
        </div>
        <Link
          href="/ideas"
          className="text-[12px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ideas.slice(0, 6).map((idea) => (
          <Card
            key={idea.id}
            className="p-4 bg-card/50 hover:border-primary/20 hover-lift transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-[13px] font-semibold leading-snug line-clamp-2">
                {idea.title}
              </h3>
              <Badge className={cn("shrink-0", saturationColor(idea.saturationLevel))}>
                {idea.saturationLevel}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {idea.pitch}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/60 truncate max-w-[60%]">
                {idea.targetUser}
              </span>
              <a
                href={`/api/ideas/${idea.id}/action-pack.zip`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
              >
                <Download className="h-3 w-3" />
                Pack
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
