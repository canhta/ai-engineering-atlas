// Pyodide's npm package ships the runtime and the standard library, but no package wheels.
// A lab that declares `browser.packages` needs its wheels served from our own origin (COEP
// require-corp), so this fetches them into node_modules/pyodide/ before the build: the Astro
// integration copies them into dist/, and `pnpm run test:labs` finds them there too.
//
// Only packages Pyodide itself builds are available, and each wheel is checked against the
// sha256 in pyodide-lock.json, so a wrong or tampered download fails the build.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { access, constants } from "node:fs/promises";

const dir = new URL("../node_modules/pyodide/", import.meta.url);
const lock = JSON.parse(readFileSync(new URL("pyodide-lock.json", dir), "utf8"));
const version = JSON.parse(readFileSync(new URL("package.json", dir), "utf8")).version;
const atlas = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));

/** Every package any lab asks for, with what those packages depend on. */
function wanted() {
  const names = new Set();
  for (const items of Object.values(atlas.items)) {
    for (const item of items) {
      for (const block of item.page?.blocks ?? []) {
        if (block.type === "runner") for (const name of block.packages ?? []) names.add(name);
      }
    }
  }
  const out = new Map();
  const queue = [...names];
  while (queue.length) {
    const name = queue.shift();
    if (out.has(name)) continue;
    const entry = lock.packages[name];
    if (!entry) {
      console.error(`Pyodide ${version} has no package "${name}". Available packages are listed in pyodide-lock.json.`);
      process.exit(1);
    }
    out.set(name, entry);
    queue.push(...(entry.depends ?? []));
  }
  return out;
}

const packages = wanted();
if (packages.size === 0) {
  console.log("OK: no lab asks for a Pyodide package");
  process.exit(0);
}

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
let fetched = 0;

for (const [name, entry] of packages) {
  const target = new URL(entry.file_name, dir);
  try {
    await access(target, constants.R_OK);
    if (sha256(readFileSync(target)) === entry.sha256) continue;
  } catch {
    // Not there yet; fall through and download it.
  }
  const source = `https://cdn.jsdelivr.net/pyodide/v${version}/full/${entry.file_name}`;
  const response = await fetch(source);
  if (!response.ok) {
    console.error(`Could not download ${name} from ${source}: HTTP ${response.status}`);
    process.exit(1);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (sha256(buffer) !== entry.sha256) {
    console.error(`${entry.file_name} does not match the sha256 in pyodide-lock.json; refusing to use it.`);
    process.exit(1);
  }
  writeFileSync(target, buffer);
  fetched += 1;
}

const names = [...packages.keys()].join(", ");
console.log(`OK: ${packages.size} Pyodide package(s) ready (${names})${fetched ? `; downloaded ${fetched}` : ""}`);
