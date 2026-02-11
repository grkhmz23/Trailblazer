import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, BarChart3, Clock, Zap, TrendingUp, Sparkles, Target, Activity } from "lucide-react";
import Link from "next/link";
import { HomeControls } from "@/components/dashboard/home-controls";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const report = await prisma.report.findFirst({
    where: { status: "complete" },
    orderBy: { createdAt: "desc" },
    include: {
      narratives: {
        include: {
          evidence: true,
          ideas: true,
        },
      },
    },
  });

  if (!report) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg text-center space-y-6">
          {/* Animated logo */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/20 ring-1 ring-primary/30">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">No Reports Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Run the pipeline to generate your first fortnightly narrative report for the Solana ecosystem.
            </p>
          </div>

          <Card className="text-left space-y-3 bg-card/40">
            <p className="text-xs text-muted-foreground font-medium">Quick start:</p>
            <code className="block rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5 text-xs font-mono text-foreground">
              pnpm seed:demo
            </code>
            <p className="text-[11px] text-muted-foreground text-center">or trigger via API:</p>
            <code className="block rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5 text-xs font-mono text-foreground">
              curl -X POST /api/admin/run-fortnight -H<br />
              &quot;Authorization: Bearer $ADMIN_TOKEN&quot;
            </code>
          </Card>
        </div>
      </div>
    );
  }

  // Compute aggregate stats
  const totalEvidence = report.narratives.reduce((sum: number, n: any) => sum + n.evidence.length, 0);
  const totalIdeas = report.narratives.reduce((sum: number, n: any) => sum + n.ideas.length, 0);
  const avgMomentum = report.narratives.length > 0
    ? report.narratives.reduce((sum: number, n: any) => sum + n.momentum, 0) / report.narratives.length
    : 0;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Latest Fortnight Report
          </h1>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Generated {formatDate(report.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {[
          { label: "Narratives", value: report.narratives.length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
          { label: "Evidence Points", value: totalEvidence, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Build Ideas", value: totalIdeas, icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Avg Momentum", value: `${(avgMomentum * 100).toFixed(0)}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-card/40">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold data-highlight ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Narratives grid with controls */}
      <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <HomeControls narratives={narratives} />
      </div>

      {/* Footer */}
      <div className="text-center pt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Link
          href="/reports"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all reports →
        </Link>
      </div>
    </div>
  );
}

