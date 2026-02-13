import { cn } from "@/lib/utils";
import { type LifecycleStage, lifecycleStages } from "@/lib/scores";

interface LifecycleBarProps {
  stage: LifecycleStage;
  size?: "sm" | "md";
}

const stageColors: Record<LifecycleStage, string> = {
  discovery: "bg-sky-400",
  acceleration: "bg-emerald-400",
  expansion: "bg-amber-400",
  saturation: "bg-red-400",
};

export function LifecycleBar({ stage, size = "md" }: LifecycleBarProps) {
  const activeIndex = lifecycleStages.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center gap-1">
      {lifecycleStages.map((s, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <div key={s.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-full transition-all",
                  size === "sm" ? "h-1.5 w-8" : "h-2 w-12",
                  isActive
                    ? stageColors[stage]
                    : isPast
                    ? "bg-white/10"
                    : "bg-white/[0.04]"
                )}
              />
              {size === "md" && (
                <span
                  className={cn(
                    "text-[9px] mt-1 font-medium uppercase tracking-wider",
                    isActive ? "text-foreground" : "text-muted-foreground/40"
                  )}
                >
                  {s.label}
                </span>
              )}
            </div>
            {i < lifecycleStages.length - 1 && (
              <div
                className={cn(
                  "rounded-full",
                  size === "sm" ? "h-px w-1" : "h-px w-1.5",
                  isPast ? "bg-white/10" : "bg-white/[0.04]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
