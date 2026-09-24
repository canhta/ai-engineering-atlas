import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

// What changed (DESIGN.md → Information architecture, What changed). Every expected value comes from
// the content model's `changes`, so the next promotion or release does not fail these tests.
type L10n = { en: string; vi?: string };
type Entry = {
  date: string;
  kind: string;
  refs: string[];
  unlisted?: string[];
  release?: string;
  decision?: { id: string; path: string };
  predates_review?: true;
  note?: L10n;
};
type Model = {
  site: { repository: string };
  vocabularies: Record<string, Record<string, { label: L10n }>>;
  collections: { id: string; ref_prefix?: string; page_when?: unknown; progress?: { tracks: boolean } }[];
  items: Record<string, { id: string; title: L10n; page?: unknown }[]>;
  changes: { vocabulary: string; releases: { version: string; date: string }[]; entries: Entry[] };
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const ui = (lang: "en" | "vi"): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), "utf8"));
const pick = (l: L10n, lang: "en" | "vi") => (lang === "en" ? l.en : (l.vi ?? l.en));
const kindLabel = (kind: string, lang: "en" | "vi") =>
  pick(model.vocabularies[model.changes.vocabulary][kind].label, lang);

const { entries, releases } = model.changes;
const anchor = (index: number) => `#change-${index + 1}`;
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const newestIndex = entries.reduce((best, e, i) => (e.date >= entries[best].date ? i : best), 0);

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
  test(`every recorded change appears once, unreleased first, releases newest first (${lang})`, async ({ page }) => {
    const t = ui(lang);
    await open(page, `/${lang}/changelog/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(t["changes.title"]);
    await expect(page.locator(".change")).toHaveCount(entries.length);

    const headings = (await page.locator(".release h2").allTextContents()).map((s) => s.trim());
    const expected = [
      ...(entries.some((e) => !e.release) ? [t["changes.unreleased"]] : []),
      ...releases
        .toSorted((a, b) => b.date.localeCompare(a.date))
        .map((r) => t["changes.release"].replace("{version}", r.version)),
    ];
    expect(headings).toEqual(expected);

    // Within a release, entries run newest first.
    const dates = await page
      .locator(".release")
      .first()
      .locator(".change time")
      .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
    expect(dates).toEqual(dates.toSorted().toReversed());
  });
}

test("an entry names its kind, its decision, and links the items it changed", async ({ page }) => {
  await open(page, "/en/changelog/");
  for (const [index, entry] of entries.entries()) {
    const row = page.locator(anchor(index));
    await expect(row.locator(".change-kind")).toHaveText(kindLabel(entry.kind, "en"));
    await expect(row.locator(".change-items li")).toHaveCount(entry.refs.length + (entry.unlisted?.length ?? 0));
    if (entry.decision) {
      const link = row.getByRole("link", { name: `RFC ${entry.decision.id}` });
      await expect(link).toHaveAttribute("href", new RegExp(`${entry.decision.path.replaceAll(".", "\\.")}$`));
    }
    // A change made before review says so, with its note; nothing claims a decision it did not have.
    if (entry.predates_review) {
      await expect(row).toContainText(ui("en")["changes.predates"]);
      await expect(row.locator(".change-note")).toHaveText(entry.note!.en);
      await expect(row.getByRole("link", { name: /^RFC / })).toHaveCount(0);
    }
    for (const id of entry.unlisted ?? []) await expect(row.locator("code", { hasText: id })).toBeVisible();
  }
  // A ready route in the record links to its page.
  const promoted = entries.findIndex((e) => e.refs.length > 0 && !e.refs[0].includes(":"));
  const ref = entries[promoted].refs[0];
  const item = model.items[tracked.id].find((i) => i.id === ref)!;
  await page.locator(anchor(promoted)).getByRole("link", { name: item.title.en }).click();
  await expect(page).toHaveURL(new RegExp(`/en/routes/${ref.replaceAll(".", "\\.")}/$`));
});

test("a route page dates its latest change and links to it", async ({ page }) => {
  const t = ui("vi");
  const index = entries.findLastIndex((e) => e.decision && e.refs.some((r) => !r.includes(":")));
  const entry = entries[index];
  const ref = entry.refs.find((r) => !r.includes(":"))!;
  await open(page, `/vi/routes/${ref}/`);
  const line = page.locator(".sheet-change");
  await expect(line).toContainText(kindLabel(entry.kind, "vi"));
  await expect(line.locator("time")).toHaveAttribute("datetime", entry.date);
  await expect(line.getByRole("link", { name: `RFC ${entry.decision!.id}` })).toBeVisible();
  await line.getByRole("link", { name: new RegExp(kindLabel(entry.kind, "vi")) }).click();
  await expect(page).toHaveURL(new RegExp(`/vi/changelog/${anchor(index)}$`));
  await expect(page.locator(anchor(index))).toBeInViewport();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(t["changes.title"]);
});

test("the footer links to the page and the header dates the latest change", async ({ page }) => {
  const t = ui("en");
  await open(page, "/en/");
  await page.locator("footer").getByRole("link", { name: t["changes.title"] }).click();
  await expect(page).toHaveURL(/\/en\/changelog\/$/);
  await expect(page.locator(".changes-summary time")).toHaveAttribute("datetime", entries[newestIndex].date);
});

test("the page reads without horizontal scroll on a phone @mobile", async ({ page }) => {
  await open(page, "/vi/changelog/");
  await expect(page.locator(".change")).toHaveCount(entries.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
