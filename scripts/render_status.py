#!/usr/bin/env python3
from pathlib import Path
import argparse
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "curriculum" / "catalog.yaml"
STATUS = ROOT / "curriculum" / "STATUS.md"

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


def render():
    doc = yaml.safe_load(CATALOG.read_text(encoding="utf-8")) or {}
    items = doc.get("competencies", []) or []

    counts = {}
    ready = []
    for item in items:
        domain = item["domain"]
        counts.setdefault(domain, {"total": 0, "ready": 0})
        counts[domain]["total"] += 1
        if item.get("status") == "ready":
            counts[domain]["ready"] += 1
            ready.append(item)

    ready_count = len(ready)
    coverage_count = len(items) - ready_count

    lines = [
        "# Curriculum Status",
        "",
        "> Generated from [catalog.yaml](catalog.yaml). Do not edit by hand.",
        "",
        "## Summary",
        "",
        f"- **{len(items)}** catalog competencies",
        f"- **{ready_count}** ready learning routes",
        f"- **{coverage_count}** coverage-only competencies",
        "",
        "A **coverage** item belongs in the audited roadmap but does not yet have the complete learner lifecycle required for a ready route.",
        "",
        "## By domain",
        "",
        "| Domain | Catalog competencies | Ready routes |",
        "| --- | ---: | ---: |",
    ]

    for domain in DOMAIN_LABELS:
        value = counts.get(domain, {"total": 0, "ready": 0})
        lines.append(
            f"| {DOMAIN_LABELS[domain]} | {value['total']} | {value['ready']} |"
        )

    lines += [
        "",
        "## Ready routes",
        "",
        "| Competency | Domain | Route |",
        "| --- | --- | --- |",
    ]

    for item in ready:
        route = item["route"]
        prefix = "curriculum/"
        if route.startswith(prefix):
            route = route[len(prefix):]
        lines.append(
            f"| `{item['id']}` — {item['title']} | "
            f"{DOMAIN_LABELS.get(item['domain'], item['domain'])} | "
            f"[Open route]({route}/) |"
        )

    lines += [
        "",
        "## Promotion rule",
        "",
        "A coverage item becomes ready only when it satisfies the contract in [../docs/LEARNING_MODEL.md](../docs/LEARNING_MODEL.md), including:",
        "",
        "- diagnostic;",
        "- verified source locator;",
        "- independent practice;",
        "- matching exit evidence;",
        "- transfer/review/project integration where required.",
        "",
        "The canonical machine-readable state is [catalog.yaml](catalog.yaml).",
        "",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    rendered = render()

    if args.write:
        STATUS.write_text(rendered, encoding="utf-8")
        print(f"Wrote {STATUS.relative_to(ROOT)}")
        return

    if args.check:
        current = STATUS.read_text(encoding="utf-8") if STATUS.exists() else ""
        if current != rendered:
            print("curriculum/STATUS.md is out of date.")
            print("Run: python scripts/render_status.py --write")
            sys.exit(1)
        print("OK: curriculum/STATUS.md matches catalog.yaml")
        return

    print(rendered)


if __name__ == "__main__":
    main()
