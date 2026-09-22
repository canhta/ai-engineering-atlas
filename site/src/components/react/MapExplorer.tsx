// Interactive map list: search and filters over the same domain-grouped rows the static page
// showed, plus the learner's state. Server-rendered, so the full list works before hydration.
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
import { isDemonstrated, stateOf, type State } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { routeUrl } from "../../lib/urls";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

export interface MapItem {
  id: string;
  title: string;
  ready: boolean;
  level: string;
  prerequisites: { id: string; title: string; ready: boolean }[];
}

export interface MapGroup {
  id: string;
  title: string;
  items: MapItem[];
}

interface Props {
  lang: Lang;
  groups: MapGroup[];
  projects: { id: string; title: string; competencies: string[] }[];
}

type StateFilter = "any" | "notStarted" | "inProgress" | "done";

function matchesState(state: State, filter: StateFilter) {
  if (filter === "any") return true;
  if (filter === "notStarted") return state === "unassessed";
  if (filter === "inProgress") return state === "gap" || state === "learning";
  return isDemonstrated(state);
}

export default function MapExplorer({ lang, groups, projects }: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const [query, setQuery] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);
  const [stateFilter, setStateFilter] = useState<StateFilter>("any");
  const [project, setProject] = useState("any");
  const [expanded, setExpanded] = useState<Set<Key>>(
    () => new Set(groups.filter((g) => g.items.some((i) => i.ready)).map((g) => g.id)),
  );
  const en = lang === "en" ? undefined : "en";
  // Controls stay disabled until hydration so early typing is never discarded.
  const hydrated = progress !== null;

  const filtering = query.trim() !== "" || readyOnly || stateFilter !== "any" || project !== "any";
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inProject = projects.find((p) => p.id === project)?.competencies;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            (!q || item.title.toLowerCase().includes(q) || item.id.includes(q)) &&
            (!readyOnly || item.ready) &&
            (!inProject || inProject.includes(item.id)) &&
            matchesState(stateOf(progress, item.id), stateFilter),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, projects, query, readyOnly, stateFilter, project, progress]);

  const shown = visible.reduce((n, g) => n + g.items.length, 0);
  const expandedKeys = filtering ? new Set<Key>(visible.map((g) => g.id)) : expanded;

  const clear = () => {
    setQuery("");
    setReadyOnly(false);
    setStateFilter("any");
    setProject("any");
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
        <label className="field">
          <span>{t("map.filter.project")}</span>
          <select value={project} disabled={!hydrated} onChange={(e) => setProject(e.target.value)}>
            <option value="any">{t("map.filter.project.any")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} lang={en}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <CheckboxField isSelected={readyOnly} onChange={setReadyOnly} isDisabled={!hydrated}>
          <CheckboxButton className="checkbox">
            <span className="box" aria-hidden="true" />
            {t("map.filter.readyOnly")}
          </CheckboxButton>
        </CheckboxField>
      </div>

      <p className="results" role="status">
        {t("map.results", { shown, total })}
        {filtering && (
          <>
            {" · "}
            <Button className="link-button" onPress={clear}>
              {t("map.clear")}
            </Button>
          </>
        )}
      </p>

      {shown === 0 && <p className="muted">{t("map.noResults")}</p>}

      <DisclosureGroup
        allowsMultipleExpanded
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => !filtering && setExpanded(new Set(keys))}
      >
        {visible.map((g) => {
          const ready = g.items.filter((i) => i.ready).length;
          return (
            <Disclosure key={g.id} id={g.id} className="domain">
              <Heading level={2}>
                <Button slot="trigger" className="domain-trigger">
                  <Icon name="expand" />
                  <span lang={en}>{g.title}</span>
                  <span className="count">{t("map.domainCount", { ready, total: g.items.length })}</span>
                </Button>
              </Heading>
              <DisclosurePanel>
                <table className="map-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("map.col.competency")}</th>
                      <th scope="col">{t("map.col.status")}</th>
                      <th scope="col">{t("map.col.level")}</th>
                      <th scope="col">{t("map.col.prerequisites")}</th>
                      <th scope="col">{t("map.col.state")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((item) => (
                      <tr key={item.id} className={item.ready ? "ready" : "coverage"}>
                        <td>
                          {item.ready ? (
                            <a href={routeUrl(lang, item.id)} lang={en}>
                              {item.title}
                            </a>
                          ) : (
                            <span lang={en}>{item.title}</span>
                          )}
                          <code className="id">{item.id}</code>
                        </td>
                        <td>
                          <span className={`status ${item.ready ? "ready" : "coverage"}`}>
                            {item.ready && <Icon name="ready" />}
                            {t(item.ready ? "status.ready" : "status.coverage")}
                          </span>
                        </td>
                        <td>
                          {item.level && (
                            <>
                              <span className="cell-label">{t("map.col.levelShort")}: </span>
                              {item.level}
                            </>
                          )}
                        </td>
                        <td>
                          {item.prerequisites.length > 0 && (
                            <>
                              <span className="cell-label">{t("map.col.prerequisites")}: </span>
                              {item.prerequisites.map((p, i) => (
                                <span key={p.id}>
                                  {i > 0 && ", "}
                                  {p.ready ? (
                                    <a href={routeUrl(lang, p.id)} lang={en}>
                                      {p.title}
                                    </a>
                                  ) : (
                                    <span className="muted" lang={en}>
                                      {p.title}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </>
                          )}
                        </td>
                        <td>{item.ready && progress && <StateBadge state={stateOf(progress, item.id)} lang={lang} />}</td>
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
