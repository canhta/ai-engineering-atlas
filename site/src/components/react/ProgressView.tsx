// Progress (DESIGN.md → Progress): states only from recorded evidence. Summary, the plate in
// progress mode with a counted legend, the review queue, evidence rows, and progress.yaml
// export/import (schemas/progress.schema.json). Only demonstrated-or-beyond counts as done.
import { useState } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { fromYaml, isDemonstrated, reviewQueue, STATES, today, toYaml, type Progress, type State } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { NEXT_LIMIT, type GraphItem } from "../../lib/recommend";
import type { ItemDetail, NextLink, RegionData } from "../../lib/summaries";
import Plate from "../plate/Plate";
import PlateLegend from "../plate/PlateLegend";
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

export default function ProgressView({ lang, atlasUrl, regions, details, stateLabels, graph, links }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const readyRefs = regions.flatMap((r) => r.tiles.filter((tile) => tile.href).map((tile) => tile.ref));
  const entries = Object.entries(progress?.competencies ?? {});
  const stateOfRef = (ref: string): State => progress?.competencies[ref]?.current_state ?? "unassessed";
  const done = readyRefs.filter((ref) => isDemonstrated(stateOfRef(ref))).length;
  const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<State, number>;
  for (const ref of readyRefs) counts[stateOfRef(ref)] += 1;
  const queue = progress ? reviewQueue(progress, today()) : { due: [], upcoming: [] };

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
    const blob = new Blob([toYaml(progress)], { type: "application/yaml" });
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
      <p className="summary tabular" role="status">
        {progress ? t("progress.summary", { done, ready: readyRefs.length }) : "…"}
      </p>
      <PlateLegend lang={lang} counts={progress ? counts : null} stateLabels={stateLabels} />

      <div className="progress-grid">
        <div className="progress-plate">
          <Plate lang={lang} mode="progress" regions={regions} stateLabels={stateLabels} atlasUrl={atlasUrl} />
          <p className="muted small">{t("progress.mappedNote")}</p>
        </div>

        <div className="progress-side">
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
                        {t("progress.dueOn", { date: when ?? "" })}
                      </time>
                      {detail?.href && (
                        <a className="pill pill-primary" href={`${detail.href}#${detail.diagnosticAnchor ?? ""}`}>
                          {t("progress.startReview")}
                          <span className="pill-icon">
                            <Icon name="forward" />
                          </span>
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
        </div>
      </div>

      <h2>{t("progress.withEvidence")}</h2>
      {progress && entries.length === 0 ? (
        <div className="empty">
          <p>{t("progress.empty")}</p>
          <a className="pill pill-primary" href={`${atlasUrl}?ready=1`}>
            {t("home.start")}
            <span className="pill-icon">
              <Icon name="forward" />
            </span>
          </a>
        </div>
      ) : (
        <div className="table-scroll" role="region" tabIndex={0} aria-label={t("progress.withEvidence")}>
          <table className="evidence-table">
            <thead>
              <tr>
                <th scope="col">{t("progress.col.item")}</th>
                <th scope="col">{t("log.state")}</th>
                <th scope="col">{t("log.target")}</th>
                <th scope="col">{t("progress.col.evidence")}</th>
                <th scope="col">{t("progress.col.last")}</th>
                <th scope="col">{t("log.nextReview")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([ref, entry]) => (
                <tr key={ref}>
                  <td>{link(ref)}</td>
                  <td>
                    <StateBadge state={entry.current_state} label={stateLabels[entry.current_state]} />
                  </td>
                  <td>{stateLabels[entry.target_state]}</td>
                  <td className="tabular">{entry.evidence.length}</td>
                  <td className="tabular">{entry.evidence.at(-1)?.recorded_at ?? ""}</td>
                  <td className="tabular">{entry.review_on ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>{t("progress.data")}</h2>
      <div className="actions">
        <Button className="pill" isDisabled={!progress} onPress={exportFile}>
          <Icon name="exportFile" />
          {t("progress.export")}
        </Button>
        <FileTrigger acceptedFileTypes={[".yaml", ".yml", "application/yaml", "text/yaml"]} onSelect={importFile}>
          <Button className="pill" isDisabled={!progress}>
            <Icon name="importFile" />
            {t("progress.import")}
          </Button>
        </FileTrigger>
      </div>
      {pending && (
        <div className="confirm" role="alert">
          <p>{t("progress.import.confirm", { current: entries.length, incoming: Object.keys(pending.competencies).length })}</p>
          <div className="actions">
            <Button
              className="pill pill-primary"
              onPress={() => {
                saveProgress(pending);
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
    </div>
  );
}
