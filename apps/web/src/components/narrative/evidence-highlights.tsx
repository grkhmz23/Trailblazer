"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, Activity, GitBranch, MessageCircle, Code, Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  url: string;
  snippet: string;
  metricsJson: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: typeof Activity; color: string; accent: string }> = {
  onchain: { icon: Activity, color: "text-emerald-400", accent: "accent-left-emerald" },
  dev: { icon: GitBranch, color: "text-sky-400", accent: "accent-left-sky" },
  social: { icon: MessageCircle, color: "text-amber-400", accent: "accent-left-amber" },
  idl_diff: { icon: Code, color: "text-violet-400", accent: "accent-left-violet" },
  dependency: { icon: Package, color: "text-zinc-400", accent: "accent-left-zinc" },
};

/**
 * Pick the top N most relevant evidence items.
 * Prioritize: onchain > dev > social, prefer items with snippets.
 */
function pickHighlights(evidence: EvidenceItem[], count: number): EvidenceItem[] {
  const priority: Record<string, number> = { onchain: 3, dev: 2, social: 1, idl_diff: 2, dependency: 1 };
  const sorted = [...evidence].sort((a, b) => {
    const pa = priority[a.type] ?? 0;
    const pb = priority[b.type] ?? 0;
    if (pa !== pb) return pb - pa;
    // prefer items with snippets
    if (a.snippet && !b.snippet) return -1;
    if (!a.snippet && b.snippet) return 1;
    return 0;
  });
  return sorted.slice(0, count);
}

export function EvidenceHighlights({ evidence }: { evidence: EvidenceItem[] }) {
  const [expanded, setExpanded] = useState(false);

  if (evidence.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">No evidence collected yet.</p>
      </div>
    );
  }

  const highlights = pickHighlights(evidence, 5);
  const remaining = evidence.filter((e) => !highlights.find((h) => h.id === e.id));
  const hasMore = remaining.length > 0;

  return (
    <div className="space-y-3">
      {/* Why this matters - highlights */}
      <div className="space-y-2">
        {highlights.map((item) => {
          const config = typeConfig[item.type] ?? { icon: Activity, color: "text-zinc-400", accent: "accent-left-zinc" };
          const Icon = config.icon;

          return (
            <Card
              key={item.id}
              className={cn("p-3 flex items-start gap-3", config.accent)}
            >
              <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.color)} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium">{item.title}</span>
                {item.snippet && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                    {item.snippet}
                  </p>
                )}
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {/* Expand/collapse rest */}
      {hasMore && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180"
              )}
            />
            {expanded ? "Collapse" : `Show all evidence (${evidence.length})`}
          </button>

          {expanded && (
            <div className="space-y-2 mt-3 animate-fade-in">
              {remaining.map((item) => {
                const config = typeConfig[item.type] ?? { icon: Activity, color: "text-zinc-400", accent: "accent-left-zinc" };
                const Icon = config.icon;

                return (
                  <Card
                    key={item.id}
                    className={cn("p-3 flex items-start gap-3", config.accent)}
                  >
                    <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.color)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium">{item.title}</span>
                      {item.snippet && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
