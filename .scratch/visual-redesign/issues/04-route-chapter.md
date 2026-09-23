# 04: The route page reads like a chapter

Spec: [../spec.md](../spec.md). Primary source: variant C on `prototype/visual-direction`.

**What to build:** a learner opening a route sees its domain as a small section label, a 32–40 px serif title, and one details line (level, capability types, number of sources, diagnostic task count) instead of pill tags, then the lead text and the prerequisite line. Below, on desktop, three columns: a numbered contents rail with each step's local status, a reading column, and a sticky margin column holding the field log behind a hairline. Sources read like a bibliography: numbered entries with the exact locator first and prominent, then the source with its type and host, then why, then the opened mark. The same details line replaces the tags in the Atlas drawer. On mobile, the sticky step bar and the bottom field-log bar opening a sheet remain. Project pages, which share the item sheet, follow the same layout.

**Blocked by:** 01 (The whole site in the print system).

**Status:** ready-for-agent

- [ ] The details line is built from the collection's list fields and block counts through the content model (no curriculum field names in site code); it uses thin rules or commas, never middle dots
- [ ] The sources block renders as a bibliography with the locator first for every route; `blocks.vitest.ts` still renders every block type
- [ ] The contents rail numbers `step` blocks from the presentation config and shows local status; scrollspy still marks the current section
- [ ] The field log sits in the sticky margin column on desktop and never covers focused content; Record evidence works as before
- [ ] The drawer shows the details line instead of tags and still opens the route and diagnostic
- [ ] Untranslated passages on `/vi/` keep `lang="en"` and the "not yet translated" marker
- [ ] Browser tests assert the details line counts and each source's locator from the model; DESIGN.md's route sheet section is rewritten in place
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, and `capture.mjs` pass; screenshots reviewed
