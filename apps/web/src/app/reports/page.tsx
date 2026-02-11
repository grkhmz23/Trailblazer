import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "lucide-react";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fortnightly narrative detection reports for the Solana ecosystem.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center">
          <p className="text-muted-foreground">No reports generated yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="group flex items-center justify-between transition-all hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDateRange(report.periodStart, report.periodEnd)}
                      </span>
                      <Badge
                        variant={
                          report.status === "complete" ? "success" : "warning"
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {report._count.narratives} narratives ·{" "}
                      {report._count.candidates} candidates · Generated{" "}
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
