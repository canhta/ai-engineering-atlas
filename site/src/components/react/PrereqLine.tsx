// "Not feeling ready? Needs …" (DESIGN.md → Route sheet): each prerequisite with its tile glyph
// (mapped, ready, or filled by the learner's state after hydration) and a link to its page or
// to the bridge further down this page. The glyph is hidden from assistive tech, so each entry
// also names its maturity or state in visually hidden text. A catalogue row with many routes
// passes them as groups (one per region), each run in after its region's label.
import { Fragment } from "react";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { type Progress, stateOf } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { TileGlyph, tileFill } from "../plate/TileGlyph";

export interface PrereqEntry {
  ref: string;
  title: Localized;
  url?: string;
  /** Anchor of the bridge for this prerequisite on the current page. */
  bridgeAnchor?: string;
}

export interface PrereqGroup {
  label: Localized;
  entries: PrereqEntry[];
}

interface Props {
  lang: Lang;
  /** Labels of the state vocabulary, from the content model. */
  stateLabels: Record<string, string>;
  lead?: string;
  entries?: PrereqEntry[];
  groups?: PrereqGroup[];
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function PrereqLine({ lang, stateLabels, lead, entries = [], groups }: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const leadText = lead ?? t("prereq.lead");

  if (groups)
    return (
      <div className="prereq-line prereq-grouped">
        <p className="prereq-lead">{leadText}</p>
        <dl className="prereq-groups">
          {groups.map((group) => (
            <div key={group.label.value} className="prereq-group">
              <dt className="prereq-group-label" lang={langOf(group.label, lang)}>
                {group.label.value}
              </dt>
              <dd>
                <Entries lang={lang} entries={group.entries} progress={progress} stateLabels={stateLabels} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );

  return (
    <p className="prereq-line">
      <span className="prereq-lead">{leadText}</span>{" "}
      <Entries lang={lang} entries={entries} progress={progress} stateLabels={stateLabels} />
    </p>
  );
}

function Entries({
  lang,
  entries,
  progress,
  stateLabels,
}: {
  lang: Lang;
  entries: PrereqEntry[];
  progress: Progress | null;
  stateLabels: Record<string, string>;
}) {
  const t = useTranslations(lang);
  const parts = new Intl.ListFormat(lang, { type: "conjunction" }).formatToParts(entries.map((e) => e.ref));
  const byRef = new Map(entries.map((e) => [e.ref, e]));
  return parts.map((part, i) => {
    if (part.type === "literal") return <Fragment key={i}>{part.value}</Fragment>;
    const e = byRef.get(part.value);
    if (!e) return null;
    const state = e.url && progress ? stateOf(progress, e.ref) : null;
    const shown = state && state !== "unassessed" ? state : null;
    const href = e.url ?? (e.bridgeAnchor ? `#${e.bridgeAnchor}` : undefined);
    const spoken = shown
      ? t("prereq.state", { state: stateLabels[shown] ?? shown })
      : t(e.url ? "prereq.ready" : "prereq.mapped");
    const label = (
      <>
        <TileGlyph fill={tileFill(Boolean(e.url), state)} state={e.url ? state : null} />
        <span>
          <span lang={langOf(e.title, lang)}>{e.title.value}</span>
          <span className="visually-hidden">, {spoken}</span>
        </span>
      </>
    );
    return (
      <span key={i} className="prereq-entry">
        {href ? (
          <a className="prereq-item" href={href}>
            {label}
          </a>
        ) : (
          <span className="prereq-item">{label}</span>
        )}
        {e.bridgeAnchor && (
          <>
            {" "}
            <span className="prereq-note">{t("prereq.bridgeHere")}</span>
          </>
        )}
      </span>
    );
  });
}
