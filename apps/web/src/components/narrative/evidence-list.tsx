import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Activity, GitBranch, MessageCircle, Code, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  url: string;
  snippet: string;
  metricsJson: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: typeof Activity; label: string; color: string; badge: "success" | "info" | "warning" | "purple" | "secondary"; accent: string }> = {
  onchain: { icon: Activity, label: "Onchain", color: "text-emerald-400", badge: "success", accent: "accent-left-emerald" },
  dev: { icon: GitBranch, label: "Developer", color: "text-sky-400", badge: "info", accent: "accent-left-sky" },
  social: { icon: MessageCircle, label: "Social", color: "text-amber-400", badge: "warning", accent: "accent-left-amber" },
  idl_diff: { icon: Code, label: "IDL Diff", color: "text-violet-400", badge: "purple", accent: "accent-left-violet" },
  dependency: { icon: Package, label: "Dependency", color: "text-zinc-400", badge: "secondary", accent: "accent-left-zinc" },
};

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">No evidence collected yet.</p>
      </div>
    );
  }

  const grouped = evidence.reduce(
    (acc, item) => {
      (acc[item.type] ??= []).push(item);
      return acc;
    },
    {} as Record<string, EvidenceItem[]>
  );

  return (
    <div className="space-y-8 stagger">
      {Object.entries(grouped).map(([type, items]) => {
        const config = typeConfig[type] ?? { icon: Activity, label: type, color: "text-zinc-400", badge: "secondary" as const, accent: "accent-left-zinc" };
        const Icon = config.icon;

        return (
          <div key={type} className="animate-fade-up">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon className={cn("h-4 w-4", config.color)} />
              <h3 className="text-sm font-semibold">{config.label}</h3>
              <span className="text-[11px] text-muted-foreground/60">{items.length}</span>
            </div>
            <div className="grid gap-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "p-3.5 hover:border-border/50 transition-colors",
                    config.accent
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium">{item.title}</span>
                      {item.snippet && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/8 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
