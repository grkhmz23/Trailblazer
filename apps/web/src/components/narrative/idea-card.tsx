"use client";

import { Download, Target, Users, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saturationColor } from "@/lib/utils";

interface IdeaProps {
  id: string;
  title: string;
  pitch: string;
  targetUser: string;
  mvpScope: string;
  whyNow: string;
  validation: string;
  saturationJson: {
    level: string;
    score: number;
    neighbors: Array<{ name: string; similarity: number; url: string }>;
  };
  pivot: string;
}

export function IdeaCard({ idea }: { idea: IdeaProps }) {
  const sat = idea.saturationJson;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold">{idea.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{idea.pitch}</p>
        </div>
        <a
          href={`/api/ideas/${idea.id}/action-pack.zip`}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Download className="h-3.5 w-3.5" />
          Action Pack
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 text-sm">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <span className="font-medium">Target User</span>
            <p className="text-muted-foreground">{idea.targetUser}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <span className="font-medium">MVP Scope</span>
            <p className="text-muted-foreground">{idea.mvpScope}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <span className="font-medium">Why Now</span>
            <p className="text-muted-foreground">{idea.whyNow}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <span className="font-medium">Validation</span>
            <p className="text-muted-foreground">{idea.validation}</p>
          </div>
        </div>
      </div>

      {/* Saturation / Blue Ocean */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium">Market Saturation</span>
          <Badge
            className={saturationColor(sat.level)}
          >
            {sat.level.toUpperCase()} ({(sat.score * 100).toFixed(0)}%)
          </Badge>
        </div>

        {sat.neighbors && sat.neighbors.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              Nearest competitors:
            </span>
            {sat.neighbors.map((n, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-foreground/70">{n.name}</span>
                <span className="text-muted-foreground">
                  ({(n.similarity * 100).toFixed(0)}% similar)
                </span>
                {n.url && (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {idea.pivot && (
          <div className="mt-2 border-t border-border pt-2">
            <span className="text-xs font-medium text-amber-400">
              Suggested Pivot:
            </span>
            <p className="text-xs text-muted-foreground">{idea.pivot}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
