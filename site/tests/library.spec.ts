import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { isConsoleError } from "./fixtures/console";

// The Library as a bibliography in sections (DESIGN.md → Library). Every expected value comes from
// the content model, never typed in: the curriculum grows, and a pinned count fails on the next
// route promotion rather than on a regression.
type L10n = { en: string; vi?: string };
type Block = {
  type: string;
  rows?: { resource?: string }[];
  groups?: { items: { resource?: string }[] }[];
  items?: { bridge?: { resource?: string } }[];
};
type Model = {
  vocabularies: Record<string, Record<string, { label: L10n; order: number }>>;
  items: Record<string, { id: string; page?: { blocks: Block[] } }[]>;
  resources: Record<string, { title: string; type?: string }>;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));

/** Resource key → the distinct pages citing it, from the same blocks the Library reads. */
const citing = new Map<string, Set<string>>();
for (const [collection, items] of Object.entries(model.items))
  for (const item of items)
    for (const block of item.page?.blocks ?? []) {
      const keys = [
        ...(block.type === "sources" ? (block.rows ?? []).map((r) => r.resource) : []),
        ...(block.type === "practice" ? (block.groups ?? []).flatMap((g) => g.items.map((i) => i.resource)) : []),
        ...(block.type === "prerequisites" ? (block.items ?? []).map((p) => p.bridge?.resource) : []),
      ];
      for (const key of keys)
        if (key && model.resources[key]) {
          const pages = citing.get(key) ?? new Set();
          pages.add(`${collection}/${item.id}`);
          citing.set(key, pages);
        }
    }

const SOURCES = citing.size;
const kindLabel = (kind: string) => model.vocabularies.resource_type[kind].label.en;
const sentence = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);
/** Types present among cited sources, in the vocabulary's order, with their counts. */
const KINDS = Object.entries(
  [...citing.keys()].reduce<Record<string, number>>((counts, key) => {
    const kind = model.resources[key].type!;
    counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {}),
).sort(([a], [b]) => model.vocabularies.resource_type[a].order - model.vocabularies.resource_type[b].order);
/** The source cited by the most pages: it must collapse its citations after the first two. */
const [MOST_CITED, MOST_PAGES] = [...citing.entries()].sort((a, b) => b[1].size - a[1].size)[0];

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => isConsoleError(m) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

const sections = (page: Page) => page.locator(".library-section");
const entry = (page: Page, key: string) =>
  page.locator(".library-entry").filter({
    has: page.getByRole("link", { name: `${model.resources[key].title} (opens external site)`, exact: true }),
  });

test("the library is one section per type, in the vocabulary's order, each source once", async ({ page }) => {
  await open(page, "/en/sources/");
  await expect(sections(page)).toHaveCount(KINDS.length);
  for (const [i, [kind, count]] of KINDS.entries()) {
    const section = sections(page).nth(i);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(`${sentence(kindLabel(kind))} ${count}`);
    await expect(section.locator(".library-entry")).toHaveCount(count);
    // Ordered by how many pages cite a source: the counts never rise down a section.
    const pages = await section
      .locator(".library-entry")
      .evaluateAll((entries) => entries.map((e) => e.querySelectorAll(".library-citation").length));
    expect(pages).toEqual([...pages].sort((a, b) => b - a));
  }
  // Every cited source appears exactly once, across all sections.
  const titles = await page.locator(".library-work h3").allTextContents();
  const expected = [...citing.keys()].map((key) => `${model.resources[key].title}(opens external site)`);
  expect(titles.sort()).toEqual(expected.sort());
});

test("citations beyond the first two collapse behind 'and N more', and every one stays reachable", async ({ page }) => {
  test.skip(MOST_PAGES.size <= 2, "no source is cited by more than two pages");
  await open(page, "/en/sources/");
  const most = entry(page, MOST_CITED);
  const citations = most.locator(".library-citation");
  await expect(citations).toHaveCount(MOST_PAGES.size);
  await expect(citations.filter({ visible: true })).toHaveCount(2);

  const more = most.getByText(`and ${MOST_PAGES.size - 2} more`);
  await more.focus();
  await page.keyboard.press("Enter");
  await expect(citations.filter({ visible: true })).toHaveCount(MOST_PAGES.size);
  for (const link of await citations.getByRole("link").all()) await expect(link).toHaveAttribute("href", /^\/en\//);
});

test("search and the type contents narrow the sections and announce the count", async ({ page }) => {
  await open(page, "/en/sources/");
  const status = page.getByRole("status");
  await expect(status).toHaveText(`${SOURCES} of ${SOURCES} sources`);

  // A type in the contents is a toggle: pressed, only its section remains.
  const [kind, count] = KINDS[KINDS.length - 1];
  const toggle = page.getByRole("button", { name: new RegExp(`^${kindLabel(kind)}`, "i") });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(sections(page)).toHaveCount(1);
  await expect(sections(page).getByRole("heading", { level: 2 })).toHaveText(`${sentence(kindLabel(kind))} ${count}`);
  await expect(status).toHaveText(`${count} of ${SOURCES} sources`);
  await page.getByRole("button", { name: /^All types/ }).click();
  await expect(sections(page)).toHaveCount(KINDS.length);

  // Search keeps only the sections with a match, and the heading counts what is left.
  const title = model.resources[MOST_CITED].title;
  await page.getByRole("searchbox", { name: "Search sources" }).fill(title);
  await expect(status).not.toHaveText(`${SOURCES} of ${SOURCES} sources`);
  await expect(entry(page, MOST_CITED)).toBeVisible();
  const left = await page.locator(".library-entry").count();
  await expect(status).toHaveText(`${left} of ${SOURCES} sources`);
  await expect(sections(page).first().locator(".library-section-count")).toHaveText(
    String(await sections(page).first().locator(".library-entry").count()),
  );

  await page.getByRole("searchbox", { name: "Search sources" }).fill("zzzz no such source");
  await expect(status).toHaveText(`0 of ${SOURCES} sources`);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(status).toHaveText(`${SOURCES} of ${SOURCES} sources`);
});

test("without JavaScript the grouped list reads, the contents link to sections, and 'more' opens", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/sources/");
  await expect(sections(page)).toHaveCount(KINDS.length);
  await expect(page.locator(".library-entry")).toHaveCount(SOURCES);
  const [kind] = KINDS[0];
  const contents = page.getByRole("navigation", { name: "Contents" });
  await contents.getByRole("link", { name: new RegExp(`^${kindLabel(kind)}`, "i") }).click();
  await expect(page).toHaveURL(new RegExp(`#type-${kind}$`));
  if (MOST_PAGES.size > 2) {
    const citations = entry(page, MOST_CITED).locator(".library-citation");
    await entry(page, MOST_CITED)
      .getByText(`and ${MOST_PAGES.size - 2} more`)
      .click();
    await expect(citations.filter({ visible: true })).toHaveCount(MOST_PAGES.size);
  }
  await context.close();
});

test("@mobile the library reads in one column without horizontal scroll", async ({ page }) => {
  await open(page, "/en/sources/");
  await expect(sections(page)).toHaveCount(KINDS.length);
  const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(width);
  // The contents sit above the sections rather than beside them.
  const [contents, first] = await Promise.all([
    page.locator(".library-contents").boundingBox(),
    sections(page).first().boundingBox(),
  ]);
  expect(first!.y).toBeGreaterThan(contents!.y + contents!.height - 1);
});
