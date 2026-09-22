// Library (DESIGN.md → Library): every source the atlas routes through, searchable, with the
// routes that cite it and the exact locator. Search and filtering run here; the list is rendered
// on the server, so it reads and links before hydration.
import { useMemo, useState } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { LibraryEntry } from "../../lib/summaries";
import { Icon } from "./Icon";

interface Props {
  lang: Lang;
  entries: LibraryEntry[];
  /** Vocabulary labels for a resource type, from the content model. */
  kindLabels: Record<string, string>;
}

export default function LibraryList({ lang, entries, kindLabels }: Props) {
  const t = useTranslations(lang);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");

  const kinds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) if (entry.kind) counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [entries]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => (!kind || entry.kind === kind) && (!needle || entry.haystack.includes(needle)));
  }, [entries, query, kind]);

  return (
    <>
      <search className="library-filters">
        <SearchField value={query} onChange={setQuery} className="field">
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
        <div className="library-kinds" role="group" aria-label={t("library.kind")}>
          <Button className={kind ? "chip-button" : "chip-button is-on"} onPress={() => setKind("")}>
            {t("library.allKinds")}
          </Button>
          {kinds.map(([name, count]) => (
            <Button
              key={name}
              className={kind === name ? "chip-button is-on" : "chip-button"}
              onPress={() => setKind(kind === name ? "" : name)}
            >
              {kindLabels[name] ?? name} <span className="tabular">{count}</span>
            </Button>
          ))}
        </div>
      </search>

      <p className="results tabular" role="status">
        {t("library.results", { shown: shown.length, total: entries.length })}
      </p>

      {shown.length === 0 ? (
        <div className="empty">
          <p>{t("library.noResults")}</p>
          <Button
            className="pill"
            onPress={() => {
              setQuery("");
              setKind("");
            }}
          >
            {t("map.clear")}
          </Button>
        </div>
      ) : (
        <ul className="library">
          {shown.map((entry) => (
            <li key={entry.key}>
              <div className="library-head">
                <a href={entry.url} rel="noopener" lang="en">
                  {entry.title}
                  <Icon name="external" />
                </a>
                {entry.kind && <span className="chip">{kindLabels[entry.kind] ?? entry.kind}</span>}
              </div>
              <p className="muted small">{[entry.author, entry.host].filter(Boolean).join(" · ")}</p>
              <ul className="library-citations">
                {entry.citations.map((citation) => (
                  <li key={`${citation.ref}-${citation.locator?.value ?? ""}`}>
                    {citation.url ? (
                      <a href={citation.url} lang={citation.title.lang === lang ? undefined : citation.title.lang}>
                        {citation.title.value}
                      </a>
                    ) : (
                      <span lang={citation.title.lang === lang ? undefined : citation.title.lang}>
                        {citation.title.value}
                      </span>
                    )}
                    {citation.locator && (
                      <span className="library-locator" lang={citation.locator.lang === lang ? undefined : "en"}>
                        {citation.locator.value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
