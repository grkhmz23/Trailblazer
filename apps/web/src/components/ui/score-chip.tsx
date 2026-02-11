import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Target } from "lucide-react";

interface ScoreChipProps {
  label: string;
  value: number;
  type: "momentum" | "novelty" | "saturation";
  size?: "sm" | "md";
}

const chipConfig = {
  momentum: {
    icon: TrendingUp,
    gradient: "from-emerald-500 to-emerald-400",
    bg: "bg-emerald-500/8",
    text: "text-emerald-400",
    barColor: "bg-gradient-to-r from-emerald-600 to-emerald-400",
  },
  novelty: {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-400",
    bg: "bg-violet-500/8",
    text: "text-violet-400",
    barColor: "bg-gradient-to-r from-violet-600 to-purple-400",
  },
  saturation: {
    icon: Target,
    gradient: "from-amber-500 to-orange-400",
    bg: "bg-amber-500/8",
    text: "text-amber-400",
    barColor: "bg-gradient-to-r from-amber-600 to-orange-400",
  },
};

export function ScoreChip({ label, value, type, size = "md" }: ScoreChipProps) {
  const config = chipConfig[type];
  const Icon = config.icon;
  const pct = Math.round(value * 100);

  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-lg border border-border/30",
      config.bg,
      size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
    )}>
      <Icon className={cn("shrink-0", config.text, size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <div className="flex flex-col gap-0.5 min-w-[60px]">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-muted-foreground", size === "sm" ? "text-[10px]" : "text-[11px]")}>{label}</span>
          <span className={cn("font-mono font-semibold", config.text, size === "sm" ? "text-[10px]" : "text-xs")}>{pct}</span>
        </div>
        <div className="score-bar">
          <div
            className={cn("score-bar-fill", config.barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

