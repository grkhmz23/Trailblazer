# Solana Narrative Hunter

AI-powered fortnightly narrative detection for the Solana ecosystem. An autonomous agent that ingests onchain, developer, social, and **Twitter/X KOL signals** — runs deep investigations with explainable tool traces — clusters findings into emerging narratives — and generates actionable build ideas with downloadable Action Packs.

**Live:** [trailblazer-ruby.vercel.app](https://trailblazer-ruby.vercel.app)

---

## Data Sources

| Source | What It Monitors | Access Method |
|---|---|---|
| **Solana Onchain** | Transaction volume, wallet growth, retention per program | Helius RPC (28+ programs) |
| **GitHub Dev Activity** | Commits, stars, contributors, releases per repo | GitHub API v3 (30+ repos) |
| **Twitter / X KOLs** | Posts from Mert, Toly, Raj, Akshay, Messari, Electric Capital, and 15+ accounts | Nitter RSS proxies |
| **News / RSS** | Solana blog, The Block, CoinTelegraph, ecosystem aggregators | Public RSS/Atom feeds |

### Twitter/X KOL Tracking

The tool monitors **15+ Solana ecosystem Key Opinion Leaders** including:

- **Core KOLs:** Mert (0xMert_ / Helius CEO), Toly (aeyakovenko / Solana co-founder), Raj Gokal, Akshay Sriram
- **Research Outlets:** Messari, Electric Capital
- **Protocol Accounts:** Jupiter, Drift, Helius, SolBlaze, Tensor, Marginfi

Tweets are filtered for Solana relevance, classified by type (announcement, alpha, analysis, hype, pain_point), and merged with RSS signals to produce a unified social signal per protocol. KOL mentions are weighted 3× higher than RSS mentions.

---

## How Signals Are Detected and Ranked

### 1. Ingestion
Every fortnight, live data is fetched from all sources. For each of 31 tracked protocols, we collect:
- **Onchain**: transaction counts and unique wallet estimates (current period vs. baseline period)
- **Dev**: commit velocity, star growth, new contributors, releases
- **Social**: KOL tweet mentions, RSS article mentions, engagement scores

### 2. Scoring (Momentum + Novelty − Quality Penalty)

Each metric is converted to a z-score: `z = (current − baseline) / baseline`

**Momentum** = weighted sum across all z-scores:
- Onchain signals: 70% weight (tx_count, wallets, new_wallet_share, retention)
- Dev signals: 50% weight (commits, stars, new_contributors, releases)
- Social signals: 35% weight (mentions, unique_authors, engagement)

**Novelty** bonus: 1.3× for brand new protocols, decaying linearly to 1.0× over 60 days.

**Quality** penalties:
- Single-wallet spike (txs up, wallets flat): 0.6× — detects bots/wash trading
- Hype-only social (>80% hype snippets): 0.7× — filters noise

**Total Score** = `momentum × novelty × quality`

### 3. Clustering
Top 20 candidates are clustered using agglomerative clustering with cosine similarity on text embeddings (384-dim character trigram hashing). Average linkage, 0.45 threshold, max 10 clusters.

### 4. AI-Powered Labeling & Idea Generation
Claude Sonnet analyzes each cluster to generate:
- Narrative title and one-paragraph summary
- 3–5 concrete build ideas with pitch, target user, MVP scope, and rationale
- Downloadable Action Packs (spec.md, tech.md, milestones.md, deps.json)

### 5. Saturation Check
Each idea is compared against 150+ existing Solana projects via cosine similarity to flag market saturation (low / medium / high).

---

## Quick Start (Local)

```bash
git clone https://github.com/grkhmz23/Trailblazer.git
cd Trailblazer
pnpm install

# Start PostgreSQL (with pgvector)
pnpm db:up

# Push schema + generate client + seed demo data
pnpm db:push && pnpm db:generate && pnpm seed:demo

# Launch dashboard
pnpm dev
# → Open http://localhost:3000
```

---

## Deploy to Vercel

### 1. Provision Database
Use [Neon](https://neon.tech) (recommended) or any Postgres provider with pgvector.

### 2. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon/Postgres connection string |
| `ADMIN_TOKEN` | ✅ | Secret token for admin API endpoints |
| `ANTHROPIC_API_KEY` | For live mode | Claude API key for narrative labeling |
| `ANTHROPIC_MODEL` | No | Default: `claude-sonnet-4-20250514` |
| `DEMO_MODE` | No | Default: `true` if no ANTHROPIC_API_KEY |
| `HELIUS_API_KEY` | No | For live onchain signal ingestion |
| `HELIUS_RPC_URL` | No | Helius RPC endpoint |
| `GITHUB_TOKEN` | No | For higher GitHub API rate limits |

### 3. Push Schema & Trigger

```bash
DATABASE_URL="your-neon-url" pnpm --filter web prisma:push

curl -X POST https://your-app.vercel.app/api/admin/run-fortnight \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Scheduled Reports
GitHub Actions workflow (`.github/workflows/fortnight.yml`) runs on the 1st and 15th of each month.

---

## Architecture

```
Trailblazer/
├── apps/web/                    # Next.js 14 dashboard + API routes
│   ├── src/app/                 # Pages: /, /reports, /narratives/[id], /explore, /methodology
│   ├── src/components/          # UI components
│   ├── src/lib/
│   │   ├── config.ts            # Typed config loader
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── llm/                 # Anthropic Claude integration
│   │   └── pipeline/
│   │       ├── index.ts         # Pipeline orchestrator
│   │       ├── scoring.ts       # Z-score momentum + novelty + quality
│   │       ├── clustering.ts    # Agglomerative clustering + saturation
│   │       ├── ingest.ts        # Signal ingestion orchestrator
│   │       ├── protocols.ts     # 31 tracked Solana protocols registry
│   │       └── ingestors/
│   │           ├── helius.ts    # Solana onchain via Helius RPC
│   │           ├── github.ts    # Dev activity via GitHub API v3
│   │           ├── social.ts    # RSS/Atom news feeds
│   │           └── twitter.ts   # Twitter/X KOL monitoring via Nitter
│   └── prisma/                  # Schema (PostgreSQL + pgvector)
├── fixtures/                    # Demo signals, embeddings, project corpus
└── .github/workflows/           # Scheduled fortnightly runs
```

---

## Detected Narratives (Sample Output)

Each pipeline run produces narratives like:

- **DeFi Perpetuals Renaissance** — Jupiter Perpetuals, Drift, and Zeta show 2-3× transaction growth as Solana becomes the preferred chain for on-chain derivatives trading
- **LST Wars Heat Up** — Marinade, Jito, and Sanctum competing for liquid staking dominance with restaking narratives emerging
- **ZK Compression Infrastructure** — Light Protocol adoption accelerating as developers discover 1000× storage cost reduction

Each narrative includes 3-5 build ideas with detailed Action Packs.

---

## Build Ideas (Examples)

Each idea tied to a specific narrative:

1. **Perps Aggregator SDK** (tied to DeFi Perpetuals) — Unified API across Jupiter Perps, Drift, and Zeta for best execution
2. **LST Yield Optimizer** (tied to LST Wars) — Auto-rebalance between Marinade, Jito, Sanctum based on real-time APY
3. **ZK-Compressed NFT Marketplace** (tied to ZK Compression) — First marketplace optimized for compressed NFTs with 99% lower mint costs

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reports/latest` | — | Latest report with narratives |
| GET | `/api/reports` | — | All reports |
| GET | `/api/narratives/:id` | — | Narrative detail + evidence + ideas |
| GET | `/api/ideas/:id/action-pack.zip` | — | Download Action Pack |
| GET | `/api/explore?q=...` | — | Search entities + narratives |
| POST | `/api/admin/run-fortnight` | Bearer | Trigger pipeline |

---

## License

MIT
