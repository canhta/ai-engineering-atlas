// The Prerequisites block on a route page (DESIGN.md → Route sheet): each prerequisite carries
// its maturity glyph and label when server-rendered, and the learner's state once hydrated, as
// the prerequisite line in the header does. Routes, refs, and labels come from the content model.

import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { isConsoleError } from "./fixtures/console";

type L10n = { en: string; vi?: string };
type Model = {
  collections: { id: string; page_when?: unknown; progress?: { tracks?: boolean } }[];
  vocabularies: Record<string, Record<string, { label: L10n }>>;
  items: Record<
    string,
    { id: string; title: L10n; page?: { blocks: { id: string; type: string; items?: { ref: string }[] }[] } }[]
  >;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const en: Record<string, string> = JSON.parse(readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const items = model.items[tracked.id];
const byId = new Map(items.map((i) => [i.id, i]));

// The first route whose Prerequisites block names a prerequisite with a page of its own.
const route = items.find((i) =>
  i.page?.blocks.some((b) => b.type === "prerequisites" && b.items?.some((p) => byId.get(p.ref)?.page)),
)!;
const block = route.page!.blocks.find((b) => b.type === "prerequisites")!;
const readyPrereqs = block.items!.filter((p) => byId.get(p.ref)?.page).map((p) => byId.get(p.ref)!);
const seeded = readyPrereqs[0];
// Page URLs as `pageSegment` in src/lib/atlas.ts builds them.
const ROUTE = `/en/${tracked.page_when ? "routes" : tracked.id}/${route.id}/`;
const STATE = "learning";
const STATE_LABEL = model.vocabularies.state[STATE].label.en;

const entry = (page: Page, title: string) =>
  page.locator(`#${block.id} .prereq-list > li`).filter({ has: page.getByRole("link", { name: title, exact: true }) });

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => isConsoleError(m) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

test("the Prerequisites block shows the learner's state on a prerequisite once hydrated", async ({ page }) => {
  await page.addInitScript(
    ([ref, state]) => {
      const evidence = { id: "e1", kind: "diagnostic", supports_state: state, recorded_at: "2026-01-01" };
      localStorage.setItem(
        "atlas.progress.v2",
        JSON.stringify({
          version: 2,
          updated_at: "2026-01-01",
          competencies: {
            [ref]: {
              current_state: state,
              target_state: "demonstrated",
              evidence: [evidence],
              state_history: [],
              next_action: "",
            },
          },
        }),
      );
    },
    [seeded.id, STATE],
  );
  await page.goto(ROUTE);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);

  const seededEntry = entry(page, seeded.title.en);
  await expect(seededEntry.locator(".tile-glyph")).toHaveClass(new RegExp(`tile-state-${STATE}`));
  await expect(seededEntry.locator(".prereq-state")).toHaveText(STATE_LABEL);
  // The header's prerequisite line and the block agree on the glyph.
  await expect(
    page.locator(".prereq-line .prereq-item", { hasText: seeded.title.en }).locator(".tile-glyph"),
  ).toHaveClass(new RegExp(`tile-state-${STATE}`));
  // A ready prerequisite without evidence keeps its maturity.
  for (const other of readyPrereqs.slice(1)) {
    await expect(entry(page, other.title.en).locator(".prereq-state")).toHaveText(en["prereq.ready"]);
  }
});

test("without JavaScript the Prerequisites block shows each prerequisite's maturity", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(ROUTE);
  const list = page.locator(`#${block.id} .prereq-list > li`);
  await expect(list).toHaveCount(block.items!.length);
  for (const [i, p] of block.items!.entries()) {
    const ready = Boolean(byId.get(p.ref)?.page);
    await expect(list.nth(i).locator(".tile-glyph")).toHaveClass(ready ? /tile-ready/ : /tile-mapped/);
    await expect(list.nth(i).locator(".prereq-state")).toHaveText(en[ready ? "prereq.ready" : "prereq.mapped"]);
  }
  await context.close();
});
