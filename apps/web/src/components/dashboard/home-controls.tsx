"use client";

import { useState, useMemo } from "react";
import { NarrativeCard } from "@/components/narrative/narrative-card";
import { Search, TrendingUp, Sparkles, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";

interface NarrativeSummary {
  id: string;
  title: string;
  summary: string;
  momentum: number;
  novelty: number;
  saturation: number;
  evidenceCount: number;
  ideaCount: number;
}

type SortKey = "momentum" | "novelty" | "alpha";

const sortOptions: Array<{ key: SortKey; label: string; icon: typeof TrendingUp }> = [
  { key: "momentum", label: "Momentum", icon: TrendingUp },
  { key: "novelty", label: "Novelty", icon: Sparkles },
  { key: "alpha", label: "A–Z", icon: SortAsc },
];

export function HomeControls({ narratives }: { narratives: NarrativeSummary[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("momentum");

  const filtered = useMemo(() => {
    let list = narratives;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "momentum") return b.momentum - a.momentum;
      if (sortBy === "novelty") return b.novelty - a.novelty;
      return a.title.localeCompare(b.title);
    });
  }, [narratives, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter narratives..."
            className="w-full rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border/30 bg-card/30 p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all",
                sortBy === opt.key
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No narratives match your search.</p>
        </div>
      ) : (
        <div className="bento-grid stagger">
          {filtered.map((n, i) => (
            <NarrativeCard
              key={n.id}
              id={n.id}
              title={n.title}
              summary={n.summary}
              momentum={n.momentum}
              novelty={n.novelty}
              saturation={n.saturation}
              evidenceCount={n.evidenceCount}
              ideaCount={n.ideaCount}
              index={i}
              totalCount={filtered.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}

