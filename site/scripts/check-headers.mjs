// Pyodide needs cross-origin isolation to interrupt running code (site/AGENTS.md).
import { readFileSync } from "node:fs";

const text = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
const block = text.split(/\n(?=\S)/).find((b) => b.startsWith("/*\n")) ?? "";
const required = ["Cross-Origin-Opener-Policy: same-origin", "Cross-Origin-Embedder-Policy: require-corp"];
const missing = required.filter((h) => !block.split("\n").some((line) => line.trim() === h));

if (missing.length) {
  console.error("Header check failed: public/_headers /* block is missing:\n");
  for (const h of missing) console.error(`- ${h}`);
  process.exit(1);
}
console.log("OK: public/_headers sets cross-origin isolation for every path");
