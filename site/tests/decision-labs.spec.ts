import { expect, type Page, test } from "@playwright/test";

// Decision labs render as structured rubric forms instead of a code runner (DESIGN.md → Labs: the
// form variant; rfcs/0000-interactive-web-atlas.md → In-browser labs → Decision labs).
const MODEL_SELECTION = "/en/labs/model-selection/";
const AGENTIC_DESIGN = "/en/labs/agentic-design/";

// Every test fails on a console error, an uncaught exception, or a CSP violation.
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`),
    );
  });
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

const recordEvidence = (page: Page) => page.getByRole("button", { name: "Record evidence" });

/** Fills every field of the model-selection decision form with a minimal valid answer. */
async function fillModelSelection(page: Page) {
  await page.getByLabel("What is the actual task and user-facing success condition?").fill("Route a support ticket.");
  await page.getByLabel("Hard constraints").fill("p95 latency under 1800 ms; structured JSON output.");
  await page.getByLabel("Evaluation set/version").fill("support-eval v3");
  await page.getByLabel("Candidate – row 1").fill("B");
  await page.getByLabel("Feasible? – row 1").fill("yes");
  await page.getByLabel("Quality – row 1").fill("0.86");
  await page.getByLabel("p95 latency – row 1").fill("1500");
  await page.getByLabel("Cost – row 1").fill("10");
  await page.getByLabel("Operational notes – row 1").fill("Balanced hosted option.");
  await page.getByLabel("Decision rule").fill("Pick the cheapest candidate that clears quality and latency.");
  await page.getByLabel("Selected").fill("B");
  await page.getByLabel("Rejected candidates and reasons").fill("A: over the latency budget. E: no structured output.");
}

test("the rubric stays visible while answering, and Record evidence is absent until every field is filled", async ({
  page,
}) => {
  await open(page, MODEL_SELECTION);
  await expect(page.getByRole("heading", { name: "Answer the rubric" })).toBeVisible();
  await expect(page.getByText("What is the actual task and user-facing success condition?")).toBeVisible();
  await expect(recordEvidence(page)).toHaveCount(0);
  await page.getByLabel("What is the actual task and user-facing success condition?").fill("Route a support ticket.");
  await expect(recordEvidence(page)).toHaveCount(0);
});

test("filling every field orders the decision fields after the rule, then reveals Record evidence", async ({
  page,
}) => {
  await open(page, MODEL_SELECTION);
  await fillModelSelection(page);
  const labels = await page.locator(".field > span:first-child, .form-table-field > legend").allTextContents();
  const ruleIndex = labels.indexOf("Decision rule");
  const selectedIndex = labels.indexOf("Selected");
  expect(ruleIndex).toBeGreaterThan(-1);
  expect(selectedIndex).toBeGreaterThan(ruleIndex);
  await expect(recordEvidence(page)).toBeVisible();
});

test("the draft survives a reload", async ({ page }) => {
  await open(page, MODEL_SELECTION);
  await page.getByLabel("What is the actual task and user-facing success condition?").fill("Route a support ticket.");
  await page.getByLabel("Selected").fill("B");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("atlas.lab-form.v1.lab:model-selection")))
    .toContain("Route a support ticket");
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
  await expect(page.getByLabel("What is the actual task and user-facing success condition?")).toHaveValue(
    "Route a support ticket.",
  );
  await expect(page.getByLabel("Selected")).toHaveValue("B");
});

test("a complete form records decision evidence with a self review, summarised in the note", async ({ page }) => {
  await open(page, MODEL_SELECTION);
  await fillModelSelection(page);
  await recordEvidence(page).click();
  await expect(page.locator(".lab-competency")).toHaveText("Model Selection");
  await expect(page.getByLabel("What does the artifact show?")).toHaveValue(/Selected: B/);
  await page.getByLabel("This shows the capability is").selectOption("demonstrated");
  await page.getByRole("button", { name: "Save evidence" }).click();
  await expect(page.getByText("Saved. Your state is now demonstrated.")).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas.progress.v2") ?? "{}"));
  const evidence = stored.competencies["ai.model-selection"].evidence[0];
  expect(evidence).toMatchObject({
    kind: "decision",
    review_method: "self",
    independence: "independent",
    supports_state: "demonstrated",
  });
  expect(evidence.note).toContain("Selected: B");
});

test("Export answers downloads the filled template as Markdown", async ({ page }) => {
  await open(page, MODEL_SELECTION);
  await fillModelSelection(page);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export answers" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("model-selection.md");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString("utf8");
  expect(text).toContain("# Model Selection Lab");
  expect(text).toContain("## Decision rule");
  expect(text).toContain("Pick the cheapest candidate that clears quality and latency.");
  expect(text).toContain("| Candidate | Feasible? | Quality | p95 latency | Cost | Operational notes |");
  expect(text).toContain("| B | yes | 0.86 | 1500 | 10 | Balanced hosted option. |");
});

test("the agentic-design lab offers the architecture choices verbatim from the rubric", async ({ page }) => {
  await open(page, AGENTIC_DESIGN);
  await expect(page.getByText("Can the task be decomposed into known fixed steps?")).toBeVisible();
  await expect(page.getByText("What would make you increase autonomy later?")).toBeVisible();
  const architecture = page.getByLabel("Architecture");
  await architecture.selectOption("An autonomous agent loop");
  await expect(architecture).toHaveValue("An autonomous agent loop");
});

test("@mobile the lab page stacks the brief and the form bench, with a jump to it", async ({ page }) => {
  await open(page, AGENTIC_DESIGN);
  await page.getByRole("link", { name: "Go to the form" }).click();
  await expect(page.getByRole("heading", { name: "Answer the rubric" })).toBeInViewport();
  await expect(page.getByText("Architecture", { exact: true })).toBeVisible();
});
