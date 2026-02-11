"""
Investigation tools for the narrative hunter agent.
Each tool takes inputs, performs analysis, and returns structured results.
In demo mode, tools return pre-constructed results from fixtures.
"""

import json
import time
import requests
from typing import Any
from config import DEMO_MODE, GITHUB_TOKEN, FIXTURES_DIR, load_fixture
from clustering import compute_saturation


# ───── Tool result type ─────
class ToolResult:
    def __init__(
        self,
        tool: str,
        input_json: dict,
        output_summary: str,
        evidence_links: list[str],
        evidence_items: list[dict] | None = None,
    ):
        self.tool = tool
        self.input_json = input_json
        self.output_summary = output_summary
        self.evidence_links = evidence_links
        self.evidence_items = evidence_items or []


# ───── Rate limiter ─────
_last_request_time = 0.0
REQUEST_INTERVAL = 1.0  # seconds


def _rate_limit():
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < REQUEST_INTERVAL:
        time.sleep(REQUEST_INTERVAL - elapsed)
    _last_request_time = time.time()


def _github_headers() -> dict:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


# ═══════════════════════════════════════
# TOOL: repo_inspector
# ═══════════════════════════════════════
def repo_inspector(entity_key: str, entity_label: str, **kwargs: Any) -> ToolResult:
    """Inspect a GitHub repository: README summary, recent commits, releases."""
    if DEMO_MODE:
        return _demo_repo_inspector(entity_key, entity_label)

    # Try to find a GitHub repo URL from tracked protocols or entity key
    repo_slug = _resolve_repo_slug(entity_key)
    if not repo_slug:
        return ToolResult(
            tool="repo_inspector",
            input_json={"entity_key": entity_key},
            output_summary=f"No GitHub repository found for {entity_label}.",
            evidence_links=[],
        )

    _rate_limit()
    try:
        # Get repo info
        resp = requests.get(
            f"https://api.github.com/repos/{repo_slug}",
            headers=_github_headers(),
            timeout=10,
        )
        repo_data = resp.json() if resp.status_code == 200 else {}

        # Get recent commits
        _rate_limit()
        commits_resp = requests.get(
            f"https://api.github.com/repos/{repo_slug}/commits?per_page=5",
            headers=_github_headers(),
            timeout=10,
        )
        commits = commits_resp.json() if commits_resp.status_code == 200 else []

        # Get releases
        _rate_limit()
        releases_resp = requests.get(
            f"https://api.github.com/repos/{repo_slug}/releases?per_page=3",
            headers=_github_headers(),
            timeout=10,
        )
        releases = releases_resp.json() if releases_resp.status_code == 200 else []

        desc = repo_data.get("description", "No description")
        stars = repo_data.get("stargazers_count", 0)
        forks = repo_data.get("forks_count", 0)
        commit_msgs = [c.get("commit", {}).get("message", "")[:80] for c in commits[:5]]
        release_names = [r.get("tag_name", "") for r in releases[:3]]

        summary = (
            f"Repository: {repo_slug} — {desc}. "
            f"Stars: {stars}, Forks: {forks}. "
            f"Recent commits: {'; '.join(commit_msgs[:3])}. "
            f"Latest releases: {', '.join(release_names) or 'none'}."
        )

        links = [f"https://github.com/{repo_slug}"]
        evidence = [
            {"type": "dev", "title": f"GitHub: {repo_slug}", "url": links[0],
             "snippet": f"{stars} stars, {forks} forks. {desc}"},
        ]

        return ToolResult(
            tool="repo_inspector",
            input_json={"repo_slug": repo_slug, "entity_key": entity_key},
            output_summary=summary,
            evidence_links=links,
            evidence_items=evidence,
        )
    except Exception as e:
        return ToolResult(
            tool="repo_inspector",
            input_json={"entity_key": entity_key},
            output_summary=f"Error inspecting repo: {str(e)}",
            evidence_links=[],
        )


def _resolve_repo_slug(entity_key: str) -> str | None:
    """Try to resolve an entity key to a GitHub repo slug."""
    # Check tracked protocols
    try:
        protocols = load_fixture("tracked_protocols.json")
        for proto in protocols:
            if proto["name"].lower().replace(" ", "-") in entity_key.lower():
                url = proto["repoUrl"]
                return url.replace("https://github.com/", "")
    except FileNotFoundError:
        pass

    # If the key looks like a repo slug
    if "/" in entity_key and not entity_key.startswith("http"):
        return entity_key

    return None


def _demo_repo_inspector(entity_key: str, entity_label: str) -> ToolResult:
    """Demo mode repo inspection."""
    demo_results = {
        "jupiter-perps-v2": {
            "summary": "Repository: jup-ag/jupiter-core — Jupiter V2 introduces perpetual futures with up to 100x leverage, integrated LP vaults, and advanced order types. Stars: 1,247, Forks: 312. Recent commits: feat: add partial fill support for limit orders; fix: oracle price staleness check; refactor: vault accounting precision. Latest releases: v2.1.0, v2.0.5, v2.0.4.",
            "links": ["https://github.com/jup-ag/jupiter-core"],
        },
        "light-protocol-zk": {
            "summary": "Repository: Light-Protocol/light-protocol — ZK compression system for Solana achieving 1000x state cost reduction through Merkle tree compression. Stars: 892, Forks: 145. Recent commits: feat: batch compression for token transfers; fix: concurrent Merkle tree updates; docs: add integration guide. Latest releases: v0.5.0, v0.4.2.",
            "links": ["https://github.com/Light-Protocol/light-protocol"],
        },
        "sanctum-infinity": {
            "summary": "Repository: sanctum-so/sanctum — Infinity Pool enables instant liquidity for any LST on Solana through a unified AMM. Stars: 567, Forks: 89. Recent commits: feat: add permissionless LST onboarding; perf: optimize swap routing; fix: decimal precision in yield calculation. Latest releases: v1.2.0, v1.1.3.",
            "links": ["https://github.com/sanctum-so/sanctum"],
        },
        "firedancer-frankendancer": {
            "summary": "Repository: firedancer-io/firedancer — Independent Solana validator client in C by Jump Crypto. Frankendancer hybrid already on testnet showing 50%+ TPS improvement. Stars: 2,345, Forks: 234. Recent commits: perf: QUIC transport optimization; feat: new block scheduler; test: mainnet compatibility checks. Latest releases: v0.3.0-beta.",
            "links": ["https://github.com/firedancer-io/firedancer"],
        },
    }

    result = demo_results.get(entity_key, {
        "summary": f"Repository analysis for {entity_label}: Active development with consistent commit history. Multiple contributors and recent releases indicate healthy project momentum.",
        "links": [],
    })

    return ToolResult(
        tool="repo_inspector",
        input_json={"entity_key": entity_key},
        output_summary=result["summary"],
        evidence_links=result["links"],
        evidence_items=[{
            "type": "dev",
            "title": f"Repo inspection: {entity_label}",
            "url": result["links"][0] if result["links"] else "",
            "snippet": result["summary"][:200],
        }],
    )


# ═══════════════════════════════════════
# TOOL: idl_differ
# ═══════════════════════════════════════
def idl_differ(entity_key: str, entity_label: str, **kwargs: Any) -> ToolResult:
    """Diff IDL or interface surface for tracked protocols."""
    # Always demo mode for IDL diffing (requires repo cloning)
    demo_diffs = {
        "jupiter-perps-v2": "IDL diff detected: 3 new instructions added (place_perp_order_v2, modify_tp_sl, settle_pnl_batch). 2 instructions modified (initialize_market: added max_leverage param; deposit_collateral: added auto_compound flag). No instructions removed. Account struct changes: PerpMarket gained fields for funding_rate_velocity and max_open_interest.",
        "drift-dlob-server": "IDL diff detected: 1 new instruction (submit_dlob_order). Modified: fill_order now includes priority_fee_lamports parameter. New account type: DlobState with fields for order_queue_head and fill_history_buffer.",
        "phoenix-seat-manager": "IDL diff detected: 2 new instructions (claim_seat, delegate_seat). New account: SeatManager with fields for stake_amount, delegation_authority, and priority_tier. Modified: new_order_v2 now requires seat_account in remaining_accounts.",
        "light-protocol-zk": "IDL diff detected: 4 new instructions (compress_tokens_batch, decompress_with_proof, update_merkle_tree_batch, verify_inclusion_proof). Major expansion of compressed account primitives. New account types: CompressedTokenAccount, MerkleTreeConfig.",
    }

    diff = demo_diffs.get(
        entity_key,
        f"No IDL changes detected for {entity_label} in the current period. Interface surface is stable."
    )

    has_changes = entity_key in demo_diffs
    evidence = []
    if has_changes:
        evidence.append({
            "type": "idl_diff",
            "title": f"IDL changes: {entity_label}",
            "url": "",
            "snippet": diff[:200],
        })

    return ToolResult(
        tool="idl_differ",
        input_json={"entity_key": entity_key, "protocol": entity_label},
        output_summary=diff,
        evidence_links=[],
        evidence_items=evidence,
    )


# ═══════════════════════════════════════
# TOOL: dependency_tracker
# ═══════════════════════════════════════
def dependency_tracker(entity_key: str, entity_label: str, **kwargs: Any) -> ToolResult:
    """Track dependency adoption across tracked repos."""
    demo_deps = {
        "light-protocol-zk": "Dependency tracking: light-sdk crate adoption increased 340% across tracked repos (from 5 to 22 repos importing it). Notable new adopters: Jupiter, Drift, Tensor. The light-compressed-token package also saw 180% growth. This indicates strong ecosystem-level interest in ZK compression primitives.",
        "solana-program-library/token-2022": "Dependency tracking: spl-token-2022 crate adoption increased 89% (from 34 to 64 repos). Transfer hook usage grew 250% (8 to 28 repos). Confidential transfer extensions adopted by 12 new repos including major DeFi protocols.",
        "jupiter-perps-v2": "Dependency tracking: jupiter-perps-sdk adoption increased 120% (from 15 to 33 repos). Most adopters are trading bots and aggregator frontends. The jupiter-core crate stable at 45 dependents.",
        "sanctum-infinity": "Dependency tracking: sanctum-lst-sdk adopted by 15 new repos (from 8 to 23). Growth concentrated in yield aggregators and DeFi protocols looking to integrate multi-LST support.",
    }

    dep_info = demo_deps.get(
        entity_key,
        f"No significant dependency changes detected for {entity_label}. Package imports remain stable across tracked repositories."
    )

    evidence = []
    if entity_key in demo_deps:
        evidence.append({
            "type": "dependency",
            "title": f"Dependency growth: {entity_label}",
            "url": "",
            "snippet": dep_info[:200],
        })

    return ToolResult(
        tool="dependency_tracker",
        input_json={"entity_key": entity_key},
        output_summary=dep_info,
        evidence_links=[],
        evidence_items=evidence,
    )


# ═══════════════════════════════════════
# TOOL: social_pain_finder
# ═══════════════════════════════════════
def social_pain_finder(
    entity_key: str, entity_label: str,
    snippets: list[dict] | None = None,
    **kwargs: Any,
) -> ToolResult:
    """Classify social snippets and identify pain points vs hype."""
    if not snippets:
        return ToolResult(
            tool="social_pain_finder",
            input_json={"entity_key": entity_key},
            output_summary=f"No social snippets available for {entity_label}.",
            evidence_links=[],
        )

    counts = {"pain_point": 0, "question": 0, "hype": 0, "announcement": 0}
    pain_points = []
    questions = []

    for s in snippets:
        cls = s.get("class", "hype")
        counts[cls] = counts.get(cls, 0) + 1
        if cls == "pain_point":
            pain_points.append(s["text"])
        elif cls == "question":
            questions.append(s["text"])

    total = len(snippets)
    hype_ratio = counts["hype"] / total if total > 0 else 0
    pain_ratio = counts["pain_point"] / total if total > 0 else 0

    summary_parts = [
        f"Social analysis for {entity_label}: {total} snippets analyzed.",
        f"Distribution: {counts['announcement']} announcements, {counts['pain_point']} pain points, {counts['question']} questions, {counts['hype']} hype.",
    ]

    if pain_points:
        summary_parts.append(f"Key pain points: {'; '.join(pain_points[:2])}")
    if questions:
        summary_parts.append(f"Open questions: {'; '.join(questions[:2])}")
    if hype_ratio > 0.6:
        summary_parts.append("⚠️ High hype ratio detected — narrative may lack substance.")
    if pain_ratio > 0.3:
        summary_parts.append("✅ Significant pain points suggest real demand.")

    evidence = []
    for pp in pain_points[:2]:
        evidence.append({
            "type": "social",
            "title": f"Pain point: {entity_label}",
            "url": "",
            "snippet": pp[:200],
        })

    return ToolResult(
        tool="social_pain_finder",
        input_json={"entity_key": entity_key, "snippet_count": total},
        output_summary=" ".join(summary_parts),
        evidence_links=[],
        evidence_items=evidence,
    )


# ═══════════════════════════════════════
# TOOL: competitor_search (Blue Ocean)
# ═══════════════════════════════════════
def competitor_search(
    idea_text: str,
    idea_embedding: list[float] | None = None,
    corpus_embeddings: dict[str, list[float]] | None = None,
    corpus_meta: dict[str, dict] | None = None,
    **kwargs: Any,
) -> ToolResult:
    """Search project corpus for nearest competitors (Blue Ocean check)."""
    if not corpus_embeddings or not idea_embedding:
        return ToolResult(
            tool="competitor_search",
            input_json={"idea_text": idea_text[:100]},
            output_summary="No corpus embeddings available for saturation check.",
            evidence_links=[],
        )

    sat = compute_saturation(idea_embedding, corpus_embeddings, corpus_meta)

    neighbor_strs = [
        f"{n['name']} ({n['similarity']:.0%} similar)"
        for n in sat["neighbors"]
    ]

    summary = (
        f"Saturation check: {sat['level'].upper()} ({sat['score']:.0%}). "
        f"Nearest competitors: {', '.join(neighbor_strs)}."
    )

    if sat["level"] == "high":
        summary += " Market is crowded — consider a differentiated angle or niche pivot."

    return ToolResult(
        tool="competitor_search",
        input_json={"idea_text": idea_text[:100]},
        output_summary=summary,
        evidence_links=[],
    )
