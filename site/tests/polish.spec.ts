// Review polish from the editorial-surfaces batch (.scratch/next-screens/issues/01-review-polish.md):
// learner state on route links for screen readers, Library search opening a collapsed citation,
// no shift in the Library contents on hydration, catalogue rows grouped by region, the untranslated
// marker on catalogue passages, and the Atlas filter menus below the mobile sheet's title. Every
// expected value comes from the content model.
import { readFileSync } from "node:fs";
import { type Browser, expect, type Page, test } from "@playwright/test";

type L10n = { en: string; vi?: string };
type Block = {
  id: string;
  type: string;
  body?: L10n;
  rows?: { resource?: string }[];
  groups?: { items: { resource?: string }[] }[];
  items?: { ref: string; bridge?: { resource?: string } }[];
};
type Item = { id: string; title: L10n; fields: Record<string, unknown>; page?: { blocks: Block[] } };
type Collection = {
  id: string;
  ref_prefix?: string;
  group_by?: string;
  page_when?: unknown;
  progress?: { tracks?: boolean };
  fields: Record<string, { vocabulary?: string }>;
};
type Model = {
  collections: Collection[];
  vocabularies: Record<string, Record<string, { label: L10n; order: number }>>;
  items: Record<string, Item[]>;
  relations: { type: string; from: string; to: string }[];
  resources: Record<string, { title: string }>;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const en: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8"));
const vi: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/vi.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const trackedItems = model.items[tracked.id];
const byId = new Map(trackedItems.map((i) => [i.id, i]));
const segment = tracked.page_when ? "routes" : tracked.id;
const refOf = (c: Collection, item: Item) => (c.ref_prefix ? `${c.ref_prefix}:${item.id}` : item.id);
const STATE = "learning";
const stateLabel = (state: string) => model.vocabularies.state[state].label.en;

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
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

/** Seeds one competency's state through an evidence record, before the page loads. */
async function seed(page: Page, ref: string, state: string) {
  await page.addInitScript(
    ([id, s]) => {
      const evidence = { id: "e1", kind: "diagnostic", supports_state: s, recorded_at: "2026-01-01" };
      localStorage.setItem(
        "atlas.progress.v2",
        JSON.stringify({
          version: 2,
          updated_at: "2026-01-01",
          competencies: {
            [id]: {
              current_state: s,
              target_state: "demonstrated",
              evidence: [evidence],
              state_history: [],
              next_action: "",
            },
          },
        }),
      );
    },
    [ref, state],
  );
}

// ---------------------------------------------------------------------------------------------
// Learner state on route links, for screen readers

const route = trackedItems.find((i) =>
  i.page?.blocks.some((b) => b.type === "prerequisites" && b.items?.some((p) => byId.get(p.ref)?.page)),
)!;
const prereqBlock = route.page!.blocks.find((b) => b.type === "prerequisites")!;
const readyPrereqs = prereqBlock.items!.filter((p) => byId.get(p.ref)?.page).map((p) => byId.get(p.ref)!);
const seeded = readyPrereqs[0];
const ROUTE = `/en/${segment}/${route.id}/`;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A link's name: its title, then the visually hidden maturity or state (the browser may space the comma). */
const spoken = (title: string, label: string) => new RegExp(`^${escape(title)}\\s*, ${escape(label)}$`);

test("the prerequisite line and the Prerequisites block name each prerequisite's state", async ({ page }) => {
  await seed(page, seeded.id, STATE);
  await open(page, ROUTE);
  const line = page.locator(".prereq-line").first();
  await expect(
    line.getByRole("link", { name: spoken(seeded.title.en, en["prereq.state"].replace("{state}", stateLabel(STATE))) }),
  ).toHaveCount(1);
  for (const other of readyPrereqs.slice(1))
    await expect(line.getByRole("link", { name: spoken(other.title.en, en["prereq.ready"]) })).toHaveCount(1);

  const block = page.locator(`#${prereqBlock.id}`);
  await expect(block.getByRole("link", { name: seeded.title.en, exact: true })).toHaveAccessibleDescription(
    stateLabel(STATE),
  );
  for (const other of readyPrereqs.slice(1))
    await expect(block.getByRole("link", { name: other.title.en, exact: true })).toHaveAccessibleDescription(
      en["prereq.ready"],
    );
});

test("a catalogue's route links name the learner's state", async ({ page }) => {
  const c = model.collections.find(
    (o) => o.id !== tracked.id && model.items[o.id].some((i) => relatedOf(o)(i).length),
  )!;
  const item = model.items[c.id].find((i) => relatedOf(c)(i).length > 0)!;
  const ref = relatedOf(c)(item)[0];
  await seed(page, ref, STATE);
  await open(page, `/en/${c.id}/`);
  const link = page.locator(`.catalogue tr[data-ref="${refOf(c, item)}"] a[href="/en/${segment}/${ref}/"]`);
  await expect(link).toHaveAccessibleName(
    spoken(byId.get(ref)!.title.en, en["prereq.state"].replace("{state}", stateLabel(STATE))),
  );
});

// ---------------------------------------------------------------------------------------------
// Library

/** Resource key → the pages citing it, in the order the Library collects them. */
const citing = new Map<string, Item[]>();
for (const c of model.collections)
  for (const item of model.items[c.id] ?? [])
    for (const block of item.page?.blocks ?? []) {
      const keys = [
        ...(block.type === "sources" ? (block.rows ?? []).map((r) => r.resource) : []),
        ...(block.type === "practice" ? (block.groups ?? []).flatMap((g) => g.items.map((i) => i.resource)) : []),
        ...(block.type === "prerequisites" ? (block.items ?? []).map((p) => p.bridge?.resource) : []),
      ];
      for (const key of keys)
        if (key && model.resources[key]) {
          const pages = citing.get(key) ?? [];
          if (!pages.includes(item)) pages.push(item);
          citing.set(key, pages);
        }
    }

// A source with a collapsed citation whose page title the source's own text and shown citations lack.
const collapsed = [...citing.entries()]
  .flatMap(([key, pages]) =>
    pages.slice(2).map((hidden) => ({ key, hidden, needle: hidden.title.en.toLowerCase(), pages })),
  )
  .find(
    ({ key, needle, pages }) =>
      !model.resources[key].title.toLowerCase().includes(needle) &&
      pages.slice(0, 2).every((p) => !p.title.en.toLowerCase().includes(needle)),
  );

test("a search that matches only a collapsed citation opens its 'and N more'", async ({ page }) => {
  test.skip(!collapsed, "no source has a collapsed citation with a distinct title");
  const { key, hidden } = collapsed!;
  await open(page, "/en/sources/");
  const entry = page.locator(".library-entry").filter({
    has: page.getByRole("link", { name: `${model.resources[key].title} (opens external site)`, exact: true }),
  });
  await expect(entry.locator("details")).not.toHaveAttribute("open");
  await page.getByRole("searchbox", { name: "Search sources" }).fill(hidden.title.en);
  await expect(entry.locator("details")).toHaveAttribute("open");
  await expect(entry.getByRole("link", { name: hidden.title.en, exact: true })).toBeVisible();
  // Clearing the search folds it again.
  await page.getByRole("searchbox", { name: "Search sources" }).fill("");
  await expect(entry.locator("details")).not.toHaveAttribute("open");
});

async function contentsLayout(browser: Browser, javaScriptEnabled: boolean) {
  const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  if (javaScriptEnabled) await open(page, "/en/sources/");
  else await page.goto("/en/sources/");
  // Measured once the fonts are in, so only hydration could move a row.
  const boxes = await page
    .locator(".library-kinds li, .library-results, .library-section h2")
    .evaluateAll(async (els) => {
      await document.fonts.ready;
      return els.map((e) => [e.textContent?.trim(), Math.round(e.getBoundingClientRect().y)]);
    });
  await context.close();
  return boxes;
}

test("the Library contents do not shift when the page hydrates", async ({ browser }) => {
  expect(await contentsLayout(browser, true)).toEqual(await contentsLayout(browser, false));
});

// ---------------------------------------------------------------------------------------------
// Catalogue

const withPage = new Set(trackedItems.filter((i) => i.page).map((i) => i.id));
function relatedOf(c: Collection) {
  const into = (ref: string) => model.relations.filter((r) => r.to === ref && withPage.has(r.from)).map((r) => r.from);
  const outOf = (ref: string) => model.relations.filter((r) => r.from === ref && withPage.has(r.to)).map((r) => r.to);
  const inward = model.items[c.id].some((item) => into(refOf(c, item)).length > 0);
  return (item: Item) => [...new Set((inward ? into : outOf)(refOf(c, item)))];
}
/** Beyond this many routes a catalogue row groups them by region (DESIGN.md → Collection indexes). */
const GROUP_BEYOND = 6;
const regionVocabulary = model.vocabularies[tracked.fields[tracked.group_by!].vocabulary!];
const regionOf = (ref: string) => byId.get(ref)!.fields[tracked.group_by!] as string;

test("a catalogue row with many routes groups them by region, in the vocabulary's order", async ({ page }) => {
  const rows = model.collections
    .filter((c) => c.id !== tracked.id)
    .flatMap((c) => model.items[c.id].map((item) => ({ c, item, routes: relatedOf(c)(item) })))
    .filter((row) => row.routes.length > 0);
  test.skip(!rows.some((row) => row.routes.length > GROUP_BEYOND), "no catalogue row has many routes");
  for (const { c, item, routes } of rows) {
    await open(page, `/en/${c.id}/`);
    const cell = page.locator(`.catalogue tr[data-ref="${refOf(c, item)}"] .catalogue-related`);
    const groups = cell.locator(".prereq-group");
    if (routes.length <= GROUP_BEYOND) {
      await expect(groups).toHaveCount(0);
      continue;
    }
    const regions = [...new Set(routes.map(regionOf))].sort(
      (a, b) => regionVocabulary[a].order - regionVocabulary[b].order,
    );
    await expect(groups.locator(".prereq-group-label")).toHaveText(regions.map((r) => regionVocabulary[r].label.en));
    for (const [i, region] of regions.entries()) {
      const inRegion = routes.filter((ref) => regionOf(ref) === region);
      await expect(groups.nth(i).getByRole("link")).toHaveCount(inRegion.length);
      for (const ref of inRegion)
        await expect(groups.nth(i).locator(`a[href="/en/${segment}/${ref}/"]`)).toHaveCount(1);
    }
  }
});

test("an English passage in a Vietnamese catalogue carries lang and the untranslated marker", async ({ page }) => {
  const c = model.collections.find(
    (o) =>
      o.id !== tracked.id &&
      model.items[o.id].some((i) => i.page?.blocks.find((b) => b.type === "text" && b.body && !b.body.vi)),
  );
  test.skip(!c, "every catalogue passage is translated");
  await open(page, `/vi/${c!.id}/`);
  await expect(page.locator('.catalogue-asks [lang="en"]').first()).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: vi["translation.missing"] })).toBeVisible();
});

// ---------------------------------------------------------------------------------------------
// Atlas filter sheet

test("@mobile the filter menus in the sheet never cover the sheet's title", async ({ page }) => {
  await open(page, "/en/map/");
  await page.getByRole("button", { name: /^Filters/ }).click();
  const title = page.locator("#filters-title");
  await expect(title).toBeVisible();
  const facets = page.locator(".filter-sheet .facet");
  for (let i = 0; i < (await facets.count()); i++) {
    await facets.nth(i).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const [menuBox, titleBox] = await Promise.all([menu.boundingBox(), title.boundingBox()]);
    expect(menuBox!.y).toBeGreaterThanOrEqual(titleBox!.y + titleBox!.height);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
  }
});
