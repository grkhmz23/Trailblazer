import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 80;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("q");
    const q = raw?.trim().slice(0, MAX_QUERY_LENGTH);

    if (!q || q.length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required (max 80 chars)" },
        { status: 400 }
      );
    }

    // Escape LIKE wildcards
    const safeQ = q.replace(/%/g, "").replace(/_/g, "");

    const [entities, narratives] = await Promise.all([
      prisma.entity.findMany({
        where: {
          OR: [
            { label: { contains: safeQ, mode: "insensitive" } },
            { key: { contains: safeQ, mode: "insensitive" } },
            { kind: { contains: safeQ, mode: "insensitive" } },
          ],
        },
        take: 20,
        select: { id: true, kind: true, key: true, label: true },
      }),
      prisma.narrative.findMany({
        where: {
          OR: [
            { title: { contains: safeQ, mode: "insensitive" } },
            { summary: { contains: safeQ, mode: "insensitive" } },
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
