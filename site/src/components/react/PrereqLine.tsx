// "Not feeling ready? Needs …" (DESIGN.md → Route sheet): each prerequisite with its tile glyph
// (mapped, ready, or filled by the learner's state after hydration) and a link to its page or
// to the bridge on this page.
import { Fragment } from "react";
import { type Lang, useTranslations } from "../../i18n";
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

export default function PrereqLine({ lang, entries, lead }: { lang: Lang; entries: PrereqEntry[]; lead?: string }) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const parts = new Intl.ListFormat(lang, { type: "conjunction" }).formatToParts(entries.map((e) => e.ref));
  const byRef = new Map(entries.map((e) => [e.ref, e]));

  return (
    <p className="prereq-line">
      <span className="prereq-lead">{lead ?? t("prereq.lead")}</span>{" "}
      {parts.map((part, i) => {
        if (part.type === "literal") return <Fragment key={i}>{part.value}</Fragment>;
        const e = byRef.get(part.value);
        if (!e) return null;
        const state = progress ? stateOf(progress, e.ref) : null;
        const href = e.url ?? (e.bridgeAnchor ? `#${e.bridgeAnchor}` : undefined);
        const label = (
          <>
            <TileGlyph fill={tileFill(Boolean(e.url), state)} state={e.url ? state : null} />
            <span lang={langOf(e.title, lang)}>{e.title.value}</span>
          </>
        );
        return (
          <Fragment key={i}>
            {href ? (
              <a className="prereq-item" href={href}>
                {label}
              </a>
            ) : (
              <span className="prereq-item">{label}</span>
            )}
            {e.bridgeAnchor && <span className="prereq-note">{t("prereq.bridge")}</span>}
          </Fragment>
        );
      })}
    </p>
  );
}
