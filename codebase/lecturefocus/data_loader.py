"""Load Review Map concepts (committed) + optional local transcripts."""
from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CONCEPTS_PATH = DATA_DIR / "lecturefocus-concepts.json"
TRANSCRIPTS_PATH = DATA_DIR / "lecturefocus-transcripts.local.json"

TIER_ORDER = {"core": 0, "important": 1, "supporting": 2}
TIER_LABEL = {
    "core": "Trọng tâm",
    "important": "Quan trọng",
    "supporting": "Bổ trợ",
}
DEPTH_HINT = {
    "core": "Ôn sâu — nắm đủ các ý then chốt và bằng chứng trong bài",
    "important": "Ôn vừa đủ — vài ý chính kèm evidence then chốt",
    "supporting": "Bối cảnh — đọc nhanh nếu còn thời gian",
}


def load_workspace() -> dict:
    if not CONCEPTS_PATH.exists():
        raise FileNotFoundError(f"Missing concepts file: {CONCEPTS_PATH}")
    data = json.loads(CONCEPTS_PATH.read_text(encoding="utf-8"))
    transcripts = {}
    if TRANSCRIPTS_PATH.exists():
        transcripts = json.loads(TRANSCRIPTS_PATH.read_text(encoding="utf-8"))
    for lid, lesson in data["lessons"].items():
        segs = transcripts.get(lid, {}).get("segments") or []
        lesson["segments"] = segs
        lesson["has_full_transcript"] = bool(segs)
    data["transcripts_loaded"] = bool(transcripts)
    return data


def sorted_concepts(lesson: dict) -> list[dict]:
    return sorted(
        lesson["concepts"],
        key=lambda c: (TIER_ORDER[c["tier"]], c["order"]),
    )


def plan_for_budget(lesson: dict, budget: str) -> list[dict]:
    all_concepts = sorted_concepts(lesson)
    if budget == "all":
        return all_concepts
    limit = int(budget)
    picked, total = [], 0
    for c in all_concepts:
        if not picked or total + c["estimated_minutes"] <= limit:
            picked.append(c)
            total += c["estimated_minutes"]
        else:
            break
    return picked


def find_concept(lesson: dict, concept_id: str) -> dict | None:
    return next((c for c in lesson["concepts"] if c["id"] == concept_id), None)


def collect_evidence(concept: dict) -> list[dict]:
    items = []
    for i, lp in enumerate(concept.get("learningPoints") or []):
        if lp.get("evidence"):
            items.append(
                {**lp["evidence"], "source": "learning", "sourceIndex": i, "label": "Ý cần nắm"}
            )
    for i, r in enumerate(concept.get("reasons") or []):
        if r.get("evidence"):
            items.append(
                {**r["evidence"], "source": "reason", "sourceIndex": i, "label": "Lý do ưu tiên"}
            )
    return items


def segment_by_id(lesson: dict, segment_id: str) -> dict | None:
    return next((s for s in lesson.get("segments") or [] if s["id"] == segment_id), None)
