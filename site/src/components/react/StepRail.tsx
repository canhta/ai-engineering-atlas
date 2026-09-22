// Waypoint rail (DESIGN.md → Route sheet): every titled block in order; `step` blocks are
// numbered and show their local status. The current section is marked by a scrollspy.
// Below 1024px the rail collapses into a sticky "Step n of N, <title>" bar with a menu.
import { useEffect, useRef, useState } from "react";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { useDraft, useOpened, useProgress } from "../../lib/progress-store";
import { Icon } from "./Icon";

export interface RailEntry {
  id: string;
  title: Localized;
  /** Step number, when the block is something the learner does. */
  step?: number;
  /** What the status is derived from, by block type. */
  track?: { answers: number } | { opened: string[] } | { evidence: true };
}

interface Props {
  lang: Lang;
  itemRef: string;
  entries: RailEntry[];
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function StepRail({ lang, itemRef, entries }: Props) {
  const t = useTranslations(lang);
  const [progress] = useProgress();
  const [opened] = useOpened();
  const [draft] = useDraft(itemRef);
  const [current, setCurrent] = useState(entries[0]?.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLButtonElement>(null);
  const steps = entries.filter((e) => e.step).length;

  // Scrollspy: the current section is the last one whose top has passed the reading line.
  useEffect(() => {
    const sections = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) visible.add(r.target.id);
          else visible.delete(r.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [entries]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        barRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const entry = progress?.competencies[itemRef];
  const noteOf = (e: RailEntry): string | undefined => {
    const track = e.track;
    if (!track || !progress) return undefined;
    if ("answers" in track) {
      if (entry?.evidence.some((ev) => ev.kind === "diagnostic")) return t("rail.recorded");
      const answered = (draft ?? []).slice(0, track.answers).filter((a) => a?.trim()).length;
      return answered ? t("rail.answered", { n: answered, total: track.answers }) : undefined;
    }
    if ("opened" in track) {
      const n = track.opened.filter((key) => opened?.[key]).length;
      return t("rail.opened", { n, total: track.opened.length });
    }
    const count = entry?.evidence.filter((ev) => ev.kind !== "diagnostic").length ?? 0;
    return count ? t("rail.evidence", { count }) : undefined;
  };

  const active = entries.find((e) => e.id === current) ?? entries[0];
  const barLabel = active?.step ? t("rail.stepOf", { n: active.step, total: steps }) : undefined;

  return (
    <nav className="rail" aria-label={t("rail.label")} data-open={menuOpen || undefined}>
      <button
        ref={barRef}
        type="button"
        className="rail-bar"
        aria-expanded={menuOpen}
        aria-controls="rail-list"
        onClick={() => setMenuOpen((v) => !v)}
      >
        {barLabel && <span className="rail-bar-step tabular">{barLabel}</span>}
        {active && (
          <span className="rail-bar-title" lang={langOf(active.title, lang)}>
            {active.title.value}
          </span>
        )}
        <Icon name="expand" />
      </button>
      <ol className="rail-list" id="rail-list">
        {entries.map((e) => {
          const note = noteOf(e);
          return (
            <li key={e.id} className={e.step ? "is-step" : undefined}>
              <a
                href={`#${e.id}`}
                aria-current={e.id === current ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="rail-num tabular" aria-hidden={e.step ? undefined : true}>
                  {e.step ?? ""}
                </span>
                <span className="rail-text">
                  <span className="rail-title" lang={langOf(e.title, lang)}>
                    {e.title.value}
                  </span>
                  {note && <span className="rail-note">{note}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
