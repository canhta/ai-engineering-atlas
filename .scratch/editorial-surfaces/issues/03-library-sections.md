# 03: The Library is a bibliography in sections

Spec: [../spec.md](../spec.md)

**What to build:** the Library groups sources under type headings with counts, with a contents column (sticky on desktop) holding the type list and the search field; within a type, sources are ordered by how many routes cite them; each source shows its first two citing routes with locators and collapses the rest behind "and N more". Search and type filtering keep working; the list is server-rendered.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] One section per resource type present, with a count; every source appears exactly once
- [x] Citations beyond two are collapsed and can be expanded; every citation stays reachable
- [x] Search and type filter update the sections and the announced count; without JavaScript the full grouped list reads
- [x] The page height at 1440 is a fraction of today's and the right half is used; no horizontal scroll at 390
- [x] Browser tests from the model; DESIGN.md's Library section replaced in place
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
