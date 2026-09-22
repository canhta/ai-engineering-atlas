// Sources block (DESIGN.md → Route sheet): source with its kind tag, the exact locator, why, and
// a personal "Opened" mark. Opened marks are not progress and never change a learner state.
// On narrow screens each row stacks with inline labels.
import { CheckboxButton, CheckboxField } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { useOpened } from "../../lib/progress-store";
import { Icon } from "./Icon";

export interface SourceTableRow {
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

export default function SourceTable({
  lang,
  labelledBy,
  rows,
}: {
  lang: Lang;
  labelledBy: string;
  rows: SourceTableRow[];
}) {
  const t = useTranslations(lang);
  const [opened, setOpened] = useOpened();
  const count = opened ? rows.filter((r) => opened[r.key]).length : 0;

  return (
    <div className="sources">
      <table className="sources-table" aria-labelledby={labelledBy}>
        <thead>
          <tr>
            <th scope="col">{t("sources.col.resource")}</th>
            <th scope="col">{t("sources.col.locator")}</th>
            <th scope="col">{t("sources.col.purpose")}</th>
            <th scope="col">{t("sources.col.opened")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="sources-cell">
                {row.url ? (
                  <a href={row.url} rel="noopener noreferrer" lang="en" className="sources-link">
                    <span className="sources-title">{row.title}</span>
                    <span className="visually-hidden">({t("link.external")})</span>
                  </a>
                ) : (
                  <code>{row.title}</code>
                )}
                <span className="sources-meta">
                  {row.kind && (
                    <span className="chip chip-kind" lang="en">
                      {row.kind}
                    </span>
                  )}
                  {row.host && (
                    <span className="sources-host">
                      {row.host}
                      <Icon name="external" />
                    </span>
                  )}
                </span>
              </td>
              <td className="locator-cell" data-label={t("sources.col.locator")} lang={langOf(row.locator, lang)}>
                {row.locator.value}
              </td>
              <td className="purpose-cell" data-label={t("sources.col.purpose")} lang={langOf(row.purpose, lang)}>
                {row.purpose.value}
              </td>
              <td className="opened-cell">
                <CheckboxField
                  isDisabled={opened === null}
                  isSelected={Boolean(opened?.[row.key])}
                  onChange={(value) => setOpened(row.key, value)}
                  aria-label={t("sources.openedLabel", { title: row.title })}
                >
                  <CheckboxButton className="checkbox">
                    <span className="box" aria-hidden="true" />
                    <span className="checkbox-text" aria-hidden="true">
                      {t("sources.col.opened")}
                    </span>
                  </CheckboxButton>
                </CheckboxField>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">
        {opened !== null && (
          <span className="tabular">{t("sources.openedCount", { n: count, total: rows.length })}. </span>
        )}
        {t("sources.openedNote")}
      </p>
    </div>
  );
}
