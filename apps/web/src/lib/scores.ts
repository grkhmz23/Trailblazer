/**
 * Score interpretation utilities.
 * Translates raw 0-1 metrics into human-readable labels,
 * lifecycle stages, and opportunity scores.
 */

// ─── Human Labels ───

export function momentumLabel(score: number): { text: string; color: string } {
  if (score >= 0.7) return { text: "Rising fast", color: "text-emerald-400" };
  if (score >= 0.4) return { text: "Gaining traction", color: "text-amber-400" };
  return { text: "Early signal", color: "text-zinc-400" };
}

export function noveltyLabel(score: number): { text: string; color: string } {
  if (score >= 0.7) return { text: "Unique", color: "text-violet-400" };
  if (score >= 0.4) return { text: "Distinct", color: "text-sky-400" };
  return { text: "Familiar", color: "text-zinc-400" };
}

export function saturationLabel(score: number): { text: string; color: string } {
  if (score <= 0.3) return { text: "Open space", color: "text-emerald-400" };
  if (score <= 0.6) return { text: "Some competition", color: "text-amber-400" };
  return { text: "Crowded", color: "text-red-400" };
}

// ─── Lifecycle Stage ───

export type LifecycleStage = "discovery" | "acceleration" | "expansion" | "saturation";

export const lifecycleStages: { key: LifecycleStage; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "acceleration", label: "Acceleration" },
  { key: "expansion", label: "Expansion" },
  { key: "saturation", label: "Saturation" },
];

export function getLifecycleStage(momentum: number, saturation: number): LifecycleStage {
  if (saturation > 0.6) return "saturation";
  if (momentum >= 0.4 && saturation > 0.3) return "expansion";
  if (momentum >= 0.4 && saturation <= 0.3) return "acceleration";
  return "discovery";
}

export function lifecycleColor(stage: LifecycleStage): string {
  switch (stage) {
    case "discovery": return "text-sky-400 bg-sky-500/15 border-sky-500/20";
    case "acceleration": return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
    case "expansion": return "text-amber-400 bg-amber-500/15 border-amber-500/20";
    case "saturation": return "text-red-400 bg-red-500/15 border-red-500/20";
  }
}

// ─── Opportunity Score ───

export function opportunityScore(momentum: number, novelty: number, saturation: number): number {
  const raw = (momentum * 40) + (novelty * 30) + ((1 - saturation) * 30);
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function opportunityColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-zinc-400";
}
