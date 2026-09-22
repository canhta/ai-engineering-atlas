// Diagnostic block (DESIGN.md → Route sheet): one task per card, "Task n of N"; after the last
// task, the pass condition, a self-assessment, and Record result. Attempt first: the pass
// condition stays hidden until every task has an answer. Recording writes diagnostic evidence.
import { useEffect, useRef, useState } from "react";
import { Button, Label, RadioButton, RadioField, RadioGroup, TextArea, TextField } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import type { Localized } from "../../lib/atlas";
import { recordEvidence, today, type TargetState } from "../../lib/progress";
import { useDraft, useProgress } from "../../lib/progress-store";
import { Icon } from "./Icon";

type Result = "meets" | "partial" | "notYet";

export interface NextLink {
  id: string;
  title: Localized;
}

interface Props {
  lang: Lang;
  itemRef: string;
  target: TargetState;
  tasks: Localized[];
  passCondition: Localized;
  /** Where to go after recording: when the pass condition is met, and when it is not. */
  next: { meets?: NextLink; gap?: NextLink };
}

const langOf = (text: Localized, page: Lang) => (text.lang === page ? undefined : text.lang);

export default function Diagnostic({ lang, itemRef, target, tasks, passCondition, next }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [draft, saveDraft] = useDraft(itemRef);
  const [phase, setPhase] = useState<number | "compare">(0);
  const [result, setResult] = useState<Result | null>(null);
  const [recorded, setRecorded] = useState<Result | null>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const setFocusTarget = (el: HTMLElement | null) => {
    focusTarget.current = el;
  };
  const moved = useRef(false);

  const answers = tasks.map((_, i) => draft?.[i] ?? "");
  const complete = answers.every((a) => a.trim().length > 0);
  const hydrated = draft !== null && progress !== null;

  // Move focus to the new card after the learner navigates (not on first render).
  useEffect(() => {
    if (moved.current) focusTarget.current?.focus();
  }, [phase]);

  const go = (to: number | "compare") => {
    moved.current = true;
    setPhase(to);
  };

  const setAnswer = (i: number, value: string) => {
    const nextAnswers = [...answers];
    nextAnswers[i] = value;
    saveDraft(nextAnswers);
  };

  const record = () => {
    if (!progress || !result) return;
    saveProgress(
      recordEvidence(
        progress,
        itemRef,
        {
          kind: "diagnostic",
          // Meeting the pass condition skips introductory material; only exit evidence demonstrates.
          supports_state: result === "meets" ? "learning" : "gap",
          independence: "independent",
          review_method: "self",
          note: `Diagnostic self-assessed as "${result}" against the pass condition.`,
        },
        target,
        today(),
      ),
    );
    setRecorded(result);
  };

  if (phase !== "compare") {
    const i = phase;
    const prompt = tasks[i];
    const last = i === tasks.length - 1;
    return (
      <div className="diag">
        <div className="diag-card">
          <p className="diag-count tabular" ref={setFocusTarget} tabIndex={-1}>
            {t("diag.taskOf", { n: i + 1, total: tasks.length })}
          </p>
          <p className="reading diag-prompt" lang={langOf(prompt, lang)}>
            {prompt.value}
          </p>
          <TextField className="field" value={answers[i]} onChange={(v) => setAnswer(i, v)} isDisabled={!hydrated}>
            <Label className="visually-hidden">{t("diag.answer", { n: i + 1 })}</Label>
            <TextArea rows={5} placeholder={t("diag.placeholder")} />
          </TextField>
          <div className="diag-actions">
            {i > 0 && (
              <Button className="button-quiet" onPress={() => go(i - 1)}>
                <Icon name="back" />
                {t("diag.previous")}
              </Button>
            )}
            {last ? (
              <Button className="pill pill-primary" isDisabled={!hydrated || !complete} onPress={() => go("compare")}>
                {t("diag.compare")}
                <span className="pill-icon">
                  <Icon name="forward" />
                </span>
              </Button>
            ) : (
              <Button className="pill" isDisabled={!hydrated || !answers[i].trim()} onPress={() => go(i + 1)}>
                {t("diag.next")}
                <Icon name="forward" />
              </Button>
            )}
          </div>
        </div>
        <p className="small muted">{last && !complete ? t("diag.completeHint") : t("diag.draftNote")}</p>
      </div>
    );
  }

  const nextLink = recorded === "meets" ? next.meets : next.gap;
  return (
    <div className="diag">
      <section className="diag-card" aria-labelledby="diag-pass">
        <h3 id="diag-pass" ref={setFocusTarget} tabIndex={-1}>
          {t("diag.passCondition")}
        </h3>
        <p className="reading" lang={langOf(passCondition, lang)}>
          {passCondition.value}
        </p>
        <details className="diag-answers">
          <summary>{t("diag.yourAnswers", { count: tasks.length })}</summary>
          <ol>
            {tasks.map((prompt, i) => (
              <li key={i}>
                <p className="small muted" lang={langOf(prompt, lang)}>
                  {prompt.value}
                </p>
                <p className="diag-answer">{answers[i]}</p>
              </li>
            ))}
          </ol>
        </details>
        <RadioGroup className="radio-group" value={result} onChange={(v) => setResult(v as Result)} isDisabled={recorded !== null}>
          <Label className="radio-legend">{t("diag.result")}</Label>
          <RadioField value="meets">
            <RadioButton className="radio">{t("diag.result.meets")}</RadioButton>
          </RadioField>
          <RadioField value="partial">
            <RadioButton className="radio">{t("diag.result.partial")}</RadioButton>
          </RadioField>
          <RadioField value="notYet">
            <RadioButton className="radio">{t("diag.result.notYet")}</RadioButton>
          </RadioField>
        </RadioGroup>
        <div className="diag-actions">
          <Button
            className="button-quiet"
            onPress={() => {
              setRecorded(null);
              setResult(null);
              go(0);
            }}
          >
            {t("diag.edit")}
          </Button>
          {recorded === null && (
            <Button className="pill pill-primary" isDisabled={!result} onPress={record}>
              {t("diag.record")}
              <span className="pill-icon">
                <Icon name="add" />
              </span>
            </Button>
          )}
        </div>
        <p role="status" className="live-message">
          {recorded && (
            <>
              {t(recorded === "meets" ? "diag.recorded.meets" : "diag.recorded.gap")}{" "}
              {nextLink && (
                <a href={`#${nextLink.id}`} lang={langOf(nextLink.title, lang)}>
                  {nextLink.title.value}
                </a>
              )}
            </>
          )}
        </p>
      </section>
    </div>
  );
}
