// The Atlas index, a gazetteer (DESIGN.md → Atlas): one ruled section per region in vocabulary
// order, each ready route an entry with what it asks, its details line, what it needs first, the
// items it is practice for, and the learner's state; mapped competencies run in as one quiet line
// per region. Set as the collection catalogue is. Server-rendered inside the Atlas island, so it
// reads and links without JavaScript; filters remove entries, and a region left with nothing goes.
import { Fragment, type MouseEvent, useEffect } from "react";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { type Progress, stateOf } from "../../lib/progress";
import type { ItemDetail, RegionData, TileData } from "../../lib/summaries";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import DetailsLine from "./DetailsLine";
import PrereqLine from "./PrereqLine";

interface Props {
  lang: Lang;
  regions: RegionData[];
  details: Record<string, ItemDetail>;
  stateLabels: Record<string, string>;
  atlasUrl: string;
  /** Refs matching the filters, or null when nothing filters. */
  matches: Set<string> | null;
  selected: string | null;
  focusGroup: string | null;
  progress: Progress | null;
  onSelect: (ref: string) => void;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function Gazetteer(props: Props) {
  const { lang, regions, details, stateLabels, atlasUrl, matches, selected, focusGroup, progress, onSelect } = props;
  const t = useTranslations(lang);

  useEffect(() => {
    if (focusGroup) document.getElementById(`region-${focusGroup}`)?.scrollIntoView({ block: "start" });
  }, [focusGroup]);

  const shown = (tile: TileData) => !matches || matches.has(tile.ref);
  // Text without a reviewed translation renders in English with its own `lang`, under the marker.
  const untranslated = regions.some((r) =>
    r.tiles.some((tile) => tile.href && (tile.title.lang !== lang || details[tile.ref]?.passage?.lang !== lang)),
  );

  // A mapped name is a link to its drawer: it works as a link before hydration, and opens the
  // drawer in place after it.
  const openDrawer = (ref: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onSelect(ref);
  };

  return (
    <div className="gazetteer">
      {untranslated && (
        <p className="untranslated small" role="note">
          {t("translation.missing")}
        </p>
      )}
      {regions.map((region) => {
        const routes = region.tiles.filter((tile) => tile.href);
        const mapped = region.tiles.filter((tile) => !tile.href);
        const routesShown = routes.filter(shown);
        const mappedShown = mapped.filter(shown);
        if (routesShown.length === 0 && mappedShown.length === 0) return null;
        const headingId = `region-${region.value}-label`;
        return (
          <section
            key={region.value}
            id={`region-${region.value}`}
            className={`gazetteer-region${focusGroup === region.value ? " is-focus" : ""}`}
            aria-labelledby={headingId}
          >
            <h2 className="plate-region-label gazetteer-head" id={headingId}>
              <span className="plate-region-name" lang={langOf(region.label, lang)}>
                {region.label.value}
              </span>{" "}
              <span className="plate-region-count tabular">
                {t("plate.regionCount", { ready: routes.length, total: region.tiles.length })}
              </span>
            </h2>

            {routesShown.length > 0 && (
              <table className="catalogue has-related gazetteer-entries" aria-labelledby={headingId}>
                <colgroup>
                  <col className="gazetteer-col-title" />
                  <col />
                  <col className="gazetteer-col-related" />
                </colgroup>
                <thead className="visually-hidden">
                  <tr>
                    <th scope="col">{t("collection.col.title")}</th>
                    <th scope="col">{t("collection.col.asks")}</th>
                    <th scope="col">{t("map.col.needsPractice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {routesShown.map((tile) => {
                    const detail = details[tile.ref];
                    const state = progress ? stateOf(progress, tile.ref) : null;
                    const known = state && state !== "unassessed" ? state : null;
                    const spoken = known
                      ? t("prereq.state", { state: stateLabels[known] ?? known })
                      : t("prereq.ready");
                    return (
                      <tr
                        key={tile.ref}
                        data-ref={tile.ref}
                        className={selected === tile.ref ? "is-selected" : undefined}
                      >
                        <th scope="row" className="catalogue-title">
                          <a className="gazetteer-title" href={tile.href}>
                            <TileGlyph fill={tileFill(true, state)} state={state} />
                            <span>
                              <span lang={langOf(tile.title, lang)}>{tile.title.value}</span>
                              <span className="visually-hidden">, {spoken}</span>
                            </span>
                          </a>
                          {detail && <DetailsLine lang={lang} details={detail.details} />}
                          {known && (
                            <span className="gazetteer-state" aria-hidden="true">
                              {t("map.col.state")} {stateLabels[known] ?? known}
                            </span>
                          )}
                        </th>
                        <td className="catalogue-asks">
                          {detail?.passage && (
                            <p className="gazetteer-passage" lang={langOf(detail.passage, lang)}>
                              {detail.passage.value}
                            </p>
                          )}
                        </td>
                        <td className="catalogue-related">
                          {detail && detail.needs.length > 0 ? (
                            <PrereqLine
                              lang={lang}
                              stateLabels={stateLabels}
                              lead={t("map.col.needs")}
                              entries={detail.needs.map((need) => ({
                                ref: need.ref,
                                title: need.title,
                                url: need.href,
                              }))}
                            />
                          ) : (
                            <p className="prereq-line gazetteer-none">{t("prereq.none")}</p>
                          )}
                          {detail?.practice.map((group) => (
                            <p key={group.label.value} className="gazetteer-practice">
                              <span className="prereq-lead" lang={langOf(group.label, lang)}>
                                {group.label.value}
                              </span>{" "}
                              {group.items.map((item, i) => (
                                <Fragment key={i}>
                                  {i > 0 && ", "}
                                  {item.href ? (
                                    <a href={item.href} lang={langOf(item.title, lang)}>
                                      {item.title.value}
                                    </a>
                                  ) : (
                                    <span lang={langOf(item.title, lang)}>{item.title.value}</span>
                                  )}
                                </Fragment>
                              ))}
                            </p>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {mappedShown.length > 0 && (
              <p className="gazetteer-mapped">
                <span className="prereq-lead">{t("map.mappedLine")}</span>{" "}
                {mappedShown.map((tile, i) => (
                  <Fragment key={tile.ref}>
                    {i > 0 && ", "}
                    <a
                      href={`${atlasUrl}?item=${encodeURIComponent(tile.ref)}`}
                      lang={langOf(tile.title, lang)}
                      className={selected === tile.ref ? "is-selected" : undefined}
                      onClick={openDrawer(tile.ref)}
                    >
                      {tile.title.value}
                    </a>
                  </Fragment>
                ))}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
