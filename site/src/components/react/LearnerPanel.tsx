// The learner's state for one competency, the only place states change: recording evidence.
import { useState, type SubmitEvent } from "react";
import { Button, Disclosure, DisclosurePanel, Heading } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import {
  EVIDENCE_KINDS,
  EVIDENCE_STATES,
  INDEPENDENCE,
  recordEvidence,
  stateOf,
  today,
  type EvidenceState,
  type Independence,
  type TargetState,
} from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { Icon } from "./Icon";
import { StateBadge } from "./StateBadge";

const REVIEW = ["self", "peer"] as const;

export default function LearnerPanel({ lang, routeId, target }: { lang: Lang; routeId: string; target: TargetState }) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const entry = progress?.competencies[routeId];
  const state = stateOf(progress, routeId);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!progress) return;
    const form = new FormData(event.currentTarget);
    const supports = form.get("supports") as EvidenceState;
    saveProgress(
      recordEvidence(
        progress,
        routeId,
        {
          kind: String(form.get("kind")),
          supports_state: supports,
          independence: form.get("independence") as Independence,
          review_method: form.get("review") as (typeof REVIEW)[number],
          uri: String(form.get("uri") || "").trim() || undefined,
          note: String(form.get("note")).trim(),
        },
        entry?.target_state ?? target,
        today(),
      ),
    );
    setOpen(false);
    setSaved(t("evidence.saved", { state: t(`state.${supports}`) }));
  };

  return (
    <section className="learner-panel" aria-labelledby="learner-state">
      <div className="panel-row">
        <h2 id="learner-state" className="panel-title">
          {t("state.label")}
        </h2>
        {progress ? <StateBadge state={state} lang={lang} /> : <span className="muted">…</span>}
        <span className="muted small">
          {t("state.target")}: {t(`state.${entry?.target_state ?? target}`)}
        </span>
        {entry?.review_on && (
          <span className="muted small">
            {t("state.nextReview")}: <time dateTime={entry.review_on}>{entry.review_on}</time>
          </span>
        )}
        <Button className="button" isDisabled={!progress} onPress={() => setOpen((v) => !v)} aria-expanded={open}>
          {t("evidence.record")}
        </Button>
      </div>
      {entry && <p className="small next-action">{entry.next_action}</p>}
      <p role="status" className="status-message">
        {saved}
      </p>

      {open && (
        <form className="evidence-form" onSubmit={submit}>
          <p className="muted small">{t("evidence.intro")}</p>
          <div className="form-grid">
            <label className="field">
              <span>{t("evidence.kind")}</span>
              <select name="kind" required defaultValue="implementation">
                {EVIDENCE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`kind.${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("evidence.supports")}</span>
              <select name="supports" required defaultValue="demonstrated">
                {EVIDENCE_STATES.map((s) => (
                  <option key={s} value={s}>
                    {t(`state.${s}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("evidence.independence")}</span>
              <select name="independence" required defaultValue="independent">
                {INDEPENDENCE.map((i) => (
                  <option key={i} value={i}>
                    {t(`independence.${i}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("evidence.review")}</span>
              <select name="review" required defaultValue="self">
                {REVIEW.map((r) => (
                  <option key={r} value={r}>
                    {t(`review.${r}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>{t("evidence.uri")}</span>
            <input name="uri" type="text" inputMode="url" />
          </label>
          <label className="field">
            <span>{t("evidence.note")}</span>
            <textarea name="note" rows={3} required />
          </label>
          <div className="actions">
            <button type="submit" className="button primary">
              {t("evidence.save")}
            </button>
            <button type="button" className="button" onClick={() => setOpen(false)}>
              {t("evidence.cancel")}
            </button>
          </div>
        </form>
      )}

      {entry && entry.evidence.length > 0 && (
        <Disclosure className="timeline">
          <Heading level={3}>
            <Button slot="trigger" className="domain-trigger">
              <Icon name="expand" />
              {t("evidence.timeline", { count: entry.evidence.length })}
            </Button>
          </Heading>
          <DisclosurePanel>
            <ol className="timeline-list" reversed>
              {[...entry.evidence].reverse().map((e) => (
                <li key={e.id}>
                  <time dateTime={e.recorded_at}>{e.recorded_at}</time>
                  <span>{t(`kind.${e.kind}` as never) || e.kind}</span>
                  <StateBadge state={e.supports_state} lang={lang} />
                  <span className="muted small">
                    {t(`independence.${e.independence}`)} · {e.review_method}
                  </span>
                  {e.note && <span className="note">{e.note}</span>}
                  {e.uri && <code className="small">{e.uri}</code>}
                </li>
              ))}
            </ol>
          </DisclosurePanel>
        </Disclosure>
      )}
      <p className="muted small">{t("state.localNote")}</p>
    </section>
  );
}
