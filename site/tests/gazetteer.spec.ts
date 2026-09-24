// The Atlas opens on its index, a gazetteer (DESIGN.md → Atlas): one section per region in
// vocabulary order, each ready route an entry, mapped competencies as one run-in line. Regions,
// counts, titles, passages, and relations come from the content model, never typed in.
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

type L10n = { en: string; vi?: string };
type Block = { type: string; format?: string; body?: L10n; tasks?: unknown[]; rows?: unknown[] };
type Item = { id: string; title: L10n; fields: Record<string, unknown>; page?: { blocks: Block[] } };
type Model = {
  collections: {
    id: string;
    label: L10n;
    ref_prefix?: string;
    group_by?: string;
    progress?: { tracks?: boolean };
    fields: Record<string, { vocabulary?: string }>;
  }[];
  vocabularies: Record<string, Record<string, { label: L10n; order: number }>>;
  items: Record<string, Item[]>;
  relations: { type: string; from: string; to: string }[];
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const en: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const items = model.items[tracked.id];
const TOTAL = items.length;
const READY = items.filter((i) => i.page).length;
const groupField = tracked.group_by!;
const vocabulary = model.vocabularies[tracked.fields[groupField].vocabulary!];
const groupOf = (item: Item) => String([item.fields[groupField]].flat()[0]);

/** Regions in vocabulary order, each with its ready and mapped items in content order. */
const regions = Object.entries(vocabulary)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([value, entry]) => {
    const inRegion = items.filter((i) => groupOf(i) === value);
    return {
      value,
      label: entry.label.en,
      total: inRegion.length,
      ready: inRegion.filter((i) => i.page),
      mapped: inRegion.filter((i) => !i.page),
    };
  })
  .filter((r) => r.total > 0);

/** The passage an entry shows: the first paragraph of the route's first text block. */
const passageOf = (item: Item) =>
  item
    .page!.blocks.find((b) => b.type === "text")!
    .body!.en.split(/\n\s*\n/)[0]
    .replace(/\s+/g, " ")
    .trim();
const collectionOf = (ref: string) => model.collections.find((c) => c.ref_prefix && ref.startsWith(`${c.ref_prefix}:`));
const titleOf = (ref: string) => {
  const c = collectionOf(ref) ?? tracked;
  const id = c.ref_prefix ? ref.slice(c.ref_prefix.length + 1) : ref;
  return model.items[c.id].find((i) => i.id === id)!.title.en;
};

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

const index = (page: Page) => page.locator(".gazetteer");
const section = (page: Page, value: string) => page.locator(`.gazetteer #region-${value}`);
const count = (page: Page) => page.locator(".results [role=status]");
const drawer = (page: Page) => page.getByRole("dialog").filter({ has: page.locator("#drawer-title") });
const regionCount = (ready: number, total: number) =>
  en["plate.regionCount"].replace("{ready}", String(ready)).replace("{total}", String(total));

test("the Atlas opens on the index: every region in order, every ready route once under it", async ({ page }) => {
  await open(page, "/en/map/");
  await expect(page.locator(".plate")).toHaveCount(0);
  await expect(page.getByRole("button", { name: en["map.view.index"] })).toHaveAttribute("aria-pressed", "true");

  const ids = await index(page)
    .locator(".gazetteer-region")
    .evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(regions.map((r) => `region-${r.value}`));
  await expect(index(page).locator("tbody tr")).toHaveCount(READY);

  for (const r of regions) {
    const heading = section(page, r.value).getByRole("heading", { level: 2 });
    await expect(heading).toContainText(r.label);
    await expect(heading).toContainText(regionCount(r.ready.length, r.total));
    await expect(heading).not.toContainText("·");
    const rows = section(page, r.value).locator("tbody tr");
    await expect(rows).toHaveCount(r.ready.length);
    for (const item of r.ready) {
      const title = section(page, r.value).locator(`tr[data-ref="${item.id}"] .gazetteer-title`);
      await expect(title).toHaveAttribute("href", `/en/routes/${item.id}/`);
      await expect(title).toContainText(item.title.en);
    }
  }
});

test("each entry shows its passage, details line, what it needs first, and what it is practice for", async ({
  page,
}) => {
  await open(page, "/en/map/");
  for (const item of items.filter((i) => i.page)) {
    const row = index(page).locator(`tr[data-ref="${item.id}"]`);
    await expect(row.locator(".gazetteer-passage")).toHaveText(passageOf(item));

    const blocks = item.page!.blocks;
    const sources = blocks.filter((b) => b.type === "sources").reduce((n, b) => n + (b.rows ?? []).length, 0);
    const tasks = (blocks.find((b) => b.type === "diagnostic")?.tasks ?? []).length;
    const details = row.getByRole("list", { name: en["details.label"] });
    if (sources > 1) await expect(details).toContainText(en["details.sources"].replace("{count}", String(sources)));
    if (tasks > 1) await expect(details).toContainText(en["details.tasks"].replace("{count}", String(tasks)));

    const needs = model.relations.filter((r) => r.type === "prerequisite" && r.to === item.id).map((r) => r.from);
    const needsLine = row.locator(".catalogue-related .prereq-line");
    if (needs.length === 0) await expect(needsLine).toHaveText(en["prereq.none"]);
    for (const ref of needs) await expect(needsLine).toContainText(titleOf(ref));

    const practice = model.relations
      .filter((r) => r.type !== "prerequisite" && r.from === item.id && collectionOf(r.to))
      .map((r) => r.to);
    await expect(row.locator(".gazetteer-practice a")).toHaveCount(practice.length);
    for (const ref of practice) await expect(row.locator(".gazetteer-practice")).toContainText(titleOf(ref));
  }
});

test("mapped competencies run in as one line per region, each opening its drawer", async ({ page }) => {
  await open(page, "/en/map/");
  for (const r of regions) {
    const line = section(page, r.value).locator(".gazetteer-mapped");
    if (r.mapped.length === 0) {
      await expect(line).toHaveCount(0);
      continue;
    }
    await expect(line).toContainText(en["map.mappedLine"]);
    await expect(line.getByRole("link")).toHaveText(r.mapped.map((i) => i.title.en));
  }
  const mapped = regions.find((r) => r.mapped.length > 0)!.mapped[0];
  await index(page).getByRole("link", { name: mapped.title.en, exact: true }).click();
  await expect(drawer(page).getByRole("heading", { name: mapped.title.en })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`item=${mapped.id.replace(/\./g, "\\.")}`));
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
});

test("filters remove entries and the regions left empty", async ({ page }) => {
  await open(page, "/en/map/");
  const query = "retrieval";
  const hit = (i: Item) => i.title.en.toLowerCase().includes(query) || i.id.includes(query);
  await page.getByLabel(en["map.search"]).fill(query);
  const matching = items.filter(hit);
  await expect(count(page)).toHaveText(`Showing ${matching.length} of ${TOTAL}`);
  await expect(index(page).locator("tbody tr")).toHaveCount(matching.filter((i) => i.page).length);
  await expect(index(page).locator(".gazetteer-mapped a")).toHaveCount(matching.filter((i) => !i.page).length);
  const left = regions.filter((r) => [...r.ready, ...r.mapped].some(hit)).map((r) => `region-${r.value}`);
  const ids = await index(page)
    .locator(".gazetteer-region")
    .evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(left);

  await page.getByRole("button", { name: en["map.clear"] }).first().click();
  await page.getByText(en["map.filter.readyOnly"]).click();
  await expect(count(page)).toHaveText(`Showing ${READY} of ${TOTAL}`);
  await expect(index(page).locator("tbody tr")).toHaveCount(READY);
  await expect(index(page).locator(".gazetteer-mapped")).toHaveCount(0);
  await expect(index(page).locator(".gazetteer-region")).toHaveCount(regions.filter((r) => r.ready.length).length);

  await page.getByLabel(en["map.search"]).fill("zzzz");
  await expect(index(page).locator(".gazetteer-region")).toHaveCount(0);
  await expect(page.getByText(en["map.noResults"])).toBeVisible();
});

test("?view=plate shows the plate; the toggle returns to the index; ?view=list opens the index", async ({ page }) => {
  await open(page, "/en/map/?view=plate");
  await expect(page.locator(".plate .tile-route")).toHaveCount(READY);
  await expect(index(page)).toHaveCount(0);
  await page.getByRole("button", { name: en["map.view.index"] }).click();
  await expect(index(page).locator("tbody tr")).toHaveCount(READY);
  await expect(page).not.toHaveURL(/view=/);
  await page.getByRole("button", { name: en["map.view.plate"] }).click();
  await expect(page).toHaveURL(/view=plate/);

  await open(page, "/en/map/?view=list");
  await expect(index(page).locator("tbody tr")).toHaveCount(READY);
  await expect(page.locator(".plate")).toHaveCount(0);
});

test("?item= opens the drawer over the index and marks its entry", async ({ page }) => {
  const item = items.find((i) => i.page)!;
  await open(page, `/en/map/?item=${item.id}`);
  await expect(drawer(page).getByRole("heading", { name: item.title.en })).toBeVisible();
  await expect(index(page).locator(`tr[data-ref="${item.id}"]`)).toHaveClass(/is-selected/);
});

test("without JavaScript the index reads and links", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ["/en/map/", "/en/map/?view=list"]) {
    await page.goto(path);
    await expect(index(page).locator("tbody tr")).toHaveCount(READY);
    const route = items.find((i) => i.page)!;
    await expect(index(page).locator(`tr[data-ref="${route.id}"] .gazetteer-title`)).toHaveAttribute(
      "href",
      `/en/routes/${route.id}/`,
    );
    const mapped = items.find((i) => !i.page)!;
    await expect(index(page).getByRole("link", { name: mapped.title.en, exact: true })).toHaveAttribute(
      "href",
      `/en/map/?item=${mapped.id}`,
    );
  }
  await context.close();
});

test("@mobile the index stacks its entries without horizontal scroll", async ({ page }) => {
  await open(page, "/en/map/");
  const first = regions.find((r) => r.ready.length)!.ready[0];
  await expect(index(page).locator(`tr[data-ref="${first.id}"] .gazetteer-title`)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true,
  );
});
