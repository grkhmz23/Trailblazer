/**
 * Social / RSS Signal Ingestor.
 *
 * Scrapes public RSS feeds and Solana ecosystem aggregators
 * to detect social mentions and sentiment per protocol.
 * No API keys required — uses public feeds only.
 */

import { type TrackedProtocol } from "../protocols";

const REQUEST_DELAY_MS = 500;
const FEED_TIMEOUT_MS = 8000;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Solana ecosystem RSS / Atom feeds */
const RSS_FEEDS = [
  "https://solana.com/news/rss.xml",
  "https://www.theblock.co/rss/all",
  "https://cointelegraph.com/rss",
  "https://rss.app/feeds/v1.1/solana-news.json",
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://decrypt.co/feed",
  "https://blockworks.co/rss",
  "https://messari.io/rss",
];

/** Simple feed item structure */
interface FeedItem {
  title: string;
  link: string;
  published: string;
  content: string;
}

/**
 * Fetch and parse an RSS/Atom feed — simple regex-based parser.
 * No external dependencies needed.
 */
async function fetchFeed(url: string): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Trailblazer/1.0 (Solana Narrative Hunter)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const text = await res.text();
    const items: FeedItem[] = [];

    // RSS 2.0 parser
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>(.*?)<\/title>/)?.[1]
        ?? "";
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? block.match(/<description>(.*?)<\/description>/)?.[1]
        ?? "";

      if (title) {
        items.push({
          title: decodeEntities(title),
          link,
          published: pubDate,
          content: decodeEntities(desc).slice(0, 500),
        });
      }
    }

    // Atom parser fallback
    if (items.length === 0) {
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      while ((match = entryRegex.exec(text)) !== null) {
        const block = match[1];
        const title = block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? "";
        const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ?? "";
        const published = block.match(/<published>(.*?)<\/published>/)?.[1]
          ?? block.match(/<updated>(.*?)<\/updated>/)?.[1]
          ?? "";
        const content = block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? "";

        if (title) {
          items.push({
            title: decodeEntities(title),
            link,
            published,
            content: decodeEntities(content).slice(0, 500),
          });
        }
      }
    }

    return items;
  } catch (e) {
    console.warn(`[Social] Failed to fetch feed ${url}:`, e);
    return [];
  }
}

function safeHostname(url: string): string {
  try {
    return new URL(url || "https://unknown.com").hostname;
  } catch {
    return "unknown";
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export interface SocialSignalResult {
  entityKey: string;
  mentions_count: number;
  mentions_count_baseline: number;
  unique_authors: number;
  unique_authors_baseline: number;
  engagement_score: number;
  engagement_score_baseline: number;
  snippets: Array<{
    text: string;
    url: string;
    source: string;
    classification: "announcement" | "pain_point" | "question" | "hype" | "discussion";
  }>;
}

/**
 * Classify a snippet based on simple keyword heuristics.
 */
function classifySnippet(
  text: string
): "announcement" | "pain_point" | "question" | "hype" | "discussion" {
  const lower = text.toLowerCase();
  if (lower.includes("bug") || lower.includes("issue") || lower.includes("broken") || lower.includes("error") || lower.includes("problem")) {
    return "pain_point";
  }
  if (lower.includes("?") || lower.includes("how to") || lower.includes("anyone know")) {
    return "question";
  }
  if (lower.includes("launch") || lower.includes("release") || lower.includes("announce") || lower.includes("introducing") || lower.includes("upgrade")) {
    return "announcement";
  }
  if (lower.includes("\u{1F680}") || lower.includes("moon") || lower.includes("bullish") || lower.includes("lfg") || lower.includes("alpha")) {
    return "hype";
  }
  return "discussion";
}

/**
 * Check if a feed item mentions a specific protocol.
 */
function mentionsProtocol(item: FeedItem, protocol: TrackedProtocol): boolean {
  const searchText = `${item.title} ${item.content}`.toLowerCase();
  const searchTerms = [
    protocol.label.toLowerCase(),
    protocol.key.toLowerCase(),
    ...protocol.label.toLowerCase().split(/[\s-]+/).filter((w) => w.length > 3),
  ];
  return searchTerms.some((term) => searchText.includes(term));
}

/**
 * Ingest social signals from RSS feeds for all protocols.
 */
export async function ingestSocialSignals(
  protocols: TrackedProtocol[],
  periodStart: Date,
  periodEnd: Date
): Promise<SocialSignalResult[]> {
  console.log(`[Social] Fetching ${RSS_FEEDS.length} RSS feeds...`);

  const allItems: FeedItem[] = [];
  for (const feed of RSS_FEEDS) {
    const items = await fetchFeed(feed);
    console.log(`[Social] ${safeHostname(feed)}: ${items.length} items`);
    allItems.push(...items);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`[Social] ${allItems.length} total feed items fetched`);

  // Filter by date range
  const periodItems = allItems.filter((item) => {
    try {
      const pubDate = new Date(item.published);
      return pubDate >= periodStart && pubDate <= periodEnd;
    } catch {
      return false;
    }
  });

  const periodDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
  const baselineStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const baselineItems = allItems.filter((item) => {
    try {
      const pubDate = new Date(item.published);
      return pubDate >= baselineStart && pubDate < periodStart;
    } catch {
      return false;
    }
  });

  console.log(
    `[Social] ${periodItems.length} items in period, ${baselineItems.length} in baseline`
  );

  // Match items to protocols
  const results: SocialSignalResult[] = protocols.map((protocol) => {
    const currentMentions = periodItems.filter((item) =>
      mentionsProtocol(item, protocol)
    );
    const baselineMentions = baselineItems.filter((item) =>
      mentionsProtocol(item, protocol)
    );

    const currentSources = new Set(currentMentions.map((m) => m.link));
    const baselineSources = new Set(baselineMentions.map((m) => m.link));

    const engagementCurrent = currentMentions.reduce(
      (sum, m) => sum + Math.min(m.content.length, 500) / 100,
      0
    );
    const engagementBaseline = baselineMentions.reduce(
      (sum, m) => sum + Math.min(m.content.length, 500) / 100,
      0
    );

    const snippets = currentMentions.slice(0, 8).map((item) => ({
      text: `${item.title}: ${item.content.slice(0, 200)}`,
      url: item.link,
      source: safeHostname(item.link),
      classification: classifySnippet(`${item.title} ${item.content}`),
    }));

    return {
      entityKey: protocol.key,
      mentions_count: currentMentions.length,
      mentions_count_baseline: baselineMentions.length,
      unique_authors: currentSources.size,
      unique_authors_baseline: baselineSources.size,
      engagement_score: engagementCurrent,
      engagement_score_baseline: engagementBaseline,
      snippets,
    };
  });

  const withMentions = results.filter((r) => r.mentions_count > 0);
  console.log(
    `[Social] Done: ${withMentions.length}/${protocols.length} protocols had mentions`
  );

  return results;
}
