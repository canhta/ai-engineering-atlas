// Sources block as a bibliography (DESIGN.md → Route sheet): numbered entries, the exact locator
// first and most prominent, then the source with its type and host, then its purpose, then a personal
// "Opened" mark. Opened marks are not progress and never change a learner state.
import { CheckboxButton, CheckboxField } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { useOpened } from "../../lib/progress-store";
import { Icon } from "./Icon";

export interface BibliographyEntry {
  /** Stable key for the opened mark: item ref, block id, resource. */
  key: string;
  title: string;
  url: string;
  host: string;
  kind?: string;
  locator: Localized;
  purpose: Localized;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function Bibliography({
  lang,
  labelledBy,
  entries,
}: {
  lang: Lang;
  labelledBy: string;
  entries: BibliographyEntry[];
}) {
  const t = useTranslations(lang);
  const [opened, setOpened] = useOpened();
  const count = opened ? entries.filter((e) => opened[e.key]).length : 0;

  return (
    <div className="sources">
      <ol className="bibliography" aria-labelledby={labelledBy}>
        {entries.map((entry, i) => (
          <li key={entry.key} className="bib-entry">
            <span className="bib-num tabular" aria-hidden="true">
              {i + 1}
            </span>
            <p className="bib-locator">
              <span className="visually-hidden">{t("sources.col.locator")}: </span>
              <span lang={langOf(entry.locator, lang)}>{entry.locator.value}</span>
            </p>
            <p className="bib-cite">
              {entry.url ? (
                <a href={entry.url} rel="noopener noreferrer" lang="en" className="bib-title">
                  {entry.title}
                  <Icon name="external" />
                  <span className="visually-hidden">({t("link.external")})</span>
                </a>
              ) : (
                <code className="bib-title">{entry.title}</code>
              )}
              {(entry.kind || entry.host) && (
                <span className="bib-meta" lang="en">
                  {[entry.kind, entry.host].filter(Boolean).join(", ")}
                </span>
              )}
            </p>
            <p className="bib-purpose">
              <span className="bib-purpose-label">{t("sources.col.purpose")}</span>{" "}
              <span lang={langOf(entry.purpose, lang)}>{entry.purpose.value}</span>
            </p>
            <div className="bib-opened">
              <CheckboxField
                isDisabled={opened === null}
                isSelected={Boolean(opened?.[entry.key])}
                onChange={(value) => setOpened(entry.key, value)}
                aria-label={t("sources.openedLabel", { title: entry.title })}
              >
                <CheckboxButton className="checkbox">
                  <span className="box" aria-hidden="true" />
                  <span className="checkbox-text" aria-hidden="true">
                    {t("sources.col.opened")}
                  </span>
                </CheckboxButton>
              </CheckboxField>
            </div>
          </li>
        ))}
      </ol>
      <p className="small muted">
        {opened !== null && (
          <span className="tabular">{t("sources.openedCount", { n: count, total: entries.length })}. </span>
        )}
        {t("sources.openedNote")}
      </p>
    </div>
  );
}
