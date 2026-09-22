#!/usr/bin/env python3
from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
errors = []

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

        for field in ["type", "title", "roles", "source_verified", "last_checked"]:
            if field not in item:
                errors.append(f"{path.relative_to(ROOT)}: {rid} missing '{field}'")

competency_ids = set()

for path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: YAML parse error: {exc}")
        continue

    for field in [
        "id",
        "title",
        "domain",
        "target_level",
        "why",
        "outcomes",
        "diagnostic",
        "exit_criteria",
        "resources",
        "metadata",
    ]:
        if field not in data:
            errors.append(f"{path.relative_to(ROOT)}: missing '{field}'")

    cid = data.get("id")
    if cid:
        if cid in competency_ids:
            errors.append(f"duplicate competency id: {cid}")
        competency_ids.add(cid)

    level = data.get("target_level")
    if level and level not in {"L0", "L1", "L2", "L3", "L4"}:
        errors.append(f"{path.relative_to(ROOT)}: invalid target_level '{level}'")

    for role, values in (data.get("resources") or {}).items():
        if not isinstance(values, list):
            errors.append(f"{path.relative_to(ROOT)}: resources.{role} must be a list")
            continue
        for rid in values:
            if rid not in resource_ids:
                errors.append(f"{path.relative_to(ROOT)}: unknown resource id '{rid}'")

if errors:
    print("Validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"OK: {len(competency_ids)} competencies, {len(resource_ids)} resources")
