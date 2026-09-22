// The plate's tile encoding at glyph size (DESIGN.md → The plate): shape and fill, never colour
// alone. Used wherever a competency is mentioned with its maturity or learner state; the text
// label always sits beside it.
import { rank, type State } from "../../lib/progress";

export type TileFill = "mapped" | "ready" | "half" | "full";

/** Mapped items have no page; ready items fill by the learner's state. */
export function tileFill(hasPage: boolean, state: State | null | undefined): TileFill {
  if (!hasPage) return "mapped";
  if (!state || state === "unassessed") return "ready";
  return rank(state) >= rank("demonstrated") ? "full" : "half";
}

export function TileGlyph({ fill, state }: { fill: TileFill; state?: State | null }) {
  return <span className={`tile-glyph tile-${fill}${state ? ` tile-state-${state}` : ""}`} aria-hidden="true" />;
}
