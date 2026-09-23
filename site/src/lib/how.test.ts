import assert from "node:assert/strict";
import { test } from "node:test";
import { pagedItems, stateVocabulary, trackedCollection, vocabularyValues } from "./atlas.ts";
import { evidenceKey, routeSteps, stateKey } from "./how.ts";

// Expected values come from the content model, so adding a state, a type, or a step does not fail it.
test("the state key lists every learner state in order, each with a meaning", () => {
  const key = stateKey("en");
  assert.deepEqual(
    key.map((s) => s.value),
    vocabularyValues(stateVocabulary),
  );
  for (const s of key) assert.ok(s.meaning.value, `${s.value} has a meaning`);
});

test("the evidence key describes every capability type", () => {
  const key = evidenceKey("vi");
  assert.ok(key, "the model describes a vocabulary besides the states");
  for (const row of key.rows) assert.ok(row.meaning.value && row.label.value, row.value);
});

test("route steps keep every page's step order", () => {
  const steps = routeSteps("en").map((s) => s.id);
  for (const item of pagedItems(trackedCollection)) {
    const own = (item.page?.blocks ?? []).filter((b) => b.step).map((b) => b.id);
    assert.deepEqual(
      steps.filter((id) => own.includes(id)),
      own,
      item.id,
    );
  }
  const optional = routeSteps("en").filter((s) => !s.everywhere);
  assert.ok(optional.length < steps.length, "most steps appear on every route");
});
