import assert from "node:assert/strict";
import { test } from "node:test";
import { detailsOf, fieldChips, relations, trackedCollection, trackedItems, trackedItemsPointingAt } from "./atlas.ts";
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

test("the details line counts every sources row and the diagnostic tasks, and leaves out fields shown elsewhere", () => {
  const c = trackedCollection;
  for (const item of trackedItems.filter((i) => i.page)) {
    const blocks = item.page!.blocks;
    const details = detailsOf(c, item, "en");
    const rows = blocks.flatMap((b) => (b.type === "sources" ? b.rows : []));
    const diagnostic = blocks.find((b) => b.type === "diagnostic");
    assert.equal(details.sources, rows.length);
    assert.equal(details.tasks, diagnostic?.type === "diagnostic" ? diagnostic.tasks.length : 0);
    // The grouping (the section label), the page condition, and the target (the field log) show elsewhere.
    const elsewhere = [c.group_by, c.page_when?.field, c.progress?.target_field].flatMap((f) =>
      f ? fieldChips(c, item, f, "en").map((chip) => chip.label.value) : [],
    );
    for (const fact of details.facts) assert.ok(!elsewhere.includes(fact.value), `${item.id}: ${fact.value}`);
  }
});

test("an item without a page has no details line", () => {
  const mapped = trackedItems.find((i) => !i.page);
  assert.ok(mapped, "the model has a mapped competency");
  assert.deepEqual(detailsOf(trackedCollection, mapped, "en"), { facts: [], sources: 0, tasks: 0 });
});
