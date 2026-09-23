# 03: Search across everything

Spec: [../spec.md](../spec.md)

**What to build:** `/{lang}/search/` and a search link in the top bar: one field searching every item with a page (routes, labs, projects) and every source, results grouped by kind with counts, each with title, kind, and one line of context; `?q=` shareable; a build-time index per language as a same-origin static asset; a no-JavaScript fallback linking to the Atlas list and Library.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Searching a route, a lab, a project, and a source title (taken from the model) each finds it under the right kind; counts announced
- [ ] `?q=` pre-fills and runs the search; clearing restores the empty state
- [ ] The index is built from the content model at build time and served same-origin; the page passes the real CSP in e2e
- [ ] Keyboard and screen-reader friendly; readable at 390 and 1440
- [ ] DESIGN.md information architecture and global nav updated within budget; site/TODO.md item ticked with new vi keys listed
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
