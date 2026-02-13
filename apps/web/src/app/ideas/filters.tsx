"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Lightbulb, ArrowUpRight, Search } from "lucide-react";
import { LifecycleBar } from "@/components/ui/lifecycle-bar";
import { cn, saturationColor } from "@/lib/utils";
import {
  getLifecycleStage,
  lifecycleColor,
  opportunityColor,
} from "@/lib/scores";
import Link from "next/link";

interface IdeaItem {
  id: string;
  title: string;
  pitch: string;
  targetUser: string;
  mvpScope: string;
  whyNow: string;
  saturationLevel: string;
  saturationScore: number;
  narrativeTitle: string;
  narrativeId: string;
  narrativeMomentum: number;
  narrativeNovelty: number;
  narrativeSaturation: number;
  opportunity: number;
}

type FilterSat = "all" | "low" | "medium" | "high";

const satFilters: { key: FilterSat; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low sat." },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High sat." },
];

export function IdeasFilters({ ideas }: { ideas: IdeaItem[] }) {
  const [search, setSearch] = useState("");
  const [satFilter, setSatFilter] = useState<FilterSat>("all");

  const filtered = useMemo(() => {
    let list = ideas;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.pitch.toLowerCase().includes(q) ||
          i.targetUser.toLowerCase().includes(q)
      );
    }
    if (satFilter !== "all") {
      list = list.filter((i) => i.saturationLevel === satFilter);
    }
    return list;
  }, [ideas, search, satFilter]);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter ideas..."
            className="w-full rounded-lg border border-border/30 bg-white/[0.02] py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/20 bg-white/[0.02] p-0.5">
          {satFilters.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSatFilter(opt.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-medium transition-all",
                satFilter === opt.key
                  ? "bg-white/[0.06] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No ideas match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
          {filtered.map((idea) => {
            const stage = getLifecycleStage(idea.narrativeMomentum, idea.narrativeSaturation);
            const stageStyle = lifecycleColor(stage);
            const oppColor = opportunityColor(idea.opportunity);

            return (
              <Card
                key={idea.id}
                className="p-5 bg-card/50 hover:border-primary/20 hover-lift transition-all animate-fade-up"
              >
                {/* Top: title + saturation */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-[14px] font-semibold leading-snug">
                    {idea.title}
                  </h3>
                  <div className={cn("text-lg font-bold data-highlight shrink-0", oppColor)}>
                    {idea.opportunity}
                  </div>
                </div>

                {/* Pitch */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {idea.pitch}
                </p>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={cn(saturationColor(idea.saturationLevel))}>
                    {idea.saturationLevel}
                  </Badge>
                  <span className={cn("text-[10px] font-medium uppercase tracking-wider rounded-md border px-1.5 py-0.5", stageStyle)}>
                    {stage}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 truncate">
                    {idea.targetUser}
                  </span>
                </div>

                {/* Narrative source + action pack */}
                <div className="flex items-center justify-between pt-3 border-t border-border/15">
                  <Link
                    href={`/narratives/${idea.narrativeId}`}
                    className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[60%]"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {idea.narrativeTitle}
                  </Link>
                  <a
                    href={`/api/ideas/${idea.id}/action-pack.zip`}
                    className="flex items-center gap-1.5 rounded-md bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Action Pack
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
