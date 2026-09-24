// Project pages read like a route (DESIGN.md → Project pages, RFC 0022): the contents rail lists the
// milestones by title, numbered by position; each milestone is a section with its anchor, what it
// asks, the routes it brings together with the learner's state, its evidence, and its package.
// Everything is read from the content model, never typed in.
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

type L10n = { en: string; vi?: string };
type Milestone = { id: string; title: L10n; ask?: L10n; refs: string[]; evidence: string[]; path?: string };
type Block = { type: string; items?: Milestone[] };
type Item = { id: string; title: L10n; page?: { blocks: Block[] } };
type Model = {
  collections: { id: string; ref_prefix?: string; progress?: { tracks?: boolean } }[];
  items: Record<string, Item[]>;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const withPage = new Set(model.items[tracked.id].filter((i) => i.page).map((i) => i.id));

// The project with the most milestones, and one milestone that integrates a ready route.
const projects = model.collections
  .filter((c) => c.id !== tracked.id)
  .flatMap((c) => model.items[c.id].map((item) => ({ c, item })))
  .map(({ c, item }) => ({ c, item, block: item.page?.blocks.find((b) => b.type === "milestones") }))
  .filter((p) => p.block?.items?.length)
  .sort((a, b) => b.block!.items!.length - a.block!.items!.length);
const project = projects[0];
const milestones = project.block!.items!;
const url = (lang: string) => `/${lang}/${project.c.id}/${project.item.id}/`;
const withRoute = milestones.find((m) => m.refs.some((r) => withPage.has(r)))!;
const shared = milestones.flatMap((m, i) =>
  m.evidence.filter((e) => milestones.slice(0, i).some((o) => o.evidence.includes(e))).map((e) => ({ m, e })),
);

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

test("the rail lists every milestone by title, numbered by position, linking its anchor", async ({ page }) => {
  await open(page, url("en"));
  const links = page.locator(".rail-list a");
  await expect(links).toHaveCount(milestones.length);
  for (const [i, m] of milestones.entries()) {
    const link = links.nth(i);
    await expect(link).toHaveAttribute("href", `#${m.id}`);
    await expect(link.locator(".rail-num")).toHaveText(String(i + 1));
    await expect(link.locator(".rail-title")).toHaveText(m.title.en);
    await expect(page.locator(`#${m.id} h3`)).toHaveText(m.title.en);
  }
  // The number lives in the rail only, never in the milestone's heading.
  await expect(page.locator(`#${milestones[0].id} h3 .tabular`)).toHaveCount(0);
});

test("a milestone shows its ask, the routes it brings together, its evidence, and its package", async ({ page }) => {
  await open(page, url("en"));
  const section = page.locator(`#${withRoute.id}`);
  if (withRoute.ask) await expect(section.locator(".milestone-ask")).toHaveText(withRoute.ask.en);
  for (const ref of withRoute.refs.filter((r) => withPage.has(r)))
    await expect(section.locator(`.prereq-line a[href="/en/routes/${ref}/"]`)).toHaveCount(1);
  for (const e of withRoute.evidence)
    await expect(section.locator(".milestone-record code", { hasText: e })).toHaveCount(1);
  if (withRoute.path)
    await expect(section.locator(`.milestone-contract a[href$="/tree/main/${withRoute.path}"]`)).toHaveCount(1);
});

test("a record shared with an earlier milestone names that milestone", async ({ page }) => {
  test.skip(shared.length === 0, "no shared evidence in the content model");
  await open(page, url("en"));
  const { m, e } = shared[0];
  const first = milestones.find((o) => o.evidence.includes(e))!;
  const record = page.locator(`#${m.id} .milestone-record`, { hasText: e });
  await expect(record).toContainText(`shared with ${first.title.en}`);
  await expect(page.locator(`#${first.id} .milestone-record`, { hasText: e })).not.toContainText("shared with");
});

test("the routes a milestone brings together show the learner's state after hydration", async ({ page }) => {
  const ref = withRoute.refs.find((r) => withPage.has(r))!;
  await open(page, url("en"));
  const glyph = page.locator(`#${withRoute.id} .prereq-line a[href="/en/routes/${ref}/"] .tile-glyph`);
  await expect(glyph).toHaveClass(/tile-ready/);
  await page.evaluate((id) => {
    const evidence = {
      id: "implementation-seed-1",
      kind: "implementation",
      supports_state: "demonstrated",
      recorded_at: "2026-01-01",
      note: "Seeded for the milestones test.",
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
  await open(page, url("en"));
  await expect(glyph).toHaveClass(/tile-state-demonstrated/);
});

test("@mobile a project page on a phone has no horizontal scroll and a milestone bar", async ({ page }) => {
  await open(page, url("vi"));
  await expect(page.locator(".rail-bar")).toBeVisible();
  await expect(page.locator(`#${milestones[0].id}`)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
