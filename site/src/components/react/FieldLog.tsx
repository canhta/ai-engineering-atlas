// Field log (DESIGN.md → Route sheet): the learner's state for one item and the only place a
// state changes, by recording evidence. Desktop: a sticky, hairline-ruled margin column. Mobile: a bottom
// bar opening the same panel as a sheet (focus trapped, Esc closes, focus returns).
import { type SubmitEvent, useState } from "react";
import { Button, Dialog, Disclosure, DisclosurePanel, Heading, Modal, ModalOverlay } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import { formatDate } from "../../lib/dates";
import {
  EVIDENCE_KINDS,
  EVIDENCE_STATES,
  type EvidenceState,
  INDEPENDENCE,
  type Independence,
  recordEvidence,
  stateOf,
  type TargetState,
  today,
} from "../../lib/progress";
import { useProgress } from "../../lib/progress-store";
import { type GraphItem, NEXT_LIMIT } from "../../lib/recommend";
import type { NextLink } from "../../lib/summaries";
import { Icon } from "./Icon";
import { RouteAdvice } from "./NextSteps";
import { StateBadge } from "./StateBadge";
import { StorageNote } from "./StorageNote";

const REVIEWERS = ["self", "peer"] as const;

interface Props {
  lang: Lang;
  itemRef: string;
  target: TargetState;
  /** Labels of the state vocabulary in this language. */
  stateLabels: Record<string, string>;
  /** The next-step graph and item links, for the recommendation line (src/lib/recommend.ts). */
  graph: GraphItem[];
  links: Record<string, NextLink>;
}

export default function FieldLog(props: Props) {
  const t = useTranslations(props.lang);
  const [progress] = useProgress();
  const [sheet, setSheet] = useState<"closed" | "log" | "form">("closed");
  const state = stateOf(progress, props.itemRef);

  return (
    <>
      <aside className="field-log" aria-labelledby="log-title">
        <LogPanel {...props} idPrefix="log" />
      </aside>

      <div className="log-bar">
        <Button
          className="log-bar-state"
          isDisabled={!progress}
          onPress={() => setSheet("log")}
          aria-label={t("log.open")}
        >
          {progress ? <StateBadge state={state} label={props.stateLabels[state]} /> : <span className="muted">…</span>}
          <Icon name="expand" />
        </Button>
        <Button className="button button-primary" isDisabled={!progress} onPress={() => setSheet("form")}>
          {t("log.record")}
        </Button>
      </div>

      <ModalOverlay
        className="bottom-sheet-overlay"
        isDismissable
        isOpen={sheet !== "closed"}
        onOpenChange={(open) => !open && setSheet("closed")}
      >
        <Modal className="bottom-sheet">
          <Dialog className="bottom-sheet-dialog" aria-labelledby="sheet-title">
            <div className="bottom-sheet-head">
              <span className="bottom-sheet-grip" aria-hidden="true" />
              <Button className="button-quiet" onPress={() => setSheet("closed")}>
                {t("log.close")}
                <Icon name="close" />
              </Button>
            </div>
            <LogPanel {...props} idPrefix="sheet" formInitiallyOpen={sheet === "form"} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}

function LogPanel({
  lang,
  itemRef,
  target,
  stateLabels,
  graph,
  links,
  idPrefix,
  formInitiallyOpen = false,
}: Props & { idPrefix: string; formInitiallyOpen?: boolean }) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [formOpen, setFormOpen] = useState(formInitiallyOpen);
  const [saved, setSaved] = useState<string | null>(null);
  const entry = progress?.competencies[itemRef];
  const state = stateOf(progress, itemRef);
  const id = (name: string) => `${idPrefix}-${name}`;

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!progress) return;
    const form = new FormData(event.currentTarget);
    const supports = form.get("supports") as EvidenceState;
    saveProgress(
      recordEvidence(
        progress,
        itemRef,
        {
          kind: String(form.get("kind")),
          supports_state: supports,
          independence: form.get("independence") as Independence,
          review_method: form.get("reviewer") as (typeof REVIEWERS)[number],
          uri: String(form.get("uri") || "").trim() || undefined,
          note: String(form.get("note")).trim(),
        },
        entry?.target_state ?? target,
        today(),
      ),
    );
    setFormOpen(false);
    setSaved(t("log.saved", { state: stateLabels[supports] }));
  };

  return (
    <div className="log">
      <h2 id={id("title")} className="log-title">
        {t("log.title")}
      </h2>
      <dl className="log-facts">
        <div>
          <dt>{t("log.state")}</dt>
          <dd>
            {progress ? <StateBadge state={state} label={stateLabels[state]} /> : <span className="muted">…</span>}
          </dd>
        </div>
        <div>
          <dt>{t("log.target")}</dt>
          <dd>{stateLabels[entry?.target_state ?? target]}</dd>
        </div>
        <div>
          <dt>{t("log.nextReview")}</dt>
          <dd className="tabular">
            {entry?.review_on ? <time dateTime={entry.review_on}>{formatDate(entry.review_on, lang)}</time> : "—"}
          </dd>
        </div>
      </dl>
      {progress && <p className="log-next">{t(`log.next.${state}`)}</p>}
      {progress && (
        <RouteAdvice lang={lang} itemRef={itemRef} graph={graph} links={links} limit={NEXT_LIMIT} progress={progress} />
      )}

      {!formOpen && (
        <Button className="button button-primary log-record" isDisabled={!progress} onPress={() => setFormOpen(true)}>
          {t("log.record")}
        </Button>
      )}
      <p role="status" className="live-message">
        {saved}
      </p>

      {formOpen && (
        <form className="evidence-form" onSubmit={submit} aria-labelledby={id("form-title")}>
          <h3 id={id("form-title")} className="visually-hidden">
            {t("log.record")}
          </h3>
          <p className="small muted">{t("evidence.intro")}</p>
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
                  {stateLabels[s]}
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
            <span>{t("evidence.reviewer")}</span>
            <select name="reviewer" required defaultValue="self">
              {REVIEWERS.map((r) => (
                <option key={r} value={r}>
                  {t(`reviewer.${r}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("evidence.uri")}</span>
            <input name="uri" type="text" inputMode="url" />
          </label>
          <label className="field">
            <span>{t("evidence.note")}</span>
            <textarea name="note" rows={3} required />
          </label>
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {t("evidence.save")}
            </button>
            <button type="button" className="button-quiet" onClick={() => setFormOpen(false)}>
              {t("evidence.cancel")}
            </button>
          </div>
        </form>
      )}

      {entry && entry.evidence.length > 0 && (
        <Disclosure className="log-timeline">
          <Heading level={3}>
            <Button slot="trigger" className="disclosure-trigger">
              {t("log.evidence", { count: entry.evidence.length })}
              <Icon name="expand" />
            </Button>
          </Heading>
          <DisclosurePanel>
            <ol className="timeline" reversed>
              {[...entry.evidence].reverse().map((e) => (
                <li key={e.id}>
                  <div className="timeline-head">
                    <time className="tabular" dateTime={e.recorded_at}>
                      {formatDate(e.recorded_at, lang)}
                    </time>
                    <span>
                      {(EVIDENCE_KINDS as readonly string[]).includes(e.kind)
                        ? t(`kind.${e.kind as (typeof EVIDENCE_KINDS)[number]}`)
                        : e.kind}
                    </span>
                  </div>
                  <StateBadge state={e.supports_state} label={stateLabels[e.supports_state]} />
                  <span className="chip">{t(`independence.${e.independence}`)}</span>
                  {e.note && <p className="timeline-note">{e.note}</p>}
                  {e.uri && <code className="small">{e.uri}</code>}
                </li>
              ))}
            </ol>
          </DisclosurePanel>
        </Disclosure>
      )}
      <StorageNote lang={lang} className="log-note" />
    </div>
  );
}
