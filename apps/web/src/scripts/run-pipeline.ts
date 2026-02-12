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
