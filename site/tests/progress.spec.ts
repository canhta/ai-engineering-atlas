// Progress as a field logbook (DESIGN.md → Progress): the evidence log lists every record of a seeded
// progress.yaml once, newest first, with page-locale dates; next steps, the review queue, and Your
// data sit in the margin on desktop and after the log on a phone. Titles and dates come from the
// fixture and src/data/atlas.json, never typed in.
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { parse } from "yaml";
import { formatDate } from "../src/lib/dates.ts";

type Evidence = { id: string; recorded_at: string; kind: string; supports_state: string; note?: string };
type Seed = { competencies: Record<string, { evidence: Evidence[] }> };
const FIXTURE = readFileSync(new URL("fixtures/progress-log.progress.yaml", import.meta.url), "utf8");
const seed: Seed = parse(FIXTURE);
const model: { items: Record<string, { id: string; title: { en: string } }[]> } = JSON.parse(
  readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"),
);
const titleOf = (ref: string) =>
  Object.values(model.items)
    .flat()
    .find((i) => i.id === ref)!.title.en;

/** Every record in the fixture, newest first (dates in the fixture are distinct). */
const RECORDS = Object.entries(seed.competencies)
  .flatMap(([ref, c]) => c.evidence.map((e) => ({ ref, ...e })))
  .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));

async function openSeeded(page: Page, path: string) {
  await page.addInitScript((value) => localStorage.setItem("atlas.progress.v2", value), JSON.stringify(seed));
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

const log = (page: Page) => page.getByRole("region", { name: "Evidence log" });
const entries = (page: Page) => log(page).locator(".log-entry");

let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

test("the evidence log lists every record once, newest first, and changes nothing", async ({ page }) => {
  await openSeeded(page, "/en/progress/");
  await expect(entries(page)).toHaveCount(RECORDS.length);
  await expect(log(page)).toContainText(`${RECORDS.length} records, newest first`);

  for (const [i, record] of RECORDS.entries()) {
    const entry = entries(page).nth(i);
    const time = entry.locator("time");
    await expect(time).toHaveAttribute("datetime", record.recorded_at);
    await expect(time).toHaveText(formatDate(record.recorded_at, "en"));
    await expect(entry.getByRole("link", { name: titleOf(record.ref) })).toBeVisible();
    await expect(entry.locator(".state-badge")).toContainText(record.supports_state);
    // The note is an excerpt: its opening words are there, a long note is cut with an ellipsis.
    const opening = record.note!.slice(0, 40);
    await expect(entry.locator(".entry-note")).toContainText(opening);
    if (record.note!.length > 160) await expect(entry.locator(".entry-note")).toHaveText(/…$/);
  }

  // The log is read-only: no controls, and viewing it leaves the stored progress as it was.
  await expect(log(page).getByRole("button")).toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas.progress.v2") ?? "{}"));
  expect(stored).toEqual(seed);
});

test("Vietnamese dates in the log use the page locale", async ({ page }) => {
  await openSeeded(page, "/vi/progress/");
  const viLog = page.getByRole("region", { name: "Nhật ký bằng chứng" });
  await expect(viLog.locator(".log-entry").first().locator("time")).toHaveText(
    formatDate(RECORDS[0].recorded_at, "vi"),
  );
  await expect(viLog).toContainText(`${RECORDS.length} bản ghi, mới nhất trước`);
});

test("next steps, the review queue, and Your data sit in the margin beside the log", async ({ page }) => {
  await openSeeded(page, "/en/progress/");
  const logBox = (await log(page).boundingBox())!;
  for (const name of ["Next for you", "Review", "Your data"]) {
    const box = (await page.getByRole("region", { name }).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(logBox.x + logBox.width);
  }
  const data = page.getByRole("region", { name: "Your data" });
  await expect(data.getByRole("button", { name: "Export progress.yaml" })).toBeEnabled();
  await expect(data.getByRole("button", { name: "Import progress.yaml" })).toBeEnabled();
});

test("@mobile the margin follows the log on a phone", async ({ page }) => {
  await openSeeded(page, "/en/progress/");
  const logBox = (await log(page).boundingBox())!;
  for (const name of ["Next for you", "Review", "Your data"]) {
    const box = (await page.getByRole("region", { name }).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(logBox.y + logBox.height);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
});
