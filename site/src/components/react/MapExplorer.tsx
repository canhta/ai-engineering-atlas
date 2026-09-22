// Interactive atlas list: search and filters over the grouped items of the tracked collection,
// plus the learner's state. Server-rendered, so the full list works before hydration.
// (Milestone 2 replaces this list with the plate and drawer; DESIGN.md → Atlas.)
import { useMemo, useState } from "react";
import {
  Button,
  CheckboxButton,
  CheckboxField,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  Input,
  Label,
  SearchField,
  type Key,
} from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { isDemonstrated, stateOf, type State } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

export interface MapItem {
  id: string;
  title: Localized;
  href?: string;
  /** Labelled values of the collection's list fields, in column order. */
  facts: string[];
  prerequisites: { id: string; title: Localized; href?: string }[];
}

export interface MapGroup {
  id: string;
  title: Localized;
  items: MapItem[];
}

export interface MapFilter {
  label: string;
  options: { id: string; title: Localized; members: string[] }[];
}

interface Props {
  lang: Lang;
  itemLabel: string;
  columns: string[];
  groups: MapGroup[];
  filters: MapFilter[];
  stateLabels: Record<string, string>;
}

type StateFilter = "any" | "notStarted" | "inProgress" | "done";

function matchesState(state: State, filter: StateFilter) {
  if (filter === "any") return true;
  if (filter === "notStarted") return state === "unassessed";
  if (filter === "inProgress") return state === "gap" || state === "learning";
  return isDemonstrated(state);
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function MapExplorer({ lang, itemLabel, columns, groups, filters, stateLabels }: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const [query, setQuery] = useState("");
  const [pagesOnly, setPagesOnly] = useState(false);
  const [stateFilter, setStateFilter] = useState<StateFilter>("any");
  const [picked, setPicked] = useState<string[]>(() => filters.map(() => "any"));
  const [expanded, setExpanded] = useState<Set<Key>>(() => new Set(groups.filter((g) => g.items.some((i) => i.href)).map((g) => g.id)));
  // Controls stay disabled until hydration so early typing is never discarded.
  const hydrated = progress !== null;

  const filtering = query.trim() !== "" || pagesOnly || stateFilter !== "any" || picked.some((p) => p !== "any");
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const memberSets = filters.map((f, i) => f.options.find((o) => o.id === picked[i])?.members);
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            (!q || item.title.value.toLowerCase().includes(q) || item.id.includes(q)) &&
            (!pagesOnly || item.href) &&
            memberSets.every((m) => !m || m.includes(item.id)) &&
            matchesState(stateOf(progress, item.id), stateFilter),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, filters, query, pagesOnly, stateFilter, picked, progress]);

  const shown = visible.reduce((n, g) => n + g.items.length, 0);
  const expandedKeys = filtering ? new Set<Key>(visible.map((g) => g.id)) : expanded;

  const clear = () => {
    setQuery("");
    setPagesOnly(false);
    setStateFilter("any");
    setPicked(filters.map(() => "any"));
  };

  return (
    <div className="map-explorer">
      <div className="filter-bar" role="search">
        <SearchField value={query} onChange={setQuery} className="field" isDisabled={!hydrated}>
          <Label>{t("map.search")}</Label>
          <div className="input-row">
            <Icon name="search" />
            <Input />
            {query && (
              <Button className="icon-button">
                <Icon name="close" />
                <span className="visually-hidden">{t("map.clear")}</span>
              </Button>
            )}
          </div>
        </SearchField>
        <label className="field">
          <span>{t("map.filter.state")}</span>
          <select value={stateFilter} disabled={!hydrated} onChange={(e) => setStateFilter(e.target.value as StateFilter)}>
            <option value="any">{t("map.filter.state.any")}</option>
            <option value="notStarted">{t("map.filter.state.notStarted")}</option>
            <option value="inProgress">{t("map.filter.state.inProgress")}</option>
            <option value="done">{t("map.filter.state.done")}</option>
          </select>
        </label>
        {filters.map((f, i) => (
          <label className="field" key={f.label}>
            <span>{f.label}</span>
            <select
              value={picked[i]}
              disabled={!hydrated}
              onChange={(e) => setPicked((p) => p.map((v, j) => (j === i ? e.target.value : v)))}
            >
              <option value="any">{t("map.filter.any")}</option>
              {f.options.map((o) => (
                <option key={o.id} value={o.id} lang={langOf(o.title, lang)}>
                  {o.title.value}
                </option>
              ))}
            </select>
          </label>
        ))}
        <CheckboxField isSelected={pagesOnly} onChange={setPagesOnly} isDisabled={!hydrated}>
          <CheckboxButton className="checkbox">
            <span className="box" aria-hidden="true" />
            {t("map.filter.readyOnly")}
          </CheckboxButton>
        </CheckboxField>
      </div>

      <p className="results" role="status">
        <span className="tabular">{t("map.results", { shown, total })}</span>
        {filtering && (
          <Button className="button-quiet" onPress={clear}>
            {t("map.clear")}
          </Button>
        )}
      </p>

      {shown === 0 && <p className="muted">{t("map.noResults")}</p>}

      <DisclosureGroup
        allowsMultipleExpanded
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => !filtering && setExpanded(new Set(keys))}
      >
        {visible.map((g) => {
          const withPage = g.items.filter((i) => i.href).length;
          return (
            <Disclosure key={g.id} id={g.id} className="group">
              <Heading level={2} id={`group-${g.id}`}>
                <Button slot="trigger" className="group-trigger">
                  <Icon name="expand" />
                  <span lang={langOf(g.title, lang)}>{g.title.value}</span>
                  <span className="count tabular">{t("map.groupCount", { ready: withPage, total: g.items.length })}</span>
                </Button>
              </Heading>
              <DisclosurePanel>
                <table className="map-table">
                  <thead>
                    <tr>
                      <th scope="col">{itemLabel}</th>
                      {columns.map((col) => (
                        <th scope="col" key={col}>
                          {col}
                        </th>
                      ))}
                      <th scope="col">{t("map.col.needs")}</th>
                      <th scope="col">{t("map.col.state")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((item) => (
                      <tr key={item.id} className={item.href ? "has-page" : "mapped"}>
                        <td>
                          <span className="map-item">
                            <TileGlyph fill={tileFill(Boolean(item.href), progress ? stateOf(progress, item.id) : null)} />
                            {item.href ? (
                              <a href={item.href} lang={langOf(item.title, lang)}>
                                {item.title.value}
                              </a>
                            ) : (
                              <span lang={langOf(item.title, lang)}>{item.title.value}</span>
                            )}
                          </span>
                          <code className="id">{item.id}</code>
                        </td>
                        {columns.map((col, i) => (
                          <td key={col}>
                            {item.facts[i] && (
                              <>
                                <span className="cell-label">{col}: </span>
                                {item.facts[i]}
                              </>
                            )}
                          </td>
                        ))}
                        <td>
                          {item.prerequisites.length > 0 && (
                            <>
                              <span className="cell-label">{t("map.col.needs")}: </span>
                              {item.prerequisites.map((p, i) => (
                                <span key={p.id}>
                                  {i > 0 && ", "}
                                  {p.href ? (
                                    <a href={p.href} lang={langOf(p.title, lang)}>
                                      {p.title.value}
                                    </a>
                                  ) : (
                                    <span className="muted" lang={langOf(p.title, lang)}>
                                      {p.title.value}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </>
                          )}
                        </td>
                        <td>
                          {item.href && progress && (
                            <StateBadge state={stateOf(progress, item.id)} label={stateLabels[stateOf(progress, item.id)]} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DisclosurePanel>
            </Disclosure>
          );
        })}
      </DisclosureGroup>
    </div>
  );
}
