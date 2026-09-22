import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

const ROUTE = "/en/routes/ai.tool-calling/";
const ROUTE_REF = "ai.tool-calling";

// Counts come from the content model, never typed in: the curriculum grows, and a test that
// pins "19 of 116" fails on the next route promotion rather than on a real regression.
type Model = {
  collections: { id: string; page_when?: unknown; progress?: { tracks?: boolean } }[];
  items: Record<
    string,
    { id: string; page?: { blocks: { id: string; type: string; tasks?: unknown[]; rows?: unknown[] }[] } }[]
  >;
};
const model: Model = JSON.parse(readFileSync(new URL("../src/data/atlas.json", import.meta.url), "utf8"));
const tracked = model.collections.find((c) => c.progress?.tracks)!;
const trackedItems = model.items[tracked.id];
const TOTAL = trackedItems.length;
const READY = trackedItems.filter((i) => i.page).length;
const routeBlocks = trackedItems.find((i) => i.id === ROUTE_REF)!.page!.blocks;
const TASKS = (routeBlocks.find((b) => b.type === "diagnostic")?.tasks ?? []).length;
const SOURCES = (routeBlocks.find((b) => b.id === "sources")?.rows ?? []).length;

/** Wait until every island on the page has hydrated (Astro removes the `ssr` attribute). */
async function hydrated(page: Page) {
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

// ---------------------------------------------------------------- Route sheet

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

test("opening a source is a personal mark and leaves the state unchanged", async ({ page }) => {
  await open(page, ROUTE);
  const opened = page.getByRole("checkbox", { name: /^Opened / }).first();
  await page.locator(".sources-table .checkbox").first().click();
  await expect(opened).toBeChecked();
  await expect(rail(page).getByText(`1 of ${SOURCES} opened`)).toBeVisible();
  await page.reload();
  await hydrated(page);
  await expect(opened).toBeChecked();
  await expect(fieldLog(page).locator(".state-badge").first()).toHaveText("unassessed");
});

test("recorded evidence shows on the route, the progress plate, and the atlas filters", async ({ page }) => {
  await open(page, ROUTE);
  await recordEvidence(page, "Tool contract with validation and idempotent retries.");
  await expect(fieldLog(page).getByText("Saved. Your state is now demonstrated.")).toBeVisible();
  await expect(fieldLog(page).locator(".log-facts time")).toBeVisible();
  await expect(rail(page).getByText("Evidence recorded (1)").first()).toBeVisible();

  await open(page, "/en/progress/");
  await expect(page.getByText(`1 of ${READY} ready routes demonstrated or beyond`)).toBeVisible();
  await expect(tile(page, "ai.tool-calling")).toHaveClass(/tile-full/);
  await expect(tile(page, "ai.tool-calling")).toHaveAttribute(
    "aria-label",
    "Tool Calling, ready, your state: demonstrated",
  );
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
  await page.goto("/en/progress/");
  await expect(page.locator('.tile[data-ref="ai.tool-calling"]')).toHaveAttribute(
    "href",
    "/en/map/?item=ai.tool-calling",
  );
  await page.goto(ROUTE);
  await expect(page.getByRole("heading", { level: 1, name: "Tool Calling" })).toBeVisible();
  await context.close();
});

test("with reduced motion the Home plate appears at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/en/");
  const timing = await page
    .locator(".plate-region")
    .last()
    .evaluate((el) => [getComputedStyle(el).animationDuration, getComputedStyle(el).animationDelay]);
  expect(timing).toEqual(["0s", "0s"]);
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
