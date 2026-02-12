#!/bin/bash
set -e

echo "═══════════════════════════════════════════════════"
echo "  Deploying Pipeline Worker (GitHub Actions)"
echo "═══════════════════════════════════════════════════"

cd /workspaces/Trailblazer

# ─── 1. Install tsconfig-paths for @ alias resolution ───────
echo "[1/5] Installing tsconfig-paths..."
pnpm --filter web add -D tsconfig-paths tsx

# ─── 2. Create standalone pipeline runner script ────────────
echo "[2/5] Creating pipeline runner script..."
mkdir -p apps/web/src/scripts

cat > apps/web/src/scripts/run-pipeline.ts << 'SCRIPTEOF'
/**
 * Standalone pipeline runner — executes outside of Next.js/Vercel.
 * Used by GitHub Actions cron and manual dispatch.
 *
 * Connects to the same Neon DB as the Vercel frontend,
 * so results appear on the dashboard immediately.
 *
 * Usage:
 *   pnpm --filter web pipeline:run
 *   pnpm --filter web pipeline:run --start 2026-01-29 --end 2026-02-12
 */

import { runPipeline } from "@/lib/pipeline";

async function main() {
  const args = process.argv.slice(2);
  let periodStart: Date | undefined;
  let periodEnd: Date | undefined;

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--start" && args[i + 1]) {
      periodStart = new Date(args[i + 1]);
      i++;
    } else if (args[i] === "--end" && args[i + 1]) {
      periodEnd = new Date(args[i + 1]);
      i++;
    }
  }

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Solana Narrative Hunter — Pipeline Runner   ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log();

  if (periodStart) console.log(`  Period start: ${periodStart.toISOString()}`);
  if (periodEnd) console.log(`  Period end:   ${periodEnd.toISOString()}`);
  if (!periodStart && !periodEnd) console.log("  Period: last 14 days (default)");
  console.log();

  try {
    const result = await runPipeline(periodStart, periodEnd);

    console.log();
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║  Pipeline Complete                           ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Report ID:   ${result.reportId.slice(0, 30).padEnd(30)} ║`);
    console.log(`║  Narratives:  ${String(result.narrativeCount).padEnd(30)} ║`);
    console.log(`║  Candidates:  ${String(result.candidateCount).padEnd(30)} ║`);
    console.log(`║  Duration:    ${(result.durationMs / 1000).toFixed(1).padEnd(27)}s  ║`);
    console.log("╚══════════════════════════════════════════════╝");

    process.exit(0);
  } catch (error) {
    console.error();
    console.error("Pipeline failed:", error);
    process.exit(1);
  }
}

main();
SCRIPTEOF

# ─── 3. Add pipeline:run script to web package.json ────────
echo "[3/5] Adding pipeline:run script to package.json..."
cd apps/web

# Use node to safely modify package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['pipeline:run'] = 'tsx --tsconfig tsconfig.json -r tsconfig-paths/register src/scripts/run-pipeline.ts';
pkg.scripts['pipeline:run:dry'] = 'DEMO_MODE=true tsx --tsconfig tsconfig.json -r tsconfig-paths/register src/scripts/run-pipeline.ts';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  ✅ Added pipeline:run and pipeline:run:dry scripts');
"

cd /workspaces/Trailblazer

# ─── 4. Create GitHub Actions workflow ──────────────────────
echo "[4/5] Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/pipeline.yml << 'GHEOF'
name: Narrative Detection Pipeline

on:
  # Fortnightly schedule: 1st and 15th of each month at 06:00 UTC
  schedule:
    - cron: '0 6 1 * *'   # 1st of every month
    - cron: '0 6 15 * *'  # 15th of every month

  # Manual trigger with optional date range
  workflow_dispatch:
    inputs:
      period_start:
        description: 'Period start date (YYYY-MM-DD), defaults to 14 days ago'
        required: false
        type: string
      period_end:
        description: 'Period end date (YYYY-MM-DD), defaults to today'
        required: false
        type: string

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  MOONSHOT_API_KEY: ${{ secrets.MOONSHOT_API_KEY }}
  MOONSHOT_MODEL: ${{ vars.MOONSHOT_MODEL || 'kimi-k2-turbo-preview' }}
  HELIUS_API_KEY: ${{ secrets.HELIUS_API_KEY }}
  GITHUB_TOKEN_CUSTOM: ${{ secrets.GH_TOKEN_CUSTOM }}
  ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
  NODE_ENV: production

jobs:
  run-pipeline:
    name: Run Narrative Detection
    runs-on: ubuntu-latest
    timeout-minutes: 30  # generous timeout, no Vercel limits

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: Get pnpm store directory
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Cache pnpm dependencies
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter web exec prisma generate

      - name: Run pipeline
        run: |
          ARGS=""
          if [ -n "${{ github.event.inputs.period_start }}" ]; then
            ARGS="$ARGS --start ${{ github.event.inputs.period_start }}"
          fi
          if [ -n "${{ github.event.inputs.period_end }}" ]; then
            ARGS="$ARGS --end ${{ github.event.inputs.period_end }}"
          fi
          echo "Running pipeline with args: $ARGS"
          pnpm --filter web pipeline:run $ARGS

      - name: Report status
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Pipeline completed successfully"
          else
            echo "❌ Pipeline failed — check logs above"
          fi
GHEOF

# ─── 5. Update the admin route to show job status ──────────
echo "[5/5] Updating admin route with job status..."

cat > apps/web/src/app/api/admin/run-fortnight/route.ts << 'ROUTEEOF'
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
ROUTEEOF

# ─── Build ──────────────────────────────────────────────────
echo ""
echo "Building..."
pnpm --filter web build 2>&1 | tail -10

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Pipeline Worker Deployed"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. git add -A && git commit -m 'feat: move pipeline to GitHub Actions worker' && git push"
echo "  2. Add GitHub Secrets (repo Settings → Secrets → Actions):"
echo "     - DATABASE_URL"
echo "     - MOONSHOT_API_KEY"  
echo "     - HELIUS_API_KEY"
echo "     - GH_TOKEN_CUSTOM"
echo "     - ADMIN_TOKEN"
echo "  3. Test locally: pnpm --filter web pipeline:run"
echo "  4. Trigger manually: GitHub → Actions → Narrative Detection Pipeline → Run workflow"
echo ""
