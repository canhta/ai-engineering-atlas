# Spec: How it works, search across everything, and review polish

Status: ready-for-agent
Follows: [editorial-surfaces spec](../editorial-surfaces/spec.md) (done), [ADR 0001](../../docs/adr/0001-editorial-print-direction.md), [CONTEXT.md](../../CONTEXT.md), [docs/LEARNING_MODEL.md](../../docs/LEARNING_MODEL.md).
Design status: **defaults** in the ADR 0001 direction, for the owner to overrule after seeing them.

## Problem Statement

Two screens from the roadmap.sh teardown have waited for the redesign to land: a page that explains the learning model (states, what counts as evidence, why review comes back), and search across routes, labs, projects, and sources (today only the Atlas list and the Library search their own items). The last batch also left small defects: the learner state on prerequisite-style route links is invisible to screen readers, Library search does not open a collapsed citation it matched, the Library contents shift after hydration, a project's 40 routes run as one line in the catalogue, lab README passages on `/vi/` lack the "not yet translated" marker, the Atlas filter menu covers the mobile sheet's title, and Progress's "Start review" is a full primary button in a narrow margin.

## Solution

- **How it works** (`/{lang}/how/`): a short reference page, linked from Home's hero and the footer. It shows the seven learner states as the plate's glyphs with their label and one-sentence meaning, what counts as evidence per capability type (from the assessment rules), the route's steps in order (the presentation config's `step` blocks), and why reviews come back (delayed retrieval). State labels, capability types, and step titles come from the content model; the explanatory sentences are UI strings derived from docs/LEARNING_MODEL.md, in en and vi, flagged for owner review. No lesson prose, no marketing.
- **Search** (`/{lang}/search/`, plus a search link in the top bar): one field over every item with a page (routes, labs, projects) and every source, grouped by kind with counts, each result showing its title, kind, and one line of context (domain for routes, "practice for" for labs, citing routes for sources). The index is built at build time from the content model and loaded by the island; `?q=` is shareable; without JavaScript the page shows a plain form that links to the Atlas list and Library.
- **Polish**: each defect above fixed, with a test where it is behaviour.

## Implementation Decisions

- Content-driven: no curriculum field names in site code; labels and structure from the content model via the one reader; islands get plain props or a built JSON index, never the model module.
- The search index is a static asset emitted at build time (same origin, CSP-safe), sized per language; no third-party search.
- DESIGN.md sections are added or replaced within the 340-line budget (tighten elsewhere if needed).
- New UI strings in en and vi (docs/VIETNAMESE_STYLE.md), listed for owner review in site/TODO.md.

## Testing Decisions

Browser tests on the built site, values from `src/data/atlas.json`: How it works shows every state and every step block title; search finds a route, a lab, a project, and a source by title, groups by kind with counts, and honours `?q=`; each polish behaviour gets a test (screen-reader state text, search opening a collapsed citation, no layout shift in Library contents, catalogue grouping). `capture.mjs` has no problems; `make check` passes.

## Out of Scope

What changed (needs a dated source of promotions — curriculum/release data first), the Atlas's opening view (owner decision), project milestones and paths (RFCs), Phase 2.
