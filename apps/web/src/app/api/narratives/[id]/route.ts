import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const narrative = await prisma.narrative.findUnique({
      where: { id: params.id },
      include: {
        evidence: true,
        investigationSteps: { orderBy: { stepIndex: "asc" } },
        ideas: true,
        report: true,
      },
    });

    if (!narrative) {
      return NextResponse.json(
        { error: "Narrative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(narrative);
  } catch (error) {
    console.error("Failed to fetch narrative:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
