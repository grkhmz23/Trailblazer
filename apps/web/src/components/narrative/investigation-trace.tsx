import { Card } from "@/components/ui/card";
import { toolIcon } from "@/lib/utils";
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

const toolConfig: Record<string, { icon: typeof Search; label: string; color: string }> = {
  repo_inspector: { icon: Search, label: "Repo Inspector", color: "text-sky-400 bg-sky-500/10" },
  idl_differ: { icon: Code, label: "IDL Differ", color: "text-violet-400 bg-violet-500/10" },
  dependency_tracker: { icon: Package, label: "Dependency Tracker", color: "text-amber-400 bg-amber-500/10" },
  social_pain_finder: { icon: MessageCircle, label: "Social Pain Finder", color: "text-orange-400 bg-orange-500/10" },
  competitor_search: { icon: Target, label: "Competitor Search", color: "text-emerald-400 bg-emerald-500/10" },
};

export function InvestigationTrace({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">No investigation steps recorded.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0 stagger">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      {steps.map((step, i) => {
        const config = toolConfig[step.tool] ?? { icon: Search, label: step.tool, color: "text-zinc-400 bg-zinc-500/10" };
        const Icon = config.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4 pb-6 animate-fade-up">
            {/* Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-2 ring-background",
                config.color
              )}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Content */}
            <Card className="flex-1 p-4 hover:border-border/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    Step {step.stepIndex + 1}
                  </span>
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
              </div>

              {/* Output */}
              {step.outputSummary && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {step.outputSummary}
                </p>
              )}

              {/* Links */}
              {step.linksJson && step.linksJson.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(step.linksJson as string[]).map((link, li) => (
                    <a
                      key={li}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
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

