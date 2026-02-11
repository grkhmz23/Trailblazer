import { prisma } from "@/lib/prisma";
import { NarrativeCard } from "@/components/narrative/narrative-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";
import { Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";

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
        orderBy: { momentum: "desc" },
      },
    },
  });

  if (!report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <h2 className="text-xl font-bold">No Reports Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Run the worker pipeline to generate your first fortnightly report.
          </p>
          <code className="mt-4 block rounded-lg bg-muted px-4 py-2 text-xs">
            pnpm worker:run
          </code>
        </Card>
      </div>
    );
  }

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
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {report.narratives.length} narratives detected
          </span>
        </div>
      </div>

      {/* Narrative cards */}
      <div className="space-y-4">
        {report.narratives.map((narrative, index) => (
          <NarrativeCard
            key={narrative.id}
            id={narrative.id}
            title={narrative.title}
            summary={narrative.summary}
            momentum={narrative.momentum}
            novelty={narrative.novelty}
            saturation={narrative.saturation}
            evidenceCount={narrative.evidence.length}
            ideaCount={narrative.ideas.length}
            index={index}
          />
        ))}
      </div>

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
