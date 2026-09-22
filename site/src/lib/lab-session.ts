// Page side of a browser lab: starts the Pyodide worker on demand, runs the tests, and stops
// runaway code (DESIGN.md → Labs). Stop sets the shared interrupt buffer (Python raises
// KeyboardInterrupt); if the run does not end soon after, or the wall-clock limit passes, the
// worker is terminated and the next run starts a fresh one.
import type { LabRunRequest, LabRunResult } from "./lab-run";
import type { WorkerRequest, WorkerResponse } from "./lab-worker";

export type LabOutcome = (LabRunResult | { verdict: "timeout" }) & { ms: number };

/** Wall-clock limit for one run, excluding the runtime download. */
export const RUN_LIMIT_MS = 20_000;
/** How long an interrupted run may take to unwind before the worker is terminated. */
const STOP_GRACE_MS = 2_000;
const SIGINT = 2;

export class LabSession {
  private worker: Worker | undefined;
  private ready: Promise<string> | undefined;
  private interrupt: Uint8Array | undefined;
  private pending: { id: number; resolve: (outcome: LabOutcome) => void; started: number; timers: number[] } | undefined;
  private nextId = 1;

  /** Pyodide version once loaded. */
  version: string | undefined;

  /** Start the worker and load Pyodide; resolves with the Pyodide version. Safe to call repeatedly. */
  warm(): Promise<string> {
    if (this.ready) return this.ready;
    const worker = new Worker(new URL("./lab-worker.ts", import.meta.url), { type: "module", name: "lab" });
    const shared = globalThis.crossOriginIsolated ? new SharedArrayBuffer(1) : undefined;
    this.interrupt = shared ? new Uint8Array(shared) : undefined;
    this.worker = worker;
    this.ready = new Promise<string>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === "ready") {
          this.version = message.version;
          resolve(message.version);
        } else if (message.type === "result") {
          this.settle(message.id, { ...message.result, ms: 0 });
        } else if (this.pending) {
          this.settle(this.pending.id, { verdict: "error", type: "RuntimeError", message: message.message, stdout: "", stderr: "", ms: 0 });
        } else {
          this.reset();
          reject(new Error(message.message));
        }
      };
      worker.onerror = (event) => {
        event.preventDefault();
        this.reset();
        reject(new Error(event.message || "The lab runtime failed to start"));
      };
    });
    worker.postMessage({ type: "init", interrupt: shared } satisfies WorkerRequest);
    return this.ready;
  }

  get running() {
    return this.pending !== undefined;
  }

  async run(request: LabRunRequest, packages?: string[]): Promise<LabOutcome> {
    if (this.pending) throw new Error("A run is already in progress");
    await this.warm();
    const id = this.nextId++;
    if (this.interrupt) this.interrupt[0] = 0;
    return new Promise<LabOutcome>((resolve) => {
      const timeout = window.setTimeout(() => this.kill(id, { verdict: "timeout", ms: RUN_LIMIT_MS }), RUN_LIMIT_MS);
      this.pending = { id, resolve, started: performance.now(), timers: [timeout] };
      this.worker!.postMessage({ type: "run", id, request, packages } satisfies WorkerRequest);
    });
  }

  /** Interrupt the current run; terminate the worker if it does not stop in time. */
  stop() {
    const pending = this.pending;
    if (!pending) return;
    const stopped: LabOutcome = { verdict: "stopped", type: "KeyboardInterrupt", message: "", stdout: "", stderr: "", ms: 0 };
    if (!this.interrupt) {
      this.kill(pending.id, stopped);
      return;
    }
    this.interrupt[0] = SIGINT;
    pending.timers.push(window.setTimeout(() => this.kill(pending.id, stopped), STOP_GRACE_MS));
  }

  dispose() {
    this.pending?.timers.forEach((t) => window.clearTimeout(t));
    this.pending = undefined;
    this.reset();
  }

  private settle(id: number, outcome: LabOutcome) {
    const pending = this.pending;
    if (!pending || pending.id !== id) return;
    pending.timers.forEach((t) => window.clearTimeout(t));
    this.pending = undefined;
    pending.resolve({ ...outcome, ms: outcome.ms || Math.round(performance.now() - pending.started) });
  }

  private kill(id: number, outcome: LabOutcome) {
    this.reset();
    this.settle(id, outcome);
  }

  private reset() {
    this.worker?.terminate();
    this.worker = undefined;
    this.ready = undefined;
    this.version = undefined;
  }
}
