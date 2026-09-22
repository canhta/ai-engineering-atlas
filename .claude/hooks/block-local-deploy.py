#!/usr/bin/env python3
"""PreToolUse hook: deploys go through the manual Deploy site workflow, not local sessions."""

import json
import re
import sys

command = (json.load(sys.stdin).get("tool_input") or {}).get("command", "")
# Ignore quoted text (commit messages, echoes, test strings) so only an actual invocation matches.
command = re.sub(r"'[^']*'|\"[^\"]*\"", "", command)
if re.search(r"\bwrangler\b[^|;&]*\b(deploy|publish|versions\s+deploy)\b", command):
    print(
        "Deploys run only through the manual 'Deploy site' GitHub Actions workflow (site/AGENTS.md).",
        file=sys.stderr,
    )
    sys.exit(2)
