import assert from "node:assert/strict";
import { test } from "node:test";
import { groupsOf, hasPage, trackedCollection } from "./atlas.ts";
import { type Grid, MEDIUM, type Placement, placeRegions, type RegionShape, spanWanted, WIDE } from "./plate-layout.ts";

// The regions the plate shows today, read from the content model: the layout has to hold as
// routes are promoted, so the cases below also run on made-up shapes.
const atlas: RegionShape[] = groupsOf(trackedCollection).map((g) => ({
  id: g.value,
  ready: g.items.filter(hasPage).length,
  mapped: g.items.filter((i) => !hasPage(i)).length,
}));

const shape = (id: string, ready: number, mapped: number): RegionShape => ({ id, ready, mapped });

// Shapes that broke earlier layouts: a lone small region after two large ones (the prototype's
// stretched, nearly empty last row), all mapped, all ready, one region, and one huge region.
const CASES: Record<string, RegionShape[]> = {
  atlas,
  "lone small region last": [shape("a", 12, 14), shape("b", 11, 0), shape("c", 0, 3)],
  "all mapped": Array.from({ length: 12 }, (_, i) => shape(`m${i}`, 0, 3 + (i % 7))),
  "all ready": Array.from({ length: 9 }, (_, i) => shape(`r${i}`, 2 + (i % 5), 0)),
  "one region": [shape("only", 3, 5)],
  "huge region": [shape("big", 60, 40), shape("small", 0, 4), shape("mid", 5, 2)],
  "mixed growth": [
    shape("a", 0, 8),
    shape("b", 4, 5),
    shape("c", 1, 6),
    shape("d", 20, 6),
    shape("e", 0, 2),
    shape("f", 7, 7),
    shape("g", 0, 9),
  ],
};

const rowsOf = (placements: Placement[]) => {
  const rows = new Map<number, Placement[]>();
  for (const p of placements) rows.set(p.row, [...(rows.get(p.row) ?? []), p]);
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, row]) => row.sort((a, b) => a.column - b.column));
};

for (const grid of [WIDE, MEDIUM] as Grid[]) {
  for (const [name, regions] of Object.entries(CASES)) {
    const label = `${name}, ${grid.columns} columns`;
    const placements = placeRegions(regions, grid);

    test(`${label}: every region is placed once, in vocabulary order`, () => {
      assert.deepEqual(
        placements.map((p) => p.id),
        regions.map((r) => r.id),
      );
      const reading = [...placements].sort((a, b) => a.row - b.row || a.column - b.column).map((p) => p.id);
      assert.deepEqual(
        reading,
        regions.map((r) => r.id),
      );
    });

    test(`${label}: rows start at 1, run without gaps, and regions stay inside the grid without overlap`, () => {
      const rows = rowsOf(placements);
      assert.deepEqual(
        rows.map((row) => row[0].row),
        rows.map((_, i) => i + 1),
      );
      for (const row of rows) {
        let next = 1;
        for (const p of row) {
          assert.ok(p.column >= next, `${p.id} overlaps its neighbour`);
          assert.ok(p.span >= 1 && p.column + p.span - 1 <= grid.columns, `${p.id} leaves the grid`);
          next = p.column + p.span;
        }
      }
    });

    test(`${label}: every region gets the span its content wants, and none is stretched beyond the maximum`, () => {
      for (const p of placements) {
        const wanted = spanWanted(
          regions.find((r) => r.id === p.id)!,
          grid,
        );
        assert.ok(p.span >= wanted, `${p.id}: ${p.span} < ${wanted}`);
        assert.ok(p.span <= Math.max(wanted, Math.floor(wanted * grid.maxStretch)), `${p.id} stretched to ${p.span}`);
      }
    });

    test(`${label}: the same input gives the same output`, () => {
      const copy = structuredClone(regions);
      assert.deepEqual(placeRegions(regions, grid), placements);
      assert.deepEqual(regions, copy, "the input is not changed");
    });
  }

  test(`the atlas today fills every row of ${grid.columns} columns`, () => {
    for (const row of rowsOf(placeRegions(atlas, grid))) {
      const used = row.reduce((sum, p) => sum + p.span, 0);
      assert.equal(used, grid.columns, `row ${row[0].row} uses ${used}`);
    }
  });

  test(`a lone small region does not end up alone on a stretched last row (${grid.columns} columns)`, () => {
    const rows = rowsOf(placeRegions(CASES["lone small region last"], grid));
    const last = rows.at(-1)!;
    assert.ok(last.length > 1 || last[0].span <= spanWanted(CASES["lone small region last"].at(-1)!, grid) * 2);
    assert.notDeepEqual(
      last.map((p) => p.id),
      ["c"],
      "the small mapped-only region shares its row",
    );
  });
}

test("a region with named routes wants more room than one with only marks", () => {
  assert.ok(spanWanted(shape("r", 6, 2), WIDE) > spanWanted(shape("m", 0, 8), WIDE));
  assert.ok(spanWanted(shape("m", 0, 8), WIDE) >= WIDE.minSpan);
  assert.ok(spanWanted(shape("big", 200, 0), WIDE) <= WIDE.columns);
});

test("no regions, no placements", () => {
  assert.deepEqual(placeRegions([], WIDE), []);
});
