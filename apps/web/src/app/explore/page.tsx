"use client";

import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreChip } from "@/components/ui/score-chip";
import Link from "next/link";

interface SearchResult {
  entities: Array<{
    id: string;
    kind: string;
    key: string;
    label: string;
  }>;
  narratives: Array<{
    id: string;
    title: string;
    summary: string;
    momentum: number;
  }>;
}

const kindBadge: Record<string, "info" | "success" | "purple" | "warning" | "secondary"> = {
  program: "info",
  repo: "success",
  token: "purple",
  keyword: "warning",
  protocol: "secondary",
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/explore?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Search entities, programs, repos, and keywords across all reports.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative animate-fade-up" style={{ animationDelay: "80ms" }}>
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          aria-label="Search entities and narratives" placeholder="Search by program address, repo name, keyword..."
          className="w-full rounded-xl border border-border/30 bg-white/[0.02] py-3.5 pl-11 pr-5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
        )}
      </div>

      {results && (
        <div className="space-y-8 animate-fade-up">
          {/* Entities */}
          {results.entities.length > 0 && (
            <div>
              <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-3">
                Entities ({results.entities.length})
              </h2>
              <div className="space-y-1.5">
                {results.entities.map((entity: any) => (
                  <Card key={entity.id} className="flex items-center gap-3 py-3 px-4 bg-card/50">
                    <Badge variant={kindBadge[entity.kind] ?? "secondary"}>{entity.kind}</Badge>
                    <span className="font-medium text-sm">{entity.label}</span>
                    <span className="text-[11px] text-muted-foreground/50 font-mono truncate">
                      {entity.key}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Narratives */}
          {results.narratives.length > 0 && (
            <div>
              <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-3">
                Related Narratives ({results.narratives.length})
              </h2>
              <div className="space-y-1.5">
                {results.narratives.map((narrative: any) => (
                  <Link key={narrative.id} href={`/narratives/${narrative.id}`}>
                    <Card className="group cursor-pointer transition-all hover:border-primary/20 bg-card/50 hover-lift">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {narrative.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {narrative.summary}
                          </p>
                        </div>
                        <ScoreChip label="Momentum" value={narrative.momentum} type="momentum" size="sm" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.entities.length === 0 && results.narratives.length === 0 && (
            <Card className="text-center py-16 bg-card/40">
              <Search className="h-6 w-6 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
