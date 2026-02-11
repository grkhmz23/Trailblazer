"use client";

import { useState } from "react";
import { Download, Loader2, Target, Users, Clock, CheckCircle2 } from "lucide-react";
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

function safeUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://example.com");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return url;
    }
  } catch {
    // malformed URL — skip
  }
  return null;
}

export function IdeaCard({ idea }: { idea: IdeaProps }) {
  const [downloading, setDownloading] = useState(false);
  const sat = idea.saturationJson;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/action-pack.zip`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${idea.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-action-pack.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold">{idea.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{idea.pitch}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {downloading ? "Downloading..." : "Action Pack"}
        </button>
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
      {sat && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium">Market Saturation</span>
            <Badge className={saturationColor(sat.level)}>
              {sat.level?.toUpperCase()} ({((sat.score ?? 0) * 100).toFixed(0)}%)
            </Badge>
          </div>

          {sat.neighbors && sat.neighbors.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Nearest competitors:
              </span>
              {sat.neighbors.map((n: any, i: any) => {
                const href = safeUrl(n.url);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-foreground/70">{n.name}</span>
                    <span className="text-muted-foreground">
                      ({((n.similarity ?? 0) * 100).toFixed(0)}% similar)
                    </span>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                );
              })}
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
      )}
    </Card>
  );
}
