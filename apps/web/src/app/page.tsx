import { prisma } from "@/lib/prisma";
import { NarrativeCard } from "@/components/narrative/narrative-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, BarChart3, Clock, Zap } from "lucide-react";
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No Reports Yet</h2>
          <p className="text-sm text-muted-foreground">
            Run the pipeline to generate your first fortnightly narrative report.
          </p>
          <div className="space-y-2 text-left">
            <code className="block rounded-lg bg-muted px-4 py-2 text-xs">
              pnpm seed:demo
            </code>
            <p className="text-xs text-muted-foreground text-center">
              or trigger via API:
            </p>
            <code className="block rounded-lg bg-muted px-4 py-2 text-xs">
              curl -X POST /api/admin/run-fortnight -H
              &quot;Authorization: Bearer $ADMIN_TOKEN&quot;
            </code>
          </div>
        </Card>
      </div>
    );
  }

  // Serialize for client component
  const narratives = report.narratives.map((n) => ({
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
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Latest Fortnight Report
          </h1>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {report.narratives.length} narratives detected
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Generated {formatDate(report.createdAt)}
          </span>
        </div>
      </div>

      {/* Client-side sorting + search controls + narrative cards */}
      <HomeControls narratives={narratives} />

      {/* Footer link */}
      <div className="text-center">
        <Link
          href="/reports"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          View all reports →
        </Link>
      </div>
    </div>
  );
}
