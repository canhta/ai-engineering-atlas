// Decision-lab rubric form (DESIGN.md -> Labs: the form variant): the rubric stays visible while
// answering, a decision field is enforced only by its position in the field order (never hidden),
// and "Record evidence" appears once every field is non-empty. Draft answers save per lab in
// guarded local storage, like the code labs' drafts (lib/progress-store.ts).
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import { type FormAnswers, type FormField, isComplete, summarize, type TableRow, toMarkdown } from "../../lib/lab-form";
import { type EvidenceState, recordEvidence, today } from "../../lib/progress";
import { useLabFormAnswers, useProgress } from "../../lib/progress-store";
import { Icon } from "./Icon";
import type { LabCompetency } from "./LabRunner";
import { StorageNote } from "./StorageNote";

interface Props {
  lang: Lang;
  labRef: string;
  title: string;
  fields: FormField[];
  competencies: LabCompetency[];
  stateLabels: Record<string, string>;
}

const EVIDENCE_OPTIONS: EvidenceState[] = ["learning", "demonstrated"];
const SAVE_DELAY_MS = 400;

export default function DecisionForm(props: Props) {
  const { lang, labRef, title, fields, competencies, stateLabels } = props;
  const t = useTranslations(lang);
  const [stored, saveStored] = useLabFormAnswers(labRef);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [mounted, setMounted] = useState(false);
  const loaded = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);

  // The draft lives in localStorage, which the server render cannot read.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!loaded.current && stored && Object.keys(stored).length > 0) {
      loaded.current = true;
      setAnswers(stored);
    }
  }, [stored]);

  const update = (id: string, value: FormAnswers[string]) => {
    loaded.current = true;
    const next = { ...answers, [id]: value };
    setAnswers(next);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveStored(next), SAVE_DELAY_MS);
  };

  const exportMarkdown = () => {
    const blob = new Blob([toMarkdown(title, fields, answers)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${labRef.replace(/^lab:/, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const complete = isComplete(fields, answers);

  return (
    <div className="lab-bench">
      <div className="bezel">
        <div className="bezel-core lab-core form-core">
          <div className="form-fields">
            {fields.map((field) => (
              <FieldInput
                key={field.id}
                lang={lang}
                field={field}
                value={answers[field.id]}
                onChange={(value) => update(field.id, value)}
                disabled={!mounted}
              />
            ))}
          </div>
          <p className="lab-help small muted">{t("form.draftNote")}</p>
          <div className="lab-toolbar">
            <Button className="pill" isDisabled={!mounted} onPress={exportMarkdown}>
              {t("form.export")}
              <span className="pill-icon">
                <Icon name="exportFile" />
              </span>
            </Button>
          </div>
          {complete && competencies.length > 0 && (
            <FormEvidence
              lang={lang}
              fields={fields}
              answers={answers}
              competencies={competencies}
              stateLabels={stateLabels}
            />
          )}
          <StorageNote lang={lang} />
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  lang,
  field,
  value,
  onChange,
  disabled,
}: {
  lang: Lang;
  field: FormField;
  value: FormAnswers[string] | undefined;
  onChange: (value: FormAnswers[string]) => void;
  disabled: boolean;
}) {
  const t = useTranslations(lang);
  const helpId = useId();

  if (field.type === "table") {
    return (
      <TableField
        lang={lang}
        field={field}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  const text = typeof value === "string" ? value : "";
  // The help text sits outside the <label> (linked by aria-describedby only, like the lab runner's
  // own field help): nesting it inside would fold it into the control's accessible name.
  return (
    <div className="field-group">
      <label className="field" lang={field.label.lang === lang ? undefined : field.label.lang}>
        <span>{field.label.value}</span>
        {field.type === "choice" ? (
          <select
            value={text}
            disabled={disabled}
            aria-describedby={field.help ? helpId : undefined}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>
              {t("form.choice.placeholder")}
            </option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value} lang={option.lang === lang ? undefined : option.lang}>
                {option.value}
              </option>
            ))}
          </select>
        ) : field.type === "longtext" ? (
          <textarea
            rows={4}
            value={text}
            disabled={disabled}
            aria-describedby={field.help ? helpId : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type="text"
            value={text}
            disabled={disabled}
            aria-describedby={field.help ? helpId : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </label>
      {field.help && (
        <span id={helpId} className="small muted" lang={field.help.lang === lang ? undefined : field.help.lang}>
          {field.help.value}
        </span>
      )}
    </div>
  );
}

function TableField({
  lang,
  field,
  value,
  onChange,
  disabled,
}: {
  lang: Lang;
  field: FormField;
  value: TableRow[];
  onChange: (value: TableRow[]) => void;
  disabled: boolean;
}) {
  const t = useTranslations(lang);
  const columns = field.columns ?? [];
  const emptyRow = () => Object.fromEntries(columns.map((c) => [c.id, ""]));
  const rows = value.length > 0 ? value : [emptyRow()];

  const updateCell = (row: number, columnId: string, cell: string) => {
    onChange(rows.map((r, i) => (i === row ? { ...r, [columnId]: cell } : r)));
  };
  const addRow = () => onChange([...rows, emptyRow()]);
  const removeRow = (row: number) => onChange(rows.length > 1 ? rows.filter((_, i) => i !== row) : rows);

  return (
    <fieldset className="field form-table-field">
      <legend>{field.label.value}</legend>
      {field.help && (
        <p className="small muted" lang={field.help.lang === lang ? undefined : field.help.lang}>
          {field.help.value}
        </p>
      )}
      <div className="table-stack">
        <table className="evidence-table form-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.id} scope="col">
                  {c.label.value}
                </th>
              ))}
              <th scope="col">
                <span className="visually-hidden">{t("form.table.remove")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.id} data-label={c.label.value}>
                    <input
                      type="text"
                      value={row[c.id] ?? ""}
                      disabled={disabled}
                      aria-label={`${c.label.value} – ${t("form.table.row", { row: i + 1 })}`}
                      onChange={(e) => updateCell(i, c.id, e.target.value)}
                    />
                  </td>
                ))}
                <td data-label="">
                  <button
                    type="button"
                    className="button-quiet"
                    disabled={disabled || rows.length <= 1}
                    onClick={() => removeRow(i)}
                  >
                    {t("form.table.remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="button-quiet" disabled={disabled} onClick={addRow}>
        <Icon name="add" />
        {t("form.table.add")}
      </button>
    </fieldset>
  );
}

function FormEvidence(props: {
  lang: Lang;
  fields: FormField[];
  answers: FormAnswers;
  competencies: LabCompetency[];
  stateLabels: Record<string, string>;
}) {
  const { lang, fields, answers, competencies, stateLabels } = props;
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  // Pre-fill the note from the current answers when the learner opens the panel (not on every
  // keystroke): a plain event handler, not an effect, since it is triggered by that one action.
  const openPanel = () => {
    setNote(t("form.evidence.note", { summary: summarize(fields, answers) }));
    setOpen(true);
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!progress) return;
    const form = new FormData(event.currentTarget);
    const ref = String(form.get("competency"));
    const competency = competencies.find((c) => c.ref === ref) ?? competencies[0];
    const supports = form.get("supports") as EvidenceState;
    saveProgress(
      recordEvidence(
        progress,
        competency.ref,
        {
          kind: "decision",
          supports_state: supports,
          independence: "independent",
          review_method: "self",
          note: String(form.get("note")).trim(),
        },
        progress.competencies[competency.ref]?.target_state ?? competency.target,
        today(),
      ),
    );
    setOpen(false);
    setSaved(t("log.saved", { state: stateLabels[supports] }));
  };

  return (
    <section className="lab-evidence">
      {!open && (
        <Button className="pill pill-primary" isDisabled={!progress} onPress={openPanel}>
          {t("log.record")}
          <span className="pill-icon">
            <Icon name="add" />
          </span>
        </Button>
      )}
      <p role="status" className="live-message">
        {saved}
      </p>
      {open && (
        <form className="evidence-form" onSubmit={submit}>
          <h3 className="lab-evidence-title">{t("lab.evidence.title")}</h3>
          <p className="small muted">{t("form.evidence.hint")}</p>
          {competencies.length > 1 ? (
            <fieldset className="field lab-competencies">
              <legend>{t("lab.evidence.competency")}</legend>
              {competencies.map((c, i) => (
                <label key={c.ref} className="lab-choice">
                  <input type="radio" name="competency" value={c.ref} defaultChecked={i === 0} required />
                  <span lang={c.lang}>{c.title}</span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="field">
              <span>{t("lab.evidence.competency")}</span>
              <span className="lab-competency" lang={competencies[0].lang}>
                {competencies[0].title}
              </span>
              <input type="hidden" name="competency" value={competencies[0].ref} />
            </p>
          )}
          <label className="field">
            <span>{t("evidence.supports")}</span>
            <select name="supports" required defaultValue="learning">
              {EVIDENCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {stateLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("evidence.note")}</span>
            <textarea name="note" rows={5} required value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <p className="small muted">{t("form.evidence.method")}</p>
          <div className="form-actions">
            <button type="submit" className="pill pill-primary">
              {t("evidence.save")}
            </button>
            <button type="button" className="button-quiet" onClick={() => setOpen(false)}>
              {t("evidence.cancel")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
