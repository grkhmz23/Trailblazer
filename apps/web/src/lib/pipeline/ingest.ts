/**
 * Signal ingestion — live APIs in production, fixture fallback in demo mode.
 *
 * Orchestrates Helius (onchain), GitHub (dev), RSS (social), and Twitter/X
 * (KOL) ingestors, then merges results into the unified MergedSignal format.
 */

import { config } from "@/lib/config";
import { type MergedSignal } from "./scoring";
import { TRACKED_PROTOCOLS, type TrackedProtocol } from "./protocols";
import {
  ingestOnchainSignals,
  type OnchainSignalResult,
} from "./ingestors/helius";
import { ingestDevSignals, type DevSignalResult } from "./ingestors/github";
import {
  ingestSocialSignals,
  type SocialSignalResult,
} from "./ingestors/social";
import {
  ingestTwitterSignals,
  type TwitterSignalResult,
} from "./ingestors/twitter";
import * as fs from "fs";
import * as path from "path";

// ─── Fixture helpers (demo mode) ────────────────────────────

function fixturesDir(): string {
  const candidates = [
    path.join(process.cwd(), "../../fixtures"),
    path.join(process.cwd(), "../fixtures"),
    path.join(process.cwd(), "fixtures"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return path.join(process.cwd(), "../../fixtures");
}

function loadFixture<T>(name: string): T {
  const filePath = path.join(fixturesDir(), name);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

interface RawFixture {
  metadata?: Record<string, unknown>;
  entities: Array<{
    kind: string;
    key: string;
    label: string;
    first_seen: string;
  }>;
  signals: {
    onchain: Array<Record<string, unknown>>;
    dev: Array<Record<string, unknown>>;
    social: Array<Record<string, unknown>>;
  };
}

function loadDemoSignals(): MergedSignal[] {
  try {
    const raw = loadFixture<RawFixture | MergedSignal[]>("demo_signals.json");
    if (Array.isArray(raw)) return raw;
    if ("entities" in raw) return mergeFixtureSignals(raw);
  } catch (e) {
    console.warn("Failed to load demo_signals.json:", e);
  }
  return [];
}

function mergeFixtureSignals(raw: RawFixture): MergedSignal[] {
  const onchainMap = new Map(
    raw.signals.onchain.map((s: any) => [s.entity_key as string, s])
  );
  const devMap = new Map(
    raw.signals.dev.map((s: any) => [s.entity_key as string, s])
  );
  const socialMap = new Map(
    raw.signals.social.map((s: any) => [s.entity_key as string, s])
  );

  return raw.entities.map((ent: any) => {
    const oc = onchainMap.get(ent.key) ?? {};
    const dv = devMap.get(ent.key) ?? {};
    const sc = socialMap.get(ent.key) ?? {};
    const strip = (obj: Record<string, unknown>) => {
      const { entity_key, ...rest } = obj;
      return rest;
    };
    return {
      key: ent.key,
      label: ent.label,
      kind: ent.kind,
      first_seen: ent.first_seen,
      onchain: strip(oc as Record<string, unknown>) as MergedSignal["onchain"],
      dev: strip(dv as Record<string, unknown>) as MergedSignal["dev"],
      social: strip(sc as Record<string, unknown>) as MergedSignal["social"],
    };
  });
}

// ─── Live ingestion merge ───────────────────────────────────

function mergeLiveSignals(
  protocols: TrackedProtocol[],
  onchain: OnchainSignalResult[],
  dev: DevSignalResult[],
  social: SocialSignalResult[],
  twitter: TwitterSignalResult[]
): MergedSignal[] {
  const ocMap = new Map(onchain.map((o: any) => [o.entityKey, o]));
  const devMap = new Map(dev.map((d: any) => [d.entityKey, d]));
  const socialMap = new Map(social.map((s: any) => [s.entityKey, s]));
  const twitterMap = new Map(twitter.map((t: any) => [t.entityKey, t]));

  return protocols.map((p: any) => {
    const oc = ocMap.get(p.key);
    const dv = devMap.get(p.key);
    const sc = socialMap.get(p.key);
    const tw = twitterMap.get(p.key);

    // Merge RSS mentions + Twitter KOL mentions into unified social signal
    const rssMentions = sc?.mentions_count ?? 0;
    const twitterMentions = tw?.kol_mentions ?? 0;
    const totalMentions = rssMentions + twitterMentions;

    const rssMentionsBaseline = sc?.mentions_count_baseline ?? 0;
    const twitterMentionsBaseline = tw?.kol_mentions_baseline ?? 0;
    const totalMentionsBaseline = rssMentionsBaseline + twitterMentionsBaseline;

    const rssAuthors = sc?.unique_authors ?? 0;
    const twitterAuthors = tw ? (tw.kol_mentions > 0 ? Math.min(tw.kol_mentions, 5) : 0) : 0;
    const totalAuthors = rssAuthors + twitterAuthors;

    const rssAuthorsBaseline = sc?.unique_authors_baseline ?? 0;
    const totalAuthorsBaseline = rssAuthorsBaseline + (tw?.kol_mentions_baseline ?? 0 > 0 ? 1 : 0);

    // Engagement: RSS engagement + weighted Twitter mentions (KOL tweets are higher signal)
    const rssEngagement = sc?.engagement_score ?? 0;
    const twitterEngagement = twitterMentions * 3; // KOL mentions worth 3x RSS
    const totalEngagement = rssEngagement + twitterEngagement;

    const rssEngagementBaseline = sc?.engagement_score_baseline ?? 0;
    const twitterEngagementBaseline = twitterMentionsBaseline * 3;
    const totalEngagementBaseline = rssEngagementBaseline + twitterEngagementBaseline;

    // Merge snippets from both sources
    const rssSnippets = (sc?.snippets ?? []).map((s: any) => ({
      ...s,
      source: s.source || "rss",
    }));
    const twitterSnippets = (tw?.top_kol_tweets ?? []).map((t: any) => ({
      text: `@${t.author} (${t.authorLabel}): ${t.text}`,
      url: t.url,
      source: "twitter",
      classification: t.classification as "announcement" | "pain_point" | "question" | "hype" | "discussion",
    }));
    const allSnippets = [...twitterSnippets, ...rssSnippets].slice(0, 10);

    return {
      key: p.key,
      label: p.label,
      kind: p.kind,
      first_seen: p.firstSeen,
      onchain: {
        tx_count: oc?.tx_count ?? 0,
        tx_count_baseline: oc?.tx_count_baseline ?? 0,
        unique_wallets: oc?.unique_wallets ?? 0,
        unique_wallets_baseline: oc?.unique_wallets_baseline ?? 0,
        new_wallet_share: oc?.new_wallet_share ?? 0,
        new_wallet_share_baseline: oc?.new_wallet_share_baseline ?? 0.3,
        retention_7d: oc?.retention_7d ?? 0,
        retention_7d_baseline: oc?.retention_7d_baseline ?? 0.4,
      },
      dev: {
        commits: dv?.commits ?? 0,
        commits_baseline: dv?.commits_baseline ?? 0,
        stars_delta: dv?.stars_delta ?? 0,
        stars_delta_baseline: dv?.stars_delta_baseline ?? 0,
        new_contributors: dv?.new_contributors ?? 0,
        new_contributors_baseline: dv?.new_contributors_baseline ?? 0,
        releases: dv?.releases ?? 0,
        releases_baseline: dv?.releases_baseline ?? 0,
      },
      social: {
        mentions_count: totalMentions,
        mentions_count_baseline: totalMentionsBaseline,
        unique_authors: totalAuthors,
        unique_authors_baseline: totalAuthorsBaseline,
        engagement_score: totalEngagement,
        engagement_score_baseline: totalEngagementBaseline,
        snippets: allSnippets,
      },
    };
  });
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Ingest signals — automatically selects live or demo based on config.
 */
export async function ingestSignals(
  periodStart?: Date,
  periodEnd?: Date
): Promise<MergedSignal[]> {
  const isLive = !config.demoMode && (config.hasHelius || config.hasGithub);

  if (!isLive) {
    console.log("[Ingest] Demo mode — loading from fixtures");
    return loadDemoSignals();
  }

  console.log("[Ingest] Live mode — querying real APIs");
  const pEnd = periodEnd ?? new Date();
  const pStart =
    periodStart ?? new Date(pEnd.getTime() - 14 * 24 * 60 * 60 * 1000);

  const protocols = TRACKED_PROTOCOLS;

  // Run all ingestors in parallel
  const [onchain, dev, social, twitterResult] = await Promise.all([
    config.hasHelius
      ? ingestOnchainSignals(protocols, pStart, pEnd)
      : Promise.resolve<OnchainSignalResult[]>([]),
    ingestDevSignals(protocols, pStart, pEnd),
    ingestSocialSignals(protocols, pStart, pEnd),
    ingestTwitterSignals(protocols, pStart, pEnd).catch((e) => {
      console.warn("[Ingest] Twitter ingestion failed:", e);
      return {
        perProtocol: [] as TwitterSignalResult[],
        allTweets: [],
        kolsReached: 0,
        totalTweets: 0,
      };
    }),
  ]);

  console.log(
    `[Ingest] Twitter: ${twitterResult.kolsReached} KOLs reached, ${twitterResult.totalTweets} relevant tweets`
  );

  const merged = mergeLiveSignals(
    protocols,
    onchain,
    dev,
    social,
    twitterResult.perProtocol
  );

  // Filter out protocols with zero activity across all signals
  const active = merged.filter(
    (s: any) =>
      s.onchain.tx_count > 0 ||
      s.dev.commits > 0 ||
      s.social.mentions_count > 0
  );

  console.log(
    `[Ingest] ${active.length}/${merged.length} protocols have activity`
  );
  return active;
}

export function loadProjectCorpus(): {
  meta: Array<{
    name: string;
    url: string;
    description: string;
    tags: string[];
  }>;
  embeddings: number[][];
} {
  try {
    const projects = loadFixture<
      Array<{
        name: string;
        description: string;
        url: string;
        tags: string[];
      }>
    >("projects.json");
    const embeddings = loadFixture<number[][]>("projects_embeddings.json");
    return { meta: projects, embeddings };
  } catch {
    return { meta: [], embeddings: [] };
  }
}

export function loadDemoEmbeddings(): Record<string, number[]> {
  try {
    return loadFixture<Record<string, number[]>>("demo_embeddings.json");
  } catch {
    return {};
  }
}
