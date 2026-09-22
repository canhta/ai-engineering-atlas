from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Callable


def load_cases(path: str | Path):
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def system_a(text: str) -> str:
    mapping = {
        "2 + 2": "4",
        "10 - 3": "7",
        "Return the word BLUE in lowercase.": "blue",
        "Return exactly YES.": "YES",
    }
    return mapping.get(text, "")


def system_b(text: str) -> str:
    mapping = {
        "2 + 2": "4",
        "10 - 3": "8",  # deliberate regression
        "Return the word BLUE in lowercase.": "Blue",
        "Return exactly YES.": "YES",
    }
    return mapping.get(text, "")


def evaluate(
    cases,
    system: Callable[[str], str],
    *,
    system_version: str,
    eval_version: str,
):
    """Return a dict with per-case records, overall accuracy, slice accuracy,
    and latency statistics.

    Keep the implementation simple and explicit.
    """
    raise NotImplementedError


if __name__ == "__main__":
    cases = load_cases(Path(__file__).with_name("cases.jsonl"))
    print(evaluate(cases, system_a, system_version="a", eval_version="v1"))
