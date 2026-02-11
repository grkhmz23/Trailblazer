#!/usr/bin/env python3
"""
Solana Narrative Hunter — Fortnightly Report Pipeline

Orchestrates: signal ingestion → scoring → investigation → clustering
              → narrative generation → idea generation → action packs
              → saturation checks → DB persistence → JSON export.

Usage:
    python3 run_fortnight.py                  # default: last 14 days
    python3 run_fortnight.py --start 2025-01-01 --end 2025-01-15
"""

import argparse
import hashlib
import json
import logging
import os
import sys
import traceback
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure worker/ is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import (
    DEMO_MODE, HAS_LLM, ANTHROPIC_API_KEY,
    TOP_K, MAX_NARRATIVES, IDEAS_PER_NARRATIVE,
    FIXTURES_DIR, REPORTS_OUTPUT_DIR, ROOT_DIR,
    default_period, load_fixture,
)
from scoring import (
    compute_onchain_features, compute_dev_features, compute_social_features,
    compute_momentum, compute_novelty, compute_quality_penalty,
    compute_total_score, normalize_scores,
)
from clustering import cluster_candidates, compute_saturation
from tools import (
    repo_inspector, idl_differ, dependency_tracker,
    social_pain_finder, competitor_search, ToolResult,
)
import db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("pipeline")


# ═══════════════════════════════════════════════════════════
# LLM helpers (with demo fallbacks)
# ═══════════════════════════════════════════════════════════

def _llm_call(system: str, user: str, max_tokens: int = 2048) -> str:
    """Call Anthropic Claude API. Returns raw text response."""
    if not HAS_LLM:
        return ""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        resp = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return resp.content[0].text
    except Exception as e:
        log.warning(f"LLM call failed: {e}")
        return ""


def _llm_json(system: str, user: str, max_tokens: int = 4096) -> dict | list | None:
    """Call LLM expecting JSON response. Returns parsed JSON or None."""
    raw = _llm_call(system, user, max_tokens)
    if not raw:
        return None
    # Strip markdown code fences if present
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        log.warning("LLM returned non-JSON response")
        return None


# ═══════════════════════════════════════════════════════════
# Step 1: Signal Ingestion
# ═══════════════════════════════════════════════════════════

def ingest_signals() -> list[dict]:
    """Load signals from fixtures (demo) or live APIs."""
    log.info("Step 1: Ingesting signals...")

    if DEMO_MODE:
        signals = load_fixture("demo_signals.json")
        log.info(f"  Loaded {len(signals)} demo signals")
        return signals

    # Live mode: would fetch from Helius, GitHub, social APIs
    # For now, live mode still uses demo signals as scaffold
    log.warning("  Live API ingestion not configured — falling back to demo signals")
    return load_fixture("demo_signals.json")


# ═══════════════════════════════════════════════════════════
# Step 2: Compute Features & Scores
# ═══════════════════════════════════════════════════════════

def score_signals(signals: list[dict]) -> list[dict]:
    """Compute momentum, novelty, quality for each signal."""
    log.info("Step 2: Computing scores...")

    scored = []
    for sig in signals:
        onchain = compute_onchain_features(sig.get("onchain", {}))
        dev_f = compute_dev_features(sig.get("dev", {}))
        social_f = compute_social_features(sig.get("social", {}))

        features = {**onchain, **dev_f, **social_f}
        momentum = compute_momentum(features)
        novelty = compute_novelty(sig.get("first_seen", datetime.now(timezone.utc).isoformat()))
        quality = compute_quality_penalty(features, sig.get("social", {}).get("snippets", []))
        total = compute_total_score(momentum, novelty, quality)

        scored.append({
            "signal": sig,
            "features": features,
            "momentum": momentum,
            "novelty": novelty,
            "quality": quality,
            "total_score": total,
        })

    # Normalize scores to [0, 1]
    totals = [s["total_score"] for s in scored]
    normed = normalize_scores(totals)
    for i, s in enumerate(scored):
        s["normalized_score"] = normed[i]

    scored.sort(key=lambda x: x["total_score"], reverse=True)
    log.info(f"  Scored {len(scored)} signals. Top: {scored[0]['signal']['label']} ({scored[0]['total_score']:.3f})")
    return scored


# ═══════════════════════════════════════════════════════════
# Step 3: Select Top K Candidates
# ═══════════════════════════════════════════════════════════

def select_top_k(scored: list[dict], k: int = TOP_K) -> list[dict]:
    """Select top K candidates for investigation."""
    log.info(f"Step 3: Selecting top {k} candidates...")
    top = scored[:k]
    log.info(f"  Selected: {[s['signal']['label'] for s in top]}")
    return top


# ═══════════════════════════════════════════════════════════
# Step 4: Run Investigation Tools
# ═══════════════════════════════════════════════════════════

def investigate_candidates(candidates: list[dict]) -> list[dict]:
    """Run investigation tools on each candidate."""
    log.info("Step 4: Running investigations...")

    for i, cand in enumerate(candidates):
        sig = cand["signal"]
        key = sig["key"]
        label = sig["label"]
        snippets = sig.get("social", {}).get("snippets", [])

        log.info(f"  [{i+1}/{len(candidates)}] Investigating: {label}")

        results: list[ToolResult] = []

        # Tool 1: Repo inspector
        r1 = repo_inspector(key, label)
        results.append(r1)
        log.info(f"    repo_inspector: {len(r1.output_summary)} chars")

        # Tool 2: IDL differ
        r2 = idl_differ(key, label)
        results.append(r2)
        log.info(f"    idl_differ: {len(r2.output_summary)} chars")

        # Tool 3: Dependency tracker
        r3 = dependency_tracker(key, label)
        results.append(r3)
        log.info(f"    dependency_tracker: {len(r3.output_summary)} chars")

        # Tool 4: Social pain finder
        r4 = social_pain_finder(key, label, snippets=snippets)
        results.append(r4)
        log.info(f"    social_pain_finder: {len(r4.output_summary)} chars")

        cand["investigation_results"] = results

    return candidates


# ═══════════════════════════════════════════════════════════
# Step 5: Load Embeddings & Cluster
# ═══════════════════════════════════════════════════════════

def load_embeddings() -> dict[str, list[float]]:
    """Load precomputed embeddings for demo mode."""
    try:
        return load_fixture("demo_embeddings.json")
    except FileNotFoundError:
        log.warning("No demo embeddings found")
        return {}


def load_corpus() -> tuple[dict[str, list[float]], dict[str, dict]]:
    """Load project corpus and embeddings for saturation checks."""
    try:
        projects = load_fixture("projects.json")
        corpus_emb = load_fixture("projects_embeddings.json")
    except FileNotFoundError:
        return {}, {}

    meta = {}
    for p in projects:
        meta[p["name"]] = {"url": p.get("url", ""), "description": p.get("description", "")}

    return corpus_emb, meta


def cluster_into_narratives(
    candidates: list[dict],
    embeddings: dict[str, list[float]],
) -> list[dict]:
    """Cluster candidates into narrative groups."""
    log.info("Step 5: Clustering candidates into narratives...")

    # Build embedding matrix
    emb_list = []
    labels = []
    for cand in candidates:
        key = cand["signal"]["key"]
        if key in embeddings:
            emb_list.append(embeddings[key])
        else:
            # Use a zero vector as fallback
            dim = len(next(iter(embeddings.values()))) if embeddings else 384
            emb_list.append([0.0] * dim)
        labels.append(cand["signal"]["label"])

    clusters = cluster_candidates(emb_list, labels, min_cluster_size=2)
    log.info(f"  Found {len(clusters)} clusters")

    # Limit to MAX_NARRATIVES
    clusters = clusters[:MAX_NARRATIVES]

    narrative_groups = []
    for cl in clusters:
        members = [candidates[i] for i in cl["member_indices"]]
        narrative_groups.append({
            "cluster_id": cl["cluster_id"],
            "member_labels": cl["member_labels"],
            "members": members,
        })

    return narrative_groups


# ═══════════════════════════════════════════════════════════
# Step 6: Generate Narrative Summaries
# ═══════════════════════════════════════════════════════════

# Pre-built demo narratives for when LLM is unavailable
DEMO_NARRATIVES = [
    {
        "title": "ZK Compression & State Cost Revolution",
        "summary": "Light Protocol's ZK compression is driving a fundamental shift in Solana's state economics. With 1000x cost reduction for token accounts, we're seeing rapid SDK adoption across major DeFi protocols. The compression primitives are enabling new application patterns previously impossible due to state rent costs — from mass airdrops to on-chain order books with millions of entries.",
    },
    {
        "title": "Perpetual DEX Infrastructure War",
        "summary": "Jupiter Perps V2 and competing protocols are racing to build next-gen perpetual futures infrastructure on Solana. New IDL additions for partial fills, TP/SL orders, and batch PnL settlement signal a maturing derivatives layer. SDK adoption is surging among trading bots and aggregators, with 120% growth in Jupiter's perps SDK imports.",
    },
    {
        "title": "LST Unification & Yield Layer",
        "summary": "Sanctum's Infinity Pool is creating a unified liquidity layer for all Solana LSTs, enabling instant swaps between any staking derivative. This is catalyzing a yield aggregation narrative, with 15 new protocol integrations in the tracked period. The permissionless LST onboarding mechanism is particularly significant for long-tail validators.",
    },
    {
        "title": "Validator Client Diversification",
        "summary": "Firedancer's Frankendancer hybrid client is showing 50%+ TPS improvements on testnet, accelerating Solana's path to multi-client diversity. The C-based implementation from Jump Crypto represents a critical infrastructure milestone. QUIC transport optimizations and new block scheduling algorithms are being closely watched by the validator community.",
    },
    {
        "title": "Token Extensions & Programmable Assets",
        "summary": "SPL Token-2022 adoption is accelerating with 89% growth in crate imports. Transfer hooks and confidential transfers are being integrated by major DeFi protocols, enabling compliant RWA tokenization and programmable transfer restrictions. This is creating new design space for institutional-grade on-chain assets.",
    },
    {
        "title": "Solana DePIN Infrastructure Growth",
        "summary": "IoTeX and Helium's expansion on Solana is driving a DePIN infrastructure narrative. New device onboarding patterns, token-incentivized sensor networks, and decentralized connectivity protocols are seeing strong developer interest. The integration with compressed state (via Light Protocol) is reducing per-device state costs significantly.",
    },
    {
        "title": "On-Chain Governance Tooling Renaissance",
        "summary": "Squads Protocol's multisig improvements and new governance primitives are attracting protocol DAOs migrating from Ethereum. The seat delegation mechanism in Phoenix's market maker infrastructure shows how governance is being embedded directly into DeFi protocol operations, not just treasury management.",
    },
]


def generate_narrative_summaries(narrative_groups: list[dict]) -> list[dict]:
    """Generate title + summary for each narrative cluster."""
    log.info("Step 6: Generating narrative summaries...")

    for i, group in enumerate(narrative_groups):
        # Build evidence text from investigation results
        evidence_text = ""
        for member in group["members"]:
            evidence_text += f"\n--- {member['signal']['label']} ---\n"
            for result in member.get("investigation_results", []):
                evidence_text += f"[{result.tool}] {result.output_summary}\n"

        if HAS_LLM:
            system = (
                "You are a crypto/Solana ecosystem analyst. Generate a narrative title and summary "
                "for a cluster of related signals. Return ONLY valid JSON with keys: "
                '"title" (string, 5-10 words), "summary" (string, 2-4 sentences, technical and specific).'
            )
            user = (
                f"Signals in this cluster:\n"
                f"Members: {', '.join(group['member_labels'])}\n\n"
                f"Evidence:\n{evidence_text[:3000]}"
            )
            result = _llm_json(system, user)
            if result and "title" in result:
                group["title"] = result["title"]
                group["summary"] = result["summary"]
                continue

        # Demo fallback
        if i < len(DEMO_NARRATIVES):
            group["title"] = DEMO_NARRATIVES[i]["title"]
            group["summary"] = DEMO_NARRATIVES[i]["summary"]
        else:
            group["title"] = f"Emerging Narrative: {', '.join(group['member_labels'][:2])}"
            group["summary"] = (
                f"A cluster of {len(group['members'])} related signals showing "
                f"correlated momentum across {', '.join(group['member_labels'])}. "
                "Further investigation recommended to validate the narrative thesis."
            )

    return narrative_groups


# ═══════════════════════════════════════════════════════════
# Step 7: Generate Build Ideas + Action Packs
# ═══════════════════════════════════════════════════════════

DEMO_IDEAS = {
    "ZK Compression & State Cost Revolution": [
        {
            "title": "CompressedDEX — Order Book with Millions of Entries",
            "pitch": "Build a fully on-chain CLOB DEX using ZK compressed state to store millions of orders at negligible cost. Current on-chain order books are limited by state rent — compressed accounts remove this bottleneck entirely.",
            "target_user": "DeFi traders seeking Binance-level order book depth with on-chain settlement guarantees",
            "mvp_scope": "Compressed limit order book for SOL/USDC with place, cancel, and match operations using Light Protocol SDK",
            "why_now": "Light SDK adoption just hit critical mass (340% growth). Compressed token primitives now stable enough for production.",
            "validation": "Pain points from social analysis confirm demand for deeper on-chain liquidity. 15+ DeFi protocols already importing Light SDK.",
        },
        {
            "title": "AirDrop Engine — Million-Recipient Token Distribution",
            "pitch": "Token distribution platform that uses ZK compression to airdrop to 1M+ wallets in a single transaction batch at <$100 total cost. Current airdrops cost $10K+ for large distributions.",
            "target_user": "Token projects, DAOs, and protocols running community reward programs",
            "mvp_scope": "Web UI for CSV upload of recipients + compressed token mint and batch distribution via Light Protocol",
            "why_now": "Compressed token accounts reduce per-recipient cost from ~0.002 SOL to ~0.000002 SOL. Game-changing economics.",
            "validation": "Multiple social mentions of airdrop cost complaints. Tensor and Jupiter recent airdrops exceeded $50K in state rent.",
        },
        {
            "title": "StateZip — Developer Tooling for ZK State Migration",
            "pitch": "CLI + SDK that helps existing Solana protocols migrate their on-chain state to ZK compressed accounts. Handles schema mapping, migration scripts, and dual-read compatibility during transition.",
            "target_user": "Solana protocol developers looking to reduce state costs without rewriting programs",
            "mvp_scope": "CLI tool that analyzes a Solana program's account structures and generates Light Protocol migration code",
            "why_now": "The compression primitives are stable but migration tooling is nonexistent. First-mover advantage in developer experience.",
            "validation": "GitHub issues on Light Protocol repo show developer confusion about integration patterns. Clear tooling gap.",
        },
    ],
    "Perpetual DEX Infrastructure War": [
        {
            "title": "PerpAggregator — Best Execution Across Solana Perp Venues",
            "pitch": "Aggregation layer that routes perpetual futures orders across Jupiter, Drift, and Phoenix to find best execution. Like Jupiter's swap aggregator but for leveraged positions.",
            "target_user": "Active perp traders managing positions across multiple Solana venues",
            "mvp_scope": "Smart routing for perp market orders across Jupiter Perps and Drift with best-price guarantee",
            "why_now": "Multiple perp venues now have sufficient liquidity. No aggregator exists yet — fragmented execution is a known pain point.",
            "validation": "Social analysis shows traders complaining about checking multiple UIs. Jupiter SDK adoption suggests integrator demand.",
        },
        {
            "title": "RiskDash — Real-Time Perp Portfolio Risk Monitor",
            "pitch": "Dashboard + alerting system for perp traders showing real-time PnL, liquidation distances, funding rate exposure, and cross-venue portfolio risk metrics.",
            "target_user": "Professional and semi-pro perp traders managing multi-position portfolios",
            "mvp_scope": "Read-only dashboard pulling positions from Jupiter Perps V2 and Drift with liquidation alerts via Telegram",
            "why_now": "New batch settlement and TP/SL features in Jupiter V2 indicate institutional-grade trading activity. Risk tooling hasn't kept pace.",
            "validation": "Pain point analysis found multiple requests for better position monitoring. Existing tools don't support new V2 features.",
        },
    ],
    "LST Unification & Yield Layer": [
        {
            "title": "YieldRouter — Automatic LST Yield Optimization",
            "pitch": "Automated vault that dynamically routes staked SOL between LST providers (Marinade, Jito, Lido, etc.) based on real-time yield, tracking Sanctum Infinity for instant rebalancing.",
            "target_user": "Passive SOL holders wanting maximum staking yield without manual management",
            "mvp_scope": "Vault contract that holds LSTs and rebalances weekly via Sanctum swaps based on trailing 7-day APY",
            "why_now": "Sanctum Infinity enables instant LST-to-LST swaps. Previously impossible to rebalance without significant slippage.",
            "validation": "15 new protocol integrations with Sanctum confirm ecosystem readiness. Yield differential between LSTs is 0.5-2% APY.",
        },
        {
            "title": "LST Index — Diversified Liquid Staking Token",
            "pitch": "Create an index token backed by a basket of Solana LSTs, providing diversified staking exposure and reducing single-provider risk. Uses Sanctum for composability.",
            "target_user": "DeFi protocols and institutional holders seeking diversified staking exposure",
            "mvp_scope": "SPL token backed by equal-weight basket of top 5 LSTs, mintable and redeemable via Sanctum routing",
            "why_now": "Permissionless LST onboarding in Sanctum means the LST landscape is expanding rapidly. Index products reduce selection risk.",
            "validation": "On Ethereum, LST indexes (like unshETH, diversified ETH) have attracted $100M+ TVL. No equivalent exists on Solana.",
        },
    ],
}


def _generate_action_pack(idea: dict, narrative_title: str) -> dict:
    """Generate Action Pack files for an idea (spec.md, tech.md, milestones.md, deps.json)."""
    title = idea["title"]
    pitch = idea["pitch"]
    target = idea.get("target_user", "Solana developers and users")
    mvp = idea.get("mvp_scope", "")
    why_now = idea.get("why_now", "")

    if HAS_LLM:
        system = (
            "You are a senior technical architect. Generate an Action Pack for a Solana project idea. "
            "Return ONLY valid JSON with these keys:\n"
            '- "spec_md": string (product spec in markdown, 300-500 words)\n'
            '- "tech_md": string (technical architecture in markdown, 300-500 words)\n'
            '- "milestones_md": string (4-6 milestones with timelines in markdown)\n'
            '- "deps_json": object (key dependencies with versions)\n'
        )
        user = (
            f"Narrative: {narrative_title}\n"
            f"Idea: {title}\n"
            f"Pitch: {pitch}\n"
            f"Target User: {target}\n"
            f"MVP Scope: {mvp}\n"
            f"Why Now: {why_now}"
        )
        result = _llm_json(system, user, max_tokens=4096)
        if result:
            return {
                "spec.md": result.get("spec_md", f"# {title}\n\n{pitch}"),
                "tech.md": result.get("tech_md", f"# Technical Plan\n\n{mvp}"),
                "milestones.md": result.get("milestones_md", "# Milestones\n\n1. MVP - 4 weeks"),
                "deps.json": json.dumps(result.get("deps_json", {}), indent=2),
            }

    # Demo fallback: generate structured but realistic action pack files
    spec_md = f"""# {title}

## Overview
{pitch}

## Target User
{target}

## Problem Statement
Current solutions in the Solana ecosystem are limited by state costs, fragmented liquidity, or lack of specialized tooling. {title} addresses this gap by providing a purpose-built solution that leverages recent protocol advancements.

## MVP Scope
{mvp}

## Key Features
1. **Core Engine**: Implements the primary value proposition with production-grade Solana program integration
2. **User Interface**: Clean web dashboard for monitoring and interaction
3. **API Layer**: REST + WebSocket APIs for programmatic access
4. **Alerting**: Configurable notifications via Telegram and webhooks

## Success Metrics
- 100+ active users within first month
- $1M+ in processed volume (if applicable)
- <500ms average response time
- 99.9% uptime SLA

## Why Now
{why_now}
"""

    tech_md = f"""# Technical Architecture — {title}

## Stack
- **On-chain**: Anchor framework (Rust) on Solana
- **Backend**: Node.js/TypeScript with Fastify
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: PostgreSQL + Redis for caching
- **Infrastructure**: Docker, deployed on Railway or Vercel

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend    │────▶│   API Layer  │────▶│   Solana RPC  │
│  (Next.js)   │     │  (Fastify)   │     │  (Helius)     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                     ┌─────▼─────┐
                     │ PostgreSQL │
                     │  + Redis   │
                     └───────────┘
```

## Key Technical Decisions
1. **Anchor for on-chain programs**: Type-safe Solana development with IDL generation
2. **Helius RPC + Enhanced Transactions**: Real-time transaction monitoring and historical data
3. **WebSocket subscriptions**: Live updates via Solana's accountSubscribe for position tracking
4. **Queue-based processing**: Bull queue for async operations (settlements, rebalancing)

## Security Considerations
- All program instructions validated with Anchor constraints
- Admin operations behind multisig (Squads Protocol)
- Rate limiting on all API endpoints
- Audit by reputable Solana security firm before mainnet
"""

    milestones_md = f"""# Milestones — {title}

## Phase 1: Foundation (Weeks 1-3)
- [ ] Set up monorepo with Anchor + Next.js
- [ ] Implement core Solana program with basic instructions
- [ ] Write comprehensive test suite (>90% coverage)
- [ ] Deploy to devnet

## Phase 2: MVP (Weeks 4-6)
- [ ] Build API layer with authentication
- [ ] Implement frontend dashboard
- [ ] Integrate with target protocols (Jupiter, Drift, etc.)
- [ ] Internal testing and bug fixes

## Phase 3: Beta (Weeks 7-9)
- [ ] Security audit
- [ ] Beta launch with 50 invited users
- [ ] Performance optimization based on feedback
- [ ] Monitoring and alerting setup

## Phase 4: Launch (Weeks 10-12)
- [ ] Mainnet deployment
- [ ] Public launch
- [ ] Documentation and developer guides
- [ ] Community building (Discord, Twitter)

## Phase 5: Growth (Weeks 13-16)
- [ ] Advanced features based on user feedback
- [ ] Partnership integrations
- [ ] Token/incentive program (if applicable)
- [ ] Mobile support
"""

    deps = {
        "@coral-xyz/anchor": "^0.30.0",
        "@solana/web3.js": "^1.91.0",
        "@solana/spl-token": "^0.4.0",
        "next": "14.2.x",
        "react": "^18.3.0",
        "typescript": "^5.4.0",
        "tailwindcss": "^3.4.0",
        "prisma": "^5.14.0",
        "@prisma/client": "^5.14.0",
    }

    return {
        "spec.md": spec_md,
        "tech.md": tech_md,
        "milestones.md": milestones_md,
        "deps.json": json.dumps(deps, indent=2),
    }


def generate_ideas_and_packs(
    narrative_groups: list[dict],
    corpus_embeddings: dict[str, list[float]],
    corpus_meta: dict[str, dict],
    entity_embeddings: dict[str, list[float]],
) -> list[dict]:
    """Generate build ideas and action packs for each narrative."""
    log.info("Step 7: Generating build ideas and action packs...")

    for group in narrative_groups:
        title = group.get("title", "Unknown Narrative")

        if HAS_LLM:
            evidence_text = ""
            for member in group["members"]:
                for result in member.get("investigation_results", []):
                    evidence_text += f"[{result.tool}] {result.output_summary}\n"

            system = (
                f"You are a Solana ecosystem product strategist. Generate {IDEAS_PER_NARRATIVE} build ideas "
                "for a narrative. Return ONLY valid JSON: an array of objects each with keys: "
                '"title", "pitch", "target_user", "mvp_scope", "why_now", "validation".'
            )
            user = (
                f"Narrative: {title}\n"
                f"Summary: {group.get('summary', '')}\n\n"
                f"Evidence:\n{evidence_text[:3000]}"
            )
            ideas_data = _llm_json(system, user)
            if isinstance(ideas_data, list):
                group["ideas"] = ideas_data[:IDEAS_PER_NARRATIVE]
            else:
                group["ideas"] = DEMO_IDEAS.get(title, _default_ideas(group))[:IDEAS_PER_NARRATIVE]
        else:
            group["ideas"] = DEMO_IDEAS.get(title, _default_ideas(group))[:IDEAS_PER_NARRATIVE]

        # Generate action packs + saturation for each idea
        for idea in group["ideas"]:
            idea["action_pack"] = _generate_action_pack(idea, title)

            # Saturation check
            # Use first member's embedding as proxy for idea embedding
            first_key = group["members"][0]["signal"]["key"] if group["members"] else None
            idea_emb = entity_embeddings.get(first_key, []) if first_key else []
            sat = compute_saturation(idea_emb, corpus_embeddings, corpus_meta)
            idea["saturation"] = sat

            if sat["level"] == "high":
                idea["pivot"] = (
                    f"Market is crowded ({sat['score']:.0%} avg similarity). "
                    f"Consider narrowing focus to an underserved niche or combining "
                    f"with another emerging primitive for differentiation."
                )
            else:
                idea["pivot"] = ""

        log.info(f"  {title}: {len(group['ideas'])} ideas generated")

    return narrative_groups


def _default_ideas(group: dict) -> list[dict]:
    """Generate generic ideas when no demo data matches."""
    labels = group.get("member_labels", ["Unknown"])
    return [
        {
            "title": f"{labels[0]} Analytics Dashboard",
            "pitch": f"Build a comprehensive analytics platform for {labels[0]} showing real-time metrics, historical trends, and ecosystem comparisons.",
            "target_user": "Developers, traders, and investors tracking Solana ecosystem trends",
            "mvp_scope": f"Dashboard showing key metrics for {labels[0]} with 30-day historical charts",
            "why_now": "Growing ecosystem activity creates demand for better monitoring tools.",
            "validation": "Multiple requests in developer forums for better analytics tooling.",
        },
        {
            "title": f"{labels[0]} SDK & Integration Layer",
            "pitch": f"Simplified SDK and developer tooling for building on top of {labels[0]}, reducing integration time from days to hours.",
            "target_user": "Solana developers integrating with the protocol",
            "mvp_scope": "TypeScript SDK with key operations, documentation, and example apps",
            "why_now": "Rapid protocol evolution means developers need stable abstraction layers.",
            "validation": "Dependency tracking shows growing adoption demand.",
        },
    ]


# ═══════════════════════════════════════════════════════════
# Step 8: Persist Everything to Database
# ═══════════════════════════════════════════════════════════

def persist_report(
    report_id: str,
    narrative_groups: list[dict],
    candidates: list[dict],
    entity_embeddings: dict[str, list[float]],
) -> None:
    """Save all data to the database."""
    log.info("Step 8: Persisting to database...")

    # Save entities and candidates
    for cand in candidates:
        sig = cand["signal"]
        emb = entity_embeddings.get(sig["key"], [])
        entity_id = db.upsert_entity(
            kind=sig.get("kind", "protocol"),
            key=sig["key"],
            label=sig["label"],
            first_seen=datetime.fromisoformat(
                sig.get("first_seen", datetime.now(timezone.utc).isoformat()).replace("Z", "+00:00")
            ),
            metrics_json={
                "onchain": sig.get("onchain", {}),
                "dev": sig.get("dev", {}),
                "social": {k: v for k, v in sig.get("social", {}).items() if k != "snippets"},
            },
            embedding=emb,
        )
        db.create_candidate(
            report_id=report_id,
            entity_id=entity_id,
            momentum=cand["momentum"],
            novelty=cand["novelty"],
            quality=cand["quality"],
            total_score=cand["total_score"],
            features_json=cand["features"],
        )

    # Save narratives, evidence, investigation steps, ideas
    for group in narrative_groups:
        # Compute narrative-level scores
        momentums = [m["momentum"] for m in group["members"]]
        novelties = [m["novelty"] for m in group["members"]]
        avg_momentum = sum(momentums) / len(momentums) if momentums else 0
        avg_novelty = sum(novelties) / len(novelties) if novelties else 0

        # Saturation: average of idea saturations
        idea_sats = [idea.get("saturation", {}).get("score", 0) for idea in group.get("ideas", [])]
        avg_saturation = sum(idea_sats) / len(idea_sats) if idea_sats else 0

        narrative_id = db.create_narrative(
            report_id=report_id,
            title=group.get("title", "Untitled Narrative"),
            summary=group.get("summary", ""),
            momentum=round(avg_momentum, 3),
            novelty=round(avg_novelty, 3),
            saturation=round(avg_saturation, 3),
            scores_json={
                "member_count": len(group["members"]),
                "member_labels": group.get("member_labels", []),
            },
        )

        # Investigation steps & evidence from all members
        step_index = 0
        for member in group["members"]:
            for result in member.get("investigation_results", []):
                db.create_investigation_step(
                    narrative_id=narrative_id,
                    step_index=step_index,
                    tool=result.tool,
                    input_json=result.input_json,
                    output_summary=result.output_summary,
                    links=result.evidence_links,
                )
                step_index += 1

                # Evidence items from tool results
                for ev in result.evidence_items:
                    db.create_evidence(
                        narrative_id=narrative_id,
                        ev_type=ev.get("type", "other"),
                        title=ev.get("title", ""),
                        url=ev.get("url", ""),
                        snippet=ev.get("snippet", ""),
                        metrics_json=ev.get("metrics_json", {}),
                    )

        # Ideas
        for idea in group.get("ideas", []):
            db.create_idea(
                narrative_id=narrative_id,
                title=idea.get("title", ""),
                pitch=idea.get("pitch", ""),
                target_user=idea.get("target_user", ""),
                mvp_scope=idea.get("mvp_scope", ""),
                why_now=idea.get("why_now", ""),
                validation=idea.get("validation", ""),
                saturation_json=idea.get("saturation", {}),
                pivot=idea.get("pivot", ""),
                action_pack_files_json=idea.get("action_pack", {}),
            )

    log.info(f"  Saved {len(narrative_groups)} narratives to DB")


# ═══════════════════════════════════════════════════════════
# Step 9: Export Report JSON
# ═══════════════════════════════════════════════════════════

def export_report_json(
    report_id: str,
    period_start: datetime,
    period_end: datetime,
    narrative_groups: list[dict],
) -> str:
    """Export report as JSON file for static hosting."""
    log.info("Step 9: Exporting report JSON...")

    REPORTS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    report_data = {
        "id": report_id,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "demo_mode": DEMO_MODE,
        "narratives": [],
    }

    for group in narrative_groups:
        narrative = {
            "title": group.get("title", ""),
            "summary": group.get("summary", ""),
            "member_labels": group.get("member_labels", []),
            "ideas": [
                {
                    "title": idea.get("title", ""),
                    "pitch": idea.get("pitch", ""),
                    "saturation": idea.get("saturation", {}),
                }
                for idea in group.get("ideas", [])
            ],
        }
        report_data["narratives"].append(narrative)

    output_path = REPORTS_OUTPUT_DIR / f"{report_id}.json"
    with open(output_path, "w") as f:
        json.dump(report_data, f, indent=2)

    log.info(f"  Exported to {output_path}")
    return str(output_path)


# ═══════════════════════════════════════════════════════════
# Main Pipeline
# ═══════════════════════════════════════════════════════════

def run_pipeline(period_start: datetime | None = None, period_end: datetime | None = None) -> str:
    """Execute the full fortnightly report pipeline. Returns report ID."""
    if period_start is None or period_end is None:
        period_start, period_end = default_period()

    log.info("=" * 60)
    log.info("Solana Narrative Hunter — Fortnightly Pipeline")
    log.info(f"Period: {period_start.date()} → {period_end.date()}")
    log.info(f"Mode: {'DEMO' if DEMO_MODE else 'LIVE'}")
    log.info(f"LLM: {'available' if HAS_LLM else 'demo fallback'}")
    log.info("=" * 60)

    # Create report record
    report_id = db.create_report(
        period_start=period_start,
        period_end=period_end,
        config_json={"demo_mode": DEMO_MODE, "top_k": TOP_K, "max_narratives": MAX_NARRATIVES},
    )
    log.info(f"Report ID: {report_id}")

    try:
        # Pipeline steps
        signals = ingest_signals()
        scored = score_signals(signals)
        candidates = select_top_k(scored)
        candidates = investigate_candidates(candidates)

        embeddings = load_embeddings()
        corpus_emb, corpus_meta = load_corpus()

        narrative_groups = cluster_into_narratives(candidates, embeddings)
        narrative_groups = generate_narrative_summaries(narrative_groups)
        narrative_groups = generate_ideas_and_packs(
            narrative_groups, corpus_emb, corpus_meta, embeddings,
        )

        persist_report(report_id, narrative_groups, candidates, embeddings)
        export_report_json(report_id, period_start, period_end, narrative_groups)

        db.update_report_status(report_id, "complete")
        log.info("=" * 60)
        log.info(f"Pipeline complete! Report: {report_id}")
        log.info("=" * 60)

    except Exception as e:
        log.error(f"Pipeline failed: {e}")
        traceback.print_exc()
        db.update_report_status(report_id, "failed")
        raise

    return report_id


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run fortnightly narrative detection pipeline")
    parser.add_argument("--start", type=str, help="Period start (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="Period end (YYYY-MM-DD)")
    args = parser.parse_args()

    start = datetime.fromisoformat(args.start).replace(tzinfo=timezone.utc) if args.start else None
    end = datetime.fromisoformat(args.end).replace(tzinfo=timezone.utc) if args.end else None

    run_pipeline(start, end)
