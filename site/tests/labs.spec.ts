import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { withReference } from "../src/lib/lab-run.ts";

// Browser labs (DESIGN.md → Labs) under the real CSP and isolation headers. The first run loads
// Pyodide from the same origin, so these tests allow for it.
const LAB = "/en/labs/prompt-injection-boundaries/";
const lab = (name: string) => readFileSync(new URL(`../../labs/prompt-injection-boundaries/${name}`, import.meta.url), "utf8");
const LOAD = { timeout: 90_000 };

// Every test fails on a console error (page or worker), an uncaught exception, or a CSP violation.
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("worker", (w) => w.on("console", (m) => m.type() === "error" && errors.push(`worker: ${m.text()}`)));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`));
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
  await expect(page.locator(".prereq-line").getByRole("link", { name: /Prompt Injection/ })).toHaveAttribute("href", "/en/routes/security.prompt-injection/");
  // The reference solution is not a tab until the learner opens it.
  await expect(page.getByRole("tab", { name: /solution\.py/ })).toHaveCount(0);
});

test("the route's practice item links to the lab page", async ({ page }) => {
  await open(page, "/en/routes/ai.evaluation/");
  await page.locator("#practice").getByRole("link", { name: /Evaluation Harness Lab/ }).click();
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
