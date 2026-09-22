// Diagnostic workspace: attempt first, then compare with the pass condition and record a
// self-assessed result as diagnostic evidence (DESIGN.md → Diagnostic, LEARNING_MODEL.md).
import { useState } from "react";
import { Button, Label, RadioButton, RadioField, RadioGroup, TextArea, TextField } from "react-aria-components";
import { useTranslations, type Lang } from "../../i18n";
import { recordEvidence, today, type TargetState } from "../../lib/progress";
import { useDraft, useProgress } from "../../lib/progress-store";

type Result = "meets" | "partial" | "notYet";

interface Props {
  lang: Lang;
  routeId: string;
  target: TargetState;
  tasks: string[];
  passCondition: string;
}

export default function DiagnosticCheck({ lang, routeId, target, tasks, passCondition }: Props) {
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [draft, saveDraft] = useDraft(routeId);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [recorded, setRecorded] = useState<Result | null>(null);
  const en = lang === "en" ? undefined : "en";

  const answers = tasks.map((_, i) => draft?.[i] ?? "");
  const complete = answers.every((a) => a.trim().length > 0);
  const hydrated = draft !== null && progress !== null;

  const setAnswer = (i: number, value: string) => {
    const next = [...answers];
    next[i] = value;
    saveDraft(next);
  };

  const record = () => {
    if (!progress || !result) return;
    const meets = result === "meets";
    saveProgress(
      recordEvidence(
        progress,
        routeId,
        {
          kind: "diagnostic",
          // Passing the diagnostic skips introductory material; only exit evidence demonstrates.
          supports_state: meets ? "learning" : "gap",
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

  return (
    <div className="diagnostic">
      <ol className="task-list">
        {tasks.map((task, i) => (
          <li key={i}>
            <p className="reading" lang={en}>
              {task}
            </p>
            <TextField
              className="field"
              value={answers[i]}
              onChange={(value) => setAnswer(i, value)}
              isDisabled={!hydrated || submitted}
            >
              <Label className="visually-hidden">{t("diag.answer", { n: i + 1 })}</Label>
              <TextArea rows={4} />
            </TextField>
          </li>
        ))}
      </ol>

      {!submitted ? (
        <div className="actions">
          <Button className="button primary" isDisabled={!hydrated || !complete} onPress={() => setSubmitted(true)}>
            {t("diag.submit")}
          </Button>
          <span className="muted small">{t("diag.submitHint")}</span>
        </div>
      ) : (
        <section className="compare" aria-labelledby="pass-condition">
          <h3 id="pass-condition">{t("route.passCondition")}</h3>
          <p className="reading" lang={en}>
            {passCondition}
          </p>
          <p className="muted">{t("diag.compare")}</p>
          <RadioGroup
            className="radio-group"
            value={result}
            onChange={(v) => setResult(v as Result)}
            isDisabled={recorded !== null}
          >
            <Label>{t("diag.result")}</Label>
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
          <div className="actions">
            {recorded === null && (
              <Button className="button primary" isDisabled={!result} onPress={record}>
                {t("diag.record")}
              </Button>
            )}
            <Button
              className="button"
              onPress={() => {
                setSubmitted(false);
                setRecorded(null);
                setResult(null);
              }}
            >
              {t("diag.edit")}
            </Button>
          </div>
          <p role="status" className="status-message">
            {recorded === "meets" && (
              <>
                {t("diag.recorded.meets")} <a href="#practice">{t("route.practice")}</a>
              </>
            )}
            {recorded && recorded !== "meets" && (
              <>
                {t("diag.recorded.gap")} <a href="#learning-route">{t("route.learningRoute")}</a>
              </>
            )}
          </p>
        </section>
      )}
    </div>
  );
}
