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
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        expanded && "ring-1 ring-primary/15"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/8">
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{idea.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {idea.pitch}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={saturationColor(sat.level)}>{sat.level}</Badge>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-5 space-y-5 border-t border-border/20 pt-5 animate-fade-in">
          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: Users, label: "Target User", value: idea.targetUser },
              { icon: Rocket, label: "MVP Scope", value: idea.mvpScope },
              { icon: Clock, label: "Why Now", value: idea.whyNow },
              { icon: Shield, label: "Validation", value: idea.validation },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-lg bg-white/[0.02] border border-border/15 p-3"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                  <field.icon className="h-3 w-3" />
                  {field.label}
                </div>
                <p className="text-[13px] leading-relaxed">{field.value}</p>
              </div>
            ))}
          </div>

          {/* Similar projects */}
          {sat.neighbors && sat.neighbors.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
                Similar Projects
              </h5>
              <div className="flex flex-wrap gap-2">
                {sat.neighbors.map((n: { name: string; similarity: number; url: string }) => (
                  <a
                    key={n.name}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 rounded-md border border-border/30 bg-white/[0.02] px-2.5 py-1.5 text-xs hover:border-primary/20 transition-colors"
                  >
                    <span>{n.name}</span>
                    <span className="font-mono text-muted-foreground/60 text-[10px]">
                      {(n.similarity * 100).toFixed(0)}%
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 group-hover/link:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pivot advice */}
          {idea.pivot && (
            <div className="rounded-lg bg-primary/4 border border-primary/10 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5">
                <Zap className="h-3 w-3" />
                Differentiation Advice
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{idea.pivot}</p>
            </div>
          )}

          {/* Action pack CTA */}
          <a
            href={`/api/ideas/${idea.id}/action-pack.zip`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download Action Pack
          </a>
        </div>
      )}
    </Card>
  );
}
