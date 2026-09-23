# 02: The plate carries names

Spec: [../spec.md](../spec.md). Primary source: variant B on `prototype/visual-direction`.

**What to build:** the plate stops being a grid of empty squares. Inside a printed plate frame, each region shows its italic serif label and "N ready of M"; ready routes are rectangles carrying their titles, filled and marked by the learner's state; mapped competencies are small circle marks after them, still clickable. Regions are placed so rows fill without a stretched, near-empty last row. Prerequisite lines appear only on hover or focus of a tile (desktop ≥ 1024). This works on Home (tiles are links) and on the Atlas (tiles open the drawer, filters dim non-matching tiles), and on mobile as stacked region blocks with named tiles wrapping.

**Blocked by:** 01 (The whole site in the print system).

**Status:** ready-for-agent

- [ ] A pure layout module places every region once, in vocabulary order, with no trailing region stretched beyond an agreed maximum, and returns the same output for the same input; it has `node --test` coverage
- [ ] Every ready route on the plate shows its title and is a link (Home) or a drawer button (Atlas); every mapped competency is a reachable mark named "<title>, mapped"
- [ ] Learner state still reads through fill, glyph, and label for all seven states; tile accessible names are unchanged ("<title>, <status>, your state: <state>")
- [ ] At rest no prerequisite lines are drawn; hover or focus draws that tile's declared prerequisite lines
- [ ] Arrow keys move within a region and Tab between regions; Atlas filters and `?item=`, `?group=` still work
- [ ] At 390 px there is no horizontal scroll and the plate is readable
- [ ] Browser tests assert named ready tiles and reachable mapped marks with counts read from the content model; DESIGN.md's plate section is rewritten in place
- [ ] `pnpm run check`, `pnpm run test:e2e`, `make check`, and `capture.mjs` pass; screenshots reviewed
