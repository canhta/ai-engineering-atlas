// Region placement on the plate (DESIGN.md → The plate). Pure: takes plain region shapes (how
// many named routes and mapped marks each holds, in vocabulary order) and returns where each
// region sits on a column grid. No DOM, no content model; tested in plate-layout.test.ts.
//
// Each region wants a span from its content (named routes need room, marks little). Regions are
// cut into rows in order so that the columns left over are as few as possible on every row, the
// last one included, the way a paragraph is justified; the leftover columns of a row go to the
// region stretched least so far, never beyond `maxStretch` times what it wants.

export interface RegionShape {
  id: string;
  /** Named route tiles in the region. */
  ready: number;
  /** Mapped marks in the region. */
  mapped: number;
}

export interface Grid {
  columns: number;
  /** The narrowest a region gets: room for its label and count. */
  minSpan: number;
  /** Columns one named route tile asks for. */
  readySpan: number;
  /** Columns one mapped mark asks for. */
  markSpan: number;
  /** A region never grows beyond this many times the span it wants. */
  maxStretch: number;
}

export interface Placement {
  id: string;
  /** 1-based grid row. */
  row: number;
  /** 1-based first grid column. */
  column: number;
  span: number;
}

/** Desktop, 1024 px and up: 12 columns of about 100 px. */
export const WIDE: Grid = { columns: 12, minSpan: 2, readySpan: 1 / 2, markSpan: 1 / 12, maxStretch: 2 };
/** Tablet, 768 to 1023 px: 6 columns of about 140 px. */
export const MEDIUM: Grid = { columns: 6, minSpan: 2, readySpan: 1 / 3, markSpan: 1 / 12, maxStretch: 2 };

/** The span a region's content asks for, between the grid's minimum and its full width. */
export function spanWanted(region: RegionShape, grid: Grid): number {
  const content = Math.ceil(region.ready * grid.readySpan + region.mapped * grid.markSpan - 1e-9);
  return Math.min(grid.columns, Math.max(grid.minSpan, content));
}

/** Spans for one row: what each region wants, plus the leftover columns, least stretched first. */
function fillRow(wanted: number[], grid: Grid): { spans: number[]; empty: number } {
  const spans = [...wanted];
  const cap = wanted.map((w) => Math.max(w, Math.floor(w * grid.maxStretch)));
  let left = grid.columns - spans.reduce((a, b) => a + b, 0);
  while (left > 0) {
    let pick = -1;
    for (let i = 0; i < spans.length; i++) {
      if (spans[i] >= cap[i]) continue;
      if (pick < 0 || spans[i] / wanted[i] < spans[pick] / wanted[pick]) pick = i;
    }
    if (pick < 0) break;
    spans[pick]++;
    left--;
  }
  return { spans, empty: left };
}

/** An empty column costs far more than a stretched region: rows fill whenever they can. */
const EMPTY_COST = 100;

function rowCost(wanted: number[], grid: Grid): number {
  const used = wanted.reduce((a, b) => a + b, 0);
  if (used > grid.columns) return Infinity;
  const slack = grid.columns - used;
  const { empty } = fillRow(wanted, grid);
  return slack * slack + EMPTY_COST * empty * empty;
}

/** Places every region once, in the given order, row by row. The same input gives the same output. */
export function placeRegions(regions: readonly RegionShape[], grid: Grid): Placement[] {
  const wanted = regions.map((r) => spanWanted(r, grid));
  const n = regions.length;
  // best[i]: least cost of laying out the first i regions; from[i]: where its last row starts.
  const best = [0, ...Array<number>(n).fill(Infinity)];
  const from = Array<number>(n + 1).fill(0);
  for (let end = 1; end <= n; end++) {
    for (let start = end - 1; start >= 0; start--) {
      const cost = rowCost(wanted.slice(start, end), grid);
      if (cost === Infinity) break;
      if (best[start] + cost < best[end]) {
        best[end] = best[start] + cost;
        from[end] = start;
      }
    }
  }
  const cuts: [number, number][] = [];
  for (let end = n; end > 0; end = from[end]) cuts.unshift([from[end], end]);

  const placements: Placement[] = [];
  cuts.forEach(([start, end], r) => {
    const { spans } = fillRow(wanted.slice(start, end), grid);
    let column = 1;
    spans.forEach((span, i) => {
      placements.push({ id: regions[start + i].id, row: r + 1, column, span });
      column += span;
    });
  });
  return placements;
}
