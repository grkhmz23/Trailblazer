import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        narratives: {
          include: {
            evidence: true,
            ideas: true,
            investigationSteps: { orderBy: { stepIndex: "asc" } },
          },
          orderBy: { momentum: "desc" },
        },
        _count: { select: { candidates: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
