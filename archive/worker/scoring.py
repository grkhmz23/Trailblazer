"""Signal scoring: z-score computation, momentum, novelty, and quality scoring."""

import math
from datetime import datetime, timezone
from config import (
    SCORING_WEIGHTS, NOVELTY_BONUS_DAYS, NOVELTY_BONUS_MULTIPLIER,
    QUALITY_PENALTY,
)


def z_score(current: float, baseline: float, epsilon: float = 1e-6) -> float:
    """Compute a simple z-like ratio score: (current - baseline) / max(baseline, epsilon)."""
    if baseline < epsilon:
        return min(current / epsilon, 10.0)  # cap extreme values
    return (current - baseline) / baseline


def compute_onchain_features(signal: dict) -> dict:
    """Compute z-scores for onchain metrics."""
    return {
        "z_tx_count": z_score(signal["tx_count"], signal["tx_count_baseline"]),
        "z_unique_wallets": z_score(signal["unique_wallets"], signal["unique_wallets_baseline"]),
        "z_new_wallet_share": z_score(signal["new_wallet_share"], signal["new_wallet_share_baseline"]),
        "z_retention": z_score(signal["retention_7d"], signal["retention_7d_baseline"]),
    }


def compute_dev_features(signal: dict) -> dict:
    """Compute z-scores for dev metrics."""
    return {
        "z_commits": z_score(signal["commits"], signal["commits_baseline"]),
        "z_stars_delta": z_score(signal["stars_delta"], signal["stars_delta_baseline"]),
        "z_new_contributors": z_score(signal["new_contributors"], signal["new_contributors_baseline"]),
        "z_releases": z_score(signal["releases"], signal["releases_baseline"]),
    }


def compute_social_features(signal: dict) -> dict:
    """Compute z-scores for social metrics."""
    return {
        "z_mentions_delta": z_score(signal["mentions_count"], signal["mentions_count_baseline"]),
        "z_unique_authors": z_score(signal["unique_authors"], signal["unique_authors_baseline"]),
        "z_engagement_delta": z_score(signal["engagement_score"], signal["engagement_score_baseline"]),
    }


def compute_momentum(features: dict) -> float:
    """Weighted sum of all z-score features using SCORING_WEIGHTS."""
    score = 0.0
    for category, weights in SCORING_WEIGHTS.items():
        for key, weight in weights.items():
            if key in features:
                # Clamp z-scores to [-5, 5] to prevent extreme outliers
                val = max(-5.0, min(5.0, features[key]))
                score += val * weight
    return score


def compute_novelty(first_seen: datetime | str) -> float:
    """Novelty bonus if entity was first seen within NOVELTY_BONUS_DAYS."""
    if isinstance(first_seen, str):
        first_seen = datetime.fromisoformat(first_seen.replace("Z", "+00:00"))
    if first_seen.tzinfo is None:
        first_seen = first_seen.replace(tzinfo=timezone.utc)

    age_days = (datetime.now(timezone.utc) - first_seen).days
    if age_days <= NOVELTY_BONUS_DAYS:
        # Linear decay: full bonus at day 0, zero at NOVELTY_BONUS_DAYS
        return NOVELTY_BONUS_MULTIPLIER * (1.0 - age_days / NOVELTY_BONUS_DAYS)
    return 0.0


def compute_quality_penalty(features: dict, social_snippets: list[dict] | None = None) -> float:
    """
    Detect spam/noise patterns and return a penalty multiplier (0.0 to 1.0).
    1.0 = no penalty, lower = more penalty.
    """
    penalty = 1.0

    # Check for single-wallet spike (if new_wallet_share is very high and retention is low)
    nws = features.get("z_new_wallet_share", 0)
    ret = features.get("z_retention", 0)
    if nws > 2.0 and ret < 0.0:
        # High new wallet influx + poor retention = potential airdrop farming
        penalty *= QUALITY_PENALTY["penalty_multiplier"]

    # Check for single-author hype in social
    if social_snippets:
        hype_count = sum(1 for s in social_snippets if s.get("class") == "hype")
        total = len(social_snippets)
        if total > 0 and hype_count / total > QUALITY_PENALTY["single_author_hype_ratio"]:
            penalty *= QUALITY_PENALTY["penalty_multiplier"]

    return penalty


def compute_total_score(momentum: float, novelty: float, quality_penalty: float) -> float:
    """Final composite score."""
    base = momentum + novelty
    return max(0.0, base * quality_penalty)


def normalize_scores(scores: list[float]) -> list[float]:
    """Normalize a list of scores to [0, 1] range."""
    if not scores:
        return []
    min_s = min(scores)
    max_s = max(scores)
    rng = max_s - min_s
    if rng < 1e-8:
        return [0.5] * len(scores)
    return [(s - min_s) / rng for s in scores]
