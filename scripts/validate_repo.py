#!/usr/bin/env python3
from pathlib import Path
from datetime import date, timedelta
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
errors = []

VALID_LEVELS = {"L0", "L1", "L2", "L3", "L4"}
VALID_ROUTE_STATUS = {"incomplete", "seeded", "ready"}
VALID_CATALOG_STATUS = {"coverage", "ready"}
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

# ---------------------------------------------------------------------------
# Domain manifest
# ---------------------------------------------------------------------------

manifest_path = ROOT / "curriculum" / "manifest.yaml"
domain_ids = set()

if not manifest_path.exists():
    errors.append("missing curriculum/manifest.yaml")
else:
    try:
        manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        manifest = {}
        errors.append(f"curriculum/manifest.yaml: YAML parse error: {exc}")

    for domain in manifest.get("domains", []) or []:
        domain_id = domain.get("id")
        domain_path = domain.get("path")

        if not domain_id:
            errors.append("curriculum/manifest.yaml: domain without id")
            continue

        if domain_id in domain_ids:
            errors.append(f"curriculum/manifest.yaml: duplicate domain id '{domain_id}'")
        domain_ids.add(domain_id)

        if not domain_path:
            errors.append(f"curriculum/manifest.yaml: domain '{domain_id}' missing path")
        elif not (ROOT / domain_path).exists():
            errors.append(f"curriculum/manifest.yaml: missing domain path '{domain_path}'")


# ---------------------------------------------------------------------------
# Canonical competency catalog
# ---------------------------------------------------------------------------

catalog_path = ROOT / "curriculum" / "catalog.yaml"
catalog = {}

if not catalog_path.exists():
    errors.append("missing curriculum/catalog.yaml")
else:
    try:
        catalog_doc = yaml.safe_load(catalog_path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        catalog_doc = {}
        errors.append(f"curriculum/catalog.yaml: YAML parse error: {exc}")

    for item in catalog_doc.get("competencies", []) or []:
        cid = item.get("id")
        title = item.get("title")
        domain = item.get("domain")
        status = item.get("status")

        if not cid:
            errors.append("curriculum/catalog.yaml: competency without id")
            continue

        if cid in catalog:
            errors.append(f"curriculum/catalog.yaml: duplicate competency id '{cid}'")
        catalog[cid] = item

        if not title:
            errors.append(f"curriculum/catalog.yaml: '{cid}' missing title")

        if domain not in domain_ids:
            errors.append(
                f"curriculum/catalog.yaml: '{cid}' references unknown domain '{domain}'"
            )

        if status not in VALID_CATALOG_STATUS:
            errors.append(
                f"curriculum/catalog.yaml: '{cid}' has invalid status '{status}'"
            )

        route = item.get("route")
        if status == "ready":
            if not route:
                errors.append(
                    f"curriculum/catalog.yaml: ready competency '{cid}' requires route"
                )
            elif not (ROOT / route).exists():
                errors.append(
                    f"curriculum/catalog.yaml: ready competency '{cid}' route does not exist: {route}"
                )
        elif route:
            errors.append(
                f"curriculum/catalog.yaml: coverage competency '{cid}' must not declare route"
            )


# ---------------------------------------------------------------------------
# Resource registry
# ---------------------------------------------------------------------------

RESOURCE_REQUIRED = {
    "id",
    "type",
    "title",
    "url",
    "roles",
    "source_verified",
    "last_checked",
}
resource_map = {}
ready_source_ids = set()

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
                errors.append(
                    f"{path.relative_to(ROOT)}: {rid} invalid role '{role}'"
                )

        if item.get("source_verified") is not True:
            errors.append(
                f"{path.relative_to(ROOT)}: {rid} must explicitly set source_verified: true"
            )


def check_resource_ref(ref, context, *, require_verified=False):
    if not isinstance(ref, str):
        errors.append(f"{context}: resource reference must be a string")
        return

    if ref.startswith("http://") or ref.startswith("https://"):
        return

    if ref not in resource_map:
        errors.append(f"{context}: unknown resource id '{ref}'")
        return

    if require_verified:
        ready_source_ids.add(ref)
        if resource_map[ref].get("source_verified") is not True:
            errors.append(f"{context}: resource '{ref}' is not verified")


# ---------------------------------------------------------------------------
# Ready / seeded competency route packages
# ---------------------------------------------------------------------------

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
route_competencies = {}

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
        if cid in route_competencies:
            errors.append(f"duplicate competency route id: {cid}")
        route_competencies[cid] = {"data": data, "path": path}

        if cid not in catalog:
            errors.append(
                f"{rel}: competency id '{cid}' is not registered in curriculum/catalog.yaml"
            )
        elif data.get("status") == "ready" and catalog[cid].get("status") != "ready":
            errors.append(
                f"{rel}: route is ready but catalog status for '{cid}' is not ready"
            )

        catalog_route = (catalog.get(cid) or {}).get("route")
        if data.get("status") == "ready" and catalog_route:
            expected = (ROOT / catalog_route).resolve()
            actual = path.parent.resolve()
            if expected != actual:
                errors.append(
                    f"{rel}: catalog route for '{cid}' points to '{catalog_route}', "
                    f"not '{path.parent.relative_to(ROOT)}'"
                )

    if data.get("domain") not in domain_ids:
        errors.append(f"{rel}: unknown domain '{data.get('domain')}'")

    if cid in catalog and data.get("domain") != catalog[cid].get("domain"):
        errors.append(
            f"{rel}: domain does not match catalog for '{cid}' "
            f"({data.get('domain')} != {catalog[cid].get('domain')})"
        )

    if data.get("target_level") not in VALID_LEVELS:
        errors.append(f"{rel}: invalid target_level '{data.get('target_level')}'")

    if data.get("status") not in VALID_ROUTE_STATUS:
        errors.append(f"{rel}: invalid route status '{data.get('status')}'")

    types = data.get("competency_types") or []
    if not types:
        errors.append(f"{rel}: competency_types must not be empty")
    for value in types:
        if value not in VALID_TYPES:
            errors.append(f"{rel}: invalid competency type '{value}'")

    states = data.get("target_states") or []
    if not states:
        errors.append(f"{rel}: target_states must not be empty")
    for value in states:
        if value not in VALID_TARGET_STATES:
            errors.append(f"{rel}: invalid target state '{value}'")

    prerequisites = data.get("prerequisites") or []
    prerequisite_support = data.get("prerequisite_support") or {}

    for prereq in prerequisites:
        if prereq == cid:
            errors.append(f"{rel}: competency cannot depend on itself")
            continue
        if prereq not in catalog:
            errors.append(
                f"{rel}: prerequisite '{prereq}' is not registered in curriculum/catalog.yaml"
            )
            continue

        if data.get("status") == "ready" and catalog[prereq].get("status") != "ready":
            bridge = prerequisite_support.get(prereq)
            if not isinstance(bridge, dict):
                errors.append(
                    f"{rel}: ready route prerequisite '{prereq}' is coverage-only "
                    "and requires prerequisite_support"
                )
                continue

            for field in ["diagnostic", "source", "locator", "purpose"]:
                if not bridge.get(field):
                    errors.append(
                        f"{rel}: prerequisite_support.{prereq} missing '{field}'"
                    )

            if bridge.get("source"):
                check_resource_ref(
                    bridge["source"],
                    f"{rel}: prerequisite_support.{prereq}",
                    require_verified=True,
                )

    for bridge_id in prerequisite_support:
        if bridge_id not in prerequisites:
            errors.append(
                f"{rel}: prerequisite_support contains non-prerequisite '{bridge_id}'"
            )

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
                    errors.append(
                        f"{rel}: ready mental_model item missing '{field}'"
                    )

        for item in route.get("independent_practice", []) or []:
            if not isinstance(item, dict) or not item.get("task"):
                errors.append(
                    f"{rel}: ready independent practice requires a task"
                )
                continue

            artifact = item.get("artifact")
            if artifact and not (ROOT / artifact).exists():
                errors.append(
                    f"{rel}: practice artifact does not exist: {artifact}"
                )

        if "transferred" in states and not data.get("transfer"):
            errors.append(f"{rel}: target state transferred requires transfer task")

        if "retained" in states and not data.get("review"):
            errors.append(f"{rel}: target state retained requires review plan")

        if "applied" in states and not data.get("project_spines"):
            errors.append(f"{rel}: target state applied requires project_spines")


# Every catalog item marked ready must have exactly one route package.
for cid, item in catalog.items():
    if item.get("status") != "ready":
        continue

    if cid not in route_competencies:
        errors.append(
            f"curriculum/catalog.yaml: ready competency '{cid}' has no competency.yaml route"
        )
    elif route_competencies[cid]["data"].get("status") != "ready":
        errors.append(
            f"curriculum/catalog.yaml: '{cid}' is ready but its competency.yaml "
            "route status is not ready"
        )


# ---------------------------------------------------------------------------
# Reference projects
# ---------------------------------------------------------------------------

PROJECT_REQUIRED = {
    "id",
    "title",
    "spines",
    "purpose",
    "milestones",
    "competencies",
    "evidence",
}
project_ids = set()
projects = []

for path in sorted((ROOT / "projects").rglob("project.yaml")):
    rel = path.relative_to(ROOT)

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        errors.append(f"{rel}: YAML parse error: {exc}")
        continue

    for field in sorted(PROJECT_REQUIRED - data.keys()):
        errors.append(f"{rel}: missing '{field}'")

    projects.append({"data": data, "path": path})

    pid = data.get("id")
    if pid:
        if pid in project_ids:
            errors.append(f"duplicate project id: {pid}")
        project_ids.add(pid)

    for spine in data.get("spines", []) or []:
        if spine not in VALID_SPINES:
            errors.append(f"{rel}: invalid spine '{spine}'")

    for cid in data.get("competencies", []) or []:
        if cid not in catalog:
            errors.append(f"{rel}: unknown catalog competency '{cid}'")

    if not path.with_name("README.md").exists():
        errors.append(f"{rel}: project requires README.md")


# Ready competencies that target applied evidence must be integrated into
# at least one declared project on a matching project spine.
for cid, route in route_competencies.items():
    data = route["data"]
    if data.get("status") != "ready":
        continue
    if "applied" not in (data.get("target_states") or []):
        continue

    required_spines = set(data.get("project_spines") or [])
    matches = []

    for project in projects:
        pdata = project["data"]
        if cid not in (pdata.get("competencies") or []):
            continue
        if required_spines & set(pdata.get("spines") or []):
            matches.append(pdata.get("id"))

    if not matches:
        errors.append(
            f"{route['path'].relative_to(ROOT)}: target state applied requires "
            "a project.yaml that declares this competency on a matching spine"
        )


# ---------------------------------------------------------------------------
# Learner progress example
# ---------------------------------------------------------------------------

progress_path = ROOT / "progress" / "progress.example.yaml"

if progress_path.exists():
    try:
        progress = yaml.safe_load(progress_path.read_text(encoding="utf-8")) or {}
    except Exception as exc:
        progress = {}
        errors.append(f"progress/progress.example.yaml: YAML parse error: {exc}")

    for cid, entry in (progress.get("competencies") or {}).items():
        if cid not in catalog:
            errors.append(
                f"progress/progress.example.yaml: unknown catalog competency '{cid}'"
            )

        state = entry.get("state")
        target = entry.get("target_state")

        if state not in VALID_STATES:
            errors.append(
                f"progress/progress.example.yaml: invalid state '{state}' for {cid}"
            )

        if target not in VALID_TARGET_STATES:
            errors.append(
                f"progress/progress.example.yaml: invalid target_state '{target}' for {cid}"
            )

        if state != "unassessed" and not entry.get("evidence"):
            errors.append(
                f"progress/progress.example.yaml: {cid} state '{state}' requires evidence"
            )

        if not entry.get("next_action"):
            errors.append(
                f"progress/progress.example.yaml: {cid} requires next_action"
            )


# ---------------------------------------------------------------------------
# Source freshness for ready routes
# ---------------------------------------------------------------------------

today = date.today()

for rid in sorted(ready_source_ids):
    item = resource_map[rid]
    raw_checked = item.get("last_checked")
    interval = item.get("review_interval_days")

    if isinstance(raw_checked, date):
        checked = raw_checked
    else:
        try:
            checked = date.fromisoformat(str(raw_checked))
        except Exception:
            errors.append(
                f"resource '{rid}' has invalid last_checked '{raw_checked}'"
            )
            continue

    if checked > today:
        errors.append(
            f"resource '{rid}' last_checked is in the future: {checked.isoformat()}"
        )

    if not isinstance(interval, int) or interval <= 0:
        errors.append(
            f"resource '{rid}' is used by a ready route and requires "
            "positive review_interval_days"
        )
        continue

    if checked + timedelta(days=interval) < today:
        errors.append(
            f"resource '{rid}' is stale for a ready route: "
            f"checked {checked.isoformat()}, interval {interval} days"
        )


# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

if errors:
    print("Validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

ready_count = sum(
    1 for item in catalog.values()
    if item.get("status") == "ready"
)
coverage_count = len(catalog) - ready_count

print(
    f"OK: {len(catalog)} catalog competencies "
    f"({ready_count} ready, {coverage_count} coverage), "
    f"{len(resource_map)} resources, {len(project_ids)} projects"
)
