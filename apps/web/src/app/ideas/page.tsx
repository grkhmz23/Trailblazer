import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Lightbulb, ArrowLeft } from "lucide-react";
import { LifecycleBar } from "@/components/ui/lifecycle-bar";
import { cn, saturationColor } from "@/lib/utils";
import { opportunityScore } from "@/lib/scores";
import Link from "next/link";
import { IdeasFilters } from "./filters";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const report = await prisma.report.findFirst({
    where: { status: "complete" },
    orderBy: { createdAt: "desc" },
    include: {
      narratives: {
        include: {
          ideas: true,
        },
      },
    },
  });

  if (!report) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No ideas yet. Run the pipeline first.</p>
        </div>
      </div>
    );
  }

  const ideas = report.narratives.flatMap((n: any) =>
    n.ideas.map((idea: any) => {
      const sat = (idea.saturationJson as any) ?? {};
      return {
        id: idea.id,
        title: idea.title,
        pitch: idea.pitch,
        targetUser: idea.targetUser,
        mvpScope: idea.mvpScope,
        whyNow: idea.whyNow,
        validation: idea.validation,
        pivot: idea.pivot,
        saturationLevel: sat.level ?? "unknown",
        saturationScore: sat.score ?? 0,
        narrativeTitle: n.title,
        narrativeId: n.id,
        narrativeMomentum: n.momentum,
        narrativeNovelty: n.novelty,
        narrativeSaturation: n.saturation,
        opportunity: opportunityScore(n.momentum, n.novelty, n.saturation),
      };
    })
  );

  // Sort by opportunity score desc
  ideas.sort((a: any, b: any) => b.opportunity - a.opportunity);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Build Ideas</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {ideas.length} actionable ideas from the latest report. Each includes a downloadable Action Pack.
        </p>
      </div>

      <IdeasFilters ideas={ideas} />
    </div>
  );
}
