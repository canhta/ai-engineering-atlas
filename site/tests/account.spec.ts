import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { isConsoleError } from "./fixtures/console";

// Sign-in in the top bar and the privacy page (DESIGN.md → Global frame; site/AGENTS.md → AI tutor
// and Worker). The preview runs the Worker without configuration, so /api/* answers 503 and the
// bar shows nothing; signed-out and signed-in bars are checked by answering /api/me in the test.
const ui = (lang: "en" | "vi"): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), "utf8"));
const en = ui("en");

let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (m) => isConsoleError(m) && errors.push(m.text()));
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

/** Open a page and wait until the top bar has had its answer from /api/me. */
async function open(page: Page, path: string) {
  const probe = page.waitForResponse((r) => new URL(r.url()).pathname === "/api/me");
  await page.goto(path);
  await probe;
  await page.waitForLoadState("load");
}

function answerMe(page: Page, status: number, body: unknown) {
  return page.route("**/api/me", (route) => route.fulfill({ status, json: body }));
}

const bar = (page: Page) => page.locator("header.topbar");

test("without the Worker's configuration, /api answers 503 and the bar shows no sign-in", async ({ page, request }) => {
  const api = await request.get("/api/me");
  expect(api.status()).toBe(503);
  expect(api.headers()["cache-control"]).toBe("no-store");
  expect((await api.json()).error).toBe("not-configured");

  await open(page, "/en/");
  await expect(bar(page).getByRole("link", { name: en["nav.atlas"], exact: true })).toBeVisible();
  await expect(bar(page).locator(".account-trigger")).toHaveCount(0);
});

test("pages keep their isolation headers with the Worker in front", async ({ request }) => {
  for (const path of ["/en/", "/vi/privacy/", "/en/no-such-page/"]) {
    const response = await request.get(path);
    expect(response.headers()["cross-origin-opener-policy"], path).toBe("same-origin");
    expect(response.headers()["cross-origin-embedder-policy"], path).toBe("require-corp");
  }
});

test("signed out: Sign in opens a menu of the offered providers, returning to this page", async ({ page }) => {
  await answerMe(page, 401, { error: "signed-out", providers: ["github", "google"] });
  await open(page, "/en/progress/");
  const trigger = bar(page).getByRole("button", { name: en["account.signIn"] });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: en["account.signIn"], exact: true });
  await expect(menu).toBeVisible();
  const items = menu.getByRole("menuitem");
  await expect(items).toHaveText([`${en["account.signInWith"]} GitHub`, `${en["account.signInWith"]} Google`]);
  await expect(items.first()).toHaveAttribute("href", "/api/auth/github?return=%2Fen%2Fprogress%2F");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("signed out with no provider offered shows nothing", async ({ page }) => {
  await answerMe(page, 401, { error: "signed-out", providers: [] });
  await open(page, "/en/");
  await expect(bar(page).locator(".account-trigger")).toHaveCount(0);
});

test("signed in: the name opens Sign out, which posts and returns the bar to Sign in", async ({ page }) => {
  const t = ui("vi");
  await answerMe(page, 200, { user: { name: "Ada Lovelace", provider: "github" }, providers: ["github"] });
  const posts: string[] = [];
  await page.route("**/api/auth/signout", (route) => {
    posts.push(route.request().method());
    return route.fulfill({ status: 204 });
  });
  await open(page, "/vi/");
  const trigger = bar(page).getByRole("button", { name: t["account.signedIn"].replace("{name}", "Ada Lovelace") });
  await expect(trigger).toHaveText("Ada Lovelace");
  await trigger.click();
  await page.getByRole("menuitem", { name: t["account.signOut"] }).click();
  expect(posts).toEqual(["POST"]);
  await expect(bar(page).getByRole("button", { name: t["account.signIn"] })).toBeVisible();
});

for (const lang of ["en", "vi"] as const) {
  test(`the privacy page states what is stored and sent, linked from the footer (${lang})`, async ({ page }) => {
    const t = ui(lang);
    await open(page, `/${lang}/`);
    await page.locator("footer").getByRole("link", { name: t["footer.privacy"] }).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/privacy/$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(t["privacy.title"]);
    const main = page.locator("main");
    for (const key of [
      "privacy.cookie.body",
      "privacy.stored.user",
      "privacy.stored.sessions",
      "privacy.stored.usage",
      "privacy.stored.not",
      "privacy.sent.ai",
    ]) {
      await expect(main.getByText(t[key], { exact: true }), key).toBeVisible();
    }
  });
}

test("the privacy page and a signed-in bar fit a phone @mobile", async ({ page }) => {
  await answerMe(page, 200, {
    user: { name: "Nguyễn Thị Minh Khai Phương", provider: "google" },
    providers: ["google"],
  });
  await open(page, "/vi/privacy/");
  await expect(bar(page).locator(".account-trigger")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
