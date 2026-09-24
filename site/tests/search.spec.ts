import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { isConsoleError } from "./fixtures/console";

// Search across everything (DESIGN.md → Information architecture). Titles, labels, and counts come
// from the content model and the UI strings, never typed in: the curriculum grows.
type L10n = { en: string; vi?: string };
type Item = { id: string; title: L10n; fields: Record<string, unknown>; page?: { blocks: { type: string }[] } };
type Model = {
  collections: { id: string; label: L10n; group_by?: string; fields: Record<string, { vocabulary?: string }> }[];
  vocabularies: Record<string, Record<string, { label: L10n }>>;
  items: Record<string, Item[]>;
  resources: Record<string, { title: string }>;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const en: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8"));
const vi: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/vi.json", import.meta.url), "utf8"));

const [tracked, ...others] = model.collections;
const firstPaged = (id: string) => model.items[id].find((item) => item.page)!;
const ROUTE = firstPaged(tracked.id);
const LAB = firstPaged("labs");
const PROJECT = firstPaged("projects");
/** A source cited by a sources block of a route: the Library lists exactly these. */
const SOURCE = (() => {
  for (const item of model.items[tracked.id])
    for (const block of item.page?.blocks ?? []) {
      const row = (block as { rows?: { resource?: string }[] }).rows?.find((r) => r.resource);
      if (block.type === "sources" && row?.resource) return model.resources[row.resource].title;
    }
  throw new Error("no cited source");
})();
const label = (id: string) => others.find((c) => c.id === id)!.label.en;

// Every test fails on a console error, an uncaught exception, or a CSP violation.
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (m) => isConsoleError(m) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`),
    );
  });
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

/** The results section of one kind, named by its heading ("Routes 3"). */
const kind = (page: Page, name: string) =>
  page.getByRole("region", { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\d+$`) });

test("a route, a lab, a project, and a source are each found by title under their kind", async ({ page }) => {
  await open(page, "/en/search/");
  const field = page.getByRole("searchbox", { name: en["search.label"] });
  const status = page.getByRole("status");
  const cases: [string, string, RegExp][] = [
    [ROUTE.title.en, en["search.routes"], new RegExp(`^/en/routes/${ROUTE.id}/$`)],
    [LAB.title.en, label("labs"), new RegExp(`^/en/labs/${LAB.id}/$`)],
    [PROJECT.title.en, label("projects"), new RegExp(`^/en/projects/${PROJECT.id}/$`)],
    [SOURCE, en["library.title"], /^https?:\/\//],
  ];
  for (const [title, kindLabel, href] of cases) {
    await field.fill(title);
    const section = kind(page, kindLabel);
    const link = section.getByRole("link", { name: title }).first();
    await expect(link).toHaveAttribute("href", href);
    // The heading counts the section's entries, and the status announces the total.
    const shown = await section.getByRole("listitem").count();
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(`${kindLabel} ${shown}`);
    const total = await page.locator(".search-entry").count();
    await expect(status).toHaveText(total === 1 ? en["search.resultOne"] : `${total} results`);
    await expect(link.locator("mark").first()).toBeVisible();
  }
  await field.fill("zzzz no such thing");
  await expect(status).toHaveText(en["search.none"].replace("{query}", "zzzz no such thing"));
  await expect(page.getByRole("link", { name: en["search.atlasList"] })).toHaveAttribute("href", "/en/map/?view=list");
});

test("?q= fills the field and runs the search; typing keeps it in the URL; clearing restores the empty state", async ({
  page,
}) => {
  await open(page, `/en/search/?q=${encodeURIComponent(ROUTE.title.en)}`);
  const field = page.getByRole("searchbox", { name: en["search.label"] });
  await expect(field).toHaveValue(ROUTE.title.en);
  await expect(kind(page, en["search.routes"]).getByRole("link", { name: ROUTE.title.en }).first()).toBeVisible();

  await field.fill(LAB.title.en);
  await expect(page).toHaveURL(new RegExp(`\\?q=${encodeURIComponent(LAB.title.en).replace(/%20/g, "(\\+|%20)")}$`));

  await page.getByRole("button", { name: en["map.clearSearch"] }).click();
  await expect(field).toHaveValue("");
  await expect(field).toBeFocused();
  await expect(page.locator(".search-kind")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("");
  await expect(page).toHaveURL(/\/en\/search\/$/);
  await expect(page.getByRole("link", { name: en["library.title"], exact: true }).last()).toHaveAttribute(
    "href",
    "/en/sources/",
  );
});

test("a Vietnamese query without diacritics finds what it names", async ({ page }) => {
  // A region label with diacritics finds the routes in that region.
  const field = tracked.group_by!;
  const routesIn = (value: string) =>
    model.items[tracked.id].filter((item) => item.page && item.fields[field] === value);
  const found = Object.entries(model.vocabularies[tracked.fields[field].vocabulary!]).find(
    ([value, e]) => e.label.vi && /[^\p{ASCII}]/u.test(e.label.vi) && routesIn(value).length > 0,
  );
  test.skip(!found, "no region with routes has a Vietnamese label with diacritics");
  const [value, entry] = found!;
  const plain = entry.label.vi!.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/giu, "d");
  const inRegion = routesIn(value);

  await open(page, `/vi/search/?q=${encodeURIComponent(plain)}`);
  const section = kind(page, vi["search.routes"]);
  await expect(section.getByRole("heading", { level: 2 })).toHaveText(`${vi["search.routes"]} ${inRegion.length}`);
  await expect(section.getByRole("link", { name: inRegion[0].title.vi ?? inRegion[0].title.en })).toBeVisible();
});

test("the index is a same-origin static asset per language", async ({ request }) => {
  for (const lang of ["en", "vi"]) {
    const response = await request.get(`/${lang}/search/index.json`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/json");
    const index = (await response.json()) as { kinds: { id: string; entries: unknown[] }[] };
    const paged = model.items[tracked.id].filter((item) => item.page).length;
    expect(index.kinds.find((k) => k.id === tracked.id)?.entries).toHaveLength(paged);
  }
});

test("the top bar links to search and marks it current", async ({ page }) => {
  await open(page, "/en/");
  const nav = page.getByRole("navigation", { name: en["nav.label"] });
  await nav.getByRole("link", { name: en["nav.search"], exact: true }).click();
  await expect(page).toHaveURL(/\/en\/search\/$/);
  await expect(nav.getByRole("link", { name: en["nav.search"], exact: true })).toHaveAttribute("aria-current", "page");
});

test("@mobile the top bar keeps the search link on its second row without overflowing", async ({ page }) => {
  for (const lang of ["en", "vi"]) {
    await open(page, `/${lang}/search/`);
    const link = page.getByRole("link", { name: (lang === "en" ? en : vi)["nav.search"], exact: true });
    await expect(link).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // Two rows: the wordmark, then the tabs and languages.
    const rows = await page
      .locator(".topbar-inner > :is(.wordmark, .topbar-tabs, .topbar-langs)")
      .evaluateAll((els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size);
    expect(rows).toBe(2);
  }
});

test("without JavaScript the page is a plain form with links to browse instead", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/search/");
  const field = page.getByRole("searchbox", { name: en["search.label"] });
  await expect(field).toHaveAttribute("name", "q");
  await expect(page.locator("form")).toHaveAttribute("action", "/en/search/");
  await expect(page.getByRole("link", { name: en["search.atlasList"] })).toHaveAttribute("href", "/en/map/?view=list");
  await expect(page.getByRole("link", { name: en["library.title"], exact: true }).last()).toHaveAttribute(
    "href",
    "/en/sources/",
  );
  await context.close();
});
