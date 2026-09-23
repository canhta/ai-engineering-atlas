import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

const ROUTE = "/en/routes/ai.tool-calling/";
const ROUTE_REF = "ai.tool-calling";

// Counts come from the content model, never typed in: the curriculum grows, and a test that
// pins "19 of 116" fails on the next route promotion rather than on a real regression.
type L10n = { en: string; vi?: string };
type Model = {
  collections: {
    id: string;
    label: L10n;
    group_by?: string;
    page_when?: unknown;
    progress?: { tracks?: boolean };
    fields: Record<string, { vocabulary?: string }>;
  }[];
  vocabularies: Record<string, Record<string, { label: L10n }>>;
  items: Record<
    string,
    {
      id: string;
      title: L10n;
      fields: Record<string, unknown>;
      page?: {
        blocks: {
          id: string;
          type: string;
          title: L10n;
          step?: boolean;
          tasks?: unknown[];
          rows?: { resource: string; locator: L10n }[];
        }[];
      };
    }[]
  >;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const trackedItems = model.items[tracked.id];
const TOTAL = trackedItems.length;
const READY = trackedItems.filter((i) => i.page).length;
const routeItem = trackedItems.find((i) => i.id === ROUTE_REF)!;
const routeBlocks = routeItem.page!.blocks;
/** Ready routes in the route's region, the denominator of its row on Progress. */
const REGION_READY = trackedItems.filter(
  (i) => i.page && i.fields[tracked.group_by!] === routeItem.fields[tracked.group_by!],
).length;
const TASKS = (routeBlocks.find((b) => b.type === "diagnostic")?.tasks ?? []).length;
const SOURCES = (routeBlocks.find((b) => b.id === "sources")?.rows ?? []).length;
/** Every sources block of the route, and the rows across them: the details line's source count. */
const SOURCE_BLOCKS = routeBlocks.filter((b) => b.type === "sources");
const ALL_SOURCES = SOURCE_BLOCKS.reduce((n, b) => n + (b.rows ?? []).length, 0);
const STEP_BLOCKS = routeBlocks.filter((b) => b.step);
const groupField = tracked.group_by!;
const GROUP_LABEL =
  model.vocabularies[tracked.fields[groupField].vocabulary!][String(routeItem.fields[groupField])].label;

/** Wait until every island on the page has hydrated (Astro removes the `ssr` attribute). */
async function hydrated(page: Page) {
  // Right after a navigation the islands may not be parsed yet, and zero pending islands would pass.
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0);
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await hydrated(page);
}

// Every test fails on a console error, an uncaught exception, or a CSP violation.
let errors: string[] = [];
test.beforeEach(({ page }) => {
  errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors).toEqual([]);
});

const fieldLog = (page: Page) => page.locator("aside.field-log");
const rail = (page: Page) => page.getByRole("navigation", { name: "On this page" });
const tile = (page: Page, ref: string) => page.locator(`.tile[data-ref="${ref}"]`);
const count = (page: Page) => page.locator(".results [role=status]");
const drawer = (page: Page) => page.getByRole("dialog").filter({ has: page.locator("#drawer-title") });

async function recordEvidence(page: Page, note: string) {
  await fieldLog(page).getByRole("button", { name: "Record evidence" }).click();
  await page.getByLabel("Kind").selectOption("implementation");
  await page.getByLabel("This shows the capability is").selectOption("demonstrated");
  await page.getByLabel("What does the artifact show?").fill(note);
  await page.getByRole("button", { name: "Save evidence" }).click();
}

// ---------------------------------------------------------------- Atlas

test("atlas search and filters dim the plate and announce the count", async ({ page }) => {
  await open(page, "/en/map/");
  await expect(count(page)).toHaveText(`Showing ${TOTAL} of ${TOTAL}`);

  await page.getByLabel("Search competencies").fill("retrieval");
  await expect(count(page)).not.toHaveText(`Showing ${TOTAL} of ${TOTAL}`);
  await expect(tile(page, "retrieval.search")).not.toHaveClass(/is-dim/);
  await expect(tile(page, "software.testing")).toHaveClass(/is-dim/);

  await page.getByText("Ready routes only").click();
  await expect(page).toHaveURL(/ready=1/);
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(count(page)).toHaveText(`Showing ${TOTAL} of ${TOTAL}`);
  await expect(page).not.toHaveURL(/ready=1/);
});

test("?ready=1 starts with ready routes only; nothing matching shows the empty state", async ({ page }) => {
  await open(page, "/en/map/?ready=1");
  await expect(page.getByRole("checkbox", { name: "Ready routes only" })).toBeChecked();
  await expect(count(page)).toHaveText(`Showing ${READY} of ${TOTAL}`);
  await page.getByLabel("Search competencies").fill("zzzz");
  await expect(page.getByText("No competency matches these filters.")).toBeVisible();
});

test("plate keyboard: arrows move within a region, Tab moves to the next region", async ({ page }) => {
  await open(page, "/en/map/");
  const first = page.locator("#region-software-engineering .tile").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#region-software-engineering .tile").nth(1)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#region-systems .tile").first()).toBeFocused();
  await expect(tile(page, "ai.tool-calling")).toHaveAttribute(
    "aria-label",
    "Tool Calling, ready, your state: unassessed",
  );
});

test("a tile opens the drawer; Esc closes it and returns focus to the tile", async ({ page }) => {
  await open(page, "/en/map/");
  await tile(page, "ai.tool-calling").focus();
  await page.keyboard.press("Enter");
  await expect(drawer(page).getByRole("heading", { name: "Tool Calling" })).toBeVisible();
  await expect(page).toHaveURL(/item=ai\.tool-calling/);
  await expect(drawer(page).getByRole("link", { name: "Open route" })).toHaveAttribute("href", ROUTE);
  // The details line replaces tags: counts from the model, never joined by middle dots.
  const details = drawer(page).getByRole("list", { name: "Details" });
  await expect(details).toContainText(`${ALL_SOURCES} sources`);
  await expect(details).toContainText(`${TASKS} diagnostic tasks`);
  await expect(details).not.toContainText("·");
  await expect(drawer(page).getByRole("link", { name: "Start diagnostic" })).toHaveAttribute(
    "href",
    `${ROUTE}#${routeBlocks.find((b) => b.type === "diagnostic")!.id}`,
  );
  // Focus moves into the drawer (DESIGN.md → Accessibility baseline) before Esc can close it.
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  await expect(tile(page, "ai.tool-calling")).toBeFocused();
  await expect(page).not.toHaveURL(/item=/);
});

test("deep links open the drawer, including the mapped-item variant", async ({ page }) => {
  await open(page, "/en/map/?item=ai.tool-calling");
  await expect(drawer(page).getByRole("heading", { name: "Tool Calling" })).toBeVisible();
  await open(page, "/en/map/?item=software.testing");
  await expect(drawer(page).getByText("Mapped, no route yet. It shows where the roadmap is going.")).toBeVisible();
  await expect(drawer(page).getByRole("link", { name: "How to contribute a route" })).toBeVisible();
});

test("the list view is the plate's equivalent: disclosures and rows open the drawer", async ({ page }) => {
  await open(page, "/en/map/");
  await page.getByRole("button", { name: "List" }).click();
  const trigger = page.getByRole("button", { name: /Software Engineering/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("software.testing")).toBeVisible();
  await page.getByRole("button", { name: "Tool Calling", exact: true }).click();
  await expect(drawer(page).getByRole("heading", { name: "Tool Calling" })).toBeVisible();
});

test("?group= focuses a region and opens it in the list", async ({ page }) => {
  await open(page, "/en/map/?group=systems");
  await expect(page.locator("#region-systems")).toHaveClass(/is-focus/);
  await open(page, "/en/map/?group=systems&view=list");
  await expect(page.getByRole("button", { name: /^Systems/ })).toHaveAttribute("aria-expanded", "true");
});

test("home tiles lead to the atlas drawer", async ({ page }) => {
  await open(page, "/en/");
  await tile(page, "ai.tool-calling").click();
  await expect(page).toHaveURL(/\/en\/map\/\?item=ai\.tool-calling/);
  await hydrated(page);
  await expect(drawer(page).getByRole("heading", { name: "Tool Calling" })).toBeVisible();
});

// ---------------------------------------------------------------- The plate carries names

const plate = (page: Page) => page.locator(".plate");
const titleOf = (item: (typeof trackedItems)[number]) => (item as unknown as { title: { en: string } }).title.en;
const readyItems = trackedItems.filter((i) => i.page);
const mappedItems = trackedItems.filter((i) => !i.page);
const startsWith = (name: string) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

async function namesEveryItem(page: Page, role: "link" | "button") {
  // Every ready route shows its title on the plate and is named "<title>, <status>, your state: …".
  await expect(plate(page).locator(".tile-route")).toHaveCount(READY);
  for (const item of readyItems) {
    const routeTile = tile(page, item.id);
    await expect(routeTile).toHaveText(titleOf(item));
    await expect(
      plate(page).getByRole(role, { name: startsWith(`${titleOf(item)}, ready, your state: `) }),
    ).toHaveCount(1);
  }
  // Every mapped competency is a reachable mark named "<title>, mapped…".
  await expect(plate(page).locator(".tile-mark")).toHaveCount(TOTAL - READY);
  for (const item of mappedItems) {
    await expect(plate(page).getByRole(role, { name: startsWith(`${titleOf(item)}, mapped`) })).toHaveCount(1);
  }
}

test("Home plate names every ready route as a link and keeps every mapped mark reachable", async ({ page }) => {
  await open(page, "/en/");
  await namesEveryItem(page, "link");
  const mapped = mappedItems[0];
  await expect(tile(page, mapped.id)).toHaveAttribute("href", `/en/map/?item=${mapped.id}`);
});

test("Atlas plate names every ready route as a button; a mapped mark opens its drawer", async ({ page }) => {
  await open(page, "/en/map/");
  await namesEveryItem(page, "button");
  await tile(page, mappedItems[0].id).click();
  await expect(drawer(page).getByRole("heading", { name: titleOf(mappedItems[0]) })).toBeVisible();
  await expect(drawer(page).getByText("Mapped, no route yet. It shows where the roadmap is going.")).toBeVisible();
});

test("prerequisite lines appear only on hover or focus of a tile", async ({ page }) => {
  const needs = (model as unknown as { relations: { type: string; to: string }[] }).relations.filter(
    (r) => r.type === "prerequisite" && r.to === ROUTE_REF,
  ).length;
  expect(needs).toBeGreaterThan(0);
  await open(page, "/en/map/");
  const lines = page.locator(".plate-lines path");
  await expect(lines).toHaveCount(0);
  await tile(page, ROUTE_REF).hover();
  await expect(lines).toHaveCount(needs);
  await page.mouse.move(0, 0);
  await expect(lines).toHaveCount(0);
  await tile(page, ROUTE_REF).focus();
  await expect(lines).toHaveCount(needs);
});

test("@mobile the plate stacks into readable region blocks without horizontal scroll", async ({ page }) => {
  for (const path of ["/en/", "/en/map/"]) {
    await open(page, path);
    await expect(tile(page, ROUTE_REF)).toBeVisible();
    await expect(tile(page, ROUTE_REF)).toHaveText(titleOf(routeItem));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // No prerequisite lines below 1024.
    await tile(page, ROUTE_REF).focus();
    await expect(page.locator(".plate-lines path")).toHaveCount(0);
  }
});

// ---------------------------------------------------------------- Route sheet

test("the route page reads like a chapter: section label, title, details line, bibliography", async ({ page }) => {
  await open(page, ROUTE);
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: GROUP_LABEL.en, exact: true }).first()).toHaveAttribute(
    "href",
    /\/en\/map\/\?group=/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(routeItem.title.en);

  const details = main.getByRole("list", { name: "Details" });
  await expect(details).toContainText(`${ALL_SOURCES} sources`);
  await expect(details).toContainText(`${TASKS} diagnostic tasks`);
  await expect(details).not.toContainText("·");

  // Every sources block is a bibliography: one entry per row, the exact locator first.
  for (const block of SOURCE_BLOCKS) {
    const entries = main.getByRole("list", { name: block.title.en, exact: true }).getByRole("listitem");
    await expect(entries).toHaveCount(block.rows!.length);
    for (const [i, row] of block.rows!.entries()) {
      await expect(entries.nth(i).locator("p").first()).toContainText(row.locator.en);
    }
  }
});

test("the contents rail numbers the steps and marks the current section", async ({ page }) => {
  await open(page, ROUTE);
  for (const [i, block] of STEP_BLOCKS.entries()) {
    const link = rail(page).locator(`a[href="#${block.id}"]`);
    await expect(link).toContainText(`${i + 1}`);
    await expect(link).toContainText(block.title.en);
  }
  const sources = SOURCE_BLOCKS[0];
  await rail(page).locator(`a[href="#${sources.id}"]`).click();
  await expect(rail(page).locator(`a[href="#${sources.id}"]`)).toHaveAttribute("aria-current", "location");
});

test("every in-page anchor on the route page points at one element on it", async ({ page }) => {
  await open(page, ROUTE);
  const targets = await page.locator('main a[href^="#"]').evaluateAll((links) =>
    links.map((a) => {
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      return { id, found: document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length };
    }),
  );
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) expect(target, target.id).toEqual({ id: target.id, found: 1 });
});

test("the field log stays in the margin column beside the reading column while scrolling", async ({ page }) => {
  await open(page, ROUTE);
  await page.locator(`#${STEP_BLOCKS.at(-1)!.id}`).scrollIntoViewIfNeeded();
  const record = fieldLog(page).getByRole("button", { name: "Record evidence" });
  await expect(record).toBeInViewport();
  const [log, reading] = await Promise.all([
    fieldLog(page).boundingBox(),
    page.locator(`#${STEP_BLOCKS.at(-1)!.id}`).boundingBox(),
  ]);
  expect(log!.x).toBeGreaterThanOrEqual(reading!.x + reading!.width);
});

test("an item of another collection shares the sheet: section label, contents rail, no field log", async ({ page }) => {
  // A page without a runner or form block (those are workbenches, covered in labs.spec.ts).
  const reading = (i: Model["items"][string][number]) =>
    i.page?.blocks.every((b) => b.type !== "runner" && b.type !== "form");
  const other = model.collections.find((c) => c.id !== tracked.id && model.items[c.id]?.some(reading))!;
  const item = model.items[other.id].find(reading)!;
  await open(page, `/en/${other.id}/${item.id}/`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title.en);
  await expect(page.getByRole("main").getByRole("link", { name: other.label.en, exact: true })).toHaveAttribute(
    "href",
    `/en/${other.id}/`,
  );
  await expect(rail(page)).toBeVisible();
  await expect(fieldLog(page)).toHaveCount(0);
});

test("diagnostic: one task per card, then the pass condition, record a gap", async ({ page }) => {
  await open(page, ROUTE);
  await expect(page.getByText(`Task 1 of ${TASKS}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pass condition" })).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Next task" })).toBeDisabled();
  await page.getByRole("textbox", { name: "Your answer to task 1" }).fill("answer 1");

  // Drafts survive a reload.
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole("textbox", { name: "Your answer to task 1" })).toHaveValue("answer 1");
  await expect(rail(page).getByText(`1 of ${TASKS} answered`)).toBeVisible();

  for (let n = 1; n < 4; n++) {
    await page.getByRole("button", { name: "Next task" }).click();
    await expect(page.getByText(`Task ${n + 1} of ${TASKS}`)).toBeVisible();
    await page.getByRole("textbox", { name: `Your answer to task ${n + 1}` }).fill(`answer ${n + 1}`);
  }
  await page.getByRole("button", { name: "Compare with the pass condition" }).click();
  await expect(page.getByRole("heading", { name: "Pass condition" })).toBeVisible();
  await page.getByText("Not yet").click();
  await page.getByRole("button", { name: "Record diagnostic result" }).click();
  await expect(page.getByText("Recorded. Start with")).toBeVisible();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("gap");
  await expect(rail(page).getByText("Result recorded")).toBeVisible();
});

test("a due delayed-retrieval check reuses the diagnostic and updates the review queue (ts-fsrs)", async ({ page }) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  // A pre-FSRS-style progress.yaml: review_on but no `review` card (site/src/lib/review.ts seeds one
  // on the next evidence). Due today, so it appears in the queue right after import.
  const fixture = `version: 2
updated_at: "${todayIso}"
competencies:
  ${ROUTE_REF}:
    current_state: demonstrated
    target_state: retained
    evidence:
      - id: implementation-seed-1
        kind: implementation
        supports_state: demonstrated
        recorded_at: "2026-01-01"
        note: "Tool contract with validation and idempotent retries."
        independence: independent
        review_method: self
    state_history:
      - state: demonstrated
        recorded_at: "2026-01-01"
        reason: "Exit evidence recorded."
        evidence_refs:
          - implementation-seed-1
    next_action: "Run a delayed retrieval check without reopening the sources, or attempt the transfer task."
    review_on: "${todayIso}"
`;

  await open(page, "/en/progress/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import progress.yaml" }).click();
  await (await chooser).setFiles({ name: "progress.yaml", mimeType: "application/yaml", buffer: Buffer.from(fixture) });
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByText("Imported.")).toBeVisible();

  const dueCount = page.locator(".queue-counts span", { hasText: "Due today" }).locator("strong");
  await expect(dueCount).toHaveText("1");
  const queueRow = page.locator(".queue-rows li").filter({ hasText: "Tool Calling" });
  await expect(queueRow).toBeVisible();
  await queueRow.getByRole("link", { name: "Start review" }).click();
  await expect(page).toHaveURL(/\/en\/routes\/ai\.tool-calling\/#diagnostic$/);
  await hydrated(page);

  // Same diagnostic tasks as a first attempt, but this submission is a review: it records
  // `kind: retrieval`, not `kind: diagnostic` (recordEvidence in src/lib/progress.ts).
  await expect(page.getByText(`Task 1 of ${TASKS}`)).toBeVisible();
  await page.getByRole("textbox", { name: "Your answer to task 1" }).fill("answer 1");
  for (let n = 1; n < TASKS; n++) {
    await page.getByRole("button", { name: "Next task" }).click();
    await expect(page.getByText(`Task ${n + 1} of ${TASKS}`)).toBeVisible();
    await page.getByRole("textbox", { name: `Your answer to task ${n + 1}` }).fill(`answer ${n + 1}`);
  }
  await page.getByRole("button", { name: "Compare with the pass condition" }).click();
  await page.getByText("Meets the pass condition").click();
  await page.getByRole("button", { name: "Record diagnostic result" }).click();

  // A pass on a demonstrated competency reaches "retained" (docs/LEARNING_MODEL.md: retrieved
  // successfully after a delay), and the confirmation names the newly scheduled date, not a link.
  await expect(page.getByText(/^Recorded\. Next check /)).toBeVisible();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("retained");
  const nextReview = await fieldLog(page).locator(".log-facts time").last().getAttribute("datetime");
  expect(nextReview).toBeTruthy();
  expect(nextReview! > todayIso).toBe(true);

  // A pass lengthens the interval (site/src/lib/review.ts), so the item leaves the due queue —
  // it may still show under "Next 7 days" rather than disappearing outright.
  await open(page, "/en/progress/");
  await expect(dueCount).toHaveText("0");
});

test("opening a source is a personal mark and leaves the state unchanged", async ({ page }) => {
  await open(page, ROUTE);
  const opened = page.getByRole("checkbox", { name: /^Opened / }).first();
  await page.locator(".bibliography .checkbox").first().click();
  await expect(opened).toBeChecked();
  await expect(rail(page).getByText(`1 of ${SOURCES} opened`)).toBeVisible();
  await page.reload();
  await hydrated(page);
  await expect(opened).toBeChecked();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("unassessed");
});

test("recorded evidence shows on the route, the progress page, and the atlas filters", async ({ page }) => {
  await open(page, ROUTE);
  await recordEvidence(page, "Tool contract with validation and idempotent retries.");
  await expect(fieldLog(page).getByText("Saved. Your state is now demonstrated.")).toBeVisible();
  await expect(fieldLog(page).locator(".log-facts time")).toBeVisible();
  await expect(rail(page).getByText("Evidence recorded (1)").first()).toBeVisible();

  await open(page, "/en/progress/");
  await expect(page.getByText(`1 of ${READY} ready routes demonstrated or beyond`)).toBeVisible();

  // Progress summarises by domain; the tile grid belongs to the Atlas (DESIGN.md → Progress).
  await expect(page.locator(".region-bars .tile")).toHaveCount(0);
  const domain = page.locator(".region-bars li", { hasText: "AI engineering" });
  await expect(domain.locator(".region-share[data-state='demonstrated']")).toBeVisible();
  await expect(domain).toContainText(`1 of ${REGION_READY} demonstrated`);
  await expect(domain.getByRole("link")).toHaveAttribute("href", /\/en\/map\/\?group=/);
  await expect(page.getByRole("link", { name: "Tool Calling" }).first()).toBeVisible();

  await open(page, "/en/map/");
  await page.getByRole("combobox", { name: "Your state" }).selectOption("done");
  await expect(count(page)).toHaveText(`Showing 1 of ${TOTAL}`);
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
  await expect(page.getByText("No evidence recorded yet. Start with a diagnostic on any ready route.")).toBeVisible();

  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import progress.yaml" }).click();
  await (await chooser).setFiles(file);
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByText("Imported.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tool Calling" }).first()).toBeVisible();
});

test("Vietnamese pages render the same interactions and mark untranslated text", async ({ page }) => {
  await open(page, "/vi/map/");
  await expect(count(page)).toHaveText(`${TOTAL}/${TOTAL} kỹ năng`);
  await open(page, "/vi/routes/ai.tool-calling/");
  await expect(page.getByText("Câu 1/4")).toBeVisible();
  await expect(page.getByRole("button", { name: "Câu tiếp" })).toBeDisabled();
  await expect(page.locator("h1")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("note")).toHaveText("chưa dịch / not yet translated");
  await expect(page.getByRole("list", { name: "Thông tin" })).toContainText(`${TASKS} câu kiểm tra đầu vào`);
});

test("the root page opens the remembered language", async ({ page }) => {
  await open(page, "/vi/");
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi\/$/);
});

// ---------------------------------------------------------------- States (DESIGN.md → States every surface handles)

test("an unknown ?item= opens the drawer with a not-found message", async ({ page }) => {
  await open(page, "/en/map/?item=nope.missing");
  await expect(drawer(page).getByRole("heading", { name: "Not found" })).toBeVisible();
  await expect(drawer(page).getByText("No competency has the id nope.missing.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  await expect(page).not.toHaveURL(/item=/);
});

test("progress with no evidence shows the empty review queue and the start action", async ({ page }) => {
  await open(page, "/en/progress/");
  await expect(page.getByText("Nothing to review yet.", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find your starting point" })).toHaveAttribute(
    "href",
    "/en/map/?ready=1",
  );
});

test("an invalid progress.yaml is rejected with reasons listed inline", async ({ page }) => {
  await open(page, "/en/progress/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import progress.yaml" }).click();
  await (
    await chooser
  ).setFiles({
    name: "progress.yaml",
    mimeType: "application/yaml",
    buffer: Buffer.from("version: 2\ncompetencies:\n  x:\n    current_state: mastered\n"),
  });
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("The file was not imported:");
  await expect(alert).toContainText("current_state is not a known state");
});

test("with storage blocked, recording still works for the page and the page says so", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  await open(page, ROUTE);
  await expect(fieldLog(page).getByRole("note")).toContainText("This browser blocks storage");
  await recordEvidence(page, "Works without storage.");
  await expect(fieldLog(page).getByText("Saved. Your state is now demonstrated.")).toBeVisible();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("demonstrated");
});

test("without JavaScript the plate tiles are links into the atlas", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator('.tile[data-ref="ai.tool-calling"]')).toHaveAttribute(
    "href",
    "/en/map/?item=ai.tool-calling",
  );
  // Progress has no tiles; its domain bars are links into the Atlas and work without JavaScript.
  await page.goto("/en/progress/");
  await expect(page.locator(".region-bars li").first().getByRole("link")).toHaveAttribute(
    "href",
    /\/en\/map\/\?group=/,
  );
  await page.goto(ROUTE);
  await expect(page.getByRole("heading", { level: 1, name: "Tool Calling" })).toBeVisible();
  await context.close();
});

test("the Home plate appears at once, without an entrance animation", async ({ page }) => {
  await open(page, "/en/");
  const regions = await page
    .locator(".plate-region")
    .evaluateAll((els) => els.map((el) => [getComputedStyle(el).animationName, getComputedStyle(el).opacity]));
  expect(regions.length).toBeGreaterThan(0);
  for (const region of regions) expect(region).toEqual(["none", "1"]);
});

test("the seven states have distinct glyphs or colours in the progress legend", async ({ page }) => {
  await open(page, "/en/progress/");
  const legend = page.getByRole("list", { name: "Legend" });
  const looks = await legend.locator("li").evaluateAll((items) =>
    items.map((li) => {
      const glyph = li.querySelector(".tile-glyph")!;
      const fill = [...glyph.classList].find((c) => /^tile-(ready|half|most|full)$/.test(c));
      return `${fill}|${getComputedStyle(glyph).color}|${li.querySelector("svg") ? "icon" : ""}`;
    }),
  );
  expect(looks).toHaveLength(7);
  expect(new Set(looks).size).toBe(7);
});

// ---------------------------------------------------------------- Mobile (390px)

test("@mobile the field log opens as a sheet from the bottom bar", async ({ page }) => {
  await open(page, ROUTE);
  await expect(fieldLog(page)).toBeHidden();
  await page.locator(".log-bar").getByRole("button", { name: "Record evidence" }).click();
  const sheet = page.getByRole("dialog", { name: "Field log" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("@mobile the drawer is a full-screen sheet", async ({ page }) => {
  await open(page, "/en/map/");
  await tile(page, "ai.tool-calling").click();
  const d = drawer(page);
  await expect(d.getByRole("heading", { name: "Tool Calling" })).toBeVisible();
  // After the slide-in settles, the sheet covers the viewport width.
  await expect.poll(async () => Math.round((await page.locator(".drawer").boundingBox())?.x ?? -1)).toBe(0);
  expect(Math.round((await page.locator(".drawer").boundingBox())?.width ?? 0)).toBe(390);
  await d.getByRole("button", { name: "Close" }).click();
  await expect(d).toBeHidden();
});

test("@mobile filters live in a sheet with a live count", async ({ page }) => {
  await open(page, "/en/map/");
  await expect(page.getByLabel("Target level")).toBeHidden();
  await page.getByRole("button", { name: "Filters (0)" }).click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await expect(sheet).toBeVisible();
  await sheet.getByText("Ready routes only").click();
  await sheet.getByRole("button", { name: `Show ${READY}` }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: "Filters (1)" })).toBeVisible();
  await expect(count(page)).toHaveText(`Showing ${READY} of ${TOTAL}`);
});

test("the frame links to the repository and to the owner's contacts", async ({ page }) => {
  await open(page, "/en/");
  const repo: string = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8")).site
    .repository;

  await expect(page.locator(`header a[href="${repo}"]`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Star on GitHub" })).toHaveAttribute("href", repo);

  const contacts = page.getByRole("list", { name: "Contact" }).getByRole("link");
  const links: { kind: string; url: string }[] = JSON.parse(
    readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"),
  ).site.links;
  await expect(contacts).toHaveCount(links.length);
  for (const link of links)
    await expect(contacts.filter({ hasText: "" }).and(page.locator(`[href="${link.url}"]`))).toHaveCount(1);
});

test("each collection has an index page, reachable from the atlas", async ({ page }) => {
  await open(page, "/en/map/");
  const also = page.getByRole("navigation", { name: "Also in the atlas" });
  await expect(also.getByRole("link", { name: "Labs" })).toHaveAttribute("href", "/en/labs/");

  await also.getByRole("link", { name: "Labs" }).click();
  await expect(page).toHaveURL(/\/en\/labs\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Labs" })).toBeVisible();

  // Every lab is listed, and each says which competency it is practice for.
  const labs = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8")).items.labs;
  await expect(page.locator(".collection-index > li")).toHaveCount(labs.length);
  await page.getByRole("link", { name: "Self-Attention Lab" }).click();
  await expect(page).toHaveURL(/\/en\/labs\/self-attention\/$/);
});

test("the library lists every source, searchable, linking out and back to the routes", async ({ page }) => {
  const model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
  const sources = Object.keys(model.resources).length;

  await open(page, "/en/map/");
  await page.getByRole("navigation", { name: "Also in the atlas" }).getByRole("link", { name: "Library" }).click();
  await expect(page).toHaveURL(/\/en\/sources\/$/);
  // Typing before the search island hydrates is lost, so wait for it.
  await hydrated(page);
  await expect(page.locator(".library > li")).toHaveCount(sources);

  // Each entry links to the public resource and cites the routes that use it.
  const first = page.locator(".library > li").first();
  await expect(first.locator(".library-head a")).toHaveAttribute("href", /^https?:\/\//);
  await expect(first.locator(".library-citations a").first()).toHaveAttribute("href", /\/en\/routes\//);

  // The status line is driven by the same state as the list, so waiting on it avoids racing hydration.
  const search = page.getByRole("searchbox", { name: "Search sources" });
  await search.click();
  await search.fill("chip huyen");
  await expect(page.getByRole("status")).toContainText(`1 of ${sources} sources`);
  await expect(page.locator(".library > li")).toHaveCount(1);

  await search.fill("");
  await expect(page.getByRole("status")).toContainText(`${sources} of ${sources} sources`);
  // The type label comes from the content model (resource_type), so match it case-insensitively.
  await page.getByRole("button", { name: /^paper/i }).click();
  const papers = Object.values(model.resources as Record<string, { type?: string }>).filter(
    (r) => r.type === "paper",
  ).length;
  await expect(page.locator(".library > li")).toHaveCount(papers);
  await expect(page.getByRole("status")).toContainText(`${papers} of ${sources} sources`);
});

test("the top bar never blurs or covers the focused element", async ({ page }) => {
  await open(page, ROUTE);
  const bar = page.getByRole("banner");
  await expect(bar).toHaveCSS("backdrop-filter", "none");
  // Scroll down, then move focus backwards through the page: every focused element lands below the bar.
  await page.locator("#sources").scrollIntoViewIfNeeded();
  const links = page.locator("main a[href]:visible");
  const total = await links.count();
  for (const i of [total - 1, Math.floor(total / 2), 3]) {
    await links.nth(i).focus();
    const [barBottom, top] = await Promise.all([
      bar.evaluate((el) => el.getBoundingClientRect().bottom),
      links.nth(i).evaluate((el) => el.getBoundingClientRect().top),
    ]);
    expect(top).toBeGreaterThanOrEqual(barBottom);
  }
});
