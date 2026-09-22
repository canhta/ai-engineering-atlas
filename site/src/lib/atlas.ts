// Typed reader of the content model v2 (rfcs/0000-content-model.md, schemas/site-data.schema.json).
// The site knows collections, items, blocks, vocabularies, relations, and resources; it never
// names a curriculum field (scripts/check-content-coupling.mjs enforces this).
import model from "../data/atlas.json";
import type { Lang } from "../i18n";

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
  list_fields?: string[];
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
  | DataBlock;
export const BLOCK_TYPES = ["text", "list", "prerequisites", "diagnostic", "sources", "practice", "runner", "data"] as const;

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

interface Model {
  version: number;
  site: { title: L10n; tagline: L10n; repository: string };
  locales: string[];
  vocabularies: Record<string, Vocabulary>;
  collections: Collection[];
  items: Record<string, Item[]>;
  relations: Relation[];
  resources: Record<string, Resource>;
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
export const relations = atlas.relations;

export const collection = (id: string) => collections.find((c) => c.id === id);
export const itemsOf = (collectionId: string): Item[] => atlas.items[collectionId] ?? [];

/** The collection whose items carry learner progress (the atlas map and plate). */
export const trackedCollection: Collection = (() => {
  const found = collections.find((c) => c.progress?.tracks);
  if (!found) throw new Error("atlas.json: no collection tracks progress");
  return found;
})();
export const trackedItems = itemsOf(trackedCollection.id);

/** Reference string for an item: `<ref_prefix>:<id>`, or the bare id when the collection has no prefix. */
export const refOf = (c: Collection, item: Item) => (c.ref_prefix ? `${c.ref_prefix}:${item.id}` : item.id);

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
  return listValue(item.fields[field]).map((value) => ({ field, value, label: vocabularyLabel(spec?.vocabulary, value, lang) }));
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

export function groupOf(c: Collection, item: Item, lang: Lang) {
  if (!c.group_by) return undefined;
  const value = listValue(item.fields[c.group_by])[0];
  return value === undefined ? undefined : { value, label: vocabularyLabel(c.fields[c.group_by]?.vocabulary, value, lang) };
}

/** Groups of a collection in vocabulary order, each with its items in content order. */
export function groupsOf(c: Collection) {
  const field = c.group_by;
  const vocabulary = field ? c.fields[field]?.vocabulary : undefined;
  if (!field || !vocabulary) return [{ value: "", vocabulary, items: itemsOf(c.id) }];
  return vocabularyValues(vocabulary)
    .map((value) => ({ value, vocabulary, items: itemsOf(c.id).filter((i) => listValue(i.fields[field])[0] === value) }))
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

/** Tracked items (with a page) that point at this item through any relation, e.g. the competencies a lab practises. */
export function trackedItemsPointingAt(ref: string): Item[] {
  const seen = new Set<string>();
  return relations
    .filter((r) => r.to === ref)
    .map((r) => resolveRef(r.from))
    .filter((found): found is { collection: Collection; item: Item } => Boolean(found && found.collection.id === trackedCollection.id && found.item.page))
    .map((found) => found.item)
    .filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)));
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

/** Anchor of a prerequisite bridge on a page. */
export const bridgeAnchor = (ref: string) => `bridge-${ref}`;

export const repoUrl = (path: string) => `${site.repository}/tree/main/${path.replace(/\/$/, "")}`;
