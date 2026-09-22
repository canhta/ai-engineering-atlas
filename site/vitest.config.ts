/// <reference types="vitest/config" />
// Component tests that need Astro's compiler (the block renderer). Pure-logic tests stay on
// `node --test` (src/**/*.test.ts).
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["src/**/*.vitest.ts"],
  },
});
