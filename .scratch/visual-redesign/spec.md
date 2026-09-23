# Spec: editorial print redesign of the web atlas

Status: ready-for-agent
Decision record: [ADR 0001](../../docs/adr/0001-editorial-print-direction.md). Glossary: [CONTEXT.md](../../CONTEXT.md).
Primary source: branch `prototype/visual-direction` (variants B "Printed atlas" and C "Field notebook", verdict in `site/src/components/prototype/VERDICT.md`).

## Problem Statement

The web atlas reads as AI slop. A first-time visitor sees a pale grey-green page, a floating glass pill nav, a 72 px wide-display title, and a large rounded double-bezel tray full of identical dotted squares: 93 of 115 tiles are mapped competencies with no route, unlabelled, so the atlas's signature picture mostly shows emptiness. Every page opens with the same giant title and muted subtitle whatever it holds; every link is a teal underline; routes and the drawer carry four to seven pill tags; Home ends in a generic numbered four-step row and a long list that repeats the Atlas. The one thing the atlas offers that others do not, the exact source locator a route sends you to, is invisible above the fold. An earlier restrained design was rejected as generic, so the fix is neither "plainer" nor "more polished" but a clear direction: an editorial, printed atlas with a tool's density.

## Solution

The site takes the look of a printed atlas. Paper ground, near-black ink, magenta as the one route mark; Newsreader for display and reading, IBM Plex Sans for UI; hairline rules, small radii, rectangular buttons, a plain top bar; no glass, bezels, pills-in-pills, or entrance animation. The plate carries information: ready routes are large named tiles, mapped competencies are small circle marks, regions are set like map labels inside a printed plate frame, and prerequisite lines appear on hover and focus. Home leads with the plate and, directly under it, a specimen of one real ready route (a diagnostic task, a source with its exact locator and why, and what counts as evidence) so a visitor sees the method working. A learner with evidence sees their next steps first. Route pages read like a book chapter: a sized title with a section label and one details line, a numbered contents rail, sources set like a bibliography with the locator first, and the field log in a ruled margin column with a small locator plate of the route's own region. The whole visual system changes at once so no surface keeps the old kit; Home and the route page are restructured in this spec, and Atlas, Progress, Labs, and Library are restructured afterwards, one surface at a time.

## User Stories

1. As a first-time visitor, I want Home to show what a route actually looks like, so that I understand the method in seconds instead of reading a promise.
2. As a first-time visitor, I want to see an exact source locator (chapter, section, pages) on Home, so that I can tell this atlas routes me to real sources rather than generating lessons.
3. As a first-time visitor, I want the plate to name the ready routes, so that I can see what is learnable today without hovering over squares.
4. As a first-time visitor, I want mapped competencies to be visibly present but quieter than ready routes, so that I see where the roadmap is going without mistaking it for finished material.
5. As a first-time visitor, I want each region to state how many routes are ready out of how many competencies, so that the atlas's maturity is truthful.
6. As a returning learner with recorded evidence, I want Home to lead with my next steps and due reviews, so that I can continue without navigating.
7. As a returning learner, I want the start action to remain available on Home, so that I can still find a new starting point.
8. As a learner, I want to hover or focus a ready tile and see its declared prerequisite lines, so that I understand what it needs without clutter at rest.
9. As a keyboard user, I want arrow keys to move within a region and Tab between regions, so that the plate stays operable without a mouse.
10. As a screen-reader user, I want each tile named with its title, status, and my state, so that the plate is not a silent grid.
11. As a learner, I want mapped marks to remain clickable and open the item in the Atlas, so that I can read why a mapped competency matters.
12. As a learner on a phone, I want the plate to become region blocks with named ready tiles wrapping and mapped marks in a row, so that it stays readable at 390 px without horizontal scroll.
13. As a learner, I want the specimen to link to its full route, so that I can start the route it previews.
14. As a learner, I want the specimen's content to come from the real route contract, so that it never drifts from the route page.
15. As a learner opening a route, I want a compact title with its domain label above and one line of details (level, capability types, source count, diagnostic task count) below, so that I can orient without a wall of pill tags.
16. As a learner, I want the route's lead text set as readable prose, so that I know why the capability matters before starting.
17. As a learner, I want a numbered contents rail showing each step and its local status, so that I know where I am in the route.
18. As a learner, I want the sources set like a bibliography with the exact locator in the most prominent position, so that I know exactly what to open and read.
19. As a learner, I want each source to say why I should read it and link out with a clear external mark, so that the route explains its choices.
20. As a learner, I want the field log (my state, target, next review, next step, Record evidence) in a ruled margin column that stays in view, so that recording evidence is always one action away.
21. As a learner, I want a small plate of the route's own region in the margin showing this route and its prerequisites, so that I see where the route sits in the atlas.
22. As a learner on a phone, I want the field log as a sticky bottom bar that opens as a sheet, so that it never covers what I am reading.
23. As a learner, I want the prerequisite line ("Not feeling ready? Needs …") to stay near the top of the route, so that I can step back to a missing prerequisite before starting.
24. As a learner, I want the diagnostic to stay one task at a time with its answer area, so that the attempt-first flow is unchanged.
25. As a Vietnamese reader, I want every font to render Vietnamese diacritics correctly, so that `/vi/` reads as well as `/en/`.
26. As a Vietnamese reader, I want untranslated curriculum passages to keep `lang="en"` and the "not yet translated" marker, so that the redesign does not hide translation status.
27. As a learner who prefers dark mode, I want a night-chart dark theme with the same structure, so that the redesign does not remove a theme I use.
28. As a learner who prefers reduced motion, I want every transition instant, so that nothing animates against my setting.
29. As a learner anywhere on the site, I want a plain top bar with the wordmark, Atlas, Progress (with due count), and the language switch, so that navigation is predictable and never blurs content under it.
30. As a learner, I want links to read as ink with an underline and the primary action as one magenta rectangular button, so that the important action stands out and links stop competing.
31. As a learner on Atlas, Progress, Labs, and Library before their restructure, I want them to use the new type, colour, and shape, so that the site never mixes two design systems.
32. As a learner opening the Atlas drawer, I want it to keep working and use the new system (flat, hairline-ruled, shadowed only because it floats), so that the redesign does not break exploration.
33. As a learner running a lab, I want the bench to lose its bezel but keep the editor, results, and Record evidence unchanged, so that labs keep working.
34. As a learner with JavaScript off, I want Home tiles, the specimen, ready rows, and route pages to remain plain links and readable content, so that the site still works before hydration.
35. As the owner, I want DESIGN.md replaced in place to describe the new system, so that agents follow one design source of truth.
36. As the owner, I want the review tells in DESIGN.md to name the premium kit (glass, bezels, pill-in-pill buttons, large radii, wide display faces), so that agents stop reintroducing it.
37. As the owner, I want stylelint and the token contrast check to enforce the new tokens in both themes, so that regressions are caught mechanically.
38. As the owner, I want screenshots at 390 and 1440 in en/vi and light/dark reviewed against the new DESIGN.md, so that the redesign is judged on the rendered site.
39. As a contributor, I want the plate's region layout computed by one pure, tested module, so that tile sizing and ordering are predictable as the curriculum grows.
40. As a contributor, I want the site to stay content-driven (no curriculum field names in site code), so that promoting a route to ready changes the plate and the specimen without code changes.

## Implementation Decisions

- **One visual system, replaced in place.** Tokens are rewritten, not versioned: paper ground and sheet, ink and ink-muted, hairline line colours, magenta `route` accent; learner-state hues unchanged; the `water`/teal link role is removed (links use ink plus underline, magenta on hover/focus). Glass, blur, tray/core radii, bezel width, and pill radius tokens are deleted along with every use. Radii become 2–4 px; buttons are rectangular. Shadows remain only on floating layers (drawer, sheets, tooltips). Dark theme is redefined as a night chart with the same roles.
- **Type.** Newsreader (variable, optical sizes, Vietnamese subset) for display and reading; IBM Plex Sans variable (Vietnamese subset) for UI; JetBrains Mono only for code and IDs. Hubot Sans is removed from dependencies and CSS. Only Home carries a large display title; other pages use a 32–40 px serif title with a small section label above and one details line below.
- **Details line.** Replaces meta chips on the route page and the drawer. Items separated by thin vertical rules on wide screens and commas when wrapped; never by middle dots. The content comes from the collection's list fields and block counts through the content model, not from named curriculum fields.
- **Global frame.** A plain top bar, full width, hairline underneath, not floating, not blurred; sticky on desktop only if it never covers focused content. Footer keeps the site name, licence, Star on GitHub, and the owner's links, restyled.
- **Plate (one component, three modes kept).** Regions come from `group_by` in vocabulary order, inside a printed plate frame with italic serif region labels and "N ready of M". Ready tiles are rectangles carrying the item title; mapped competencies are small circle marks after them. Learner state still shows through fill and glyph per the existing seven-state table. Prerequisite lines between tiles draw on hover and focus only (desktop ≥ 1024). A new pure layout module takes regions and their items and returns the region placement (columns spanned, row) so that rows fill without a stretched, near-empty last row; the plate component renders from its output.
- **Home.** No progress: title, one-line promise, primary action, the plate, then the specimen. With evidence: the next-step list (up to 3) and due reviews lead beside or above the plate, the primary action stays. The numbered four-step row and the "Ready routes by domain" list are removed.
- **Specimen.** A server-rendered inset built from one ready route's blocks: the first diagnostic task, one source row (source, type, exact locator, why), and the exit evidence criteria, each with a short margin note, plus a link to the route. The specimen route is chosen from the content model (the configured or first ready route with a diagnostic and sources), never typed copy; it fills the width at 1440 (no empty right third).
- **Route page (shared item sheet).** Section label (domain), title, details line, lead text, prerequisite line, then three columns on desktop: numbered contents rail, reading column, margin column. Sources render as a bibliography: numbered entries, locator first and prominent, then source title with type and host, then why, then the opened mark. The margin column holds the region locator plate (this route highlighted, its prerequisites ringed, other-region prerequisites named in a line) above the field log, separated by a hairline, sticky. Mobile keeps the sticky step bar and the bottom field-log bar opening a sheet. Blocks keep their order and step numbering from the presentation config.
- **Other surfaces in this spec: system only.** Atlas (plate, filters, drawer), Progress, collection indexes, Library, and lab pages switch to the new tokens, type, frame, and shapes, with bezels removed from the drawer and lab bench; their structure is restructured in follow-up specs.
- **Motion.** The Home plate settle-in animation is removed. Remaining motion: control feedback and the drawer/sheet slide; instant under reduced motion.
- **Docs.** DESIGN.md is rewritten in place (direction, surfaces for Home and route, visual system, review tells extended with the premium kit). site/TODO.md gains the redesign items and marks them as they land. ADR 0001 stands.
- **Prototype code is not merged.** The real build rewrites the variants; the prototype branch stays as the primary source.

## Testing Decisions

- Good tests assert what a learner can see and do on the built site (names, links, states, counts read from the content model), never class names, pixel values, or internal structure. Counts come from `atlas.json`, never typed in.
- **End-to-end (Playwright, built site, real CSP, desktop 1440 and `@mobile` 390)**, extending `tests/interactions.spec.ts` and `tests/next-step.spec.ts`:
  - Home without progress shows the plate with every ready route named as a link and every mapped competency reachable; the specimen shows a diagnostic task, a source whose locator matches the route's source block, and links to its route.
  - Home with seeded evidence leads with the next-step list and keeps the start action.
  - The route page shows the section label, title, a details line with the model's source and task counts, the bibliography with each source's exact locator, the region locator plate naming the route, and Record evidence in the margin (bottom bar on mobile).
  - Hover/focus on a tile reveals its prerequisite lines; at rest none are drawn.
  - The nav does not overlap focused content; no horizontal scroll at 390; every existing test (drawer, filters, labs, progress import/export, decision forms) still passes.
- **Unit (`node --test`)** for the new plate layout module: every region placed once, in vocabulary order; rows never leave a trailing region stretched beyond an agreed maximum; stable output for the same input. Prior art: `recommend.test.ts`, `review.test.ts`, `atlas.test.ts`.
- **Vitest block renderer** (`blocks.vitest.ts`) keeps rendering every block type, including the bibliography form of sources.
- **Mechanical checks:** stylelint (tokens only), `check:contrast` with the new pairs in both themes, `check:icons`, `check:coupling`, `check:i18n` for any new UI strings (en and vi), `capture.mjs` with no axe, overflow, or header problems, and the `atlas-ui-review` skill over the screenshots against the rewritten DESIGN.md.

## Out of Scope

- Structural redesign of Atlas, Progress, collection indexes, Library, and lab pages (system-level restyle only here; each gets its own spec).
- Always-drawn prerequisite lines (rejected by the prototype).
- New screens: How it works, What changed, search across everything, paths, profiles, ranking.
- Phase 2 AI tutor, sign-in, and Worker work.
- Any curriculum, lab, or learning-model change; Vietnamese wording beyond new UI strings (which the owner reviews).
- Deployment (manual CD after CI is green, by the owner).

## Further Notes

- Tickets live next to this spec under `.scratch/visual-redesign/issues/`, one file per ticket with its blocking edges, worked blockers-first.
- The prototype showed three things to fix in the real build: plate region widths (last row stretched and nearly empty), the empty right third beside the specimen at 1440, and in-page anchors that pointed at a hidden copy.
- The mapped/coverage naming is fixed in CONTEXT.md: learners see "mapped"; the catalog says `coverage`.
