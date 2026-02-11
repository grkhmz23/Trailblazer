import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, ArrowRight, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { narratives: true, candidates: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">All Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fortnightly narrative detection reports for the Solana ecosystem.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12 bg-card/40">
          <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reports generated yet.</p>
        </Card>
      ) : (
        <div className="space-y-3 stagger">
          {reports.map((report: any) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="group flex items-center justify-between transition-all hover:border-primary/30 bg-card/40 animate-fade-up">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {formatDateRange(report.periodStart, report.periodEnd)}
                      </span>
                      <Badge
                        variant={report.status === "complete" ? "success" : "warning"}
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {report._count.narratives} narratives
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {report._count.candidates} candidates
                      </span>
                      <span>Generated {formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

