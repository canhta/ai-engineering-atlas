// Home: ready routes by group as compact rows (title, level, number of sources, your state).
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { StateBadge } from "./StateBadge";

export interface ReadyGroup {
  value: string;
  label: Localized;
  rows: { ref: string; title: Localized; href: string; chips: string[]; sources: number }[];
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function ReadyRows({
  lang,
  groups,
  stateLabels,
}: {
  lang: Lang;
  groups: ReadyGroup[];
  stateLabels: Record<string, string>;
}) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  return (
    <div className="ready-groups">
      {groups.map((g) => (
        <section key={g.value} className="ready-group" aria-labelledby={`ready-${g.value}`}>
          <h3 id={`ready-${g.value}`} lang={langOf(g.label, lang)}>
            {g.label.value}
          </h3>
          <ul className="ready-rows">
            {g.rows.map((row) => {
              const state = progress ? stateOf(progress, row.ref) : null;
              return (
                <li key={row.ref}>
                  <a href={row.href} lang={langOf(row.title, lang)}>
                    {row.title.value}
                  </a>
                  <span className="ready-meta">
                    {row.chips.map((chip) => (
                      <span className="chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                    <span className="muted small tabular">
                      {row.sources === 1 ? t("drawer.sourceOne") : t("drawer.sources", { count: row.sources })}
                    </span>
                    <span className="ready-state">
                      {state && <StateBadge state={state} label={stateLabels[state]} />}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
