"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/explore?q=${encodeURIComponent(query.trim())}`
      );
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search entities, programs, repos, and keywords to find related
          narratives.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by program address, repo name, keyword..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Searching...
        </p>
      )}

      {results && (
        <div className="space-y-6">
          {/* Entities */}
          {results.entities.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Entities ({results.entities.length})
              </h2>
              <div className="space-y-2">
                {results.entities.map((entity: any) => (
                  <Card key={entity.id} className="flex items-center gap-3 py-3">
                    <Badge variant="secondary">{entity.kind}</Badge>
                    <span className="font-medium">{entity.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">
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
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Related Narratives ({results.narratives.length})
              </h2>
              <div className="space-y-2">
                {results.narratives.map((narrative: any) => (
                  <Link
                    key={narrative.id}
                    href={`/narratives/${narrative.id}`}
                  >
                    <Card className="group cursor-pointer transition-all hover:border-primary/30">
                      <h3 className="font-medium group-hover:text-primary">
                        {narrative.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {narrative.summary}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.entities.length === 0 &&
            results.narratives.length === 0 && (
              <Card className="text-center">
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
