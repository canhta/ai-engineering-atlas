#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import py_compile
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABS = ROOT / "labs"
errors = []


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    # Some stdlib machinery (notably dataclasses with postponed annotations)
    # expects the module to exist in sys.modules while class bodies execute.
    sys.modules[name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:
        sys.modules.pop(name, None)
        raise
    return module


# 1. Every Python file should at least parse/compile.
for path in sorted(LABS.rglob("*.py")):
    try:
        py_compile.compile(str(path), doraise=True)
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: compile failed: {exc}")


# 2. Evaluation-harness reference solution contract.
try:
    lab = LABS / "evaluation-harness"
    starter = load_module("eval_starter_reference_check", lab / "starter.py")
    solution = load_module("eval_solution_reference_check", lab / "solution.py")

    cases = [
        json.loads(line)
        for line in (lab / "cases.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    strong = solution.evaluate(
        cases,
        starter.system_a,
        system_version="a",
        eval_version="v1",
    )
    weak = solution.evaluate(
        cases,
        starter.system_b,
        system_version="b",
        eval_version="v1",
    )

    assert strong["num_cases"] == len(cases)
    assert strong["overall_accuracy"] == 1.0
    assert weak["overall_accuracy"] < strong["overall_accuracy"]
    assert set(strong["slice_accuracy"]) == {
        "instruction-following",
        "simple-math",
    }
except Exception as exc:
    errors.append(f"labs/evaluation-harness: reference contract failed: {exc}")


# 3. Prompt-injection reference authorization contract.
try:
    lab = LABS / "prompt-injection-boundaries"

    # solution.py imports "starter", so temporarily expose the lab directory.
    sys.path.insert(0, str(lab))
    try:
        starter = load_module("starter", lab / "starter.py")
        sys.modules["starter"] = starter
        solution = load_module("prompt_solution_reference_check", lab / "solution.py")

        normal = starter.UserContext(
            user_id="user-1",
            permissions=frozenset({"docs:read"}),
        )
        admin = starter.UserContext(
            user_id="admin-1",
            permissions=frozenset({"docs:read", "admin:export"}),
        )
        search = starter.ToolRequest("search_docs", {"query": "attention"})
        injected = starter.compromised_model_output()

        assert solution.authorize(normal, search)
        assert not solution.authorize(normal, injected)
        assert solution.authorize(admin, injected)

        # Exercise the actual executor with the reference policy.
        starter.authorize = solution.authorize
        try:
            starter.execute_tool(normal, injected)
        except PermissionError:
            pass
        else:
            raise AssertionError("reference policy allowed unauthorized export")

        assert starter.execute_tool(admin, injected) == "SIMULATED_PRIVATE_EXPORT"
    finally:
        sys.path.pop(0)
        sys.modules.pop("starter", None)
except Exception as exc:
    errors.append(
        f"labs/prompt-injection-boundaries: reference contract failed: {exc}"
    )


# 4. Self-attention runtime check when Torch is already available.
try:
    import torch  # type: ignore
except Exception:
    torch = None

if torch is not None:
    try:
        lab = LABS / "self-attention"
        solution = load_module("attention_solution_reference_check", lab / "solution.py")

        torch.manual_seed(11)
        x = torch.randn(5, 8)
        w_q = torch.randn(8, 4)
        w_k = torch.randn(8, 4)
        w_v = torch.randn(8, 4)

        output, scores, mask, probs = solution.causal_self_attention(
            x, w_q, w_k, w_v
        )

        assert output.shape == (5, 4)
        assert scores.shape == (5, 5)
        assert mask.shape == (5, 5)
        assert probs.shape == (5, 5)
        assert torch.allclose(
            probs.sum(dim=-1),
            torch.ones(5),
            atol=1e-6,
        )
        assert torch.all(probs[mask] == 0)
    except Exception as exc:
        errors.append(f"labs/self-attention: reference contract failed: {exc}")


if errors:
    print("Lab validation failed:\n")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

runtime_note = " with Torch runtime check" if torch is not None else ""
print(f"OK: lab code compiles and reference contracts pass{runtime_note}")
