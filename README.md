# Solana Narrative Hunter

AI-powered fortnightly narrative detection for the Solana ecosystem. An autonomous agent that ingests onchain, developer, and social signals — runs deep investigations with explainable tool traces — clusters findings into emerging narratives — and generates actionable build ideas with downloadable Action Packs.

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/solana-narrative-hunter.git
cd solana-narrative-hunter
pnpm install

# Start PostgreSQL (with pgvector)
pnpm db:up

# Push schema + seed demo data
pnpm db:push
pnpm db:generate
pnpm seed:demo

# Launch dashboard
pnpm dev
# → Open http://localhost:3000
```

**One command setup:** `pnpm setup` runs all of the above in sequence.

---

## What It Does

Every two weeks, the Narrative Hunter agent:

1. **Ingests signals** from onchain transactions (Helius), GitHub activity, and public social sources (RSS, Reddit)
2. **Scores candidates** using z-score deltas for momentum, novelty bonuses for new entrants, and quality penalties for spam
3. **Investigates** each top candidate with five specialized tools, recording every step in an explainable trace
4. **Clusters** candidates into narrative groups using HDBSCAN on semantic embeddings
5. **Generates summaries** and 3–5 build ideas per narrative using Claude
6. **Validates markets** with Blue Ocean saturation checks against a 150-project corpus
7. **Produces Action Packs** (spec.md, tech.md, milestones.md, deps.json) downloadable as zip files

The result: a dashboard showing what's actually happening in Solana's developer ecosystem — not just what's trending on Twitter.

---

## Architecture

```
solana-narrative-hunter/
├── apps/web/              # Next.js 14 dashboard + API routes
│   ├── src/app/           # Pages: /, /reports, /narratives/[id], /explore
│   ├── src/components/    # UI: NarrativeCard, InvestigationTrace, IdeaCard, etc.
│   ├── src/lib/           # Prisma client, utilities
│   ├── prisma/            # Schema (PostgreSQL + pgvector)
│   └── scripts/seed.ts    # Demo data seeder
├── worker/                # Python agent pipeline
│   ├── run_fortnight.py   # Main pipeline orchestrator
│   ├── scoring.py         # Z-score + momentum + novelty + quality
│   ├── clustering.py      # HDBSCAN clustering + saturation scoring
│   ├── tools/             # 5 investigation tools
│   ├── db.py              # Database operations (psycopg2)
│   └── config.py          # Environment + constants
├── packages/shared/       # Shared TypeScript types
├── fixtures/              # Demo signals, embeddings, project corpus
├── docker-compose.yml     # PostgreSQL + pgvector
└── .github/workflows/     # Scheduled fortnightly runs
```

### Data Flow

```
Signals (onchain + dev + social)
  ↓
Scoring (z-scores → momentum + novelty − quality_penalty)
  ↓
Top K Selection
  ↓
Investigation (5 tools × K candidates → InvestigationSteps)
  ↓
Clustering (HDBSCAN on embeddings → narrative groups)
  ↓
LLM Generation (title + summary + ideas + action packs)
  ↓
Saturation Check (cosine similarity to 150-project corpus)
  ↓
Database + JSON Export + Dashboard
```

---

## Scoring Formula

### Momentum Score

Weighted sum of z-score features across three signal dimensions:

| Metric | Weight | Source |
|--------|--------|--------|
| z_tx_count | 0.25 | Onchain |
| z_unique_wallets | 0.20 | Onchain |
| z_new_wallet_share | 0.15 | Onchain |
| z_retention | 0.10 | Onchain |
| z_commits | 0.20 | Dev |
| z_stars_delta | 0.15 | Dev |
| z_new_contributors | 0.10 | Dev |
| z_releases | 0.05 | Dev |
| z_mentions_delta | 0.15 | Social |
| z_unique_authors | 0.10 | Social |
| z_engagement_delta | 0.10 | Social |

Z-scores are clamped to [-5, 5] to prevent outlier domination:

```
z_metric = (current - baseline) / max(baseline, ε)
momentum = Σ(weight_i × clamp(z_i, -5, 5))
```

### Novelty Bonus

Linear decay over 60 days from first observation:

```
novelty = 1.3 × max(0, 1 - age_days / 60)
```

### Quality Penalty

Multiplied (not added) to detect noise:

- **Single-wallet spike**: If z_new_wallet_share > 2.0 AND z_retention < 0.0 → penalty × 0.5
- **Hype-only social**: If hype snippets > 80% of total → penalty × 0.5

```
total_score = max(0, (momentum + novelty) × quality_penalty)
```

---

## Investigation Tools

Each tool writes an `InvestigationStep` record with: tool name, input JSON, output summary, and evidence links.

| Tool | Purpose | Live Source | Demo Mode |
|------|---------|-------------|-----------|
| `repo_inspector` | README, commits, releases, stars/forks | GitHub API | Pre-built summaries |
| `idl_differ` | Semantic diff of IDL/interface changes | Git tag diff | Demo diffs for tracked protocols |
| `dependency_tracker` | Crate/package adoption acceleration | Cargo.toml / package.json analysis | Pre-built adoption data |
| `social_pain_finder` | Classify snippets: pain/question/hype/announcement | RSS + Reddit | Demo from signal fixtures |
| `competitor_search` | Blue Ocean saturation check | Cosine similarity to corpus | Same (works with demo embeddings) |

---

## Clustering

Candidates are embedded (384-dim sentence-transformers, or precomputed in demo mode) and clustered using **HDBSCAN** (with DBSCAN fallback):

- Metric: cosine distance
- `min_cluster_size`: 2
- Noise points become singleton clusters
- Each cluster becomes a narrative

### Saturation Scoring

For each build idea, the system finds the top-3 nearest neighbors in the 150-project ecosystem corpus:

- **Low** (avg similarity < 0.45): Blue Ocean — few competitors
- **Medium** (0.45–0.75): Active space — differentiation needed
- **High** (> 0.75): Crowded — pivot suggestion generated

---

## Dashboard

### Routes

| Route | Description |
|-------|-------------|
| `/` | Latest fortnight report with narrative cards |
| `/reports` | All reports list |
| `/reports/[id]` | Report detail with narrative breakdown |
| `/narratives/[id]` | Full narrative page: summary, scores, investigation trace, evidence, build ideas |
| `/explore` | Search entities and narratives |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/latest` | Latest completed report |
| GET | `/api/reports` | All reports |
| GET | `/api/reports/:id` | Report detail |
| GET | `/api/narratives/:id` | Narrative with evidence + ideas |
| GET | `/api/ideas/:id/action-pack.zip` | Download Action Pack as zip |
| GET | `/api/explore?q=keyword` | Search entities + narratives |
| POST | `/api/admin/run-fortnight` | Trigger worker (requires `ADMIN_TOKEN`) |

---

## Demo Mode

Runs fully without external API keys. When `DEMO_MODE=true` (or no keys are set):

- Loads `fixtures/demo_signals.json` (20 entities with realistic onchain/dev/social metrics)
- Uses `fixtures/demo_embeddings.json` (precomputed 384-dim vectors)
- Investigation tools return pre-built summaries
- LLM generation falls back to curated demo narratives and ideas

The `pnpm seed:demo` command populates the database with a complete demo report, so the dashboard is never empty on first visit.

---

## Production Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL="postgresql://hunter:hunter@localhost:5433/narrative_hunter"

# Optional — enables live mode
ANTHROPIC_API_KEY=sk-ant-...      # Claude for summaries + ideas
HELIUS_API_KEY=...                 # Solana onchain data
GITHUB_TOKEN=ghp_...              # GitHub API (higher rate limits)
OPENAI_API_KEY=sk-...             # Embeddings (or use sentence-transformers)

# Security
ADMIN_TOKEN=your-secret-token     # Protects /api/admin/run-fortnight
```

### Running the Worker

```bash
# Manual run (last 14 days)
pnpm worker:run

# Custom period
cd worker && python3 run_fortnight.py --start 2025-01-01 --end 2025-01-15
```

### Scheduled Runs (GitHub Actions)

The `.github/workflows/fortnight.yml` runs on the 1st and 15th of each month. Configure these secrets in your GitHub repository:

- `DATABASE_URL` — Production Postgres URL
- `ANTHROPIC_API_KEY` — Claude API key
- `HELIUS_API_KEY` — Helius API key
- `GH_PAT` — GitHub personal access token

---

## Data Sources & Terms of Service

| Source | Access Method | ToS Notes |
|--------|--------------|-----------|
| GitHub | REST API v3 | Public repos, respects rate limits (60/hr unauthenticated, 5000/hr with token) |
| Helius | Enhanced Transactions API | Requires API key, pay-per-use |
| Reddit | Public web (no API key needed) | Public subreddit data only |
| RSS/Blogs | Standard RSS feeds | Public content |
| X/Twitter | Official API v2 only | Only if `TWITTER_BEARER_TOKEN` provided |
| Discord | Bot API only | Only if `DISCORD_BOT_TOKEN` + channel allowlist provided |

**No scraping of private or rate-limited endpoints.** The system degrades gracefully: if a source is unavailable, it falls back to demo data or skips that signal dimension.

---

## Database Schema

```
Report ─┬── Candidate ──── Entity
        └── Narrative ─┬── NarrativeEvidence
                       ├── InvestigationStep
                       └── Idea (with action_pack_files_json)
```

See `apps/web/prisma/schema.prisma` for the complete schema. Embeddings are stored as `Float[]` columns (pgvector is available via raw SQL for similarity queries).

---

## Development

```bash
# Install all dependencies
pnpm install

# Start database
pnpm db:up

# Apply schema changes
pnpm db:push

# Run in development
pnpm dev

# Run worker pipeline
pnpm worker:run

# Format code
pnpm format
```

### Python Worker

```bash
cd worker
pip install -r requirements.txt
python3 run_fortnight.py
```

---

## License

MIT
