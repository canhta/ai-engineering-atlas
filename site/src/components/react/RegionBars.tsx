// Progress (DESIGN.md → Progress): where you stand per plate region, as proportions rather than a
// map. The Atlas owns the tile grid; this is a summary, so a region is one bar and a count, and
// the bar links into the Atlas filtered to that region.
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { isDemonstrated, STATES, type State } from "../../lib/progress";
import type { RegionData } from "../../lib/summaries";

interface Props {
  lang: Lang;
  atlasUrl: string;
  regions: RegionData[];
  stateOf: (ref: string) => State;
  stateLabels: Record<string, string>;
  /** Null until the learner's own progress has loaded, so the server render shows no state. */
  loaded: boolean;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

/** States that carry a share of the bar; `unassessed` is the empty remainder. */
const FILLED = STATES.filter((s) => s !== "unassessed");

export default function RegionBars({ lang, atlasUrl, regions, stateOf, stateLabels, loaded }: Props) {
  const t = useTranslations(lang);

  const rows = regions
    .map((region) => {
      const ready = region.tiles.filter((tile) => tile.href);
      const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<State, number>;
      for (const tile of ready) counts[stateOf(tile.ref)] += 1;
      return {
        value: region.value,
        label: region.label,
        ready: ready.length,
        done: ready.filter((tile) => isDemonstrated(stateOf(tile.ref))).length,
        started: ready.length - counts.unassessed,
        counts,
      };
    })
    .filter((row) => row.ready > 0)
    .sort((a, b) => b.done / b.ready - a.done / a.ready || b.ready - a.ready);

  if (rows.length === 0) return null;

  return (
    <section className="region-bars" aria-labelledby="region-bars-title">
      <h2 id="region-bars-title">{t("progress.byRegion")}</h2>
      <ul>
        {rows.map((row) => (
          <li key={row.value}>
            <a href={`${atlasUrl}?group=${encodeURIComponent(row.value)}`}>
              <span className="region-name" lang={langOf(row.label, lang)}>
                {row.label.value}
              </span>
              <span className="region-bar" aria-hidden="true">
                {loaded &&
                  FILLED.map((state) =>
                    row.counts[state] ? (
                      <span
                        key={state}
                        className="region-share"
                        data-state={state}
                        style={{ flexGrow: row.counts[state] }}
                      />
                    ) : null,
                  )}
                <span className="region-rest" style={{ flexGrow: row.ready - (loaded ? row.started : 0) }} />
              </span>
              <span className="region-count tabular">
                {loaded ? t("progress.regionCount", { done: row.done, ready: row.ready }) : `…/${row.ready}`}
              </span>
            </a>
            <span className="visually-hidden">
              {FILLED.filter((state) => row.counts[state])
                .map((state) => `${stateLabels[state]}: ${row.counts[state]}`)
                .join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
