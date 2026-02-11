"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { NarrativeCard } from "@/components/narrative/narrative-card";

interface NarrativeData {
  id: string;
  title: string;
  summary: string;
  momentum: number;
  novelty: number;
  saturation: number;
  evidenceCount: number;
  ideaCount: number;
}

type SortKey = "momentum" | "novelty" | "saturation";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "momentum", label: "Momentum" },
  { key: "novelty", label: "Novelty" },
  { key: "saturation", label: "Saturation" },
];

export function HomeControls({
  narratives,
}: {
  narratives: NarrativeData[];
}) {
  const [sortBy, setSortBy] = useState<SortKey>("momentum");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let items = [...narratives];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q)
      );
    }

    // Sort
    items.sort((a, b) => {
      if (sortBy === "saturation") return a[sortBy] - b[sortBy]; // lower is better
      return b[sortBy] - a[sortBy]; // higher is better
    });

    return items;
  }, [narratives, sortBy, search]);

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter narratives..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === opt.key
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No narratives match &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((narrative, index) => (
            <NarrativeCard
              key={narrative.id}
              id={narrative.id}
              title={narrative.title}
              summary={narrative.summary}
              momentum={narrative.momentum}
              novelty={narrative.novelty}
              saturation={narrative.saturation}
              evidenceCount={narrative.evidenceCount}
              ideaCount={narrative.ideaCount}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
