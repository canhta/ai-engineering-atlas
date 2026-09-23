// One prerequisite's head line in the Prerequisites block (DESIGN.md → Route sheet): its tile
// glyph, its title linking to its page, and a label. Server-rendered and before hydration it shows
// the maturity (ready route or mapped); once hydrated, a ready prerequisite with evidence shows
// the learner's state, as the prerequisite line in the header does.
import type { Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { TileGlyph, tileFill } from "../plate/TileGlyph";

export interface PrereqHeadProps {
  lang: Lang;
  itemRef: string;
  title: Localized;
  url?: string;
  /** The maturity label ("ready route" or "mapped, no route"), shown until there is a state. */
  maturity: string;
  /** Labels of the state vocabulary, from the content model. */
  stateLabels: Record<string, string>;
}

export default function PrereqHead({ lang, itemRef, title, url, maturity, stateLabels }: PrereqHeadProps) {
  const [progress] = useProgress();
  const ready = Boolean(url);
  const state = ready && progress ? stateOf(progress, itemRef) : null;
  const shown = state && state !== "unassessed" ? state : null;
  const titleLang = title.lang === lang ? undefined : title.lang;
  return (
    <p className="prereq-head">
      <TileGlyph fill={tileFill(ready, shown)} state={shown} />
      {url ? (
        <a href={url} lang={titleLang}>
          {title.value}
        </a>
      ) : (
        <span lang={titleLang}>{title.value}</span>
      )}
      <span className="prereq-state muted small">{shown ? (stateLabels[shown] ?? shown) : maturity}</span>
    </p>
  );
}
