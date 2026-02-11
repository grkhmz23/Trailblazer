#!/bin/bash
set -e
BASE="/workspaces/Trailblazer/apps/web/src"
echo "🎨 Deploying Trailblazer frontend redesign..."
echo "   Target: $BASE"
echo ""
cat > "$BASE/app/explore/page.tsx" << 'ENDOFFILE'
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
        <p className="mt-1 text-sm text-muted-foreground">
          Search entities, programs, repos, and keywords to find related narratives.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative animate-fade-up" style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by program address, repo name, keyword..."
          className="w-full rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm py-4 pl-12 pr-5 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Entities ({results.entities.length})
              </h2>
              <div className="space-y-2">
                {results.entities.map((entity: any) => (
                  <Card key={entity.id} className="flex items-center gap-3 py-3 px-4 bg-card/40">
                    <Badge variant={kindBadge[entity.kind] ?? "secondary"}>{entity.kind}</Badge>
                    <span className="font-medium text-sm">{entity.label}</span>
                    <span className="text-[11px] text-muted-foreground font-mono truncate">
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
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Related Narratives ({results.narratives.length})
              </h2>
              <div className="space-y-2">
                {results.narratives.map((narrative: any) => (
                  <Link key={narrative.id} href={`/narratives/${narrative.id}`}>
                    <Card className="group cursor-pointer transition-all hover:border-primary/30 bg-card/40">
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
            <Card className="text-center py-12 bg-card/40">
              <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
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

ENDOFFILE
echo '  ✅ app/explore/page.tsx'

cat > "$BASE/app/globals.css" << 'ENDOFFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@layer base {
  :root {
    --background: 228 12% 4%;
    --foreground: 220 14% 92%;
    --card: 225 14% 7%;
    --card-foreground: 220 14% 92%;
    --primary: 265 90% 62%;
    --primary-foreground: 0 0% 100%;
    --secondary: 225 14% 12%;
    --secondary-foreground: 220 14% 92%;
    --muted: 225 12% 14%;
    --muted-foreground: 220 9% 55%;
    --accent: 225 14% 12%;
    --accent-foreground: 220 14% 92%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 225 12% 13%;
    --ring: 265 90% 62%;
    --radius: 0.75rem;

    /* Extended palette */
    --glow-purple: 265 90% 62%;
    --glow-cyan: 190 95% 55%;
    --glow-emerald: 155 80% 50%;
    --glow-amber: 38 95% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Outfit', sans-serif;
  }
  code, .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(225 12% 18%); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: hsl(225 12% 28%); }

/* ─── Background Mesh ─── */
.bg-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 40% at 10% 20%, hsla(265, 90%, 62%, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 80% 80%, hsla(190, 95%, 55%, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 50% 50%, hsla(155, 80%, 50%, 0.03) 0%, transparent 60%);
}

/* ─── Glassmorphism ─── */
.glass {
  background: hsla(225, 14%, 7%, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid hsla(225, 12%, 18%, 0.5);
}

.glass-hover:hover {
  background: hsla(225, 14%, 9%, 0.7);
  border-color: hsla(265, 90%, 62%, 0.2);
  box-shadow: 0 0 30px -10px hsla(265, 90%, 62%, 0.15);
}

/* ─── Bento Grid ─── */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Glow border effect ─── */
.glow-border {
  position: relative;
}
.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, hsla(265, 90%, 62%, 0.3), hsla(190, 95%, 55%, 0.1), transparent 50%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.glow-border:hover::before {
  opacity: 1;
}

/* ─── Score bar ─── */
.score-bar {
  height: 4px;
  border-radius: 2px;
  background: hsla(225, 12%, 18%, 0.5);
  overflow: hidden;
}
.score-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Animations ─── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-up {
  animation: fade-up 0.5s ease-out forwards;
  opacity: 0;
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
  opacity: 0;
}
.animate-glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}
.animate-slide-in {
  animation: slide-in-right 0.4s ease-out forwards;
  opacity: 0;
}

/* Stagger children */
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
.stagger > *:nth-child(5) { animation-delay: 240ms; }
.stagger > *:nth-child(6) { animation-delay: 300ms; }
.stagger > *:nth-child(7) { animation-delay: 360ms; }
.stagger > *:nth-child(8) { animation-delay: 420ms; }
.stagger > *:nth-child(9) { animation-delay: 480ms; }
.stagger > *:nth-child(10) { animation-delay: 540ms; }

/* ─── Timeline connector ─── */
.timeline-connector {
  @apply absolute left-[19px] top-10 -bottom-2 w-0.5 bg-gradient-to-b from-primary/40 to-transparent;
}

/* ─── Gradient text ─── */
.gradient-text {
  background: linear-gradient(135deg, hsl(265, 90%, 72%), hsl(190, 95%, 65%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ─── Data highlight ─── */
.data-highlight {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  letter-spacing: -0.02em;
}

ENDOFFILE
echo '  ✅ app/globals.css'

cat > "$BASE/app/layout.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Narrative Hunter — Solana Ecosystem",
  description:
    "AI-powered narrative detection for the Solana ecosystem. Discover emerging trends before they become obvious.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Background mesh */}
        <div className="bg-mesh" />

        <div className="relative flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

ENDOFFILE
echo '  ✅ app/layout.tsx'

cat > "$BASE/app/methodology/page.tsx" << 'ENDOFFILE'
import {
  Activity,
  GitBranch,
  Globe,
  Twitter,
  Brain,
  TrendingUp,
  Layers,
  Target,
  Zap,
  Database,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export const dynamic = "force-static";

export default function MethodologyPage() {
  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          How Narrative Hunter detects, scores, and surfaces emerging Solana
          ecosystem trends before they become obvious.
        </p>
      </div>

      {/* Pipeline Overview */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Pipeline Overview</h2>
        </div>
        <Card className="bg-card/40 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Every fortnight, Narrative Hunter runs an automated pipeline that
            ingests live data from multiple sources, scores each protocol on
            momentum and novelty, clusters related signals into narratives, and
            generates actionable build ideas using AI. The entire process runs
            in under 5 minutes.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {[
              { step: "1", label: "Ingest", desc: "Fetch live signals", color: "text-emerald-400 bg-emerald-500/10" },
              { step: "2", label: "Score", desc: "Momentum + novelty", color: "text-sky-400 bg-sky-500/10" },
              { step: "3", label: "Cluster", desc: "Group into narratives", color: "text-violet-400 bg-violet-500/10" },
              { step: "4", label: "Label", desc: "AI-powered naming", color: "text-amber-400 bg-amber-500/10" },
              { step: "5", label: "Generate", desc: "Build ideas + saturation", color: "text-primary bg-primary/10" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 sm:flex-col sm:text-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color} ring-1 ring-current/10`}>
                  <span className="font-mono font-bold text-sm">{s.step}</span>
                </div>
                <div className="sm:mt-2">
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
                {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 hidden sm:block mx-auto mt-1" />}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Data Sources */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold">Data Sources</h2>
        </div>
        <div className="bento-grid">
          {/* Onchain */}
          <Card className="col-span-12 lg:col-span-6 bg-card/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">Onchain Activity</h3>
                <p className="text-[11px] text-muted-foreground">via Helius RPC (Solana Mainnet)</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Transaction volume per program (current vs baseline)</p>
              <p>Unique wallet estimation via transaction sampling</p>
              <p>New wallet share and retention heuristics</p>
              <p className="text-emerald-400 font-medium">47 tracked program addresses across DeFi, LST, NFT, DePIN, infra</p>
            </div>
          </Card>

          {/* Dev Activity */}
          <Card className="col-span-12 lg:col-span-6 bg-card/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
                <GitBranch className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold">Developer Activity</h3>
                <p className="text-[11px] text-muted-foreground">via GitHub API v3</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Commit velocity (current vs baseline period)</p>
              <p>Star growth and fork counts</p>
              <p>New contributor detection and release tracking</p>
              <p className="text-sky-400 font-medium">47 tracked repositories across the ecosystem</p>
            </div>
          </Card>

          {/* Twitter/X */}
          <Card className="col-span-12 lg:col-span-6 bg-card/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                <Twitter className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Twitter / X KOL Signals</h3>
                <p className="text-[11px] text-muted-foreground">via public RSS proxies</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Core team: Toly, Raj Gokal, Solana Labs, Solana Foundation</p>
              <p>Protocol founders: Mert (Helius), Meow (Jupiter), Cindy (Drift), Lucas (Jito)</p>
              <p>VCs &amp; Research: Multicoin, a16z, Paradigm, Messari, Electric Capital</p>
              <p>CT Alpha: Ansem, Inversebrah, ZachXBT, and more</p>
              <p className="text-violet-400 font-medium">91 KOL accounts monitored with sentiment classification</p>
            </div>
          </Card>

          {/* RSS / News */}
          <Card className="col-span-12 lg:col-span-6 bg-card/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <Globe className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold">News &amp; RSS Feeds</h3>
                <p className="text-[11px] text-muted-foreground">public RSS/Atom feeds</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Solana official blog, The Block, CoinTelegraph</p>
              <p>CoinDesk, Decrypt, Blockworks, Messari</p>
              <p>Protocol-specific mention matching and engagement scoring</p>
              <p className="text-amber-400 font-medium">8 RSS feeds ingested per cycle</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Scoring */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <h2 className="text-xl font-semibold">Scoring Formula</h2>
        </div>
        <Card className="bg-card/40 p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Each protocol is scored across three dimensions, then combined with
            novelty and quality adjustments.
          </p>

          <div className="rounded-xl bg-muted/20 border border-border/30 p-5 font-mono text-sm space-y-2 overflow-x-auto">
            <div className="text-muted-foreground text-xs">{"// Z-score: measures change from baseline"}</div>
            <div>z(metric) = (current - baseline) / max(baseline, 1) <span className="text-muted-foreground text-xs">{"// clamped [-5, 5]"}</span></div>
            <div className="h-3" />
            <div className="text-muted-foreground text-xs">{"// Momentum: weighted signal combination"}</div>
            <div>momentum = <span className="text-emerald-400">0.70</span> × onchain_z + <span className="text-sky-400">0.50</span> × dev_z + <span className="text-amber-400">0.35</span> × social_z</div>
            <div className="h-3" />
            <div className="text-muted-foreground text-xs">{"// Novelty: recency bonus"}</div>
            <div>novelty = lerp(<span className="text-violet-400">1.3</span>, 1.0, age_days / 60)</div>
            <div className="h-3" />
            <div className="text-muted-foreground text-xs">{"// Quality penalties"}</div>
            <div>single_wallet_spike → <span className="text-red-400">0.6×</span></div>
            <div>hype_only_social → <span className="text-red-400">0.7×</span></div>
            <div className="h-3" />
            <div className="text-primary font-semibold text-base">totalScore = momentum × novelty × quality</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-emerald-400">70%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Onchain weight</div>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-sky-400">50%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Dev activity weight</div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-amber-400">35%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Social weight</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Clustering */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
            <Layers className="h-4 w-4 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold">Narrative Clustering</h2>
        </div>
        <Card className="bg-card/40 p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Top-scoring candidates are grouped into narratives using
            agglomerative clustering with cosine similarity on text embeddings.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { title: "Text Embeddings", desc: "384-dimensional character trigram hashing — deterministic, no external API dependency" },
              { title: "Average Linkage", desc: "Merge clusters above 0.45 cosine similarity threshold until max 10 clusters" },
              { title: "AI Labeling", desc: "Claude Sonnet analyzes each cluster to generate narrative title and summary" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/30 bg-muted/10 p-4">
                <div className="text-sm font-semibold mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Saturation */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "500ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold">Saturation Analysis</h2>
        </div>
        <Card className="bg-card/40 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each build idea is checked against a corpus of 150+ existing Solana
            projects to estimate market saturation. Cosine similarity between
            the idea description and existing project descriptions determines
            the saturation level: low (unique opportunity), medium (some
            competition), or high (crowded space). This helps founders focus on
            underserved areas.
          </p>
        </Card>
      </section>

      {/* AI Integration */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">AI-Powered Analysis</h2>
        </div>
        <Card className="bg-card/40 p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Claude Sonnet powers three key analytical steps with structured JSON
            outputs validated by Zod schemas:
          </p>
          <div className="space-y-3">
            {[
              { step: "1", title: "Narrative Labeling", desc: "Generates descriptive titles and one-paragraph summaries for each detected narrative cluster" },
              { step: "2", title: "Build Idea Generation", desc: "Creates 3–5 concrete product ideas per narrative with pitch, rationale, competitive landscape, and difficulty estimates" },
              { step: "3", title: "Action Pack Generation", desc: "Downloadable spec.md, tech.md, milestones.md, and deps.json for each idea — ready to start building" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                  <span className="font-mono text-xs font-bold text-primary">{item.step}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Tracked Protocols */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "700ms" }}>
        <h2 className="text-xl font-semibold">Tracked Protocols (47)</h2>
        <Card className="bg-card/40 p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-3 md:grid-cols-4">
            {[
              "Jupiter", "Jupiter Perpetuals", "Drift Protocol", "Raydium",
              "Orca (Whirlpool)", "Phoenix", "Marginfi", "Kamino Finance",
              "Zeta Markets", "Flash Trade", "Marinade Finance", "Jito",
              "Sanctum", "BlazeStake", "Light Protocol", "Squads Protocol",
              "Clockwork", "Switchboard", "Pyth Network", "Tensor",
              "Metaplex", "Wormhole", "Dialect", "Sphere Pay",
              "Realms", "Star Atlas", "Pump.fun", "Meteora",
              "Helium", "Parcl", "Access Protocol", "Helius",
              "Backpack", "Phantom", "Magic Eden", "PYUSD",
              "Meta DAO", "Genopets", "Render Network", "Hivemapper",
              "Bonk", "Dogwifhat", "Moonshot", "Robot AI",
              "Ondo Finance", "DFlow", "Solana Mobile",
            ].map((name) => (
              <div key={name} className="text-muted-foreground py-0.5 text-[13px]">
                {name}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Schedule */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "800ms" }}>
        <h2 className="text-xl font-semibold">Refresh Schedule</h2>
        <Card className="bg-card/40 p-6">
          <p className="text-sm text-muted-foreground">
            Reports are generated automatically on the 1st and 15th of each
            month via GitHub Actions cron. The pipeline can also be triggered
            manually via the admin API endpoint.
          </p>
        </Card>
      </section>
    </div>
  );
}

ENDOFFILE
echo '  ✅ app/methodology/page.tsx'

cat > "$BASE/app/narratives/[id]/page.tsx" << 'ENDOFFILE'
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvestigationTrace } from "@/components/narrative/investigation-trace";
import { EvidenceList } from "@/components/narrative/evidence-list";
import { IdeaCard } from "@/components/narrative/idea-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Lightbulb, Brain, Search as SearchIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function NarrativeDetailPage({ params }: Props) {
  const narrative = await prisma.narrative.findUnique({
    where: { id: params.id },
    include: {
      evidence: true,
      investigationSteps: { orderBy: { stepIndex: "asc" } },
      ideas: true,
      report: true,
    },
  });

  if (!narrative) return notFound();

  const steps = narrative.investigationSteps.map((s: any) => ({
    id: s.id,
    stepIndex: s.stepIndex,
    tool: s.tool,
    inputJson: s.inputJson as Record<string, unknown>,
    outputSummary: s.outputSummary,
    linksJson: s.linksJson as string[],
    createdAt: new Date(s.createdAt).toISOString(),
  }));

  const evidenceData = narrative.evidence.map((e: any) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    url: e.url,
    snippet: e.snippet,
    metricsJson: e.metricsJson as Record<string, unknown>,
  }));

  const ideasData = narrative.ideas.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    pitch: idea.pitch,
    targetUser: idea.targetUser,
    mvpScope: idea.mvpScope,
    whyNow: idea.whyNow,
    validation: idea.validation,
    saturationJson: idea.saturationJson as {
      level: string;
      score: number;
      neighbors: Array<{ name: string; similarity: number; url: string }>;
    },
    pivot: idea.pivot,
  }));

  return (
    <div className="space-y-10 pb-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to report
      </Link>

      {/* Hero header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          {narrative.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {narrative.summary}
        </p>

        {/* Score strip */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ScoreChip label="Momentum" value={narrative.momentum} type="momentum" />
          <ScoreChip label="Novelty" value={narrative.novelty} type="novelty" />
          <ScoreChip label="Saturation" value={narrative.saturation} type="saturation" />
          <span className="text-border mx-1">|</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            {evidenceData.length} evidence points
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            {ideasData.length} build ideas
          </span>
        </div>
      </div>

      {/* Investigation Trace */}
      {steps.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Investigation Trace</h2>
              <p className="text-xs text-muted-foreground">AI agent reasoning steps</p>
            </div>
          </div>
          <InvestigationTrace steps={steps} />
        </section>
      )}

      {/* Evidence */}
      <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
            <SearchIcon className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Evidence</h2>
            <p className="text-xs text-muted-foreground">{evidenceData.length} signals from onchain, dev, and social data</p>
          </div>
        </div>
        <EvidenceList evidence={evidenceData} />
      </section>

      {/* Build Ideas */}
      <section className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Build Ideas</h2>
            <p className="text-xs text-muted-foreground">{ideasData.length} actionable product ideas with saturation analysis</p>
          </div>
        </div>
        <div className="space-y-3">
          {ideasData.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>
    </div>
  );
}

ENDOFFILE
echo '  ✅ app/narratives/[id]/page.tsx'

cat > "$BASE/app/page.tsx" << 'ENDOFFILE'
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, BarChart3, Clock, Zap, TrendingUp, Sparkles, Target, Activity } from "lucide-react";
import Link from "next/link";
import { HomeControls } from "@/components/dashboard/home-controls";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const report = await prisma.report.findFirst({
    where: { status: "complete" },
    orderBy: { createdAt: "desc" },
    include: {
      narratives: {
        include: {
          evidence: true,
          ideas: true,
        },
      },
    },
  });

  if (!report) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg text-center space-y-6">
          {/* Animated logo */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/20 ring-1 ring-primary/30">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">No Reports Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Run the pipeline to generate your first fortnightly narrative report for the Solana ecosystem.
            </p>
          </div>

          <Card className="text-left space-y-3 bg-card/40">
            <p className="text-xs text-muted-foreground font-medium">Quick start:</p>
            <code className="block rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5 text-xs font-mono text-foreground">
              pnpm seed:demo
            </code>
            <p className="text-[11px] text-muted-foreground text-center">or trigger via API:</p>
            <code className="block rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5 text-xs font-mono text-foreground">
              curl -X POST /api/admin/run-fortnight -H<br />
              &quot;Authorization: Bearer $ADMIN_TOKEN&quot;
            </code>
          </Card>
        </div>
      </div>
    );
  }

  // Compute aggregate stats
  const totalEvidence = report.narratives.reduce((sum: number, n: any) => sum + n.evidence.length, 0);
  const totalIdeas = report.narratives.reduce((sum: number, n: any) => sum + n.ideas.length, 0);
  const avgMomentum = report.narratives.length > 0
    ? report.narratives.reduce((sum: number, n: any) => sum + n.momentum, 0) / report.narratives.length
    : 0;

  const narratives = report.narratives.map((n: any) => ({
    id: n.id,
    title: n.title,
    summary: n.summary,
    momentum: n.momentum,
    novelty: n.novelty,
    saturation: n.saturation,
    evidenceCount: n.evidence.length,
    ideaCount: n.ideas.length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Latest Fortnight Report
          </h1>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Generated {formatDate(report.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {[
          { label: "Narratives", value: report.narratives.length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
          { label: "Evidence Points", value: totalEvidence, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Build Ideas", value: totalIdeas, icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Avg Momentum", value: `${(avgMomentum * 100).toFixed(0)}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-card/40">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold data-highlight ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Narratives grid with controls */}
      <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <HomeControls narratives={narratives} />
      </div>

      {/* Footer */}
      <div className="text-center pt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Link
          href="/reports"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all reports →
        </Link>
      </div>
    </div>
  );
}

ENDOFFILE
echo '  ✅ app/page.tsx'

cat > "$BASE/app/reports/[id]/page.tsx" << 'ENDOFFILE'
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NarrativeCard } from "@/components/narrative/narrative-card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";
import { Calendar, BarChart3, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ReportDetailPage({ params }: Props) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      narratives: {
        include: {
          evidence: true,
          ideas: true,
        },
        orderBy: { momentum: "desc" },
      },
      _count: { select: { candidates: true } },
    },
  });

  if (!report) return notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All reports
      </Link>

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Fortnight Report
          </h1>
          <Badge variant={report.status === "complete" ? "success" : "warning"}>
            {report.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(report.periodStart, report.periodEnd)}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            {report.narratives.length} narratives
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {report._count.candidates} candidates evaluated
          </span>
        </div>
      </div>

      {/* Narratives bento */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Detected Narratives</h2>
        <div className="bento-grid stagger">
          {report.narratives.map((narrative: any, index: number) => (
            <NarrativeCard
              key={narrative.id}
              id={narrative.id}
              title={narrative.title}
              summary={narrative.summary}
              momentum={narrative.momentum}
              novelty={narrative.novelty}
              saturation={narrative.saturation}
              evidenceCount={narrative.evidence.length}
              ideaCount={narrative.ideas.length}
              index={index}
              totalCount={report.narratives.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

ENDOFFILE
echo '  ✅ app/reports/[id]/page.tsx'

cat > "$BASE/app/reports/page.tsx" << 'ENDOFFILE'
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Calendar, ArrowRight, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { narratives: true, candidates: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">All Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fortnightly narrative detection reports for the Solana ecosystem.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12 bg-card/40">
          <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reports generated yet.</p>
        </Card>
      ) : (
        <div className="space-y-3 stagger">
          {reports.map((report: any) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="group flex items-center justify-between transition-all hover:border-primary/30 bg-card/40 animate-fade-up">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {formatDateRange(report.periodStart, report.periodEnd)}
                      </span>
                      <Badge
                        variant={report.status === "complete" ? "success" : "warning"}
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {report._count.narratives} narratives
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {report._count.candidates} candidates
                      </span>
                      <span>Generated {formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

ENDOFFILE
echo '  ✅ app/reports/page.tsx'

cat > "$BASE/components/dashboard/home-controls.tsx" << 'ENDOFFILE'
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

ENDOFFILE
echo '  ✅ components/dashboard/home-controls.tsx'

cat > "$BASE/components/dashboard/sidebar.tsx" << 'ENDOFFILE'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Search,
  BookOpen,
  Zap,
  Activity,
  GitBranch,
  Twitter,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Latest Report", icon: Zap, desc: "Current fortnight" },
  { href: "/reports", label: "All Reports", icon: FileText, desc: "Historical data" },
  { href: "/explore", label: "Explore", icon: Search, desc: "Search entities" },
  { href: "/methodology", label: "Methodology", icon: BookOpen, desc: "How it works" },
];

const dataSources = [
  { label: "Helius Onchain", icon: Activity, color: "bg-emerald-400" },
  { label: "GitHub Dev", icon: GitBranch, color: "bg-sky-400" },
  { label: "Twitter / X KOLs", icon: Twitter, color: "bg-violet-400" },
  { label: "RSS Feeds", icon: Globe, color: "bg-amber-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand */}
      <div>
        <Link href="/" className="flex items-center gap-3 px-3 mb-10">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            <Zap className="h-4 w-4 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-glow-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight leading-none">
              Narrative Hunter
            </div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">
              Solana Ecosystem
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="space-y-1 px-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "drop-shadow-[0_0_4px_hsla(265,90%,62%,0.5)]")} />
                <div className="flex flex-col">
                  <span className={cn("font-medium leading-none", isActive && "text-primary")}>{item.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{item.desc}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Data sources + footer */}
      <div className="space-y-4 px-1">
        <div className="rounded-xl border border-border/30 bg-card/40 p-3 space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live Data Sources
          </div>
          {dataSources.map((ds) => (
            <div
              key={ds.label}
              className="flex items-center gap-2.5 text-[11px] text-muted-foreground"
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", ds.color)} />
              <ds.icon className="h-3 w-3 opacity-50" />
              <span>{ds.label}</span>
            </div>
          ))}
        </div>
        <div className="px-2 pb-2 text-[10px] text-muted-foreground/60 leading-relaxed">
          AI-powered narrative detection · Refreshed fortnightly
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl glass lg:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-60 border-r border-border/30 bg-background/80 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          {navContent}
        </div>
      </aside>
    </>
  );
}

ENDOFFILE
echo '  ✅ components/dashboard/sidebar.tsx'

cat > "$BASE/components/narrative/evidence-list.tsx" << 'ENDOFFILE'
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Activity, GitBranch, MessageCircle, Code, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  url: string;
  snippet: string;
  metricsJson: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: typeof Activity; label: string; color: string; badge: "success" | "info" | "warning" | "purple" | "secondary" }> = {
  onchain: { icon: Activity, label: "Onchain", color: "text-emerald-400", badge: "success" },
  dev: { icon: GitBranch, label: "Developer", color: "text-sky-400", badge: "info" },
  social: { icon: MessageCircle, label: "Social", color: "text-amber-400", badge: "warning" },
  idl_diff: { icon: Code, label: "IDL Diff", color: "text-violet-400", badge: "purple" },
  dependency: { icon: Package, label: "Dependency", color: "text-zinc-400", badge: "secondary" },
};

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">No evidence collected yet.</p>
      </div>
    );
  }

  const grouped = evidence.reduce(
    (acc, item) => {
      (acc[item.type] ??= []).push(item);
      return acc;
    },
    {} as Record<string, EvidenceItem[]>
  );

  return (
    <div className="space-y-6 stagger">
      {Object.entries(grouped).map(([type, items]) => {
        const config = typeConfig[type] ?? { icon: Activity, label: type, color: "text-zinc-400", badge: "secondary" as const };
        const Icon = config.icon;

        return (
          <div key={type} className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-current/10", config.color)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <h3 className="text-sm font-semibold">{config.label}</h3>
              <span className="text-xs text-muted-foreground">({items.length})</span>
            </div>
            <div className="grid gap-2">
              {items.map((item) => (
                <Card key={item.id} className="p-3.5 hover:border-border/60 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.badge}>{config.label}</Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      {item.snippet && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

ENDOFFILE
echo '  ✅ components/narrative/evidence-list.tsx'

cat > "$BASE/components/narrative/idea-card.tsx" << 'ENDOFFILE'
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  ChevronDown,
  Download,
  Users,
  Rocket,
  Clock,
  Shield,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { cn, saturationColor } from "@/lib/utils";

interface IdeaData {
  id: string;
  title: string;
  pitch: string;
  targetUser: string;
  mvpScope: string;
  whyNow: string;
  validation: string;
  saturationJson: {
    level: string;
    score: number;
    neighbors: Array<{ name: string; similarity: number; url: string }>;
  };
  pivot: string;
}

export function IdeaCard({ idea }: { idea: IdeaData }) {
  const [expanded, setExpanded] = useState(false);
  const sat = idea.saturationJson;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      expanded && "ring-1 ring-primary/20 shadow-lg shadow-primary/5"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{idea.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{idea.pitch}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={saturationColor(sat.level)}>
            {sat.level}
          </Badge>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )} />
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="mt-5 space-y-5 border-t border-border/30 pt-5 animate-fade-in">
          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Users, label: "Target User", value: idea.targetUser },
              { icon: Rocket, label: "MVP Scope", value: idea.mvpScope },
              { icon: Clock, label: "Why Now", value: idea.whyNow },
              { icon: Shield, label: "Validation", value: idea.validation },
            ].map((field) => (
              <div key={field.label} className="rounded-lg bg-muted/20 border border-border/20 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
                  <field.icon className="h-3 w-3" />
                  {field.label}
                </div>
                <p className="text-sm leading-relaxed">{field.value}</p>
              </div>
            ))}
          </div>

          {/* Similar projects */}
          {sat.neighbors && sat.neighbors.length > 0 && (
            <div>
              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Similar Projects
              </h5>
              <div className="flex flex-wrap gap-2">
                {sat.neighbors.map((n: { name: string; similarity: number; url: string }) => (
                  <a
                    key={n.name}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5 text-xs hover:border-primary/30 transition-colors"
                  >
                    <span>{n.name}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">
                      {(n.similarity * 100).toFixed(0)}%
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/50 group-hover/link:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pivot advice */}
          {idea.pivot && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-1.5">
                <Zap className="h-3 w-3" />
                Differentiation Advice
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{idea.pivot}</p>
            </div>
          )}

          {/* Action pack CTA */}
          <a
            href={`/api/ideas/${idea.id}/action-pack.zip`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all"
          >
            <Download className="h-4 w-4" />
            Download Action Pack
          </a>
        </div>
      )}
    </Card>
  );
}

ENDOFFILE
echo '  ✅ components/narrative/idea-card.tsx'

cat > "$BASE/components/narrative/investigation-trace.tsx" << 'ENDOFFILE'
import { Card } from "@/components/ui/card";
import { toolIcon } from "@/lib/utils";
import { ExternalLink, Search, Code, Package, MessageCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  stepIndex: number;
  tool: string;
  inputJson: Record<string, unknown>;
  outputSummary: string;
  linksJson: string[];
  createdAt: string;
}

const toolConfig: Record<string, { icon: typeof Search; label: string; color: string }> = {
  repo_inspector: { icon: Search, label: "Repo Inspector", color: "text-sky-400 bg-sky-500/10" },
  idl_differ: { icon: Code, label: "IDL Differ", color: "text-violet-400 bg-violet-500/10" },
  dependency_tracker: { icon: Package, label: "Dependency Tracker", color: "text-amber-400 bg-amber-500/10" },
  social_pain_finder: { icon: MessageCircle, label: "Social Pain Finder", color: "text-orange-400 bg-orange-500/10" },
  competitor_search: { icon: Target, label: "Competitor Search", color: "text-emerald-400 bg-emerald-500/10" },
};

export function InvestigationTrace({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">No investigation steps recorded.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0 stagger">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      {steps.map((step, i) => {
        const config = toolConfig[step.tool] ?? { icon: Search, label: step.tool, color: "text-zinc-400 bg-zinc-500/10" };
        const Icon = config.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4 pb-6 animate-fade-up">
            {/* Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-2 ring-background",
                config.color
              )}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Content */}
            <Card className="flex-1 p-4 hover:border-border/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    Step {step.stepIndex + 1}
                  </span>
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
              </div>

              {/* Output */}
              {step.outputSummary && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {step.outputSummary}
                </p>
              )}

              {/* Links */}
              {step.linksJson && step.linksJson.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(step.linksJson as string[]).map((link, li) => (
                    <a
                      key={li}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source {li + 1}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

ENDOFFILE
echo '  ✅ components/narrative/investigation-trace.tsx'

cat > "$BASE/components/narrative/narrative-card.tsx" << 'ENDOFFILE'
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { ArrowUpRight, FileText, Lightbulb } from "lucide-react";
import { cn, truncate } from "@/lib/utils";

interface NarrativeCardProps {
  id: string;
  title: string;
  summary: string;
  momentum: number;
  novelty: number;
  saturation: number;
  evidenceCount: number;
  ideaCount: number;
  index: number;
  totalCount?: number;
}

/**
 * Compute bento grid column span based on card position.
 * First card is hero (wide), next two are medium, rest are standard.
 */
function getBentoSpan(index: number, total: number): string {
  if (total <= 2) return "col-span-12 lg:col-span-6";
  if (index === 0) return "col-span-12 lg:col-span-8";
  if (index === 1) return "col-span-12 lg:col-span-4";
  if (index === 2) return "col-span-12 sm:col-span-6 lg:col-span-5";
  if (index === 3) return "col-span-12 sm:col-span-6 lg:col-span-7";
  if (index % 3 === 0) return "col-span-12 sm:col-span-6 lg:col-span-4";
  if (index % 3 === 1) return "col-span-12 sm:col-span-6 lg:col-span-4";
  return "col-span-12 sm:col-span-6 lg:col-span-4";
}

export function NarrativeCard({
  id,
  title,
  summary,
  momentum,
  novelty,
  saturation,
  evidenceCount,
  ideaCount,
  index,
  totalCount = 10,
}: NarrativeCardProps) {
  const isHero = index === 0 && totalCount > 2;
  const span = getBentoSpan(index, totalCount);

  return (
    <Link href={`/narratives/${id}`} className={cn(span, "animate-fade-up")}>
      <Card
        glow
        className={cn(
          "group relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
          isHero ? "p-7" : "p-5"
        )}
      >
        {/* Top row: rank + metadata */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex shrink-0 items-center justify-center rounded-lg font-mono font-bold text-primary",
              isHero ? "h-8 w-8 bg-primary/15 text-sm" : "h-6 w-6 bg-primary/10 text-xs"
            )}>
              {index + 1}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {evidenceCount} evidence
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {ideaCount} ideas
              </span>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-bold tracking-tight transition-colors group-hover:text-primary",
          isHero ? "text-xl mb-2" : "text-base mb-1.5"
        )}>
          {title}
        </h3>

        {/* Summary */}
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          isHero ? "text-sm mb-5 line-clamp-3" : "text-xs mb-4 line-clamp-2"
        )}>
          {truncate(summary, isHero ? 280 : 150)}
        </p>

        {/* Scores */}
        <div className={cn("flex flex-wrap gap-2", isHero ? "gap-3" : "gap-2")}>
          <ScoreChip label="Momentum" value={momentum} type="momentum" size={isHero ? "md" : "sm"} />
          <ScoreChip label="Novelty" value={novelty} type="novelty" size={isHero ? "md" : "sm"} />
          <ScoreChip label="Saturation" value={saturation} type="saturation" size={isHero ? "md" : "sm"} />
        </div>

        {/* Decorative gradient orb */}
        {isHero && (
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        )}
      </Card>
    </Link>
  );
}

ENDOFFILE
echo '  ✅ components/narrative/narrative-card.tsx'

cat > "$BASE/components/ui/badge.tsx" << 'ENDOFFILE'
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "secondary" | "info" | "purple";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border-primary/20",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  destructive: "bg-red-500/15 text-red-400 border-red-500/20",
  secondary: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  info: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

ENDOFFILE
echo '  ✅ components/ui/badge.tsx'

cat > "$BASE/components/ui/card.tsx" << 'ENDOFFILE'
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ className, children, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 transition-all duration-300",
        glow && "glow-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

ENDOFFILE
echo '  ✅ components/ui/card.tsx'

cat > "$BASE/components/ui/score-chip.tsx" << 'ENDOFFILE'
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

ENDOFFILE
echo '  ✅ components/ui/score-chip.tsx'


echo ""
echo "🔍 Verifying..."
echo "  Files: $(find $BASE -name '*.tsx' -o -name '*.css' | wc -l)"
echo "  Protocols: $(grep -c 'key:' $BASE/lib/pipeline/protocols.ts 2>/dev/null || echo 'n/a')"
echo "  KOLs: $(grep -c 'handle:' $BASE/lib/pipeline/ingestors/twitter.ts 2>/dev/null || echo 'n/a')"
echo ""
echo "✅ Frontend redesign deployed!"
echo "   Run: cd /workspaces/Trailblazer && pnpm --filter web build"
