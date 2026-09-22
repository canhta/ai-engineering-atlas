// Progress page: counts by state, review queue, evidence summary, and import/export of
// progress.yaml (schemas/progress.schema.json). Counts only demonstrated-or-beyond as done.
import { useState } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import { fromYaml, isDemonstrated, reviewQueue, STATES, today, toYaml, type Progress } from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { mapUrl, routeUrl } from "../../lib/urls";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

interface Props {
  lang: Lang;
  titles: Record<string, string>;
  readyIds: string[];
}

export default function ProgressDashboard({ lang, titles, readyIds }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const en = lang === "en" ? undefined : "en";

  if (!progress) return <p className="muted">…</p>;

  const entries = Object.entries(progress.competencies);
  const done = readyIds.filter((id) => isDemonstrated(progress.competencies[id]?.current_state ?? "unassessed")).length;
  const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<(typeof STATES)[number], number>;
  counts.unassessed = readyIds.filter((id) => !progress.competencies[id]).length;
  for (const [, c] of entries) counts[c.current_state] += 1;
  const queue = reviewQueue(progress, today());

  const exportFile = () => {
    const blob = new Blob([toYaml(progress)], { type: "application/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const result = fromYaml(await file.text());
    setErrors(result.errors);
    setMessage(null);
    setPending(result.progress ?? null);
  };

  return (
    <div className="progress-dashboard">
      <p className="summary">{t("progress.summary", { done, ready: readyIds.length })}</p>

      <h2>{t("progress.byState")}</h2>
      <ul className="state-counts">
        {STATES.map((s) => (
          <li key={s}>
            <StateBadge state={s} lang={lang} />
            <span className="count">{counts[s]}</span>
          </li>
        ))}
      </ul>

      <h2>{t("progress.review")}</h2>
      <p>{t("progress.reviewCounts", { due: queue.due.length, upcoming: queue.upcoming.length })}</p>
      {queue.due.length + queue.upcoming.length > 0 && (
        <>
          <ul>
            {[...queue.due, ...queue.upcoming].map((id) => (
              <li key={id}>
                <a href={routeUrl(lang, id)} lang={en}>
                  {titles[id] ?? id}
                </a>{" "}
                <time className="muted small" dateTime={progress.competencies[id].review_on}>
                  {progress.competencies[id].review_on}
                </time>
              </li>
            ))}
          </ul>
          <p className="muted small">{t("progress.reviewHint")}</p>
        </>
      )}

      <h2>{t("progress.competencies")}</h2>
      {entries.length === 0 ? (
        <p>
          {t("progress.empty")} <a href={mapUrl(lang)}>{t("home.start")}</a>
        </p>
      ) : (
        <div className="table-scroll" role="region" tabIndex={0} aria-label={t("progress.competencies")}>
          <table>
            <thead>
              <tr>
                <th scope="col">{t("map.col.competency")}</th>
                <th scope="col">{t("map.col.state")}</th>
                <th scope="col">{t("state.target")}</th>
                <th scope="col">{t("progress.col.evidence")}</th>
                <th scope="col">{t("progress.col.last")}</th>
                <th scope="col">{t("state.nextReview")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, c]) => (
                <tr key={id}>
                  <td>
                    <a href={routeUrl(lang, id)} lang={en}>
                      {titles[id] ?? id}
                    </a>
                  </td>
                  <td>
                    <StateBadge state={c.current_state} lang={lang} />
                  </td>
                  <td>{t(`state.${c.target_state}`)}</td>
                  <td>{c.evidence.length}</td>
                  <td>{c.evidence.at(-1)?.recorded_at ?? ""}</td>
                  <td>{c.review_on ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>{t("progress.data")}</h2>
      <div className="actions">
        <Button className="button" onPress={exportFile}>
          <Icon name="exportFile" />
          {t("progress.export")}
        </Button>
        <FileTrigger acceptedFileTypes={[".yaml", ".yml", "application/yaml", "text/yaml"]} onSelect={importFile}>
          <Button className="button">
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
              className="button primary"
              onPress={() => {
                saveProgress(pending);
                setPending(null);
                setMessage(t("progress.import.done"));
              }}
            >
              {t("progress.import.replace")}
            </Button>
            <Button className="button" onPress={() => setPending(null)}>
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
      <p role="status" className="status-message">
        {message}
      </p>
      <p className="muted small">{t("state.localNote")}</p>
    </div>
  );
}
