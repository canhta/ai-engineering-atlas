#!/usr/bin/env python3
import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
errors = []

LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
BACKTICK_FENCE = chr(96) * 3
TILDE_FENCE = "~" * 3
SKIP_DIRS = {"node_modules", ".git", ".astro", "dist", ".wrangler", "worktrees"}


def without_fenced_code(text: str) -> str:
    lines = []
    in_fence = False
    fence = None

    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith(BACKTICK_FENCE) or stripped.startswith(TILDE_FENCE):
            marker = stripped[:3]
            if not in_fence:
                in_fence = True
                fence = marker
            elif marker == fence:
                in_fence = False
                fence = None
            continue
        if not in_fence:
            lines.append(line)

    return "\n".join(lines)


for path in sorted(ROOT.rglob("*.md")):
    if SKIP_DIRS.intersection(path.relative_to(ROOT).parts):
        continue
    text = without_fenced_code(path.read_text(encoding="utf-8"))

    for raw_target in LINK_RE.findall(text):
        target = raw_target.strip()

        if (
            not target
            or target.startswith("#")
            or target.startswith("http://")
            or target.startswith("https://")
            or target.startswith("mailto:")
        ):
            continue

        if ' "' in target:
            target = target.split(' "', 1)[0]

        target = unquote(target.split("#", 1)[0].split("?", 1)[0])
        if not target:
            continue

        resolved = ROOT / target.lstrip("/") if target.startswith("/") else path.parent / target

        if not resolved.exists():
            errors.append(f"{path.relative_to(ROOT)}: broken relative link '{raw_target}'")

if errors:
    print("Relative link validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("OK: relative Markdown links resolve")
