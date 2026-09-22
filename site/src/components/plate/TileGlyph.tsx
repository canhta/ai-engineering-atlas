// The plate's tile encoding at glyph size (DESIGN.md → The plate): shape and fill, never colour
// alone. Used wherever a competency is mentioned with its maturity or learner state; the text
// label always sits beside it.
import type { State } from "../../lib/progress";

export type TileFill = "mapped" | "ready" | "half" | "most" | "full";

/** Mapped items have no page; ready items fill by the learner's stage: gap half, learning most, demonstrated or beyond full. */
export function tileFill(hasPage: boolean, state: State | null | undefined): TileFill {
  if (!hasPage) return "mapped";
  if (!state || state === "unassessed") return "ready";
  if (state === "gap") return "half";
  if (state === "learning") return "most";
  return "full";
}

export function TileGlyph({ fill, state }: { fill: TileFill; state?: State | null }) {
  return <span className={`tile-glyph tile-${fill}${state ? ` tile-state-${state}` : ""}`} aria-hidden="true" />;
}
