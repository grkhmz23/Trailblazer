/**
 * Twitter / X KOL Signal Ingestor.
 *
 * Monitors Solana ecosystem Key Opinion Leaders via public RSS proxies
 * (Nitter instances) and extracts narrative signals from their posts.
 *
 * Tracked KOLs (per grant spec):
 *  - Mert (0xMert_)         — Helius CEO, infra commentary
 *  - Toly (aeyakovenko)     — Solana co-founder
 *  - Raj (rajgokal)          — Solana co-founder
 *  - Akshay (akshaybd)      — Solana ecosystem
 *  - Solana official         — Announcements
 *  - Jupiter Exchange        — DeFi leader
 *  - Drift Protocol          — Perps commentary
 *  - Helius                  — Infra / dev tooling
 *  - Messari                 — Research reports
 *  - Electric Capital        — Dev reports
 *
 * Falls back gracefully if proxies are down.
 */

import { type TrackedProtocol } from "../protocols";

const FEED_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 600;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Solana ecosystem KOL accounts to monitor */
export const SOLANA_KOLS = [
  // Core ecosystem leaders (named in grant spec)
  { handle: "0xMert_", label: "Mert (Helius)", category: "kol" as const },
  { handle: "aeyakovenko", label: "Toly (Solana)", category: "kol" as const },
  { handle: "rajgokal", label: "Raj Gokal (Solana)", category: "kol" as const },
  { handle: "akshaybd", label: "Akshay Sriram", category: "kol" as const },

  // Official protocol accounts
  { handle: "solaboranastatus", label: "Solana Status", category: "official" as const },
  { handle: "JupiterExchange", label: "Jupiter", category: "official" as const },
  { handle: "DriftProtocol", label: "Drift", category: "official" as const },
  { handle: "heaborlius_dev", label: "Helius", category: "official" as const },

  // Research & data
  { handle: "MessariCrypto", label: "Messari", category: "research" as const },
  { handle: "ElectricCapital", label: "Electric Capital", category: "research" as const },

  // Additional Solana KOLs
  { handle: "armaborjess", label: "Armani Ferrante", category: "kol" as const },
  { handle: "CantelopePeel", label: "Cantelope Peel", category: "kol" as const },
  { handle: "solblaze_org", label: "SolBlaze", category: "official" as const },
  { handle: "TensorFndn", label: "Tensor", category: "official" as const },
  { handle: "MarginFi", label: "Marginfi", category: "official" as const },
];

/** Multiple Nitter instances to try (some may be down) */
const NITTER_INSTANCES = [
  "https://nitter.privacydev.net",
  "https://nitter.poast.org",
  "https://nitter.1d4.us",
  "https://nitter.kavin.rocks",
  "https://xcancel.com",
];

interface TweetItem {
  author: string;
  authorLabel: string;
  text: string;
  url: string;
  published: string;
  category: "kol" | "official" | "research";
}

/**
 * Fetch RSS feed from a nitter instance for a given handle.
 * Tries multiple instances until one works.
 */
async function fetchKolFeed(
  handle: string,
  label: string,
  category: "kol" | "official" | "research"
): Promise<TweetItem[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

      const url = `${instance}/${handle}/rss`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Trailblazer/1.0 (Solana Narrative Hunter)",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const text = await res.text();
      const items = parseRssFeed(text, handle, label, category);

      if (items.length > 0) {
        console.log(
          `[Twitter] @${handle}: ${items.length} tweets via ${new URL(instance).hostname}`
        );
        return items;
      }
    } catch {
      // Try next instance
      continue;
    }
  }

  return [];
}

/**
 * Parse Nitter RSS feed into TweetItem array.
 */
function parseRssFeed(
  xml: string,
  handle: string,
  label: string,
  category: "kol" | "official" | "research"
): TweetItem[] {
  const items: TweetItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ??
      "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const desc =
      block
        .match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1] ??
      block.match(/<description>(.*?)<\/description>/s)?.[1] ??
      "";

    if (title) {
      items.push({
        author: handle,
        authorLabel: label,
        text: decodeEntities(title + " " + desc).slice(0, 600),
        url: link.replace(/nitter\.[^/]+/, "x.com"), // Convert nitter URL back to x.com
        published: pubDate,
        category,
      });
    }
  }

  return items;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "") // strip HTML
    .replace(/\s+/g, " ")
    .trim();
}

/** Keywords indicating Solana narrative relevance */
const SOLANA_KEYWORDS = [
  "solana",
  "sol",
  "$sol",
  "defi",
  "nft",
  "depin",
  "blink",
  "compressed",
  "zk compression",
  "firedancer",
  "token extensions",
  "restaking",
  "liquid staking",
  "mev",
  "jito",
  "jupiter",
  "drift",
  "marinade",
  "raydium",
  "orca",
  "meteora",
  "tensor",
  "metaplex",
  "helium",
  "pyth",
  "wormhole",
  "phantom",
  "backpack",
  "madlads",
  "bonk",
  "jup",
  "pump.fun",
  "memecoin",
  "airdrop",
  "svm",
  "validator",
  "rpc",
  "helius",
  "quicknode",
  "anchor",
  "seahorse",
  "clockwork",
  "squads",
  "realms",
  "dao",
  "governance",
  "staking",
  "yield",
  "perps",
  "orderbook",
  "amm",
  "clmm",
  "dlmm",
  "payments",
  "payfi",
  "ai agent",
  "on-chain",
  "onchain",
  "mainnet",
  "devnet",
  "breakpoint",
  "superteam",
];

/**
 * Check if a tweet is Solana-relevant (filter out personal/off-topic).
 */
function isSolanaRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return SOLANA_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Extract which protocols are mentioned in a tweet.
 */
function extractProtocolMentions(
  text: string,
  protocols: TrackedProtocol[]
): string[] {
  const lower = text.toLowerCase();
  return protocols
    .filter((p) => {
      const terms = [
        p.label.toLowerCase(),
        p.key.toLowerCase(),
        ...p.label
          .toLowerCase()
          .split(/[\s-]+/)
          .filter((w) => w.length > 3),
      ];
      return terms.some((term) => lower.includes(term));
    })
    .map((p) => p.key);
}

/**
 * Classify tweet sentiment/type.
 */
function classifyTweet(
  text: string
): "announcement" | "pain_point" | "alpha" | "hype" | "analysis" | "discussion" {
  const lower = text.toLowerCase();
  if (
    lower.includes("shipping") ||
    lower.includes("launched") ||
    lower.includes("introducing") ||
    lower.includes("release") ||
    lower.includes("announcing") ||
    lower.includes("live on")
  ) {
    return "announcement";
  }
  if (
    lower.includes("bug") ||
    lower.includes("issue") ||
    lower.includes("congestion") ||
    lower.includes("outage") ||
    lower.includes("exploit") ||
    lower.includes("vulnerability")
  ) {
    return "pain_point";
  }
  if (
    lower.includes("thread") ||
    lower.includes("deep dive") ||
    lower.includes("analysis") ||
    lower.includes("report") ||
    lower.includes("data shows") ||
    lower.includes("metrics")
  ) {
    return "analysis";
  }
  if (
    lower.includes("alpha") ||
    lower.includes("underrated") ||
    lower.includes("sleeping on") ||
    lower.includes("early") ||
    lower.includes("gem")
  ) {
    return "alpha";
  }
  if (
    lower.includes("🚀") ||
    lower.includes("lfg") ||
    lower.includes("bullish") ||
    lower.includes("moon") ||
    lower.includes("lets go")
  ) {
    return "hype";
  }
  return "discussion";
}

export interface TwitterSignalResult {
  entityKey: string;
  kol_mentions: number;
  kol_mentions_baseline: number;
  research_mentions: number;
  official_mentions: number;
  sentiment_breakdown: Record<string, number>;
  top_kol_tweets: Array<{
    author: string;
    authorLabel: string;
    text: string;
    url: string;
    classification: string;
    published: string;
  }>;
}

/**
 * Aggregate Twitter/X signals per protocol from KOL feeds.
 */
export async function ingestTwitterSignals(
  protocols: TrackedProtocol[],
  periodStart: Date,
  periodEnd: Date
): Promise<{
  perProtocol: TwitterSignalResult[];
  allTweets: TweetItem[];
  kolsReached: number;
  totalTweets: number;
}> {
  console.log(
    `[Twitter] Fetching KOL feeds for ${SOLANA_KOLS.length} accounts...`
  );

  const allTweets: TweetItem[] = [];
  let kolsReached = 0;

  for (const kol of SOLANA_KOLS) {
    const tweets = await fetchKolFeed(kol.handle, kol.label, kol.category);
    if (tweets.length > 0) kolsReached++;
    allTweets.push(...tweets);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(
    `[Twitter] ${allTweets.length} total tweets from ${kolsReached}/${SOLANA_KOLS.length} KOLs`
  );

  // Filter by date range and Solana relevance
  const periodTweets = allTweets.filter((t) => {
    try {
      const pubDate = new Date(t.published);
      return (
        pubDate >= periodStart &&
        pubDate <= periodEnd &&
        isSolanaRelevant(t.text)
      );
    } catch {
      return false;
    }
  });

  const periodDays =
    (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
  const baselineStart = new Date(
    periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000
  );

  const baselineTweets = allTweets.filter((t) => {
    try {
      const pubDate = new Date(t.published);
      return (
        pubDate >= baselineStart &&
        pubDate < periodStart &&
        isSolanaRelevant(t.text)
      );
    } catch {
      return false;
    }
  });

  console.log(
    `[Twitter] ${periodTweets.length} Solana-relevant tweets in period, ${baselineTweets.length} in baseline`
  );

  // Match tweets to protocols
  const perProtocol: TwitterSignalResult[] = protocols.map((protocol) => {
    const currentMentions = periodTweets.filter((t) =>
      extractProtocolMentions(t.text, [protocol]).length > 0
    );
    const baselineMentions = baselineTweets.filter((t) =>
      extractProtocolMentions(t.text, [protocol]).length > 0
    );

    // Count by category
    const kolMentions = currentMentions.filter(
      (t) => t.category === "kol"
    ).length;
    const researchMentions = currentMentions.filter(
      (t) => t.category === "research"
    ).length;
    const officialMentions = currentMentions.filter(
      (t) => t.category === "official"
    ).length;

    // Sentiment breakdown
    const sentimentBreakdown: Record<string, number> = {};
    for (const tweet of currentMentions) {
      const cls = classifyTweet(tweet.text);
      sentimentBreakdown[cls] = (sentimentBreakdown[cls] || 0) + 1;
    }

    // Top KOL tweets (most interesting)
    const topKolTweets = currentMentions
      .filter((t) => t.category === "kol" || t.category === "research")
      .slice(0, 5)
      .map((t) => ({
        author: t.author,
        authorLabel: t.authorLabel,
        text: t.text.slice(0, 280),
        url: t.url,
        classification: classifyTweet(t.text),
        published: t.published,
      }));

    return {
      entityKey: protocol.key,
      kol_mentions: kolMentions,
      kol_mentions_baseline: baselineMentions.filter(
        (t) => t.category === "kol"
      ).length,
      research_mentions: researchMentions,
      official_mentions: officialMentions,
      sentiment_breakdown: sentimentBreakdown,
      top_kol_tweets: topKolTweets,
    };
  });

  const withMentions = perProtocol.filter((r) => r.kol_mentions > 0);
  console.log(
    `[Twitter] Done: ${withMentions.length}/${protocols.length} protocols had KOL mentions`
  );

  return {
    perProtocol,
    allTweets: periodTweets,
    kolsReached,
    totalTweets: periodTweets.length,
  };
}
