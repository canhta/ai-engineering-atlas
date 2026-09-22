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

test("diagnostic: answer, compare with the pass condition, record a gap", async ({ page }) => {
  const errors = await noConsoleErrors(page);
  await open(page, ROUTE);
  const submit = page.getByRole("button", { name: "Submit answers" });
  await expect(submit).toBeDisabled();
  const boxes = page.getByRole("textbox", { name: /Your answer to task/ });
  const count = await boxes.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await boxes.nth(i).fill(`answer ${i + 1}`);

  // Drafts survive a reload.
  await page.reload();
  await hydrated(page);
  await expect(boxes.first()).toHaveValue("answer 1");

  await submit.click();
  await expect(page.getByRole("heading", { name: "Pass condition" })).toBeVisible();
  await page.getByText("Not yet").click();
  await page.getByRole("button", { name: "Record diagnostic result" }).click();
  await expect(page.getByText("Recorded. Start with the learning route.")).toBeVisible();
  await expect(page.locator(".learner-panel .state-badge").first()).toHaveText("gap");
  expect(errors).toEqual([]);
});

test("opening a source is a personal mark and leaves the state unchanged", async ({ page }) => {
  await open(page, ROUTE);
  const opened = page.getByRole("checkbox", { name: /^Opened / }).first();
  await page.locator(".source-table .checkbox").first().click();
  await expect(opened).toBeChecked();
  await page.reload();
  await hydrated(page);
  await expect(opened).toBeChecked();
  await expect(page.locator(".learner-panel .state-badge").first()).toHaveText("unassessed");
});

test("recording evidence changes the state, schedules review, and shows in progress", async ({ page }) => {
  await open(page, ROUTE);
  await page.getByRole("button", { name: "Record evidence" }).click();
  await page.getByLabel("Kind").selectOption("implementation");
  await page.getByLabel("This shows the capability is").selectOption("demonstrated");
  await page.getByLabel("What does the artifact show?").fill("Tool contract with validation and idempotent retries.");
  await page.getByRole("button", { name: "Save evidence" }).click();
  await expect(page.getByText("Saved. Your state is now demonstrated.")).toBeVisible();
  await expect(page.getByText("Next review")).toBeVisible();

  await open(page, "/en/progress/");
  await expect(page.getByText("1 of 17 ready routes demonstrated or beyond")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tool Calling" }).first()).toBeVisible();

  await open(page, "/en/map/");
  await page.getByLabel("Your state").selectOption("done");
  await expect(page.getByRole("status")).toContainText("Showing 1 of 116");
});

test("progress exports as progress.yaml and re-imports", async ({ page }, testInfo) => {
  await open(page, ROUTE);
  await page.getByRole("button", { name: "Record evidence" }).click();
  await page.getByLabel("What does the artifact show?").fill("Evidence for export.");
  await page.getByRole("button", { name: "Save evidence" }).click();

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

test("Vietnamese pages render the same interactions", async ({ page }) => {
  await open(page, "/vi/map/");
  await expect(page.getByRole("status")).toContainText("Hiển thị 116 trên 116");
  await open(page, "/vi/routes/ai.tool-calling/");
  await expect(page.getByRole("button", { name: "Nộp câu trả lời" })).toBeDisabled();
});
