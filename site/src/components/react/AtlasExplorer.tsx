// Atlas (DESIGN.md → Atlas): the index (a gazetteer, the default view) or the plate, filters from
// the content model, live count, and the item drawer. URL parameters: ?item=<ref> opens the drawer,
// ?ready=1 shows ready items only, ?group=<value> marks a region and scrolls to it, ?view=plate
// shows the plate (?view=list, the old list view, opens the index). The server-rendered index works
// before hydration; controls stay disabled until then.
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Button,
  CheckboxButton,
  CheckboxField,
  Dialog,
  Input,
  Label,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  Popover,
  SearchField,
} from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { isDemonstrated, type State, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import type { FacetData, ItemDetail, RegionData, RelatedFacetData, TileData } from "../../lib/summaries";
import Plate from "../plate/Plate";
import PlateLegend from "../plate/PlateLegend";
import Gazetteer from "./Gazetteer";
import { Icon } from "./Icon";
import ItemDrawer from "./ItemDrawer";

type StateFilter = "any" | "notStarted" | "inProgress" | "done";
type View = "index" | "plate";

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

interface MenuOption {
  id: string;
  label: Localized;
}

/**
 * One facet of the key: a quiet button naming the facet and its current choice, opening a menu
 * of options (DESIGN.md → Atlas). React Aria returns focus to the button when the menu closes.
 */
function FacetMenu(props: {
  lang: Lang;
  label: string;
  value: string;
  options: MenuOption[];
  isDisabled: boolean;
  /** Open below the button even when there is more room above (the mobile sheet). */
  below?: boolean;
  onChange: (value: string) => void;
}) {
  const { lang, label, value, options, isDisabled, below = false, onChange } = props;
  const current = options.find((o) => o.id === value) ?? options[0];
  return (
    <MenuTrigger>
      <Button className="facet" isDisabled={isDisabled}>
        <span className="facet-label">{label}</span>
        <span className="visually-hidden">: </span>
        <span className="facet-value" lang={langOf(current.label, lang)}>
          {current.label.value}
        </span>
        <Icon name="expand" />
      </Button>
      <Popover className="facet-popover" placement="bottom start" offset={4} shouldFlip={!below}>
        <Menu
          className="facet-menu"
          aria-label={label}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[current.id]}
          onSelectionChange={(keys) => {
            const [next] = keys === "all" ? [] : [...keys];
            if (next !== undefined) onChange(String(next));
          }}
        >
          {options.map((o) => (
            <MenuItem key={o.id} id={o.id} className="facet-option" textValue={o.label.value}>
              <span lang={langOf(o.label, lang)}>{o.label.value}</span>
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export default function AtlasExplorer(props: Props) {
  const { lang, title, intro, atlasUrl, contributeUrl, regions, details, facets, relatedFacets, stateLabels } = props;
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const hydrated = progress !== null;
  const [view, setView] = useState<View>("index");
  const [query, setQuery] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);
  const [facetValues, setFacetValues] = useState<Record<string, string>>({});
  const [related, setRelated] = useState<string[]>(() => relatedFacets.map(() => "any"));
  const [stateFilter, setStateFilter] = useState<StateFilter>("any");
  const [selected, setSelected] = useState<string | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read the URL once after hydration: the server render has no URL parameters, so this state
  // cannot be set during render without a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    if (params.get("ready") === "1") setReadyOnly(true);
    if (params.get("view") === "plate") setView("plate");
    const item = params.get("item");
    if (item && details[item]) setSelected(item);
    else if (item) setMissing(item);
    const g = params.get("group");
    if (g && regions.some((r) => r.value === g)) setGroup(g);
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

  const local = (value: string): Localized => ({ value, lang });
  const anyOption: MenuOption = { id: "any", label: local(t("map.filter.any")) };
  const stateOptions: MenuOption[] = (["any", "notStarted", "inProgress", "done"] as const).map((id) => ({
    id,
    label: local(t(`map.filter.state.${id}`)),
  }));
  // In the mobile sheet a menu opens downward only: flipped above its button it would cover the
  // sheet's title, so the sheet keeps room below its buttons instead (DESIGN.md → Atlas).
  const controls = (inSheet: boolean): ReactNode => (
    <>
      {facets.map((f) => (
        <FacetMenu
          key={f.field}
          lang={lang}
          label={f.label}
          value={facetValues[f.field] ?? "any"}
          options={[anyOption, ...f.options.map((o) => ({ id: o.value, label: o.label }))]}
          isDisabled={!hydrated}
          below={inSheet}
          onChange={(value) => setFacetValues((v) => ({ ...v, [f.field]: value }))}
        />
      ))}
      <FacetMenu
        lang={lang}
        label={t("map.filter.state")}
        value={stateFilter}
        options={stateOptions}
        isDisabled={!hydrated}
        below={inSheet}
        onChange={(value) => setStateFilter(value as StateFilter)}
      />
      {relatedFacets.map((f, i) => (
        <FacetMenu
          key={f.label}
          lang={lang}
          label={f.label}
          value={related[i]}
          options={[anyOption, ...f.options.map((o) => ({ id: o.ref, label: o.title }))]}
          isDisabled={!hydrated}
          below={inSheet}
          onChange={(value) => setRelated((r) => r.map((v, j) => (j === i ? value : v)))}
        />
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
            aria-pressed={view === "index"}
            onClick={() => {
              setView("index");
              setParam("view", null);
            }}
          >
            <Icon name="listView" />
            {t("map.view.index")}
          </button>
          <button
            type="button"
            aria-pressed={view === "plate"}
            onClick={() => {
              setView("plate");
              setParam("view", "plate");
            }}
          >
            <Icon name="plateView" />
            {t("map.view.plate")}
          </button>
        </fieldset>
      </div>

      <search className="filter-bar">
        <SearchField value={query} onChange={setQuery} className="field filter-search" isDisabled={!hydrated}>
          <Label className="visually-hidden">{t("map.search")}</Label>
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
        <div className="filter-controls">{controls(false)}</div>
        <Button className="button filter-open" isDisabled={!hydrated} onPress={() => setFiltersOpen(true)}>
          {t("map.filters", { count: activeFilters - (query.trim() ? 1 : 0) })}
        </Button>
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
      </search>

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
        <Gazetteer
          lang={lang}
          regions={regions}
          details={details}
          stateLabels={stateLabels}
          atlasUrl={atlasUrl}
          matches={filtering ? matches : null}
          selected={selected}
          focusGroup={group}
          progress={progress}
          onSelect={select}
        />
      )}

      <ModalOverlay className="bottom-sheet-overlay" isDismissable isOpen={filtersOpen} onOpenChange={setFiltersOpen}>
        <Modal className="bottom-sheet filter-bottom-sheet">
          <Dialog className="bottom-sheet-dialog" aria-labelledby="filters-title">
            <div className="bottom-sheet-head">
              <h2 id="filters-title" className="log-title">
                {t("map.filtersTitle")}
              </h2>
              <Button className="button-quiet" onPress={() => setFiltersOpen(false)}>
                {t("map.showResults", { shown })}
              </Button>
            </div>
            <div className="filter-sheet">{controls(true)}</div>
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
