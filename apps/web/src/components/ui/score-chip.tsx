import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Target } from "lucide-react";
import { momentumLabel, noveltyLabel, saturationLabel } from "@/lib/scores";

interface ScoreChipProps {
  label: string;
  value: number;
  type: "momentum" | "novelty" | "saturation";
  size?: "sm" | "md";
  showHuman?: boolean;
}

const chipConfig = {
  momentum: {
    icon: TrendingUp,
    bg: "bg-emerald-500/6 border-emerald-500/12",
    text: "text-emerald-400",
    barColor: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    glow: "card-glow-emerald",
    getLabel: momentumLabel,
  },
  novelty: {
    icon: Sparkles,
    bg: "bg-violet-500/6 border-violet-500/12",
    text: "text-violet-400",
    barColor: "bg-gradient-to-r from-violet-600 to-purple-400",
    glow: "card-glow-violet",
    getLabel: noveltyLabel,
  },
  saturation: {
    icon: Target,
    bg: "bg-amber-500/6 border-amber-500/12",
    text: "text-amber-400",
    barColor: "bg-gradient-to-r from-amber-600 to-orange-400",
    glow: "card-glow-amber",
    getLabel: saturationLabel,
  },
};

export function ScoreChip({ label, value, type, size = "md", showHuman = true }: ScoreChipProps) {
  const config = chipConfig[type];
  const Icon = config.icon;
  const pct = Math.round(value * 100);
  const humanLabel = config.getLabel(value);

  if (showHuman) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md border",
          config.bg,
          size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1"
        )}
        title={`${label}: ${pct}/100`}
      >
        <Icon
          className={cn(
            "shrink-0 opacity-70",
            humanLabel.color,
            size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"
          )}
        />
        <span className={cn(
          "font-medium",
          humanLabel.color,
          size === "sm" ? "text-[10px]" : "text-[11px]"
        )}>
          {humanLabel.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border",
        config.bg,
        config.glow,
        size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
      )}
    >
      <Icon
        className={cn(
          "shrink-0 opacity-70",
          config.text,
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"
        )}
      />
      <div className="flex flex-col gap-0.5 min-w-[60px]">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              size === "sm" ? "text-[10px]" : "text-[11px]"
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              "font-mono font-semibold",
              config.text,
              size === "sm" ? "text-[10px]" : "text-xs"
            )}
          >
            {pct}
          </span>
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
