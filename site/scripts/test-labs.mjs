// CI parity for browser labs (DESIGN.md → Labs; web atlas RFC → Phase 1b exit criterion).
// For every `runner` block in src/data/atlas.json (labs with a `browser:` contract), using exactly
// the files the site ships:
//   (a) the editable file with the reference pasted in (withReference) passes under Pyodide and
//       under CPython;
//   (b) the unmodified editable file gives the same verdict under Pyodide as `python <run file>`
//       under CPython: the same class (pass, fail, error), and for fail or error the same file,
//       line, and exception type.
// CPython is computed here by spawning `python3` (PYTHON overrides it) in a temporary copy of the
// lab, so no expectation fixture is checked in. Run: pnpm run test:labs.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadPyodide } from "pyodide";
import { runLab, withReference } from "../src/lib/lab-run.ts";

const model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const python = process.env.PYTHON ?? "python3";

const labs = [];
for (const collection of model.collections) {
  const prefix = collection.ref_prefix ? `${collection.ref_prefix}:` : "";
  for (const item of model.items[collection.id] ?? []) {
    for (const block of item.page?.blocks ?? []) {
      if (block.type === "runner") labs.push({ ref: `${prefix}${item.id}`, id: item.id, block });
    }
  }
}
if (labs.length === 0) {
  console.error("No runner blocks in src/data/atlas.json; nothing to test.");
  process.exit(1);
}

/** Run `python <run>` in a temp copy of the lab with `code` as the editable file; classify like lab-run.ts. */
function cpython(block, code) {
  // Real path: tracebacks name /private/var/… on macOS, where tmpdir() is /var/….
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "atlas-lab-")));
  try {
    for (const [name, text] of Object.entries({ ...block.files, [block.editable]: code }))
      writeFileSync(join(dir, name), text);
    const result = spawnSync(python, ["-B", block.run], { cwd: dir, encoding: "utf8", timeout: 60_000 });
    if (result.error) throw result.error;
    if (result.status === 0) return { verdict: "pass" };
    const stderr = result.stderr;
    const frames = [...stderr.matchAll(/^ {2}File "(.+)", line (\d+), in (.+)$/gm)]
      .filter((m) => m[1].startsWith(dir))
      .map((m) => ({ file: m[1].slice(dir.length + 1), line: Number(m[2]) }));
    const last = stderr.trimEnd().split("\n").at(-1) ?? "";
    const type =
      last
        .match(/^([\w.]+)(:|$)/)?.[1]
        ?.split(".")
        .at(-1) ?? "unknown";
    return { verdict: type === "AssertionError" ? "fail" : "error", type, at: frames.at(-1), stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const summary = (r) =>
  r.verdict === "pass" ? "pass" : `${r.verdict} ${r.type} at ${r.at ? `${r.at.file}:${r.at.line}` : "?"}`;

const pyodide = await loadPyodide();
const failures = [];
for (const { ref, id, block } of labs) {
  // A lab may ask for packages Pyodide builds; their wheels sit beside the runtime
  // (scripts/fetch-pyodide-wheels.mjs), so this loads them from disk, not from a CDN.
  if (block.packages?.length) await pyodide.loadPackage(block.packages);
  const starter = block.files[block.editable];
  const solved = withReference(starter, block.files[block.reference]);
  const request = (code) => ({ lab: id, files: block.files, editable: block.editable, code, run: block.run });

  // (a) reference applied: passes in both runtimes.
  const refPyodide = runLab(pyodide, request(solved));
  const refCpython = cpython(block, solved);
  for (const [runtime, result] of [
    ["Pyodide", refPyodide],
    ["CPython", refCpython],
  ]) {
    if (result.verdict !== "pass")
      failures.push(
        `${ref}: reference fails under ${runtime}: ${summary(result)}\n${result.stderr ?? JSON.stringify(result)}`,
      );
  }

  // (b) unmodified starter: same verdict in both runtimes.
  const got = runLab(pyodide, request(starter));
  const want = cpython(block, starter);
  const same =
    got.verdict === want.verdict &&
    (want.verdict === "pass" ||
      (got.type === want.type && got.at?.file === want.at?.file && got.at?.line === want.at?.line));
  if (!same)
    failures.push(
      `${ref}: starter under Pyodide is "${summary(got)}", CPython "python ${block.run}" is "${summary(want)}"`,
    );

  console.log(
    `${same && refPyodide.verdict === "pass" && refCpython.verdict === "pass" ? "ok  " : "FAIL"} ${ref}: reference passes; starter ${summary(got)} (CPython: ${summary(want)})`,
  );
}

if (failures.length) {
  console.error(`\nLab parity failed:\n${failures.map((f) => `- ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`OK: ${labs.length} browser labs match CPython under Pyodide ${pyodide.version}`);
