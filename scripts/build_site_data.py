#!/usr/bin/env python3
"""Compile curriculum contracts into the single JSON file the web atlas reads."""
from __future__ import annotations

from datetime import date, datetime
from pathlib import Path
import argparse
import json
import sys

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site" / "src" / "data" / "atlas.json"
SCHEMA = ROOT / "schemas" / "site-data.schema.json"

DOMAIN_LABELS = {
    "software-engineering": "Software Engineering",
    "systems": "Systems",
    "data-engineering": "Data Engineering",
    "ml-foundations": "ML Foundations",
    "deep-learning": "Deep Learning",
    "llm-foundations": "LLM Foundations",
    "ai-engineering": "AI Engineering",
    "agents": "Agents",
    "production-ai": "Production AI",
    "security-governance": "Security & Governance",
    "multimodal": "Multimodal",
    "specializations": "Specializations",
}

RESOURCE_FIELDS = ("title", "type", "author", "url", "roles")

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


def load_yaml(path: Path):
    return normalize(yaml.safe_load(path.read_text(encoding="utf-8")) or {})


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def markdown_title(path: Path) -> str:
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem


def load_resources():
    resources = {}
    for path in sorted((ROOT / "resources").glob("*.yaml")):
        for item in load_yaml(path).get("resources", []) or []:
            rid = item.get("id")
            if rid:
                resources[rid] = {k: item[k] for k in RESOURCE_FIELDS if k in item}
    return resources


def check_source(source, resources, label):
    if source.startswith(("http://", "https://")):
        return
    if source not in resources:
        errors.append(f"{label}: unknown source '{source}'")


def build():
    manifest = load_yaml(ROOT / "curriculum" / "manifest.yaml")
    catalog = load_yaml(ROOT / "curriculum" / "catalog.yaml")
    resources = load_resources()

    domains = [
        {
            "id": d["id"],
            "title": DOMAIN_LABELS.get(d["id"], d["id"]),
            "path": d["path"],
            "target": str(d.get("target", "")),
        }
        for d in manifest.get("domains", []) or []
    ]

    competencies = [
        {k: item[k] for k in ("id", "title", "domain", "status", "route") if k in item}
        for item in catalog.get("competencies", []) or []
    ]
    catalog_ids = {c["id"] for c in competencies}

    routes = {}
    edges = []
    for path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
        data = load_yaml(path)
        if data.get("status") not in {"seeded", "ready"}:
            continue
        cid = data["id"]
        label = rel(path)

        for prereq in data.get("prerequisites", []) or []:
            if prereq not in catalog_ids:
                errors.append(f"{label}: prerequisite '{prereq}' is not in catalog")
            edges.append({"from": prereq, "to": cid})

        route = data.get("learning_route") or {}
        for item in route.get("mental_model", []) or []:
            check_source(item.get("source", ""), resources, label)
        for gap, bridge in (data.get("prerequisite_support") or {}).items():
            check_source(bridge.get("source", ""), resources, f"{label} bridge '{gap}'")

        routes[cid] = {**data, "path": rel(path.parent)}

    labs = []
    for lab_dir in sorted(p for p in (ROOT / "labs").iterdir() if p.is_dir()):
        readme = lab_dir / "README.md"
        prefix = rel(lab_dir) + "/"
        used_by = sorted(
            cid
            for cid, route in routes.items()
            for step in (route.get("learning_route") or {}).get("independent_practice", []) or []
            if str(step.get("artifact", "")).startswith(prefix)
        )
        labs.append({
            "id": lab_dir.name,
            "title": markdown_title(readme) if readme.exists() else lab_dir.name,
            "path": rel(lab_dir),
            "files": sorted(f.name for f in lab_dir.iterdir() if f.is_file() and not f.name.startswith(".")),
            "competencies": used_by,
        })

    projects = []
    for path in sorted((ROOT / "projects").rglob("project.yaml")):
        data = load_yaml(path)
        projects.append({
            "id": data["id"],
            "title": data["title"],
            "purpose": data["purpose"],
            "path": rel(path.parent),
            "spines": data["spines"],
            "milestones": data["milestones"],
            "competencies": data["competencies"],
        })

    paths = [
        {"id": p.stem, "title": markdown_title(p), "file": rel(p)}
        for p in sorted((ROOT / "paths").glob("*.md"))
        if p.name != "README.md"
    ]

    used_sources = set()
    for route in routes.values():
        for group in (route.get("resources") or {}).values():
            used_sources.update(group or [])
        used_sources.update(route.get("curriculum_evidence") or [])
        for item in (route.get("learning_route") or {}).get("mental_model", []) or []:
            used_sources.add(item.get("source"))
        for bridge in (route.get("prerequisite_support") or {}).values():
            used_sources.add(bridge.get("source"))

    return {
        "version": 1,
        "catalog_version": catalog.get("version"),
        "last_reviewed": catalog.get("last_reviewed"),
        "levels": manifest.get("levels", {}),
        "domains": domains,
        "competencies": competencies,
        "edges": edges,
        "routes": routes,
        "resources": {rid: resources[rid] for rid in sorted(used_sources) if rid in resources},
        "labs": labs,
        "projects": projects,
        "paths": paths,
    }


def serialize(data) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if args.write == args.check:
        parser.error("choose exactly one of --write or --check")

    data = build()

    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    for error in Draft202012Validator(schema).iter_errors(data):
        location = ".".join(str(part) for part in error.path)
        errors.append(f"site data{' at ' + location if location else ''}: {error.message}")

    if not errors:
        expected = serialize(data)
        if args.write:
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT.write_text(expected, encoding="utf-8")
        elif not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            errors.append(f"{rel(OUTPUT)} is missing or stale")

    if errors:
        print("Site data build failed:\n")
        for error in errors:
            print(f"- {error}")
        print("\nRun: python scripts/build_site_data.py --write")
        sys.exit(1)

    if args.write:
        print(f"OK: wrote {rel(OUTPUT)}")
    else:
        print(f"OK: {rel(OUTPUT)} matches curriculum contracts")


if __name__ == "__main__":
    main()
