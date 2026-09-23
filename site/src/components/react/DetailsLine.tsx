// Details line (DESIGN.md → Route sheet): one line of facts under a title, in place of tags. Items
// are separated by thin rules on wide screens and read as a comma list on a phone; never middle
// dots. Rendered on the server by the item sheet and inside the Atlas drawer.
import type { ReactNode } from "react";
import { type Lang, useTranslations } from "../../i18n";
import type { Details } from "../../lib/atlas";

export default function DetailsLine({ lang, details, lead }: { lang: Lang; details: Details; lead?: ReactNode }) {
  const t = useTranslations(lang);
  const items: { key: string; node: ReactNode; lang?: string }[] = [
    ...details.facts.map((fact, i) => ({
      key: `fact-${i}`,
      node: fact.value,
      lang: fact.lang === lang ? undefined : fact.lang,
    })),
    ...(details.sources
      ? [
          {
            key: "sources",
            node: details.sources === 1 ? t("details.sourceOne") : t("details.sources", { count: details.sources }),
          },
        ]
      : []),
    ...(details.tasks
      ? [
          {
            key: "tasks",
            node: details.tasks === 1 ? t("details.taskOne") : t("details.tasks", { count: details.tasks }),
          },
        ]
      : []),
  ];
  if (!items.length && !lead) return null;
  return (
    <ul className="details-line" aria-label={t("details.label")}>
      {lead && <li>{lead}</li>}
      {items.map((item) => (
        <li key={item.key} lang={item.lang}>
          {item.node}
        </li>
      ))}
    </ul>
  );
}
