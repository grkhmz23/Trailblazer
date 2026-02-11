"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolIcon, formatDate } from "@/lib/utils";

interface Step {
  id: string;
  stepIndex: number;
  tool: string;
  inputJson: Record<string, unknown>;
  outputSummary: string;
  linksJson: string[];
  createdAt: string;
}

interface InvestigationTraceProps {
  steps: Step[];
}

const toolLabels: Record<string, string> = {
  repo_inspector: "Repository Inspector",
  idl_differ: "IDL Differ",
  dependency_tracker: "Dependency Tracker",
  social_pain_finder: "Social Pain Finder",
  competitor_search: "Competitor Search",
};

export function InvestigationTrace({ steps }: InvestigationTraceProps) {
  if (steps.length === 0) {
    return (
      <Card className="border-dashed">
        <p className="text-center text-sm text-muted-foreground">
          No investigation steps recorded for this narrative.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-0">
      {steps
        .sort((a: any, b: any) => a.stepIndex - b.stepIndex)
        .map((step, i) => (
          <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline connector */}
            {i < steps.length - 1 && <div className="timeline-connector" />}

            {/* Icon node */}
            <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-lg">
              {toolIcon(step.tool)}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {toolLabels[step.tool] ?? step.tool}
                </span>
                <Badge variant="secondary">Step {step.stepIndex + 1}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(step.createdAt)}
                </span>
              </div>

              {/* Input summary */}
              <div className="mb-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Input: </span>
                {Object.entries(
                  step.inputJson as Record<string, unknown>
                )
                  .map(
                    ([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`
                  )
                  .join(", ")}
              </div>

              {/* Output */}
              <p className="text-sm leading-relaxed text-foreground/80">
                {step.outputSummary}
              </p>

              {/* Evidence links */}
              {Array.isArray(step.linksJson) && step.linksJson.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(step.linksJson as string[]).map((link, j) => (
                    <a
                      key={j}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {new URL(link).hostname}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
