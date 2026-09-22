#!/usr/bin/env python3
from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
errors = []

RESOURCE_REQUIRED = {"id", "type", "title", "roles", "source_verified", "last_checked"}
COMPETENCY_REQUIRED = {
    "id",
    "title",
    "domain",
    "status",
    "competency_types",
    "target_level",
    "target_states",
    "why",
    "curriculum_evidence",
    "prerequisites",
    "outcomes",
    "diagnostic",
    "learning_route",
    "exit_evidence",
    "metadata",
}

VALID_LEVELS = {"L0", "L1", "L2", "L3", "L4"}
VALID_STATUS = {"incomplete", "seeded", "ready"}
VALID_TYPES = {
    "concept",
    "mechanism",
    "engineering-skill",
    "system-operation",
    "design-judgment",
    "production-competency",
}
VALID_STATES = {"demonstrated", "transferred", "retained", "applied"}

resource_ids = set()

for path in sorted((ROOT / "resources").glob("*.yaml")):
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: YAML parse error: {exc}")
        continue

    for item in data.get("resources", []) or []:
        rid = item.get("id")
        if not rid:
            errors.append(f"{path.relative_to(ROOT)}: resource without id")
            continue
        if rid in resource_ids:
            errors.append(f"duplicate resource id: {rid}")
        resource_ids.add(rid)

        missing = RESOURCE_REQUIRED - item.keys()
        for field in sorted(missing):
            errors.append(f"{path.relative_to(ROOT)}: {rid} missing '{field}'")


def check_resource_ref(ref, context):
    if not isinstance(ref, str):
        errors.append(f"{context}: resource reference must be a string")
        return
    if ref.startswith("http://") or ref.startswith("https://"):
        return
    if ref not in resource_ids:
        errors.append(f"{context}: unknown resource id '{ref}'")


competency_ids = set()

for path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
    rel = path.relative_to(ROOT)
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{rel}: YAML parse error: {exc}")
        continue

    missing = COMPETENCY_REQUIRED - data.keys()
    for field in sorted(missing):
        errors.append(f"{rel}: missing '{field}'")

    cid = data.get("id")
    if cid:
        if cid in competency_ids:
            errors.append(f"duplicate competency id: {cid}")
        competency_ids.add(cid)

    if data.get("target_level") not in VALID_LEVELS:
        errors.append(f"{rel}: invalid target_level '{data.get('target_level')}'")

    if data.get("status") not in VALID_STATUS:
        errors.append(f"{rel}: invalid status '{data.get('status')}'")

    types = data.get("competency_types") or []
    if not types:
        errors.append(f"{rel}: competency_types must not be empty")
    for value in types:
        if value not in VALID_TYPES:
            errors.append(f"{rel}: invalid competency type '{value}'")

    states = data.get("target_states") or []
    if not states:
        errors.append(f"{rel}: target_states must not be empty")
    for value in states:
        if value not in VALID_STATES:
            errors.append(f"{rel}: invalid target state '{value}'")

    diagnostic = data.get("diagnostic") or {}
    if not isinstance(diagnostic, dict):
        errors.append(f"{rel}: diagnostic must be an object")
    else:
        if not diagnostic.get("tasks"):
            errors.append(f"{rel}: diagnostic.tasks must not be empty")
        if not diagnostic.get("pass_condition"):
            errors.append(f"{rel}: diagnostic.pass_condition is required")

    route = data.get("learning_route") or {}
    if not isinstance(route, dict):
        errors.append(f"{rel}: learning_route must be an object")
    else:
        if not route.get("mental_model"):
            errors.append(f"{rel}: learning_route.mental_model must not be empty")
        if not route.get("independent_practice"):
            errors.append(f"{rel}: learning_route.independent_practice must not be empty")

        for section in ["mental_model", "guided_practice", "visual"]:
            for item in route.get(section, []) or []:
                if isinstance(item, dict) and item.get("source"):
                    check_resource_ref(item["source"], f"{rel}: learning_route.{section}")

    for ref in data.get("curriculum_evidence", []) or []:
        check_resource_ref(ref, f"{rel}: curriculum_evidence")

    for role, values in (data.get("resources") or {}).items():
        if not isinstance(values, list):
            errors.append(f"{rel}: resources.{role} must be a list")
            continue
        for rid in values:
            check_resource_ref(rid, f"{rel}: resources.{role}")

    if not data.get("exit_evidence"):
        errors.append(f"{rel}: exit_evidence must not be empty")

    if data.get("status") == "ready":
        if "transferred" in states and not data.get("transfer"):
            errors.append(f"{rel}: ready competency targeting transferred requires transfer")
        if "retained" in states and not data.get("review"):
            errors.append(f"{rel}: ready competency targeting retained requires review")

if errors:
    print("Validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"OK: {len(competency_ids)} competencies, {len(resource_ids)} resources")
