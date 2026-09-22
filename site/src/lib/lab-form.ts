// Decision-lab rubric forms (DESIGN.md -> Labs, rfcs/0000-content-model.md -> Blocks: form). Pure
// helpers over a resolved form block's fields and the learner's answers: completeness, an evidence
// summary, and the Markdown export. Shared by DecisionForm.tsx and its unit tests.
//
// Only a *type-only* import from atlas.ts: this module is imported by a browser island, and atlas.ts
// pulls in the whole content model at runtime (site/AGENTS.md). Fields arrive already localized
// (Block.astro resolves L10n -> Localized server-side), so no runtime text-lookup is needed here.
import type { Localized } from "./atlas";

export type FieldType = "text" | "longtext" | "choice" | "table";

export interface FormFieldColumn {
  id: string;
  label: Localized;
}

export interface FormField {
  id: string;
  label: Localized;
  type: FieldType;
  help?: Localized;
  options?: Localized[];
  columns?: FormFieldColumn[];
}

export type TableRow = Record<string, string>;
export type FormValue = string | TableRow[];
export type FormAnswers = Record<string, FormValue>;

const isTableValue = (value: FormValue | undefined): value is TableRow[] => Array.isArray(value);

/** A table row counts once every column holds an answer. */
function rowFilled(columns: FormFieldColumn[], row: TableRow): boolean {
  return columns.length > 0 && columns.every((c) => (row[c.id] ?? "").trim() !== "");
}

function filledRows(field: FormField, value: FormValue | undefined): TableRow[] {
  const rows = isTableValue(value) ? value : [];
  return rows.filter((row) => rowFilled(field.columns ?? [], row));
}

/** Whether one field has an answer: free text is non-empty, a table has at least one filled row. */
export function fieldAnswered(field: FormField, value: FormValue | undefined): boolean {
  if (field.type === "table") return filledRows(field, value).length > 0;
  return typeof value === "string" && value.trim() !== "";
}

/** Every field in the contract is required (rfcs/0000-interactive-web-atlas.md -> Decision labs). */
export function isComplete(fields: FormField[], answers: FormAnswers): boolean {
  return fields.length > 0 && fields.every((f) => fieldAnswered(f, answers[f.id]));
}

function plainText(field: FormField, value: FormValue | undefined): string {
  if (field.type === "table") {
    const columns = field.columns ?? [];
    return filledRows(field, value)
      .map((row) => columns.map((c) => row[c.id] ?? "").join(" / "))
      .join("; ");
  }
  return typeof value === "string" ? value.trim() : "";
}

/** One line per field: "Label: answer", joined for the evidence note, capped to `limit` characters. */
export function summarize(fields: FormField[], answers: FormAnswers, limit = 600): string {
  const parts = fields
    .map((field) => {
      const value = plainText(field, answers[field.id]);
      return value ? `${field.label.value}: ${value.replace(/\s+/g, " ")}` : null;
    })
    .filter((line): line is string => Boolean(line));
  const joined = parts.join(" | ");
  return joined.length > limit ? `${joined.slice(0, limit - 1)}…` : joined;
}

function markdownTable(field: FormField, value: FormValue | undefined): string[] {
  const columns = field.columns ?? [];
  const rows = filledRows(field, value);
  if (columns.length === 0 || rows.length === 0) return [];
  const cells = (values: string[]) => `| ${values.join(" | ")} |`;
  return [
    cells(columns.map((c) => c.label.value)),
    cells(columns.map(() => "---")),
    ...rows.map((row) => cells(columns.map((c) => (row[c.id] ?? "").trim() || " "))),
  ];
}

/**
 * The filled template as Markdown, matching the lab's own template structure: one heading per
 * field (the field's own label, taken from the template), and the learner's answer underneath.
 */
export function toMarkdown(title: string, fields: FormField[], answers: FormAnswers): string {
  const lines = [`# ${title}`, ""];
  for (const field of fields) {
    lines.push(`## ${field.label.value}`, "");
    if (field.type === "table") {
      lines.push(...markdownTable(field, answers[field.id]));
    } else {
      lines.push(plainText(field, answers[field.id]));
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
