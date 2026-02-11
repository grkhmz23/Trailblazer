/**
 * Twitter / X KOL Signal Ingestor.
 *
 * Monitors 90+ Solana ecosystem Key Opinion Leaders via public RSS proxies
 * (Nitter instances) and extracts narrative signals from their posts.
 *
 * KOL tiers:
 *  - core_team: Solana co-founders, Labs, Foundation
 *  - protocol_founder: Founders/CEOs of top Solana projects
 *  - vc_researcher: Crypto VCs and research firms
 *  - dev_advocate: DevRel, Superteam, educators, podcasters
 *  - mega_influencer: Market-moving accounts (Elon, CZ, etc.)
 *  - ct_alpha: Crypto Twitter alpha callers with Solana focus
 *
 * Falls back gracefully if proxies are down.
 */

import { type TrackedProtocol } from "../protocols";

const FEED_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 600;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type KolCategory = "kol" | "official" | "research";

/** Map Grok tiers to our internal categories */
function tierToCategory(tier: string): KolCategory {
  switch (tier) {
    case "core_team":
    case "protocol_founder":
      return "official";
    case "vc_researcher":
      return "research";
    default:
      return "kol";
  }
}

/** Solana ecosystem KOL accounts to monitor */
export const SOLANA_KOLS: Array<{ handle: string; label: string; category: KolCategory }> = [
  // ─── Core Solana Leadership ────────────────────────
  { handle: "aeyakovenko", label: "Toly (Solana Co-founder)", category: "official" },
  { handle: "rajgokal", label: "Raj Gokal (Solana Co-founder)", category: "official" },
  { handle: "solanalabs", label: "Solana Labs", category: "official" },
  { handle: "solanafndn", label: "Solana Foundation", category: "official" },

  // ─── Protocol Founders / Official Accounts ─────────
  { handle: "0xMert_", label: "Mert (Helius CEO)", category: "official" },
  { handle: "weremeow", label: "Meow (Jupiter Founder)", category: "official" },
  { handle: "cindylblock", label: "Cindy Leow (Drift Founder)", category: "official" },
  { handle: "lucasbruder", label: "Lucas Bruder (Jito CEO)", category: "official" },
  { handle: "JupiterExchange", label: "Jupiter", category: "official" },
  { handle: "DriftProtocol", label: "Drift", category: "official" },
  { handle: "marinade_finance", label: "Marinade Finance", category: "official" },
  { handle: "jito_labs", label: "Jito Labs", category: "official" },
  { handle: "ilialexeev", label: "Ilia Alexeev (Tensor Founder)", category: "official" },
  { handle: "tensor_hq", label: "Tensor", category: "official" },
  { handle: "metaplex", label: "Metaplex", category: "official" },
  { handle: "PythNetwork", label: "Pyth Network", category: "official" },
  { handle: "wormholecrypto", label: "Wormhole", category: "official" },
  { handle: "wormhole", label: "Wormhole Official", category: "official" },
  { handle: "yutaro_xyz", label: "Yutaro (Orca Founder)", category: "official" },
  { handle: "orca_so", label: "Orca", category: "official" },
  { handle: "RaydiumProtocol", label: "Raydium", category: "official" },
  { handle: "MeteoraAG", label: "Meteora", category: "official" },
  { handle: "phoenixv1ex", label: "Phoenix", category: "official" },
  { handle: "marginfi", label: "Marginfi", category: "official" },
  { handle: "KaminoFinance", label: "Kamino Finance", category: "official" },
  { handle: "sanctumso", label: "Sanctum", category: "official" },
  { handle: "SquadsProtocol", label: "Squads", category: "official" },
  { handle: "lightprotocol", label: "Light Protocol", category: "official" },
  { handle: "helium", label: "Helium", category: "official" },
  { handle: "heliuslabs", label: "Helius Labs", category: "official" },
  { handle: "phantom", label: "Phantom", category: "official" },
  { handle: "backpack", label: "Backpack", category: "official" },
  { handle: "MagicEden", label: "Magic Eden", category: "official" },
  { handle: "bonk_inu", label: "Bonk", category: "official" },
  { handle: "pumpdotfun", label: "Pump.fun", category: "official" },
  { handle: "rendernetwork", label: "Render Network", category: "official" },
  { handle: "hivemapper", label: "Hivemapper", category: "official" },
  { handle: "eash0x", label: "Eash (Pye Finance)", category: "official" },

  // ─── VC / Research ─────────────────────────────────
  { handle: "ElectricCapital", label: "Electric Capital", category: "research" },
  { handle: "MessariCrypto", label: "Messari", category: "research" },
  { handle: "MulticoinCap", label: "Multicoin Capital", category: "research" },
  { handle: "KyleSamani", label: "Kyle Samani (Multicoin)", category: "research" },
  { handle: "placeholdervc", label: "Placeholder VC", category: "research" },
  { handle: "cburniske", label: "Chris Burniske (Placeholder)", category: "research" },
  { handle: "JumpCrypto", label: "Jump Crypto", category: "research" },
  { handle: "dragonfly_xyz", label: "Dragonfly", category: "research" },
  { handle: "a16zcrypto", label: "a16z Crypto", category: "research" },
  { handle: "polychain", label: "Polychain", category: "research" },
  { handle: "PanteraCapital", label: "Pantera Capital", category: "research" },
  { handle: "paradigm", label: "Paradigm", category: "research" },
  { handle: "galaxyhq", label: "Galaxy Digital", category: "research" },
  { handle: "LowBeta_", label: "Zach Pandl (Grayscale)", category: "research" },

  // ─── Dev Advocates / Educators / Podcasters ────────
  { handle: "superteamdao", label: "Superteam", category: "kol" },
  { handle: "solana_devs", label: "Solana Devs", category: "kol" },
  { handle: "Lightspeedpodhq", label: "Lightspeed Podcast", category: "kol" },
  { handle: "nickwh8te", label: "Nick White (Educator)", category: "kol" },
  { handle: "amiravalliani", label: "Amir (Solana Growth)", category: "kol" },
  { handle: "afkehaya", label: "Alex Kehaya (Podcast)", category: "kol" },
  { handle: "nickyscanz", label: "Nicky Scanz (Podcast)", category: "kol" },
  { handle: "GivnerAriel", label: "Ariel Givner (Legal)", category: "kol" },
  { handle: "armaborjess", label: "Armani Ferrante", category: "kol" },
  { handle: "CantelopePeel", label: "Cantelope Peel", category: "kol" },
  { handle: "solblaze_org", label: "SolBlaze", category: "kol" },
  { handle: "akshaybd", label: "Akshay Sriram", category: "kol" },

  // ─── Mega Influencers ──────────────────────────────
  { handle: "elonmusk", label: "Elon Musk", category: "kol" },
  { handle: "cz_binance", label: "CZ (Binance)", category: "kol" },
  { handle: "VitalikButerin", label: "Vitalik Buterin", category: "kol" },
  { handle: "brian_armstrong", label: "Brian Armstrong (Coinbase)", category: "kol" },
  { handle: "APompliano", label: "Anthony Pompliano", category: "kol" },
  { handle: "balajis", label: "Balaji Srinivasan", category: "kol" },

  // ─── CT Alpha / Solana-focused ─────────────────────
  { handle: "blknoiz06", label: "Ansem", category: "kol" },
  { handle: "inversebrah", label: "Inversebrah", category: "kol" },
  { handle: "ZackXBT", label: "ZachXBT (Investigator)", category: "kol" },
  { handle: "Ash_crypto", label: "Ash Crypto", category: "kol" },
  { handle: "SolBigBrain", label: "SolBigBrain", category: "kol" },
  { handle: "SolanaFloor", label: "SolanaFloor (News)", category: "kol" },
  { handle: "SolanaSensei", label: "Solana Sensei", category: "kol" },
  { handle: "cryptophilienne", label: "CryptoPhilienne", category: "kol" },
  { handle: "defi_kay_", label: "Defi Kay (Podcast)", category: "kol" },
  { handle: "DegenPing", label: "DegenPing", category: "kol" },
  { handle: "CryptoCobain", label: "CryptoCobain", category: "kol" },
  { handle: "AltcoinDailyio", label: "Altcoin Daily", category: "kol" },
  { handle: "LarkDavis", label: "Lark Davis", category: "kol" },
  { handle: "mozzacrypto", label: "Mozza Crypto", category: "kol" },
  { handle: "AltcoinGordon", label: "Altcoin Gordon", category: "kol" },
  { handle: "CryptoWendyO", label: "CryptoWendyO", category: "kol" },
  { handle: "ErikVoorhees", label: "Erik Voorhees", category: "kol" },
  { handle: "WhalePanda", label: "WhalePanda", category: "kol" },
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
  category: KolCategory;
}

/**
 * Fetch RSS feed from a nitter instance for a given handle.
 * Tries multiple instances until one works.
 */
async function fetchKolFeed(
  handle: string,
  label: string,
  category: KolCategory
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
  category: KolCategory
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
        .match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ??
      block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
      "";

    if (title) {
      items.push({
        author: handle,
        authorLabel: label,
        text: decodeEntities(title + " " + desc).slice(0, 600),
        url: link.replace(/nitter\.[^/]+/, "x.com"),
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
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keywords indicating Solana narrative relevance */
const SOLANA_KEYWORDS = [
  "solana", "sol", "$sol",
  "defi", "nft", "depin", "blink",
  "compressed", "zk compression", "firedancer",
  "token extensions", "restaking", "liquid staking",
  "mev", "jito", "jupiter", "drift",
  "marinade", "raydium", "orca", "meteora",
  "tensor", "metaplex", "helium", "pyth",
  "wormhole", "phantom", "backpack",
  "madlads", "bonk", "jup", "pump.fun",
  "memecoin", "airdrop", "svm",
  "validator", "rpc", "helius", "quicknode",
  "anchor", "seahorse", "clockwork",
  "squads", "realms", "dao", "governance",
  "staking", "yield", "perps",
  "orderbook", "amm", "clmm", "dlmm",
  "payments", "payfi", "ai agent",
  "on-chain", "onchain", "mainnet", "devnet",
  "breakpoint", "superteam",
  "kamino", "marginfi", "sanctum", "phoenix",
  "zeta", "parcl", "flash trade",
  "render", "hivemapper", "dogwifhat", "wif",
  "popcat", "bonk", "moonshot",
  "magic eden", "ondo", "dflow", "genopets",
  "pyusd", "rwa", "tokenization",
  "light protocol", "switchboard",
  "grizzlython", "hyperdrive", "colosseum",
  "saga", "seeker", "solana mobile",
  "tip router", "stakenet", "mrgn",
  "blazestake", "solblaze",
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
    lower.includes("\u{1F680}") ||
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

    const kolMentions = currentMentions.filter(
      (t) => t.category === "kol"
    ).length;
    const researchMentions = currentMentions.filter(
      (t) => t.category === "research"
    ).length;
    const officialMentions = currentMentions.filter(
      (t) => t.category === "official"
    ).length;

    const sentimentBreakdown: Record<string, number> = {};
    for (const tweet of currentMentions) {
      const cls = classifyTweet(tweet.text);
      sentimentBreakdown[cls] = (sentimentBreakdown[cls] || 0) + 1;
    }

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
