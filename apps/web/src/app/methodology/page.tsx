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
        <h1 className="text-2xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-2 text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
          How Trailblazer detects, scores, and surfaces emerging Solana
          ecosystem trends before they become obvious.
        </p>
      </div>

      {/* Pipeline Overview */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Pipeline Overview</h2>
        </div>
        <Card className="bg-card/50 p-6">
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
            Every fortnight, Trailblazer runs an automated pipeline that
            ingests live data from multiple sources, scores each protocol on
            momentum and novelty, clusters related signals into narratives, and
            generates actionable build ideas using AI. The entire process runs
            in under 5 minutes.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {[
              { step: "1", label: "Ingest", desc: "Fetch live signals", color: "text-emerald-400 bg-emerald-500/10" },
              { step: "2", label: "Score", desc: "Momentum + novelty", color: "text-sky-400 bg-sky-500/10" },
              { step: "3", label: "Cluster", desc: "Group narratives", color: "text-violet-400 bg-violet-500/10" },
              { step: "4", label: "Label", desc: "AI-powered naming", color: "text-amber-400 bg-amber-500/10" },
              { step: "5", label: "Generate", desc: "Build ideas", color: "text-primary bg-primary/10" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 sm:flex-col sm:text-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                  <span className="font-mono font-bold text-sm">{s.step}</span>
                </div>
                <div className="sm:mt-2">
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
                {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/20 hidden sm:block mx-auto mt-1" />}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="section-divider" />

      {/* Data Sources */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4 text-emerald-400" />
          <h2 className="text-base font-semibold">Data Sources</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Onchain */}
          <Card className="bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Onchain Activity</h3>
                <p className="text-[11px] text-muted-foreground">via Helius RPC</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[13px] text-muted-foreground">
              <p>Transaction volume per program (current vs baseline)</p>
              <p>Unique wallet estimation via transaction sampling</p>
              <p>New wallet share and retention heuristics</p>
              <p className="text-emerald-400 font-medium pt-1">47 tracked programs</p>
            </div>
          </Card>

          {/* Dev Activity */}
          <Card className="bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
                <GitBranch className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Developer Activity</h3>
                <p className="text-[11px] text-muted-foreground">via GitHub API</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[13px] text-muted-foreground">
              <p>Commit velocity (current vs baseline period)</p>
              <p>Star growth and fork counts</p>
              <p>New contributor detection and release tracking</p>
              <p className="text-sky-400 font-medium pt-1">47 tracked repositories</p>
            </div>
          </Card>

          {/* Twitter/X */}
          <Card className="bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                <Twitter className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Twitter / X KOL Signals</h3>
                <p className="text-[11px] text-muted-foreground">via public RSS proxies</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[13px] text-muted-foreground">
              <p>Core team: Toly, Raj Gokal, Solana Labs, Foundation</p>
              <p>Protocol founders: Mert, Meow, Cindy, Lucas</p>
              <p>VCs and research: Multicoin, a16z, Paradigm, Messari</p>
              <p className="text-violet-400 font-medium pt-1">91 KOL accounts monitored</p>
            </div>
          </Card>

          {/* RSS / News */}
          <Card className="bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Globe className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">News and RSS Feeds</h3>
                <p className="text-[11px] text-muted-foreground">public RSS/Atom feeds</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[13px] text-muted-foreground">
              <p>Solana blog, The Block, CoinTelegraph, CoinDesk</p>
              <p>Decrypt, Blockworks, Messari</p>
              <p>Protocol-specific mention matching</p>
              <p className="text-amber-400 font-medium pt-1">8 RSS feeds per cycle</p>
            </div>
          </Card>
        </div>
      </section>

      <div className="section-divider" />

      {/* Scoring */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <h2 className="text-base font-semibold">Scoring Formula</h2>
        </div>
        <Card className="bg-card/50 p-6 space-y-5">
          <p className="text-[13px] text-muted-foreground">
            Each protocol is scored across three dimensions, then combined with
            novelty and quality adjustments.
          </p>

          <div className="rounded-lg bg-black/20 border border-border/15 p-5 font-mono text-sm space-y-2 overflow-x-auto">
            <div className="text-muted-foreground/50 text-xs">{"// Z-score: measures change from baseline"}</div>
            <div>z(metric) = (current - baseline) / max(baseline, 1) <span className="text-muted-foreground/40 text-xs">{"// clamped [-5, 5]"}</span></div>
            <div className="h-3" />
            <div className="text-muted-foreground/50 text-xs">{"// Momentum: weighted signal combination"}</div>
            <div>momentum = <span className="text-emerald-400">0.70</span> x onchain_z + <span className="text-sky-400">0.50</span> x dev_z + <span className="text-amber-400">0.35</span> x social_z</div>
            <div className="h-3" />
            <div className="text-muted-foreground/50 text-xs">{"// Novelty: recency bonus"}</div>
            <div>novelty = lerp(<span className="text-violet-400">1.3</span>, 1.0, age_days / 60)</div>
            <div className="h-3" />
            <div className="text-muted-foreground/50 text-xs">{"// Quality penalties"}</div>
            <div>single_wallet_spike = <span className="text-red-400">0.6x</span></div>
            <div>hype_only_social = <span className="text-red-400">0.7x</span></div>
            <div className="h-3" />
            <div className="text-primary font-semibold">totalScore = momentum x novelty x quality</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/4 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-emerald-400">70%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Onchain weight</div>
            </div>
            <div className="rounded-lg border border-sky-500/15 bg-sky-500/4 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-sky-400">50%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Dev activity</div>
            </div>
            <div className="rounded-lg border border-amber-500/15 bg-amber-500/4 p-4 text-center">
              <div className="text-2xl font-bold data-highlight text-amber-400">35%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Social weight</div>
            </div>
          </div>
        </Card>
      </section>

      <div className="section-divider" />

      {/* Clustering */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center gap-2.5">
          <Layers className="h-4 w-4 text-violet-400" />
          <h2 className="text-base font-semibold">Narrative Clustering</h2>
        </div>
        <Card className="bg-card/50 p-6 space-y-4">
          <p className="text-[13px] text-muted-foreground">
            Top-scoring candidates are grouped into narratives using
            agglomerative clustering with cosine similarity on text embeddings.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { title: "Text Embeddings", desc: "384-dimensional character trigram hashing — deterministic, no external API dependency" },
              { title: "Average Linkage", desc: "Merge clusters above 0.45 cosine similarity threshold until max 10 clusters" },
              { title: "AI Labeling", desc: "Kimi K2 analyzes each cluster to generate narrative title and summary" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border/15 bg-white/[0.015] p-4">
                <div className="text-sm font-semibold mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="section-divider" />

      {/* Saturation */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center gap-2.5">
          <Target className="h-4 w-4 text-amber-400" />
          <h2 className="text-base font-semibold">Saturation Analysis</h2>
        </div>
        <Card className="bg-card/50 p-6">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Each build idea is checked against a corpus of 150+ existing Solana
            projects to estimate market saturation. Cosine similarity between
            the idea description and existing project descriptions determines
            the saturation level: low (unique opportunity), medium (some
            competition), or high (crowded space). This helps founders focus on
            underserved areas.
          </p>
        </Card>
      </section>

      <div className="section-divider" />

      {/* AI Integration */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "480ms" }}>
        <div className="flex items-center gap-2.5">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">AI-Powered Analysis</h2>
        </div>
        <Card className="bg-card/50 p-6 space-y-4">
          <p className="text-[13px] text-muted-foreground">
            Kimi K2 (Moonshot AI) powers three key analytical steps with structured JSON
            outputs validated by Zod schemas.
          </p>
          <div className="space-y-3">
            {[
              { step: "1", title: "Narrative Labeling", desc: "Descriptive titles and one-paragraph summaries for each detected narrative cluster" },
              { step: "2", title: "Build Idea Generation", desc: "3-5 concrete product ideas per narrative with pitch, rationale, competitive landscape, and difficulty estimates" },
              { step: "3", title: "Action Pack Generation", desc: "Downloadable spec.md, tech.md, milestones.md, and deps.json for each idea" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <span className="font-mono text-[10px] font-bold text-primary">{item.step}</span>
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

      <div className="section-divider" />

      {/* Tracked Protocols */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "560ms" }}>
        <h2 className="text-base font-semibold">Tracked Protocols (47)</h2>
        <Card className="bg-card/50 p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[13px] sm:grid-cols-3 md:grid-cols-4">
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
              <div key={name} className="text-muted-foreground py-0.5">
                {name}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Schedule */}
      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "640ms" }}>
        <h2 className="text-base font-semibold">Refresh Schedule</h2>
        <Card className="bg-card/50 p-6">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Reports are generated automatically on the 1st and 15th of each
            month via GitHub Actions cron. The pipeline can also be triggered
            manually via the admin API endpoint.
          </p>
        </Card>
      </section>
    </div>
  );
}
