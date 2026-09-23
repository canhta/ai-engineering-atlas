# 01: The Prerequisites block shows the learner's state

Spec: [../spec.md](../spec.md)

**What to build:** on a route page, each prerequisite listed in the Prerequisites block shows the learner's state glyph (as the prerequisite line in the header already does), updating after hydration; before hydration it shows the maturity glyph as today.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] After seeding evidence on a prerequisite, the block shows that state's glyph and label for it
- [x] Before hydration and with JavaScript off the block still reads correctly
- [x] Browser test with seeded progress; DESIGN.md mentions it if the route sheet section describes the block
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
