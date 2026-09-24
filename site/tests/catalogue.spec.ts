// Collection indexes as a catalogue (DESIGN.md → Collection indexes): one row per item, its page
// link, what it asks, how it runs, and the routes it relates to with the learner's state glyph.
// Items and relations come from the content model, never typed in.
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

type L10n = { en: string; vi?: string };
type Item = { id: string; title: L10n; page?: { blocks: { type: string }[] } };
type Model = {
  collections: { id: string; ref_prefix?: string; progress?: { tracks?: boolean }; page_when?: unknown }[];
  items: Record<string, Item[]>;
  relations: { type: string; from: string; to: string }[];
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const withPage = new Set(model.items[tracked.id].filter((i) => i.page).map((i) => i.id));
const others = model.collections.filter((c) => c.id !== tracked.id);
const refOf = (c: Model["collections"][number], item: Item) => (c.ref_prefix ? `${c.ref_prefix}:${item.id}` : item.id);

/** The routes a row lists: tracked items pointing at it, or (when none in the collection do) the ones it points at. */
function relatedOf(c: Model["collections"][number]) {
  const into = (ref: string) => model.relations.filter((r) => r.to === ref && withPage.has(r.from)).map((r) => r.from);
  const outOf = (ref: string) => model.relations.filter((r) => r.from === ref && withPage.has(r.to)).map((r) => r.to);
  const inward = model.items[c.id].some((item) => into(refOf(c, item)).length > 0);
  return (item: Item) => [...new Set((inward ? into : outOf)(refOf(c, item)))];
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

test("each collection index lists every item once, links pages, and links the routes it relates to", async ({
  page,
}) => {
  for (const c of others) {
    await open(page, `/en/${c.id}/`);
    const rows = page.locator(".catalogue tbody tr");
    await expect(rows).toHaveCount(model.items[c.id].length);
    const related = relatedOf(c);
    for (const item of model.items[c.id]) {
      const row = rows.filter({ has: page.locator(`th >> text="${item.title.en}"`) });
      await expect(row).toHaveCount(1);
      const title = row.locator("th a");
      if (item.page) await expect(title).toHaveAttribute("href", `/en/${c.id}/${item.id}/`);
      else await expect(title).toHaveCount(0);
      const routes = related(item);
      await expect(row.locator(".catalogue-related a")).toHaveCount(routes.length);
      for (const ref of routes) await expect(row.locator(`a[href="/en/routes/${ref}/"]`)).toHaveCount(1);
    }
  }
});

test("how a lab runs comes from its blocks", async ({ page }) => {
  const c = others.find((o) => model.items[o.id].some((i) => i.page?.blocks.some((b) => b.type === "runner")))!;
  await open(page, `/en/${c.id}/`);
  const expected: Record<string, string> = { runner: "In the browser, with tests", form: "In the browser, as a form" };
  for (const item of model.items[c.id].filter((i) => i.page)) {
    const bench = item.page!.blocks.find((b) => b.type === "runner" || b.type === "form")?.type;
    const row = page.locator(`.catalogue tr[data-ref="${refOf(c, item)}"]`);
    await expect(row.locator(".catalogue-bench")).toContainText(bench ? expected[bench] : "README only, run locally");
    await expect(row.locator(".catalogue-asks")).not.toBeEmpty();
  }
});

test("a related route shows the learner's state after hydration", async ({ page }) => {
  const c = others.find((o) => model.items[o.id].some((i) => relatedOf(o)(i).length > 0))!;
  const item = model.items[c.id].find((i) => relatedOf(c)(i).length > 0)!;
  const ref = relatedOf(c)(item)[0];
  const link = page.locator(`.catalogue tr[data-ref="${refOf(c, item)}"] a[href="/en/routes/${ref}/"]`);

  await open(page, `/en/${c.id}/`);
  await expect(link.locator(".tile-glyph")).toHaveClass(/tile-ready/);

  await page.evaluate((id) => {
    const evidence = {
      id: "implementation-seed-1",
      kind: "implementation",
      supports_state: "demonstrated",
      recorded_at: "2026-01-01",
      note: "Seeded for the catalogue test.",
      independence: "independent",
      review_method: "self",
    };
    const progress = {
      version: 2,
      updated_at: "2026-01-01",
      competencies: {
        [id]: {
          current_state: "demonstrated",
          target_state: "demonstrated",
          evidence: [evidence],
          state_history: [
            { state: "demonstrated", recorded_at: "2026-01-01", reason: "Seeded.", evidence_refs: [evidence.id] },
          ],
          next_action: "",
        },
      },
    };
    window.localStorage.setItem("atlas.progress.v2", JSON.stringify(progress));
  }, ref);
  await open(page, `/en/${c.id}/`);
  await expect(link.locator(".tile-glyph")).toHaveClass(/tile-full/);
  await expect(link.locator(".tile-glyph")).toHaveClass(/tile-state-demonstrated/);
});

test("without JavaScript the catalogue reads and links", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const c of others) {
    await page.goto(`/en/${c.id}/`);
    await expect(page.locator(".catalogue tbody tr")).toHaveCount(model.items[c.id].length);
    const related = relatedOf(c);
    const item = model.items[c.id].find((i) => related(i).length > 0);
    if (item)
      await expect(
        page.locator(`.catalogue tr[data-ref="${refOf(c, item)}"] a[href="/en/routes/${related(item)[0]}/"]`),
      ).toBeVisible();
  }
  await context.close();
});

test("@mobile collection indexes stack their entries without horizontal scroll", async ({ page }) => {
  for (const c of others) {
    await open(page, `/vi/${c.id}/`);
    await expect(page.locator(".catalogue thead")).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
