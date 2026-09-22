// Learner progress: state transitions backed by evidence (docs/LEARNING_MODEL.md, progress/README.md).
// Pure functions over the progress.yaml v2 shape (schemas/progress.schema.json); storage lives in
// progress-store.ts. A state changes only when an evidence item is recorded. Delayed-retrieval
// scheduling (when the next check is due) lives in review.ts; this file never imports ts-fsrs.
import { parse, stringify } from "yaml";
import type { FormAnswers } from "./lab-form";
import { review, type ReviewCard, type ReviewResult } from "./review.ts";

export const STATES = ["unassessed", "gap", "learning", "demonstrated", "transferred", "retained", "applied"] as const;
export const TARGET_STATES = ["demonstrated", "transferred", "retained", "applied"] as const;
export const EVIDENCE_STATES = ["gap", "learning", "demonstrated", "transferred", "retained", "applied"] as const;
export const INDEPENDENCE = ["independent", "minimal-hints", "guided", "reference-open", "unknown"] as const;
export const REVIEW_METHODS = [
  "self",
  "peer",
  "automated",
  "automated-and-self",
  "ai-assisted",
  "human-and-ai",
] as const;
export const EVIDENCE_KINDS = [
  "diagnostic",
  "explanation",
  "implementation",
  "debugging",
  "experiment",
  "decision",
  "transfer",
  "retrieval",
  "project",
] as const;

export type State = (typeof STATES)[number];
export type TargetState = (typeof TARGET_STATES)[number];
export type EvidenceState = (typeof EVIDENCE_STATES)[number];
export type Independence = (typeof INDEPENDENCE)[number];
export type ReviewMethod = (typeof REVIEW_METHODS)[number];

export interface Evidence {
  id: string;
  kind: string;
  supports_state: EvidenceState;
  recorded_at: string;
  uri?: string;
  note?: string;
  independence: Independence;
  review_method: ReviewMethod;
  /** For `kind: "retrieval"` only: the diagnostic result the learner reported (review.ts maps it to
   * an FSRS rating). Other evidence kinds never set this. */
  retrieval_result?: ReviewResult;
}

export interface HistoryEntry {
  state: State;
  recorded_at: string;
  reason: string;
  evidence_refs: string[];
}

export interface CompetencyProgress {
  current_state: State;
  target_state: TargetState;
  evidence: Evidence[];
  state_history: HistoryEntry[];
  next_action: string;
  /** Calendar date the next delayed-retrieval check is due (review.ts); the review queue's key field. */
  review_on?: string;
  /** FSRS card state (review.ts); absent for a competency that has never reached a reviewed state, and
   * for a `progress.yaml` written before FSRS — read as a fresh card, seeded on the next evidence. */
  review?: ReviewCard;
}

export interface Progress {
  version: 2;
  updated_at: string;
  competencies: Record<string, CompetencyProgress>;
  /** Decision-lab draft answers, keyed by lab ref, so they travel with export/import. Optional: the
   *  schema's root `additionalProperties: true` accepts it without a dedicated schema change. */
  lab_forms?: Record<string, FormAnswers>;
}

export type EvidenceInput = Omit<Evidence, "id" | "recorded_at">;

const REVIEWED_STATES: readonly State[] = ["demonstrated", "transferred", "retained", "applied"];

export const emptyProgress = (today: string): Progress => ({ version: 2, updated_at: today, competencies: {} });

export const stateOf = (progress: Progress | null, id: string): State =>
  progress?.competencies[id]?.current_state ?? "unassessed";

export const rank = (state: State) => STATES.indexOf(state);

/** Demonstrated or beyond: the only states a path summary counts (DESIGN.md → Progress). */
export const isDemonstrated = (state: State) => rank(state) >= rank("demonstrated");

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const today = () => new Date().toISOString().slice(0, 10);

function nextActionFor(state: State): string {
  switch (state) {
    case "gap":
      return "Work through the learning route, then the practice.";
    case "learning":
      return "Finish the practice and produce the exit evidence.";
    case "demonstrated":
      return "Run a delayed retrieval check without reopening the sources, or attempt the transfer task.";
    case "transferred":
    case "retained":
      return "Apply the capability in an integrated project.";
    default:
      return "Keep the evidence current; re-check after the review date.";
  }
}

/** The state a delayed-retrieval check supports, from the competency's state before the check
 * (docs/LEARNING_MODEL.md: "retained" means the capability was retrieved successfully after a delay).
 * A pass moves a demonstrated or transferred competency to retained; retained or applied stays as is.
 * Anything short of "meets" drops the competency back to learning, same as a first diagnostic miss. */
export function retrievalOutcome(previous: State, result: ReviewResult): EvidenceState {
  if (result !== "meets") return "learning";
  return rank(previous) < rank("retained") ? "retained" : (previous as EvidenceState);
}

/**
 * Record one evidence item and move the competency to the state it supports.
 * States may move backward (a failed retrieval check can return a competency to learning).
 */
export function recordEvidence(
  progress: Progress,
  id: string,
  input: EvidenceInput,
  target: TargetState,
  date: string,
): Progress {
  const previous: CompetencyProgress = progress.competencies[id] ?? {
    current_state: "unassessed",
    target_state: target,
    evidence: [],
    state_history: [],
    next_action: nextActionFor("unassessed"),
  };
  const serial = previous.evidence.filter((e) => e.recorded_at === date && e.kind === input.kind).length + 1;
  const evidence: Evidence = {
    id: `${input.kind}-${date.replaceAll("-", "")}-${serial}`,
    recorded_at: date,
    ...input,
  };
  const entry: CompetencyProgress = {
    ...previous,
    evidence: [...previous.evidence, evidence],
  };
  const state = input.supports_state;
  entry.current_state = state;
  entry.state_history = [
    ...previous.state_history,
    {
      state,
      recorded_at: date,
      reason: input.note?.trim() || `${input.kind} evidence recorded`,
      evidence_refs: [evidence.id],
    },
  ];
  entry.next_action = nextActionFor(state);

  // Delayed-retrieval scheduling (review.ts, the only module that imports ts-fsrs). FSRS only decides
  // *when* to check next; it never moves `current_state`, set above from the reported evidence alone.
  const asOf = new Date(`${date}T00:00:00Z`);
  if (input.kind === "retrieval" && input.retrieval_result) {
    // A reported retrieval result — pass or fail — always reviews the card, seeding one from this
    // evidence when there was none yet (a pre-FSRS `progress.yaml` has `review_on` but no card).
    const { card, dueDate } = review(previous.review, input.retrieval_result, asOf);
    entry.review = card;
    entry.review_on = dueDate;
  } else if (REVIEWED_STATES.includes(state) && !previous.review) {
    // First time this competency reaches a reviewed state: the evidence that proved it is itself
    // the first successful check, so seed the card from it rather than leaving review_on unset.
    const { card, dueDate } = review(undefined, "meets", asOf);
    entry.review = card;
    entry.review_on = dueDate;
  } else if (!REVIEWED_STATES.includes(state)) {
    // Not a reviewed state (e.g. a fresh diagnostic gap): nothing due, but keep any existing card so a
    // later return to a reviewed state resumes the same schedule instead of restarting it.
    delete entry.review_on;
  }
  // else: a reviewed state reaffirmed by non-retrieval evidence with an existing card — the schedule
  // that card already produced (copied from `previous` above) is left alone.

  return { ...progress, updated_at: date, competencies: { ...progress.competencies, [id]: entry } };
}

export function setTarget(progress: Progress, id: string, target: TargetState, date: string): Progress {
  const entry = progress.competencies[id];
  if (!entry) return progress;
  return {
    ...progress,
    updated_at: date,
    competencies: { ...progress.competencies, [id]: { ...entry, target_state: target } },
  };
}

export interface ReviewQueue {
  due: string[];
  upcoming: string[];
}

export function reviewQueue(progress: Progress | null, date: string, horizonDays = 7): ReviewQueue {
  const horizon = addDays(date, horizonDays);
  const entries = Object.entries(progress?.competencies ?? {}).filter(([, c]) => c.review_on);
  return {
    due: entries.filter(([, c]) => c.review_on! <= date).map(([id]) => id),
    upcoming: entries.filter(([, c]) => c.review_on! > date && c.review_on! <= horizon).map(([id]) => id),
  };
}

export const toYaml = (progress: Progress) => stringify(progress, { lineWidth: 0 });

const isOneOf = <T extends readonly string[]>(list: T, value: unknown): value is T[number] =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/** Parse and validate an imported progress.yaml against the v2 schema's required fields and enums. */
export function fromYaml(text: string): { progress?: Progress; errors: string[] } {
  let data: unknown;
  try {
    data = parse(text);
  } catch (error) {
    return { errors: [`YAML parse error: ${(error as Error).message}`] };
  }
  const errors: string[] = [];
  const doc = data as Partial<Progress> | null;
  if (!doc || typeof doc !== "object") return { errors: ["not a YAML mapping"] };
  if (typeof doc.version !== "number" || doc.version < 2) errors.push("version must be 2 or higher");
  if (!doc.competencies || typeof doc.competencies !== "object") errors.push("competencies must be a mapping");

  for (const [id, c] of Object.entries(doc.competencies ?? {})) {
    const at = `competencies.${id}`;
    if (!isOneOf(STATES, c?.current_state)) errors.push(`${at}.current_state is not a known state`);
    if (!isOneOf(TARGET_STATES, c?.target_state)) errors.push(`${at}.target_state is not a target state`);
    if (!Array.isArray(c?.evidence)) errors.push(`${at}.evidence must be a list`);
    if (!Array.isArray(c?.state_history)) errors.push(`${at}.state_history must be a list`);
    if (typeof c?.next_action !== "string") errors.push(`${at}.next_action must be text`);
    for (const [i, e] of (Array.isArray(c?.evidence) ? c.evidence : []).entries()) {
      if (!e?.id || !e?.kind || !e?.recorded_at) errors.push(`${at}.evidence[${i}] needs id, kind, recorded_at`);
      if (!isOneOf(EVIDENCE_STATES, e?.supports_state)) errors.push(`${at}.evidence[${i}].supports_state is invalid`);
      if (!isOneOf(INDEPENDENCE, e?.independence)) errors.push(`${at}.evidence[${i}].independence is invalid`);
      if (!isOneOf(REVIEW_METHODS, e?.review_method)) errors.push(`${at}.evidence[${i}].review_method is invalid`);
    }
  }
  if (errors.length) return { errors };
  const recordedAt = (value: unknown) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
  return {
    progress: { ...(doc as Progress), version: 2, updated_at: recordedAt(doc.updated_at) },
    errors,
  };
}
