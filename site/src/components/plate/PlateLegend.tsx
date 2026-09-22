// Plate legend (DESIGN.md → The plate): the four encodings, or in progress mode one entry per
// learner state with its count.
import { useTranslations, type Lang } from "../../i18n";
import { STATES, type State } from "../../lib/progress";
import { TileGlyph, tileFill } from "./TileGlyph";

interface Props {
  lang: Lang;
  /** Progress mode: count per state (labels from the state vocabulary). */
  counts?: Record<State, number> | null;
  stateLabels?: Record<string, string>;
}

export default function PlateLegend({ lang, counts, stateLabels }: Props) {
  const t = useTranslations(lang);
  if (counts && stateLabels) {
    return (
      <ul className="legend" aria-label={t("legend.label")}>
        {STATES.map((s) => (
          <li key={s}>
            <TileGlyph fill={tileFill(true, s)} state={s} />
            <span>{stateLabels[s]}</span>
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
        <span>{t("legend.partial")}</span>
      </li>
      <li>
        <TileGlyph fill="full" state="demonstrated" />
        <span>{t("legend.full")}</span>
      </li>
    </ul>
  );
}
