"""Configuration and database utilities for the worker pipeline."""

import os
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Load .env from project root
_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")

# ───── Paths ─────
ROOT_DIR = _root
FIXTURES_DIR = ROOT_DIR / "fixtures"
REPORTS_OUTPUT_DIR = ROOT_DIR / "apps" / "web" / "public" / "reports"

# ───── Mode detection ─────
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
HELIUS_API_KEY = os.getenv("HELIUS_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

HAS_LLM = bool(ANTHROPIC_API_KEY)
HAS_EMBEDDINGS = bool(OPENAI_API_KEY)
HAS_HELIUS = bool(HELIUS_API_KEY)
HAS_GITHUB = bool(GITHUB_TOKEN)

# If no API keys at all, force demo mode
if not HAS_LLM and not HAS_HELIUS and not HAS_GITHUB:
    DEMO_MODE = True

# ───── Database ─────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://hunter:hunter@localhost:5433/narrative_hunter?schema=public",
)


def get_db_params() -> dict:
    """Parse DATABASE_URL into psycopg2 connection params."""
    from urllib.parse import urlparse, parse_qs

    parsed = urlparse(DATABASE_URL)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5433,
        "dbname": (parsed.path or "/narrative_hunter").lstrip("/").split("?")[0],
        "user": parsed.username or "hunter",
        "password": parsed.password or "hunter",
    }


# ───── Period defaults ─────
def default_period() -> tuple[datetime, datetime]:
    """Return (start, end) for the most recent 14-day window."""
    end = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    start = end - timedelta(days=14)
    return start, end


# ───── Fixture loaders ─────
def load_fixture(name: str) -> dict | list:
    path = FIXTURES_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Fixture not found: {path}")
    with open(path) as f:
        return json.load(f)


# ───── Scoring weights ─────
SCORING_WEIGHTS = {
    "onchain": {
        "z_tx_count": 0.25,
        "z_unique_wallets": 0.20,
        "z_new_wallet_share": 0.15,
        "z_retention": 0.10,
    },
    "dev": {
        "z_commits": 0.20,
        "z_stars_delta": 0.15,
        "z_new_contributors": 0.10,
        "z_releases": 0.05,
    },
    "social": {
        "z_mentions_delta": 0.15,
        "z_unique_authors": 0.10,
        "z_engagement_delta": 0.10,
    },
}

NOVELTY_BONUS_DAYS = 60
NOVELTY_BONUS_MULTIPLIER = 1.3
QUALITY_PENALTY = {
    "single_wallet_spike_ratio": 0.7,
    "single_author_hype_ratio": 0.8,
    "penalty_multiplier": 0.5,
}

TOP_K = 20
MAX_NARRATIVES = 10
IDEAS_PER_NARRATIVE = 5
