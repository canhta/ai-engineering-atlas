import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldAnswered, type FormAnswers, type FormField, isComplete, summarize, toMarkdown } from "./lab-form.ts";

const loc = (value: string) => ({ value, lang: "en" as const });

const textField: FormField = { id: "goal", label: loc("Product goal"), type: "longtext" };
const choiceField: FormField = {
  id: "architecture",
  label: loc("Architecture"),
  type: "choice",
  help: loc("Choose the simplest architecture."),
  options: [loc("A single model call"), loc("An autonomous agent loop")],
};
const tableField: FormField = {
  id: "candidates",
  label: loc("Evaluation evidence"),
  type: "table",
  columns: [
    { id: "candidate", label: loc("Candidate") },
    { id: "quality", label: loc("Quality") },
  ],
};
const fields = [textField, choiceField, tableField];

test("a text field is answered once it has non-empty, trimmed text", () => {
  assert.equal(fieldAnswered(textField, undefined), false);
  assert.equal(fieldAnswered(textField, "   "), false);
  assert.equal(fieldAnswered(textField, "Route a support request."), true);
});

test("a table field is answered once one row has every column filled", () => {
  assert.equal(fieldAnswered(tableField, []), false);
  assert.equal(fieldAnswered(tableField, [{ candidate: "A" }]), false);
  assert.equal(fieldAnswered(tableField, [{ candidate: "A", quality: "0.9" }]), true);
  // A blank spare row does not count, but does not block an earlier filled row either.
  assert.equal(
    fieldAnswered(tableField, [
      { candidate: "A", quality: "0.9" },
      { candidate: "", quality: "" },
    ]),
    true,
  );
});

test("isComplete requires every field, and is false for an empty contract", () => {
  assert.equal(isComplete([], {}), false);
  const partial: FormAnswers = { goal: "Answer support questions." };
  assert.equal(isComplete(fields, partial), false);
  const complete: FormAnswers = {
    goal: "Answer support questions.",
    architecture: "A single model call",
    candidates: [{ candidate: "A", quality: "0.9" }],
  };
  assert.equal(isComplete(fields, complete), true);
});

test("summarize joins one 'Label: answer' line per answered field, skipping unanswered ones", () => {
  const answers: FormAnswers = {
    goal: "Answer support questions.",
    candidates: [{ candidate: "A", quality: "0.9" }],
  };
  const summary = summarize(fields, answers);
  assert.match(summary, /Product goal: Answer support questions\./);
  assert.match(summary, /Evaluation evidence: A \/ 0\.9/);
  assert.doesNotMatch(summary, /Architecture/);
});

test("summarize caps the length and marks truncation", () => {
  const long = "x".repeat(700);
  const summary = summarize([textField], { goal: long }, 50);
  assert.equal(summary.length, 50);
  assert.ok(summary.endsWith("…"));
});

test("toMarkdown renders one heading per field, in field order, matching the template structure", () => {
  const answers: FormAnswers = {
    goal: "Answer support questions.",
    architecture: "A single model call",
    candidates: [{ candidate: "A", quality: "0.9" }],
  };
  const md = toMarkdown("Model Selection Lab", fields, answers);
  assert.match(md, /^# Model Selection Lab\n/);
  const goalIndex = md.indexOf("## Product goal");
  const archIndex = md.indexOf("## Architecture");
  const tableIndex = md.indexOf("## Evaluation evidence");
  assert.ok(goalIndex > -1 && archIndex > goalIndex && tableIndex > archIndex);
  assert.match(md, /Answer support questions\./);
  assert.match(md, /\| Candidate \| Quality \|/);
  assert.match(md, /\| --- \| --- \|/);
  assert.match(md, /\| A \| 0\.9 \|/);
});

test("toMarkdown leaves an unanswered field's body blank without inventing text", () => {
  const md = toMarkdown("Model Selection Lab", fields, {});
  assert.doesNotMatch(md, /not answered|no candidates/i);
  const between = md.slice(md.indexOf("## Product goal") + "## Product goal".length, md.indexOf("## Architecture"));
  assert.equal(between.trim(), "");
});
