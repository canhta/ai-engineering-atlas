// Learning route table with a personal "Opened" checklist (DESIGN.md → Route page).
// Opened marks are not progress and never change a learner state.
import { CheckboxButton, CheckboxField } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import { useOpened } from "../../lib/progress-store";
import { Icon } from "./Icon";

export interface SourceRow {
  title: string;
  url: string;
  host: string;
  locator: string;
  purpose: string;
}

export default function SourceTable({ lang, routeId, rows }: { lang: Lang; routeId: string; rows: SourceRow[] }) {
  const t = useTranslations(lang);
  const [opened, setOpened] = useOpened();
  const en = lang === "en" ? undefined : "en";

  return (
    <>
      <div className="table-scroll" role="region" tabIndex={0} aria-labelledby="learning-route">
        <table className="source-table">
          <thead>
            <tr>
              <th scope="col">{t("route.col.source")}</th>
              <th scope="col">{t("route.col.locator")}</th>
              <th scope="col">{t("route.col.purpose")}</th>
              <th scope="col">{t("route.col.opened")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const key = `${routeId}#${i}`;
              return (
                <tr key={key}>
                  <td className="source">
                    {row.url ? (
                      <a href={row.url} rel="noopener noreferrer" lang="en" className="external">
                        {row.title}
                        <span className="host">
                          {row.host}
                          <Icon name="external" />
                        </span>
                        <span className="visually-hidden">({t("link.external")})</span>
                      </a>
                    ) : (
                      <code>{row.title}</code>
                    )}
                  </td>
                  <td lang={en}>{row.locator}</td>
                  <td lang={en}>{row.purpose}</td>
                  <td>
                    <CheckboxField
                      isDisabled={opened === null}
                      isSelected={Boolean(opened?.[key])}
                      onChange={(value) => setOpened(key, value)}
                      aria-label={t("route.opened.label", { title: row.title })}
                    >
                      <CheckboxButton className="checkbox">
                        <span className="box" aria-hidden="true" />
                      </CheckboxButton>
                    </CheckboxField>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small">{t("route.opened.note")}</p>
    </>
  );
}
