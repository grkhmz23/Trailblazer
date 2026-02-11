import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const [entities, narratives] = await Promise.all([
      prisma.entity.findMany({
        where: {
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { key: { contains: q, mode: "insensitive" } },
            { kind: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 20,
        select: { id: true, kind: true, key: true, label: true },
      }),
      prisma.narrative.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { momentum: "desc" },
        select: { id: true, title: true, summary: true, momentum: true },
      }),
    ]);

    return NextResponse.json({ entities, narratives });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
