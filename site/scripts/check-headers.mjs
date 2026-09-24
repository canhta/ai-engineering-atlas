// Pyodide needs cross-origin isolation to interrupt running code (site/AGENTS.md), and
// `_headers` applies only to static assets, never to a Worker response. So every page must be
// served as an asset: the Worker runs first for /api/* and nothing else.
import { readFileSync } from "node:fs";

const errors = [];

const text = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
const block = text.split(/\n(?=\S)/).find((b) => b.startsWith("/*\n")) ?? "";
const required = ["Cross-Origin-Opener-Policy: same-origin", "Cross-Origin-Embedder-Policy: require-corp"];
for (const h of required) {
  if (!block.split("\n").some((line) => line.trim() === h)) errors.push(`public/_headers /* block is missing: ${h}`);
}

// wrangler.jsonc is JSON with comments and trailing commas; strip both (no string holds "//").
const jsonc = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/,(\s*[}\]])/g, "$1");
const first = JSON.parse(jsonc).assets?.run_worker_first;
if (JSON.stringify(first) !== JSON.stringify(["/api/*"])) {
  errors.push(`wrangler.jsonc assets.run_worker_first must be ["/api/*"], found ${JSON.stringify(first)}`);
}

if (errors.length) {
  console.error("Header check failed:\n");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log("OK: public/_headers sets cross-origin isolation, and only /api/* runs the Worker first");
