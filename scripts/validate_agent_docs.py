#!/usr/bin/env python3
"""Keep agent-facing docs loadable, within budget, and pointing at real commands."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", ".astro", "dist", "worktrees"}

# Line budgets. Claude Code recommends <200 lines per instruction file; the root
# file predates this check, so its budget only stops further growth. DESIGN.md is
# reference, read when touching a surface rather than every turn, and it grows with
# the surfaces themselves (labs, decision forms, next step, collection indexes), so
# its budget is raised deliberately rather than paid for by thinning the prose.
LINE_BUDGETS = {
    "AGENTS.md": 200,
    "site/AGENTS.md": 150,
    "site/DESIGN.md": 340,
}
# Codex concatenates AGENTS.md files from the repo root down, capped at 32 KiB.
CHAIN_BYTES = 32 * 1024

MAKE_RE = re.compile(r"`make ([a-z][a-z0-9-]*)")
SCRIPT_RE = re.compile(r"`python3? (scripts/[\w./-]+\.py)")
PNPM_RE = re.compile(r"`pnpm run ([\w:-]+)")
NODE_RE = re.compile(r"`node (scripts/[\w./-]+\.mjs)")
TARGET_RE = re.compile(r"^([a-z][a-z0-9-]*):", re.MULTILINE)
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)

errors = []


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def walk(name: str):
    for path in sorted(ROOT.rglob(name)):
        if not SKIP_DIRS.intersection(path.relative_to(ROOT).parts):
            yield path


agents_files = list(walk("AGENTS.md"))
skill_files = list(walk("SKILL.md"))
design_files = list(walk("DESIGN.md"))

# 1. Every AGENTS.md has a sibling CLAUDE.md importing it. Once any CLAUDE.md
#    exists, Claude Code stops reading AGENTS.md directly in that tree.
for path in agents_files:
    claude = path.with_name("CLAUDE.md")
    if not claude.exists():
        errors.append(f"{rel(path)}: missing sibling CLAUDE.md containing '@AGENTS.md'")
    elif "@AGENTS.md" not in claude.read_text(encoding="utf-8").split():
        errors.append(f"{rel(claude)}: must import its sibling with '@AGENTS.md'")

# 2. Size budgets.
for name, budget in LINE_BUDGETS.items():
    path = ROOT / name
    if path.exists():
        lines = len(path.read_text(encoding="utf-8").splitlines())
        if lines > budget:
            errors.append(f"{name}: {lines} lines exceeds budget of {budget}; prune before adding")

for path in agents_files:
    chain = [p for p in agents_files if path.parent == p.parent or p.parent in path.parents]
    size = sum(p.stat().st_size for p in chain)
    if size > CHAIN_BYTES:
        errors.append(f"{rel(path)}: AGENTS.md chain is {size} bytes, over the {CHAIN_BYTES}-byte Codex limit")

# 3. Commands named in agent docs exist.
makefile = (ROOT / "Makefile").read_text(encoding="utf-8")
make_targets = set(TARGET_RE.findall(makefile))
site_package = ROOT / "site" / "package.json"
site_scripts = (
    set(json.loads(site_package.read_text(encoding="utf-8")).get("scripts", {})) if site_package.exists() else set()
)
doc_files = agents_files + skill_files + design_files + [ROOT / "CONTRIBUTING.md"]

for path in doc_files:
    text = path.read_text(encoding="utf-8")
    for target in MAKE_RE.findall(text):
        if target not in make_targets:
            errors.append(f"{rel(path)}: `make {target}` is not a Makefile target")
    for script in SCRIPT_RE.findall(text):
        if not (ROOT / script).exists():
            errors.append(f"{rel(path)}: `{script}` does not exist")
    for script in PNPM_RE.findall(text):
        if script not in site_scripts:
            errors.append(f"{rel(path)}: `pnpm run {script}` is not a script in site/package.json")
    for script in NODE_RE.findall(text):
        if not (ROOT / "site" / script).exists():
            errors.append(f"{rel(path)}: `node {script}` does not exist under site/")

# 4. Skills follow the Agent Skills spec: name matches directory, description set.
for path in skill_files:
    match = FRONTMATTER_RE.match(path.read_text(encoding="utf-8"))
    if not match:
        errors.append(f"{rel(path)}: missing YAML frontmatter")
        continue
    fields = dict(
        line.split(":", 1) for line in match.group(1).splitlines() if ":" in line and not line.startswith(" ")
    )
    name = fields.get("name", "").strip()
    description = fields.get("description", "").strip()
    if name != path.parent.name:
        errors.append(f"{rel(path)}: name '{name}' must match directory '{path.parent.name}'")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", name):
        errors.append(f"{rel(path)}: name must be 1-64 lowercase letters, digits, or hyphens")
    if not description or len(description) > 1024:
        errors.append(f"{rel(path)}: description must be 1-1024 characters")

if errors:
    print("Agent doc validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"OK: {len(agents_files)} AGENTS.md files, {len(skill_files)} skills, commands and budgets verified")
