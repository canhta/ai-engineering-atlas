#!/usr/bin/env python3
from __future__ import annotations

from datetime import date, datetime
import json
from pathlib import Path
import sys

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = ROOT / "schemas"
errors = []


def normalize(value):
    """Convert YAML-native date/datetime objects to JSON-compatible strings."""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: normalize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize(item) for item in value]
    return value


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_yaml(path: Path):
    return normalize(yaml.safe_load(path.read_text(encoding="utf-8")) or {})


def validate_instance(instance, schema, label):
    validator = Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(instance), key=lambda e: list(e.path)):
        location = ".".join(str(part) for part in error.path)
        suffix = f" at {location}" if location else ""
        errors.append(f"{label}{suffix}: {error.message}")


schema_files = {
    "catalog": SCHEMAS / "catalog.schema.json",
    "resource": SCHEMAS / "resource.schema.json",
    "competency": SCHEMAS / "competency.schema.json",
    "project": SCHEMAS / "project.schema.json",
    "progress": SCHEMAS / "progress.schema.json",
}
schemas = {}

for name, path in schema_files.items():
    try:
        schema = load_json(path)
        Draft202012Validator.check_schema(schema)
        schemas[name] = schema
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid schema: {exc}")


if "catalog" in schemas:
    try:
        validate_instance(
            load_yaml(ROOT / "curriculum" / "catalog.yaml"),
            schemas["catalog"],
            "curriculum/catalog.yaml",
        )
    except Exception as exc:
        errors.append(f"curriculum/catalog.yaml: cannot validate: {exc}")


if "resource" in schemas:
    for path in sorted((ROOT / "resources").glob("*.yaml")):
        try:
            doc = load_yaml(path)
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: cannot load: {exc}")
            continue

        for index, item in enumerate(doc.get("resources", []) or []):
            validate_instance(
                item,
                schemas["resource"],
                f"{path.relative_to(ROOT)} resources[{index}]",
            )


if "competency" in schemas:
    for path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
        try:
            validate_instance(
                load_yaml(path),
                schemas["competency"],
                str(path.relative_to(ROOT)),
            )
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: cannot validate: {exc}")


if "project" in schemas:
    for path in sorted((ROOT / "projects").rglob("project.yaml")):
        try:
            validate_instance(
                load_yaml(path),
                schemas["project"],
                str(path.relative_to(ROOT)),
            )
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: cannot validate: {exc}")


progress_path = ROOT / "progress" / "progress.example.yaml"
if "progress" in schemas and progress_path.exists():
    try:
        validate_instance(
            load_yaml(progress_path),
            schemas["progress"],
            str(progress_path.relative_to(ROOT)),
        )
    except Exception as exc:
        errors.append(f"{progress_path.relative_to(ROOT)}: cannot validate: {exc}")


if errors:
    print("Schema validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("OK: JSON Schemas validate catalog, resources, competencies, projects, and progress")
