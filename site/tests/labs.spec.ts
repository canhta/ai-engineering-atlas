import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { withReference } from "../src/lib/lab-run.ts";

// Browser labs (DESIGN.md → Labs) under the real CSP and isolation headers. The first run loads
// Pyodide from the same origin, so these tests allow for it.
const LAB = "/en/labs/prompt-injection-boundaries/";
const lab = (name: string) =>
  readFileSync(new URL(`../../labs/prompt-injection-boundaries/${name}`, import.meta.url), "utf8");
const LOAD = { timeout: 90_000 };

// Every test fails on a console error (page or worker), an uncaught exception, or a CSP violation.
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("worker", (w) => w.on("console", (m) => m.type() === "error" && errors.push(`worker: ${m.text()}`)));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`),
    );
  });
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

async function open(page: Page, path = LAB) {
  await page.goto(path);
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

const editor = (page: Page) => page.getByRole("textbox", { name: "starter.py, your code" });
const verdict = (page: Page) => page.locator(".lab-result");
const run = (page: Page) => page.getByRole("button", { name: "Run tests" });

/** Replace the editor content (CodeMirror: select all, then insert). */
async function setCode(page: Page, code: string) {
  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await editor(page).evaluate((el, text) => {
    // CodeMirror reads input events; insertText keeps indentation exactly as given.
    el.focus();
    document.execCommand("insertText", false, text);
  }, code);
}

test("a lab page renders the README and links back to the competency it practises", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Prompt Injection Trust-Boundary Lab");
  await expect(page.getByRole("heading", { name: "Task 2 — implement authorization outside the model" })).toBeVisible();
  await expect(page.locator(".prereq-line").getByRole("link", { name: /Prompt Injection/ })).toHaveAttribute(
    "href",
    "/en/routes/security.prompt-injection/",
  );
  // The reference solution is not a tab until the learner opens it.
  await expect(page.getByRole("tab", { name: /solution\.py/ })).toHaveCount(0);
});

test("the route's practice item links to the lab page", async ({ page }) => {
  await open(page, "/en/routes/ai.evaluation/");
  await page
    .locator("#practice")
    .getByRole("link", { name: /Evaluation Harness Lab/ })
    .click();
  await expect(page).toHaveURL(/\/en\/labs\/evaluation-harness\/$/);
});

test("the starter raises NotImplementedError at the stub, as python tests.py does", async ({ page }) => {
  await open(page);
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
  await expect(verdict(page).getByRole("status")).toContainText("The run raised NotImplementedError");
  await expect(verdict(page)).toContainText("starter.py, line 29");
  await expect(verdict(page).locator(".lab-line")).toHaveText("raise NotImplementedError");
});

test("a wrong implementation fails with the failing assert line", async ({ page }) => {
  await open(page);
  await setCode(page, lab("starter.py").replace("raise NotImplementedError", "return False"));
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "fail", LOAD);
  await expect(verdict(page)).toContainText("tests.py, line 36");
  await expect(verdict(page).locator(".lab-line")).toHaveText("assert starter.authorize(normal_user, search)");
});

test("pasting the reference solution passes and offers evidence", async ({ page }) => {
  await open(page);
  await setCode(page, withReference(lab("starter.py"), lab("solution.py")));
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "pass", LOAD);
  await expect(verdict(page)).toContainText("All trust-boundary tests passed.");
  await expect(page.getByRole("button", { name: "Record evidence" })).toBeVisible();
});

test("a passing run records automated implementation evidence with the code's hash", async ({ page }) => {
  await open(page);
  const code = withReference(lab("starter.py"), lab("solution.py"));
  await setCode(page, code);
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "pass", LOAD);
  await page.getByRole("button", { name: "Record evidence" }).click();
  await expect(page.locator(".lab-competency")).toHaveText("Prompt Injection and Trust Boundaries");
  const hash = await page.evaluate(async (text) => {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }, code);
  await expect(page.getByLabel("What does the artifact show?")).toHaveValue(
    new RegExp(`tests\\.py passed in the browser \\(Pyodide [\\d.]+\\)\\. starter\\.py SHA-256: ${hash}`),
  );
  await page.getByLabel("This shows the capability is").selectOption("demonstrated");
  await page.getByRole("button", { name: "Save evidence" }).click();
  await expect(page.getByText("Saved. Your state is now demonstrated.")).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas.progress.v2") ?? "{}"));
  const evidence = stored.competencies["security.prompt-injection"].evidence[0];
  expect(evidence).toMatchObject({
    kind: "implementation",
    review_method: "automated",
    independence: "independent",
    supports_state: "demonstrated",
  });
  expect(evidence.note).toContain(hash);
});

test("the reference solution opens only after confirming and marks later evidence reference-open", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Show the reference solution" }).click();
  await expect(page.getByText("Try the lab yourself first.")).toBeVisible();
  await page.getByRole("button", { name: "Open the solution" }).click();
  await expect(page.getByRole("tab", { name: /solution\.py/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("textbox", { name: "solution.py, read only" })).toContainText("def authorize");
  await expect(page.getByText("You opened the reference solution.")).toBeVisible();

  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
  await setCode(page, withReference(lab("starter.py"), lab("solution.py")));
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "pass", LOAD);
  await page.getByRole("button", { name: "Record evidence" }).click();
  await expect(page.getByText("Checked by the lab tests (automated), reference open.")).toBeVisible();
  await page.getByRole("button", { name: "Save evidence" }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas.progress.v2") ?? "{}"));
  expect(stored.competencies["security.prompt-injection"].evidence[0].independence).toBe("reference-open");
});

test("the draft survives a reload, and Reset to starter asks first", async ({ page }) => {
  await open(page);
  await setCode(page, "print('draft')\n");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("atlas.lab-code.v1.lab:prompt-injection-boundaries")))
    .toContain("draft");
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
  await expect(editor(page)).toContainText("print('draft')");
  await page.getByRole("button", { name: "Reset to starter" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(editor(page)).toContainText("print('draft')");
  await page.getByRole("button", { name: "Reset to starter" }).click();
  await page.getByRole("button", { name: "Replace my code" }).click();
  await expect(editor(page)).toContainText("def authorize");
});

test("@mobile the lab page stacks the brief and the bench, with a jump to the code", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: "Go to the code" }).click();
  await expect(page.getByRole("heading", { name: "Run the tests" })).toBeInViewport();
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
});

test("Stop interrupts a runaway run and the next run works", async ({ page }) => {
  await open(page);
  await setCode(page, `${lab("starter.py")}\nwhile True:\n    pass\n`);
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "running", LOAD);
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "stopped");
  await setCode(page, lab("starter.py"));
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
});

test("the time limit terminates the worker and a fresh one runs next", async ({ page }) => {
  await open(page);
  // Load Python first, so the fake clock only affects the run's time limit.
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
  await page.clock.install();
  await setCode(page, `${lab("starter.py")}\nwhile True:\n    pass\n`);
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "running");
  await page.clock.runFor(21_000);
  await expect(verdict(page)).toHaveAttribute("data-verdict", "timeout");
  await expect(verdict(page).getByRole("status")).toContainText("Python was restarted");
  await setCode(page, lab("starter.py"));
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
});

test("a lab that needs NumPy loads it from our own origin and runs", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));

  await open(page, "/en/labs/self-attention/");
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", { timeout: 300_000 });
  await expect(verdict(page).getByRole("status")).toContainText("The run raised NotImplementedError");

  const wheel = requests.filter((url) => url.endsWith(".whl"));
  expect(wheel.length).toBeGreaterThan(0);
  for (const url of wheel) expect(new URL(url).origin).toBe(new URL(page.url()).origin);
});

test("Run uses the code just typed, even before the page re-renders the edit", async ({ page }) => {
  await open(page);
  // Load Python first, so only the edit-then-Run order is under test.
  await run(page).click();
  await expect(verdict(page)).toHaveAttribute("data-verdict", "error", LOAD);
  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  // Insert, let CodeMirror read the edit (its mutation observer runs as a microtask), then press Run
  // in the same task: React has not re-rendered the edit when Run's handler runs.
  await editor(page).evaluate(
    async (el, text) => {
      el.focus();
      document.execCommand("insertText", false, text);
      await Promise.resolve();
      (document.querySelector(".lab-bench button.button-primary") as HTMLButtonElement).click();
    },
    withReference(lab("starter.py"), lab("solution.py")),
  );
  await expect(verdict(page)).toHaveAttribute("data-verdict", "pass", LOAD);
});
