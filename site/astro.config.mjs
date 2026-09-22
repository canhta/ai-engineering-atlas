import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

// Every family must ship the `vietnamese` subset (DESIGN.md → Typography).
const subsets = ["latin", "vietnamese"];

export default defineConfig({
  site: "https://ai-eng.canhta.com",
  output: "static",
  trailingSlash: "always",
  integrations: [react()],
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  // Per-page hashes for Astro's inline scripts/styles. Pyodide (Phase 1b) will
  // add 'wasm-unsafe-eval' to script-src.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "font-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'"] },
      // React Aria server-renders style attributes (e.g. visually hidden inputs); hashes cannot
      // cover attributes, so styles allow 'unsafe-inline'. Scripts stay hash-only.
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  // DESIGN.md → Type. Variable families: Hubot Sans (wght + wdth), Newsreader (wght + opsz).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Hubot Sans",
      cssVariable: "--font-sans",
      weights: ["200 900"],
      styles: ["normal"],
      subsets,
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Newsreader",
      cssVariable: "--font-reading",
      weights: ["200 800"],
      styles: ["normal"],
      subsets,
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: ["100 800"],
      styles: ["normal"],
      subsets,
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});
