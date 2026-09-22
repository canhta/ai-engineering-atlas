// Browser storage for learner progress and personal marks. Local-first: nothing leaves the
// browser except through export. Storage can be unavailable (private mode), so every access is guarded.
import { useCallback, useSyncExternalStore } from "react";
import { emptyProgress, today, type Progress } from "./progress";

const PROGRESS_KEY = "atlas.progress.v2";
const OPENED_KEY = "atlas.opened.v1";
const DRAFT_PREFIX = "atlas.draft.v1.";

type Listener = () => void;
const listeners = new Set<Listener>();
const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    // Storage blocked or corrupt: fall back without breaking the page.
  }
  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory value; the page still works for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("atlas.")) {
      cache.delete(event.key);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Progress, or null during server render and before hydration (render no learner state then). */
export function useProgress(): [Progress | null, (next: Progress) => void] {
  const progress = useSyncExternalStore(
    subscribe,
    () => read<Progress>(PROGRESS_KEY, emptyProgress(today())),
    () => null,
  );
  const save = useCallback((next: Progress) => write(PROGRESS_KEY, next), []);
  return [progress, save];
}

/** Personal "opened" checklist for sources. Not progress: it never changes a learner state. */
export function useOpened(): [Record<string, boolean> | null, (key: string, value: boolean) => void] {
  const opened = useSyncExternalStore(
    subscribe,
    () => read<Record<string, boolean>>(OPENED_KEY, {}),
    () => null,
  );
  const set = useCallback((key: string, value: boolean) => {
    write(OPENED_KEY, { ...read<Record<string, boolean>>(OPENED_KEY, {}), [key]: value });
  }, []);
  return [opened, set];
}

/** Unsent diagnostic answers, kept per route so a reload does not lose them. */
export function useDraft(routeId: string): [string[] | null, (answers: string[]) => void] {
  const key = DRAFT_PREFIX + routeId;
  const draft = useSyncExternalStore(
    subscribe,
    () => read<string[]>(key, []),
    () => null,
  );
  const save = useCallback((answers: string[]) => write(key, answers), [key]);
  return [draft, save];
}

let storageProbe: boolean | undefined;
function storageWorks(): boolean {
  if (storageProbe === undefined) {
    try {
      window.localStorage.setItem("atlas.probe", "1");
      window.localStorage.removeItem("atlas.probe");
      storageProbe = true;
    } catch {
      storageProbe = false;
    }
  }
  return storageProbe;
}

/** Whether browser storage works; null during server render. When false, progress lasts for this page only. */
export function useStorageAvailable(): boolean | null {
  return useSyncExternalStore(subscribe, storageWorks, () => null);
}
