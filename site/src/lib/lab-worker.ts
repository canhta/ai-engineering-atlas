/// <reference lib="webworker" />
// Dedicated worker that owns one Pyodide instance (DESIGN.md → Labs). Pyodide is self-hosted
// under /pyodide/<version>/ (copied at build time by astro.config.mjs) and loaded on the first
// message. Runs are synchronous inside the worker; the page interrupts them through the shared
// interrupt buffer, or terminates the worker when a run outlives its time limit.
import { type LabRunRequest, type PyodideLike, runLab } from "./lab-run";

declare const __PYODIDE_BASE__: string;

export type WorkerRequest =
  | { type: "init"; interrupt?: SharedArrayBuffer }
  | { type: "run"; id: number; request: LabRunRequest; packages?: string[] };

export type WorkerResponse =
  | { type: "ready"; version: string }
  | { type: "failed"; message: string }
  | { type: "result"; id: number; result: ReturnType<typeof runLab> };

interface Pyodide extends PyodideLike {
  version: string;
  setInterruptBuffer(buffer: Uint8Array): void;
  loadPackage(names: string[]): Promise<unknown>;
}

const scope = self as unknown as DedicatedWorkerGlobalScope;
let pyodide: Pyodide | undefined;
let interrupt: Uint8Array | undefined;

scope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  const post = (response: WorkerResponse) => scope.postMessage(response);
  try {
    if (message.type === "init") {
      const module = (await import(/* @vite-ignore */ `${__PYODIDE_BASE__}pyodide.mjs`)) as {
        loadPyodide(options: { indexURL: string }): Promise<Pyodide>;
      };
      pyodide = await module.loadPyodide({ indexURL: __PYODIDE_BASE__ });
      if (message.interrupt) {
        interrupt = new Uint8Array(message.interrupt);
        pyodide.setInterruptBuffer(interrupt);
      }
      post({ type: "ready", version: pyodide.version });
      return;
    }
    if (!pyodide) throw new Error("Pyodide is not loaded");
    if (message.packages?.length) await pyodide.loadPackage(message.packages);
    if (interrupt) interrupt[0] = 0;
    post({ type: "result", id: message.id, result: runLab(pyodide, message.request) });
  } catch (error) {
    post({ type: "failed", message: error instanceof Error ? error.message : String(error) });
  }
};
