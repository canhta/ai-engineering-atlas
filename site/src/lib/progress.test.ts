import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import {
  addDays,
  emptyProgress,
  fromYaml,
  recordEvidence,
  reviewQueue,
  stateOf,
  toYaml,
  type EvidenceInput,
} from "./progress.ts";

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

test("demonstrated schedules a delayed review; each successful retrieval lengthens it", () => {
  let p = recordEvidence(emptyProgress(DAY), "x", evidence({ kind: "implementation", supports_state: "demonstrated" }), "retained", DAY);
  assert.equal(p.competencies.x.review_on, addDays(DAY, 7));
  const later = addDays(DAY, 7);
  p = recordEvidence(p, "x", evidence({ kind: "retrieval", supports_state: "retained" }), "retained", later);
  assert.equal(p.competencies.x.current_state, "retained");
  assert.equal(p.competencies.x.review_on, addDays(later, 21));
});

test("a failed retrieval moves the state backward and clears the review date", () => {
  let p = recordEvidence(emptyProgress(DAY), "x", evidence({ kind: "implementation", supports_state: "demonstrated" }), "retained", DAY);
  p = recordEvidence(p, "x", evidence({ kind: "retrieval", supports_state: "learning" }), "retained", addDays(DAY, 7));
  assert.equal(p.competencies.x.current_state, "learning");
  assert.equal(p.competencies.x.review_on, undefined);
  assert.equal(p.competencies.x.state_history.length, 2);
});

test("evidence ids are unique within a day", () => {
  let p = recordEvidence(emptyProgress(DAY), "x", evidence({}), "demonstrated", DAY);
  p = recordEvidence(p, "x", evidence({}), "demonstrated", DAY);
  const ids = p.competencies.x.evidence.map((e) => e.id);
  assert.equal(new Set(ids).size, 2);
});

test("review queue splits due and upcoming", () => {
  let p = recordEvidence(emptyProgress(DAY), "a", evidence({ kind: "implementation", supports_state: "demonstrated" }), "retained", DAY);
  p = recordEvidence(p, "b", evidence({ kind: "implementation", supports_state: "demonstrated" }), "retained", addDays(DAY, 3));
  const q = reviewQueue(p, addDays(DAY, 7));
  assert.deepEqual(q.due, ["a"]);
  assert.deepEqual(q.upcoming, ["b"]);
});

test("exported YAML validates against schemas/progress.schema.json and round-trips", () => {
  let p = recordEvidence(emptyProgress(DAY), "ai.tool-calling", evidence({}), "applied", DAY);
  p = recordEvidence(p, "ai.tool-calling", evidence({ kind: "implementation", supports_state: "demonstrated", independence: "reference-open", review_method: "automated" }), "applied", DAY);
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
