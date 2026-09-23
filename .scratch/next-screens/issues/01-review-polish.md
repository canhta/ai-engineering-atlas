# 01: Review polish from the surfaces batch

Spec: [../spec.md](../spec.md)

**What to build:** fix the defects the last batch reported, so each surface behaves as designed for every learner.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Route links that show a learner-state glyph (the prerequisite line, the Prerequisites block, catalogue "practice for" links) expose the state to screen readers (visually hidden text or accessible name), tested
- [x] Library search that matches only a collapsed citation opens its "and N more" disclosure, tested
- [x] The Library contents column does not shift after hydration (the "All types" row is present before hydration or reserved), tested by comparing positions
- [x] Catalogue rows with many routes (e.g. a project covering 40) group them by domain instead of one long line, tested from the model
- [x] Lab README passages on `/vi/` carry `lang="en"` and the "not yet translated" marker in the catalogue
- [x] The Atlas filter menu in the mobile sheet no longer covers the sheet's title
- [x] Progress's "Start review" uses a quieter button style suitable for the margin (DESIGN.md states which)
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
