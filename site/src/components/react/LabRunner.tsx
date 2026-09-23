// Lab workbench (DESIGN.md → Labs): file tabs with the editor, Run / Stop / Reset, the results
// panel, the reference solution behind a confirmed reveal, and evidence for a passing run.
// Python runs in a worker (lib/lab-session.ts) that loads only when the learner presses Run.
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";
import { Button, type Key, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { type Lang, useTranslations } from "../../i18n";
import type { LabFrame } from "../../lib/lab-run";
import { type LabOutcome, LabSession, RUN_LIMIT_MS } from "../../lib/lab-session";
import { type EvidenceState, recordEvidence, type TargetState, today } from "../../lib/progress";
import { useLabCode, useProgress, useReferenceOpened } from "../../lib/progress-store";
import { CodeEditor } from "./CodeEditor";
import { Icon } from "./Icon";
import { StorageNote } from "./StorageNote";

export interface LabCompetency {
  ref: string;
  title: string;
  /** Set when the title is shown in a language other than the page's. */
  lang?: string;
  target: TargetState;
}

interface Props {
  lang: Lang;
  labRef: string;
  files: Record<string, string>;
  editable: string;
  run: string;
  reference: string;
  packages?: string[];
  /** Tracked items this lab practises; evidence goes to one of them. */
  competencies: LabCompetency[];
  stateLabels: Record<string, string>;
}

type Phase = "idle" | "loading" | "running";
type Finished = LabOutcome & { code: string; version?: string };

const EVIDENCE_OPTIONS: EvidenceState[] = ["learning", "demonstrated"];
const SAVE_DELAY_MS = 400;

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LabRunner(props: Props) {
  const { lang, labRef, files, editable, run, reference } = props;
  const t = useTranslations(lang);
  const starter = files[editable];
  const [stored, saveStored] = useLabCode(labRef);
  const [referenceOpened, openReference] = useReferenceOpened(labRef);
  const [code, setCodeState] = useState(starter);
  // Run reads the latest code from here, not from the last render: a Run pressed before React
  // re-renders an edit (a paste, a slow machine) would otherwise run the previous code.
  const latestCode = useRef(starter);
  const setCode = (value: string) => {
    latestCode.current = value;
    setCodeState(value);
  };
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Key>(editable);
  const [focusLine, setFocusLine] = useState<{ line: number; nonce: number }>();
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Finished | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"reset" | "reference" | null>(null);
  const session = useRef<LabSession | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const helpId = useId();
  const verdictId = useId();

  // Hydrate the saved draft once, then keep saving edits (debounced).
  const loaded = useRef(false);
  // The draft lives in localStorage, which the server render cannot read.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!loaded.current && stored !== null) {
      loaded.current = true;
      setCode(stored);
    }
  }, [stored]);
  useEffect(() => () => session.current?.dispose(), []);

  const edit = (value: string) => {
    loaded.current = true;
    setCode(value);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveStored(value === starter ? null : value), SAVE_DELAY_MS);
  };

  const runTests = async () => {
    session.current ??= new LabSession();
    const current = session.current;
    setOutcome(null);
    setLoadError(null);
    if (!current.version) {
      setPhase("loading");
      try {
        await current.warm();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
        setPhase("idle");
        return;
      }
    }
    setPhase("running");
    const submitted = latestCode.current;
    const version = current.version;
    const result = await current.run(
      { lab: labRef.replace(/[^\w.-]/g, "-"), files, editable, code: submitted, run },
      props.packages,
    );
    setOutcome({ ...result, code: submitted, version });
    setPhase("idle");
  };

  const showLine = (frame: LabFrame) => {
    if (!(frame.file in files)) return;
    if (frame.file === reference && !referenceOpened) return;
    setTab(frame.file);
    setFocusLine({ line: frame.line, nonce: Date.now() });
  };

  const tabs = [editable, run, ...Object.keys(files).filter((f) => f !== editable && f !== run && f !== reference)];
  if (referenceOpened) tabs.push(reference);

  return (
    <div className="lab-bench">
      <div className="lab-core">
        <Tabs selectedKey={tab} onSelectionChange={setTab} className="lab-tabs">
          <TabList aria-label={t("lab.files")} className="lab-tablist">
            {tabs.map((file) => (
              <Tab key={file} id={file} className="lab-tab">
                <code>{file}</code>
                {file === editable && <span className="lab-tab-mark">{t("lab.yours")}</span>}
                {file === reference && <span className="lab-tab-mark">{t("lab.reference")}</span>}
              </Tab>
            ))}
          </TabList>
          {tabs.map((file) => (
            <TabPanel key={file} id={file} className="lab-panel">
              {mounted ? (
                <CodeEditor
                  value={file === editable ? code : files[file]}
                  onChange={file === editable ? edit : undefined}
                  readOnly={file !== editable}
                  label={t(file === editable ? "lab.fileEditable" : "lab.fileReadOnly", { file })}
                  describedBy={file === editable ? helpId : undefined}
                  focusLine={tab === file ? focusLine : undefined}
                />
              ) : (
                <pre className="code-fallback" lang="en">
                  <code>{file === editable ? code : files[file]}</code>
                </pre>
              )}
            </TabPanel>
          ))}
        </Tabs>
        <p id={helpId} className="lab-help small muted">
          {t("lab.editorHelp")} {t("lab.draftNote")}
        </p>

        <div className="lab-toolbar">
          <Button className="button button-primary" isDisabled={!mounted || phase !== "idle"} onPress={runTests}>
            {t("lab.run")}
            <Icon name="run" />
          </Button>
          <Button className="button" isDisabled={phase !== "running"} onPress={() => session.current?.stop()}>
            <Icon name="stop" />
            {t("lab.stop")}
          </Button>
          <Button
            className="button-quiet lab-reset"
            isDisabled={!mounted || phase !== "idle" || code === starter}
            onPress={() => setConfirm("reset")}
          >
            <Icon name="reset" />
            {t("lab.reset")}
          </Button>
        </div>
        {confirm === "reset" && (
          <Confirm
            message={t("lab.resetConfirm")}
            action={t("lab.resetDo")}
            cancel={t("lab.cancel")}
            onConfirm={() => {
              window.clearTimeout(saveTimer.current);
              setCode(starter);
              saveStored(null);
              setTab(editable);
              setConfirm(null);
            }}
            onCancel={() => setConfirm(null)}
          />
        )}

        <section className="lab-results" aria-labelledby={verdictId}>
          <h3 id={verdictId} className="visually-hidden">
            {t("lab.results")}
          </h3>
          <Results
            lang={lang}
            phase={phase}
            outcome={outcome}
            loadError={loadError}
            run={run}
            editable={editable}
            onShowLine={showLine}
          />
        </section>

        {outcome?.verdict === "pass" && props.competencies.length > 0 && (
          <EvidenceForm {...props} outcome={outcome} referenceOpened={Boolean(referenceOpened)} />
        )}

        <section className="lab-reference">
          {referenceOpened ? (
            <p className="small muted">{t("lab.referenceOpened")}</p>
          ) : confirm === "reference" ? (
            <Confirm
              message={t("lab.referenceConfirm")}
              action={t("lab.referenceDo")}
              cancel={t("lab.cancel")}
              onConfirm={() => {
                openReference();
                setTab(reference);
                setConfirm(null);
              }}
              onCancel={() => setConfirm(null)}
            />
          ) : (
            <Button className="button-quiet" isDisabled={!mounted} onPress={() => setConfirm("reference")}>
              <Icon name="reveal" />
              {t("lab.referenceShow")}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}

function Confirm(props: {
  message: string;
  action: string;
  cancel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);
  return (
    <div className="lab-confirm" role="group" aria-label={props.message}>
      <p>{props.message}</p>
      <div className="form-actions">
        <button ref={first} type="button" className="button" onClick={props.onConfirm}>
          {props.action}
        </button>
        <button type="button" className="button-quiet" onClick={props.onCancel}>
          {props.cancel}
        </button>
      </div>
    </div>
  );
}

function Results(props: {
  lang: Lang;
  phase: Phase;
  outcome: Finished | null;
  loadError: string | null;
  run: string;
  editable: string;
  onShowLine: (frame: LabFrame) => void;
}) {
  const t = useTranslations(props.lang);
  const { phase, outcome } = props;
  let line: { icon?: "pass" | "fail" | "error" | "stop" | "timeout"; text: string; tone: string };
  if (phase === "loading") line = { text: t("lab.verdict.loading"), tone: "busy" };
  else if (phase === "running") line = { text: t("lab.verdict.running", { file: props.run }), tone: "busy" };
  else if (props.loadError)
    line = { icon: "error", text: t("lab.verdict.loadFailed", { message: props.loadError }), tone: "error" };
  else if (!outcome) line = { text: t("lab.verdict.idle"), tone: "idle" };
  else if (outcome.verdict === "pass") line = { icon: "pass", text: t("lab.verdict.pass"), tone: "pass" };
  else if (outcome.verdict === "fail") line = { icon: "fail", text: t("lab.verdict.fail"), tone: "fail" };
  else if (outcome.verdict === "error")
    line = { icon: "error", text: t("lab.verdict.error", { type: outcome.type ?? "" }), tone: "error" };
  else if (outcome.verdict === "stopped") line = { icon: "stop", text: t("lab.verdict.stopped"), tone: "idle" };
  else line = { icon: "timeout", text: t("lab.verdict.timeout", { seconds: RUN_LIMIT_MS / 1000 }), tone: "error" };

  const detail = outcome && "frames" in outcome ? outcome : undefined;
  const at = detail?.verdict === "fail" ? detail.at : (detail?.learner ?? detail?.at);
  const output = outcome && "stdout" in outcome ? `${outcome.stdout}${outcome.stderr}` : "";

  return (
    <div
      className={`lab-result lab-result-${line.tone}`}
      data-verdict={phase === "idle" ? (outcome?.verdict ?? "idle") : phase}
    >
      <p className="lab-verdict" role="status">
        {line.icon && <Icon name={line.icon} size={20} />}
        <span>{line.text}</span>
        {outcome && phase === "idle" && outcome.verdict !== "timeout" && (
          <span className="muted small tabular">
            {t("lab.duration", { ms: new Intl.NumberFormat(props.lang).format(outcome.ms) })}
          </span>
        )}
      </p>
      {at && (
        <div className="lab-at">
          <p className="small">
            <span>{t("lab.at", { file: at.file, line: at.line })}</span>{" "}
            <button type="button" className="link-button" onClick={() => props.onShowLine(at)}>
              {t("lab.showLine")}
            </button>
          </p>
          <pre className="lab-line" lang="en">
            <code>{at.code}</code>
          </pre>
          {detail?.message && (
            <p className="lab-message" lang="en">
              <code>
                {detail.type}: {detail.message}
              </code>
            </p>
          )}
        </div>
      )}
      {detail?.verdict === "error" && (detail.frames?.length ?? 0) > 1 && (
        <details className="lab-trace">
          <summary>{t("lab.traceback")}</summary>
          <ol lang="en">
            {(detail.frames ?? []).map((f, i) => (
              <li key={i} className={f.file === props.editable ? "is-learner" : undefined}>
                <code>
                  {f.file}:{f.line} in {f.name}
                </code>
                {f.code && <pre>{f.code}</pre>}
              </li>
            ))}
          </ol>
        </details>
      )}
      {output && (
        <details className="lab-output" open={outcome?.verdict === "pass"}>
          <summary>{t("lab.output")}</summary>
          <pre lang="en">{output}</pre>
        </details>
      )}
    </div>
  );
}

function EvidenceForm(props: Props & { outcome: Finished; referenceOpened: boolean }) {
  const { lang, outcome, competencies, stateLabels, editable, run } = props;
  const t = useTranslations(lang);
  const [progress, saveProgress] = useProgress();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const independence = props.referenceOpened ? "reference-open" : "independent";

  useEffect(() => {
    let live = true;
    void sha256(outcome.code).then((hash) => {
      if (live) setNote(t("lab.evidence.note", { run, version: outcome.version ?? "", file: editable, hash }));
    });
    return () => {
      live = false;
    };
    // Recompute only for a new run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

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
          kind: "implementation",
          supports_state: supports,
          independence,
          review_method: "automated",
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
        <Button className="button button-primary" isDisabled={!progress} onPress={() => setOpen(true)}>
          {t("log.record")}
        </Button>
      )}
      <p role="status" className="live-message">
        {saved}
      </p>
      {open && (
        <form className="evidence-form" onSubmit={submit}>
          <h3 className="lab-evidence-title">{t("lab.evidence.title")}</h3>
          <p className="small muted">{t("lab.evidence.hint")}</p>
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
            <textarea name="note" rows={3} required value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <p className="small muted">{t("lab.evidence.method", { independence: t(`independence.${independence}`) })}</p>
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {t("evidence.save")}
            </button>
            <button type="button" className="button-quiet" onClick={() => setOpen(false)}>
              {t("evidence.cancel")}
            </button>
          </div>
        </form>
      )}
      <StorageNote lang={lang} />
    </section>
  );
}
