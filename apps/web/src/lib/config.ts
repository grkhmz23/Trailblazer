/**
 * Typed configuration loader for server-only use.
 * Validates required env vars based on DEMO_MODE setting.
 */

function env(key: string, fallback?: string): string {
  const val = process.env[key];
  if (val !== undefined && val !== "") return val;
  if (fallback !== undefined) return fallback;
  return "";
}

function envBool(key: string, fallback: boolean): boolean {
  const val = process.env[key];
  if (val === undefined || val === "") return fallback;
  return val === "true" || val === "1";
}

export const config = {
  /** Core mode */
  demoMode: envBool("DEMO_MODE", !process.env.MOONSHOT_API_KEY),
  nodeEnv: env("NODE_ENV", "development"),

  /** Database */
  databaseUrl: env("DATABASE_URL"),

  /** Security */
  adminToken: env("ADMIN_TOKEN", ""),

  /** LLM — Moonshot Kimi */
  moonshotApiKey: env("MOONSHOT_API_KEY"),
  moonshotModel: env("MOONSHOT_MODEL", "kimi-k2-turbo-preview"),

  /** Optional data source keys */
  heliusApiKey: env("HELIUS_API_KEY"),
  heliusRpcUrl: env("HELIUS_RPC_URL"),
  githubToken: env("GITHUB_TOKEN"),
  twitterBearerToken: env("TWITTER_BEARER_TOKEN"),
  redditClientId: env("REDDIT_CLIENT_ID"),
  redditClientSecret: env("REDDIT_CLIENT_SECRET"),

  /** Derived checks */
  get hasLlm(): boolean {
    return !this.demoMode && !!this.moonshotApiKey;
  },
  get hasHelius(): boolean {
    return !!this.heliusApiKey;
  },
  get hasGithub(): boolean {
    return !!this.githubToken;
  },
} as const;

export type AppConfig = typeof config;
