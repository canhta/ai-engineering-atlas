// Plate legend (DESIGN.md → The plate): the encodings, or in progress mode one entry per learner
// state with its count. Only the glyph carries the state colour; labels stay ink-muted.
import { type Lang, useTranslations } from "../../i18n";
import { STATES, type State } from "../../lib/progress";
import { Icon } from "../react/Icon";
import { TileGlyph, tileFill } from "./TileGlyph";

const BEYOND: readonly State[] = ["transferred", "retained", "applied"];

interface Props {
  lang: Lang;
  stateLabels: Record<string, string>;
  /** Progress mode: count per state. */
  counts?: Record<State, number> | null;
}

export default function PlateLegend({ lang, stateLabels, counts }: Props) {
  const t = useTranslations(lang);
  if (counts) {
    return (
      <ul className="legend" aria-label={t("legend.label")}>
        {STATES.map((s) => (
          <li key={s}>
            <TileGlyph fill={tileFill(true, s)} state={s} />
            {BEYOND.includes(s) && <Icon name={s} />}
            <span className="legend-label">{stateLabels[s]}</span>
            <span className="legend-count tabular">{counts[s]}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="legend" aria-label={t("legend.label")}>
      <li>
        <TileGlyph fill="mapped" />
        <span>{t("legend.mapped")}</span>
      </li>
      <li>
        <TileGlyph fill="ready" />
        <span>{t("legend.ready")}</span>
      </li>
      <li>
        <TileGlyph fill="half" state="gap" />
        <span>{stateLabels.gap}</span>
      </li>
      <li>
        <TileGlyph fill="most" state="learning" />
        <span>{stateLabels.learning}</span>
      </li>
      <li>
        <TileGlyph fill="full" state="demonstrated" />
        <span>{t("legend.full")}</span>
      </li>
    </ul>
  );
}
