# Spec: the remaining surfaces in the editorial print direction

Status: ready-for-agent
Follows: [visual-redesign spec](../visual-redesign/spec.md) (done), [ADR 0001](../../docs/adr/0001-editorial-print-direction.md), [CONTEXT.md](../../CONTEXT.md).
Design status: **defaults**. These surfaces were not part of the owner's grilling; the layouts below apply ADR 0001 (a printed atlas with a tool's density) and are for the owner to overrule after seeing them.

## Problem Statement

After the redesign, Home, the route page, the drawer, and the lab bench read as a printed atlas, but four surfaces only received the new type and colour and still read as generic templates (review of 2026-09-23, site/TODO.md): the collection indexes are a half-width list of links saying nothing about what each lab or project asks; the Library is one 22,000 px column with no grouping; Progress is a stock dashboard whose table repeats its bars; the Atlas opens on a row of native form selects. Separately, the Prerequisites block on route pages never shows the learner's state, although the prerequisite line above it does.

## Solution

Each surface is restructured as a page of the printed atlas, with the information it already has made visible:

- **Collection indexes** become a catalogue: a full-width ruled table (on a phone, stacked entries), one row per item, with its title, what it asks (the item's lead or first text passage, one or two lines), how it runs (in the browser with tests, as a form, or README only, from the item's blocks), and what it is practice for, each with the learner's state glyph. Projects show their member routes the same way. Items without a page stay as plain rows.
- **Library** becomes a bibliography in sections: a contents column (sticky on desktop) listing the resource types with counts plus the search field; the entries grouped under type headings, ordered by how many routes cite them; each entry keeps its citing routes and locators, collapsed after the first two with "and N more". Search and type filters keep working and still server-render.
- **Progress** becomes a field logbook: the summary sentence and region bars stay at the top; the main column is the evidence log, one entry per evidence record in reverse date order (competency, state it supports, kind, review method, date, note excerpt), replacing the per-competency table that repeated the bars; the margin column holds next steps, the review queue, and Your data (export/import).
- **Atlas** keeps the plate and list, but its filters become a quiet ruled key above the plate: search, then each facet as a disclosure button that opens a small menu of options (React Aria), the ready-only toggle, the live count, and Clear; no native selects. On a phone the filters stay in the sheet.
- **Prerequisites block** shows each prerequisite's learner state glyph after hydration, as the prerequisite line does, and stays correct before hydration.

## User Stories

1. As a learner browsing labs, I want to see what each lab asks and whether it runs in the browser, so that I can pick one without opening every page.
2. As a learner, I want each lab and project to show the routes it practises with my state, so that I can see which practice fits my gaps.
3. As a learner on a phone, I want the catalogue as stacked entries without horizontal scroll, so that it stays readable.
4. As a learner in the Library, I want sources grouped by type with a contents list, so that I can find books, papers, or documentation directly.
5. As a learner, I want each source to show which routes cite it and at which locator, without a wall of rows, so that the Library stays scannable.
6. As a learner, I want Library search and type filters to keep working, and the list to read without JavaScript, so that nothing regresses.
7. As a learner on Progress, I want to read my evidence as a dated log, so that I see what I did, not a table that repeats the bars.
8. As a learner, I want next steps, reviews due, and export/import beside the log, so that actions sit in the margin like the route page's field log.
9. As a learner with no evidence, I want Progress to say so and point to a diagnostic, so that the empty state is useful.
10. As a learner on the Atlas, I want filters that look like part of the atlas's key rather than an admin form, so that browsing feels like reading a map.
11. As a keyboard and screen-reader user, I want every filter menu operable and announced, and the count announced, so that filtering stays accessible.
12. As a learner on a route, I want the Prerequisites block to show my state on each prerequisite, so that I know which I already demonstrated.
13. As the owner, I want DESIGN.md to describe each restructured surface in place, within its line budget, so that agents keep them consistent.

## Implementation Decisions

- Everything renders from the content model through the existing reader; no curriculum field names in site code. "What it asks" is the item's first text block, trimmed; "how it runs" comes from block types present (`runner`, `form`, neither).
- The evidence log reads the existing progress store; no schema change. Export/import behaviour and messages are unchanged.
- The Atlas filter menus use React Aria (already a dependency); URL parameters (`?ready=1`, `?group=`, `?item=`, `?view=list`) and filter semantics are unchanged.
- Library grouping and collapsing are server-rendered; the island only filters.
- Each surface's DESIGN.md section is replaced in place; DESIGN.md's 340-line budget holds (tighten, don't grow).
- New UI strings in en and vi, listed for owner review in site/TODO.md.

## Testing Decisions

- Browser tests on the built site, values read from `src/data/atlas.json` or a seeded progress fixture, never pinned: catalogue rows and their "practice for" links per collection; Library sections per type with counts, collapse and "N more", search and type filter; Progress log entries from a seeded record in date order and the margin actions; Atlas filter menus by keyboard with the announced count and URL parameters; Prerequisites block state glyph after seeding evidence.
- Existing tests keep passing; `capture.mjs` has no problems; `make check` passes.

## Out of Scope

Project milestone titles (a curriculum change, RFC first); Path screens; new screens; the plate's row-height balancing; Phase 2.
