"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  ChevronDown,
  Download,
  Users,
  Rocket,
  Clock,
  Shield,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { cn, saturationColor } from "@/lib/utils";

interface IdeaData {
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

export function IdeaCard({ idea }: { idea: IdeaData }) {
  const [expanded, setExpanded] = useState(false);
  const sat = idea.saturationJson;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      expanded && "ring-1 ring-primary/20 shadow-lg shadow-primary/5"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{idea.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{idea.pitch}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={saturationColor(sat.level)}>
            {sat.level}
          </Badge>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )} />
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="mt-5 space-y-5 border-t border-border/30 pt-5 animate-fade-in">
          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Users, label: "Target User", value: idea.targetUser },
              { icon: Rocket, label: "MVP Scope", value: idea.mvpScope },
              { icon: Clock, label: "Why Now", value: idea.whyNow },
              { icon: Shield, label: "Validation", value: idea.validation },
            ].map((field) => (
              <div key={field.label} className="rounded-lg bg-muted/20 border border-border/20 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
                  <field.icon className="h-3 w-3" />
                  {field.label}
                </div>
                <p className="text-sm leading-relaxed">{field.value}</p>
              </div>
            ))}
          </div>

          {/* Similar projects */}
          {sat.neighbors && sat.neighbors.length > 0 && (
            <div>
              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Similar Projects
              </h5>
              <div className="flex flex-wrap gap-2">
                {sat.neighbors.map((n: { name: string; similarity: number; url: string }) => (
                  <a
                    key={n.name}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5 text-xs hover:border-primary/30 transition-colors"
                  >
                    <span>{n.name}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">
                      {(n.similarity * 100).toFixed(0)}%
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/50 group-hover/link:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pivot advice */}
          {idea.pivot && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-1.5">
                <Zap className="h-3 w-3" />
                Differentiation Advice
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{idea.pivot}</p>
            </div>
          )}

          {/* Action pack CTA */}
          <a
            href={`/api/ideas/${idea.id}/action-pack.zip`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all"
          >
            <Download className="h-4 w-4" />
            Download Action Pack
          </a>
        </div>
      )}
    </Card>
  );
}

