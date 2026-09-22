#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- learning-sources:start -->"
END = "<!-- learning-sources:end -->"


def load_resources():
    resources = {}
    for path in sorted((ROOT / "resources").glob("*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        for item in data.get("resources", []) or []:
            rid = item.get("id")
            if rid:
                resources[rid] = item
    return resources


def clean(value):
    if value is None:
        return ""
    return " ".join(str(value).split()).replace("|", "\\|")


def source_cell(source, resources):
    if source.startswith("http://") or source.startswith("https://"):
        return f"[{clean(source)}]({source})"
    item = resources.get(source)
    if not item:
        return f"`{clean(source)}`"
    return f"[{clean(item.get('title') or source)}]({item.get('url')})"


def render_block(data, resources):
    mental_model = (data.get("learning_route") or {}).get("mental_model") or []
    bridges = data.get("prerequisite_support") or {}

    lines = [
        START,
        "## Learning sources",
        "",
        "Open these exact source locations, then return to the practice and evidence tasks below.",
        "",
        "| Source | Read / inspect | Why |",
        "| --- | --- | --- |",
    ]

    for item in mental_model:
        if not isinstance(item, dict):
            continue
        source = item.get("source")
        if not source:
            continue
        lines.append(
            f"| {source_cell(source, resources)} | {clean(item.get('locator'))} | {clean(item.get('purpose'))} |"
        )

    if bridges:
        lines.extend(
            [
                "",
                "### Prerequisite patches",
                "",
                "Use these only when the diagnostic exposes the specific gap.",
                "",
                "| Gap | Source | Read / inspect | Why |",
                "| --- | --- | --- | --- |",
            ]
        )
        for gap, bridge in bridges.items():
            if not isinstance(bridge, dict):
                continue
            source = bridge.get("source")
            if not source:
                continue
            lines.append(
                f"| `{clean(gap)}` | {source_cell(source, resources)} | {clean(bridge.get('locator'))} | {clean(bridge.get('purpose'))} |"  # noqa: E501
            )

    lines.extend([END, ""])
    return "\n".join(lines)


def inject(readme_text, block):
    if START in readme_text and END in readme_text:
        before = readme_text.split(START, 1)[0].rstrip()
        after = readme_text.split(END, 1)[1].lstrip("\n")
        return before + "\n\n" + block + "\n" + after

    marker = "## Why this matters"
    if marker not in readme_text:
        raise ValueError("README is missing '## Why this matters' insertion point")
    before, after = readme_text.split(marker, 1)
    return before.rstrip() + "\n\n" + block + "\n" + marker + after


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if args.write == args.check:
        parser.error("choose exactly one of --write or --check")

    resources = load_resources()
    drift = []

    for competency_path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
        data = yaml.safe_load(competency_path.read_text(encoding="utf-8")) or {}
        if data.get("status") not in {"seeded", "ready"}:
            continue

        readme = competency_path.with_name("README.md")
        if not readme.exists():
            drift.append(f"{readme.relative_to(ROOT)}: missing README")
            continue

        current = readme.read_text(encoding="utf-8")
        try:
            expected = inject(current, render_block(data, resources))
        except ValueError as exc:
            drift.append(f"{readme.relative_to(ROOT)}: {exc}")
            continue

        if current == expected:
            continue

        if args.write:
            readme.write_text(expected, encoding="utf-8")
        else:
            drift.append(f"{readme.relative_to(ROOT)}: learning source block is missing or stale")

    if drift:
        print("Learning source rendering check failed:\n")
        for item in drift:
            print(f"- {item}")
        print("\nRun: python scripts/render_learning_sources.py --write")
        sys.exit(1)

    if args.write:
        print("OK: learner-facing source blocks rendered")
    else:
        print("OK: learner-facing source blocks are up to date")


if __name__ == "__main__":
    main()
