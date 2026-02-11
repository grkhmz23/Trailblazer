import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NarrativeCard } from "@/components/narrative/narrative-card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";
import { Calendar, BarChart3, Users } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ReportDetailPage({ params }: Props) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      narratives: {
        include: {
          evidence: true,
          ideas: true,
        },
        orderBy: { momentum: "desc" },
      },
      _count: { select: { candidates: true } },
    },
  });

  if (!report) return notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Fortnight Report
          </h1>
          <Badge
            variant={report.status === "complete" ? "success" : "warning"}
          >
            {report.status}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {report.narratives.length} narratives
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {report._count.candidates} candidates evaluated
          </span>
        </div>
      </div>

      {/* Narratives */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Detected Narratives</h2>
        {report.narratives.map((narrative: any, index: any) => (
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
    </div>
  );
}
