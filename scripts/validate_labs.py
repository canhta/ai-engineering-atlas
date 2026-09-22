#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import py_compile
import sys
from pathlib import Path

import yaml

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


# 2. Browser contracts (labs/<id>/lab.yaml → browser:). Labs without lab.yaml stay local-only.
# Two runtimes: `pyodide` (a code lab run in the browser) and `form` (a decision lab rendered as
# a structured rubric form; rfcs/0000-interactive-web-atlas.md → In-browser labs → Decision labs).
BROWSER_RUNTIMES = {"pyodide", "form"}
PYODIDE_KEYS = {"runtime", "editable", "run", "reference", "files", "packages"}
FORM_KEYS = {"runtime", "fields"}
FORM_FIELD_TYPES = {"text", "longtext", "choice", "table"}
FORM_FIELD_KEYS = {"id", "label", "type", "help", "options", "columns"}


def pyodide_packages():
    """Package names the installed Pyodide provides, or an empty set when it is not installed."""
    lock = ROOT / "site" / "node_modules" / "pyodide" / "pyodide-lock.json"
    if not lock.is_file():
        return set()
    return set(json.loads(lock.read_text(encoding="utf-8")).get("packages", {}))


def check_pyodide(where, lab, browser):
    unknown = set(browser) - PYODIDE_KEYS
    if unknown:
        errors.append(f"{where}: unknown browser keys {sorted(unknown)}")
    for key in ("editable", "run", "reference"):
        name = browser.get(key)
        if not isinstance(name, str) or not name:
            errors.append(f"{where}: browser.{key} must name a file")
        elif not (lab / name).is_file():
            errors.append(f"{where}: browser.{key} file '{name}' does not exist")
    files = browser.get("files", [])
    if not isinstance(files, list) or not all(isinstance(f, str) and f for f in files):
        errors.append(f"{where}: browser.files must be a list of file names")
    else:
        for name in files:
            if "/" in name or not (lab / name).is_file():
                errors.append(f"{where}: browser.files entry '{name}' is not a file in the lab directory")
    packages = browser.get("packages", [])
    if not isinstance(packages, list) or not all(isinstance(p, str) and p for p in packages):
        errors.append(f"{where}: browser.packages must be a list of package names")
    elif packages:
        # Only packages Pyodide itself builds: site/scripts/fetch-pyodide-wheels.mjs serves their
        # wheels from our own origin, checked against pyodide-lock.json (site/AGENTS.md).
        available = pyodide_packages()
        missing = [name for name in packages if available and name not in available]
        if missing:
            errors.append(f"{where}: Pyodide has no package(s) {missing}; only packages it builds run in the browser")


def check_form(where, browser):
    unknown = set(browser) - FORM_KEYS
    if unknown:
        errors.append(f"{where}: unknown browser keys {sorted(unknown)}")
    fields = browser.get("fields")
    if not isinstance(fields, list) or not fields:
        errors.append(f"{where}: browser.fields must be a non-empty list")
        fields = []
    seen: set[str] = set()
    for i, entry in enumerate(fields):
        at = f"{where}: browser.fields[{i}]"
        if not isinstance(entry, dict):
            errors.append(f"{at} must be a mapping")
            continue
        unknown_keys = set(entry) - FORM_FIELD_KEYS
        if unknown_keys:
            errors.append(f"{at}: unknown keys {sorted(unknown_keys)}")
        fid = entry.get("id")
        if not isinstance(fid, str) or not fid:
            errors.append(f"{at}.id must be a non-empty string")
        elif fid in seen:
            errors.append(f"{at}.id '{fid}' is duplicated")
        else:
            seen.add(fid)
        if not isinstance(entry.get("label"), str) or not entry["label"]:
            errors.append(f"{at}.label must be a non-empty string")
        ftype = entry.get("type")
        if ftype not in FORM_FIELD_TYPES:
            errors.append(f"{at}.type must be one of {sorted(FORM_FIELD_TYPES)}")
        if "help" in entry and (not isinstance(entry["help"], str) or not entry["help"]):
            errors.append(f"{at}.help must be a non-empty string")
        if ftype == "choice":
            options = entry.get("options")
            if not isinstance(options, list) or not options or not all(isinstance(o, str) and o for o in options):
                errors.append(f"{at}.options must be a non-empty list of strings for a choice field")
        elif "options" in entry:
            errors.append(f"{at}: options is only valid for a choice field")
        if ftype == "table":
            columns = entry.get("columns")
            if not isinstance(columns, list) or not columns:
                errors.append(f"{at}.columns must be a non-empty list for a table field")
            else:
                for j, col in enumerate(columns):
                    ok = (
                        isinstance(col, dict)
                        and isinstance(col.get("id"), str)
                        and col["id"]
                        and isinstance(col.get("label"), str)
                        and col["label"]
                    )
                    if not ok:
                        errors.append(f"{at}.columns[{j}] must have a non-empty id and label")
        elif "columns" in entry:
            errors.append(f"{at}: columns is only valid for a table field")


for contract in sorted(LABS.glob("*/lab.yaml")):
    lab = contract.parent
    where = contract.relative_to(ROOT)
    try:
        data = yaml.safe_load(contract.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as exc:
        errors.append(f"{where}: invalid YAML: {exc}")
        continue
    browser = data.get("browser") if isinstance(data, dict) else None
    if not isinstance(browser, dict):
        errors.append(f"{where}: needs a `browser:` mapping")
        continue
    runtime = browser.get("runtime")
    if runtime not in BROWSER_RUNTIMES:
        errors.append(f"{where}: browser.runtime must be one of {sorted(BROWSER_RUNTIMES)}")
        continue
    if runtime == "pyodide":
        check_pyodide(where, lab, browser)
    else:
        check_form(where, browser)


# 3. Evaluation-harness reference solution contract.
try:
    lab = LABS / "evaluation-harness"
    starter = load_module("eval_starter_reference_check", lab / "starter.py")
    solution = load_module("eval_solution_reference_check", lab / "solution.py")

    cases = [
        json.loads(line) for line in (lab / "cases.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()
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


# 4. Prompt-injection reference authorization contract.
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
    errors.append(f"labs/prompt-injection-boundaries: reference contract failed: {exc}")


# 5. Self-attention runtime check when Torch is already available.
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

        output, scores, mask, probs = solution.causal_self_attention(x, w_q, w_k, w_v)

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
