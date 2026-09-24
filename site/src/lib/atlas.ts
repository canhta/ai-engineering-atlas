// Typed reader of the content model v2 (rfcs/0000-content-model.md, schemas/site-data.schema.json).
// The site knows collections, items, blocks, vocabularies, relations, and resources; it never
// names a curriculum field (scripts/check-content-coupling.mjs enforces this).
import { Lexer, type Token } from "marked";
import model from "../data/atlas.json" with { type: "json" };
import type { Lang } from "../i18n";
import { refOf } from "./refs.ts";

// ---------------------------------------------------------------------------------------------
// Contract types

export interface L10n {
  en: string;
  vi?: string;
}

export interface VocabularyEntry {
  label: L10n;
  order: number;
  description?: L10n;
}
export type Vocabulary = Record<string, VocabularyEntry>;

export interface FieldSpec {
  label: L10n;
  vocabulary?: string;
}

export interface Collection {
  id: string;
  label: L10n;
  ref_prefix?: string;
  fields: Record<string, FieldSpec>;
  group_by?: string;
  facets?: string[];
  page_when?: { field: string; in: string[] };
  progress?: { tracks: boolean; target_field?: string };
}

export type FieldValue = string | number | boolean | Array<string | number | boolean>;

interface BlockBase {
  id: string;
  title: L10n;
  step?: boolean;
}
export interface TextBlock extends BlockBase {
  type: "text";
  body: L10n;
  /** Markdown body; omitted for plain paragraphs. */
  format?: "markdown";
}
export interface ListBlock extends BlockBase {
  type: "list";
  items: L10n[];
  ordered: boolean;
}
export interface Bridge {
  diagnostic?: L10n;
  resource: string;
  locator?: L10n;
  purpose?: L10n;
}
export interface PrerequisitesBlock extends BlockBase {
  type: "prerequisites";
  items: { ref: string; bridge?: Bridge }[];
}
export interface DiagnosticBlock extends BlockBase {
  type: "diagnostic";
  tasks: L10n[];
  pass_condition: L10n;
}
export interface SourceRow {
  resource: string;
  locator: L10n;
  purpose: L10n;
}
export interface SourcesBlock extends BlockBase {
  type: "sources";
  rows: SourceRow[];
}
export interface PracticeItem {
  text: L10n;
  ref?: string;
  path?: string;
  resource?: string;
  locator?: L10n;
}
export interface PracticeBlock extends BlockBase {
  type: "practice";
  groups: { label: L10n; items: PracticeItem[] }[];
}
export interface RunnerBlock extends BlockBase {
  type: "runner";
  runtime: "pyodide";
  /** File the learner edits, the file run as `__main__`, and the reference solution: keys of `files`. */
  editable: string;
  run: string;
  reference: string;
  /** File name → text. */
  files: Record<string, string>;
  packages?: string[];
}
export interface FormFieldColumn {
  id: string;
  label: L10n;
}
export interface FormField {
  id: string;
  label: L10n;
  type: "text" | "longtext" | "choice" | "table";
  help?: L10n;
  /** Choice values; set when type is choice. */
  options?: L10n[];
  /** Table columns; set when type is table. */
  columns?: FormFieldColumn[];
}
export interface FormBlock extends BlockBase {
  type: "form";
  fields: FormField[];
}
export interface Milestone {
  /** Stable anchor on the page. */
  id: string;
  title: L10n;
  /** What the milestone asks; omitted while undecided. */
  ask?: L10n;
  /** Items the milestone integrates. */
  refs: string[];
  /** Evidence artifact IDs. */
  evidence: string[];
  /** Repository path of the evidence package. */
  path?: string;
}
export interface MilestonesBlock extends BlockBase {
  type: "milestones";
  items: Milestone[];
}
export interface SequenceEntry {
  ref: string;
  required: boolean;
  /** When an optional entry applies. */
  when?: L10n;
  /** A value of the block's vocabulary. */
  level?: string;
  /** Items placed later on purpose, each with its reason. */
  exceptions?: { ref: string; reason: L10n }[];
}
export interface SequenceStage {
  /** Stable anchor on the page. */
  id: string;
  title: L10n;
  /** Markdown. */
  guidance?: L10n;
  /** Level for the stage's items that have a page. */
  level?: string;
  entries: SequenceEntry[];
}
export interface SequenceBlock extends BlockBase {
  type: "sequence";
  /** Vocabulary of every level value. */
  vocabulary?: string;
  stages: SequenceStage[];
}
export interface DataBlock extends BlockBase {
  type: "data";
  value: unknown;
}
export type Block =
  | TextBlock
  | ListBlock
  | PrerequisitesBlock
  | DiagnosticBlock
  | SourcesBlock
  | PracticeBlock
  | RunnerBlock
  | FormBlock
  | MilestonesBlock
  | SequenceBlock
  | DataBlock;
export const BLOCK_TYPES = [
  "text",
  "list",
  "prerequisites",
  "diagnostic",
  "sources",
  "practice",
  "runner",
  "form",
  "milestones",
  "sequence",
  "data",
] as const;

export interface Item {
  id: string;
  title: L10n;
  fields: Record<string, FieldValue>;
  page?: { source_path: string; blocks: Block[] };
}

export interface Relation {
  type: string;
  from: string;
  to: string;
}

export interface Resource {
  title: string;
  url: string;
  type?: string;
  author?: string;
}

export interface Release {
  version: string;
  /** ISO day. */
  date: string;
}

export interface ChangeEntry {
  /** ISO day the change landed. */
  date: string;
  /** A value of `Changes.vocabulary`. */
  kind: string;
  /** Items the change names that exist in the model. */
  refs: string[];
  /** Names that are no longer items (a removed competency), printed without a link. */
  unlisted?: string[];
  /** The release it shipped in; absent while unreleased. */
  release?: string;
  /** The record that decided it: its number and repository path. */
  decision?: { id: string; path: string };
  /** Made before the review process existed, so there is no decision record. */
  predates_review?: true;
  note?: L10n;
}

export interface Changes {
  vocabulary: string;
  releases: Release[];
  /** Oldest first, as recorded. */
  entries: ChangeEntry[];
}

interface Model {
  version: number;
  site: {
    title: L10n;
    tagline: L10n;
    repository: string;
    /** Ref of the route Home shows as a specimen (DESIGN.md → Home). */
    specimen?: string;
    links?: { kind: "github" | "email" | "whatsapp" | "zalo" | "x" | "linkedin"; url: string }[];
  };
  locales: string[];
  vocabularies: Record<string, Vocabulary>;
  collections: Collection[];
  items: Record<string, Item[]>;
  relations: Relation[];
  resources: Record<string, Resource>;
  changes?: Changes;
}

const atlas = model as unknown as Model;
if (atlas.version !== 2) throw new Error(`atlas.json: expected content model version 2, got ${atlas.version}`);

// ---------------------------------------------------------------------------------------------
// Localised text

/** Text in the page language, or English with its own `lang` when no reviewed translation exists. */
export interface Localized {
  value: string;
  lang: Lang;
}

export function text(l10n: L10n | undefined, lang: Lang): Localized {
  const own = lang === "en" ? l10n?.en : l10n?.[lang];
  if (own) return { value: own, lang };
  return { value: l10n?.en ?? "", lang: "en" };
}

/** `lang` attribute for a passage: set only when it differs from the page language (WCAG 3.1.2). */
export const langAttr = (t: Localized, pageLang: Lang) => (t.lang === pageLang ? undefined : t.lang);

// ---------------------------------------------------------------------------------------------
// Site, collections, items

export const site = atlas.site;
export const vocabularies = atlas.vocabularies;
export const collections = atlas.collections;
export const resources = atlas.resources;
export const relations = atlas.relations;
/** Dated changes, when the content side records them (the What changed page). */
export const changes: Changes | undefined = atlas.changes;

export const collection = (id: string) => collections.find((c) => c.id === id);
export const itemsOf = (collectionId: string): Item[] => atlas.items[collectionId] ?? [];

/** The collection whose items carry learner progress (the atlas map and plate). */
export const trackedCollection: Collection = (() => {
  const found = collections.find((c) => c.progress?.tracks);
  if (!found) throw new Error("atlas.json: no collection tracks progress");
  return found;
})();
export const trackedItems = itemsOf(trackedCollection.id);

const byRef = new Map<string, { collection: Collection; item: Item }>();
for (const c of collections) for (const item of itemsOf(c.id)) byRef.set(refOf(c, item), { collection: c, item });

export const resolveRef = (ref: string) => byRef.get(ref);

export const hasPage = (item: Item) => Boolean(item.page);

/** Pages that exist, per collection, for getStaticPaths. */
export const pagedItems = (c: Collection) => itemsOf(c.id).filter(hasPage);

/** Collections with `page_when` publish their pages as routes; the others under their own id. */
export const pageSegment = (c: Collection) => (c.page_when ? "routes" : c.id);

/** The item whose page comes from a repository path, for links inside Markdown bodies. */
const byPath = new Map<string, string>();
for (const [ref, { item }] of byRef) if (item.page) byPath.set(item.page.source_path.replace(/\/$/, ""), ref);
export const refAtPath = (path: string) => byPath.get(path.replace(/\/$/, ""));

export function itemUrl(lang: Lang, ref: string): string | undefined {
  const found = resolveRef(ref);
  if (!found || !hasPage(found.item)) return undefined;
  return `/${lang}/${pageSegment(found.collection)}/${found.item.id}/`;
}

// ---------------------------------------------------------------------------------------------
// Fields and vocabularies

export const listValue = (value: FieldValue | undefined): string[] =>
  value === undefined ? [] : (Array.isArray(value) ? value : [value]).map(String);

export function vocabularyLabel(vocabulary: string | undefined, value: string, lang: Lang): Localized {
  const entry = vocabulary ? vocabularies[vocabulary]?.[value] : undefined;
  return entry ? text(entry.label, lang) : { value, lang: "en" };
}

/** Values of one vocabulary in its declared order. */
export const vocabularyValues = (name: string) =>
  Object.entries(vocabularies[name] ?? {})
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([value]) => value);

export interface FieldChip {
  field: string;
  value: string;
  label: Localized;
}

/** Labelled values of one item field; vocabulary values get their label. */
export function fieldChips(c: Collection, item: Item, field: string, lang: Lang): FieldChip[] {
  const spec = c.fields[field];
  return listValue(item.fields[field]).map((value) => ({
    field,
    value,
    label: vocabularyLabel(spec?.vocabulary, value, lang),
  }));
}

/**
 * Chips for a page header: vocabulary fields that are not already shown elsewhere
 * (the grouping in the breadcrumb, the page condition, and the progress target in the field log).
 */
export function headerChips(c: Collection, item: Item, lang: Lang): FieldChip[] {
  const shownElsewhere = new Set([c.group_by, c.page_when?.field, c.progress?.target_field]);
  return Object.entries(c.fields)
    .filter(([name, spec]) => spec.vocabulary && !shownElsewhere.has(name))
    .flatMap(([name]) => fieldChips(c, item, name, lang));
}

/** What the details line under a page title says (DESIGN.md → Route sheet). */
export interface Details {
  /** One entry per header field (see headerChips), its labelled values joined by commas. */
  facts: Localized[];
  /** Rows across the item's sources blocks. */
  sources: number;
  /** Tasks in the item's diagnostic block. */
  tasks: number;
}

export function detailsOf(c: Collection, item: Item, lang: Lang): Details {
  const byField = new Map<string, FieldChip[]>();
  for (const chip of item.page ? headerChips(c, item, lang) : []) {
    byField.set(chip.field, [...(byField.get(chip.field) ?? []), chip]);
  }
  // A short vocabulary code (a level such as "L3") leads its label: "L3 deep engineering competence".
  const labelled = (chip: FieldChip) =>
    chip.value.length <= 3 && chip.value !== chip.label.value ? `${chip.value} ${chip.label.value}` : chip.label.value;
  const facts = [...byField.values()].map((chips) => ({
    value: chips.map(labelled).join(", "),
    lang: chips.every((chip) => chip.label.lang === lang) ? lang : ("en" as Lang),
  }));
  const blocks = item.page?.blocks ?? [];
  const diagnostic = blocks.find((b) => b.type === "diagnostic");
  return {
    facts,
    sources: blocks.reduce((n, b) => n + (b.type === "sources" ? b.rows.length : 0), 0),
    tasks: diagnostic?.type === "diagnostic" ? diagnostic.tasks.length : 0,
  };
}

export function groupOf(c: Collection, item: Item, lang: Lang) {
  if (!c.group_by) return undefined;
  const value = listValue(item.fields[c.group_by])[0];
  return value === undefined
    ? undefined
    : { value, label: vocabularyLabel(c.fields[c.group_by]?.vocabulary, value, lang) };
}

/** Groups of a collection in vocabulary order, each with its items in content order. */
export function groupsOf(c: Collection) {
  const field = c.group_by;
  const vocabulary = field ? c.fields[field]?.vocabulary : undefined;
  if (!field || !vocabulary) return [{ value: "", vocabulary, items: itemsOf(c.id) }];
  return vocabularyValues(vocabulary)
    .map((value) => ({
      value,
      vocabulary,
      items: itemsOf(c.id).filter((i) => listValue(i.fields[field])[0] === value),
    }))
    .filter((g) => g.items.length > 0);
}

// ---------------------------------------------------------------------------------------------
// Learner progress targets and states (the vocabulary of the tracked collection's target field)

export const stateVocabulary = (() => {
  const field = trackedCollection.progress?.target_field;
  const name = field ? trackedCollection.fields[field]?.vocabulary : undefined;
  if (!name || !vocabularies[name]) throw new Error("atlas.json: the progress target field needs a vocabulary");
  return name;
})();

export const stateLabel = (state: string, lang: Lang) => vocabularyLabel(stateVocabulary, state, lang);

/** All state labels for one language, for islands. */
export const stateLabels = (lang: Lang) =>
  Object.fromEntries(vocabularyValues(stateVocabulary).map((s) => [s, stateLabel(s, lang).value]));

/** The highest declared target for an item, or undefined when the item declares none. */
export function targetOf(c: Collection, item: Item): string | undefined {
  const field = c.progress?.target_field;
  return field ? listValue(item.fields[field]).at(-1) : undefined;
}

// ---------------------------------------------------------------------------------------------
// Relations

export const relationsTo = (type: string, ref: string) => relations.filter((r) => r.type === type && r.to === ref);
export const relationsFrom = (type: string, ref: string) => relations.filter((r) => r.type === type && r.from === ref);

/**
 * Tracked items (with a page) that point at an item of another collection through any relation,
 * e.g. the competencies a lab practises. Relations between tracked items (one competency needing
 * another) never count, so a tracked item always gets [].
 */
export function trackedItemsPointingAt(ref: string): Item[] {
  if (resolveRef(ref)?.collection.id === trackedCollection.id) return [];
  return trackedWithPage(relations.filter((r) => r.to === ref).map((r) => r.from));
}

/**
 * Tracked items (with a page) that an item of another collection points at through any relation,
 * e.g. the routes a project brings together. A tracked item always gets [].
 */
export function trackedItemsFrom(ref: string): Item[] {
  if (resolveRef(ref)?.collection.id === trackedCollection.id) return [];
  return trackedWithPage(relations.filter((r) => r.from === ref).map((r) => r.to));
}

/** The tracked items with a page among these refs, once each, in relation order. */
function trackedWithPage(refs: string[]): Item[] {
  const seen = new Set<string>();
  return refs
    .map((ref) => resolveRef(ref))
    .filter((found): found is { collection: Collection; item: Item } =>
      Boolean(found && found.collection.id === trackedCollection.id && found.item.page),
    )
    .map((found) => found.item)
    .filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)));
}

// ---------------------------------------------------------------------------------------------
// Catalogue: what a collection index says about each item (DESIGN.md → Collection indexes)

/** How an item's page runs: a `runner` block (in the browser, with tests), a `form`, or neither. */
export function benchOf(item: Item): "runner" | "form" | undefined {
  for (const block of item.page?.blocks ?? []) if (block.type === "runner" || block.type === "form") return block.type;
  return undefined;
}

const plainText = (tokens: Token[] = []): string =>
  tokens
    .map((t) => ("tokens" in t && t.tokens ? plainText(t.tokens) : t.type === "br" ? " " : "text" in t ? t.text : ""))
    .join("");

/**
 * The first passage of a Markdown body as plain text. Lines before the first heading are a
 * preamble (a README's link back to what it accompanies), so the passage opens the first section;
 * a sentence ending in a colon takes the list it introduces with it.
 */
export function firstPassage(markdown: string): string | undefined {
  const tokens = Lexer.lex(markdown);
  const heading = tokens.findIndex((t) => t.type === "heading");
  const at = tokens.findIndex((t, i) => i > heading && t.type === "paragraph");
  const paragraph = tokens[at];
  if (paragraph?.type !== "paragraph") return undefined;
  let passage = plainText(paragraph.tokens).trim();
  const next = tokens.slice(at + 1).find((t) => t.type !== "space");
  if (passage.endsWith(":") && next?.type === "list") {
    const items = (next.items as Token[]).map((i) => plainText("tokens" in i ? i.tokens : []).trim());
    passage = `${passage} ${items.map((i) => i.replace(/[;,.]$/, "")).join(", ")}.`;
  }
  return passage.replace(/\s+/g, " ") || undefined;
}

/** What an item asks: the first passage of its first text block, or undefined without one. */
export function passageOf(item: Item, lang: Lang): Localized | undefined {
  const block = item.page?.blocks.find((b) => b.type === "text");
  if (block?.type !== "text") return undefined;
  const body = text(block.body, lang);
  const value = block.format === "markdown" ? firstPassage(body.value) : body.value.split(/\n\s*\n/)[0]?.trim();
  return value ? { value, lang: body.lang } : undefined;
}

// ---------------------------------------------------------------------------------------------
// Resources and repository links

export interface ResolvedResource {
  title: string;
  url: string;
  host: string;
  kind?: string;
}

export function resolveResource(key: string): ResolvedResource {
  const isUrl = /^https?:\/\//.test(key);
  const entry = isUrl ? undefined : atlas.resources[key];
  const url = isUrl ? key : (entry?.url ?? "");
  return {
    title: entry?.title ?? key,
    url,
    host: url ? new URL(url).hostname.replace(/^www\./, "") : "",
    kind: entry?.type,
  };
}

/**
 * Sections a block holds that get their own anchor and a numbered entry in the contents rail
 * (a project's milestones, a path's stages), in order; [] for a block that is one section.
 */
export function sectionsOf(block: Block): { id: string; title: L10n }[] {
  if (block.type === "milestones") return block.items.map((m) => ({ id: m.id, title: m.title }));
  if (block.type === "sequence") return block.stages.map((s) => ({ id: s.id, title: s.title }));
  return [];
}

/** Anchor of a prerequisite bridge on a page. */
export const bridgeAnchor = (ref: string) => `bridge-${ref}`;

export const repoUrl = (path: string) => `${site.repository}/tree/main/${path.replace(/\/$/, "")}`;
