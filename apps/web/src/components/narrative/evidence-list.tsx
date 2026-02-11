"use client";

import { ExternalLink, GitBranch, Activity, MessageSquare, Code2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Evidence {
  id: string;
  type: string;
  title: string;
  url: string;
  snippet: string;
  metricsJson: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: React.ElementType; variant: "default" | "success" | "warning" | "danger" }> = {
  onchain: { icon: Activity, variant: "success" },
  dev: { icon: GitBranch, variant: "default" },
  social: { icon: MessageSquare, variant: "warning" },
  idl_diff: { icon: Code2, variant: "danger" },
  dependency: { icon: Package, variant: "default" },
};

function safeUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://example.com");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return url.startsWith("http") ? url : null;
    }
  } catch {
    // malformed
  }
  return null;
}

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  if (evidence.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No evidence recorded.</p>
    );
  }

  return (
    <div className="space-y-3">
      {evidence.map((ev) => {
        const config = typeConfig[ev.type] ?? { icon: Activity, variant: "default" as const };
        const Icon = config.icon;
        const href = safeUrl(ev.url);

        return (
          <div
            key={ev.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{ev.title}</span>
                <Badge variant={config.variant}>{ev.type}</Badge>
              </div>
              {ev.snippet && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {ev.snippet}
                </p>
              )}
            </div>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
