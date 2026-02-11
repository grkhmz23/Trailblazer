/**
 * Scoring functions — TypeScript port of worker/scoring.py.
 * Used by the Node.js lite pipeline (Vercel-compatible, no Python dep).
 */

interface OnchainSignal {
  tx_count?: number;
  tx_count_baseline?: number;
  unique_wallets?: number;
  unique_wallets_baseline?: number;
  new_wallet_share?: number;
  new_wallet_share_baseline?: number;
  retention_7d?: number;
  retention_7d_baseline?: number;
}

interface DevSignal {
  commits?: number;
  commits_baseline?: number;
  stars_delta?: number;
  stars_delta_baseline?: number;
  new_contributors?: number;
  new_contributors_baseline?: number;
  releases?: number;
  releases_baseline?: number;
}

interface SocialSignal {
  mentions_count?: number;
  mentions_count_baseline?: number;
  unique_authors?: number;
  unique_authors_baseline?: number;
  engagement_score?: number;
  engagement_score_baseline?: number;
  snippets?: Array<{ text: string; classification?: string }>;
}

export interface MergedSignal {
  key: string;
  label: string;
  kind: string;
  first_seen: string;
  onchain: OnchainSignal;
  dev: DevSignal;
  social: SocialSignal;
}

export interface ScoredCandidate {
  signal: MergedSignal;
  features: Record<string, number>;
  momentum: number;
  novelty: number;
  quality: number;
  totalScore: number;
  normalizedScore: number;
}

function zScore(current: number, baseline: number): number {
  if (baseline === 0) return current > 0 ? 2.0 : 0;
  const z = (current - baseline) / Math.max(baseline, 0.001);
  return Math.max(-5, Math.min(5, z)); // clamp [-5, 5]
}

function computeOnchainFeatures(oc: OnchainSignal): Record<string, number> {
  return {
    z_tx_count: zScore(oc.tx_count ?? 0, oc.tx_count_baseline ?? 0),
    z_unique_wallets: zScore(oc.unique_wallets ?? 0, oc.unique_wallets_baseline ?? 0),
    z_new_wallet_share: zScore(oc.new_wallet_share ?? 0, oc.new_wallet_share_baseline ?? 0),
    z_retention: zScore(oc.retention_7d ?? 0, oc.retention_7d_baseline ?? 0),
  };
}

function computeDevFeatures(dev: DevSignal): Record<string, number> {
  return {
    z_commits: zScore(dev.commits ?? 0, dev.commits_baseline ?? 0),
    z_stars_delta: zScore(dev.stars_delta ?? 0, dev.stars_delta_baseline ?? 0),
    z_new_contributors: zScore(dev.new_contributors ?? 0, dev.new_contributors_baseline ?? 0),
    z_releases: zScore(dev.releases ?? 0, dev.releases_baseline ?? 0),
  };
}

function computeSocialFeatures(social: SocialSignal): Record<string, number> {
  return {
    z_mentions_delta: zScore(social.mentions_count ?? 0, social.mentions_count_baseline ?? 0),
    z_unique_authors: zScore(social.unique_authors ?? 0, social.unique_authors_baseline ?? 0),
    z_engagement_delta: zScore(social.engagement_score ?? 0, social.engagement_score_baseline ?? 0),
  };
}

const WEIGHTS: Record<string, number> = {
  z_tx_count: 0.25,
  z_unique_wallets: 0.2,
  z_new_wallet_share: 0.15,
  z_retention: 0.1,
  z_commits: 0.2,
  z_stars_delta: 0.15,
  z_new_contributors: 0.1,
  z_releases: 0.05,
  z_mentions_delta: 0.15,
  z_unique_authors: 0.1,
  z_engagement_delta: 0.1,
};

function computeMomentum(features: Record<string, number>): number {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += (features[key] ?? 0) * weight;
  }
  return score;
}

function computeNovelty(firstSeen: string): number {
  const daysOld =
    (Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld <= 60) {
    const bonus = 1.3 - 0.3 * (daysOld / 60); // linear decay from 1.3 → 1.0
    return bonus;
  }
  return 1.0;
}

function computeQualityPenalty(
  features: Record<string, number>,
  snippets: Array<{ text: string; classification?: string }>
): number {
  let penalty = 1.0;

  // Single-wallet spike detection
  const walletZ = features.z_unique_wallets ?? 0;
  const txZ = features.z_tx_count ?? 0;
  if (txZ > 2 && walletZ < 0.5) {
    penalty *= 0.6; // likely bot/single-wallet spam
  }

  // Hype-only social penalty
  if (snippets.length > 0) {
    const hypeCount = snippets.filter(
      (s) => s.classification === "hype"
    ).length;
    if (hypeCount / snippets.length > 0.8) {
      penalty *= 0.7; // mostly hype, little substance
    }
  }

  return penalty;
}

export function scoreSignals(signals: MergedSignal[]): ScoredCandidate[] {
  const scored: ScoredCandidate[] = signals.map((sig) => {
    const ocFeatures = computeOnchainFeatures(sig.onchain ?? {});
    const devFeatures = computeDevFeatures(sig.dev ?? {});
    const socialFeatures = computeSocialFeatures(sig.social ?? {});
    const features = { ...ocFeatures, ...devFeatures, ...socialFeatures };

    const momentum = computeMomentum(features);
    const noveltyMult = computeNovelty(sig.first_seen);
    const qualityMult = computeQualityPenalty(
      features,
      (sig.social?.snippets as Array<{ text: string; classification?: string }>) ?? []
    );

    const totalScore = (momentum * noveltyMult) * qualityMult;

    return {
      signal: sig,
      features,
      momentum,
      novelty: noveltyMult,
      quality: qualityMult,
      totalScore,
      normalizedScore: 0,
    };
  });

  // Normalize to [0, 1]
  const totals = scored.map((s) => s.totalScore);
  const minScore = Math.min(...totals);
  const maxScore = Math.max(...totals);
  const range = maxScore - minScore || 1;

  for (const s of scored) {
    s.normalizedScore = (s.totalScore - minScore) / range;
  }

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}
