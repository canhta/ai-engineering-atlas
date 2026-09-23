import assert from "node:assert/strict";
import { test } from "node:test";
import { relations, trackedCollection, trackedItemsPointingAt } from "./atlas.ts";
import { refOf, refPrefix } from "./refs.ts";

// Picks its cases from the content model's relations, so renaming a route or a lab does not fail it.
const isTracked = (ref: string) => refPrefix(ref) === trackedCollection.ref_prefix;
const ids = (ref: string) => trackedItemsPointingAt(ref).map((item) => refOf(trackedCollection, item));

test("a tracked item pointing at another tracked item does not count", () => {
  const between = relations.find((r) => isTracked(r.from) && isTracked(r.to));
  assert.ok(between, "the model has a relation between two tracked items");
  assert.deepEqual(ids(between.to), []);
});

test("an item of another collection lists the tracked items that point at it", () => {
  const outward = relations.find((r) => isTracked(r.from) && !isTracked(r.to));
  assert.ok(outward, "the model has a relation from a tracked item to another collection");
  assert.ok(ids(outward.to).includes(outward.from));
});
