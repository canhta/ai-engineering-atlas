# 02: Collection indexes read as a catalogue

Spec: [../spec.md](../spec.md)

**What to build:** `/{lang}/labs/`, `/{lang}/projects/`, `/{lang}/paths/` become a full-width ruled catalogue: per item its title, what it asks (first text passage, one or two lines), how it runs (browser tests, form, or README only), and what it is practice for (or, for projects, its member routes) with the learner's state glyphs. Stacked entries on a phone. Generic over collections, driven by the content model.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Every item of each collection appears once; items with a page link to it; "practice for" / member links go to their routes
- [ ] "How it runs" is derived from the item's blocks, not configured per lab
- [ ] No horizontal scroll at 390; the page no longer leaves the right half empty at 1440
- [ ] Browser tests read items and relations from the model; DESIGN.md's collection index lines replaced in place
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
