import { copyFileSync, createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

// Every family must ship the `vietnamese` subset (DESIGN.md → Typography).
const subsets = ["latin", "vietnamese"];

// Browser labs (DESIGN.md → Labs): Pyodide is self-hosted from the npm package under a versioned
// path, so it loads same-origin (COEP require-corp) and nothing third-party runs. Only the core
// runtime and the standard library ship; labs cannot load extra packages yet.
const pyodideDir = fileURLToPath(new URL("./node_modules/pyodide/", import.meta.url));
const pyodideVersion = JSON.parse(readFileSync(`${pyodideDir}package.json`, "utf8")).version;
const PYODIDE_BASE = `/pyodide/${pyodideVersion}/`;
const PYODIDE_FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const ASSET_LIMIT = 25 * 1024 * 1024; // Cloudflare Workers static assets: 25 MiB per file
const MIME = { ".mjs": "text/javascript", ".wasm": "application/wasm", ".zip": "application/zip", ".json": "application/json" };

function selfHostedPyodide() {
  return {
    name: "self-hosted-pyodide",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const name = req.url?.startsWith(PYODIDE_BASE) ? req.url.slice(PYODIDE_BASE.length).split("?")[0] : "";
          if (!PYODIDE_FILES.includes(name)) return next();
          res.setHeader("Content-Type", MIME[name.slice(name.lastIndexOf("."))]);
          createReadStream(pyodideDir + name).pipe(res);
        });
      },
      "astro:build:done": ({ dir }) => {
        const out = fileURLToPath(new URL(`.${PYODIDE_BASE}`, dir));
        mkdirSync(out, { recursive: true });
        for (const name of PYODIDE_FILES) {
          const size = statSync(pyodideDir + name).size;
          if (size > ASSET_LIMIT) throw new Error(`pyodide/${name} is ${size} bytes, over the 25 MiB static-asset limit`);
          copyFileSync(pyodideDir + name, out + name);
        }
      },
    },
  };
}

export default defineConfig({
  site: "https://ai-eng.canhta.com",
  output: "static",
  trailingSlash: "always",
  integrations: [react(), selfHostedPyodide()],
  vite: {
    define: { __PYODIDE_BASE__: JSON.stringify(PYODIDE_BASE) },
    worker: { format: "es" },
  },
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  // Per-page hashes for Astro's inline scripts/styles. Labs compile Pyodide's WebAssembly
  // ('wasm-unsafe-eval'; no JavaScript eval) in a same-origin module worker (worker-src).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "font-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "worker-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
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
