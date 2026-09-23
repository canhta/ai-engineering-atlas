import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

// How it works (DESIGN.md → Information architecture, How it works). Every expected value comes from the content model: the
// learner states, the described capability types, and the tracked collection's step blocks.
type L10n = { en: string; vi?: string };
type Entry = { label: L10n; order: number; description?: L10n };
type Model = {
  vocabularies: Record<string, Record<string, Entry>>;
  collections: { id: string; fields: Record<string, { vocabulary?: string }>; progress?: { target_field?: string } }[];
  items: Record<string, { page?: { blocks: { id: string; title: L10n; step?: boolean }[] } }[]>;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));

const inOrder = (vocabulary: string) => Object.values(model.vocabularies[vocabulary]).sort((a, b) => a.order - b.order);
const tracked = model.collections.find((c) => c.progress?.target_field)!;
const STATE_VOCABULARY = tracked.fields[tracked.progress!.target_field!].vocabulary!;
const STATES = inOrder(STATE_VOCABULARY);
const TYPE_VOCABULARY = Object.values(tracked.fields)
  .map((f) => f.vocabulary)
  .find((v) => v && v !== STATE_VOCABULARY && inOrder(v).every((e) => e.description))!;
const TYPES = inOrder(TYPE_VOCABULARY);
/** Each page's step block titles, in page order. */
const PAGE_STEPS = (model.items[tracked.id] ?? [])
  .filter((item) => item.page)
  .map((item) => item.page!.blocks.filter((b) => b.step).map((b) => b.title));
const ui = (lang: "en" | "vi"): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), "utf8"));
const sentence = (label: string) => label.charAt(0).toLocaleUpperCase() + label.slice(1);
const pick = (l: L10n, lang: "en" | "vi") => (lang === "en" ? l.en : (l.vi ?? l.en));

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
}

for (const lang of ["en", "vi"] as const) {
  test(`every learner state, capability type, and step appears in order (${lang})`, async ({ page }) => {
    await open(page, `/${lang}/how/`);
    const key = page.locator(".how-key .how-row");
    await expect(key).toHaveCount(STATES.length);
    for (const [i, state] of STATES.entries()) {
      await expect(key.nth(i).locator("dt")).toHaveText(sentence(pick(state.label, lang)));
      await expect(key.nth(i).locator("dd")).toHaveText(pick(state.description!, lang));
    }

    const rows = page.locator(".how-table tbody tr");
    await expect(rows).toHaveCount(TYPES.length);
    for (const [i, type] of TYPES.entries()) {
      await expect(rows.nth(i).locator("th")).toHaveText(sentence(pick(type.label, lang)));
      await expect(rows.nth(i).locator("td")).toHaveText(pick(type.description!, lang));
    }

    const titles = (await page.locator(".how-contents .how-step > :first-child").allTextContents()).map((s) =>
      s.trim(),
    );
    // Every step title appears once, and each route's own steps keep their order.
    const all = new Set(PAGE_STEPS.flat().map((title) => pick(title, lang)));
    expect(titles.toSorted()).toEqual([...all].toSorted());
    for (const steps of PAGE_STEPS) {
      const own = steps.map((title) => pick(title, lang));
      expect(titles.filter((title) => own.includes(title))).toEqual(own);
    }
    // Numbered steps count up from 1, as in a route's contents rail.
    const numbers = (await page.locator(".how-number").allTextContents()).filter(Boolean).map(Number);
    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
  });
}

test("Home's hero and the footer link to the page", async ({ page }) => {
  const t = ui("en");
  await open(page, "/en/");
  const hero = page.locator(".hero-actions");
  await expect(hero.getByRole("link", { name: t["home.start"] })).toBeVisible();
  await expect(hero.getByRole("link", { name: t["home.jump"] })).toBeVisible();
  await hero.getByRole("link", { name: t["how.title"] }).click();
  await expect(page).toHaveURL(/\/en\/how\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(t["how.title"]);
  await page.locator("footer").getByRole("link", { name: t["how.title"] }).click();
  await expect(page).toHaveURL(/\/en\/how\/$/);
});

test("the page reads without horizontal scroll on a phone @mobile", async ({ page }) => {
  await open(page, "/vi/how/");
  await expect(page.locator(".how-key .how-row")).toHaveCount(STATES.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
