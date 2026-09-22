// Delayed-retrieval scheduling (rfcs/0000-interactive-web-atlas.md → Phase 2: "Delayed review queue
// using ts-fsrs, driven by review_on, with prompts taken from existing diagnostic tasks only";
// docs/LEARNING_MODEL.md → "retained: capability was retrieved successfully after a delay"). This is
// the only module that imports ts-fsrs; progress.ts calls the functions below instead. FSRS decides
// *when* to check next — it never promotes or demotes a learner state; recordEvidence in progress.ts
// still does that from the reported result, exactly as for any other evidence.
//
// Pure and deterministic: `now` is always supplied by the caller. Nothing here calls `new Date()`.
import { type Card, type Grade, Rating, createEmptyCard, fsrs, generatorParameters } from "ts-fsrs";

/** The diagnostic result the learner already reports (Diagnostic.tsx), reused for a review check. */
export type ReviewResult = "meets" | "partial" | "notYet";

/** FSRS card state for one competency, stored under progress.yaml's `review` key. Field names and
 * grain follow ts-fsrs's `Card` (dates as ISO strings, `state` as its lower-case name). */
export interface ReviewCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
  last_review?: string;
}

// enable_fuzz stays off (determinism) and enable_short_term stays off: review_on is a calendar date
// (docs/LEARNING_MODEL.md's "roughly one day / one week / one month" cadence), not a same-day, minute
// -level learning step.
const scheduler = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: false }));

const STATE_NAMES = ["new", "learning", "review", "relearning"] as const;

/** Maps the diagnostic result the learner already reports to an FSRS rating. Meets → Good, partial →
 * Hard, not yet → Again. An "easy" path only applies if the UI ever offers one, which it does not. */
export function ratingFor(result: ReviewResult): Grade {
  switch (result) {
    case "meets":
      return Rating.Good;
    case "partial":
      return Rating.Hard;
    case "notYet":
      return Rating.Again;
  }
}

function toCard(card: ReviewCard | undefined, now: Date): Card {
  if (!card) return createEmptyCard(now);
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_NAMES.indexOf(card.state),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}

function fromCard(card: Card): ReviewCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_NAMES[card.state],
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

export interface ReviewOutcome {
  card: ReviewCard;
  /** Calendar date (UTC, `YYYY-MM-DD`) the next check is due, for `review_on` and the review queue. */
  dueDate: string;
}

/**
 * Review one card with a reported result and return the updated card plus its next due date.
 * `card` is undefined the first time a competency is reviewed — including a `progress.yaml` written
 * before FSRS, which has `review_on` but no card: it is seeded fresh here, from this evidence, with
 * no separate migration path.
 */
export function review(card: ReviewCard | undefined, result: ReviewResult, now: Date): ReviewOutcome {
  const { card: updated } = scheduler.next(toCard(card, now), now, ratingFor(result));
  const next = fromCard(updated);
  return { card: next, dueDate: next.due.slice(0, 10) };
}
