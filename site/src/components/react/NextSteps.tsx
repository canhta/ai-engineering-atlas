// Next step (DESIGN.md → Next step): the deterministic recommendation from src/lib/recommend.ts,
// shown as a ranked list (Home, Progress) or as one line in a route's field log. Advice only:
// nothing here changes a state.
import { Fragment } from "react";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { formatDate } from "../../lib/dates";
import { stateOf, today, type Progress } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { adviceFor, hasEvidence, plan, recommend, type GraphItem, type Recommendation } from "../../lib/recommend";
import type { NextLink } from "../../lib/summaries";
import { TileGlyph, tileFill } from "../plate/TileGlyph";

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

function useReason(lang: Lang) {
  const t = useTranslations(lang);
  return (r: Recommendation) => t(`next.reason.${r.reason}`, { date: r.due ? formatDate(r.due, lang) : "" });
}

interface ListProps {
  lang: Lang;
  graph: GraphItem[];
  links: Record<string, NextLink>;
  limit: number;
  /** Home shows the list only once the learner has recorded evidence; Progress always does. */
  onlyWithEvidence?: boolean;
  /** Include items whose check is due; Progress leaves them to the review queue beside it. */
  due?: boolean;
}

/** Ranked next steps, each linking to its route (or to the diagnostic when a check is due). */
export default function NextSteps({ lang, graph, links, limit, onlyWithEvidence = false, due = true }: ListProps) {
  const t = useTranslations(lang);
  const reason = useReason(lang);
  const [progress] = useProgress();
  if (!progress || (onlyWithEvidence && !hasEvidence(progress))) return null;
  const next = recommend(graph, progress, today(), limit, { due });

  return (
    <section className="next-steps" aria-labelledby="next-title">
      <h2 id="next-title" className="next-title">
        {t("next.title")}
      </h2>
      {next.length === 0 ? (
        <p className="muted">{t("next.empty")}</p>
      ) : (
        <ol className="next-rows">
          {next.map((r, i) => {
            const link = links[r.id];
            const title = link?.title ?? { value: r.id, lang: "en" as const };
            const href = r.reason === "due" ? link?.check : link?.href;
            return (
              <li key={r.id}>
                <span className="next-num tabular" aria-hidden="true">
                  {i + 1}
                </span>
                <a className="next-item" href={href}>
                  <TileGlyph fill={tileFill(true, stateOf(progress, r.id))} state={stateOf(progress, r.id)} />
                  <span lang={langOf(title, lang)}>{title.value}</span>
                </a>
                <span className="next-reason">{reason(r)}</span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="muted small">{t("next.note")}</p>
    </section>
  );
}

/** The field log's line: whether this route is a recommended next step and why, or what to learn first. */
export function RouteAdvice({
  lang,
  itemRef,
  graph,
  links,
  limit,
  progress,
}: {
  lang: Lang;
  itemRef: string;
  graph: GraphItem[];
  links: Record<string, NextLink>;
  limit: number;
  progress: Progress;
}) {
  const t = useTranslations(lang);
  const reason = useReason(lang);
  const result = plan(graph, progress, today());
  const { next, blocked } = adviceFor(result, itemRef);
  const position = next ? result.next.indexOf(next) + 1 : 0;

  if (next && position <= limit) {
    return (
      <p className="log-advice">
        <strong>{t("next.recommended", { n: position, total: Math.min(limit, result.next.length) })}</strong> {reason(next)}
      </p>
    );
  }
  if (!blocked) return null;
  const parts = new Intl.ListFormat(lang, { type: "conjunction" }).formatToParts(blocked.prerequisites);
  return (
    <p className="log-advice">
      <strong>{t("next.blocked")}</strong>{" "}
      {parts.map((part, i) => {
        if (part.type === "literal") return <Fragment key={i}>{part.value}</Fragment>;
        const link = links[part.value];
        const title = link?.title ?? { value: part.value, lang: "en" as const };
        return link?.href ? (
          <a key={i} href={link.href} lang={langOf(title, lang)}>
            {title.value}
          </a>
        ) : (
          <span key={i}>
            <span lang={langOf(title, lang)}>{title.value}</span> <span className="muted">({t("prereq.mapped")})</span>
          </span>
        );
      })}
    </p>
  );
}
