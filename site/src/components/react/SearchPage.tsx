// Search across everything (DESIGN.md → Information architecture), found by title and listed by
// kind: one field, results under kind headings with counts, each a title link and one line of
// context, the matched text emphasised. The index is a static JSON asset built per language
// (src/pages/[lang]/search/index.json.ts), fetched on load; `?q=` is read on load and kept in the
// URL. The server render is a plain GET form with links to browse instead, so it works without
// JavaScript.
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import { highlight, type Phrase, search, type SearchIndex } from "../../lib/search";
import { Icon } from "./Icon";

interface Props {
  lang: Lang;
  /** This page, the form's action without JavaScript. */
  action: string;
  /** The built index for this language. */
  indexUrl: string;
  /** Where to browse instead: the Atlas as a list, and the Library. */
  atlasUrl: string;
  libraryUrl: string;
}

type Load = "loading" | "ready" | "failed";

function keepInUrl(query: string) {
  const url = new URL(window.location.href);
  if (query.trim()) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  window.history.replaceState(null, "", url);
}

export default function SearchPage({ lang, action, indexUrl, atlasUrl, libraryUrl }: Props) {
  const t = useTranslations(lang);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [load, setLoad] = useState<Load>("loading");

  // Read `?q=` once after hydration: the static render has no URL, so setting it during render
  // would not match the server markup.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = new URL(window.location.href).searchParams.get("q");
    if (q) setQuery(q);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    let current = true;
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`${indexUrl}: HTTP error`);
        return response.json() as Promise<SearchIndex>;
      })
      .then((loaded) => {
        if (!current) return;
        setIndex(loaded);
        setLoad("ready");
      })
      .catch(() => current && setLoad("failed"));
    return () => {
      current = false;
    };
  }, [indexUrl]);

  const change = (value: string) => {
    setQuery(value);
    keepInUrl(value);
  };

  const kinds = useMemo(() => (index ? search(index, query) : []), [index, query]);
  const count = kinds.reduce((n, kind) => n + kind.entries.length, 0);
  const asked = query.trim().length > 0;
  const langOf = (phrase: Phrase) => (phrase.lang === lang ? undefined : phrase.lang);
  const marked = (phrase: Phrase) =>
    highlight(phrase.value, query).map((run, i) =>
      run.hit ? (
        <mark key={i} className="search-hit">
          {run.text}
        </mark>
      ) : (
        run.text
      ),
    );

  const summary = !asked
    ? ""
    : load === "loading"
      ? t("search.loading")
      : load === "failed"
        ? t("search.failed")
        : count === 0
          ? t("search.none", { query: query.trim() })
          : count === 1
            ? t("search.resultOne")
            : t("search.results", { count });

  return (
    <>
      <search className="search-form">
        <form action={action} method="get" onSubmit={(event: FormEvent) => event.preventDefault()}>
          <SearchField name="q" value={query} onChange={change} className="field">
            <Label>{t("search.label")}</Label>
            <div className="input-row">
              <Icon name="search" />
              <Input placeholder={t("search.placeholder")} />
              {query && (
                <Button className="icon-button">
                  <Icon name="close" />
                  <span className="visually-hidden">{t("map.clearSearch")}</span>
                </Button>
              )}
            </div>
          </SearchField>
        </form>
        <p className="search-summary tabular" role="status">
          {summary}
        </p>
      </search>

      {kinds.map((kind) => (
        <section key={kind.id} className="search-kind" aria-labelledby={`search-kind-${kind.id}`}>
          <h2 id={`search-kind-${kind.id}`}>
            <span lang={langOf(kind.label)}>{kind.label.value}</span>{" "}
            <span className="search-count tabular">{kind.entries.length}</span>
          </h2>
          <ol className="search-list">
            {kind.entries.map((entry) => (
              <li key={entry.href} className="search-entry">
                <a
                  href={entry.href}
                  className="search-title"
                  lang={langOf(entry.title)}
                  rel={entry.external ? "noopener noreferrer" : undefined}
                >
                  {marked(entry.title)}
                  {entry.external && (
                    <>
                      <Icon name="external" />
                      <span className="visually-hidden">({t("link.external")})</span>
                    </>
                  )}
                </a>
                {entry.context && (
                  <p className="search-context">
                    {entry.context.lead && <span className="search-lead">{entry.context.lead}: </span>}
                    {entry.context.parts.map((part, i) => (
                      <span key={i}>
                        {i > 0 && ", "}
                        <span lang={langOf(part)}>{marked(part)}</span>
                      </span>
                    ))}
                    {entry.context.more && ` ${t("library.more", { n: entry.context.more })}`}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}

      {(!asked || count === 0) && (
        <nav className="search-browse" aria-labelledby="search-browse-head">
          <p id="search-browse-head" className="search-browse-head">
            {t("search.browse")}
          </p>
          <ul>
            <li>
              <a href={atlasUrl}>{t("search.atlasIndex")}</a>
            </li>
            <li>
              <a href={libraryUrl}>{t("library.title")}</a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
