import type { State } from "../../lib/progress";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import { Icon } from "./Icon";

const BEYOND: readonly State[] = ["transferred", "retained", "applied"];

/**
 * Learner state as tile shape + text + colour; never colour alone (DESIGN.md → Accessibility).
 * `label` comes from the state vocabulary of the content model.
 */
export function StateBadge({ state, label }: { state: State; label: string }) {
  return (
    <span className={`state-badge state-${state}`}>
      <TileGlyph fill={tileFill(true, state)} state={state} />
      {BEYOND.includes(state) && <Icon name={state} />}
      <span className="state-label">{label}</span>
    </span>
  );
}
