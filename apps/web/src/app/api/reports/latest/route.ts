import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await prisma.report.findFirst({
      where: { status: "complete" },
      orderBy: { createdAt: "desc" },
      include: {
        narratives: {
          include: {
            evidence: true,
            ideas: true,
            _count: { select: { investigationSteps: true } },
          },
          orderBy: { momentum: "desc" },
        },
        _count: { select: { candidates: true } },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "No completed reports found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to fetch latest report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
