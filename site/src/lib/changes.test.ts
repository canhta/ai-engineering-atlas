import assert from "node:assert/strict";
import { test } from "node:test";
import { changes as recorded, hasPage, trackedCollection, trackedItems, type Changes } from "./atlas.ts";
import { refOf } from "./refs.ts";
import { changeAnchor, lastChangeDate, latestChangeOf, releaseGroups } from "./changes.ts";

const fixture: Changes = {
  vocabulary: "change_kind",
  releases: [
    { version: "0.1.0", date: "2026-01-10" },
    { version: "0.2.0", date: "2026-02-01" },
  ],
  entries: [
    { date: "2026-01-05", kind: "promoted", refs: ["a", "b"], release: "0.1.0" },
    { date: "2026-01-20", kind: "lab-added", refs: ["lab:x"], release: "0.2.0" },
    { date: "2026-01-20", kind: "removed", refs: [], unlisted: ["gone"], release: "0.2.0" },
    { date: "2026-03-01", kind: "promoted", refs: ["c"] },
    { date: "2026-03-01", kind: "demoted", refs: ["a"] },
  ],
};

test("unreleased first, then releases newest first, days and entries newest first", () => {
  const groups = releaseGroups(fixture);
  assert.deepEqual(
    groups.map((g) => g.version),
    [undefined, "0.2.0", "0.1.0"],
  );
  assert.deepEqual(
    groups[0].days[0].entries.map((e) => e.kind),
    ["demoted", "promoted"],
  );
  assert.deepEqual(
    groups[1].days[0].entries.map((e) => e.index),
    [2, 1],
  );
  assert.equal(groups[2].date, "2026-01-10");
});

test("a release counts the items each kind names, removed names included", () => {
  const [, second, first] = releaseGroups(fixture);
  assert.deepEqual(second.counts, [
    { kind: "removed", count: 1 },
    { kind: "lab-added", count: 1 },
  ]);
  assert.deepEqual(first.counts, [{ kind: "promoted", count: 2 }]);
});

test("nothing unreleased means no unreleased group; an empty release stays", () => {
  const groups = releaseGroups({ ...fixture, entries: [], releases: [{ version: "0.1.0", date: "2026-01-10" }] });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].version, "0.1.0");
  assert.deepEqual(groups[0].days, []);
});

test("an item's latest change is the last entry naming it, with its anchor", () => {
  const latest = latestChangeOf(fixture, "a");
  assert.equal(latest?.kind, "demoted");
  assert.equal(changeAnchor(latest!.index), "change-5");
  assert.equal(latestChangeOf(fixture, "nobody"), undefined);
  assert.equal(lastChangeDate(fixture), "2026-03-01");
});

// Against the recorded model, without pinning counts: the record is in date order, and every route
// page has a dated change (the content side's replay check guarantees it; this guards the adapter).
test("the recorded changes are in date order and every route page has a change", () => {
  assert.ok(recorded, "the content model carries dated changes");
  const dates = recorded.entries.map((e) => e.date);
  assert.deepEqual(dates, [...dates].sort());
  for (const item of trackedItems.filter(hasPage))
    assert.ok(latestChangeOf(recorded, refOf(trackedCollection, item)), `${item.id} has a dated change`);
});
