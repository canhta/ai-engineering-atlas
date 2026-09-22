// Screenshot pages across languages, themes, and widths; run axe; check isolation headers.
// Usage: node scripts/capture.mjs [baseUrl] [outDir] [path ...]
// Serve the build first (`pnpm run preview`), since `_headers` apply only there.
// CAPTURE_PROGRESS=<progress.yaml> seeds that learner progress into every page (learner-state surfaces).
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { parse } from "yaml";

const seeded = process.env.CAPTURE_PROGRESS ? JSON.stringify(parse(readFileSync(process.env.CAPTURE_PROGRESS, "utf8"))) : null;

const [baseUrl = "http://127.0.0.1:8787", outDir = "ui-review", ...paths] = process.argv.slice(2);
const pages = paths.length
  ? paths
  : ["/{lang}/", "/{lang}/map/", "/{lang}/map/?item=ai.tool-calling", "/{lang}/progress/", "/{lang}/routes/ai.tool-calling/"];
const langs = ["en", "vi"];
const schemes = ["light", "dark"];
const widths = [390, 1440];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const scheme of schemes) {
  for (const width of widths) {
    const context = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 900 } });
    if (seeded) await context.addInitScript((value) => localStorage.setItem("atlas.progress.v2", value), seeded);
    const page = await context.newPage();
    for (const lang of langs) {
      for (const template of pages) {
        const path = template.replace("{lang}", lang);
        const response = await page.goto(baseUrl + path, { waitUntil: "networkidle" });
        const label = `${path.replaceAll("/", "_").replace(/^_|_$/g, "") || "root"}.${scheme}.${width}`;

        if (!response?.ok()) problems.push(`${label}: HTTP ${response?.status()}`);
        const headers = response?.headers() ?? {};
        if (headers["cross-origin-embedder-policy"] !== "require-corp") problems.push(`${label}: missing COEP header`);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        if (overflow) problems.push(`${label}: horizontal page scroll`);

        const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        for (const v of axe.violations) {
          problems.push(`${label}: axe ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.help}`);
        }

        await page.screenshot({ path: `${outDir}/${label}.png`, fullPage: true });
      }
    }
    await context.close();
  }
}

await browser.close();
console.log(`Captured ${schemes.length * widths.length * langs.length * pages.length} screenshots in ${outDir}/`);
if (problems.length) {
  console.error("\nProblems:\n" + problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log("OK: no HTTP, header, overflow, or axe problems");
