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
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Latest Report
          </h1>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 opacity-60" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            Generated {formatDate(report.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Narratives", value: report.narratives.length, icon: BarChart3, color: "text-primary", glow: "card-glow-primary" },
          { label: "Evidence", value: totalEvidence, icon: Activity, color: "text-emerald-400", glow: "card-glow-emerald" },
          { label: "Build Ideas", value: totalIdeas, icon: Sparkles, color: "text-amber-400", glow: "card-glow-amber" },
          { label: "Avg Momentum", value: `${(avgMomentum * 100).toFixed(0)}%`, icon: TrendingUp, color: "text-cyan-400", glow: "card-glow-cyan" },
        ].map((stat) => (
          <Card key={stat.label} className={`p-4 bg-card/50 ${stat.glow}`}>
            <div className="flex items-center gap-3">
              <stat.icon className={`h-4 w-4 ${stat.color} opacity-60`} />
              <div>
                <div className={`text-xl font-bold data-highlight ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Narratives grid */}
      <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
        <HomeControls narratives={narratives} />
      </div>

      {/* Footer */}
      <div className="text-center pt-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <Link
          href="/reports"
          className="text-[13px] text-muted-foreground hover:text-primary transition-colors"
        >
          View all reports →
        </Link>
      </div>
    </div>
  );
}
