// ===== Entity Types =====
export type EntityKind = "program" | "repo" | "token" | "keyword" | "protocol";

// ===== Signal Types =====
export type SignalType = "onchain" | "dev" | "social";
export type EvidenceType = "onchain" | "dev" | "social" | "idl_diff" | "dependency";

// ===== Tool Names =====
export type ToolName =
  | "repo_inspector"
  | "idl_differ"
  | "dependency_tracker"
  | "social_pain_finder"
  | "competitor_search";

// ===== Social Snippet Classification =====
export type SnippetClass = "pain_point" | "question" | "hype" | "announcement";

// ===== Saturation Levels =====
export type SaturationLevel = "low" | "medium" | "high";

// ===== Report Status =====
export type ReportStatus = "pending" | "processing" | "complete" | "failed";

// ===== Scoring Weights =====
export const SCORING_WEIGHTS = {
  onchain: {
    z_tx_count: 0.25,
    z_unique_wallets: 0.2,
    z_new_wallet_share: 0.15,
    z_retention: 0.1,
  },
  dev: {
    z_commits: 0.2,
    z_stars_delta: 0.15,
    z_new_contributors: 0.1,
    z_releases: 0.05,
  },
  social: {
    z_mentions_delta: 0.15,
    z_unique_authors: 0.1,
    z_engagement_delta: 0.1,
  },
} as const;

export const NOVELTY_BONUS_DAYS = 60;
export const NOVELTY_BONUS_MULTIPLIER = 1.3;
export const QUALITY_PENALTY_THRESHOLDS = {
  singleWalletSpikeRatio: 0.7,
  singleAuthorHypeRatio: 0.8,
  penaltyMultiplier: 0.5,
} as const;

export const TOP_K_CANDIDATES = 20;
export const MAX_NARRATIVES = 10;
export const IDEAS_PER_NARRATIVE = 5;

// ===== Feature Keys =====
export const ONCHAIN_FEATURES = [
  "z_tx_count",
  "z_unique_wallets",
  "z_new_wallet_share",
  "z_retention",
] as const;

export const DEV_FEATURES = [
  "z_commits",
  "z_stars_delta",
  "z_new_contributors",
  "z_releases",
] as const;

export const SOCIAL_FEATURES = [
  "z_mentions_delta",
  "z_unique_authors",
  "z_engagement_delta",
] as const;

// ===== API Response Types =====
export interface ReportSummary {
  id: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  narrativeCount: number;
  status: string;
}

export interface NarrativeSummary {
  id: string;
  title: string;
  summary: string;
  momentum: number;
  novelty: number;
  saturation: number;
  evidenceCount: number;
  ideaCount: number;
}

export interface InvestigationStepData {
  id: string;
  stepIndex: number;
  tool: ToolName;
  inputJson: Record<string, unknown>;
  outputSummary: string;
  linksJson: string[];
  createdAt: string;
}

export interface IdeaData {
  id: string;
  title: string;
  pitch: string;
  targetUser: string;
  mvpScope: string;
  whyNow: string;
  validation: string;
  saturationJson: {
    level: SaturationLevel;
    score: number;
    neighbors: Array<{ name: string; similarity: number; url: string }>;
  };
  pivot: string;
}

export interface ActionPackFiles {
  "spec.md": string;
  "tech.md": string;
  "milestones.md": string;
  "deps.json": string;
}

// ===== Tracked Protocol Config =====
export interface TrackedProtocol {
  name: string;
  repoUrl: string;
  idlPaths: string[];
  interfaceFiles: string[];
}

// ===== Project Corpus Entry =====
export interface ProjectEntry {
  name: string;
  description: string;
  url: string;
  tags: string[];
}
