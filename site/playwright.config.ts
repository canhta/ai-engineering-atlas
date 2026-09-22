import { defineConfig, devices } from "@playwright/test";

// Runs against the built site served by Wrangler, so CSP, _headers, and hydration are real.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:8787", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run preview",
    url: "http://127.0.0.1:8787/en/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
