// Next step (DESIGN.md → Next step): after importing a progress.yaml, Home, Progress, and the
// route field log show the deterministic recommendation from src/lib/recommend.ts.

import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

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

test("an imported progress.yaml: Home leads with the due check, Progress leaves it to the review queue", async ({
  page,
}) => {
  await importFixture(page);

  // Progress: the due check sits in the review queue beside the list, not in the list.
  const rows = nextList(page).getByRole("listitem");
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toContainText("AI Product and Problem Framing");
  await expect(rows.first()).toContainText("You started this");
  await expect(nextList(page)).not.toContainText("AI Evaluation and Experimentation");
  await expect(page.getByRole("region", { name: "Review" })).toContainText("AI Evaluation and Experimentation");
  await expect(page.getByRole("region", { name: "Review" })).toContainText("due Jan 1, 2026");

  await open(page, "/en/");
  const home = nextList(page).getByRole("listitem");
  await expect(home).toHaveCount(3);
  await expect(home.first()).toContainText("AI Evaluation and Experimentation");
  await expect(home.first()).toContainText("Check due Jan 1, 2026");
  await expect(home.first().getByRole("link")).toHaveAttribute("href", "/en/routes/ai.evaluation/#diagnostic");
  await expect(home.nth(1).getByRole("link")).toHaveAttribute("href", "/en/routes/ai.product-framing/");
  await expect(page.getByRole("link", { name: "Find your starting point" })).toBeVisible();
  // The next steps lead: they end above the plate.
  const nextBox = (await nextList(page).boundingBox())!;
  const plateBox = (await page.locator(".plate").boundingBox())!;
  expect(nextBox.y + nextBox.height).toBeLessThan(plateBox.y);

  await open(page, "/en/routes/ai.model-selection/");
  await expect(page.locator("aside.field-log .log-advice")).toHaveText(
    /^Recommended next \(\d+ of \d+\)\. Ready to start: nothing needs learning first\.$/,
  );

  await open(page, "/en/routes/retrieval.search/");
  const blocked = page.locator("aside.field-log .log-advice");
  await expect(blocked).toHaveText("Learn first: AI Product and Problem Framing");
  await expect(blocked.getByRole("link")).toHaveAttribute("href", "/en/routes/ai.product-framing/");
});

test("@mobile the next list reads as a single column on Home and Progress", async ({ page }) => {
  await importFixture(page);
  await expect(nextList(page).getByRole("listitem").first()).toContainText("AI Product and Problem Framing");

  await open(page, "/vi/");
  const first = page.getByRole("region", { name: "Tiếp theo cho bạn" }).getByRole("listitem").first();
  await expect(first).toContainText("Đến hạn ôn ngày 01/01/2026");
  const box = await first.boundingBox();
  expect(box && box.x + box.width).toBeLessThanOrEqual(390);
  // On a phone too, the next steps come before the plate, and the start action stays.
  const plateBox = (await page.locator(".plate").boundingBox())!;
  expect(box!.y).toBeLessThan(plateBox.y);
  await expect(page.getByRole("link", { name: "Tìm điểm bắt đầu" })).toBeVisible();
});
