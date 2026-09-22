// Progress page: counts by state, review queue, evidence summary, and import/export of
// progress.yaml (schemas/progress.schema.json). Counts only demonstrated-or-beyond as done.
// (Milestone 2 adds the plate in progress mode; DESIGN.md → Progress.)
import { useState } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { fromYaml, isDemonstrated, reviewQueue, STATES, today, toYaml, type Progress } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { mapUrl } from "../../lib/urls";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

interface Props {
  lang: Lang;
  items: Record<string, { title: Localized; href?: string }>;
  readyRefs: string[];
  stateLabels: Record<string, string>;
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function ProgressDashboard({ lang, items, readyRefs, stateLabels }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  if (!progress) return <p className="muted">…</p>;

  const entries = Object.entries(progress.competencies);
  const done = readyRefs.filter((id) => isDemonstrated(progress.competencies[id]?.current_state ?? "unassessed")).length;
  const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<(typeof STATES)[number], number>;
  counts.unassessed = readyRefs.filter((id) => !progress.competencies[id]).length;
  for (const [, entry] of entries) counts[entry.current_state] += 1;
  const queue = reviewQueue(progress, today());

  const link = (id: string) => {
    const item = items[id];
    const title = item?.title ?? { value: id, lang: "en" as const };
    return item?.href ? (
      <a href={item.href} lang={langOf(title, lang)}>
        {title.value}
      </a>
    ) : (
      <span lang={langOf(title, lang)}>{title.value}</span>
    );
  };

  const exportFile = () => {
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
    <div className="progress-dashboard">
      <p className="summary tabular">{t("progress.summary", { done, ready: readyRefs.length })}</p>

      <h2>{t("progress.byState")}</h2>
      <ul className="state-counts">
        {STATES.map((s) => (
          <li key={s}>
            <StateBadge state={s} label={stateLabels[s]} />
            <span className="count tabular">{counts[s]}</span>
          </li>
        ))}
      </ul>

      <h2>{t("progress.queue")}</h2>
      <p className="tabular">{t("progress.queueCounts", { due: queue.due.length, upcoming: queue.upcoming.length })}</p>
      {queue.due.length + queue.upcoming.length > 0 && (
        <>
          <ul>
            {[...queue.due, ...queue.upcoming].map((id) => (
              <li key={id}>
                {link(id)}{" "}
                <time className="muted small tabular" dateTime={progress.competencies[id].review_on}>
                  {progress.competencies[id].review_on}
                </time>
              </li>
            ))}
          </ul>
          <p className="muted small">{t("progress.queueHint")}</p>
        </>
      )}

      <h2>{t("progress.withEvidence")}</h2>
      {entries.length === 0 ? (
        <p>
          {t("progress.empty")} <a href={mapUrl(lang)}>{t("home.start")}</a>
        </p>
      ) : (
        <div className="table-scroll" role="region" tabIndex={0} aria-label={t("progress.withEvidence")}>
          <table>
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
              {entries.map(([id, entry]) => (
                <tr key={id}>
                  <td>{link(id)}</td>
                  <td>
                    <StateBadge state={entry.current_state} label={stateLabels[entry.current_state]} />
                  </td>
                  <td>{stateLabels[entry.target_state]}</td>
                  <td className="tabular">{entry.evidence.length}</td>
                  <td className="tabular">{entry.evidence.at(-1)?.recorded_at ?? ""}</td>
                  <td className="tabular">{entry.review_on ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>{t("progress.data")}</h2>
      <div className="actions">
        <Button className="pill" onPress={exportFile}>
          <Icon name="exportFile" />
          {t("progress.export")}
        </Button>
        <FileTrigger acceptedFileTypes={[".yaml", ".yml", "application/yaml", "text/yaml"]} onSelect={importFile}>
          <Button className="pill">
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
      <p className="muted small">{t("log.localNote")}</p>
    </div>
  );
}
