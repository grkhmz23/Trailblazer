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
} from "lucide-react";

export const dynamic = "force-static";

export default function MethodologyPage() {
  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-2 text-muted-foreground">
          How Narrative Hunter detects, scores, and surfaces emerging Solana
          ecosystem trends before they become obvious.
        </p>
      </div>

      {/* Pipeline Overview */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          Pipeline Overview
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every fortnight, Narrative Hunter runs an automated pipeline that
            ingests live data from multiple sources, scores each protocol on
            momentum and novelty, clusters related signals into narratives, and
            generates actionable build ideas using AI. The entire process runs
            in under 5 minutes.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
            {[
              { step: "1", label: "Ingest", desc: "Fetch live signals" },
              { step: "2", label: "Score", desc: "Momentum + novelty" },
              { step: "3", label: "Cluster", desc: "Group into narratives" },
              { step: "4", label: "Label", desc: "AI-powered naming" },
              { step: "5", label: "Generate", desc: "Build ideas + saturation" },
            ].map((s: any) => (
              <div
                key={s.step}
                className="rounded-md border border-border bg-background p-3 text-center"
              >
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {s.step}
                </div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Database className="h-5 w-5 text-primary" />
          Data Sources
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Onchain */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Onchain Activity</h3>
                <p className="text-xs text-muted-foreground">
                  via Helius RPC (Solana Mainnet)
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Transaction volume per program (current vs baseline)</li>
              <li>• Unique wallet estimation via transaction sampling</li>
              <li>• New wallet share and retention heuristics</li>
              <li>• 28+ tracked program addresses across DeFi, LST, NFT, infra</li>
            </ul>
          </div>

          {/* Dev Activity */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <GitBranch className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Developer Activity</h3>
                <p className="text-xs text-muted-foreground">
                  via GitHub API v3
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Commit velocity (current vs baseline period)</li>
              <li>• Star growth and fork counts</li>
              <li>• New contributor detection</li>
              <li>• Release tracking (non-prerelease only)</li>
              <li>• 30+ tracked repositories</li>
            </ul>
          </div>

          {/* Twitter/X */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                <Twitter className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold">Twitter / X KOL Signals</h3>
                <p className="text-xs text-muted-foreground">
                  via public RSS proxies
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Mert (Helius), Toly, Raj Gokal, Akshay — core KOLs</li>
              <li>• Messari, Electric Capital — research outlets</li>
              <li>• Protocol official accounts (Jupiter, Drift, etc.)</li>
              <li>• Sentiment classification: alpha, announcement, analysis, hype</li>
              <li>• Solana-relevance filtering via keyword matching</li>
            </ul>
          </div>

          {/* RSS / News */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Globe className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">News &amp; RSS Feeds</h3>
                <p className="text-xs text-muted-foreground">
                  public RSS/Atom feeds
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Solana official blog (solana.com/news)</li>
              <li>• The Block, CoinTelegraph — crypto news</li>
              <li>• Protocol-specific mention matching</li>
              <li>• Engagement scoring by content depth</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <TrendingUp className="h-5 w-5 text-primary" />
          Scoring Formula
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Each protocol is scored across three dimensions, then combined with
            novelty and quality adjustments.
          </p>

          <div className="rounded-md bg-background p-4 font-mono text-sm overflow-x-auto">
            <div className="text-muted-foreground">
              {"// Z-score: measures change from baseline"}
            </div>
            <div>
              z(metric) = (current - baseline) / max(baseline, 1){" "}
              <span className="text-muted-foreground">
                {"// clamped [-5, 5]"}
              </span>
            </div>
            <br />
            <div className="text-muted-foreground">
              {"// Momentum: weighted signal combination"}
            </div>
            <div>
              momentum = 0.70 × onchain_z + 0.50 × dev_z + 0.35 × social_z
            </div>
            <br />
            <div className="text-muted-foreground">
              {"// Novelty: recency bonus (newer = higher)"}
            </div>
            <div>
              novelty = lerp(1.3, 1.0, age_days / 60){" "}
              <span className="text-muted-foreground">
                {"// 1.3× for brand new, decays to 1.0×"}
              </span>
            </div>
            <br />
            <div className="text-muted-foreground">
              {"// Quality penalties"}
            </div>
            <div>
              single_wallet_spike → 0.6×{" "}
              <span className="text-muted-foreground">
                {"// Wash trading detection"}
              </span>
            </div>
            <div>
              hype_only_social → 0.7×{" "}
              <span className="text-muted-foreground">
                {"// No substance behind mentions"}
              </span>
            </div>
            <br />
            <div className="text-primary font-semibold">
              totalScore = momentum × novelty × quality
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border border-green-500/20 bg-green-500/5 p-3">
              <div className="text-lg font-bold text-green-400">70%</div>
              <div className="text-xs text-muted-foreground">
                Onchain weight
              </div>
            </div>
            <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="text-lg font-bold text-blue-400">50%</div>
              <div className="text-xs text-muted-foreground">
                Dev activity weight
              </div>
            </div>
            <div className="rounded-md border border-orange-500/20 bg-orange-500/5 p-3">
              <div className="text-lg font-bold text-orange-400">35%</div>
              <div className="text-xs text-muted-foreground">
                Social weight
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clustering */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Layers className="h-5 w-5 text-primary" />
          Narrative Clustering
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Top-scoring candidates are grouped into narratives using
            agglomerative clustering with cosine similarity on text embeddings.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-sm font-medium">Text Embeddings</div>
              <div className="mt-1 text-xs text-muted-foreground">
                384-dimensional character trigram hashing — deterministic, no
                external API dependency
              </div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-sm font-medium">Average Linkage</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Merge clusters above 0.45 cosine similarity threshold until
                max 10 clusters
              </div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-sm font-medium">AI Labeling</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Claude Sonnet analyzes each cluster to generate narrative title
                and summary
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saturation */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Target className="h-5 w-5 text-primary" />
          Saturation Analysis
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each build idea is checked against a corpus of 150+ existing Solana
            projects to estimate market saturation. Cosine similarity between
            the idea description and existing project descriptions determines
            the saturation level: low (unique opportunity), medium (some
            competition), or high (crowded space). This helps founders focus on
            underserved areas.
          </p>
        </div>
      </section>

      {/* AI Integration */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Analysis
        </h2>
        <div className="rounded-lg border border-border bg-card/50 p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Claude Sonnet powers three key analytical steps with structured JSON
            outputs validated by Zod schemas:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                1
              </div>
              <div>
                <div className="text-sm font-medium">Narrative Labeling</div>
                <div className="text-xs text-muted-foreground">
                  Generates descriptive titles and one-paragraph summaries for
                  each detected narrative cluster
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </div>
              <div>
                <div className="text-sm font-medium">Build Idea Generation</div>
                <div className="text-xs text-muted-foreground">
                  Creates 3–5 concrete product ideas per narrative with pitch,
                  rationale, competitive landscape, and difficulty estimates
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                3
              </div>
              <div>
                <div className="text-sm font-medium">Action Pack Generation</div>
                <div className="text-xs text-muted-foreground">
                  Downloadable spec.md, tech.md, milestones.md, and deps.json
                  for each idea — ready to start building
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocols Tracked */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tracked Protocols (31)</h2>
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4">
            {[
              "Jupiter",
              "Jupiter Perpetuals",
              "Drift Protocol",
              "Raydium",
              "Orca (Whirlpool)",
              "Phoenix",
              "Marginfi",
              "Kamino Finance",
              "Zeta Markets",
              "Flash Trade",
              "Marinade Finance",
              "Jito",
              "Sanctum",
              "BlazeStake",
              "Light Protocol",
              "Squads Protocol",
              "Clockwork",
              "Switchboard",
              "Pyth Network",
              "Tensor",
              "Metaplex",
              "Wormhole",
              "Dialect",
              "Sphere Pay",
              "Realms",
              "Star Atlas",
              "Pump.fun",
              "Meteora",
              "Helium",
              "Parcl",
              "Access Protocol",
            ].map((name: any) => (
              <div key={name} className="text-muted-foreground py-0.5">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Refresh Schedule</h2>
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <p className="text-sm text-muted-foreground">
            Reports are generated automatically on the 1st and 15th of each
            month via GitHub Actions cron. The pipeline can also be triggered
            manually via the admin API endpoint.
          </p>
        </div>
      </section>
    </div>
  );
}
