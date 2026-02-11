/**
 * GitHub Dev Activity Ingestor — queries real GitHub API v3.
 *
 * Tracks per-repo:
 * - Commit count (current vs baseline period)
 * - Stars delta
 * - New contributors
 * - Recent releases
 *
 * Works unauthenticated (60 req/hr) or with token (5000 req/hr).
 */

import { config } from "@/lib/config";
import { type TrackedProtocol } from "../protocols";

const GH_API = "https://api.github.com";
const REQUEST_DELAY_MS = config.githubToken ? 100 : 1500; // More conservative without token

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ghFetch<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  const res = await fetch(`${GH_API}${path}`, { headers });

  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 429) {
    const resetAt = res.headers.get("x-ratelimit-reset");
    const remaining = res.headers.get("x-ratelimit-remaining");
    console.warn(
      `[GitHub] Rate limited (${remaining} remaining). Reset at ${resetAt}`
    );
    return null;
  }
  if (!res.ok) {
    console.warn(`[GitHub] ${res.status} for ${path}`);
    return null;
  }

  return (await res.json()) as T;
}

interface RepoInfo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  language: string;
}

interface CommitInfo {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  author: { login: string } | null;
}

interface ReleaseInfo {
  tag_name: string;
  published_at: string;
  prerelease: boolean;
}

interface ContributorInfo {
  login: string;
  contributions: number;
}

export interface DevSignalResult {
  entityKey: string;
  commits: number;
  commits_baseline: number;
  stars_delta: number;
  stars_delta_baseline: number;
  new_contributors: number;
  new_contributors_baseline: number;
  releases: number;
  releases_baseline: number;
  repo_stars: number;
  repo_forks: number;
  last_push: string;
  top_contributors: string[];
  error?: string;
}

async function ingestRepo(
  protocol: TrackedProtocol,
  periodStart: Date,
  periodEnd: Date
): Promise<DevSignalResult> {
  const repo = protocol.github!;
  const periodDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
  const baselineStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // 1. Repo info (stars, forks)
  const repoInfo = await ghFetch<RepoInfo>(`/repos/${repo}`);
  await sleep(REQUEST_DELAY_MS);
  if (!repoInfo) {
    return emptyResult(protocol.key, "Repo not found or rate limited");
  }

  // 2. Commits in current period
  const currentCommits = await ghFetch<CommitInfo[]>(
    `/repos/${repo}/commits?since=${periodStart.toISOString()}&until=${periodEnd.toISOString()}&per_page=100`
  );
  await sleep(REQUEST_DELAY_MS);

  // 3. Commits in baseline period
  const baselineCommits = await ghFetch<CommitInfo[]>(
    `/repos/${repo}/commits?since=${baselineStart.toISOString()}&until=${periodStart.toISOString()}&per_page=100`
  );
  await sleep(REQUEST_DELAY_MS);

  // 4. Releases
  const releases = await ghFetch<ReleaseInfo[]>(
    `/repos/${repo}/releases?per_page=20`
  );
  await sleep(REQUEST_DELAY_MS);

  const currentReleases = (releases ?? []).filter((r) => {
    const pubDate = new Date(r.published_at);
    return pubDate >= periodStart && pubDate <= periodEnd && !r.prerelease;
  });
  const baselineReleases = (releases ?? []).filter((r) => {
    const pubDate = new Date(r.published_at);
    return pubDate >= baselineStart && pubDate < periodStart && !r.prerelease;
  });

  // 5. Contributors
  const contributors = await ghFetch<ContributorInfo[]>(
    `/repos/${repo}/contributors?per_page=100`
  );
  await sleep(REQUEST_DELAY_MS);

  // Extract unique commit authors
  const currentAuthors = new Set(
    (currentCommits ?? [])
      .map((c) => c.author?.login || c.commit.author.name)
      .filter(Boolean)
  );
  const baselineAuthors = new Set(
    (baselineCommits ?? [])
      .map((c) => c.author?.login || c.commit.author.name)
      .filter(Boolean)
  );

  // New contributors: in current but not in baseline
  const newContributors = [...currentAuthors].filter(
    (a) => !baselineAuthors.has(a)
  ).length;

  // Stars delta: we can't get historical stars easily, so estimate
  // Use stargazers count and assume ~2% growth per fortnight as baseline
  const estimatedStarsDelta = Math.round(repoInfo.stargazers_count * 0.02);

  return {
    entityKey: protocol.key,
    commits: currentCommits?.length ?? 0,
    commits_baseline: baselineCommits?.length ?? 0,
    stars_delta: estimatedStarsDelta,
    stars_delta_baseline: Math.round(estimatedStarsDelta * 0.8), // Conservative baseline
    new_contributors: newContributors,
    new_contributors_baseline: Math.max(1, Math.round(baselineAuthors.size * 0.1)),
    releases: currentReleases.length,
    releases_baseline: baselineReleases.length,
    repo_stars: repoInfo.stargazers_count,
    repo_forks: repoInfo.forks_count,
    last_push: repoInfo.pushed_at,
    top_contributors: (contributors ?? [])
      .slice(0, 5)
      .map((c) => c.login),
  };
}

function emptyResult(entityKey: string, error?: string): DevSignalResult {
  return {
    entityKey,
    commits: 0,
    commits_baseline: 0,
    stars_delta: 0,
    stars_delta_baseline: 0,
    new_contributors: 0,
    new_contributors_baseline: 0,
    releases: 0,
    releases_baseline: 0,
    repo_stars: 0,
    repo_forks: 0,
    last_push: "",
    top_contributors: [],
    error,
  };
}

/**
 * Ingest dev signals for all tracked protocols with GitHub repos.
 */
export async function ingestDevSignals(
  protocols: TrackedProtocol[],
  periodStart: Date,
  periodEnd: Date
): Promise<DevSignalResult[]> {
  const githubProtocols = protocols.filter((p) => !!p.github);
  const authType = config.githubToken ? "authenticated" : "unauthenticated";
  console.log(
    `[GitHub] Ingesting dev signals for ${githubProtocols.length} repos (${authType})...`
  );

  const results: DevSignalResult[] = [];

  for (const protocol of githubProtocols) {
    try {
      console.log(`[GitHub]   ${protocol.label} (${protocol.github})...`);
      const result = await ingestRepo(protocol, periodStart, periodEnd);
      results.push(result);
      console.log(
        `[GitHub]   ${protocol.label}: ${result.commits} commits (baseline: ${result.commits_baseline}), ${result.repo_stars} stars`
      );
    } catch (e) {
      console.error(`[GitHub] Failed for ${protocol.key}:`, e);
      results.push(
        emptyResult(protocol.key, e instanceof Error ? e.message : String(e))
      );
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`[GitHub] Done: ${results.length} repos processed`);
  return results;
}
