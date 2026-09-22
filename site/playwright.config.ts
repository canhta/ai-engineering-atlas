import { defineConfig, devices } from "@playwright/test";

// Runs against the built site served by Wrangler, so CSP, _headers, and hydration are real.
// Tests tagged @mobile run only in the 390px project; the others only on desktop.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:8787", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, grepInvert: /@mobile/ },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
      grep: /@mobile/,
    },
  ],
  webServer: {
    command: "pnpm run preview",
    url: "http://127.0.0.1:8787/en/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
