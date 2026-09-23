import assert from "node:assert/strict";
import { test } from "node:test";
import { trackedItemsPointingAt } from "./atlas.ts";

// Runs against the real content model: these relations are part of the published curriculum.
const ids = (ref: string) => trackedItemsPointingAt(ref).map((item) => item.id);

test("a tracked item pointing at another tracked item does not practise it", () => {
  assert.deepEqual(ids("ai.tool-calling"), []);
});

test("a lab lists the tracked items that point at it", () => {
  assert.ok(ids("lab:evaluation-harness").includes("ai.evaluation"));
});
