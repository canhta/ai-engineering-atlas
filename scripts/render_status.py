#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "curriculum" / "catalog.yaml"
STATUS = ROOT / "curriculum" / "STATUS.md"
CHANGE_LOG = ROOT / "curriculum" / "changelog.yaml"
CHANGELOG_MD = ROOT / "CHANGELOG.md"
CHANGES_START = "<!-- curriculum-changes:start -->"
CHANGES_END = "<!-- curriculum-changes:end -->"

# How each change kind reads in CHANGELOG.md (the site's labels live in curriculum/presentation.yaml).
KIND_LABELS = {
    "promoted": "Promoted to ready",
    "demoted": "Moved back to mapped",
    "added": "Added to the map",
    "removed": "Removed from the map",
    "lab-added": "Lab added",
    "lab-removed": "Lab removed",
}

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
        "A **coverage** item belongs in the audited roadmap but does not yet have the complete learner lifecycle required for a ready route.",  # noqa: E501
        "",
        "## By domain",
        "",
        "| Domain | Catalog competencies | Ready routes |",
        "| --- | ---: | ---: |",
    ]

    for domain in DOMAIN_LABELS:
        value = counts.get(domain, {"total": 0, "ready": 0})
        lines.append(f"| {DOMAIN_LABELS[domain]} | {value['total']} | {value['ready']} |")

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
            route = route[len(prefix) :]
        lines.append(
            f"| `{item['id']}` — {item['title']} | "
            f"{DOMAIN_LABELS.get(item['domain'], item['domain'])} | "
            f"[Open route]({route}/) |"
        )

    lines += [
        "",
        "## Promotion rule",
        "",
        "A coverage item becomes ready only when it satisfies the contract in [../docs/LEARNING_MODEL.md](../docs/LEARNING_MODEL.md), including:",  # noqa: E501
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


def lab_title(lab: str) -> str:
    readme = ROOT / "labs" / lab / "README.md"
    if readme.exists():
        for line in readme.read_text(encoding="utf-8").splitlines():
            if line.startswith("# "):
                return line[2:].strip()
    return lab


def rfc_link(number: str) -> str:
    matches = sorted((ROOT / "rfcs").glob(f"{number}-*.md"))
    return f"[RFC {number}]({matches[0].relative_to(ROOT).as_posix()})" if matches else f"RFC {number}"


def render_changes():
    """CHANGELOG.md with its curriculum block rendered from curriculum/changelog.yaml.

    Keep a Changelog order: Unreleased first, then releases newest first; days newest first.
    """
    doc = yaml.safe_load(CATALOG.read_text(encoding="utf-8")) or {}
    catalog = {item["id"]: item for item in doc.get("competencies", []) or []}
    log = yaml.safe_load(CHANGE_LOG.read_text(encoding="utf-8")) or {}
    releases = [(str(r["version"]), str(r["date"])) for r in log.get("releases") or []]
    events = log.get("changes") or []

    def names(event):
        out = []
        for cid in event.get("competencies") or []:
            item = catalog.get(cid)
            if item and item.get("route"):
                out.append(f"[{item['title']}]({item['route']}/)")
            elif item:
                out.append(f"{item['title']} (`{cid}`)")
            else:
                out.append(f"`{cid}`")
        out += [f"[{lab_title(lab)}](labs/{lab}/)" for lab in event.get("labs") or []]
        return ", ".join(out)

    def line(event):
        if event.get("rfc"):
            decision = f" under {rfc_link(str(event['rfc']))}"
        elif event.get("pre_rfc"):
            decision = " before the RFC process"
        else:
            decision = ""
        text = f"- {KIND_LABELS[event['kind']]}{decision}: {names(event)}."
        if event.get("note"):
            text += f" {event['note']}"
        return text

    def section(heading, members):
        lines = [f"### {heading}", ""]
        if not members:
            return lines + ["No curriculum changes recorded.", ""]
        for day in sorted({str(e["date"]) for e in members}, reverse=True):
            lines += [f"#### {day}", ""]
            lines += [line(e) for e in reversed(members) if str(e["date"]) == day]
            lines.append("")
        return lines

    lines = [
        CHANGES_START,
        "",
        "Generated from [curriculum/changelog.yaml](curriculum/changelog.yaml) by `scripts/render_status.py`. "
        "Do not edit by hand.",
        "",
    ]
    lines += section("Unreleased", [e for e in events if not e.get("release")])
    for version, day in reversed(releases):
        lines += section(f"{version} — {day}", [e for e in events if str(e.get("release")) == version])
    lines.append(CHANGES_END)

    current = CHANGELOG_MD.read_text(encoding="utf-8")
    if CHANGES_START not in current or CHANGES_END not in current:
        print(f"CHANGELOG.md needs the markers {CHANGES_START} and {CHANGES_END}")
        sys.exit(1)
    before = current.split(CHANGES_START, 1)[0]
    after = current.split(CHANGES_END, 1)[1]
    return before + "\n".join(lines) + after


def main():
    parser = argparse.ArgumentParser(description="Render curriculum/STATUS.md and CHANGELOG.md's curriculum block.")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    outputs = [
        (STATUS, render(), "curriculum/catalog.yaml"),
        (CHANGELOG_MD, render_changes(), "curriculum/changelog.yaml"),
    ]

    if args.write:
        for path, rendered, _ in outputs:
            path.write_text(rendered, encoding="utf-8")
            print(f"Wrote {path.relative_to(ROOT)}")
        return

    if args.check:
        stale = False
        for path, rendered, source in outputs:
            current = path.read_text(encoding="utf-8") if path.exists() else ""
            if current != rendered:
                print(f"{path.relative_to(ROOT)} is out of date with {source}.")
                stale = True
            else:
                print(f"OK: {path.relative_to(ROOT)} matches {source}")
        if stale:
            print("Run: python scripts/render_status.py --write")
            sys.exit(1)
        return

    print(outputs[0][1])


if __name__ == "__main__":
    main()
