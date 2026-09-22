// Next step (DESIGN.md → Next step): after importing a progress.yaml, Home, Progress, and the
// route field log show the deterministic recommendation from src/lib/recommend.ts.
import { expect, test, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

const FIXTURE = fileURLToPath(new URL("fixtures/next-step.progress.yaml", import.meta.url));

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

async function importFixture(page: Page) {
  await open(page, "/en/progress/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import progress.yaml" }).click();
  await (await chooser).setFiles(FIXTURE);
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByText("Imported.")).toBeVisible();
}

const nextList = (page: Page) => page.getByRole("region", { name: "Next for you" });

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

test("Home has no next list before any evidence; the start flow stays", async ({ page }) => {
  await open(page, "/en/");
  await expect(nextList(page)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Find your starting point" })).toBeVisible();
});

test("an imported progress.yaml puts the due check first on Progress, Home, and the route", async ({ page }) => {
  await importFixture(page);

  const rows = nextList(page).getByRole("listitem");
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toContainText("AI Evaluation and Experimentation");
  await expect(rows.first()).toContainText("Check due 2026-01-01");
  await expect(rows.first().getByRole("link")).toHaveAttribute("href", "/en/routes/ai.evaluation/#diagnostic");
  await expect(rows.nth(1)).toContainText("You started this");

  await open(page, "/en/");
  const home = nextList(page).getByRole("listitem");
  await expect(home).toHaveCount(3);
  await expect(home.first()).toContainText("AI Evaluation and Experimentation");
  await expect(home.nth(1).getByRole("link")).toHaveAttribute("href", "/en/routes/ai.product-framing/");
  await expect(page.getByRole("link", { name: "Find your starting point" })).toBeVisible();

  await open(page, "/en/routes/ai.model-selection/");
  await expect(page.locator("aside.field-log .log-advice")).toHaveText("Recommended next (4 of 5). Ready to start: nothing needs learning first.");

  await open(page, "/en/routes/retrieval.search/");
  const blocked = page.locator("aside.field-log .log-advice");
  await expect(blocked).toHaveText("Learn first: AI Product and Problem Framing");
  await expect(blocked.getByRole("link")).toHaveAttribute("href", "/en/routes/ai.product-framing/");
});

test("@mobile the next list reads as a single column on Home and Progress", async ({ page }) => {
  await importFixture(page);
  await expect(nextList(page).getByRole("listitem").first()).toContainText("AI Evaluation and Experimentation");

  await open(page, "/vi/");
  const first = page.getByRole("region", { name: "Tiếp theo cho bạn" }).getByRole("listitem").first();
  await expect(first).toContainText("Đến hạn ôn (2026-01-01)");
  const box = await first.boundingBox();
  expect(box && box.x + box.width).toBeLessThanOrEqual(390);
});
