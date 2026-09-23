# 05: The route shows where it sits

Spec: [../spec.md](../spec.md). Primary source: variant B's locator plate on `prototype/visual-direction`.

**What to build:** at the top of the route page's margin column, above the field log, a small plate of the route's own region shows every competency in that region, with this route highlighted in magenta, its prerequisites ringed, and a line naming prerequisites from other regions as links. It uses the same plate layout and marks as the main plate, so it reads as a crop of the atlas. Below 1024 it moves above the content or is omitted, whichever the design review prefers, without horizontal scroll.

**Blocked by:** 02 (The plate carries names), 04 (The route page reads like a chapter).

**Status:** ready-for-agent

- [ ] The locator plate is drawn from the content model's region and relations for any route, not configured per route
- [ ] The current route and its in-region prerequisites are distinguishable by shape and label, not colour alone; out-of-region prerequisites are named links
- [ ] Each mark is reachable and named; the plate has a short accessible description
- [ ] Browser test: on a route with prerequisites, the locator plate names the route and links its out-of-region prerequisites; DESIGN.md's route sheet section describes it
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, and `capture.mjs` pass; screenshots reviewed
