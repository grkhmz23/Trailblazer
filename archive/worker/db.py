"""Database operations for the worker pipeline using psycopg2."""

import json
import hashlib
from datetime import datetime, timezone
from typing import Any
import psycopg2
import psycopg2.extras

from config import get_db_params


def _conn():
    return psycopg2.connect(**get_db_params())


def _cuid() -> str:
    """Generate a cuid-like ID."""
    import random, time
    ts = hex(int(time.time() * 1000))[2:]
    rand = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=12))
    return f"c{ts}{rand}"


def create_report(period_start: datetime, period_end: datetime, config_json: dict) -> str:
    """Create a new report record and return its ID."""
    report_id = _cuid()
    config_str = json.dumps(config_json)
    hash_val = hashlib.sha256(f"{period_start}{period_end}{config_str}".encode()).hexdigest()[:16]

    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO reports (id, period_start, period_end, created_at, config_json, hash, status)
                   VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)""",
                (report_id, period_start, period_end, datetime.now(timezone.utc), config_str, hash_val, "processing"),
            )
        conn.commit()
    return report_id


def upsert_entity(
    kind: str, key: str, label: str,
    first_seen: datetime, metrics_json: dict,
    embedding: list[float] | None = None,
) -> str:
    """Upsert an entity and return its ID."""
    entity_id = _cuid()
    now = datetime.now(timezone.utc)
    emb = embedding or []

    with _conn() as conn:
        with conn.cursor() as cur:
            # Check if exists
            cur.execute("SELECT id FROM entities WHERE key = %s", (key,))
            row = cur.fetchone()
            if row:
                entity_id = row[0]
                cur.execute(
                    """UPDATE entities SET last_seen = %s, metrics_json = %s::jsonb, embedding = %s
                       WHERE id = %s""",
                    (now, json.dumps(metrics_json), emb, entity_id),
                )
            else:
                cur.execute(
                    """INSERT INTO entities (id, kind, key, label, first_seen, last_seen, metrics_json, embedding)
                       VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s)""",
                    (entity_id, kind, key, label, first_seen, now, json.dumps(metrics_json), emb),
                )
        conn.commit()
    return entity_id


def create_candidate(
    report_id: str, entity_id: str,
    momentum: float, novelty: float, quality: float,
    total_score: float, features_json: dict,
) -> str:
    cid = _cuid()
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO candidates (id, report_id, entity_id, momentum, novelty, quality, total_score, features_json)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)""",
                (cid, report_id, entity_id, momentum, novelty, quality, total_score, json.dumps(features_json)),
            )
        conn.commit()
    return cid


def create_narrative(
    report_id: str, title: str, summary: str,
    momentum: float, novelty: float, saturation: float,
    scores_json: dict,
) -> str:
    nid = _cuid()
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO narratives (id, report_id, title, summary, momentum, novelty, saturation, scores_json, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)""",
                (nid, report_id, title, summary, momentum, novelty, saturation, json.dumps(scores_json), datetime.now(timezone.utc)),
            )
        conn.commit()
    return nid


def create_evidence(
    narrative_id: str, ev_type: str, title: str,
    url: str = "", snippet: str = "", metrics_json: dict | None = None,
) -> str:
    eid = _cuid()
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO narrative_evidence (id, narrative_id, type, title, url, snippet, metrics_json)
                   VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)""",
                (eid, narrative_id, ev_type, title, url, snippet, json.dumps(metrics_json or {})),
            )
        conn.commit()
    return eid


def create_investigation_step(
    narrative_id: str, step_index: int, tool: str,
    input_json: dict, output_summary: str, links: list[str],
) -> str:
    sid = _cuid()
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO investigation_steps (id, narrative_id, step_index, tool, input_json, output_summary, links_json, created_at)
                   VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s::jsonb, %s)""",
                (sid, narrative_id, step_index, tool, json.dumps(input_json), output_summary, json.dumps(links), datetime.now(timezone.utc)),
            )
        conn.commit()
    return sid


def create_idea(
    narrative_id: str, title: str, pitch: str,
    target_user: str, mvp_scope: str, why_now: str,
    validation: str, saturation_json: dict, pivot: str,
    action_pack_files_json: dict,
) -> str:
    iid = _cuid()
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO ideas (id, narrative_id, title, pitch, target_user, mvp_scope, why_now, validation, saturation_json, pivot, action_pack_files_json)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s::jsonb)""",
                (iid, narrative_id, title, pitch, target_user, mvp_scope, why_now, validation,
                 json.dumps(saturation_json), pivot, json.dumps(action_pack_files_json)),
            )
        conn.commit()
    return iid


def update_report_status(report_id: str, status: str) -> None:
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE reports SET status = %s WHERE id = %s", (status, report_id))
        conn.commit()
