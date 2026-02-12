import { Card } from "@/components/ui/card";
import { ExternalLink, Search, Code, Package, MessageCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  stepIndex: number;
  tool: string;
  inputJson: Record<string, unknown>;
  outputSummary: string;
  linksJson: string[];
  createdAt: string;
}

const toolConfig: Record<string, { icon: typeof Search; label: string; color: string; bg: string }> = {
  repo_inspector: { icon: Search, label: "Repo Inspector", color: "text-sky-400", bg: "bg-sky-500/10" },
  idl_differ: { icon: Code, label: "IDL Differ", color: "text-violet-400", bg: "bg-violet-500/10" },
  dependency_tracker: { icon: Package, label: "Dependency Tracker", color: "text-amber-400", bg: "bg-amber-500/10" },
  social_pain_finder: { icon: MessageCircle, label: "Social Pain Finder", color: "text-orange-400", bg: "bg-orange-500/10" },
  competitor_search: { icon: Target, label: "Competitor Search", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export function InvestigationTrace({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">No investigation steps recorded.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0 stagger">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-6 bottom-6 w-px bg-gradient-to-b from-border/50 via-border/30 to-transparent" />

      {steps.map((step, i) => {
        const config = toolConfig[step.tool] ?? { icon: Search, label: step.tool, color: "text-zinc-400", bg: "bg-zinc-500/10" };
        const Icon = config.icon;

        return (
          <div key={step.id} className="relative flex gap-4 pb-5 animate-fade-up">
            {/* Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-2 ring-background",
                  config.bg
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
            </div>

            {/* Content */}
            <Card className="flex-1 p-4 hover:border-border/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] text-muted-foreground/60 bg-white/[0.03] px-1.5 py-0.5 rounded">
                  {step.stepIndex + 1}
                </span>
                <span className="text-[13px] font-semibold">{config.label}</span>
              </div>

              {step.outputSummary && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {step.outputSummary}
                </p>
              )}

              {step.linksJson && step.linksJson.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(step.linksJson as string[]).map((link, li) => (
                    <a
                      key={li}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source {li + 1}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
