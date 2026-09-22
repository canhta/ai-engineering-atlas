#!/usr/bin/env python3
"""PreToolUse hook: send edits of generated files back to their generator."""

import json
import sys

GENERATED = {
    "site/src/data/atlas.json": "python scripts/build_site_data.py --write",
    "curriculum/STATUS.md": "python scripts/render_status.py --write",
}

payload = json.load(sys.stdin)
path = (payload.get("tool_input") or {}).get("file_path", "")

for suffix, command in GENERATED.items():
    if path.endswith(suffix):
        print(f"{suffix} is generated. Change its sources, then run: {command}", file=sys.stderr)
        sys.exit(2)
