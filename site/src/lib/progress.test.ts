import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { parse } from "yaml";
import {
  addDays,
  type EvidenceInput,
  emptyProgress,
  fromYaml,
  type Progress,
  recordEvidence,
  retrievalOutcome,
  reviewQueue,
  stateOf,
  toYaml,
} from "./progress.ts";
import { review } from "./review.ts";

const DAY = "2026-09-22";
const schema = JSON.parse(readFileSync(new URL("../../../schemas/progress.schema.json", import.meta.url), "utf8"));
const validate = new Ajv2020({ strict: false }).compile(schema);

const evidence = (over: Partial<EvidenceInput>): EvidenceInput => ({
  kind: "diagnostic",
  supports_state: "gap",
  independence: "independent",
  review_method: "self",
  note: "Diagnostic task 2 missed.",
  ...over,
});

test("a competency with no evidence is unassessed", () => {
  assert.equal(stateOf(emptyProgress(DAY), "ai.tool-calling"), "unassessed");
  assert.equal(stateOf(null, "ai.tool-calling"), "unassessed");
});

test("recording evidence moves the state and links history to the evidence", () => {
  const p = recordEvidence(emptyProgress(DAY), "ai.tool-calling", evidence({}), "applied", DAY);
  const c = p.competencies["ai.tool-calling"];
  assert.equal(c.current_state, "gap");
  assert.equal(c.state_history.length, 1);
  assert.deepEqual(c.state_history[0].evidence_refs, [c.evidence[0].id]);
  assert.equal(c.review_on, undefined);
});

test("demonstrated seeds an FSRS card from the exit evidence and schedules the first review", () => {
  const p = recordEvidence(
    emptyProgress(DAY),
    "x",
    evidence({ kind: "implementation", supports_state: "demonstrated" }),
    "retained",
    DAY,
  );
  const expected = review(undefined, "meets", new Date(`${DAY}T00:00:00Z`));
  assert.deepEqual(p.competencies.x.review, expected.card);
  assert.equal(p.competencies.x.review_on, expected.dueDate);
});

test("retrievalOutcome: a pass promotes demonstrated/transferred to retained; anything else is learning", () => {
  assert.equal(retrievalOutcome("demonstrated", "meets"), "retained");
  assert.equal(retrievalOutcome("transferred", "meets"), "retained");
  assert.equal(retrievalOutcome("retained", "meets"), "retained");
  assert.equal(retrievalOutcome("applied", "meets"), "applied");
  assert.equal(retrievalOutcome("demonstrated", "partial"), "learning");
  assert.equal(retrievalOutcome("retained", "notYet"), "learning");
});

test("a passing retrieval check lengthens the next review; a failing one shortens it, without clearing the card", () => {
  const p = recordEvidence(
    emptyProgress(DAY),
    "x",
    evidence({ kind: "implementation", supports_state: "demonstrated" }),
    "retained",
    DAY,
  );
  const firstDue = p.competencies.x.review_on!;

  const passed = recordEvidence(
    p,
    "x",
    evidence({ kind: "retrieval", supports_state: "retained", retrieval_result: "meets" }),
    "retained",
    firstDue,
  );
  assert.equal(passed.competencies.x.current_state, "retained");
  assert.ok(passed.competencies.x.review_on! > firstDue, "a passed check should push the review further out");

  const failed = recordEvidence(
    p,
    "x",
    evidence({ kind: "retrieval", supports_state: "learning", retrieval_result: "notYet" }),
    "retained",
    firstDue,
  );
  assert.equal(failed.competencies.x.current_state, "learning");
  assert.ok(failed.competencies.x.review_on, "a failed check still schedules a next date, just a sooner one");
  assert.ok(
    failed.competencies.x.review_on! < passed.competencies.x.review_on!,
    "a failed check should shorten the next date relative to a passed one",
  );
  assert.equal(failed.competencies.x.review!.lapses, 1, "the FSRS card is kept and records the lapse");
});

test("evidence ids are unique within a day", () => {
  let p = recordEvidence(emptyProgress(DAY), "x", evidence({}), "demonstrated", DAY);
  p = recordEvidence(p, "x", evidence({}), "demonstrated", DAY);
  const ids = p.competencies.x.evidence.map((e) => e.id);
  assert.equal(new Set(ids).size, 2);
});

test("review queue boundaries: overdue and due-today both count as due; due-tomorrow is upcoming", () => {
  const p: Progress = {
    version: 2,
    updated_at: DAY,
    competencies: {
      overdue: {
        current_state: "demonstrated",
        target_state: "retained",
        evidence: [],
        state_history: [],
        next_action: "",
        review_on: addDays(DAY, -3),
      },
      today: {
        current_state: "demonstrated",
        target_state: "retained",
        evidence: [],
        state_history: [],
        next_action: "",
        review_on: DAY,
      },
      tomorrow: {
        current_state: "demonstrated",
        target_state: "retained",
        evidence: [],
        state_history: [],
        next_action: "",
        review_on: addDays(DAY, 1),
      },
      afterHorizon: {
        current_state: "demonstrated",
        target_state: "retained",
        evidence: [],
        state_history: [],
        next_action: "",
        review_on: addDays(DAY, 30),
      },
      none: { current_state: "gap", target_state: "demonstrated", evidence: [], state_history: [], next_action: "" },
    },
  };
  const q = reviewQueue(p, DAY);
  assert.deepEqual(new Set(q.due), new Set(["overdue", "today"]));
  assert.deepEqual(q.upcoming, ["tomorrow"]);
});

test("a pre-FSRS progress.yaml (review_on, no card) stays schema-valid and is seeded on the next evidence", () => {
  const legacy: Progress = {
    version: 2,
    updated_at: DAY,
    competencies: {
      x: {
        current_state: "demonstrated",
        target_state: "retained",
        evidence: [],
        state_history: [
          { state: "demonstrated", recorded_at: DAY, reason: "Exit evidence satisfied.", evidence_refs: [] },
        ],
        next_action: "Run delayed retrieval check without reopening the source.",
        review_on: addDays(DAY, 7), // written by the old fixed-interval scheduler; no `review` card
      },
    },
  };
  assert.ok(validate(parse(toYaml(legacy))), JSON.stringify(validate.errors));

  const reviewedAt = addDays(DAY, 10);
  const updated = recordEvidence(
    legacy,
    "x",
    evidence({ kind: "retrieval", supports_state: "retained", retrieval_result: "meets" }),
    "retained",
    reviewedAt,
  );
  const expected = review(undefined, "meets", new Date(`${reviewedAt}T00:00:00Z`));
  assert.deepEqual(updated.competencies.x.review, expected.card);
  assert.equal(updated.competencies.x.review_on, expected.dueDate);
});

test("exported YAML validates against schemas/progress.schema.json and round-trips", () => {
  let p = recordEvidence(emptyProgress(DAY), "ai.tool-calling", evidence({}), "applied", DAY);
  p = recordEvidence(
    p,
    "ai.tool-calling",
    evidence({
      kind: "implementation",
      supports_state: "demonstrated",
      independence: "reference-open",
      review_method: "automated",
    }),
    "applied",
    DAY,
  );
  const yaml = toYaml(p);
  assert.ok(validate(parse(yaml)), JSON.stringify(validate.errors));
  const back = fromYaml(yaml);
  assert.deepEqual(back.errors, []);
  assert.deepEqual(back.progress, p);
});

test("the repository's example progress file imports", () => {
  const text = readFileSync(new URL("../../../progress/progress.example.yaml", import.meta.url), "utf8");
  const result = fromYaml(text);
  assert.deepEqual(result.errors, []);
  assert.equal(result.progress?.competencies["llm.self-attention"].current_state, "demonstrated");
});

test("invalid imports are rejected with reasons", () => {
  const result = fromYaml("version: 2\ncompetencies:\n  x:\n    current_state: mastered\n");
  assert.ok(result.errors.some((e) => e.includes("current_state")));
  assert.equal(result.progress, undefined);
});
