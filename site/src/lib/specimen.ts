// The Home specimen (DESIGN.md → Home): one ready route shown through its own blocks, its first
// diagnostic task, its first source, and its last step list (the evidence it asks for). Built at
// build time from the content model, so it cannot drift from the route page.
import type { Lang } from "../i18n";
import {
  type Block,
  groupOf,
  type Item,
  itemUrl,
  type Localized,
  pagedItems,
  type ResolvedResource,
  resolveRef,
  resolveResource,
  site,
  text,
  trackedCollection as c,
  vocabularyLabel,
} from "./atlas.ts";
import { refOf } from "./refs.ts";

export interface Specimen {
  ref: string;
  href: string;
  title: Localized;
  group?: Localized;
  diagnostic: { title: Localized; prompt: Localized; count: number };
  reading: {
    title: Localized;
    count: number;
    resource: ResolvedResource;
    kind?: Localized;
    locator: Localized;
    purpose: Localized;
  };
  evidence: { title: Localized; items: Localized[] };
  /** Some passage shows in English on a page in another language. */
  untranslated: boolean;
}

/** The blocks a specimen shows, or undefined when the page lacks one of them. */
function parts(blocks: Block[]) {
  const diagnostic = blocks.find((b) => b.type === "diagnostic" && b.tasks.length > 0);
  const sources = blocks.find((b) => b.type === "sources" && b.rows.length > 0);
  const evidence = blocks.filter((b) => b.type === "list" && b.step && b.items.length > 0).at(-1);
  if (diagnostic?.type !== "diagnostic" || sources?.type !== "sources" || evidence?.type !== "list") return undefined;
  return { diagnostic, sources, evidence };
}

/**
 * The route the model names in `site.specimen` when its page has a diagnostic task, a source, and
 * a step list; otherwise the first tracked item with a page that has them.
 */
export function specimenItem(): Item | undefined {
  const qualifies = (item: Item | undefined) => Boolean(item?.page && parts(item.page.blocks));
  const configured = site.specimen ? resolveRef(site.specimen) : undefined;
  if (configured?.collection === c && qualifies(configured.item)) return configured.item;
  return pagedItems(c).find(qualifies);
}

export function specimen(lang: Lang): Specimen | undefined {
  const item = specimenItem();
  const found = item?.page && parts(item.page.blocks);
  if (!item || !found) return undefined;
  const ref = refOf(c, item);
  const { diagnostic, sources, evidence } = found;
  const row = sources.rows[0];
  const resource = resolveResource(row.resource);
  const title = text(item.title, lang);
  const prompt = text(diagnostic.tasks[0], lang);
  const locator = text(row.locator, lang);
  const purpose = text(row.purpose, lang);
  const criteria = evidence.items.map((i) => text(i, lang));
  return {
    ref,
    href: itemUrl(lang, ref)!,
    title,
    group: groupOf(c, item, lang)?.label,
    diagnostic: { title: text(diagnostic.title, lang), prompt, count: diagnostic.tasks.length },
    reading: {
      title: text(sources.title, lang),
      count: sources.rows.length,
      resource,
      kind: resource.kind ? vocabularyLabel("resource_type", resource.kind, lang) : undefined,
      locator,
      purpose,
    },
    evidence: { title: text(evidence.title, lang), items: criteria },
    untranslated: [title, prompt, locator, purpose, ...criteria].some((p) => p.lang !== lang),
  };
}
