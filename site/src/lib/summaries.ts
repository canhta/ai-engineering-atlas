// Plain props for the plate, drawer, filters, and list, built from the content model at build
// time. Islands import only the types from here, never the model itself.
import type { Lang } from "../i18n";
import {
  collections,
  fieldChips,
  groupsOf,
  hasPage,
  headerChips,
  itemUrl,
  itemsOf,
  refOf,
  relations,
  relationsTo,
  resolveRef,
  targetOf,
  text,
  trackedCollection as c,
  trackedItems,
  vocabularyLabel,
  vocabularyValues,
  type Localized,
} from "./atlas";
import { graphOf, type GraphItem } from "./recommend";

export interface TileData {
  ref: string;
  title: Localized;
  group: string;
  href?: string;
  /** Label of the item's page condition value ("ready", "mapped, no route"). */
  maturity: string;
  /** Refs of declared prerequisites (relations of type prerequisite pointing at this item). */
  needs: string[];
  /** Field values for filtering, by field name. */
  values: Record<string, string[]>;
  /** Refs of related items in other collections (for their facets). */
  relatedTo: string[];
  /** Labelled values of the collection's list fields, in column order. */
  list: string[];
}

/** Column headers of the list view (the collection's list fields). */
export const listColumns = (lang: Lang) => (c.list_fields ?? []).map((f) => text(c.fields[f]?.label, lang).value);

export interface RegionData {
  value: string;
  label: Localized;
  tiles: TileData[];
}

export interface ItemDetail {
  ref: string;
  title: Localized;
  groupLabel?: Localized;
  href?: string;
  maturity: string;
  chips: { code?: string; label: Localized }[];
  lead?: Localized;
  needs: { ref: string; title: Localized; href?: string; bridged: boolean }[];
  sources: number;
  tasks: number;
  diagnosticAnchor?: string;
  related: { label: Localized; items: { title: Localized; href?: string }[] }[];
  target?: string;
}

export interface FacetData {
  field: string;
  label: string;
  options: { value: string; label: Localized }[];
}

export interface RelatedFacetData {
  label: string;
  options: { ref: string; title: Localized }[];
}

const titleOf = (ref: string, lang: Lang): Localized => {
  const found = resolveRef(ref);
  return found ? text(found.item.title, lang) : { value: ref, lang: "en" };
};

const maturityOf = (item: (typeof trackedItems)[number], lang: Lang) => {
  const field = c.page_when?.field;
  const value = field ? String(item.fields[field] ?? "") : "";
  return field ? vocabularyLabel(c.fields[field]?.vocabulary, value, lang).value : "";
};

export function plateRegions(lang: Lang): RegionData[] {
  const others = new Set(collections.filter((o) => o !== c).map((o) => o.ref_prefix).filter(Boolean));
  return groupsOf(c).map((g) => ({
    value: g.value,
    label: vocabularyLabel(g.vocabulary, g.value, lang),
    tiles: g.items.map((item) => {
      const ref = refOf(c, item);
      return {
        ref,
        title: text(item.title, lang),
        group: g.value,
        href: itemUrl(lang, ref),
        maturity: maturityOf(item, lang),
        needs: relationsTo("prerequisite", ref).map((r) => r.from),
        values: Object.fromEntries(Object.keys(c.fields).map((f) => [f, fieldChips(c, item, f, lang).map((chip) => chip.value)])),
        relatedTo: relations.filter((r) => r.to === ref && others.has(r.from.split(":")[0])).map((r) => r.from),
        list: (c.list_fields ?? []).map((f) =>
          fieldChips(c, item, f, lang)
            .map((chip) => chip.label.value)
            .join(", "),
        ),
      };
    }),
  }));
}

export function itemDetails(lang: Lang): Record<string, ItemDetail> {
  const details: Record<string, ItemDetail> = {};
  for (const item of trackedItems) {
    const ref = refOf(c, item);
    const blocks = item.page?.blocks ?? [];
    const lead = blocks.find((b) => b.type === "text");
    const prereqBlock = blocks.find((b) => b.type === "prerequisites");
    const bridged = new Set(prereqBlock?.type === "prerequisites" ? prereqBlock.items.filter((p) => p.bridge).map((p) => p.ref) : []);
    const diagnostic = blocks.find((b) => b.type === "diagnostic");
    const groupField = c.group_by;
    const groupValue = groupField ? String(item.fields[groupField] ?? "") : "";
    const relatedRefs = [
      ...relations.filter((r) => r.type !== "prerequisite" && r.from === ref).map((r) => r.to),
      ...relations.filter((r) => r.type !== "prerequisite" && r.to === ref).map((r) => r.from),
    ];
    const byCollection = new Map<string, { label: Localized; items: { title: Localized; href?: string }[] }>();
    for (const related of relatedRefs) {
      const found = resolveRef(related);
      if (!found || found.collection === c) continue;
      const entry = byCollection.get(found.collection.id) ?? { label: text(found.collection.label, lang), items: [] };
      entry.items.push({ title: text(found.item.title, lang), href: itemUrl(lang, related) });
      byCollection.set(found.collection.id, entry);
    }
    const page = hasPage(item);
    details[ref] = {
      ref,
      title: text(item.title, lang),
      groupLabel: groupField ? vocabularyLabel(c.fields[groupField]?.vocabulary, groupValue, lang) : undefined,
      href: itemUrl(lang, ref),
      maturity: maturityOf(item, lang),
      chips: page
        ? headerChips(c, item, lang).map((chip) => ({
            code: chip.value.length <= 3 && chip.value !== chip.label.value ? chip.value : undefined,
            label: chip.label,
          }))
        : [],
      lead: lead?.type === "text" ? text(lead.body, lang) : undefined,
      needs: relationsTo("prerequisite", ref).map((r) => ({
        ref: r.from,
        title: titleOf(r.from, lang),
        href: itemUrl(lang, r.from),
        bridged: bridged.has(r.from),
      })),
      sources: blocks.reduce((n, b) => n + (b.type === "sources" ? b.rows.length : 0), 0),
      tasks: diagnostic?.type === "diagnostic" ? diagnostic.tasks.length : 0,
      diagnosticAnchor: diagnostic?.id,
      related: [...byCollection.values()],
      target: page ? targetOf(c, item) : undefined,
    };
  }
  return details;
}

/** Facets offered as filters; the page condition field is the "ready only" toggle instead. */
export function facets(lang: Lang): FacetData[] {
  return (c.facets ?? [])
    .filter((f) => f !== c.page_when?.field)
    .map((field) => {
      const vocabulary = c.fields[field]?.vocabulary;
      return {
        field,
        label: text(c.fields[field]?.label, lang).value,
        options: (vocabulary ? vocabularyValues(vocabulary) : []).map((value) => ({ value, label: vocabularyLabel(vocabulary, value, lang) })),
      };
    });
}

/** One facet per other collection whose items have relations pointing at tracked items. */
export function relatedFacets(lang: Lang): RelatedFacetData[] {
  const tracked = new Set(trackedItems.map((i) => refOf(c, i)));
  return collections
    .filter((other) => other !== c)
    .map((other) => ({
      label: text(other.label, lang).value,
      options: itemsOf(other.id)
        .filter((item) => relations.some((r) => r.from === refOf(other, item) && tracked.has(r.to)))
        .map((item) => ({ ref: refOf(other, item), title: text(item.title, lang) })),
    }))
    .filter((f) => f.options.length > 0);
}

/** The tracked collection as the next-step recommendation sees it (src/lib/recommend.ts). */
export const nextGraph = (): GraphItem[] => graphOf(c, trackedItems, relations);

export interface NextLink {
  title: Localized;
  /** The item's page. */
  href?: string;
  /** Its diagnostic on the page: where a delayed-retrieval check starts. */
  check?: string;
}

/** Titles and links for the given tracked items, or for every item with a page (the only ones recommended). */
export function nextLinks(lang: Lang, refs?: string[]): Record<string, NextLink> {
  const links: Record<string, NextLink> = {};
  for (const item of trackedItems) {
    const ref = refOf(c, item);
    const href = itemUrl(lang, ref);
    if (refs ? !refs.includes(ref) : !href) continue;
    const diagnostic = item.page?.blocks.find((b) => b.type === "diagnostic");
    links[ref] = { title: text(item.title, lang), href, check: href && diagnostic ? `${href}#${diagnostic.id}` : href };
  }
  return links;
}
