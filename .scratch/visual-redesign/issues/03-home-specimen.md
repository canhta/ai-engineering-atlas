# 03: Home shows the method

Spec: [../spec.md](../spec.md). Primary source: variants B (plate) and C (specimen) on `prototype/visual-direction`.

**What to build:** a first-time visitor on Home sees the title, a one-line promise, the start action, the plate, and directly under it a specimen of one real ready route set like an atlas inset: its first diagnostic task, one source with its type, exact locator, and why, and what counts as exit evidence, each with a short margin note, and a link to the route. The specimen is built from the route's blocks in the content model and fills the page width at 1440. A returning learner with recorded evidence sees their next steps (up to 3) and due reviews lead, with the start action still available. The numbered four-step row and the "Ready routes by domain" list are gone.

**Blocked by:** 01 (The whole site in the print system). Run after 02 to avoid conflicting edits to Home; it does not depend on 02's behaviour.

**Status:** ready-for-agent

- [ ] The specimen route is chosen from the content model (a ready route with a diagnostic and sources), never typed copy; its locator matches the route page's source block
- [ ] Home without progress: title, promise, start action, plate, specimen; no four-step row, no ready-routes list
- [ ] Home with seeded evidence: the next-step list and due reviews lead; the start action remains
- [ ] With JavaScript off, the specimen and plate links read and work
- [ ] No empty right third beside the specimen at 1440; readable at 390 with no horizontal scroll
- [ ] New UI strings exist in en and vi (Vietnamese per VIETNAMESE_STYLE.md, flagged for owner review); `check:i18n` passes
- [ ] Browser tests cover both Home states with values read from the model; DESIGN.md's Home section is rewritten in place
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, and `capture.mjs` pass; screenshots reviewed
