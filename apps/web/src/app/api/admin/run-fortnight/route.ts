import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin endpoint — no longer runs the pipeline directly (too heavy for Vercel).
 * Instead: reports latest pipeline status + provides manual trigger info.
 *
 * The pipeline runs via GitHub Actions on the 1st and 15th of each month,
 * or can be triggered manually via GitHub Actions workflow_dispatch.
 *
 * POST /api/admin/run-fortnight — returns latest report status
 * GET  /api/admin/run-fortnight — same, for convenience
 */

async function handleRequest(req: Request) {
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

  // ── Get latest report status ──
  const latestReport = await prisma.report.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          narratives: true,
          candidates: true,
        },
      },
    },
  });

  if (!latestReport) {
    return NextResponse.json({
      status: "no_reports",
      message: "No pipeline runs found. Trigger via GitHub Actions.",
      triggerUrl: "https://github.com/grkhmz23/Trailblazer/actions/workflows/pipeline.yml",
    });
  }

  return NextResponse.json({
    status: latestReport.status,
    reportId: latestReport.id,
    periodStart: latestReport.periodStart,
    periodEnd: latestReport.periodEnd,
    narratives: latestReport._count.narratives,
    candidates: latestReport._count.candidates,
    createdAt: latestReport.createdAt,
    message: "Pipeline runs via GitHub Actions (1st & 15th of each month).",
    triggerUrl: "https://github.com/grkhmz23/Trailblazer/actions/workflows/pipeline.yml",
  });
}

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function GET(req: Request) {
  return handleRequest(req);
}
