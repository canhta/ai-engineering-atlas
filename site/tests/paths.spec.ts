// A path as a screen (DESIGN.md → Path pages, RFC 0020): stages in order in the rail and on the
// page, each entry with its maturity and, after hydration, the learner's state; and the Atlas path
// filter, which keeps the plate's layout and dims what is not on the path. Everything is read from
// the content model, never typed in.
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

type L10n = { en: string; vi?: string };
type Entry = { ref: string; required: boolean; when?: L10n; level?: string };
type Stage = { id: string; title: L10n; level?: string; entries: Entry[] };
type Block = { type: string; id: string; stages?: Stage[]; items?: { ref: string }[] };
type Item = { id: string; title: L10n; page?: { blocks: Block[] } };
type Model = {
  collections: { id: string; label: L10n; ref_prefix?: string; progress?: { tracks?: boolean } }[];
  items: Record<string, Item[]>;
  relations: { type: string; from: string; to: string }[];
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const trackedItems = model.items[tracked.id];
const TOTAL = trackedItems.length;
const withPage = new Set(trackedItems.filter((i) => i.page).map((i) => i.id));

const found = model.collections
  .filter((c) => c.id !== tracked.id)
  .flatMap((c) => model.items[c.id].map((item) => ({ c, item })))
  .map(({ c, item }) => ({ c, item, block: item.page?.blocks.find((b) => b.type === "sequence") }))
  .find((p) => p.block?.stages?.length)!;
const pathRef = `${found.c.ref_prefix}:${found.item.id}`;
const stages = found.block!.stages!;
const entries = stages.flatMap((s) => s.entries);
const url = (lang: string) => `/${lang}/${found.c.id}/${found.item.id}/`;
const assumed = found.item.page!.blocks.find((b) => b.type === "prerequisites")!;
const titleOf = (ref: string) => trackedItems.find((i) => i.id === ref)!.title.en;
const readyEntry = entries.find((e) => withPage.has(e.ref))!;
const mappedEntry = entries.find((e) => !withPage.has(e.ref))!;
const optionalEntry = entries.find((e) => !e.required);
/** Tracked items the path points at: what the Atlas path filter keeps. */
const onPath = new Set(model.relations.filter((r) => r.from === pathRef).map((r) => r.to));
const offPath = trackedItems.find((i) => !onPath.has(i.id))!;

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

function seed(page: Page, id: string) {
  return page.evaluate((ref) => {
    const evidence = {
      id: "implementation-seed-1",
      kind: "implementation",
      supports_state: "demonstrated",
      recorded_at: "2026-01-01",
      note: "Seeded for the path test.",
      independence: "independent",
      review_method: "self",
    };
    const progress = {
      version: 2,
      updated_at: "2026-01-01",
      competencies: {
        [ref]: {
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
  }, id);
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

test("the path screen lists its stages in order, in the rail and on the page", async ({ page }) => {
  await open(page, url("en"));
  for (const [i, stage] of stages.entries()) {
    const link = page.locator(`.rail-list a[href="#${stage.id}"]`);
    await expect(link.locator(".rail-num")).toHaveText(String(i + 1));
    await expect(link.locator(".rail-title")).toHaveText(stage.title.en);
    const rows = page.locator(`#${stage.id} .stage-entry`);
    await expect(rows).toHaveCount(stage.entries.length);
    for (const [j, entry] of stage.entries.entries()) await expect(rows.nth(j)).toHaveAttribute("data-ref", entry.ref);
  }
});

test("the path lists its assumed topics once, in their block with a rail entry", async ({ page }) => {
  await open(page, url("en"));
  await expect(page.locator(`.rail-list a[href="#${assumed.id}"]`)).toHaveCount(1);
  const main = page.locator("main");
  for (const { ref } of assumed.items!) {
    await expect(main.getByText(titleOf(ref), { exact: true })).toHaveCount(1);
    await expect(page.locator(`#${assumed.id}`)).toContainText(titleOf(ref));
  }
});

test("each entry says ready or mapped, links only ready routes, and marks optional steps", async ({ page }) => {
  await open(page, url("en"));
  const ready = page.locator(`.stage-entry[data-ref="${readyEntry.ref}"]`);
  await expect(ready.locator(`a[href="/en/routes/${readyEntry.ref}/"]`)).toHaveCount(1);
  await expect(ready.locator(".stage-entry-state")).toHaveText("ready route");
  const mapped = page.locator(`.stage-entry[data-ref="${mappedEntry.ref}"]`);
  await expect(mapped.locator("a")).toHaveCount(0);
  await expect(mapped.locator(".stage-entry-state")).toHaveText("mapped, no route");
  if (optionalEntry)
    await expect(page.locator(`.stage-entry[data-ref="${optionalEntry.ref}"] .stage-entry-facts`)).toContainText(
      "optional",
    );
  // A stage level shows on its ready routes only.
  const levelled = stages.find((s) => s.level && s.entries.some((e) => withPage.has(e.ref)));
  if (levelled) {
    const ref = levelled.entries.find((e) => withPage.has(e.ref))!.ref;
    await expect(page.locator(`.stage-entry[data-ref="${ref}"] .stage-entry-facts`)).toContainText(
      `target ${levelled.level}`,
    );
  }
  // No completion percentage: the path's completion standard is evidence, not boxes checked.
  await expect(page.locator(".sheet")).not.toContainText("%");
});

test("an entry shows the learner's state after hydration", async ({ page }) => {
  await open(page, url("en"));
  const glyph = page.locator(`.stage-entry[data-ref="${readyEntry.ref}"] .tile-glyph`);
  await expect(glyph).toHaveClass(/tile-ready/);
  await seed(page, readyEntry.ref);
  await open(page, url("en"));
  await expect(glyph).toHaveClass(/tile-state-demonstrated/);
  await expect(page.locator(`.stage-entry[data-ref="${readyEntry.ref}"] .stage-entry-state`)).toHaveText(
    "demonstrated",
  );
});

test("the Atlas path filter keeps the plate and dims what is not on the path", async ({ page }) => {
  await open(page, "/en/map/?view=plate");
  const label = found.c.label.en;
  const button = page.getByRole("button", { name: new RegExp(`^${label}`) });
  await expect(button).toHaveText(new RegExp(`${label}.*All`));
  await button.click();
  await page.getByRole("menuitemradio", { name: found.item.title.en }).click();
  await expect(page.locator(".results [role=status]")).toHaveText(`Showing ${onPath.size} of ${TOTAL}`);
  await expect(page.locator(`.tile[data-ref="${readyEntry.ref}"]`)).not.toHaveClass(/is-dim/);
  await expect(page.locator(`.tile[data-ref="${offPath.id}"]`)).toHaveClass(/is-dim/);
  // The index removes the entries that are not on the path.
  await page.goto("/en/map/");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
  await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  await page.getByRole("menuitemradio", { name: found.item.title.en }).click();
  await expect(page.locator(`.gazetteer-entries tr[data-ref="${readyEntry.ref}"]`)).toHaveCount(1);
  await expect(page.locator(`.gazetteer-entries tr[data-ref="${offPath.id}"]`)).toHaveCount(0);
  await expect(page.locator(`.gazetteer-mapped a[href$="?item=${encodeURIComponent(offPath.id)}"]`)).toHaveCount(0);
});

test("@mobile the path screen reads on a phone without horizontal scroll", async ({ page }) => {
  await open(page, url("vi"));
  await expect(page.locator(`#${stages[0].id}`)).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
