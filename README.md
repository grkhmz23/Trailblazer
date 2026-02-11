# Solana Narrative Hunter

AI-powered fortnightly narrative detection for the Solana ecosystem. An autonomous agent that ingests onchain, developer, social, and **Twitter/X KOL signals** — runs deep investigations with explainable tool traces — clusters findings into emerging narratives — and generates actionable build ideas with downloadable Action Packs.

**Live:** [trailblazer-web.vercel.app](https://trailblazer-web.vercel.app)

---

## Data Sources

| Source | What It Monitors | Access Method |
|---|---|---|
| **Solana Onchain** | Transaction volume, wallet growth, retention per program | Helius RPC (47 programs) |
| **GitHub Dev Activity** | Commits, stars, contributors, releases per repo | GitHub API v3 (47 repos) |
| **Twitter / X KOLs** | Posts from 91 Solana ecosystem KOLs across 6 tiers | Nitter RSS proxies |
| **News / RSS** | 8 feeds: Solana blog, The Block, CoinTelegraph, CoinDesk, Decrypt, Blockworks, Messari | Public RSS/Atom feeds |

### Twitter/X KOL Tracking (91 Accounts)

The tool monitors **91 Solana ecosystem Key Opinion Leaders** across six tiers:

- **Core Team:** Toly (Solana co-founder), Raj Gokal, Solana Labs, Solana Foundation
- **Protocol Founders:** Mert (Helius), Meow (Jupiter), Cindy Leow (Drift), Lucas Bruder (Jito), Yutaro (Orca)
- **VC & Research:** Multicoin Capital, a16z Crypto, Paradigm, Pantera, Dragonfly, Electric Capital, Messari
- **Dev Advocates:** Superteam, Solana Devs, Lightspeed Podcast, Armani Ferrante
- **Mega Influencers:** Elon Musk, CZ, Vitalik, Brian Armstrong, Balaji
- **CT Alpha:** Ansem, Inversebrah, ZachXBT, Ash Crypto, SolBigBrain, CryptoCobain

Tweets are filtered for Solana relevance using 80+ keywords, classified by type (announcement, alpha, analysis, hype, pain_point), and merged with RSS signals. KOL mentions are weighted 3× higher than RSS mentions.

### Tracked Protocols (47)

**DeFi:** Jupiter, Jupiter Perpetuals, Drift, Raydium, Orca, Phoenix, Marginfi, Kamino, Zeta Markets, Flash Trade, Meteora, Ondo Finance, DFlow
**LST:** Marinade Finance, Jito, Sanctum, BlazeStake
**Infrastructure:** Light Protocol, Squads, Clockwork, Switchboard, Helius, Backpack, Phantom, Solana Mobile
**Oracle:** Pyth Network
**NFT:** Tensor, Metaplex, Magic Eden
**Bridge:** Wormhole
**DePIN:** Helium, Render Network, Hivemapper
**Memecoin Infra:** Bonk, Dogwifhat, Moonshot, Pump.fun
**AI:** Robot AI
**Payments:** Sphere Pay, PYUSD
**Social:** Dialect, Access Protocol
**Gaming:** Star Atlas, Genopets
**DAO:** Realms, Meta DAO, Parcl

---

## How Signals Are Detected and Ranked

### 1. Ingestion
Every fortnight, live data is fetched from all sources. For each of 47 tracked protocols, we collect:
- **Onchain**: transaction counts and unique wallet estimates (current period vs. baseline period)
- **Dev**: commit velocity, star growth, new contributors, releases
- **Social**: KOL tweet mentions (91 accounts), RSS article mentions (8 feeds), engagement scores

### 2. Scoring (Momentum + Novelty − Quality Penalty)

Each metric is converted to a z-score: `z = (current − baseline) / baseline`

**Momentum** = weighted sum across all z-scores:
- Onchain signals: **70% weight** (tx_count, wallets, new_wallet_share, retention)
- Dev signals: **50% weight** (commits, stars, new_contributors, releases)
- Social signals: **35% weight** (mentions, unique_authors, engagement)

**Novelty** bonus: 1.3× for brand new protocols, decaying linearly to 1.0× over 60 days.

**Quality** penalties:
- Single-wallet spike (txs up, wallets flat): **0.6×** — detects bots/wash trading
- Hype-only social (>80% hype snippets): **0.7×** — filters noise

**Total Score** = `momentum × novelty × quality`

### 3. Clustering
Top 20 candidates are clustered using agglomerative clustering with cosine similarity on text embeddings (384-dim character trigram hashing). Average linkage, 0.45 threshold, max 10 clusters.

### 4. AI-Powered Labeling & Idea Generation
Kimi K2 (Moonshot AI) analyzes each cluster to generate:
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

# Push schema + generate client
pnpm --filter web prisma:push
pnpm --filter web prisma:generate

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
| `MOONSHOT_API_KEY` | For live mode | Moonshot Kimi API key for narrative labeling |
| `MOONSHOT_MODEL` | No | Default: `kimi-k2-thinking-turbo` |
| `DEMO_MODE` | No | Default: `true` if no MOONSHOT_API_KEY |
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
│   ├── src/components/          # Bento grid UI with glassmorphism
│   ├── src/lib/
│   │   ├── config.ts            # Typed config loader
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── llm/                 # Moonshot Kimi K2 integration (OpenAI-compatible)
│   │   └── pipeline/
│   │       ├── index.ts         # Pipeline orchestrator
│   │       ├── scoring.ts       # Z-score momentum + novelty + quality
│   │       ├── clustering.ts    # Agglomerative clustering + saturation
│   │       ├── ingest.ts        # Signal ingestion orchestrator
│   │       ├── protocols.ts     # 47 tracked Solana protocols registry
│   │       └── ingestors/
│   │           ├── helius.ts    # Solana onchain via Helius RPC
│   │           ├── github.ts    # Dev activity via GitHub API v3
│   │           ├── social.ts    # 8 RSS/Atom news feeds
│   │           └── twitter.ts   # 91 Twitter/X KOLs via Nitter RSS
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
- **DePIN Expansion** — Helium, Render Network, and Hivemapper driving real-world infrastructure onto Solana
- **Memecoin Infrastructure Maturation** — Pump.fun, Moonshot, and Bonk evolving from meme tokens to ecosystem infrastructure

Each narrative includes 3-5 build ideas with detailed Action Packs.

---

## Build Ideas (Examples)

Each idea tied to a specific narrative:

1. **Perps Aggregator SDK** (DeFi Perpetuals) — Unified API across Jupiter Perps, Drift, and Zeta for best execution
2. **LST Yield Optimizer** (LST Wars) — Auto-rebalance between Marinade, Jito, Sanctum based on real-time APY
3. **ZK-Compressed NFT Marketplace** (ZK Compression) — First marketplace optimized for compressed NFTs with 99% lower mint costs
4. **DePIN Analytics Dashboard** (DePIN Expansion) — Real-time metrics for Helium, Render, Hivemapper coverage and utilization
5. **Memecoin Launchpad Toolkit** (Memecoin Infra) — Professional-grade tools for community token launches with anti-rug mechanics

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

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + pgvector (Neon)
- **LLM:** Moonshot Kimi K2 Thinking Turbo
- **Onchain:** Helius RPC
- **Styling:** Tailwind CSS with glassmorphism + bento grid layout
- **Fonts:** Outfit + JetBrains Mono
- **Deployment:** Vercel Pro

---

## License

MIT
