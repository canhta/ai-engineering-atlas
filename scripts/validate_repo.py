#!/usr/bin/env python3
from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
errors = []

RESOURCE_REQUIRED = {"id", "type", "title", "url", "roles", "source_verified", "last_checked"}
VALID_RESOURCE_ROLES = {
    "curriculum-evidence",
    "teaching",
    "visual",
    "practice",
    "assessment",
    "production-reference",
    "reference",
    "benchmark",
    "ux-benchmark",
}

COMPETENCY_REQUIRED = {
    "id",
    "title",
    "domain",
    "status",
    "competency_types",
    "target_level",
    "target_states",
    "why",
    "curriculum_evidence",
    "prerequisites",
    "outcomes",
    "diagnostic",
    "learning_route",
    "exit_evidence",
    "metadata",
}

VALID_LEVELS = {"L0", "L1", "L2", "L3", "L4"}
VALID_STATUS = {"incomplete", "seeded", "ready"}
VALID_TYPES = {
    "concept",
    "mechanism",
    "engineering-skill",
    "system-operation",
    "design-judgment",
    "production-competency",
}
VALID_STATES = {
    "unassessed",
    "gap",
    "learning",
    "demonstrated",
    "transferred",
    "retained",
    "applied",
}
VALID_TARGET_STATES = {"demonstrated", "transferred", "retained", "applied"}
VALID_SPINES = {"foundation", "ai-system", "production"}

resource_map = {}

for path in sorted((ROOT / "resources").glob("*.yaml")):
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: YAML parse error: {exc}")
        continue

    for item in data.get("resources", []) or []:
        rid = item.get("id")
        if not rid:
            errors.append(f"{path.relative_to(ROOT)}: resource without id")
            continue
        if rid in resource_map:
            errors.append(f"duplicate resource id: {rid}")
        resource_map[rid] = item

        for field in sorted(RESOURCE_REQUIRED - item.keys()):
            errors.append(f"{path.relative_to(ROOT)}: {rid} missing '{field}'")

        roles = item.get("roles") or []
        if not roles:
            errors.append(f"{path.relative_to(ROOT)}: {rid} has no roles")
        for role in roles:
            if role not in VALID_RESOURCE_ROLES:
                errors.append(f"{path.relative_to(ROOT)}: {rid} invalid role '{role}'")

        if item.get("source_verified") is not True:
            errors.append(f"{path.relative_to(ROOT)}: {rid} must explicitly set source_verified: true")


def check_resource_ref(ref, context, *, require_verified=False):
    if not isinstance(ref, str):
        errors.append(f"{context}: resource reference must be a string")
        return

    if ref.startswith("http://") or ref.startswith("https://"):
        return

    if ref not in resource_map:
        errors.append(f"{context}: unknown resource id '{ref}'")
        return

    if require_verified and resource_map[ref].get("source_verified") is not True:
        errors.append(f"{context}: resource '{ref}' is not verified")


competencies = {}

for path in sorted((ROOT / "curriculum").rglob("competency.yaml")):
    rel = path.relative_to(ROOT)
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{rel}: YAML parse error: {exc}")
        continue

    for field in sorted(COMPETENCY_REQUIRED - data.keys()):
        errors.append(f"{rel}: missing '{field}'")

    cid = data.get("id")
    if cid:
        if cid in competencies:
            errors.append(f"duplicate competency id: {cid}")
        competencies[cid] = {"data": data, "path": path}

    if data.get("target_level") not in VALID_LEVELS:
        errors.append(f"{rel}: invalid target_level '{data.get('target_level')}'")

    if data.get("status") not in VALID_STATUS:
        errors.append(f"{rel}: invalid status '{data.get('status')}'")

    for value in data.get("competency_types") or []:
        if value not in VALID_TYPES:
            errors.append(f"{rel}: invalid competency type '{value}'")

    states = data.get("target_states") or []
    if not states:
        errors.append(f"{rel}: target_states must not be empty")
    for value in states:
        if value not in VALID_TARGET_STATES:
            errors.append(f"{rel}: invalid target state '{value}'")

    diagnostic = data.get("diagnostic") or {}
    if not isinstance(diagnostic, dict):
        errors.append(f"{rel}: diagnostic must be an object")
    else:
        if not diagnostic.get("tasks"):
            errors.append(f"{rel}: diagnostic.tasks must not be empty")
        if not diagnostic.get("pass_condition"):
            errors.append(f"{rel}: diagnostic.pass_condition is required")

    route = data.get("learning_route") or {}
    if not isinstance(route, dict):
        errors.append(f"{rel}: learning_route must be an object")
        route = {}

    if not route.get("mental_model"):
        errors.append(f"{rel}: learning_route.mental_model must not be empty")
    if not route.get("independent_practice"):
        errors.append(f"{rel}: learning_route.independent_practice must not be empty")

    for section in ["mental_model", "guided_practice", "visual"]:
        for item in route.get(section, []) or []:
            if isinstance(item, dict) and item.get("source"):
                check_resource_ref(
                    item["source"],
                    f"{rel}: learning_route.{section}",
                    require_verified=data.get("status") == "ready",
                )

    for ref in data.get("curriculum_evidence", []) or []:
        check_resource_ref(
            ref,
            f"{rel}: curriculum_evidence",
            require_verified=data.get("status") == "ready",
        )

    for role, values in (data.get("resources") or {}).items():
        if not isinstance(values, list):
            errors.append(f"{rel}: resources.{role} must be a list")
            continue
        for rid in values:
            check_resource_ref(
                rid,
                f"{rel}: resources.{role}",
                require_verified=data.get("status") == "ready",
            )

    if not data.get("exit_evidence"):
        errors.append(f"{rel}: exit_evidence must not be empty")

    if data.get("status") == "ready":
        readme = path.with_name("README.md")
        if not readme.exists():
            errors.append(f"{rel}: ready competency requires README.md")

        for item in route.get("mental_model", []) or []:
            if not isinstance(item, dict):
                errors.append(f"{rel}: ready mental_model item must be an object")
                continue
            for field in ["source", "locator", "purpose"]:
                if not item.get(field):
                    errors.append(f"{rel}: ready mental_model item missing '{field}'")

        for item in route.get("independent_practice", []) or []:
            if not isinstance(item, dict) or not item.get("task"):
                errors.append(f"{rel}: ready independent practice requires a task")
                continue
            artifact = item.get("artifact")
            if artifact:
                artifact_path = ROOT / artifact
                if not artifact_path.exists():
                    errors.append(f"{rel}: practice artifact does not exist: {artifact}")

        if "transferred" in states and not data.get("transfer"):
            errors.append(f"{rel}: target state transferred requires transfer task")
        if "retained" in states and not data.get("review"):
            errors.append(f"{rel}: target state retained requires review plan")
        if "applied" in states and not data.get("project_spines"):
            errors.append(f"{rel}: target state applied requires project_spines")


PROJECT_REQUIRED = {"id", "title", "spines", "purpose", "milestones", "competencies", "evidence"}
project_ids = set()

for path in sorted((ROOT / "projects").rglob("project.yaml")):
    rel = path.relative_to(ROOT)
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{rel}: YAML parse error: {exc}")
        continue

    for field in sorted(PROJECT_REQUIRED - data.keys()):
        errors.append(f"{rel}: missing '{field}'")

    pid = data.get("id")
    if pid:
        if pid in project_ids:
            errors.append(f"duplicate project id: {pid}")
        project_ids.add(pid)

    for spine in data.get("spines", []) or []:
        if spine not in VALID_SPINES:
            errors.append(f"{rel}: invalid spine '{spine}'")

    for cid in data.get("competencies", []) or []:
        if cid not in competencies:
            errors.append(f"{rel}: unknown competency '{cid}'")

    if not path.with_name("README.md").exists():
        errors.append(f"{rel}: project requires README.md")


progress_path = ROOT / "progress" / "progress.example.yaml"
if progress_path.exists():
    data = yaml.safe_load(progress_path.read_text(encoding="utf-8")) or {}
    for cid, entry in (data.get("competencies") or {}).items():
        if cid not in competencies:
            errors.append(f"progress/progress.example.yaml: unknown competency '{cid}'")

        state = entry.get("state")
        target = entry.get("target_state")
        if state not in VALID_STATES:
            errors.append(f"progress/progress.example.yaml: invalid state '{state}' for {cid}")
        if target not in VALID_TARGET_STATES:
            errors.append(f"progress/progress.example.yaml: invalid target_state '{target}' for {cid}")

        if state != "unassessed" and not entry.get("evidence"):
            errors.append(f"progress/progress.example.yaml: {cid} state '{state}' requires evidence")

        if not entry.get("next_action"):
            errors.append(f"progress/progress.example.yaml: {cid} requires next_action")


manifest_path = ROOT / "curriculum" / "manifest.yaml"
if manifest_path.exists():
    manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
    for domain in manifest.get("domains", []) or []:
        domain_path = domain.get("path")
        if domain_path and not (ROOT / domain_path).exists():
            errors.append(f"curriculum/manifest.yaml: missing domain path '{domain_path}'")


if errors:
    print("Validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

ready_count = sum(
    1 for item in competencies.values()
    if item["data"].get("status") == "ready"
)
print(
    f"OK: {len(competencies)} competencies "
    f"({ready_count} ready), {len(resource_map)} resources, {len(project_ids)} projects"
)
