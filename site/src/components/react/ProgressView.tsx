// Progress (DESIGN.md → Progress): a field logbook. The summary and a bar per domain on top, then the
// evidence log (every record once, newest first, read-only: states move only when evidence is
// recorded on a route); the margin holds next steps, the review queue, and progress.yaml
// export/import (schemas/progress.schema.json). Only demonstrated-or-beyond counts as done. The tile
// grid belongs to the Atlas: repeating it here would make the two pages read as one.
import { useState } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { formatDate } from "../../lib/dates";
import {
  EVIDENCE_KINDS,
  evidenceLog,
  fromYaml,
  isDemonstrated,
  type Progress,
  REVIEW_METHODS,
  reviewQueue,
  STATES,
  type State,
  today,
  toYaml,
} from "../../lib/progress";
import { allLabFormAnswers, useProgress, writeLabFormAnswers } from "../../lib/progress-store";
import { type GraphItem, NEXT_LIMIT } from "../../lib/recommend";
import type { ItemDetail, NextLink, RegionData } from "../../lib/summaries";
import PlateLegend from "../plate/PlateLegend";
import { TileGlyph, tileFill } from "../plate/TileGlyph";
import RegionBars from "./RegionBars";
import { Icon } from "./Icon";
import NextSteps from "./NextSteps";
import { StateBadge } from "./StateBadge";
import { StorageNote } from "./StorageNote";

interface Props {
  lang: Lang;
  atlasUrl: string;
  regions: RegionData[];
  details: Record<string, ItemDetail>;
  stateLabels: Record<string, string>;
  graph: GraphItem[];
  links: Record<string, NextLink>;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

/** A note's first ~160 characters, cut at a word: the log is an index of records, not their full text. */
const EXCERPT = 160;
function excerpt(note: string): string {
  const text = note.trim().replace(/\s+/g, " ");
  if (text.length <= EXCERPT) return text;
  const cut = text.slice(0, EXCERPT);
  const space = cut.lastIndexOf(" ");
  return `${space > 0 ? cut.slice(0, space) : cut}…`;
}

export default function ProgressView({ lang, atlasUrl, regions, details, stateLabels, graph, links }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const readyRefs = regions.flatMap((r) => r.tiles.filter((tile) => tile.href).map((tile) => tile.ref));
  const entries = Object.entries(progress?.competencies ?? {});
  const log = evidenceLog(progress);
  const stateOfRef = (ref: string): State => progress?.competencies[ref]?.current_state ?? "unassessed";
  const done = readyRefs.filter((ref) => isDemonstrated(stateOfRef(ref))).length;
  const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<State, number>;
  for (const ref of readyRefs) counts[stateOfRef(ref)] += 1;
  const queue = progress ? reviewQueue(progress, today()) : { due: [], upcoming: [] };

  // A file may carry a kind the site has no label for; show it as written.
  const kindLabel = (kind: string) =>
    (EVIDENCE_KINDS as readonly string[]).includes(kind) ? t(`kind.${kind as (typeof EVIDENCE_KINDS)[number]}`) : kind;
  const methodLabel = (method: string) =>
    (REVIEW_METHODS as readonly string[]).includes(method)
      ? t(`method.${method as (typeof REVIEW_METHODS)[number]}`)
      : method;
  const title = (ref: string) => details[ref]?.title ?? { value: ref, lang: "en" as const };
  const link = (ref: string) => {
    const detail = details[ref];
    const text = title(ref);
    return detail?.href ? (
      <a href={detail.href} lang={langOf(text, lang)}>
        {text.value}
      </a>
    ) : (
      <span lang={langOf(text, lang)}>{text.value}</span>
    );
  };

  const exportFile = () => {
    if (!progress) return;
    // Decision-lab drafts live in their own storage entries; fold them in so they travel with the export.
    const labForms = allLabFormAnswers();
    const withForms = Object.keys(labForms).length > 0 ? { ...progress, lab_forms: labForms } : progress;
    const blob = new Blob([toYaml(withForms)], { type: "application/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (picked: FileList | null) => {
    const file = picked?.[0];
    if (!file) return;
    const result = fromYaml(await file.text());
    setErrors(result.errors);
    setMessage(null);
    setPending(result.progress ?? null);
  };

  return (
    <div className="progress-view">
      <div className="progress-main">
        <p className="summary tabular" role="status">
          {progress ? t("progress.summary", { done, ready: readyRefs.length }) : "…"}
        </p>
        <PlateLegend lang={lang} counts={progress ? counts : null} stateLabels={stateLabels} />
        <RegionBars
          lang={lang}
          atlasUrl={atlasUrl}
          regions={regions}
          stateOf={stateOfRef}
          stateLabels={stateLabels}
          loaded={progress !== null}
        />

        <section className="evidence-log" aria-labelledby="log-heading">
          <h2 id="log-heading">{t("progress.log")}</h2>
          {progress && log.length === 0 ? (
            <div className="empty">
              <p>{t("progress.empty")}</p>
              <a className="button button-primary" href={`${atlasUrl}?ready=1`}>
                {t("home.start")}
              </a>
            </div>
          ) : (
            <>
              <p className="log-count muted small tabular">
                {progress && (log.length === 1 ? t("progress.logOne") : t("progress.logCount", { count: log.length }))}
              </p>
              <ol className="log-entries">
                {log.map(({ ref, evidence: e }, i) => (
                  <li key={`${ref}/${e.id}`} className="log-entry">
                    {/* A day's date is printed once, as in a logbook; later entries keep it for screen readers. */}
                    <time
                      className={`entry-date tabular${log[i - 1]?.evidence.recorded_at === e.recorded_at ? " is-same-day" : ""}`}
                      dateTime={e.recorded_at}
                    >
                      {formatDate(e.recorded_at, lang)}
                    </time>
                    <div className="entry-body">
                      <p className="entry-title">
                        <TileGlyph fill={tileFill(true, stateOfRef(ref))} state={stateOfRef(ref)} />
                        {link(ref)}
                      </p>
                      <ul className="details-line entry-facts" aria-label={t("progress.entryFacts")}>
                        <li>
                          <span className="muted">{t("progress.supports")}</span>{" "}
                          <StateBadge state={e.supports_state} label={stateLabels[e.supports_state]} />
                        </li>
                        <li>{kindLabel(e.kind)}</li>
                        <li>{methodLabel(e.review_method)}</li>
                      </ul>
                      {e.note && <p className="entry-note">{excerpt(e.note)}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </div>

      <div className="progress-margin">
        <NextSteps lang={lang} graph={graph} links={links} limit={NEXT_LIMIT} due={false} />
        <section className="progress-queue" aria-labelledby="queue-title">
          <h2 id="queue-title">{t("progress.queue")}</h2>
          <p className="queue-counts tabular">
            <span>
              {t("progress.dueToday")} <strong>{queue.due.length}</strong>
            </span>
            <span>
              {t("progress.nextWeek")} <strong>{queue.upcoming.length}</strong>
            </span>
          </p>
          {queue.due.length + queue.upcoming.length > 0 ? (
            <>
              <ul className="queue-rows">
                {[...queue.due, ...queue.upcoming].map((ref) => {
                  const detail = details[ref];
                  const when = progress?.competencies[ref]?.review_on;
                  return (
                    <li key={ref}>
                      {link(ref)}
                      <time className="muted small tabular" dateTime={when}>
                        {t("progress.dueOn", { date: when ? formatDate(when, lang) : "" })}
                      </time>
                      {detail?.href && (
                        <a className="button" href={`${detail.href}#${detail.diagnosticAnchor ?? ""}`}>
                          {t("progress.startReview")}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="muted small">{t("progress.queueHint")}</p>
            </>
          ) : (
            <p className="muted">{t("progress.queueEmpty")}</p>
          )}
        </section>

        <section className="progress-data" aria-labelledby="data-title">
          <h2 id="data-title">{t("progress.data")}</h2>
          <div className="data-actions">
            <Button className="button" isDisabled={!progress} onPress={exportFile}>
              <Icon name="exportFile" />
              {t("progress.export")}
            </Button>
            <FileTrigger acceptedFileTypes={[".yaml", ".yml", "application/yaml", "text/yaml"]} onSelect={importFile}>
              <Button className="button" isDisabled={!progress}>
                <Icon name="importFile" />
                {t("progress.import")}
              </Button>
            </FileTrigger>
          </div>
          {pending && (
            <div className="confirm" role="alert">
              <p>
                {t("progress.import.confirm", {
                  current: entries.length,
                  incoming: Object.keys(pending.competencies).length,
                })}
              </p>
              <div className="actions">
                <Button
                  className="button button-primary"
                  onPress={() => {
                    // Decision-lab drafts get their own storage entry (guarded like other lab drafts);
                    // the main progress record keeps only evidence and state.
                    const { lab_forms: labForms, ...rest } = pending;
                    saveProgress(rest);
                    for (const [labRef, answers] of Object.entries(labForms ?? {})) {
                      writeLabFormAnswers(labRef, answers);
                    }
                    setPending(null);
                    setMessage(t("progress.import.done"));
                  }}
                >
                  {t("progress.import.replace")}
                </Button>
                <Button className="button-quiet" onPress={() => setPending(null)}>
                  {t("evidence.cancel")}
                </Button>
              </div>
            </div>
          )}
          {errors.length > 0 && (
            <div className="confirm" role="alert">
              <p>{t("progress.import.errors")}</p>
              <ul>
                {errors.map((e) => (
                  <li key={e}>
                    <code>{e}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p role="status" className="live-message">
            {message}
          </p>
          <StorageNote lang={lang} note="progress.localNote" />
        </section>
      </div>
    </div>
  );
}
