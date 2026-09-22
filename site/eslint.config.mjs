// Lint only: formatting belongs to Prettier (.prettierrc.json), and eslint-config-prettier
// switches off every rule that would fight it. Types come from `astro check` in site/.
import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/", "dist/", ".astro/", ".wrangler/", "src/data/", "src/env.d.ts", "**/*.astro"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    // Node scripts and Playwright specs. `capture.mjs` and the specs also run code inside the
    // page through `page.evaluate`, so browser globals are legitimate there.
    files: ["**/*.mjs", "scripts/**", "tests/**", "*.config.{ts,mjs}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // Browser code: islands, stores, and the lab worker.
    files: ["src/**"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  prettier,
);
