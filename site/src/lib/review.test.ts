// review.ts: the FSRS rating mapping and card scheduling (docs/LEARNING_MODEL.md → delayed
// retrieval; rfcs/0000-interactive-web-atlas.md → Phase 2). progress.test.ts covers the integration
// with recordEvidence and the review queue; this file tests review.ts in isolation.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Rating } from "ts-fsrs";
import { ratingFor, review } from "./review.ts";

const NOW = new Date("2026-09-22T00:00:00Z");

test("the diagnostic result maps to an FSRS rating: meets -> Good, partial -> Hard, notYet -> Again", () => {
  assert.equal(ratingFor("meets"), Rating.Good);
  assert.equal(ratingFor("partial"), Rating.Hard);
  assert.equal(ratingFor("notYet"), Rating.Again);
});

test("reviewing is deterministic: the same card, result, and date give the same outcome", () => {
  const a = review(undefined, "meets", NOW);
  const b = review(undefined, "meets", NOW);
  assert.deepEqual(a, b);

  const seeded = review(undefined, "meets", NOW).card;
  const later = new Date("2026-09-25T00:00:00Z");
  const c = review(seeded, "partial", later);
  const d = review(seeded, "partial", later);
  assert.deepEqual(c, d);
});

test("a worse reported result schedules a sooner next check, from the same card and date", () => {
  const meets = review(undefined, "meets", NOW);
  const partial = review(undefined, "partial", NOW);
  const notYet = review(undefined, "notYet", NOW);
  assert.ok(notYet.dueDate < partial.dueDate, `${notYet.dueDate} should be before ${partial.dueDate}`);
  assert.ok(partial.dueDate < meets.dueDate, `${partial.dueDate} should be before ${meets.dueDate}`);
});

test("a failed retrieval after a passing one shortens the next date and records a lapse", () => {
  const seeded = review(undefined, "meets", NOW);
  const passedAgain = review(seeded.card, "meets", new Date(`${seeded.dueDate}T00:00:00Z`));
  const failed = review(seeded.card, "notYet", new Date(`${seeded.dueDate}T00:00:00Z`));
  assert.ok(failed.dueDate < passedAgain.dueDate, "a failed check should schedule sooner than a passed one");
  assert.equal(failed.card.lapses, 1);
  assert.equal(passedAgain.card.lapses, 0);
});

test("undefined card is treated as a fresh one, including for a pre-FSRS progress.yaml with no card", () => {
  const seeded = review(undefined, "meets", NOW);
  assert.equal(seeded.card.reps, 1);
  assert.equal(seeded.card.lapses, 0);
  assert.equal(seeded.dueDate, seeded.card.due.slice(0, 10));
});
