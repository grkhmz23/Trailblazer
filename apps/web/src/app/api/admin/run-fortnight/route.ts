import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for pipeline execution

// Simple in-memory rate limit (per instance)
let lastRunTimestamp = 0;
const MIN_INTERVAL_MS = 60_000; // 1 min between runs

export async function POST(req: Request) {
  try {
    // ── Auth ──
    const adminToken = config.adminToken;
    if (!adminToken || adminToken === "change-me-in-production") {
      return NextResponse.json(
        { error: "ADMIN_TOKEN not configured or still default" },
        { status: 403 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const providedToken =
      authHeader?.replace("Bearer ", "") ??
      req.headers.get("x-admin-token") ??
      "";

    if (providedToken !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limit ──
    const now = Date.now();
    if (now - lastRunTimestamp < MIN_INTERVAL_MS) {
      return NextResponse.json(
        {
          error: "Rate limited",
          retryAfterMs: MIN_INTERVAL_MS - (now - lastRunTimestamp),
        },
        { status: 429 }
      );
    }
    lastRunTimestamp = now;

    // ── Parse optional params ──
    let periodStart: Date | undefined;
    let periodEnd: Date | undefined;

    try {
      const body = await req.json();
      if (body.periodStart) periodStart = new Date(body.periodStart);
      if (body.periodEnd) periodEnd = new Date(body.periodEnd);
    } catch {
      // No body or invalid JSON — use defaults
    }

    // ── Run pipeline in-process (Node.js lite worker) ──
    const { runPipeline } = await import("@/lib/pipeline");
    const result = await runPipeline(periodStart, periodEnd);

    return NextResponse.json({
      status: "complete",
      reportId: result.reportId,
      narratives: result.narrativeCount,
      candidates: result.candidateCount,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("Pipeline failed:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Pipeline failed", detail: message },
      { status: 500 }
    );
  }
}
