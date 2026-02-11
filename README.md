# Solana Narrative Hunter

AI-powered fortnightly narrative detection for the Solana ecosystem. An autonomous agent that ingests onchain, developer, and social signals — runs deep investigations with explainable tool traces — clusters findings into emerging narratives — and generates actionable build ideas with downloadable Action Packs.

---

## Quick Start (Local)

```bash
# Clone and install
git clone https://github.com/your-org/solana-narrative-hunter.git
cd solana-narrative-hunter
pnpm install

# Start PostgreSQL (with pgvector)
pnpm db:up

# Push schema + generate client + seed demo data
pnpm db:push
pnpm db:generate
pnpm seed:demo

# Launch dashboard
pnpm dev
# → Open http://localhost:3000
```

**One command:** `pnpm setup` runs all of the above in sequence.

---

## Deploy to Vercel

### 1. Provision Database

Use [Neon](https://neon.tech) (recommended) or any Postgres provider:

1. Create a new Neon project
2. Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Copy the connection string

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From repo root:
vercel
```

Or connect via Vercel Dashboard:
1. Import the GitHub repo
2. Vercel auto-detects the monorepo via `vercel.json`
3. Root directory: `.` (repo root)
4. Framework: Next.js (auto-detected)

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon/Postgres connection string |
| `ADMIN_TOKEN` | ✅ | Secret token for admin API endpoints |
| `ANTHROPIC_API_KEY` | For live mode | Claude API key for narrative labeling |
| `ANTHROPIC_MODEL` | No | Default: `claude-sonnet-4-20250514` |
| `DEMO_MODE` | No | Default: `true` if no ANTHROPIC_API_KEY |
| `HELIUS_API_KEY` | No | For live onchain signal ingestion |
| `GITHUB_TOKEN` | No | For live dev activity signals |

### 4. Push Schema & Seed

```bash
# From local machine with DATABASE_URL pointed at Neon:
DATABASE_URL="your-neon-url" pnpm --filter web prisma:push
DATABASE_URL="your-neon-url" pnpm --filter web seed
```

### 5. Trigger First Report

```bash
curl -X POST https://your-app.vercel.app/api/admin/run-fortnight \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Schedule Recurring Reports

**Option A: GitHub Actions** (recommended)

Set these GitHub Secrets:
- `VERCEL_DEPLOYMENT_URL` — your Vercel URL (e.g., `https://your-app.vercel.app`)
- `ADMIN_TOKEN` — same token as in Vercel env

The workflow in `.github/workflows/fortnight.yml` runs on the 1st and 15th of each month.

**Option B: Vercel Cron**

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/admin/run-fortnight",
    "schedule": "0 6 1,15 * *"
  }]
}
```
Note: Vercel Cron requires Pro plan and the endpoint must handle auth via a shared secret.

---

## Architecture

```
solana-narrative-hunter/
├── apps/web/              # Next.js 14 dashboard + API routes
│   ├── src/app/           # Pages: /, /reports, /narratives/[id], /explore
│   ├── src/components/    # UI: NarrativeCard, InvestigationTrace, IdeaCard, etc.
│   ├── src/lib/           # Core libraries:
│   │   ├── config.ts      # Typed config loader
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── llm/           # Anthropic Claude integration + demo fallback
│   │   └── pipeline/      # Node.js lite worker (Vercel-compatible)
│   │       ├── index.ts   # Pipeline orchestrator
│   │       ├── scoring.ts # Z-score + momentum + novelty + quality
│   │       ├── clustering.ts # Agglomerative clustering + saturation
│   │       └── ingest.ts  # Signal ingestion from fixtures/APIs
│   ├── prisma/            # Schema (PostgreSQL + pgvector)
│   └── scripts/seed.ts    # Demo data seeder
├── worker/                # Python agent pipeline (local dev only)
├── packages/shared/       # Shared TypeScript types
├── fixtures/              # Demo signals, embeddings, project corpus
├── docker-compose.yml     # PostgreSQL + pgvector (local dev)
├── vercel.json            # Vercel deployment config
└── .github/workflows/     # Scheduled fortnightly runs
```

### Two Worker Paths

| Path | Environment | Description |
|---|---|---|
| **Node.js Lite** (`apps/web/src/lib/pipeline/`) | Vercel, any Node.js host | Runs in-process via API route. No Python needed. |
| **Python Full** (`worker/run_fortnight.py`) | Local dev, GitHub Actions with Docker | Full HDBSCAN clustering, sentence-transformers embeddings. |

The Node.js lite pipeline uses agglomerative clustering with cosine similarity — no native dependencies.

### Data Flow

```
Signals (onchain + dev + social)
  ↓
Scoring (z-scores → momentum + novelty − quality_penalty)
  ↓
Top K Selection
  ↓
Clustering (agglomerative or HDBSCAN)
  ↓
Narrative Labeling (Claude LLM or demo fallback)
  ↓
Idea Generation (3-5 per narrative)
  ↓
Action Packs (spec.md, tech.md, milestones.md, deps.json)
  ↓
Saturation Check (cosine similarity vs 150-project corpus)
  ↓
Persist to DB + Dashboard
```

---

## Scoring Formula

### Momentum Score
Weighted sum of z-score deltas across three signal categories:

**Onchain** (70% weight): `z_tx_count(0.25) + z_unique_wallets(0.20) + z_new_wallet_share(0.15) + z_retention(0.10)`

**Dev** (50% weight): `z_commits(0.20) + z_stars_delta(0.15) + z_new_contributors(0.10) + z_releases(0.05)`

**Social** (35% weight): `z_mentions_delta(0.15) + z_unique_authors(0.10) + z_engagement_delta(0.10)`

### Novelty Bonus
Linear decay from 1.3× to 1.0× over 60 days since `first_seen`.

### Quality Penalty
- Single-wallet spike (txs up, wallets flat): 0.6× penalty
- Hype-only social (>80% hype snippets): 0.7× penalty

### Total Score
`(momentum × novelty_multiplier) × quality_penalty`

---

## Clustering

The Node.js pipeline uses **agglomerative clustering** with average-linkage and cosine similarity:
1. Compute pairwise cosine similarity between candidate embeddings
2. Iteratively merge most similar clusters above threshold (0.45)
3. Stop at max_clusters (10) or when no pair exceeds threshold

The Python pipeline uses **HDBSCAN** for density-based clustering with similar semantics.

---

## Demo Mode

When no API keys are set (or `DEMO_MODE=true`), the system:
- Loads signals from `fixtures/demo_signals.json` (20 entities)
- Uses precomputed embeddings from `fixtures/demo_embeddings.json`
- Generates narratives with template-based labels (no LLM call)
- Checks saturation against `fixtures/projects.json` (150 Solana projects)

The dashboard is fully functional in demo mode — all features work.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reports/latest` | — | Latest completed report with narratives |
| GET | `/api/reports` | — | All reports |
| GET | `/api/reports/:id` | — | Report detail |
| GET | `/api/narratives/:id` | — | Narrative with evidence + ideas |
| GET | `/api/ideas/:id/action-pack.zip` | — | Download Action Pack as zip |
| GET | `/api/explore?q=...` | — | Search entities + narratives |
| POST | `/api/admin/run-fortnight` | Bearer token | Trigger pipeline (rate-limited) |

---

## Commands

```bash
pnpm setup              # Full setup: install + DB + migrate + seed
pnpm dev                # Start dev server
pnpm build              # Production build
pnpm lint               # ESLint
pnpm typecheck          # TypeScript check
pnpm seed:demo          # Seed demo report
pnpm db:up              # Start PostgreSQL container
pnpm db:push            # Push Prisma schema
pnpm db:generate        # Generate Prisma client
pnpm worker:run         # Run Python pipeline (local)
```

---

## Data Sources & ToS Compliance

| Source | Access Method | Notes |
|---|---|---|
| Solana onchain | Helius API (optional) | Requires API key; free tier available |
| GitHub | Public API | Unauthenticated: 60 req/hr; with token: 5000 req/hr |
| RSS/Blogs | Public feeds | No auth needed |
| Reddit | Public API | Rate-limited; optional OAuth for higher limits |
| Discord | **NOT scraped** unless user provides bot token + channel allowlist |
| X/Twitter | Official API only (optional) | Bearer token required |

All data collection respects rate limits with exponential backoff.
