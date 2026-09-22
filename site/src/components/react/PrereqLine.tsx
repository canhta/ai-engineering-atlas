// "Not feeling ready? Needs …" (DESIGN.md → Route sheet): each prerequisite with its tile glyph
// (mapped, ready, or filled by the learner's state after hydration) and a link to its page or
// to the bridge on this page.
import { Fragment } from "react";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { TileGlyph, tileFill } from "../plate/TileGlyph";

export interface PrereqEntry {
  ref: string;
  title: Localized;
  url?: string;
  /** Anchor of the bridge for this prerequisite on the current page. */
  bridgeAnchor?: string;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function PrereqLine({ lang, entries }: { lang: Lang; entries: PrereqEntry[] }) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const parts = new Intl.ListFormat(lang, { type: "conjunction" }).formatToParts(entries.map((e) => e.ref));
  const byRef = new Map(entries.map((e) => [e.ref, e]));
  const bridges = entries.filter((e) => e.bridgeAnchor).length;

  return (
    <p className="prereq-line">
      <span className="prereq-lead">{t("prereq.lead")}</span>{" "}
      {parts.map((part, i) => {
        if (part.type === "literal") return <Fragment key={i}>{part.value}</Fragment>;
        const e = byRef.get(part.value)!;
        const state = progress ? stateOf(progress, e.ref) : null;
        const href = e.url ?? (e.bridgeAnchor ? `#${e.bridgeAnchor}` : undefined);
        const label = (
          <>
            <TileGlyph fill={tileFill(Boolean(e.url), state)} state={e.url ? state : null} />
            <span lang={langOf(e.title, lang)}>{e.title.value}</span>
          </>
        );
        return href ? (
          <a key={i} className="prereq-item" href={href}>
            {label}
          </a>
        ) : (
          <span key={i} className="prereq-item">
            {label}
          </span>
        );
      })}
      {bridges > 0 && <span className="prereq-note"> {bridges === 1 ? t("prereq.bridgeOne") : t("prereq.bridgeMany", { count: bridges })}</span>}
    </p>
  );
}
