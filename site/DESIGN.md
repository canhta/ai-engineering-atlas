# Web Atlas Design

The design and layout source of truth for everything under `site/`, for agents and humans. Evidence: [UI/UX research and competitor teardown](../rfcs/0000-ui-ux-research.md). Scope: [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Data: [content model RFC](../rfcs/0000-content-model.md).

Token values live in `site/src/styles/tokens.css`; this file names roles and intent. If they disagree, fix one in the same change.

## Direction: printed atlas

The atlas is a map, so the map is the design, set like a printed atlas with a tool's density ([ADR 0001](../docs/adr/0001-editorial-print-direction.md)). One element carries the identity: **the plate**, a region map with one tile per competency, grouped by domain, inside a printed plate frame (paper, ink, magenta as the one route mark). Everything around the plate stays quiet: hairline rules, small radii, no decoration.

Proven patterns, reused rather than invented:

| Pattern                                                                                  | From                             | Used for                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| One tile per skill, filled by state, legend above the grid                               | Khan Academy course grid         | Plate tiles, legend, Progress                   |
| Node opens a side drawer over the dimmed map                                             | roadmap.sh                       | Map drawer (without Learning/Done/Skip toggles) |
| Tabs with underline, breadcrumb, large title, larger one-line subtitle, page-actions row | Stripe docs                      | Global nav, index page headers                  |
| Left course rail with the current section marked                                         | Stripe docs, Hugging Face course | Route contents rail                             |
| "Not feeling ready? …" prerequisite line                                                 | Khan Academy, master.dev         | Route prerequisite line                         |
| Labelled AI actions inside the item panel                                                | roadmap.sh node panel            | Phase 2 tutor actions                           |

Footer: an ink rule above; site name, licence, and a "Star on GitHub" text link on the left, and the owner's links as icons on the right (`site.links` in the content model: GitHub, email, WhatsApp, Zalo, X, LinkedIn). Each icon carries a visually hidden name. The top bar keeps a repository icon from 768px up; on a phone the footer carries it.

## Principles

1. **Evidence, not completion.** The UI shows what a learner demonstrated. Opening, reading, or scrolling never changes a state.
2. **Truthful maturity.** Ready routes are solid; mapped items are quiet and say "mapped, no route".
3. **Route to sources.** Pages point at exact external locators and say why. The site hosts no lesson prose.
4. **Content-driven.** Pages render the content model's collections, fields, and blocks. No curriculum field name appears in `site/src`.
5. **Attempt first.** Help and AI appear after the learner acts, attached to what they act on.

## Information architecture

```text
/                            → /en/ (or the remembered language)
/{lang}/                     Home
/{lang}/map/                 Atlas: plate + list, filters, drawer (?item=<id> opens the drawer)
/{lang}/routes/<id>/         Route sheet (competencies whose page_when matches)
/{lang}/<collection>/         Index of a collection (labs, projects, paths), linked from the Atlas
/{lang}/sources/             Library: every source the routes cite, searchable
/{lang}/<collection>/<id>/   Other collection items that have blocks (projects, labs)
/{lang}/progress/            Logbook: evidence log, next steps, review queue, your data
```

Global nav: wordmark (home), **Atlas**, **Progress** (with the due-review count), language switch. Phase 2 adds sign-in. Index pages show a breadcrumb; item pages a section label above the title.

## Global frame

```text
desktop ≥ 768                                                         mobile < 768
 AI Engineering Atlas   Atlas   Progress ³        English  Tiếng Việt │ ⌂    AI Engineering Atlas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    Atlas  Progress   English  Tiếng Việt
 full width, ink hairline under it, sticky, never blurred; the current      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 tab stands on the hairline with a 3px magenta rule                          two rows, scrolls away with the page
 content: max 1280, 24px gutters, left aligned                               one column, 16px gutters
```

The bar never covers focused content: it is `--nav-height` tall, `scroll-padding-top` clears it, and sticky layers below it start at `--bar-offset` (0 on a phone, where the bar scrolls away).

## Surfaces

### Home

```text
 AI Engineering Atlas                                      Newsreader, 44–76px (the one large title)
 A gap-driven roadmap for software engineers               standfirst, Newsreader, 20–24px
 learning modern AI engineering.
 Diagnose first, read the exact source, prove it with evidence.        one muted line; with evidence the
 [ Find your starting point ]   See a route up close                   next steps (up to 3) stand beside it
 41 ready routes and 74 mapped competencies                    legend
╔═ plate (overview): regions, named ready tiles, mapped marks ═════════════════════╗
╚══════════════════════════════════════════════════════════════════════════════════╝
╔═ specimen: an atlas inset in the plate's frame, full width ══════════════════════╗
║ From a ready route │ AI Engineering                                               ║
║ Tool Calling                                              [ Open the full route ] ║
║ Diagnose first  │ Diagnostic │ Task 1 of 4 ║ Read the exact  │ Learning route │ 1 of 5║
║ margin note     │ the first task, serif    ║ source, note    │ locator, serif      ║
║                 │                          ║                 │ Title  type │ host ↗ ║
║                 │                          ║                 │ Why  italic purpose ║
║ Record evidence │ Exit evidence: every criterion, numbered, two columns          ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

- Specimen: built by `src/lib/specimen.ts` from the route `site.specimen` names in the content model (else the first route whose page has a diagnostic task, a source, and a step list): the first task, the first source row, and the last step list, so it cannot drift from the route page. Server-rendered, no island. The margin note sits beside its entry when the entry is at least 36rem wide, above it otherwise; untranslated passages carry `lang="en"` and the marker.
- Mobile: headline, subtitle, CTA, next steps if any, legend, the plate as stacked region blocks (named tiles wrapping, marks in a row, no lines), then the specimen in one column.

### The plate: one component, two modes

- Regions: one per `group_by` value in vocabulary order. Label in italic Newsreader like a map label (larger when the region has routes), then "N ready of M" in Plex Sans.
- Placement: `src/lib/plate-layout.ts`, a pure module (region shapes in, placements out; tested in `plate-layout.test.ts`). Each region wants a span from its content (a named route asks for half a column, a mark a twelfth, at least two columns for the label). Regions are cut into rows in order so that as few columns as possible are left over on every row, the last included, and a row's leftover columns go to its least-stretched region, never beyond twice what it wants. Desktop (≥ 1024) uses 12 columns, tablet 6; below 768 regions stack as full-width blocks. The plate passes the result as `--wide-*` and `--medium-*` properties; no region width is set anywhere else.
- Ready routes: rectangles carrying their title (Plex Sans 14px, 13px on a phone), wrapping inside the region. Mapped competencies: small circle marks (10px in a 24px target) after the routes, in content order, still links or buttons.
- Learner state on a route tile: the rule takes the state's hue and a glyph before the title shows the fill; the three states beyond demonstrated add their icon. Unassessed shows the ink rectangle alone (an empty square would read as a checkbox). Colour is never the only cue:

  | State                          | Tile or glyph                    | Hue token                                                                        |
  | ------------------------------ | -------------------------------- | -------------------------------------------------------------------------------- |
  | mapped (no page)               | circle mark, no fill             | `line-strong`                                                                    |
  | ready, unassessed              | ink rectangle with the title     | `ink`                                                                            |
  | gap                            | half-filled glyph                | `state-gap` (amber)                                                              |
  | learning                       | three-quarter glyph              | `state-learning` (blue)                                                          |
  | demonstrated                   | full glyph                       | `state-demonstrated` (green)                                                     |
  | transferred, retained, applied | full glyph with the state's icon | `state-transferred` (violet), `state-retained` (teal), `state-applied` (magenta) |

- Legend: glyph plus label; only the glyph carries the state colour; labels stay `ink-muted`, counts `ink`. At text size (`TileGlyph`) the mapped glyph is a circle and an unassessed ready route a small landscape rectangle, the tile's shape.
- Prerequisite lines: none at rest. Desktop only (≥ 1024): hovering or focusing a tile draws its declared prerequisite lines (from `relations`) in `route`, edge to edge, and marks the prerequisite tiles; a mark also shows its title as a tooltip (hidden from assistive tech; the name carries it). Below 1024 there are no lines.
- Modes: `overview` (Home): tiles are links to `/map/?item=<id>`, so they work without JavaScript. `explore` (Atlas): tiles are buttons that open the drawer; filters dim non-matching tiles; the selected tile has a magenta ring; `?group=` underlines its region label and scrolls to it. `locator`: one region in a route's margin column (see Route sheet). Progress summarises by region bars and has no plate.
- Accessibility: each tile is named "<title>, <status>, your state: <state>" (mapped: "<title>, <status>"); routes and marks are lists; arrow keys move within a region (routes, then marks), Home and End jump, Tab moves between regions (one tab stop each); the list view is the full equivalent.

### Atlas

```text
 Atlas                                                        [ Plate | List ]
 116 competencies in 12 domains. Select one to see why it matters and where to start.
 [⌕ Search… ]  Target level All ▾  Your state Any ▾  Project All ▾  □ Ready routes only   Showing 19 of 116  Clear
 legend
 ┌──────────── plate (explore) ──────────────┐ ┌─ drawer, 40%, over the dimmed plate ─┐
 │                                            │ │ AI engineering                     ✕ │
 │   the selected tile has a magenta ring     │ │ Tool Calling                         │
 │                                            │ │ ▭ ready │ L3 deep … │ 5 sources │ …  │
 │                                            │ │ Your state  ◧ gap     Target applied │
 │                                            │ │ Why, three lines, "More" expands     │
 │                                            │ │ Needs  ▭ AI evaluation               │
 │                                            │ │        ○ API design (bridge on route)│
 │                                            │ │ Lab: evaluation harness              │
 │                                            │ │ [ Open route ]  Start diagnostic     │
 └────────────────────────────────────────────┘ └──────────────────────────────────────┘
```

- List view: domain disclosures, one row per item with the collection's list fields and your state; the accessible equivalent of the plate.
- Drawer head: the domain as a section label, the title, then the route page's details line led by the item's maturity and its glyph (no tags, no ID).
- Mapped-item drawer: title, domain, "Mapped, no route yet. It shows where the roadmap is going.", and a link to how to contribute a route.
- Filters: a ruled key between hairlines above the legend, not a form. Search; one quiet menu button per facet naming its current choice (the collection's facets, except the page condition field, which is the "Ready routes only" toggle, `?ready=1`; your state; one per related collection, projects); the toggle; the live count (`role="status"`); Clear. A button opens a React Aria menu of options, the current one on a magenta rule and `aria-checked`; focus returns to the button on close. No native selects; all disabled until hydration.
- URL: `?item=` opens the drawer (an unknown id opens it with "Not found"), `?group=` focuses a region and opens it in the list, `?view=list` opens the list.
- Mobile: filters behind "Filters (n)" opening a sheet, the same menu buttons as full-width rows; the drawer is a full-screen sheet; the URL keeps `?item=`. Empty filter result: "No competency matches these filters." and Clear filters.

### Route sheet

The route page reads like a book chapter. Route, project, and lab pages share it (`ItemSheet.astro`); a page with a `runner` or `form` block is a workbench instead (see Labs).

```text
                      AI engineering                                     section label: the item's group, linking to its Atlas region
                      Tool Calling                                       page title, Newsreader 32–40px
                      L3 deep engineering competence │ engineering skill, system operation │ 5 sources │ 4 diagnostic tasks
                      Tool-enabled AI systems cross a boundary …         first text block as the lead, ink, ≤ 68ch
                      Not feeling ready? Needs ▭ AI evaluation and ○ API design (bridge below)
                      View contract ↗   Copy link
┌ rail 176 ──────────┬ reading column ≤ 736 ─────────────────────────┬ margin 288, sticky ─┐
│ On this page       │ blocks in content order, hairlines between   │ │ Where it sits      │
│ ━━━━━━━━━━━━━━━━━━ │                                              │ │ ▭▭▭■▭◘▭▭ ○○○○○○○   │
│   Prerequisites    │ 1 Diagnostic: one task at a time, "Task 2 of │ │ ━━ ink rule ━━━━━━ │
│ 1 Diagnostic       │   4", answer, Next; then the pass condition, │ │ Field log          │
│ 2 Learning route   │   self-assess, Record result                 │ │ Your state  ◧ gap  │
│   2 of 5 opened    │                                              │ │ Target    applied  │
│ 3 Practice         │ 2 Learning route                             │ │ Next review   —    │
│ 4 Exit evidence    │ 1  Sections "Reducing client complexity …"   │ │ Next: …            │
│ 5 Transfer         │    Making retries safe ↗  article, aws.…     │ │ [ Record evidence ]│
│ current: magenta   │    Why  Make timeout/retry behavior safe …   │ │ Evidence (2) ▾     │
│ numeral, underline │    ☐ Opened                                  │ │                    │
└────────────────────┴──────────────────────────────────────────────┴─┴────────────────────┘
```

- Header: section label (the `group_by` value's label, or the collection's label linking to its index), title, details line, lead, the untranslated marker when it applies, the prerequisite line, then View contract and Copy link as quiet actions. On desktop the header lines up with the reading column.
- Details line: the header fields (vocabulary fields other than the grouping, the page condition, and the progress target, which show elsewhere) with a short code before its label ("L3 deep engineering competence"), then the number of sources (rows across the item's sources blocks) and diagnostic tasks, from `detailsOf()` in `atlas.ts`. Items are separated by thin `line-strong` rules on wide screens (a wrapped row never starts with one) and read as a comma list on a phone; never middle dots or tags. The Atlas drawer uses the same component.
- Contents rail: "On this page" over an ink rule, then every block with a title, in order. Blocks marked `step: true` in the presentation config are numbered; others are listed without numbers. Each step shows its local status (answered, n of m opened, evidence recorded). A scrollspy marks the current section: its numeral turns magenta and its title gets a magenta underline. Anchors point at the sections on this page.
- Sources are a bibliography: numbered entries on hairlines; the exact locator first in Newsreader 20px (the differentiator); then the source title linking out with the external icon, its resource `type` and host in one muted line; then "Why" and the purpose in muted Newsreader; then the personal "Opened" mark. Opened marks never change a state. In the Prerequisites block each prerequisite shows its maturity glyph and label, and after hydration the learner's state, as the prerequisite line does; its bridge hangs under it on a `line-strong` rule, set the same way: question, locator, source, why. Exit evidence is a list of criteria without checkboxes; criteria are met by recording evidence.
- Margin column: sticky beside the reading column behind a `line` hairline, scrolling inside itself when the evidence form is open, so it never covers what the learner reads. Collections that do not track progress have no margin column. The field log starts with an ink rule; above it, the region locator (`RegionLocator.astro`, the plate in `locator` mode, server-rendered): every competency of the item's `group_by` region as compact marks (routes small rectangles, mapped circles), this route filled magenta with `aria-current`, its prerequisites from `relations` ringed; each mark named ("…, this route", "…, needed first") with the plate's tooltip; a key naming both (beyond three prerequisites it counts them), and one line linking prerequisites in other regions. Items without a region show none.
- Tablet (768–1023): one column; the rail becomes a "Step 2 of 5, Learning route ▾" bar above the content, and the field log is the bottom bar and sheet, as on a phone, so the route starts at once. Below 1024 the locator is omitted: the prerequisite line already links the same routes, and a map before the diagnostic would push the route down.
- Mobile: section label, title, details line as a comma list, lead; a sticky top bar "Step 2 of 5, Learning route ▾"; a sticky bottom bar "◧ gap, Record evidence" opening the field log as a sheet.

### Progress

A field logbook. The Atlas answers "what is there"; Progress answers "where do I stand" and "what did I do": the tile grid belongs to the Atlas.

```text
 1 of 22 demonstrated or beyond, legend                              │ Next for you  1 ◧ Product framing
 Where you stand   AI engineering  ████▓▓░░░░░░  1 of 12 demonstrated │ Review  Due today 1  Next 7 days 0
 Evidence log  3 records, newest first                                │   Tool calling  due 29/09  [Start review]
 Sep 22, 2026  ■ Self-Attention  supports ■ demonstrated | implementation | tests and self-review │ Your data
               Implemented causal single-head attention and masking tests.                        │ [Export] [Import]
```

- Region bars: one row per region with a ready route, ordered by share done, one segment per state in its hue, the rest `line`; each row links to `?group=`. Counts and the legend carry the meaning (a screen-reader line per row); before hydration the bars are empty and the count reads "… of N".
- Evidence log (main column, under an ink rule): every evidence record once, newest first (`evidenceLog()` in `progress.ts`), read-only. An entry is the date in the gutter (`formatDate`, printed once per day), the competency's glyph and title link, a details line (supports + state badge, kind, review method), and the note excerpt in Newsreader (cut at ~160 characters). On a phone the date sits above the entry. Empty: "Start with a diagnostic on any ready route" and the start CTA.
- Margin (behind a `line` hairline, each section opening on an ink rule with a UI-sized head, like the route's field log): next steps, the review queue, and Your data (export/import, confirmation and errors inline, the storage note). Below 1024 it follows the log.

**Next step.** Computed by `src/lib/recommend.ts` from prerequisites, states, and review dates; advice only, never a state change. Ranked: check due, continue (gap, learning), start (prerequisites demonstrated or bridged), transfer, apply. Home shows up to 3 beside the hero once there is evidence, and keeps the start CTA; Progress shows up to 5 above the queue, without due checks (the queue has them). A row is the rank in `route`, the tile glyph and title link (a due check links to the diagnostic), and the reason as one muted line: hairline rows, no cards. In the field log it is one line under "Next:", either "Recommended next (n of 5)." with the reason or "Learn first:" with the blocking prerequisites.

### Library

Every source the atlas routes through, in one searchable list. We do not rewrite these sources, so
this page is the index of that promise: what to open, and which part of it each route asks for.

- Built by `library()` in `src/lib/summaries.ts` from the blocks themselves (sources, practice,
  prerequisite bridges), so a source cannot appear here without a route citing it, or drift from it.
- A row is the source title linking out (with the external icon), its type chip, author and host,
  then the citing items indented on a hairline: each links to its page with the exact locator under
  it, `lang="en"` where the locator is untranslated.
- Filters: a search field over title, author, host and citing titles, and one chip per type with its
  count. Both run in the browser; the list is server-rendered, so it reads and links without
  JavaScript. Ordered by how many routes cite a source, so the load-bearing ones come first.

### Labs

Every lab has a page that renders its README (a Markdown `text` block). A lab with a browser contract also has a `runner` block, and the page becomes a workbench: brief beside bench, no rail.

```text
 Labs                                                                        section label
 Evaluation Harness Lab                                                      page title
 Practice for ◧ AI Evaluation and Experimentation            tracked items pointing at the lab
 View contract ↗   Copy link
┌ brief, 5 fr, reading column ─────────┬ bench, 7 fr, sticky under the nav, scrolls inside ─┐
│ Lab brief                            │ Run the tests                                       │
│ README: tasks, transfer, evidence;   │ ━━ ink rule ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ headings one level down; relative    │ │ starter.py your code │ tests.py │ cases.jsonl    │ │
│ links go to atlas pages or the repo  │ │ editor (CodeMirror, 18–32rem)                    │ │
│                                      │ │ Tab indents; Esc then Tab leaves. Draft saved.   │ │
│                                      │ │ [ Run tests ▷ ]  [ □ Stop ]   ↺ Reset to starter │ │
│                                      │ │ ⊗ A test failed  in 43 ms                        │ │
│                                      │ │ tests.py, line 36  Show in editor                │ │
│                                      │ │ ▌assert starter.authorize(normal_user, search)   │ │
│                                      │ │ ▸ Output                                         │ │
│                                      │ │ (after pass) Record evidence                     │ │
│                                      │ │ Show the reference solution                      │ │
│                                      │ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

- Tabs: the editable file first (marked "your code"), then the run file, then fixtures, read only. The reference appears as a last tab only after the learner opens it.
- Editor: JetBrains Mono without ligatures (code must look as typed), syntax colours from the `code-*` tokens, `lang="en"`, the `sheet` as background. Before hydration the files show as plain `pre`.
- Results panel, one `role="status"` line with icon, label, and time; colour is never the only cue:

  | State                    | Line                                                  | Detail                                                                                                                              |
  | ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
  | idle                     | muted: what Run does and the one-time ~13 MB download | none                                                                                                                                |
  | loading runtime, running | muted, pulsing dot (static with reduced motion)       | Stop enabled while running                                                                                                          |
  | pass                     | check icon, `state-demonstrated`                      | output open; Record evidence                                                                                                        |
  | fail                     | cross icon, `state-gap`                               | file and line of the failing assert, its source, the assertion message; Show in editor selects the line                             |
  | error                    | warning icon, `state-gap`                             | exception type and message, the line in the learner's file when the traceback passes through it, traceback in lab files (collapsed) |
  | stopped                  | stop icon, muted                                      | Python raised KeyboardInterrupt; the next run reuses the runtime                                                                    |
  | timeout                  | timer icon, `state-gap`                               | after 20 s the worker is terminated; the next run starts a fresh one                                                                |

- Reset to starter and Show the reference solution each open an inline confirmation (focus moves to its first button). Opening the reference is remembered per lab and marks later evidence `reference-open`, which the form states.
- Evidence (after pass only): the competency (radio when several), the state it supports (learning or demonstrated, starting at learning), a note pre-filled with the run file, runtime version, and the SHA-256 of the code. Kind `implementation`, review `automated`.
- Below 1024: one column, brief then bench; the header gets "Go to the code". The editor keeps its height; toolbar buttons wrap.

**The form variant (decision labs).** `agentic-design` and `model-selection` have no code: `lab.yaml` declares `browser: {runtime: form}`, so the page renders a `form` block in the same bench position (brief | bench, no rail). Wording stays exactly as written in `decision-rubric.md` / `decision-template.md`; the form only adds structure: `text`, `longtext`, `choice` (a select, verbatim options), `table` (named columns, add/remove row), each with an optional `help` line (`aria-describedby`, not folded into the accessible name). The rubric stays visible while answering; a decision field the learner must write before their own summary (e.g. `model-selection`'s decision rule, before the selected candidate) is enforced only by field order, never by hiding.
Every field is required. "Record evidence" appears once every field is non-empty (a table needs one fully filled row), pre-filled as kind `decision`, `review_method: self`, summarised in the note. "Export answers" downloads the filled template as Markdown, matching `decision-template.md`'s structure. Drafts save per lab in guarded local storage, restore on return, and travel with `progress.yaml` export/import as a `lab_forms` map. Mobile: one column, header gets "Go to the form"; a table's columns stack into labelled rows.

### States every surface handles

Before hydration (controls disabled, no learner state drawn); empty; filtered to nothing; untranslated passage (`lang="en"` and "chưa dịch / not yet translated"); storage unavailable (works until the learner leaves the page and says so once, in the field log and on Progress); import errors listed inline; unknown `?item=` ("Not found" in the drawer); JavaScript off (Home tiles and specimen, Progress bars, and route pages are plain links; the Atlas needs JavaScript); Phase 2 signed out ("Sign in to use AI help").

## Visual system

The editorial print system (ADR 0001): paper and ink, one accent, hairlines instead of containers, type sized to the content.

### Colour roles

| Role                                                                                                             | Use                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ground`                                                                                                         | page background: warm paper (light), night chart (dark)                                                                                                               |
| `sheet`                                                                                                          | the plate's ground, the drawer, sheets, inputs, code                                                                                                                  |
| `ink`, `ink-muted`                                                                                               | text; muted for secondary text. Links are `ink` with a `line-strong` underline                                                                                        |
| `line`                                                                                                           | hairlines between rows and sections                                                                                                                                   |
| `line-strong`                                                                                                    | meaningful strokes at 3:1: mapped marks, input and secondary-button outlines, link underlines                                                                         |
| `wash`                                                                                                           | hover and pressed fill on quiet controls (ink at a few percent)                                                                                                       |
| `route`                                                                                                          | magenta, the one route mark: the primary action, selection (ring, current tab, current step), prerequisite lines, link hover. Not for counts, numerals, or decoration |
| `state-gap`, `state-learning`, `state-demonstrated`, `state-transferred`, `state-retained`, `state-applied`      | one hue per learner state (see The plate); always with shape and label; unchanged by the redesign                                                                     |
| `code-keyword`, `code-string`, `code-number`, `code-definition`, `code-comment`, `code-selection`, `code-gutter` | lab editor syntax and chrome only (see Labs)                                                                                                                          |
| `scrim`, `shadow-float`                                                                                          | the dimmed page and the shadow under floating layers only                                                                                                             |

Dark mode is a night chart: the same roles on a warm near-black sheet, light ink, a lighter magenta. `pnpm run check:contrast` verifies every text and meaningful-line pair in both themes; add a pair when you add a role.

### Type

| Role                                          | Family                            | Setting                                               |
| --------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| Home title                                    | Newsreader (optical sizes), 500   | `text-home`, 44–76px, leading 1, the only large title |
| Page title                                    | Newsreader, 500                   | `text-title`, 32–40px; the drawer title too           |
| Section heads (h2), standfirst, lead, reading | Newsreader                        | h2 26px; reading 18px, line-height 1.65, ≤ 68ch       |
| Plate region labels                           | Newsreader italic                 | 18px, like labels on a map                            |
| UI, h3 and below                              | IBM Plex Sans (variable), 400–600 | 15–16px, tabular numbers for counts                   |
| Code and IDs                                  | JetBrains Mono                    | code, file names, and IDs                             |

Every family ships the `vietnamese` subset. Render test: `Ở đây, người học chứng minh kỹ năng; Ưu tiên, ngữ cảnh, Đầu ra`. Labels are sentence case, never tracked capitals. No wide or condensed display cuts.

### Shape and depth

- Nothing is boxed or carded by default. Sections are separated by hairlines (`line`); a heavier ink rule marks the start of a working surface (the field log, the lab bench, the diagnostic, the top bar and footer).
- The plate sits in a printed frame: an outer 1.5px ink rule, 3px of sheet, an inner ink hairline.
- Radii are 2–4px: `radius-mark` (tiles, glyphs, chips), `radius-control` (buttons, inputs), `radius-float` (drawer edge, sheets, tooltips). Circles only for mapped marks and radios.
- Buttons are rectangles: one magenta primary per view (`button button-primary`), outlined ink secondaries (`button`), and quiet text buttons (`button-quiet`). A button carries a text label; an icon only where it names a tool action (run, stop, export, import), never inside its own circle.
- Shadows only on floating layers: the drawer, sheets, and the rail's menu. Nothing blurs what lies under it.

### Motion

- Easing `cubic-bezier(0.32, 0.72, 0, 1)`; `duration-control` (160ms) for control feedback, `duration-sheet` (320ms) for the drawer and sheets sliding in.
- There is no entrance animation: the Home plate appears at once, and sections do not fade in on scroll.
- Other motion answers an action: the drawer and sheets slide, disclosures open, colours change on hover.
- `prefers-reduced-motion`: every transition is instant.
- Animate only `transform`, `opacity`, and colour.

### Icons

- One library with thin strokes: Phosphor (`light` weight), imported only in `src/lib/icons.ts` under semantic names. Astro uses `<Icon name=…>`; islands import the registry. Every icon sits beside a text label and is `aria-hidden`.
- The plate and its prerequisite lines are data visualisation drawn from `relations` in `src/components/plate/`, the only folder allowed to emit SVG, and only from data.
- `pnpm run check:icons` enforces this.

## Accessibility baseline (WCAG 2.2 AA)

- 1.4.1: state is shape, label, and colour.
- 1.4.11: meaningful lines and focus rings reach 3:1.
- 2.5.7: nothing requires dragging.
- 2.5.8: targets are at least 24px, tiles included.
- 2.4.11: the drawer, sheets, and sticky bars never cover the focused element.
- 4.1.3: counts, results, and saves are announced with `role="status"`.
- 3.1.2: untranslated passages carry their own `lang`.
- Focus is trapped in the drawer and sheets and returns to the tile on close.

## Review tells

| Tell                                                                   | Replace with                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Glass: a blurred, translucent nav or panel                             | A plain bar on `ground` with an ink hairline                                             |
| Double bezels, trays, or a card around every section                   | Hairline rules between sections; an ink rule where a working surface starts              |
| Pill buttons, or a trailing icon in its own circle ("pill-in-pill")    | A rectangular button with a text label, 2–4px radius                                     |
| Large radii (8px and up) on panels, inputs, or the drawer              | `radius-mark`, `radius-control`, `radius-float`                                          |
| Wide or display sans faces, 72px titles on every page                  | Newsreader page titles at 32–40px; only Home is large                                    |
| Teal or coloured links, magenta used for decoration or numerals        | Ink links with an underline; magenta only for the route mark                             |
| Identical card grid with one radius and shadow everywhere              | Plate tiles and hairline rows                                                            |
| Meta joined with middle dots, monospace micro-labels, tracked capitals | A details line with thin rules or commas, sentence case, monospace only for code and IDs |
| Marketing headline, percent rings, streaks, XP, "N of M complete"      | Ready and mapped counts, evidence states, due reviews                                    |
| Learning/Done/Skip toggles on items                                    | Record evidence in the field log                                                         |
| Floating "Ask anything" input, sparkles                                | Labelled AI actions inside the drawer or a block (Phase 2)                               |
| `→` appended to links                                                  | A plain underlined link                                                                  |
| Entrance animations, scroll-triggered fade-ins, press scaling          | Nothing: the page is there at once                                                       |
| Colour-only status                                                     | Shape, label, and colour                                                                 |
