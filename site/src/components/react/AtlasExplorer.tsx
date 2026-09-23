// Atlas (DESIGN.md → Atlas): plate or list, filters from the content model, live count, and the
// item drawer. URL parameters: ?item=<ref> opens the drawer, ?ready=1 shows ready items only,
// ?group=<value> focuses a region, ?view=list opens the list. The server-rendered plate and list
// work before hydration; controls stay disabled until then.
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Button,
  CheckboxButton,
  CheckboxField,
  Dialog,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  Input,
  type Key,
  Label,
  Modal,
  ModalOverlay,
  SearchField,
} from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { isDemonstrated, type State, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import type { FacetData, ItemDetail, RegionData, RelatedFacetData, TileData } from "../../lib/summaries";
import Plate from "../plate/Plate";
import PlateLegend from "../plate/PlateLegend";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import { Icon } from "./Icon";
import ItemDrawer from "./ItemDrawer";
import { StateBadge } from "./StateBadge";

type StateFilter = "any" | "notStarted" | "inProgress" | "done";
type View = "plate" | "list";

interface Props {
  lang: Lang;
  title: string;
  intro: string;
  atlasUrl: string;
  contributeUrl: string;
  regions: RegionData[];
  details: Record<string, ItemDetail>;
  facets: FacetData[];
  relatedFacets: RelatedFacetData[];
  itemLabel: string;
  listColumns: string[];
  stateLabels: Record<string, string>;
}

function matchesState(state: State, filter: StateFilter) {
  if (filter === "any") return true;
  if (filter === "notStarted") return state === "unassessed";
  if (filter === "inProgress") return state === "gap" || state === "learning";
  return isDemonstrated(state);
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

function setParam(name: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  window.history.replaceState(null, "", url);
}

export default function AtlasExplorer(props: Props) {
  const {
    lang,
    title,
    intro,
    atlasUrl,
    contributeUrl,
    regions,
    details,
    facets,
    relatedFacets,
    itemLabel,
    listColumns,
    stateLabels,
  } = props;
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const hydrated = progress !== null;
  const [view, setView] = useState<View>("plate");
  const [query, setQuery] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);
  const [facetValues, setFacetValues] = useState<Record<string, string>>({});
  const [related, setRelated] = useState<string[]>(() => relatedFacets.map(() => "any"));
  const [stateFilter, setStateFilter] = useState<StateFilter>("any");
  const [selected, setSelected] = useState<string | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<Key>>(
    () => new Set(regions.filter((r) => r.tiles.some((tile) => tile.href)).map((r) => r.value)),
  );

  // Read the URL once after hydration: the server render has no URL parameters, so this state
  // cannot be set during render without a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    if (params.get("ready") === "1") setReadyOnly(true);
    if (params.get("view") === "list") setView("list");
    const item = params.get("item");
    if (item && details[item]) setSelected(item);
    else if (item) setMissing(item);
    const g = params.get("group");
    if (g && regions.some((r) => r.value === g)) {
      setGroup(g);
      setExpanded((e) => new Set([...e, g]));
    }
  }, [details, regions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const select = (ref: string | null) => {
    setMissing(null);
    setSelected(ref);
    setParam("item", ref);
  };

  const all = useMemo(() => regions.flatMap((r) => r.tiles), [regions]);
  const activeFilters =
    (query.trim() ? 1 : 0) +
    (readyOnly ? 1 : 0) +
    Object.values(facetValues).filter((v) => v && v !== "any").length +
    related.filter((v) => v !== "any").length +
    (stateFilter !== "any" ? 1 : 0);
  const filtering = activeFilters > 0;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ok = (tile: TileData) =>
      (!q || tile.title.value.toLowerCase().includes(q) || tile.ref.includes(q)) &&
      (!readyOnly || Boolean(tile.href)) &&
      Object.entries(facetValues).every(
        ([field, value]) => !value || value === "any" || (tile.values[field] ?? []).includes(value),
      ) &&
      related.every((ref) => ref === "any" || tile.relatedTo.includes(ref)) &&
      (stateFilter === "any" || (Boolean(tile.href) && matchesState(stateOf(progress, tile.ref), stateFilter)));
    return new Set(all.filter(ok).map((tile) => tile.ref));
  }, [all, query, readyOnly, facetValues, related, stateFilter, progress]);

  const shown = matches.size;
  const clear = () => {
    setQuery("");
    setReadyOnly(false);
    setFacetValues({});
    setRelated(relatedFacets.map(() => "any"));
    setStateFilter("any");
    setParam("ready", null);
  };

  const controls: ReactNode = (
    <>
      {facets.map((f) => (
        <label className="field" key={f.field}>
          <span>{f.label}</span>
          <select
            value={facetValues[f.field] ?? "any"}
            disabled={!hydrated}
            onChange={(e) => setFacetValues((v) => ({ ...v, [f.field]: e.target.value }))}
          >
            <option value="any">{t("map.filter.any")}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value} lang={langOf(o.label, lang)}>
                {o.label.value}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="field">
        <span>{t("map.filter.state")}</span>
        <select
          value={stateFilter}
          disabled={!hydrated}
          onChange={(e) => setStateFilter(e.target.value as StateFilter)}
        >
          <option value="any">{t("map.filter.state.any")}</option>
          <option value="notStarted">{t("map.filter.state.notStarted")}</option>
          <option value="inProgress">{t("map.filter.state.inProgress")}</option>
          <option value="done">{t("map.filter.state.done")}</option>
        </select>
      </label>
      {relatedFacets.map((f, i) => (
        <label className="field" key={f.label}>
          <span>{f.label}</span>
          <select
            value={related[i]}
            disabled={!hydrated}
            onChange={(e) => setRelated((r) => r.map((v, j) => (j === i ? e.target.value : v)))}
          >
            <option value="any">{t("map.filter.any")}</option>
            {f.options.map((o) => (
              <option key={o.ref} value={o.ref} lang={langOf(o.title, lang)}>
                {o.title.value}
              </option>
            ))}
          </select>
        </label>
      ))}
      <CheckboxField
        isSelected={readyOnly}
        isDisabled={!hydrated}
        onChange={(v) => {
          setReadyOnly(v);
          setParam("ready", v ? "1" : null);
        }}
      >
        <CheckboxButton className="checkbox">
          <span className="box" aria-hidden="true" />
          {t("map.filter.readyOnly")}
        </CheckboxButton>
      </CheckboxField>
    </>
  );

  const visibleRegions = regions
    .map((r) => ({ ...r, tiles: r.tiles.filter((tile) => matches.has(tile.ref)) }))
    .filter((r) => r.tiles.length > 0);
  const expandedKeys = filtering ? new Set<Key>(visibleRegions.map((r) => r.value)) : expanded;

  return (
    <div className="atlas">
      <div className="atlas-head">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="lead">{intro}</p>
        </div>
        <fieldset className="view-toggle">
          <legend className="visually-hidden">{t("map.view")}</legend>
          <button
            type="button"
            aria-pressed={view === "plate"}
            onClick={() => {
              setView("plate");
              setParam("view", null);
            }}
          >
            <Icon name="plateView" />
            {t("map.view.plate")}
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => {
              setView("list");
              setParam("view", "list");
            }}
          >
            <Icon name="listView" />
            {t("map.view.list")}
          </button>
        </fieldset>
      </div>

      <search className="filter-bar">
        <SearchField value={query} onChange={setQuery} className="field filter-search" isDisabled={!hydrated}>
          <Label>{t("map.search")}</Label>
          <div className="input-row">
            <Icon name="search" />
            <Input placeholder={t("map.searchPlaceholder")} />
            {query && (
              <Button className="icon-button">
                <Icon name="close" />
                <span className="visually-hidden">{t("map.clearSearch")}</span>
              </Button>
            )}
          </div>
        </SearchField>
        <div className="filter-controls">{controls}</div>
        <Button className="button filter-open" isDisabled={!hydrated} onPress={() => setFiltersOpen(true)}>
          {t("map.filters", { count: activeFilters - (query.trim() ? 1 : 0) })}
        </Button>
      </search>

      <div className="results">
        <p role="status" className="tabular">
          {t("map.results", { shown, total: all.length })}
        </p>
        {filtering && (
          <Button className="button-quiet" onPress={clear}>
            {t("map.clear")}
          </Button>
        )}
      </div>

      <PlateLegend lang={lang} stateLabels={stateLabels} />

      {shown === 0 && (
        <div className="empty">
          <p>{t("map.noResults")}</p>
          <Button className="button" onPress={clear}>
            {t("map.clear")}
          </Button>
        </div>
      )}

      {view === "plate" ? (
        <Plate
          lang={lang}
          mode="explore"
          regions={regions}
          stateLabels={stateLabels}
          atlasUrl={atlasUrl}
          matches={filtering ? matches : null}
          selected={selected}
          onSelect={select}
          focusGroup={group}
        />
      ) : (
        <DisclosureGroup
          allowsMultipleExpanded
          expandedKeys={expandedKeys}
          onExpandedChange={(keys) => !filtering && setExpanded(new Set(keys))}
        >
          {visibleRegions.map((r) => {
            const ready = r.tiles.filter((tile) => tile.href).length;
            return (
              <Disclosure key={r.value} id={r.value} className="group">
                <Heading level={2}>
                  <Button slot="trigger" className="group-trigger">
                    <Icon name="expand" />
                    <span lang={langOf(r.label, lang)}>{r.label.value}</span>
                    <span className="count tabular">{t("map.groupCount", { ready, total: r.tiles.length })}</span>
                  </Button>
                </Heading>
                <DisclosurePanel>
                  <table className="map-table">
                    <thead>
                      <tr>
                        <th scope="col">{itemLabel}</th>
                        {listColumns.map((col) => (
                          <th scope="col" key={col}>
                            {col}
                          </th>
                        ))}
                        <th scope="col">{t("map.col.state")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.tiles.map((tile) => {
                        const state = progress && tile.href ? stateOf(progress, tile.ref) : null;
                        return (
                          <tr key={tile.ref} className={tile.href ? "has-page" : "mapped"}>
                            <td>
                              <button type="button" className="map-item" onClick={() => select(tile.ref)}>
                                <TileGlyph fill={tileFill(Boolean(tile.href), state)} state={state} />
                                <span lang={langOf(tile.title, lang)}>{tile.title.value}</span>
                              </button>
                              <code className="id">{tile.ref}</code>
                            </td>
                            {listColumns.map((col, i) => (
                              <td key={col}>
                                {tile.list[i] && (
                                  <>
                                    <span className="cell-label">{col}: </span>
                                    {tile.list[i]}
                                  </>
                                )}
                              </td>
                            ))}
                            <td>{state && <StateBadge state={state} label={stateLabels[state]} />}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </DisclosurePanel>
              </Disclosure>
            );
          })}
        </DisclosureGroup>
      )}

      <ModalOverlay className="bottom-sheet-overlay" isDismissable isOpen={filtersOpen} onOpenChange={setFiltersOpen}>
        <Modal className="bottom-sheet">
          <Dialog className="bottom-sheet-dialog" aria-labelledby="filters-title">
            <div className="bottom-sheet-head">
              <h2 id="filters-title" className="log-title">
                {t("map.filtersTitle")}
              </h2>
              <Button className="button-quiet" onPress={() => setFiltersOpen(false)}>
                {t("map.showResults", { shown })}
              </Button>
            </div>
            <div className="filter-sheet">{controls}</div>
            {filtering && (
              <Button className="button-quiet" onPress={clear}>
                {t("map.clear")}
              </Button>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>

      <ItemDrawer
        lang={lang}
        detail={selected ? (details[selected] ?? null) : null}
        missing={missing}
        details={details}
        stateLabels={stateLabels}
        contributeUrl={contributeUrl}
        onClose={() => select(null)}
      />
    </div>
  );
}
