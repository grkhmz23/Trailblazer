/**
 * Tracked Solana protocol registry.
 * Each entry has a unique key, display name, category,
 * on-chain program IDs (for Helius), and GitHub repo (for dev signals).
 */

export interface TrackedProtocol {
  key: string;
  label: string;
  kind: "defi" | "infra" | "nft" | "social" | "oracle" | "bridge" | "lst" | "payments" | "gaming" | "dao" | "depin" | "memecoin_infra" | "ai";
  programIds: string[]; // Solana mainnet program addresses
  github?: string; // owner/repo
  rssFeeds?: string[];
  firstSeen: string; // approximate launch or tracking start
}

export const TRACKED_PROTOCOLS: TrackedProtocol[] = [
  // ─── DeFi ──────────────────────────────────────────
  {
    key: "jupiter",
    label: "Jupiter",
    kind: "defi",
    programIds: [
      "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
    ],
    github: "jup-ag/jupiter-core",
    firstSeen: "2022-10-01T00:00:00Z",
  },
  {
    key: "jupiter-perps",
    label: "Jupiter Perpetuals",
    kind: "defi",
    programIds: ["PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu"],
    github: "jup-ag/perpetuals",
    firstSeen: "2024-01-15T00:00:00Z",
  },
  {
    key: "drift",
    label: "Drift Protocol",
    kind: "defi",
    programIds: ["dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"],
    github: "drift-labs/protocol-v2",
    firstSeen: "2022-11-01T00:00:00Z",
  },
  {
    key: "raydium",
    label: "Raydium",
    kind: "defi",
    programIds: [
      "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
    ],
    github: "raydium-io/raydium-amm",
    firstSeen: "2021-03-01T00:00:00Z",
  },
  {
    key: "orca",
    label: "Orca (Whirlpool)",
    kind: "defi",
    programIds: ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"],
    github: "orca-so/whirlpools",
    firstSeen: "2022-03-01T00:00:00Z",
  },
  {
    key: "phoenix",
    label: "Phoenix",
    kind: "defi",
    programIds: ["PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY"],
    github: "Ellipsis-Labs/phoenix-v1",
    firstSeen: "2023-06-01T00:00:00Z",
  },
  {
    key: "marginfi",
    label: "Marginfi",
    kind: "defi",
    programIds: ["MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA"],
    github: "mrgnlabs/marginfi-v2",
    firstSeen: "2023-04-01T00:00:00Z",
  },
  {
    key: "kamino",
    label: "Kamino Finance",
    kind: "defi",
    programIds: [
      "KLend2g3cP87ber8LMA16xFeJioXTrKGW2ub6EGVRpD",
      "6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc",
    ],
    github: "Kamino-Finance/klend",
    firstSeen: "2023-07-01T00:00:00Z",
  },
  {
    key: "zeta",
    label: "Zeta Markets",
    kind: "defi",
    programIds: ["ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf1aD"],
    github: "zetamarkets/sdk",
    firstSeen: "2022-08-01T00:00:00Z",
  },
  {
    key: "flash-trade",
    label: "Flash Trade",
    kind: "defi",
    programIds: ["FLASH6Lo6h3iasJKWDs2F8TkW2UKf3s15C8PMGuVfgBn"],
    github: "Flash-Trade/flash-trade-sdk",
    firstSeen: "2024-02-01T00:00:00Z",
  },
  {
    key: "meteora",
    label: "Meteora",
    kind: "defi",
    programIds: ["LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"],
    github: "MeteoraAg/dlmm-sdk",
    firstSeen: "2023-11-01T00:00:00Z",
  },
  {
    key: "parcl",
    label: "Parcl",
    kind: "defi",
    programIds: ["PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP"],
    github: "ParclFinance/v3-contracts-sdk",
    firstSeen: "2024-04-01T00:00:00Z",
  },
  {
    key: "pump-fun",
    label: "Pump.fun",
    kind: "memecoin_infra",
    programIds: ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"],
    firstSeen: "2024-03-01T00:00:00Z",
  },
  {
    key: "ondo",
    label: "Ondo Finance",
    kind: "defi",
    programIds: [],
    github: "ondofinance/ondo-protocol",
    firstSeen: "2023-01-01T00:00:00Z",
  },
  {
    key: "dflow",
    label: "DFlow",
    kind: "defi",
    programIds: [],
    firstSeen: "2024-07-01T00:00:00Z",
  },

  // ─── LST / Staking ────────────────────────────────
  {
    key: "marinade",
    label: "Marinade Finance",
    kind: "lst",
    programIds: [
      "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
      "stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq",
    ],
    github: "marinade-finance/liquid-staking-program",
    firstSeen: "2021-08-01T00:00:00Z",
  },
  {
    key: "jito",
    label: "Jito",
    kind: "lst",
    programIds: [
      "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P3L7h5vK",
      "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    ],
    github: "jito-foundation/jito-programs",
    firstSeen: "2022-12-01T00:00:00Z",
  },
  {
    key: "sanctum",
    label: "Sanctum",
    kind: "lst",
    programIds: ["5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9Kx"],
    github: "igneous-labs/sanctum-lst-list",
    firstSeen: "2024-01-01T00:00:00Z",
  },
  {
    key: "blaze-stake",
    label: "BlazeStake",
    kind: "lst",
    programIds: ["BLZEi3LMPK5KBXkraDyTkXPb4a6yVRzfKn8bCc9qmfr"],
    github: "mrgn-labs/blazestake-sdk",
    firstSeen: "2023-02-01T00:00:00Z",
  },

  // ─── Infrastructure ────────────────────────────────
  {
    key: "light-protocol",
    label: "Light Protocol (ZK Compression)",
    kind: "infra",
    programIds: ["compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVQ"],
    github: "Light-Protocol/light-protocol",
    firstSeen: "2024-03-01T00:00:00Z",
  },
  {
    key: "squads",
    label: "Squads Protocol",
    kind: "infra",
    programIds: ["SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu"],
    github: "Squads-Protocol/v4",
    firstSeen: "2022-06-01T00:00:00Z",
  },
  {
    key: "clockwork",
    label: "Clockwork",
    kind: "infra",
    programIds: ["CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"],
    github: "clockwork-xyz/clockwork",
    firstSeen: "2022-09-01T00:00:00Z",
  },
  {
    key: "helius",
    label: "Helius",
    kind: "infra",
    programIds: [],
    github: "helius-labs/helius-sdk",
    firstSeen: "2022-05-01T00:00:00Z",
  },
  {
    key: "backpack",
    label: "Backpack",
    kind: "infra",
    programIds: [],
    github: "backpack-app/backpack",
    firstSeen: "2023-02-01T00:00:00Z",
  },
  {
    key: "phantom",
    label: "Phantom",
    kind: "infra",
    programIds: [],
    firstSeen: "2021-07-01T00:00:00Z",
  },

  // ─── Oracles ───────────────────────────────────────
  {
    key: "switchboard",
    label: "Switchboard",
    kind: "oracle",
    programIds: ["SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f"],
    github: "switchboard-xyz/solana-sdk",
    firstSeen: "2021-06-01T00:00:00Z",
  },
  {
    key: "pyth",
    label: "Pyth Network",
    kind: "oracle",
    programIds: [
      "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH",
      "rec5EKMGg6MxZYaMdyBps68Vg97jKhBr7mQ2vN1mTzZ",
    ],
    github: "pyth-network/pyth-crosschain",
    firstSeen: "2021-08-01T00:00:00Z",
  },

  // ─── NFT / Marketplace ────────────────────────────
  {
    key: "tensor",
    label: "Tensor",
    kind: "nft",
    programIds: [
      "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
      "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
    ],
    github: "tensor-hq/tensor-common",
    firstSeen: "2023-04-01T00:00:00Z",
  },
  {
    key: "metaplex",
    label: "Metaplex",
    kind: "nft",
    programIds: [
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
    ],
    github: "metaplex-foundation/mpl-core",
    firstSeen: "2021-06-01T00:00:00Z",
  },
  {
    key: "magic-eden",
    label: "Magic Eden",
    kind: "nft",
    programIds: [],
    firstSeen: "2021-09-01T00:00:00Z",
  },

  // ─── Bridge / Cross-chain ─────────────────────────
  {
    key: "wormhole",
    label: "Wormhole",
    kind: "bridge",
    programIds: ["worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"],
    github: "wormhole-foundation/wormhole",
    firstSeen: "2021-09-01T00:00:00Z",
  },

  // ─── Social / Identity ────────────────────────────
  {
    key: "dialect",
    label: "Dialect",
    kind: "social",
    programIds: [],
    github: "dialectlabs/protocol",
    firstSeen: "2022-04-01T00:00:00Z",
  },
  {
    key: "access-protocol",
    label: "Access Protocol",
    kind: "social",
    programIds: ["aaborDKnUoN5VGoog99NJHG4GFLczMoNAPziUJHDFMR"],
    github: "Access-Labs-Inc/access-protocol",
    firstSeen: "2023-06-01T00:00:00Z",
  },

  // ─── Payments ─────────────────────────────────────
  {
    key: "sphere",
    label: "Sphere Pay",
    kind: "payments",
    programIds: [],
    github: "sphere-labs/sphere-sdk",
    firstSeen: "2024-01-01T00:00:00Z",
  },
  {
    key: "pyusd",
    label: "PYUSD (PayPal)",
    kind: "payments",
    programIds: ["2b1kV6DkPAnxd5VGvN7rjkUvyCie2rSbwG3rNCaVb2uH"],
    firstSeen: "2024-05-01T00:00:00Z",
  },

  // ─── DAO / Governance ─────────────────────────────
  {
    key: "realms",
    label: "Realms (SPL Governance)",
    kind: "dao",
    programIds: ["GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdGX3EWQSJ"],
    github: "solana-labs/governance-ui",
    firstSeen: "2021-10-01T00:00:00Z",
  },
  {
    key: "meta-dao",
    label: "MetaDAO",
    kind: "dao",
    programIds: [],
    github: "meta-dao/meta-dao",
    firstSeen: "2023-06-01T00:00:00Z",
  },

  // ─── Gaming ───────────────────────────────────────
  {
    key: "star-atlas",
    label: "Star Atlas",
    kind: "gaming",
    programIds: [],
    github: "staratlasmeta/factory",
    firstSeen: "2022-01-01T00:00:00Z",
  },
  {
    key: "genopets",
    label: "Genopets",
    kind: "gaming",
    programIds: ["GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz"],
    github: "genopets/genopets-protocol",
    firstSeen: "2021-11-01T00:00:00Z",
  },

  // ─── DePIN ────────────────────────────────────────
  {
    key: "helium",
    label: "Helium (IoT/Mobile)",
    kind: "depin",
    programIds: [
      "iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns",
      "mb1eu7TzEc71KxDpsmsKoucSSuuo6KWzI20p1afRhpE6",
    ],
    github: "helium/helium-program-library",
    firstSeen: "2023-04-01T00:00:00Z",
  },
  {
    key: "render",
    label: "Render Network",
    kind: "depin",
    programIds: [],
    firstSeen: "2023-10-01T00:00:00Z",
  },
  {
    key: "hivemapper",
    label: "Hivemapper",
    kind: "depin",
    programIds: [],
    github: "hivemapper/honeycomb",
    firstSeen: "2023-04-01T00:00:00Z",
  },

  // ─── Memecoin Infrastructure ──────────────────────
  {
    key: "bonk",
    label: "Bonk",
    kind: "memecoin_infra",
    programIds: ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"],
    firstSeen: "2022-12-01T00:00:00Z",
  },
  {
    key: "dogwifhat",
    label: "dogwifhat",
    kind: "memecoin_infra",
    programIds: ["EKpQGSJtjMFqUZ5dLbibhGTfo8rnaDZCmgJmBuuMshD4"],
    firstSeen: "2023-12-01T00:00:00Z",
  },
  {
    key: "moonshot",
    label: "Moonshot",
    kind: "memecoin_infra",
    programIds: [],
    firstSeen: "2024-06-01T00:00:00Z",
  },

  // ─── AI ───────────────────────────────────────────
  {
    key: "robot-ai",
    label: "Robot AI",
    kind: "ai",
    programIds: [],
    firstSeen: "2025-01-01T00:00:00Z",
  },
];

/** Get protocols that have on-chain program IDs */
export function getOnchainProtocols(): TrackedProtocol[] {
  return TRACKED_PROTOCOLS.filter((p) => p.programIds.length > 0);
}

/** Get protocols that have GitHub repos */
export function getGithubProtocols(): TrackedProtocol[] {
  return TRACKED_PROTOCOLS.filter((p) => !!p.github);
}
