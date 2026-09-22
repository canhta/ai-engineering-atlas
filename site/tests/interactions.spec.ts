import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const ROUTE = "/en/routes/ai.tool-calling/";

/** Wait until every island on the page has hydrated (Astro removes the `ssr` attribute). */
async function hydrated(page: Page) {
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await hydrated(page);
}

async function noConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

const fieldLog = (page: Page) => page.locator("aside.field-log");
const rail = (page: Page) => page.getByRole("navigation", { name: "On this page" });

async function recordEvidence(page: Page, note: string) {
  await fieldLog(page).getByRole("button", { name: "Record evidence" }).click();
  await page.getByLabel("Kind").selectOption("implementation");
  await page.getByLabel("This shows the capability is").selectOption("demonstrated");
  await page.getByLabel("What does the artifact show?").fill(note);
  await page.getByRole("button", { name: "Save evidence" }).click();
}

test("map search and filters narrow the list and announce the count", async ({ page }) => {
  const errors = await noConsoleErrors(page);
  await open(page, "/en/map/");
  const status = page.getByRole("status");
  await expect(status).toContainText("Showing 116 of 116");

  await page.getByLabel("Search competencies").fill("retrieval");
  await expect(status).not.toContainText("Showing 116");
  await expect(page.getByRole("link", { name: "Search and Retrieval", exact: true }).first()).toBeVisible();

  await page.getByText("Ready routes only").click();
  await expect(page.getByText("Vector Search Internals")).toHaveCount(0);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(status).toContainText("Showing 116 of 116");
  expect(errors).toEqual([]);
});

test("domain disclosures open and close with the keyboard", async ({ page }) => {
  await open(page, "/en/map/");
  const trigger = page.getByRole("button", { name: /Software Engineering/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("software.testing")).toBeVisible();
});

test("diagnostic: one task per card, then the pass condition, record a gap", async ({ page }) => {
  const errors = await noConsoleErrors(page);
  await open(page, ROUTE);
  await expect(page.getByText("Task 1 of 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pass condition" })).toHaveCount(0);

  const next = page.getByRole("button", { name: "Next task" });
  await expect(next).toBeDisabled();
  await page.getByRole("textbox", { name: "Your answer to task 1" }).fill("answer 1");

  // Drafts survive a reload.
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole("textbox", { name: "Your answer to task 1" })).toHaveValue("answer 1");
  await expect(rail(page).getByText("1 of 4 answered")).toBeVisible();

  for (let n = 1; n < 4; n++) {
    await page.getByRole("button", { name: "Next task" }).click();
    await expect(page.getByText(`Task ${n + 1} of 4`)).toBeVisible();
    await page.getByRole("textbox", { name: `Your answer to task ${n + 1}` }).fill(`answer ${n + 1}`);
  }
  await page.getByRole("button", { name: "Compare with the pass condition" }).click();
  await expect(page.getByRole("heading", { name: "Pass condition" })).toBeVisible();
  await page.getByText("Not yet").click();
  await page.getByRole("button", { name: "Record diagnostic result" }).click();
  await expect(page.getByText("Recorded. Start with")).toBeVisible();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("gap");
  await expect(rail(page).getByText("Result recorded")).toBeVisible();
  expect(errors).toEqual([]);
});

test("opening a source is a personal mark and leaves the state unchanged", async ({ page }) => {
  await open(page, ROUTE);
  const opened = page.getByRole("checkbox", { name: /^Opened / }).first();
  await page.locator(".sources-table .checkbox").first().click();
  await expect(opened).toBeChecked();
  await expect(rail(page).getByText("1 of 5 opened")).toBeVisible();
  await page.reload();
  await hydrated(page);
  await expect(opened).toBeChecked();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("unassessed");
});

test("recording evidence in the field log changes the state, schedules review, and shows in progress", async ({ page }) => {
  await open(page, ROUTE);
  await recordEvidence(page, "Tool contract with validation and idempotent retries.");
  await expect(fieldLog(page).getByText("Saved. Your state is now demonstrated.")).toBeVisible();
  // Next review is scheduled.
  await expect(fieldLog(page).locator(".log-facts time")).toBeVisible();
  await expect(rail(page).getByText("Evidence recorded (1)").first()).toBeVisible();

  await open(page, "/en/progress/");
  await expect(page.getByText(/^1 of \d+ ready routes demonstrated or beyond$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Tool Calling" }).first()).toBeVisible();

  await open(page, "/en/map/");
  await page.getByLabel("Your state").selectOption("done");
  await expect(page.getByRole("status")).toContainText("Showing 1 of 116");
});

test("on mobile the field log opens as a sheet from the bottom bar", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await open(page, ROUTE);
  await expect(fieldLog(page)).toBeHidden();
  await page.locator(".log-bar").getByRole("button", { name: "Record evidence" }).click();
  const sheet = page.getByRole("dialog", { name: "Field log" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("progress exports as progress.yaml and re-imports", async ({ page }, testInfo) => {
  await open(page, ROUTE);
  await recordEvidence(page, "Evidence for export.");

  await open(page, "/en/progress/");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress.yaml" }).click();
  const file = testInfo.outputPath("progress.yaml");
  await (await download).saveAs(file);
  expect(readFileSync(file, "utf8")).toContain("ai.tool-calling");

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await hydrated(page);
  await expect(page.getByText("No evidence recorded yet.")).toBeVisible();

  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import progress.yaml" }).click();
  await (await chooser).setFiles(file);
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByText("Imported.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tool Calling" }).first()).toBeVisible();
});

test("Vietnamese pages render the same interactions and mark untranslated text", async ({ page }) => {
  await open(page, "/vi/map/");
  await expect(page.getByRole("status")).toContainText("116/116 kỹ năng");
  await open(page, "/vi/routes/ai.tool-calling/");
  await expect(page.getByText("Câu 1/4")).toBeVisible();
  await expect(page.getByRole("button", { name: "Câu tiếp" })).toBeDisabled();
  await expect(page.locator("h1")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("note")).toHaveText("chưa dịch / not yet translated");
});

test("the root page opens the remembered language", async ({ page }) => {
  await open(page, "/vi/");
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi\/$/);
});
