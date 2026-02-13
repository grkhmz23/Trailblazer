import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { HomeControls } from "@/components/dashboard/home-controls";
import { DecisionStrip } from "@/components/dashboard/decision-strip";
import { IdeasPreview } from "@/components/dashboard/ideas-preview";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let report;
  try {
    report = await prisma.report.findFirst({
    where: { status: "complete" },
    orderBy: { createdAt: "desc" },
    include: {
      narratives: {
        include: {
          evidence: true,
          ideas: true,
        },
        orderBy: { momentum: "desc" },
      },
    },
  });
  } catch (err) {
    console.error("[Trailblazer] Failed to load report:", err);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Service Temporarily Unavailable</h2>
          <p className="text-sm text-muted-foreground">Unable to load dashboard data. Please try again shortly.</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-xl bg-primary/15 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">No Reports Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Run the pipeline to generate your first fortnightly narrative report.
            </p>
          </div>
          <Card className="text-left space-y-3 bg-card/40">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Quick start</p>
            <code className="block rounded-lg bg-black/20 border border-border/20 px-4 py-2.5 text-xs font-mono text-foreground">
              pnpm seed:demo
            </code>
          </Card>
        </div>
      </div>
    );
  }

  const topNarrative = report.narratives[0];

  const narratives = report.narratives.map((n: any) => ({
    id: n.id,
    title: n.title,
    summary: n.summary,
    momentum: n.momentum,
    novelty: n.novelty,
    saturation: n.saturation,
    evidenceCount: n.evidence.length,
    ideaCount: n.ideas.length,
  }));

  // Collect all ideas for preview
  const allIdeas = report.narratives.flatMap((n: any) =>
    n.ideas.map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      pitch: idea.pitch,
      targetUser: idea.targetUser,
      narrativeTitle: n.title,
      narrativeId: n.id,
      saturationLevel: ((idea.saturationJson as any)?.level) ?? "unknown",
    }))
  );

  return (
    <div className="space-y-8">
      {/* Meta header */}
      <div className="animate-fade-up">
        <p className="text-[13px] text-muted-foreground mb-1">
          AI-detected emerging narratives in the Solana ecosystem — updated fortnightly from onchain, developer, and social data.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Generated {formatDate(report.createdAt)}
          </span>
          <Badge variant="success">Live</Badge>
        </div>
      </div>

      {/* Decision Strip — top signal */}
      {topNarrative && (
        <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <DecisionStrip
            narrative={{
              id: topNarrative.id,
              title: topNarrative.title,
              summary: topNarrative.summary,
              momentum: topNarrative.momentum,
              novelty: topNarrative.novelty,
              saturation: topNarrative.saturation,
              ideaCount: topNarrative.ideas.length,
            }}
            firstIdeaId={topNarrative.ideas[0]?.id}
          />
        </div>
      )}

      {/* All Narratives */}
      {narratives.length > 1 && (
        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="section-divider mb-6" />
          <HomeControls narratives={narratives} />
        </div>
      )}

      {/* Build Ideas preview */}
      {allIdeas.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <div className="section-divider mb-6" />
          <IdeasPreview ideas={allIdeas} />
        </div>
      )}

      {/* Footer links */}
      <div className="flex items-center justify-center gap-6 pt-2 animate-fade-in" style={{ animationDelay: "240ms" }}>
        <Link
          href="/reports"
          className="text-[12px] text-muted-foreground hover:text-primary transition-colors"
        >
          All reports →
        </Link>
        <Link
          href="/methodology"
          className="text-[12px] text-muted-foreground hover:text-primary transition-colors"
        >
          How it works →
        </Link>
      </div>
    </div>
  );
}
