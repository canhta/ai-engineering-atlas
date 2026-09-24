// One stage of a path as an ordered list (DESIGN.md → Path pages): each entry's tile glyph, its title
// (linked when it has a page), then one muted line: the maturity (ready route or mapped) or, after
// hydration, the learner's state; the target level; and "optional" with its condition. An order
// exception hangs under its entry. No percentage and no "done": only states from evidence records.
import type { Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { TileGlyph, tileFill } from "../plate/TileGlyph";

export interface StageEntry {
  ref: string;
  title: Localized;
  url?: string;
  /** The maturity label ("ready route" or "mapped, no route"), shown until there is a state. */
  maturity: string;
  /** "target L3 deep engineering competence", when the path states a level. */
  level?: string;
  /** "optional", when the entry is not required. */
  optional?: string;
  when?: Localized;
  exceptions: { lead: string; title: Localized; reason: Localized }[];
}

interface Props {
  lang: Lang;
  /** Labels of the state vocabulary, from the content model. */
  stateLabels: Record<string, string>;
  entries: StageEntry[];
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function StageEntries({ lang, stateLabels, entries }: Props) {
  const [progress] = useProgress();
  return (
    <ol className="stage-entries">
      {entries.map((e) => {
        const state = e.url && progress ? stateOf(progress, e.ref) : null;
        const shown = state && state !== "unassessed" ? state : null;
        const labelId = `stage-entry-${e.ref.replace(/[^\w-]/g, "-")}`;
        return (
          <li key={e.ref} className="stage-entry" data-ref={e.ref}>
            <p className="stage-entry-head">
              <TileGlyph fill={tileFill(Boolean(e.url), shown)} state={shown} />
              {e.url ? (
                <a href={e.url} lang={langOf(e.title, lang)} aria-describedby={labelId}>
                  {e.title.value}
                </a>
              ) : (
                <span lang={langOf(e.title, lang)}>{e.title.value}</span>
              )}
            </p>
            <p id={labelId} className="stage-entry-facts muted small">
              <span className="stage-entry-state">{shown ? (stateLabels[shown] ?? shown) : e.maturity}</span>
              {e.level && <span>{e.level}</span>}
              {e.optional && (
                <span>
                  {e.optional}
                  {e.when && (
                    <>
                      : <span lang={langOf(e.when, lang)}>{e.when.value}</span>
                    </>
                  )}
                </span>
              )}
            </p>
            {e.exceptions.map((x) => (
              <p key={x.title.value} className="stage-entry-note small">
                {x.lead} <span lang={langOf(x.title, lang)}>{x.title.value}</span>:{" "}
                <span lang={langOf(x.reason, lang)}>{x.reason.value}</span>
              </p>
            ))}
          </li>
        );
      })}
    </ol>
  );
}
