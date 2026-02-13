# Trailblazer — Solana Narrative Hunter

AI-powered fortnightly narrative detection for the Solana ecosystem. An autonomous agent that ingests onchain, developer, social, and Twitter/X KOL signals — runs deep investigations with explainable tool traces — clusters findings into emerging narratives — and generates actionable build ideas with downloadable Action Packs.

**Live:** [trailblazeragent.fun](https://trailblazeragent.fun)

---

## Data Sources

| Source | What It Monitors | Access Method |
|---|---|---|
| **Solana Onchain** | Transaction volume, wallet growth, retention per program | Helius RPC (47 programs) |
| **GitHub Dev Activity** | Commits, stars, contributors, releases per repo | GitHub API v3 (47 repos) |
| **Twitter / X KOLs** | Posts from 90 Solana ecosystem KOLs across 6 tiers | Nitter RSS proxies (opt-in) |
| **News / RSS** | 4 feeds: Solana blog, The Block, CoinDesk, Blockworks | Public RSS/Atom feeds |

### Twitter/X KOL Tracking (90 Accounts)

The tool monitors **90 Solana ecosystem Key Opinion Leaders** across six tiers:

- **Core Team:** Toly (Solana co-founder), Raj Gokal, Solana Labs, Solana Foundation
- **Protocol Founders:** Mert (Helius), Meow (Jupiter), Cindy Leow (Drift), Lucas Bruder (Jito), Yutaro (Orca)
- **VC & Research:** Multicoin Capital, a16z Crypto, Paradigm, Pantera, Dragonfly, Electric Capital, Messari
- **Dev Advocates:** Superteam, Solana Devs, Lightspeed Podcast, Armani Ferrante
- **Mega Influencers:** Elon Musk, CZ, Vitalik, Brian Armstrong, Balaji
- **CT Alpha:** Ansem, Inversebrah, ZachXBT, Ash Crypto, SolBigBrain, CryptoCobain

Tweets are filtered for Solana relevance using 80+ keywords, classified by type (announcement, alpha, analysis, hype, pain_point), and merged with RSS signals. KOL mentions are weighted 3x higher than RSS mentions.

> **Note:** Twitter/X ingestion uses Nitter RSS proxies which may be unreliable. If no working Nitter instance is available, the pipeline continues with RSS/blog sources only. For production use, consider integrating a paid Twitter API or [SocialData.tools](https://socialdata.tools).

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
- **Social**: KOL tweet mentions (90 accounts), RSS article mentions (4 feeds), engagement scores

### 2. Scoring (Momentum + Novelty - Quality Penalty)

Each metric is converted to a z-score: `z = (current - baseline) / max(baseline, 0.001)`

**Momentum** = weighted sum across all z-scores:
- Onchain signals: **70% weight** (tx_count, wallets, new_wallet_share, retention)
- Dev signals: **50% weight** (commits, stars, new_contributors, releases)
- Social signals: **35% weight** (mentions, unique_authors, engagement)

**Novelty** bonus: 1.3x for brand new protocols, decaying linearly to 1.0x over 60 days.

**Quality** penalties:
- Single-wallet spike (txs up, wallets flat): **0.6x** — detects bots/wash trading
- Hype-only social (>80% hype snippets): **0.7x** — filters noise

**Total Score** = `momentum * novelty * quality`

### 3. Clustering
Top 20 candidates are clustered using agglomerative clustering with cosine similarity on text embeddings. Average linkage, **0.4 threshold**, max 10 clusters.

### 4. AI-Powered Labeling & Idea Generation
Kimi K2 (Moonshot AI) analyzes each cluster to generate:
- Narrative title and one-paragraph summary
- 3-5 concrete build ideas with pitch, target user, MVP scope, and rationale
- Downloadable Action Packs (spec.md, tech.md, milestones.md, deps.json)

### 5. Saturation Check
Each idea is compared against 150+ existing Solana projects via cosine similarity to flag market saturation (low / medium / high).

---

## Quick Start (Local)

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- PostgreSQL database (e.g. [Neon](https://neon.tech) free tier)

### Setup
```bash
git clone https://github.com/grkhmz23/Trailblazer.git
cd Trailblazer
pnpm install

# Copy env template and fill in your values
cp .env.example apps/web/.env

# Push schema to your database
pnpm --filter web prisma:push
pnpm --filter web prisma:generate

# Launch dashboard
pnpm dev
# -> Open http://localhost:3000
```

### Run the Pipeline Locally
```bash
# Full pipeline run (requires MOONSHOT_API_KEY + HELIUS_API_KEY)
pnpm --filter web pipeline:run

# Dry run with demo data (no API keys needed)
pnpm --filter web pipeline:run:dry

# Custom date range
pnpm --filter web pipeline:run -- --start 2025-01-01 --end 2025-01-14
```

---

## Self-Hosting Guide

Want to run Trailblazer for your own ecosystem monitoring? Here's the full setup:

### 1. Provision Database
Use [Neon](https://neon.tech) (recommended) or any PostgreSQL provider.

### 2. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_TOKEN` | Yes | Secret for admin API (set a strong random value) |
| `MOONSHOT_API_KEY` | For live mode | [Moonshot AI](https://platform.moonshot.cn) API key |
| `MOONSHOT_MODEL` | No | Default: `kimi-k2-thinking-turbo` |
| `HELIUS_API_KEY` | No | [Helius](https://helius.dev) API key for onchain data |
| `GITHUB_TOKEN` | No | GitHub PAT for higher API rate limits |
| `NEXT_PUBLIC_SITE_URL` | No | Your deployment URL (for OG images) |
| `DEMO_MODE` | No | `true` to use fixture data instead of live APIs |

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Push database schema
DATABASE_URL="your-neon-url" pnpm --filter web prisma:push
```

### 4. Trigger a Pipeline Run
```bash
# Via admin API
curl -X POST https://your-app.vercel.app/api/admin/run-fortnight \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Or use GitHub Actions (runs automatically via pipeline.yml)
```

### 5. Scheduled Reports
The GitHub Actions workflow (`.github/workflows/pipeline.yml`) can be triggered manually via `workflow_dispatch` with optional date range parameters. Set up a cron schedule by adding:
```yaml
on:
  schedule:
    - cron: '0 6 1,15 * *'  # 1st and 15th of each month
```

### 6. Customizing Protocols
Edit `apps/web/src/lib/pipeline/protocols.ts` to add/remove tracked protocols. Each entry needs:
- `key`: Unique identifier
- `label`: Display name
- `kind`: Category (defi, lst, infra, etc.)
- `programIds`: Solana program addresses (for onchain data)
- `github`: GitHub org/repo (for dev activity)

### 7. Customizing KOLs
Edit `apps/web/src/lib/pipeline/ingestors/twitter.ts` to add/remove tracked Twitter accounts. Each entry needs:
- `handle`: Twitter username (without @)
- `label`: Display name
- `category`: One of: core_team, protocol_founder, vc_research, dev_advocate, mega_influencer, ct_alpha

---

## Architecture
```
Trailblazer/
+-- apps/web/                    # Next.js 14 dashboard + API routes
|   +-- src/app/                 # Pages: /, /reports, /narratives/[id], /explore, /methodology
|   +-- src/components/          # Bento grid UI with glassmorphism
|   +-- src/lib/
|   |   +-- config.ts            # Typed config loader
|   |   +-- prisma.ts            # Prisma client singleton
|   |   +-- rate-limit.ts        # In-memory API rate limiter
|   |   +-- llm/
|   |   |   +-- moonshot.ts      # Moonshot Kimi K2 integration (OpenAI-compatible)
|   |   |   +-- schemas.ts       # Zod schemas for LLM output
|   |   +-- pipeline/
|   |       +-- index.ts         # Pipeline orchestrator (idempotent, crash-safe)
|   |       +-- scoring.ts       # Z-score momentum + novelty + quality
|   |       +-- clustering.ts    # Agglomerative clustering + saturation
|   |       +-- ingest.ts        # Signal ingestion orchestrator
|   |       +-- protocols.ts     # 47 tracked Solana protocols registry
|   |       +-- ingestors/
|   |           +-- helius.ts    # Solana onchain via Helius RPC
|   |           +-- github.ts    # Dev activity via GitHub API v3
|   |           +-- social.ts    # RSS/Atom news feeds
|   |           +-- twitter.ts   # Twitter/X KOLs via Nitter RSS (opt-in)
|   +-- prisma/                  # Schema (PostgreSQL)
+-- fixtures/                    # Demo signals, embeddings, project corpus
+-- archive/                     # Archived code (Python worker, old scripts)
+-- .github/workflows/
    +-- pipeline.yml             # Pipeline dispatch (manual + schedulable)
    +-- ci.yml                   # Quality gate: lint + typecheck + build
```

---

## Security

- **Security headers**: CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Rate limiting**: In-memory token bucket on all public API routes (429 on abuse)
- **Input validation**: Query length limits, wildcard escaping on search
- **Error boundaries**: Global error/loading/not-found pages (no white screen crashes)
- **Pipeline safety**: Idempotent report upserts, crash-safe with automatic "failed" status marking
- **CI gate**: Lint + typecheck + build on every PR and push to main
- **Admin auth**: Bearer token required for pipeline trigger endpoint

---

## API Reference

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| GET | `/api/reports/latest` | -- | 60/min | Latest report with narratives |
| GET | `/api/reports` | -- | 60/min | All reports |
| GET | `/api/narratives/:id` | -- | -- | Narrative detail + evidence + ideas |
| GET | `/api/ideas/:id/action-pack.zip` | -- | -- | Download Action Pack |
| GET | `/api/explore?q=...` | -- | 30/min | Search entities + narratives (max 80 chars) |
| POST | `/api/admin/run-fortnight` | Bearer | -- | Trigger pipeline |

---

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 5
- **LLM:** Moonshot Kimi K2 Thinking Turbo
- **Onchain:** Helius RPC
- **Styling:** Tailwind CSS with glassmorphism + bento grid layout
- **Fonts:** Outfit + JetBrains Mono
- **CI/CD:** GitHub Actions + Vercel
- **Deployment:** Vercel

---

## License

MIT
