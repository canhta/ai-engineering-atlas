// How it works (DESIGN.md → Information architecture, How it works): the learning model as a key, built from the content
// model at build time. The states and the evidence per capability type are vocabularies whose
// entries carry a description; the steps are the tracked collection's `step` blocks.
import type { Lang } from "../i18n";
import {
  type Localized,
  pagedItems,
  stateVocabulary,
  text,
  trackedCollection as c,
  vocabularies,
  vocabularyValues,
} from "./atlas.ts";

export interface KeyEntry {
  value: string;
  label: Localized;
  meaning: Localized;
}

export interface Step {
  id: string;
  title: Localized;
  /** Every page of the tracked collection has this step; the others appear on some pages only. */
  everywhere: boolean;
}

const described = (vocabulary: string, lang: Lang): KeyEntry[] =>
  vocabularyValues(vocabulary).map((value) => {
    const entry = vocabularies[vocabulary][value];
    return { value, label: text(entry.label, lang), meaning: text(entry.description, lang) };
  });

const isDescribed = (vocabulary: string) =>
  vocabularyValues(vocabulary).every((value) => Boolean(vocabularies[vocabulary][value].description));

/** The learner states in order, each with its meaning. */
export const stateKey = (lang: Lang) => described(stateVocabulary, lang);

/**
 * What counts as evidence: the tracked collection's other described vocabulary field (the
 * capability types), with its label. Undefined when the model describes none.
 */
export function evidenceKey(lang: Lang): { label: Localized; rows: KeyEntry[] } | undefined {
  const field = Object.values(c.fields).find(
    (spec) => spec.vocabulary && spec.vocabulary !== stateVocabulary && isDescribed(spec.vocabulary),
  );
  return field?.vocabulary ? { label: text(field.label, lang), rows: described(field.vocabulary, lang) } : undefined;
}

/**
 * A route's steps in page order: the union of the `step` blocks across the tracked collection's
 * pages. A step only some pages have is placed after the step it follows there.
 */
export function routeSteps(lang: Lang): Step[] {
  const pages = pagedItems(c).map((item) => (item.page?.blocks ?? []).filter((b) => b.step));
  const order: string[] = [];
  const titles = new Map<string, Localized>();
  for (const steps of pages) {
    let after = -1;
    for (const block of steps) {
      const at = order.indexOf(block.id);
      if (at === -1) {
        order.splice(after + 1, 0, block.id);
        titles.set(block.id, text(block.title, lang));
        after += 1;
      } else after = at;
    }
  }
  return order.map((id) => ({
    id,
    title: titles.get(id)!,
    everywhere: pages.every((steps) => steps.some((b) => b.id === id)),
  }));
}
