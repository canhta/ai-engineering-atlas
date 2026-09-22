// The site renders the content model only (DESIGN.md → Principles 4, rfcs/0000-content-model.md).
// Fails when a curriculum field name appears in site/src outside src/data/.
//
// Forbidden names come from the content side: every `field:` path segment, field key, and
// payload-mapping source key (map/row/item/bridge/support) in curriculum/presentation.yaml,
// and every property name in schemas/competency.schema.json. Names the site owns through its
// own contracts are allowed: content-model keys and block types (schemas/site-data.schema.json)
// and learner-progress keys and values (schemas/progress.schema.json).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

const site = new URL("..", import.meta.url).pathname;
const repo = join(site, "..");
const readJson = (path) => JSON.parse(readFileSync(join(repo, path), "utf8"));

// Payload keys of content-model blocks that happen to share a name with a content key.
const PAYLOAD_KEYS = ["tasks", "pass_condition", "items", "rows", "locator", "purpose", "resource", "body", "title", "id", "type", "step", "fields", "ref", "path"];
// Words the site's own learner-evidence vocabulary uses (progress.yaml evidence kinds, LEARNING_MODEL.md).
const EVIDENCE_KINDS = ["transfer"];

function schemaNames(schema, { values = false } = {}) {
  const names = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    if (node.properties && typeof node.properties === "object") Object.keys(node.properties).forEach((k) => names.add(k));
    if (values) {
      for (const value of node.enum ?? []) if (typeof value === "string") names.add(value);
      if (typeof node.const === "string") names.add(node.const);
    }
    Object.values(node).forEach(walk);
  };
  walk(schema);
  return names;
}

function presentationNames(config) {
  const names = new Set();
  const addPath = (path) => String(path).split(/[.\[\]]+/).filter(Boolean).forEach((s) => names.add(s));
  const mappingSources = (mapping) => Object.values(mapping ?? {}).forEach(addPath);
  for (const c of Object.values(config.collections ?? {})) {
    Object.keys(c.fields ?? {}).forEach((k) => names.add(k));
    for (const r of c.relations ?? []) addPath(r.field);
    for (const b of c.blocks ?? []) {
      if (b.field) addPath(b.field);
      if (b.support) addPath(b.support);
      for (const key of ["map", "row", "item", "bridge"]) mappingSources(b[key]);
      for (const g of b.groups ?? []) if (g.field) addPath(g.field);
    }
    for (const k of c.ignore ?? []) names.add(k);
  }
  return names;
}

const forbidden = new Set([
  ...presentationNames(parse(readFileSync(join(repo, "curriculum/presentation.yaml"), "utf8"))),
  ...schemaNames(readJson("schemas/competency.schema.json")),
]);
const allowed = new Set([
  ...PAYLOAD_KEYS,
  ...EVIDENCE_KINDS,
  ...schemaNames(readJson("schemas/site-data.schema.json"), { values: true }),
  ...schemaNames(readJson("schemas/progress.schema.json"), { values: true }),
]);
for (const name of allowed) forbidden.delete(name);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const stripComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");

const errors = [];
const check = (rel, word, where) => {
  if (forbidden.has(word)) errors.push(`${rel}: "${word}" (${where}) is a curriculum field name; render it from the content model`);
};

for (const path of walk(join(site, "src"))) {
  const rel = relative(site, path);
  if (rel.startsWith("src/data/")) continue;
  if (!/\.(astro|tsx?|jsx?|mjs|css|json)$/.test(rel)) continue;
  const raw = readFileSync(path, "utf8");

  if (rel.endsWith(".json")) {
    // UI dictionaries: keys are interface chrome; values are prose.
    for (const key of Object.keys(JSON.parse(raw))) for (const part of key.split(/[.\-]/)) check(rel, part, `key ${key}`);
    continue;
  }

  // ARIA role values are HTML vocabulary, not content.
  let code = stripComments(raw).replace(/\brole=["'][\w-]+["']/g, " ");
  // String literals that look like identifiers or paths ("why", "a.b[].c") are checked per segment;
  // prose strings are skipped.
  code = code.replace(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g, (_, _q, body) => {
    if (/^[\w.\[\]]+$/.test(body)) for (const part of body.split(/[.\[\]]+/)) check(rel, part, `string "${body}"`);
    return " ";
  });
  for (const [word] of code.matchAll(/[A-Za-z_][\w]*/g)) check(rel, word, "identifier");
}

if (errors.length) {
  console.error("Content coupling check failed:\n");
  for (const e of [...new Set(errors)]) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`OK: no curriculum field names in site/src (${forbidden.size} names checked)`);
