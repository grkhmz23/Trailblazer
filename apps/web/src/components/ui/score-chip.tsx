import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Target } from "lucide-react";

interface ScoreChipProps {
  label: string;
  value: number;
  type: "momentum" | "novelty" | "saturation";
}

const chipConfig = {
  momentum: {
    icon: TrendingUp,
    colorFn: (v: number) =>
      v >= 0.7
        ? "text-emerald-400 bg-emerald-500/10"
        : v >= 0.4
          ? "text-amber-400 bg-amber-500/10"
          : "text-zinc-400 bg-zinc-500/10",
  },
  novelty: {
    icon: Sparkles,
    colorFn: (v: number) =>
      v >= 0.7
        ? "text-violet-400 bg-violet-500/10"
        : v >= 0.4
          ? "text-blue-400 bg-blue-500/10"
          : "text-zinc-400 bg-zinc-500/10",
  },
  saturation: {
    icon: Target,
    colorFn: (v: number) =>
      v <= 0.3
        ? "text-emerald-400 bg-emerald-500/10"
        : v <= 0.6
          ? "text-amber-400 bg-amber-500/10"
          : "text-red-400 bg-red-500/10",
  },
};

export function ScoreChip({ label, value, type }: ScoreChipProps) {
  const config = chipConfig[type];
  const Icon = config.icon;
  const colorClass = config.colorFn(value);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
        colorClass
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
      <span className="font-bold">{(value * 100).toFixed(0)}</span>
    </div>
  );
}
