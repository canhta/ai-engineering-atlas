// One lab run under Pyodide: the equivalent of `python <run file>` in the lab directory
// (DESIGN.md → Labs, rfcs/0000-interactive-web-atlas.md → In-browser labs). Shared by the browser
// worker (lab-worker.ts) and the CI parity script (scripts/test-labs.mjs), so both classify a
// run the same way. Plain TypeScript without enums so Node can strip the types.

/** Everything the runner needs from a `runner` block, plus the learner's edited file. */
export interface LabRunRequest {
  /** Lab id; the files are written to /labs/<id>/ in Pyodide's file system. */
  lab: string;
  /** File name → text, as shipped in the block. */
  files: Record<string, string>;
  /** The file the learner edits; `code` replaces it for this run. */
  editable: string;
  code: string;
  /** The file run as `__main__`. */
  run: string;
}

export type LabVerdict = "pass" | "fail" | "error" | "stopped";

export interface LabFrame {
  file: string;
  line: number;
  name: string;
  code: string;
}

export interface LabRunResult {
  verdict: LabVerdict;
  stdout: string;
  stderr: string;
  /** Exception type and message (fail, error, stopped). */
  type?: string;
  message?: string;
  /** Innermost frame inside the lab directory: the failing assert (fail) or where the error was raised. */
  at?: LabFrame;
  /** Frames inside the lab directory, outermost first. */
  frames?: LabFrame[];
  /** Innermost frame in the editable file, when the traceback passes through it. */
  learner?: LabFrame;
}

/** Minimal surface of the Pyodide API that a run needs (browser and Node). */
export interface PyodideLike {
  FS: {
    mkdirTree(path: string): void;
    writeFile(path: string, data: string): void;
    readdir(path: string): string[];
    unlink(path: string): void;
    analyzePath(path: string): { exists: boolean };
  };
  globals: { get(name: string): unknown };
  runPython(code: string): unknown;
}

// Runs the file with runpy as __main__ from inside the lab directory, after dropping every module
// imported from that directory, so the learner's edits and the reference are re-imported each run.
const HARNESS = String.raw`
import io, json, linecache, os, runpy, sys, traceback, importlib

def _atlas_run_lab(workdir, run_file, editable):
    os.chdir(workdir)
    # Only this lab's directory is importable, and nothing imported from any lab survives a run.
    root = os.path.dirname(workdir.rstrip("/")) + "/"
    sys.path[:] = [workdir] + [p for p in sys.path if not p.startswith(root)]
    prefix = workdir.rstrip("/") + "/"
    for name, module in list(sys.modules.items()):
        path = getattr(module, "__file__", None) or ""
        if path.startswith(root):
            del sys.modules[name]
    linecache.clearcache()
    importlib.invalidate_caches()

    out, err = io.StringIO(), io.StringIO()
    saved = sys.stdout, sys.stderr, list(sys.argv)
    sys.stdout, sys.stderr, sys.argv = out, err, [run_file]
    result = {"verdict": "pass"}
    try:
        runpy.run_path(os.path.join(workdir, run_file), run_name="__main__")
    except SystemExit as exc:
        if exc.code not in (None, 0):
            result = _atlas_describe("error", exc, prefix, editable)
    except KeyboardInterrupt as exc:
        result = _atlas_describe("stopped", exc, prefix, editable)
    except AssertionError as exc:
        result = _atlas_describe("fail", exc, prefix, editable)
    except BaseException as exc:
        result = _atlas_describe("error", exc, prefix, editable)
    finally:
        sys.stdout, sys.stderr, sys.argv = saved
    result["stdout"] = out.getvalue()
    result["stderr"] = err.getvalue()
    return json.dumps(result)

def _atlas_describe(verdict, exc, prefix, editable):
    frames = []
    for frame in traceback.extract_tb(exc.__traceback__):
        if frame.filename.startswith(prefix):
            frames.append({
                "file": frame.filename[len(prefix):],
                "line": frame.lineno,
                "name": frame.name,
                "code": (frame.line or "").strip(),
            })
    result = {"verdict": verdict, "type": type(exc).__name__, "message": str(exc), "frames": frames}
    if frames:
        result["at"] = frames[-1]
    mine = [f for f in frames if f["file"] == editable]
    if mine:
        result["learner"] = mine[-1]
    return result
`;

/**
 * The editable file with the reference solution pasted at its end, the way a learner would paste
 * it: the reference's definitions replace the stubs. `from __future__` imports move to the top,
 * where Python requires them. The CI parity script checks that this passes for every lab.
 */
export function withReference(editable: string, reference: string): string {
  const future = /^from __future__ import .*$/gm;
  const imports = [...new Set([...editable.matchAll(future), ...reference.matchAll(future)].map((m) => m[0]))];
  const strip = (text: string) => text.replace(future, "").replace(/^\n+/, "");
  return [...imports, "", strip(editable).trimEnd(), "", "", strip(reference)].join("\n").replace(/^\n+/, "");
}

const installed = new WeakSet<object>();

/** Write the lab into /labs/<id>/, replace the editable file with the learner's code, and run. */
export function runLab(pyodide: PyodideLike, request: LabRunRequest): LabRunResult {
  if (!installed.has(pyodide)) {
    pyodide.runPython(HARNESS);
    installed.add(pyodide);
  }
  const dir = `/labs/${request.lab}`;
  if (pyodide.FS.analyzePath(dir).exists) {
    for (const name of pyodide.FS.readdir(dir)) if (name !== "." && name !== ".." && name !== "__pycache__") pyodide.FS.unlink(`${dir}/${name}`);
  } else {
    pyodide.FS.mkdirTree(dir);
  }
  for (const [name, text] of Object.entries({ ...request.files, [request.editable]: request.code })) {
    pyodide.FS.writeFile(`${dir}/${name}`, text);
  }
  const run = pyodide.globals.get("_atlas_run_lab") as ((dir: string, run: string, editable: string) => string) & {
    destroy?: () => void;
  };
  try {
    return JSON.parse(run(dir, request.run, request.editable)) as LabRunResult;
  } finally {
    run.destroy?.();
  }
}
