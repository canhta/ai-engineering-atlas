// Library (DESIGN.md → Library): a bibliography in sections. The server renders the grouping (one
// section per resource type, from `library()`) and the collapse (native <details>), so the whole
// list reads and links without JavaScript. This island only filters: search and one type.
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import type { LibraryCitation, LibraryEntry } from "../../lib/summaries";
import { Icon } from "./Icon";

/** A section as the page passes it: its heading already chosen. */
export interface LibraryListSection {
  kind: string;
  label: Localized;
  entries: LibraryEntry[];
}

interface Props {
  lang: Lang;
  sections: LibraryListSection[];
}

/** Citing pages shown before "and N more". */
const SHOWN = 2;

// Hydration as a store: the server snapshot while hydrating, the client one right after.
const noSubscription = () => () => {};
const onClient = () => true;
const onServer = () => false;

const anchor = (kind: string) => `type-${kind || "other"}`;

export default function LibraryList({ lang, sections }: Props) {
  const t = useTranslations(lang);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string | null>(null);
  // Before hydration the contents are links to the sections; once filtering works, toggles.
  const hydrated = useSyncExternalStore(noSubscription, onClient, onServer);

  const total = useMemo(() => sections.reduce((n, s) => n + s.entries.length, 0), [sections]);
  const needle = query.trim().toLowerCase();

  // Search narrows every section; the contents count what the search leaves in each type.
  const found = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        entries: needle ? section.entries.filter((entry) => entry.haystack.includes(needle)) : section.entries,
      })),
    [sections, needle],
  );
  const shown = kind === null ? found : found.filter((section) => section.kind === kind);
  const count = shown.reduce((n, s) => n + s.entries.length, 0);
  const langOf = (text: Localized) => (text.lang === lang ? undefined : text.lang);

  const clear = () => {
    setQuery("");
    setKind(null);
  };

  return (
    <div className="library-layout">
      <search className="library-contents">
        <SearchField value={query} onChange={setQuery} className="field" isDisabled={!hydrated}>
          <Label>{t("library.search")}</Label>
          <div className="input-row">
            <Icon name="search" />
            <Input placeholder={t("library.searchPlaceholder")} />
            {query && (
              <Button className="icon-button">
                <Icon name="close" />
                <span className="visually-hidden">{t("map.clearSearch")}</span>
              </Button>
            )}
          </div>
        </SearchField>

        <p className="library-contents-head" id="library-contents-head">
          {t("library.contents")}
        </p>
        {hydrated ? (
          <div role="group" aria-labelledby="library-contents-head">
            <ul className="library-kinds">
              <li>
                <Button className="library-kind" aria-pressed={kind === null} onPress={() => setKind(null)}>
                  <span className="library-kind-label">{t("library.allKinds")}</span>
                  <span className="tabular">{found.reduce((n, s) => n + s.entries.length, 0)}</span>
                </Button>
              </li>
              {found.map((section) => (
                <li key={section.kind}>
                  <Button
                    className="library-kind"
                    aria-pressed={kind === section.kind}
                    onPress={() => setKind(kind === section.kind ? null : section.kind)}
                  >
                    <span className="library-kind-label" lang={langOf(section.label)}>
                      {section.label.value}
                    </span>
                    <span className="tabular">{section.entries.length}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <nav aria-labelledby="library-contents-head">
            <ul className="library-kinds">
              {sections.map((section) => (
                <li key={section.kind}>
                  <a className="library-kind" href={`#${anchor(section.kind)}`}>
                    <span className="library-kind-label" lang={langOf(section.label)}>
                      {section.label.value}
                    </span>
                    <span className="tabular">{section.entries.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="library-results tabular" role="status">
          {t("library.results", { shown: count, total })}
        </p>
      </search>

      <div className="library-sections">
        {count === 0 ? (
          <div className="empty">
            <p>{t("library.noResults")}</p>
            <Button className="button" onPress={clear}>
              {t("map.clear")}
            </Button>
          </div>
        ) : (
          shown
            .filter((section) => section.entries.length > 0)
            .map((section) => (
              <section key={section.kind} className="library-section" aria-labelledby={anchor(section.kind)}>
                <h2 id={anchor(section.kind)}>
                  <span lang={langOf(section.label)}>{section.label.value}</span>{" "}
                  <span className="library-section-count tabular">{section.entries.length}</span>
                </h2>
                <ol className="library">
                  {section.entries.map((entry) => (
                    <li key={entry.key} className="library-entry">
                      <div className="library-work">
                        <h3>
                          <a href={entry.url} rel="noopener noreferrer" lang="en" className="bib-title">
                            {entry.title}
                            <Icon name="external" />
                            <span className="visually-hidden">({t("link.external")})</span>
                          </a>
                        </h3>
                        <p className="bib-meta" lang="en">
                          {[entry.author, entry.host].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <ul className="library-citations">
                        {entry.citations.slice(0, SHOWN).map((citation) => (
                          <Citation key={citation.ref} citation={citation} langOf={langOf} />
                        ))}
                        {entry.citations.length > SHOWN && (
                          <li className="library-more">
                            <details>
                              <summary>{t("library.more", { n: entry.citations.length - SHOWN })}</summary>
                              <ul className="library-citations">
                                {entry.citations.slice(SHOWN).map((citation) => (
                                  <Citation key={citation.ref} citation={citation} langOf={langOf} />
                                ))}
                              </ul>
                            </details>
                          </li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>
            ))
        )}
      </div>
    </div>
  );
}

function Citation({
  citation,
  langOf,
}: {
  citation: LibraryCitation;
  langOf: (text: Localized) => string | undefined;
}) {
  return (
    <li className="library-citation">
      {citation.url ? (
        <a href={citation.url} lang={langOf(citation.title)}>
          {citation.title.value}
        </a>
      ) : (
        <span lang={langOf(citation.title)}>{citation.title.value}</span>
      )}
      {citation.locators.map((locator) => (
        <span key={locator.value} className="library-locator" lang={langOf(locator)}>
          {locator.value}
        </span>
      ))}
    </li>
  );
}
