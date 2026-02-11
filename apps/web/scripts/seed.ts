#!/usr/bin/env tsx
/**
 * Seed script — generates a complete demo fortnight report in the database.
 *
 * Usage:
 *   pnpm seed:demo          (from repo root)
 *   npx tsx scripts/seed.ts (from apps/web/)
 *
 * This creates a full report with narratives, evidence, investigation steps,
 * and build ideas so the dashboard is populated on first load.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const FIXTURES = path.resolve(__dirname, "../../../fixtures");

function loadFixture<T>(name: string): T {
  const raw = fs.readFileSync(path.join(FIXTURES, name), "utf-8");
  return JSON.parse(raw) as T;
}

// ─── Demo data ────────────────────────────────────────────

interface Signal {
  key: string;
  label: string;
  kind: string;
  first_seen: string;
  onchain: Record<string, number>;
  dev: Record<string, number>;
  social: Record<string, unknown>;
}

const NARRATIVES = [
  {
    title: "ZK Compression & State Cost Revolution",
    summary:
      "Light Protocol's ZK compression is driving a fundamental shift in Solana's state economics. With 1000x cost reduction for token accounts, we're seeing rapid SDK adoption across major DeFi protocols. The compression primitives are enabling new application patterns previously impossible due to state rent costs — from mass airdrops to on-chain order books with millions of entries.",
    momentum: 0.92,
    novelty: 0.85,
    saturation: 0.31,
    members: ["light-protocol-zk", "solana-program-library/token-2022"],
    evidence: [
      { type: "dev", title: "Light Protocol SDK adoption +340%", url: "https://github.com/Light-Protocol/light-protocol", snippet: "light-sdk crate adoption increased 340% across tracked repos (from 5 to 22 repos importing it). Notable new adopters: Jupiter, Drift, Tensor." },
      { type: "idl_diff", title: "4 new compression instructions", url: "", snippet: "compress_tokens_batch, decompress_with_proof, update_merkle_tree_batch, verify_inclusion_proof added to Light Protocol IDL." },
      { type: "onchain", title: "Compressed account transactions surge", url: "", snippet: "2,847 compressed token transactions in the period, up from 312 in the prior baseline." },
      { type: "social", title: "Developer discussion on state costs", url: "", snippet: "Multiple threads discussing ZK compression migration patterns and cost savings." },
    ],
    investigation: [
      { tool: "repo_inspector", input: { entity_key: "light-protocol-zk" }, output: "Repository: Light-Protocol/light-protocol — ZK compression system for Solana achieving 1000x state cost reduction through Merkle tree compression. Stars: 892, Forks: 145. Recent commits: feat: batch compression for token transfers; fix: concurrent Merkle tree updates.", links: ["https://github.com/Light-Protocol/light-protocol"] },
      { tool: "idl_differ", input: { entity_key: "light-protocol-zk", protocol: "Light Protocol" }, output: "IDL diff detected: 4 new instructions (compress_tokens_batch, decompress_with_proof, update_merkle_tree_batch, verify_inclusion_proof). Major expansion of compressed account primitives.", links: [] },
      { tool: "dependency_tracker", input: { entity_key: "light-protocol-zk" }, output: "light-sdk crate adoption increased 340% across tracked repos (from 5 to 22 repos importing it). Notable new adopters: Jupiter, Drift, Tensor.", links: [] },
      { tool: "social_pain_finder", input: { entity_key: "light-protocol-zk", snippet_count: 8 }, output: "Social analysis: 8 snippets analyzed. Distribution: 2 announcements, 3 pain points, 2 questions, 1 hype. Key pain points: Migration from standard accounts to compressed is complex; Documentation for batch operations is incomplete.", links: [] },
    ],
    ideas: [
      {
        title: "CompressedDEX — On-Chain Order Book with Millions of Entries",
        pitch: "Build a fully on-chain CLOB DEX using ZK compressed state to store millions of orders at negligible cost.",
        targetUser: "DeFi traders seeking deep on-chain liquidity",
        mvpScope: "Compressed limit order book for SOL/USDC with place, cancel, and match operations",
        whyNow: "Light SDK adoption just hit critical mass (340% growth). Compressed token primitives now stable.",
        validation: "Pain points confirm demand for deeper on-chain liquidity. 15+ DeFi protocols already importing Light SDK.",
        saturation: { level: "low", score: 0.28, neighbors: [{ name: "Phoenix", similarity: 0.42, url: "https://phoenix.trade" }, { name: "OpenBook", similarity: 0.38, url: "https://openbookdex.com" }, { name: "Serum", similarity: 0.35, url: "" }] },
        pivot: "",
      },
      {
        title: "AirDrop Engine — Million-Recipient Token Distribution",
        pitch: "Token distribution platform using ZK compression to airdrop to 1M+ wallets at <$100 total cost.",
        targetUser: "Token projects and DAOs running community reward programs",
        mvpScope: "Web UI for CSV upload + compressed token mint and batch distribution via Light Protocol",
        whyNow: "Compressed token accounts reduce per-recipient cost from ~0.002 SOL to ~0.000002 SOL.",
        validation: "Multiple social mentions of airdrop cost complaints. Recent large airdrops exceeded $50K in state rent.",
        saturation: { level: "low", score: 0.22, neighbors: [{ name: "Streamflow", similarity: 0.34, url: "https://streamflow.finance" }, { name: "Dialect", similarity: 0.28, url: "https://dialect.to" }, { name: "Helius", similarity: 0.25, url: "https://helius.dev" }] },
        pivot: "",
      },
      {
        title: "StateZip — Developer Tooling for ZK State Migration",
        pitch: "CLI + SDK that helps existing Solana protocols migrate on-chain state to ZK compressed accounts.",
        targetUser: "Solana protocol developers looking to reduce state costs",
        mvpScope: "CLI tool that analyzes Solana program account structures and generates Light Protocol migration code",
        whyNow: "Compression primitives are stable but migration tooling is nonexistent. First-mover advantage.",
        validation: "GitHub issues on Light Protocol show developer confusion about integration patterns.",
        saturation: { level: "low", score: 0.18, neighbors: [{ name: "Anchor", similarity: 0.31, url: "https://anchor-lang.com" }, { name: "Metaplex", similarity: 0.24, url: "https://metaplex.com" }, { name: "Solita", similarity: 0.21, url: "" }] },
        pivot: "",
      },
    ],
  },
  {
    title: "Perpetual DEX Infrastructure War",
    summary:
      "Jupiter Perps V2 and competing protocols are racing to build next-gen perpetual futures infrastructure on Solana. New IDL additions for partial fills, TP/SL orders, and batch PnL settlement signal a maturing derivatives layer. SDK adoption is surging among trading bots and aggregators.",
    momentum: 0.88,
    novelty: 0.62,
    saturation: 0.55,
    members: ["jupiter-perps-v2", "drift-dlob-server", "phoenix-seat-manager"],
    evidence: [
      { type: "dev", title: "Jupiter Perps SDK adoption +120%", url: "https://github.com/jup-ag/jupiter-core", snippet: "jupiter-perps-sdk adoption increased 120% (from 15 to 33 repos). Most adopters are trading bots and aggregator frontends." },
      { type: "idl_diff", title: "3 new Jupiter instructions", url: "", snippet: "place_perp_order_v2, modify_tp_sl, settle_pnl_batch added. initialize_market gained max_leverage param." },
      { type: "social", title: "Trader feedback on perp UX", url: "", snippet: "Multiple traders requesting better position monitoring and cross-venue aggregation." },
    ],
    investigation: [
      { tool: "repo_inspector", input: { entity_key: "jupiter-perps-v2" }, output: "Repository: jup-ag/jupiter-core — Jupiter V2 introduces perpetual futures with up to 100x leverage. Stars: 1,247, Forks: 312. Recent commits: feat: add partial fill support.", links: ["https://github.com/jup-ag/jupiter-core"] },
      { tool: "idl_differ", input: { entity_key: "jupiter-perps-v2", protocol: "Jupiter" }, output: "IDL diff: 3 new instructions (place_perp_order_v2, modify_tp_sl, settle_pnl_batch). 2 modified. PerpMarket gained funding_rate_velocity field.", links: [] },
      { tool: "dependency_tracker", input: { entity_key: "jupiter-perps-v2" }, output: "jupiter-perps-sdk adoption +120% (15 → 33 repos). Most adopters are trading bots and aggregator frontends.", links: [] },
      { tool: "social_pain_finder", input: { entity_key: "jupiter-perps-v2", snippet_count: 6 }, output: "Social analysis: 6 snippets. 1 pain point, 2 questions, 2 hype, 1 announcement. Pain: Checking multiple perp venues manually is tedious.", links: [] },
      { tool: "competitor_search", input: { idea_text: "Perp aggregation" }, output: "Saturation: MEDIUM (55%). Nearest: Drift (68%), Jupiter (62%), Zeta (51%). Active competition but aggregation layer is underserved.", links: [] },
    ],
    ideas: [
      {
        title: "PerpAggregator — Best Execution Across Solana Perp Venues",
        pitch: "Aggregation layer routing perp orders across Jupiter, Drift, and Phoenix for best execution.",
        targetUser: "Active perp traders managing positions across multiple Solana venues",
        mvpScope: "Smart routing for perp market orders across Jupiter Perps and Drift",
        whyNow: "Multiple perp venues now have sufficient liquidity. No aggregator exists yet.",
        validation: "Social analysis shows traders complaining about checking multiple UIs.",
        saturation: { level: "medium", score: 0.55, neighbors: [{ name: "Drift", similarity: 0.68, url: "https://drift.trade" }, { name: "Jupiter", similarity: 0.62, url: "https://jup.ag" }, { name: "Zeta Markets", similarity: 0.51, url: "https://zeta.markets" }] },
        pivot: "Market has active competition. Differentiate by focusing on smart order routing algorithms and cross-venue portfolio management — areas where existing players are weakest.",
      },
      {
        title: "RiskDash — Real-Time Perp Portfolio Risk Monitor",
        pitch: "Dashboard + alerts for perp traders: real-time PnL, liquidation distances, funding rate exposure.",
        targetUser: "Professional and semi-pro perp traders",
        mvpScope: "Read-only dashboard for Jupiter Perps V2 and Drift with liquidation alerts via Telegram",
        whyNow: "New V2 features (batch settlement, TP/SL) indicate institutional-grade activity. Risk tooling hasn't kept pace.",
        validation: "Pain point analysis found multiple requests for better position monitoring.",
        saturation: { level: "low", score: 0.32, neighbors: [{ name: "Step Finance", similarity: 0.41, url: "https://step.finance" }, { name: "Sonar Watch", similarity: 0.38, url: "https://sonar.watch" }, { name: "Birdeye", similarity: 0.35, url: "https://birdeye.so" }] },
        pivot: "",
      },
    ],
  },
  {
    title: "LST Unification & Yield Layer",
    summary:
      "Sanctum's Infinity Pool is creating a unified liquidity layer for all Solana LSTs, enabling instant swaps between any staking derivative. This is catalyzing a yield aggregation narrative, with 15 new protocol integrations in the tracked period.",
    momentum: 0.79,
    novelty: 0.71,
    saturation: 0.42,
    members: ["sanctum-infinity", "marinade-native-staking"],
    evidence: [
      { type: "dev", title: "Sanctum LST SDK +15 new integrations", url: "https://github.com/sanctum-so/sanctum", snippet: "sanctum-lst-sdk adopted by 15 new repos. Growth concentrated in yield aggregators." },
      { type: "onchain", title: "Infinity Pool TVL growth", url: "", snippet: "Total value locked in Sanctum Infinity Pool increased 340% in the period." },
      { type: "social", title: "LST yield comparison discussion", url: "", snippet: "Active discussion on optimal LST allocation strategies and yield differentials." },
    ],
    investigation: [
      { tool: "repo_inspector", input: { entity_key: "sanctum-infinity" }, output: "Repository: sanctum-so/sanctum — Infinity Pool for instant LST liquidity. Stars: 567, Forks: 89. Recent: permissionless LST onboarding.", links: ["https://github.com/sanctum-so/sanctum"] },
      { tool: "dependency_tracker", input: { entity_key: "sanctum-infinity" }, output: "sanctum-lst-sdk adopted by 15 new repos (8 → 23). Growth in yield aggregators and DeFi protocols.", links: [] },
      { tool: "social_pain_finder", input: { entity_key: "sanctum-infinity", snippet_count: 5 }, output: "Social analysis: 5 snippets. 1 pain point, 1 question, 2 announcements, 1 hype. Pain: Managing multiple LST positions is complex.", links: [] },
    ],
    ideas: [
      {
        title: "YieldRouter — Automatic LST Yield Optimization",
        pitch: "Automated vault routing staked SOL between LST providers based on real-time yield via Sanctum.",
        targetUser: "Passive SOL holders wanting maximum staking yield",
        mvpScope: "Vault contract holding LSTs and rebalancing weekly via Sanctum swaps based on trailing 7-day APY",
        whyNow: "Sanctum Infinity enables instant LST-to-LST swaps. Yield differential is 0.5-2% APY.",
        validation: "15 new Sanctum integrations confirm ecosystem readiness.",
        saturation: { level: "medium", score: 0.42, neighbors: [{ name: "Marinade", similarity: 0.58, url: "https://marinade.finance" }, { name: "Jito", similarity: 0.52, url: "https://jito.network" }, { name: "Lido", similarity: 0.45, url: "https://solana.lido.fi" }] },
        pivot: "Existing LST providers don't auto-optimize across protocols. Focus on the rebalancing layer specifically.",
      },
      {
        title: "LST Index — Diversified Liquid Staking Token",
        pitch: "Index token backed by a basket of Solana LSTs for diversified staking exposure.",
        targetUser: "DeFi protocols and institutional holders seeking diversified staking",
        mvpScope: "SPL token backed by equal-weight basket of top 5 LSTs, mintable via Sanctum routing",
        whyNow: "Permissionless LST onboarding means the landscape is expanding. Index products reduce selection risk.",
        validation: "On Ethereum, LST indexes have attracted $100M+ TVL. No equivalent on Solana.",
        saturation: { level: "low", score: 0.29, neighbors: [{ name: "Sanctum", similarity: 0.45, url: "https://sanctum.so" }, { name: "Marinade", similarity: 0.38, url: "https://marinade.finance" }, { name: "Jito", similarity: 0.35, url: "https://jito.network" }] },
        pivot: "",
      },
    ],
  },
  {
    title: "Validator Client Diversification",
    summary:
      "Firedancer's Frankendancer hybrid client is showing 50%+ TPS improvements on testnet, accelerating Solana's path to multi-client diversity. QUIC transport optimizations and new block scheduling algorithms are critical infrastructure milestones.",
    momentum: 0.85,
    novelty: 0.55,
    saturation: 0.15,
    members: ["firedancer-frankendancer"],
    evidence: [
      { type: "dev", title: "Firedancer testnet performance", url: "https://github.com/firedancer-io/firedancer", snippet: "Frankendancer hybrid showing 50%+ TPS improvement on testnet. QUIC transport optimization landed." },
      { type: "social", title: "Validator community discussion", url: "", snippet: "Active discussion about mainnet readiness timeline and performance benchmarks." },
    ],
    investigation: [
      { tool: "repo_inspector", input: { entity_key: "firedancer-frankendancer" }, output: "Repository: firedancer-io/firedancer — Independent Solana validator in C by Jump Crypto. Stars: 2,345, Forks: 234. Frankendancer hybrid on testnet.", links: ["https://github.com/firedancer-io/firedancer"] },
      { tool: "social_pain_finder", input: { entity_key: "firedancer-frankendancer", snippet_count: 4 }, output: "Social analysis: 4 snippets. 2 announcements, 1 question, 1 hype. Discussion focused on mainnet readiness.", links: [] },
    ],
    ideas: [
      {
        title: "ValidatorBench — Multi-Client Performance Dashboard",
        pitch: "Real-time dashboard comparing Solana validator client performance across implementations.",
        targetUser: "Validators evaluating client software and researchers tracking network health",
        mvpScope: "Dashboard tracking TPS, latency, and resource usage across Agave and Firedancer testnet nodes",
        whyNow: "Multi-client era is beginning. No unified performance comparison tool exists.",
        validation: "Validator community actively requesting benchmarking data.",
        saturation: { level: "low", score: 0.15, neighbors: [{ name: "Validators.app", similarity: 0.31, url: "https://validators.app" }, { name: "Stakewiz", similarity: 0.22, url: "https://stakewiz.com" }, { name: "Solana Beach", similarity: 0.19, url: "https://solanabeach.io" }] },
        pivot: "",
      },
    ],
  },
  {
    title: "Token Extensions & Programmable Assets",
    summary:
      "SPL Token-2022 adoption is accelerating with 89% growth in crate imports. Transfer hooks and confidential transfers are enabling compliant RWA tokenization and programmable transfer restrictions.",
    momentum: 0.74,
    novelty: 0.48,
    saturation: 0.52,
    members: ["solana-program-library/token-2022", "metaplex-token-metadata"],
    evidence: [
      { type: "dependency", title: "spl-token-2022 adoption +89%", url: "", snippet: "spl-token-2022 crate adoption increased 89% (34 → 64 repos). Transfer hook usage grew 250%." },
      { type: "social", title: "RWA tokenization discussion", url: "", snippet: "Growing institutional interest in Solana for compliant real-world asset tokenization." },
    ],
    investigation: [
      { tool: "repo_inspector", input: { entity_key: "solana-program-library/token-2022" }, output: "Active development on Token-2022 extensions. Transfer hooks and confidential transfers seeing adoption.", links: ["https://github.com/solana-labs/solana-program-library"] },
      { tool: "dependency_tracker", input: { entity_key: "solana-program-library/token-2022" }, output: "spl-token-2022 crate +89% (34 → 64 repos). Transfer hook usage +250% (8 → 28). Confidential transfers adopted by 12 new DeFi protocols.", links: [] },
    ],
    ideas: [
      {
        title: "HookForge — No-Code Transfer Hook Builder",
        pitch: "Visual builder for creating SPL Token-2022 transfer hooks without writing Rust code.",
        targetUser: "Token issuers needing programmable transfer rules (compliance, royalties, fees)",
        mvpScope: "Web UI with drag-and-drop conditions (allowlist, time-lock, fee) that generates and deploys transfer hook programs",
        whyNow: "Transfer hook usage grew 250% but the barrier to create custom hooks is high (requires Rust).",
        validation: "Dependency tracking shows demand. Developer forums show confusion about hook implementation.",
        saturation: { level: "low", score: 0.25, neighbors: [{ name: "Metaplex", similarity: 0.42, url: "https://metaplex.com" }, { name: "Underdog Protocol", similarity: 0.31, url: "https://underdogprotocol.com" }, { name: "Crossmint", similarity: 0.28, url: "https://crossmint.com" }] },
        pivot: "",
      },
      {
        title: "ComplianceLayer — RWA Transfer Restriction Engine",
        pitch: "Compliance middleware using Token-2022 transfer hooks for KYC-gated and jurisdiction-restricted token transfers.",
        targetUser: "Institutions and issuers tokenizing real-world assets on Solana",
        mvpScope: "Transfer hook program + admin dashboard for managing wallet allowlists and transfer restrictions",
        whyNow: "12 new DeFi protocols adopted confidential transfers. Institutional interest in Solana RWA is growing.",
        validation: "Social analysis confirms growing institutional demand for compliant on-chain infrastructure.",
        saturation: { level: "medium", score: 0.48, neighbors: [{ name: "Maple Finance", similarity: 0.56, url: "https://maple.finance" }, { name: "Credix", similarity: 0.52, url: "https://credix.finance" }, { name: "Ondo Finance", similarity: 0.48, url: "https://ondo.finance" }] },
        pivot: "RWA compliance is increasingly competitive. Differentiate by building specifically for Token-2022 hooks rather than custom programs.",
      },
    ],
  },
];

// ─── Action pack generator ──────────────────────────────

function generateActionPack(
  idea: (typeof NARRATIVES)[0]["ideas"][0],
  narrativeTitle: string,
): Record<string, string> {
  const specMd = `# ${idea.title}

## Overview
${idea.pitch}

## Target User
${idea.targetUser}

## Problem Statement
Current solutions in the Solana ecosystem are limited by state costs, fragmented liquidity, or lack of specialized tooling. ${idea.title} addresses this gap by providing a purpose-built solution that leverages recent protocol advancements.

## MVP Scope
${idea.mvpScope}

## Key Features
1. **Core Engine**: Implements the primary value proposition with production-grade Solana program integration
2. **User Interface**: Clean web dashboard for monitoring and interaction
3. **API Layer**: REST + WebSocket APIs for programmatic access
4. **Alerting**: Configurable notifications via Telegram and webhooks

## Success Metrics
- 100+ active users within first month
- Sub-second response time for core operations
- 99.9% uptime

## Why Now
${idea.whyNow}
`;

  const techMd = `# Technical Architecture — ${idea.title}

## Stack
- **On-chain**: Anchor framework (Rust) on Solana
- **Backend**: Node.js/TypeScript with Fastify
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: PostgreSQL + Redis
- **Infrastructure**: Docker, Railway or Vercel

## Architecture
\`\`\`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend    │────▶│   API Layer  │────▶│   Solana RPC  │
│  (Next.js)   │     │  (Fastify)   │     │  (Helius)     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                     ┌─────▼─────┐
                     │ PostgreSQL │
                     │  + Redis   │
                     └───────────┘
\`\`\`

## Security
- Anchor constraints for all program instructions
- Admin behind multisig (Squads Protocol)
- Rate limiting on API endpoints
- Security audit before mainnet
`;

  const milestonesMd = `# Milestones — ${idea.title}

## Phase 1: Foundation (Weeks 1-3)
- Set up monorepo (Anchor + Next.js)
- Implement core Solana program
- Test suite (>90% coverage)
- Deploy to devnet

## Phase 2: MVP (Weeks 4-6)
- API layer with auth
- Frontend dashboard
- Protocol integrations
- Bug fixes

## Phase 3: Beta (Weeks 7-9)
- Security audit
- Beta launch (50 users)
- Performance optimization
- Monitoring setup

## Phase 4: Launch (Weeks 10-12)
- Mainnet deployment
- Public launch
- Documentation
- Community building
`;

  const depsJson = JSON.stringify(
    {
      "@coral-xyz/anchor": "^0.30.0",
      "@solana/web3.js": "^1.91.0",
      "@solana/spl-token": "^0.4.0",
      next: "14.2.x",
      react: "^18.3.0",
      typescript: "^5.4.0",
      tailwindcss: "^3.4.0",
      prisma: "^5.14.0",
    },
    null,
    2,
  );

  return {
    "spec.md": specMd,
    "tech.md": techMd,
    "milestones.md": milestonesMd,
    "deps.json": depsJson,
  };
}

// ─── Main seed function ─────────────────────────────────

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  // Clean existing data
  console.log("  Clearing existing data...");
  await prisma.idea.deleteMany();
  await prisma.investigationStep.deleteMany();
  await prisma.narrativeEvidence.deleteMany();
  await prisma.narrative.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.report.deleteMany();
  console.log("  ✓ Database cleared\n");

  // Load demo signals for entity creation
  let signals: Signal[] = [];
  try {
    const raw = loadFixture<Record<string, unknown>>("demo_signals.json");
    // Fixture has {entities: [...], signals: {onchain: [...], dev: [...], social: [...]}}
    if (raw && typeof raw === "object" && "entities" in raw) {
      const entities = raw.entities as Array<Record<string, unknown>>;
      const sigData = raw.signals as Record<string, Array<Record<string, unknown>>>;
      const onchainMap = new Map((sigData?.onchain || []).map((s) => [s.entity_key as string, s]));
      const devMap = new Map((sigData?.dev || []).map((s) => [s.entity_key as string, s]));
      const socialMap = new Map((sigData?.social || []).map((s) => [s.entity_key as string, s]));

      signals = entities.map((ent) => {
        const key = ent.key as string;
        const oc = onchainMap.get(key) || {};
        const dv = devMap.get(key) || {};
        const sc = socialMap.get(key) || {};
        return {
          key,
          label: ent.label as string,
          kind: ent.kind as string,
          first_seen: ent.first_seen as string,
          onchain: Object.fromEntries(Object.entries(oc).filter(([k]) => k !== "entity_key")) as Record<string, number>,
          dev: Object.fromEntries(Object.entries(dv).filter(([k]) => k !== "entity_key")) as Record<string, number>,
          social: Object.fromEntries(Object.entries(sc).filter(([k]) => k !== "entity_key")) as Record<string, unknown>,
        };
      });
    } else if (Array.isArray(raw)) {
      signals = raw as unknown as Signal[];
    }
    console.log(`  Loaded ${signals.length} demo signals`);
  } catch (e) {
    console.warn("  ⚠ Could not load demo_signals.json:", e);
  }

  // Create report
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setHours(0, 0, 0, 0);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 14);

  const report = await prisma.report.create({
    data: {
      periodStart,
      periodEnd,
      status: "complete",
      configJson: { demo_mode: true, top_k: 20, max_narratives: 10 },
      hash: `demo_${Date.now().toString(36)}`,
    },
  });
  console.log(`  ✓ Report created: ${report.id}\n`);

  // Create entities from signals
  const entityMap = new Map<string, string>();
  for (const sig of signals) {
    const entity = await prisma.entity.create({
      data: {
        kind: sig.kind || "protocol",
        key: sig.key,
        label: sig.label,
        firstSeen: new Date(sig.first_seen || Date.now() - 30 * 86400000),
        metricsJson: { onchain: sig.onchain, dev: sig.dev },
      },
    });
    entityMap.set(sig.key, entity.id);
  }
  console.log(`  ✓ ${entityMap.size} entities created\n`);

  // Create narratives
  for (const narr of NARRATIVES) {
    console.log(`  Creating narrative: ${narr.title}`);

    const narrative = await prisma.narrative.create({
      data: {
        reportId: report.id,
        title: narr.title,
        summary: narr.summary,
        momentum: narr.momentum,
        novelty: narr.novelty,
        saturation: narr.saturation,
        scoresJson: { member_count: narr.members.length, member_labels: narr.members },
      },
    });

    // Create candidates for members
    for (const memberKey of narr.members) {
      const entityId = entityMap.get(memberKey);
      if (entityId) {
        await prisma.candidate.create({
          data: {
            reportId: report.id,
            entityId,
            momentum: narr.momentum + (Math.random() - 0.5) * 0.1,
            novelty: narr.novelty + (Math.random() - 0.5) * 0.1,
            quality: 0.85 + Math.random() * 0.15,
            totalScore: narr.momentum * 0.6 + narr.novelty * 0.4,
            featuresJson: {},
          },
        });
      }
    }

    // Create evidence
    for (const ev of narr.evidence) {
      await prisma.narrativeEvidence.create({
        data: {
          narrativeId: narrative.id,
          type: ev.type,
          title: ev.title,
          url: ev.url,
          snippet: ev.snippet,
        },
      });
    }

    // Create investigation steps
    for (let i = 0; i < narr.investigation.length; i++) {
      const step = narr.investigation[i];
      await prisma.investigationStep.create({
        data: {
          narrativeId: narrative.id,
          stepIndex: i,
          tool: step.tool,
          inputJson: step.input,
          outputSummary: step.output,
          linksJson: step.links,
        },
      });
    }

    // Create ideas with action packs
    for (const idea of narr.ideas) {
      const actionPack = generateActionPack(idea, narr.title);
      await prisma.idea.create({
        data: {
          narrativeId: narrative.id,
          title: idea.title,
          pitch: idea.pitch,
          targetUser: idea.targetUser,
          mvpScope: idea.mvpScope,
          whyNow: idea.whyNow,
          validation: idea.validation,
          saturationJson: idea.saturation,
          pivot: idea.pivot,
          actionPackFilesJson: actionPack,
        },
      });
    }

    console.log(
      `    ✓ ${narr.evidence.length} evidence, ${narr.investigation.length} steps, ${narr.ideas.length} ideas`,
    );
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Report ID: ${report.id}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Run 'pnpm dev' to view the dashboard.\n`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
