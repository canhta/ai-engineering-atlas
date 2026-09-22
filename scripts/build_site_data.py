#!/usr/bin/env python3
"""Compile repository content into the web atlas content model (site/src/data/atlas.json).

The adapter is generic: curriculum/presentation.yaml names the collections, the
fields, and the blocks. Contract: rfcs/0000-content-model.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "curriculum" / "presentation.yaml"
OUTPUT = ROOT / "site" / "src" / "data" / "atlas.json"
SCHEMA = ROOT / "schemas" / "site-data.schema.json"
MODEL_VERSION = 2

RESOURCE_FIELDS = ("title", "type", "author", "url")

errors: list[str] = []
warnings: list[str] = []


# ---------------------------------------------------------------- loading


def normalize(value):
    """Convert YAML-native date/datetime objects to JSON-compatible strings."""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): normalize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize(item) for item in value]
    return value


def load_yaml(path: Path):
    return normalize(yaml.safe_load(path.read_text(encoding="utf-8")) or {})


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def load_pointer(spec: str):
    """Load `file.yaml#key` (or a whole file when there is no pointer)."""
    file, _, key = spec.partition("#")
    data = load_yaml(ROOT / file)
    return data.get(key) if key else data


def markdown_title(path: Path, fallback: str) -> str:
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("# "):
                return line[2:].strip()
    return fallback


def load_resources():
    resources = {}
    for path in sorted((ROOT / "resources").glob("*.yaml")):
        for item in load_yaml(path).get("resources", []) or []:
            rid = item.get("id")
            if rid:
                resources[rid] = {k: item[k] for k in RESOURCE_FIELDS if k in item}
    return resources


def en(text) -> dict:
    """Curriculum text carries English only until a reviewed translation exists."""
    return {"en": str(text)}


def get_path(data, dotted: str):
    value = data
    for part in dotted.split("."):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def collect(data, path: str) -> list:
    """Values at a path where `[]` steps into every list item (e.g. `a.b[].c`)."""
    values = [data]
    for part in path.split("."):
        is_list = part.endswith("[]")
        key = part[:-2] if is_list else part
        next_values = []
        for value in values:
            if isinstance(value, dict) and value.get(key) is not None:
                inner = value[key]
                if is_list:
                    next_values.extend(inner if isinstance(inner, list) else [])
                else:
                    next_values.append(inner)
        values = next_values
    return values


# ---------------------------------------------------------------- items


def raw_items(name: str, config: dict):
    """Yield (id, title, content, source_path, derived fields) for a collection."""
    spec = config["items_from"]
    id_key, title_key = config.get("id"), config.get("title")
    exclude = set(config.get("exclude", []))

    if "#" in spec:
        for entry in load_pointer(spec) or []:
            yield entry[id_key], entry[title_key], entry, None, {}
        return

    for path in sorted(ROOT.glob(spec.rstrip("/"))):
        if path.name in exclude:
            continue
        if spec.endswith("/"):
            if not path.is_dir():
                continue
            files = sorted(f.name for f in path.iterdir() if f.is_file() and not f.name.startswith("."))
            title = markdown_title(path / "README.md", path.name)
            content_file = path / config["content_from"] if config.get("content_from") else None
            content = load_yaml(content_file) if content_file and content_file.exists() else {}
            yield path.name, title, content, rel(path), {"path": rel(path), "files": files}
        elif path.suffix == ".md":
            yield path.stem, markdown_title(path, path.stem), {}, rel(path), {"path": rel(path)}
        else:
            content = load_yaml(path)
            title = content.get(title_key, path.parent.name) if title_key else path.parent.name
            yield path.parent.name, title, content, rel(path.parent), {"path": rel(path.parent)}


def template_keys(template: str | None) -> list[str]:
    return re.findall(r"{(\w+)}", template or "")


def load_page_source(config: dict, entry: dict, label: str):
    template = config.get("page_from")
    keys = template_keys(template)
    if not template or any(entry.get(k) is None for k in keys):
        return None, None
    path = ROOT / template.format(**{k: entry[k] for k in keys})
    if not path.exists():
        errors.append(f"{label}: page source {rel(path)} does not exist")
        return None, None
    return load_yaml(path), rel(path.parent)


def item_fields(name: str, config: dict, content: dict, derived: dict, vocabularies: dict, label: str):
    fields = {}
    for field, spec in (config.get("fields") or {}).items():
        value = derived.get(field, content.get(field))
        if value is None:
            continue
        values = value if isinstance(value, list) else [value]
        if any(isinstance(v, (dict, list)) for v in values):
            errors.append(f"{label}: field '{field}' must be a scalar or a list of scalars")
            continue
        vocab = spec.get("vocabulary")
        if vocab:
            for v in values:
                if str(v) not in vocabularies.get(vocab, {}):
                    errors.append(f"{label}: value '{v}' of field '{field}' is missing from vocabulary '{vocab}'")
        fields[field] = value
    return fields


def page_matches(config: dict, fields: dict) -> bool:
    when = config.get("page_when")
    if not config.get("blocks"):
        return False
    if not when:
        return True
    return fields.get(when["field"]) in when["in"]


# ---------------------------------------------------------------- blocks


class Context:
    def __init__(self, resources, resolver, label, source_path=None):
        self.resources = resources
        self.resolver = resolver
        self.label = label
        self.source_path = source_path
        self.used_resources: set[str] = set()

    def resource(self, value) -> str:
        value = str(value or "")
        if value.startswith(("http://", "https://")):
            return value
        if value not in self.resources:
            errors.append(f"{self.label}: unknown resource '{value}'")
        else:
            self.used_resources.add(value)
        return value

    def text(self, value, where: str) -> dict:
        if not isinstance(value, (str, int, float)):
            errors.append(f"{self.label}: {where} must be text")
        return en(value)

    def texts(self, value, where: str) -> list:
        if not isinstance(value, list):
            errors.append(f"{self.label}: {where} must be a list")
            return []
        return [self.text(v, where) for v in value]


def block_text(spec, value, content, ctx):
    where = spec.get("field") or spec.get("file")
    if spec.get("format") == "markdown":
        # The Markdown file's H1 is the item title, which the page already shows.
        lines = str(value).lstrip("\n").splitlines()
        if lines and lines[0].startswith("# "):
            value = "\n".join(lines[1:]).strip("\n")
        return {"body": ctx.text(value, where), "format": "markdown"}, [where]
    return {"body": ctx.text(value, where)}, [where]


def block_list(spec, value, content, ctx):
    return {"items": ctx.texts(value, spec["field"]), "ordered": bool(spec.get("ordered", False))}, [spec["field"]]


def block_prerequisites(spec, value, content, ctx):
    support_field = spec.get("support")
    support = (get_path(content, support_field) if support_field else None) or {}
    mapping = spec.get("bridge") or {}
    items = []
    for ref in value if isinstance(value, list) else []:
        item = {"ref": ctx.resolver.ref(ref, ctx.label)}
        bridge_src = support.get(ref)
        if isinstance(bridge_src, dict):
            bridge = {}
            for key, source_key in mapping.items():
                if bridge_src.get(source_key) is None:
                    continue
                if key == "resource":
                    bridge[key] = ctx.resource(bridge_src[source_key])
                else:
                    bridge[key] = ctx.text(bridge_src[source_key], f"{support_field}.{ref}.{source_key}")
            if "resource" not in bridge:
                errors.append(f"{ctx.label}: bridge for '{ref}' has no resource")
            item["bridge"] = bridge
        items.append(item)
    for ref in support:
        if ref not in (value or []):
            errors.append(f"{ctx.label}: {support_field} entry '{ref}' is not a declared prerequisite")
    consumed = [spec["field"]]
    if support_field:
        consumed += [f"{support_field}.*.{k}" for k in mapping.values()]
    return {"items": items}, consumed


def block_diagnostic(spec, value, content, ctx):
    mapping = spec["map"]
    field = spec["field"]
    payload = {
        "tasks": ctx.texts(value.get(mapping["tasks"]), f"{field}.{mapping['tasks']}"),
        "pass_condition": ctx.text(value.get(mapping["pass_condition"]), f"{field}.{mapping['pass_condition']}"),
    }
    return payload, [f"{field}.{mapping['tasks']}", f"{field}.{mapping['pass_condition']}"]


def block_sources(spec, value, content, ctx):
    mapping = spec["row"]
    field = spec["field"]
    rows = []
    for row in value if isinstance(value, list) else []:
        rows.append(
            {
                "resource": ctx.resource(row.get(mapping["resource"])),
                "locator": ctx.text(row.get(mapping["locator"]), f"{field} locator"),
                "purpose": ctx.text(row.get(mapping["purpose"]), f"{field} purpose"),
            }
        )
    return {"rows": rows}, [f"{field}[].{k}" for k in mapping.values()]


def block_practice(spec, value, content, ctx):
    mapping = spec["item"]
    field = spec["field"]
    groups, consumed = [], []
    for group in spec["groups"]:
        entries = value.get(group["field"]) or []
        items = []
        for entry in entries:
            item = {"text": ctx.text(entry.get(mapping["text"]), f"{field}.{group['field']}")}
            path = entry.get(mapping["path"]) if "path" in mapping else None
            if path:
                if not (ROOT / path).exists():
                    errors.append(f"{ctx.label}: practice path '{path}' does not exist")
                item["path"] = path
                ref = ctx.resolver.path_ref(path)
                if ref:
                    item["ref"] = ref
            if "resource" in mapping and entry.get(mapping["resource"]) is not None:
                item["resource"] = ctx.resource(entry[mapping["resource"]])
            if "locator" in mapping and entry.get(mapping["locator"]) is not None:
                item["locator"] = ctx.text(entry[mapping["locator"]], f"{field}.{group['field']} locator")
            items.append(item)
        if items:
            groups.append({"label": group["label"], "items": items})
        consumed += [f"{field}.{group['field']}[].{k}" for k in mapping.values()]
    return {"groups": groups}, consumed


def block_runner(spec, value, content, ctx):
    """A runnable lab: the files it ships (name → text) and which one the learner edits."""
    mapping = spec["map"]
    field = spec["field"]
    consumed = [f"{field}.{k}" for k in mapping.values()]
    # The labs collection declares both a `runner` and a `form` block against the same `browser`
    # field; each emits only when its runtime matches, so a lab's contract needs no special-casing.
    if str(value.get(mapping["runtime"])) != "pyodide":
        return None, consumed
    directory = ROOT / (ctx.source_path or "")

    def name(key):
        file = value.get(mapping[key])
        if not isinstance(file, str) or not (directory / file).is_file():
            errors.append(f"{ctx.label}: {field}.{mapping[key]} must name a file in {ctx.source_path}")
            return ""
        return file

    payload = {
        "runtime": str(value.get(mapping["runtime"]) or ""),
        "editable": name("editable"),
        "run": name("run"),
        "reference": name("reference"),
    }
    extra = value.get(mapping["files"]) or []
    files = {}
    for file in [payload["editable"], payload["run"], payload["reference"], *extra]:
        if not file:
            continue
        path = directory / str(file)
        if not path.is_file():
            errors.append(f"{ctx.label}: {field}.{mapping['files']} entry '{file}' does not exist")
            continue
        files[str(file)] = path.read_text(encoding="utf-8")
    payload["files"] = dict(sorted(files.items()))
    packages = value.get(mapping["packages"]) or []
    if packages:
        payload["packages"] = [str(p) for p in packages]
    return payload, consumed


FORM_FIELD_TYPES = {"text", "longtext", "choice", "table"}


def block_form(spec, value, content, ctx):
    """A decision lab's rubric or decision form: fields the learner fills (browser.runtime: form)."""
    mapping = spec["map"]
    field = spec["field"]
    consumed = [f"{field}.{mapping['runtime']}", f"{field}.{mapping['fields']}"]
    if str(value.get(mapping["runtime"])) != "form":
        return None, consumed
    fields = []
    seen_ids: set[str] = set()
    for i, raw in enumerate(value.get(mapping["fields"]) or []):
        where = f"{field}.{mapping['fields']}[{i}]"
        if not isinstance(raw, dict):
            errors.append(f"{ctx.label}: {where} must be a mapping")
            continue
        ftype = raw.get("type")
        if ftype not in FORM_FIELD_TYPES:
            errors.append(f"{ctx.label}: {where}.type must be one of {sorted(FORM_FIELD_TYPES)}")
            continue
        fid = str(raw.get("id") or "")
        if not fid:
            errors.append(f"{ctx.label}: {where}.id is required")
        elif fid in seen_ids:
            errors.append(f"{ctx.label}: {where}.id '{fid}' is duplicated")
        seen_ids.add(fid)
        entry = {"id": fid, "label": ctx.text(raw.get("label"), f"{where}.label"), "type": ftype}
        if raw.get("help") is not None:
            entry["help"] = ctx.text(raw["help"], f"{where}.help")
        if ftype == "choice":
            options = raw.get("options") or []
            if not options:
                errors.append(f"{ctx.label}: {where}.options must be a non-empty list for a choice field")
            entry["options"] = [ctx.text(o, f"{where}.options") for o in options]
        if ftype == "table":
            columns = raw.get("columns") or []
            if not columns:
                errors.append(f"{ctx.label}: {where}.columns must be a non-empty list for a table field")
            entry["columns"] = [
                {"id": str(c.get("id") or ""), "label": ctx.text(c.get("label"), f"{where}.columns")}
                for c in columns
                if isinstance(c, dict)
            ]
        fields.append(entry)
    return {"fields": fields}, consumed


def block_data(spec, value, content, ctx):
    return {"value": value}, [spec["field"]]


BLOCK_TYPES = {
    "text": block_text,
    "list": block_list,
    "prerequisites": block_prerequisites,
    "diagnostic": block_diagnostic,
    "sources": block_sources,
    "practice": block_practice,
    "runner": block_runner,
    "form": block_form,
    "data": block_data,
}


def slug(path: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-")


# ---------------------------------------------------------------- unmapped fields


def matches(pattern: list[str], path: list[str]) -> bool:
    return len(pattern) == len(path) and all(p == "*" or p == q for p, q in zip(pattern, path, strict=False))


def is_prefix(pattern: list[str], path: list[str]) -> bool:
    return len(pattern) > len(path) and all(p == "*" or p == q for p, q in zip(pattern, path, strict=False))


def split(path: str) -> list[str]:
    return [part for part in path.replace("[]", ".[]").split(".") if part]


def join(parts: list[str]) -> str:
    return ".".join(parts).replace(".[]", "[]")


def unmapped(content, covered: list[str]) -> dict[str, list]:
    """Return {path: value} for content not covered by any consumed or ignored path."""
    patterns = [split(p) for p in covered]
    found: dict[str, list] = {}

    def walk(value, path):
        if any(matches(p, path) for p in patterns):
            return
        if path and not any(is_prefix(p, path) for p in patterns):
            found.setdefault(join(path), []).append(value)
            return
        if isinstance(value, dict):
            for key, inner in value.items():
                walk(inner, path + [key])
        elif isinstance(value, list):
            for inner in value:
                walk(inner, path + ["[]"])
        else:
            found.setdefault(join(path), []).append(value)

    walk(content, [])
    return found


# ---------------------------------------------------------------- references


class Resolver:
    def __init__(self, collections: dict):
        self.collections = collections
        self.ids: dict[str, set[str]] = {}
        self.paths: dict[str, str] = {}
        self.prefix: dict[str, str] = {}

    def ref_for(self, collection: str, item_id: str) -> str:
        prefix = self.prefix.get(collection)
        return f"{prefix}:{item_id}" if prefix else item_id

    def add(self, collection: str, item_id: str, path: str | None):
        self.ids.setdefault(collection, set()).add(item_id)
        if path:
            self.paths[path.rstrip("/")] = self.ref_for(collection, item_id)

    def collection_of(self, ref: str) -> str | None:
        prefix, sep, item_id = ref.partition(":")
        for name, pfx in self.prefix.items():
            if (sep and pfx == prefix and item_id in self.ids.get(name, ())) or (
                not sep and not pfx and ref in self.ids.get(name, ())
            ):
                return name
        return None

    def ref(self, value, label: str) -> str:
        value = str(value)
        if self.collection_of(value) is None:
            errors.append(f"{label}: reference '{value}' does not resolve to an item")
        return value

    def path_ref(self, path: str) -> str | None:
        path = path.rstrip("/")
        while path:
            if path in self.paths:
                return self.paths[path]
            path = path.rpartition("/")[0]
        return None


# ---------------------------------------------------------------- build


def build_vocabularies(config: dict) -> dict:
    vocabularies = {}
    for name, spec in config.items():
        if "from" not in spec:
            entries = {
                value: {**entry, "order": entry.get("order", index)}
                for index, (value, entry) in enumerate(spec["values"].items())
            }
        else:
            source = load_pointer(spec["from"])
            if isinstance(source, dict):
                pairs = [(key, en(label)) for key, label in source.items()]
            else:
                pairs = [(entry[spec["key"]], entry.get(spec["label"])) for entry in source or []]
            entries = {}
            for index, (value, label) in enumerate(pairs):
                if not isinstance(label, dict) or not label.get("en"):
                    errors.append(f"vocabulary '{name}': value '{value}' has no English label in {spec['from']}")
                    label = en(value)
                entries[str(value)] = {"label": label, "order": index}
            # `values` next to `from` overrides per value; labels merge per locale.
            for value, override in (spec.get("values") or {}).items():
                if value not in entries:
                    errors.append(f"vocabulary '{name}': override for unknown value '{value}'")
                    continue
                entry = entries[value]
                for key, inner in override.items():
                    entry[key] = {**entry[key], **inner} if key == "label" else inner
        vocabularies[name] = entries
    return vocabularies


def check_config(presentation: dict, vocabularies: dict):
    for name, config in presentation["collections"].items():
        fields = config.get("fields") or {}
        for field, spec in fields.items():
            vocab = spec.get("vocabulary")
            if vocab and vocab not in vocabularies:
                errors.append(f"presentation: {name}.fields.{field} names unknown vocabulary '{vocab}'")
        named = [config.get("group_by")] + list(config.get("facets", [])) + list(config.get("list_fields", []))
        named += [
            (config.get("progress") or {}).get("target_field"),
            (config.get("page_when") or {}).get("field"),
        ]
        for field in filter(None, named):
            if field not in fields:
                errors.append(f"presentation: {name} refers to undeclared field '{field}'")
        for block in config.get("blocks", []) or []:
            if ("field" in block) == ("file" in block):
                errors.append(f"presentation: {name} block '{block.get('id')}' needs exactly one of `field` or `file`")
            if "file" in block and not config.get("items_from", "").endswith("/"):
                errors.append(
                    f"presentation: {name} block '{block.get('id')}' reads a file, but items are not directories"
                )
            if block.get("type") not in BLOCK_TYPES:
                errors.append(
                    f"presentation: {name} block '{block.get('field')}' has unknown type '{block.get('type')}'"
                )
        for relation in config.get("relations", []) or []:
            target = relation.get("target")
            if target and target not in presentation["collections"]:
                errors.append(
                    f"presentation: {name} relation '{relation['type']}' targets unknown collection '{target}'"
                )


def collection_model(name: str, config: dict) -> dict:
    model = {"id": name, "label": config["label"]}
    if config.get("ref_prefix"):
        model["ref_prefix"] = config["ref_prefix"]
    model["fields"] = config.get("fields") or {}
    for key in ("group_by", "facets", "list_fields", "page_when", "progress"):
        if config.get(key) is not None:
            model[key] = config[key]
    return model


def build():
    presentation = load_yaml(CONFIG)
    resources = load_resources()
    vocabularies = build_vocabularies(presentation.get("vocabularies") or {})
    check_config(presentation, vocabularies)
    collections = presentation["collections"]

    resolver = Resolver(collections)
    resolver.prefix = {name: config.get("ref_prefix", "") for name, config in collections.items()}

    # Pass 1: load every item so references can resolve across collections.
    loaded = {}
    for name, config in collections.items():
        loaded[name] = []
        for item_id, title, entry, source_path, derived in raw_items(name, config):
            label = f"{name}/{item_id}"
            page_content, page_path = load_page_source(config, entry, label)
            content = {**(page_content or {}), **entry} if page_content else entry
            loaded[name].append((str(item_id), title, content, page_path or source_path, derived, label))
            resolver.add(name, str(item_id), derived.get("path"))

    # Pass 2: fields, pages, relations.
    items, relations, used_resources = {}, set(), set()
    for name, config in collections.items():
        items[name] = []
        blocks_config = config.get("blocks", []) or []
        relations_config = config.get("relations", []) or []
        base_covered = list(config.get("ignore", []))
        base_covered += [k for k in (config.get("id"), config.get("title")) if k]
        base_covered += list((config.get("fields") or {}).keys())
        base_covered += template_keys(config.get("page_from"))
        base_covered += [r["field"] for r in relations_config]

        for item_id, title, content, source_path, derived, label in loaded[name]:
            fields = item_fields(name, config, content, derived, vocabularies, label)
            item = {"id": item_id, "title": en(title), "fields": fields}
            ref = resolver.ref_for(name, item_id)

            for relation in relations_config:
                for value in collect(content, relation["field"]):
                    values = value if isinstance(value, list) else [value]
                    for v in values:
                        v = str(v)
                        if "/" in v:
                            other = resolver.path_ref(v)
                            if other is None or (
                                relation.get("target") and resolver.collection_of(other) != relation["target"]
                            ):
                                continue
                        else:
                            other = resolver.ref(v, label)
                        pair = (other, ref) if relation.get("direction") == "in" else (ref, other)
                        relations.add((relation["type"], *pair))

            covered = list(base_covered)
            if page_matches(config, fields):
                ctx = Context(resources, resolver, label, source_path)
                blocks = []
                for spec in blocks_config:
                    handler = BLOCK_TYPES.get(spec["type"])
                    if "file" in spec:
                        file = ROOT / (source_path or "") / spec["file"]
                        value = file.read_text(encoding="utf-8") if file.is_file() else None
                    else:
                        value = get_path(content, spec["field"])
                    if handler is None or value is None:
                        continue
                    if spec["type"] in ("diagnostic", "practice", "runner", "form") and not isinstance(value, dict):
                        errors.append(f"{label}: field '{spec['field']}' must be a mapping for a {spec['type']} block")
                        continue
                    payload, consumed = handler(spec, value, content, ctx)
                    covered += consumed
                    if payload is None:
                        # The runner/form pair targets one shared field; only the matching runtime emits.
                        continue
                    blocks.append(
                        {
                            "type": spec["type"],
                            "id": spec.get("id") or slug(spec.get("field") or spec["file"]),
                            "title": spec["title"],
                            **({"step": True} if spec.get("step") else {}),
                            **payload,
                        }
                    )
                for path, values in sorted(unmapped(content, covered).items()):
                    warnings.append(f"{label}: field '{path}' is neither mapped nor ignored; rendered as a data block")
                    value = values if "[]" in path else values[0]
                    blocks.append({"type": "data", "id": slug(path), "title": en(path), "value": value})
                item["page"] = {"source_path": source_path, "blocks": blocks}
                used_resources |= ctx.used_resources
            items[name].append(item)
        if not config.get("items_from", "").count("#"):
            items[name].sort(key=lambda item: item["id"])

    return {
        "version": MODEL_VERSION,
        "site": presentation["site"],
        "locales": presentation["locales"],
        "vocabularies": vocabularies,
        "collections": [collection_model(name, config) for name, config in collections.items()],
        "items": items,
        "relations": [{"type": t, "from": f, "to": to} for t, f, to in sorted(relations)],
        "resources": {rid: resources[rid] for rid in sorted(used_resources)},
    }


def serialize(data) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if args.write == args.check:
        parser.error("choose exactly one of --write or --check")

    data = build()

    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    for error in Draft202012Validator(schema).iter_errors(data):
        location = ".".join(str(part) for part in error.path)
        errors.append(f"content model{' at ' + location if location else ''}: {error.message}")

    if not errors:
        expected = serialize(data)
        if args.write:
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT.write_text(expected, encoding="utf-8")
        elif not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            errors.append(f"{rel(OUTPUT)} is missing or stale")

    if warnings:
        print("Unmapped content (add a block to curriculum/presentation.yaml or list the field under `ignore`):")
        for warning in warnings:
            print(f"- {warning}")
        print()

    if errors:
        print("Site data build failed:\n")
        for error in errors:
            print(f"- {error}")
        print("\nRun: python scripts/build_site_data.py --write")
        sys.exit(1)

    if args.write:
        print(f"OK: wrote {rel(OUTPUT)}")
    else:
        print(f"OK: {rel(OUTPUT)} matches the content model")


if __name__ == "__main__":
    main()
