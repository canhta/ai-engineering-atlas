# Web Atlas Design

The design and layout source of truth for everything under `site/`, for agents and humans. Evidence: [UI/UX research and competitor teardown](../rfcs/0000-ui-ux-research.md). Scope: [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Data: [content model RFC](../rfcs/0000-content-model.md).

Token values live in `site/src/styles/tokens.css`; this file names roles and intent. If they disagree, fix one in the same change.

## Direction: survey plate

The atlas is a map, so the map is the design. One element carries the identity: **the plate**, a region map with one tile per competency, grouped by domain, drawn in the language of a survey chart (mineral ground, ink, magenta route marks). Everything around the plate stays quiet.

Proven patterns, reused rather than invented:

| Pattern                                                                                  | From                             | Used for                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| One tile per skill, filled by state, legend above the grid                               | Khan Academy course grid         | Plate tiles, legend, Progress                   |
| Node opens a side drawer over the dimmed map                                             | roadmap.sh                       | Map drawer (without Learning/Done/Skip toggles) |
| Tabs with underline, breadcrumb, large title, larger one-line subtitle, page-actions row | Stripe docs                      | Global nav, route header                        |
| Left course rail with the current section marked                                         | Stripe docs, Hugging Face course | Route waypoint rail                             |
| "Not feeling ready? …" prerequisite line                                                 | Khan Academy, master.dev         | Route prerequisite line                         |
| Labelled AI actions inside the item panel                                                | roadmap.sh node panel            | Phase 2 tutor actions                           |

Footer: site name and licence on the left, a "Star on GitHub" pill in the middle, and the owner's links as icon buttons on the right (`site.links` in the content model: GitHub, email, WhatsApp, Zalo, X, LinkedIn). Each icon carries a visually hidden name. The nav keeps a repository icon on desktop; below 640px it moves into the menu overlay, where the pill has no room.

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
/{lang}/<collection>/<id>/   Other collection items that have blocks (projects, labs)
/{lang}/progress/            Field log: your states, review queue, your data
```

Global nav: wordmark (home), **Atlas**, **Progress** (with the due-review count), language switch. Phase 2 adds sign-in. Deep pages show a breadcrumb.

## Global frame

```text
desktop ≥ 1024                                                  mobile < 768
   ╭─ Atlas wordmark   Atlas   Progress ³    English  Tiếng Việt ─╮     ╭ wordmark        Menu ╮
   ╰───────────────────────────────────────────────────────────────╯     ╰──────────────────────╯
 floating pill 16px from the top, centred, max 1120; the only          full width minus 16px; Menu
 glass blur on the site; active tab underlined                          opens a full-screen overlay
 content: 12-column grid, max 1280, 24px gutters, left aligned          one column, 16px gutters
```

## Surfaces

### Home

```text
 AI Engineering Atlas                                      display, wide width, 56–72px
 A gap-driven roadmap for software engineers               subtitle, 22–26px
 learning modern AI engineering.
 Diagnose first, read the exact source, prove it with evidence.        one muted line
 ( Find your starting point  (↗) )    How the atlas works              pill CTA → /map/?ready=1
 legend   ⬚ mapped   □ ready   ◧ gap   ◧ learning   ■ demonstrated or beyond
╭───────────────────────────────────── plate ──────────────────────────────────────╮
│ Software engineering    Systems             Data engineering    ML foundations   │
│ ⬚⬚⬚⬚⬚⬚⬚⬚                ⬚⬚⬚⬚⬚⬚⬚⬚⬚           ⬚⬚⬚⬚⬚⬚              ⬚⬚⬚⬚⬚⬚⬚⬚⬚        │
│ Deep learning           LLM foundations     AI engineering      Agents           │
│ ⬚⬚⬚⬚⬚                   ⬚⬚⬚□⬚⬚⬚⬚⬚⬚⬚         ◧□□■□□□□□□□□⬚⬚…     □□□□□⬚⬚⬚⬚⬚       │
│ Production AI           Security & gov.     Multimodal          Specializations  │
│ ⬚⬚⬚⬚⬚⬚⬚⬚⬚⬚⬚             □⬚⬚⬚⬚⬚⬚⬚⬚⬚          ⬚⬚⬚                 ⬚⬚⬚⬚⬚⬚⬚⬚         │
╰──────────────────────────────────────────────────────────────────────────────────╯
 How the atlas works    1 Diagnose   2 Read the exact source   3 Practice   4 Record evidence
 (a real sequence, so numbered; one sentence each)
 Ready routes by domain: compact rows (title, level, number of sources, your state)
```

Mobile: headline, subtitle, CTA, legend, the plate as stacked region rows with wrapping tiles (no lines), then the steps as a vertical list.

### The plate: one component, three modes

- Regions: one per `group_by` value in vocabulary order; 4 × 3 on desktop, 2 columns on tablet, 1 on mobile. Region label in the wide display width, sentence case, with "N ready of M".
- Tiles: one per item, in content order. Every state has its own fill or icon and its own hue; colour is never the only cue:

  | State                          | Tile                            | Hue token                                                                        |
  | ------------------------------ | ------------------------------- | -------------------------------------------------------------------------------- |
  | mapped (no page)               | dotted outline, no fill         | `line-strong`                                                                    |
  | ready, unassessed              | ink outline                     | `ink`                                                                            |
  | gap                            | half fill                       | `state-gap` (amber)                                                              |
  | learning                       | three-quarter fill              | `state-learning` (blue)                                                          |
  | demonstrated                   | full fill                       | `state-demonstrated` (green)                                                     |
  | transferred, retained, applied | full fill with the state's icon | `state-transferred` (violet), `state-retained` (teal), `state-applied` (magenta) |

- Legend: glyph plus label; only the glyph carries the state colour; labels stay `ink-muted`, counts `ink`.
- Desktop only (≥ 1024): hovering or focusing a tile draws its declared prerequisite lines (from `relations`) and shows a title tooltip (hidden from assistive tech; the tile's name carries the title). Below 1024 there are no lines.
- Modes: `overview` (Home) and `progress` (Progress): tiles are links to `/map/?item=<id>`, so they work without JavaScript; mapped tiles recede in progress mode but stay clickable. `explore` (Atlas): tiles are buttons that open the drawer; filters dim non-matching tiles.
- Accessibility: each tile is named "<title>, <status>, your state: <state>" (mapped: "<title>, <status>"); arrow keys move within a region, Tab moves between regions; the list view is the full equivalent.

### Atlas

```text
 Atlas                                                        [ Plate | List ]
 116 competencies in 12 domains. Select one to see why it matters and where to start.
 [ Search… ]  Level ▾  Your state ▾  Project ▾  [ ] Ready routes only   Showing 19 of 116   Clear
 legend
 ╭──────────── plate (explore) ──────────────╮ ╭─ drawer, 40%, over the dimmed plate ─╮
 │                                            │ │ AI engineering / Tool calling      ✕ │
 │   the selected tile has a magenta ring     │ │ Tool Calling                         │
 │                                            │ │ (ready) (L3 deep engineering) (...)  │
 │                                            │ │ Your state  ◧ gap     Target applied │
 │                                            │ │ Why, three lines, "More" expands     │
 │                                            │ │ Needs  ■ AI evaluation               │
 │                                            │ │        ⬚ API design (bridge inside)  │
 │                                            │ │ 5 sources   Diagnostic, 4 tasks      │
 │                                            │ │ Lab: evaluation harness              │
 │                                            │ │ ( Open route (↗) )  Start diagnostic │
 ╰────────────────────────────────────────────╯ ╰──────────────────────────────────────╯
```

- List view: domain disclosures, one row per item with the collection's list fields and your state; the accessible equivalent of the plate.
- Mapped-item drawer: title, domain, "Mapped, no route yet. It shows where the roadmap is going.", and a link to how to contribute a route.
- Filters: the collection's facets, except the page condition field, which is the "Ready routes only" toggle (`?ready=1`); your state; one facet per related collection (projects).
- URL: `?item=` opens the drawer (an unknown id opens it with "Not found"), `?group=` focuses a region and opens it in the list, `?view=list` opens the list.
- Mobile: filters behind "Filters (n)" opening a sheet; the drawer is a full-screen sheet; the URL keeps `?item=`.
- Empty filter result: "No competency matches these filters." and Clear filters.

### Route sheet

```text
 Atlas / AI engineering / Tool calling                                      breadcrumb
 Tool Calling                                                               display
 Tool-enabled AI systems cross a boundary from model suggestions …          first text block as a lead, 20px (18px mobile), ink-muted, ≤ 60ch
 (L3 deep engineering) (engineering skill) (system operation)    View contract ↗   Copy link
 Not feeling ready? Needs ■ AI evaluation and ⬚ API design (bridge on the route page)
┌ rail 220 ──────────┬ content, reading column ≤ 68ch ─────────┬ field log 320, sticky ──┐
│ Outcomes           │ blocks in content order                 │ ╭─ double bezel ───────╮ │
│ 1 Diagnostic    ◧  │                                         │ │ Your state   ◧ gap   │ │
│ 2 Learning route   │ diagnostic: one task per card,          │ │ Target       applied │ │
│   2 of 5 opened    │ "Task 2 of 4", answer, Next; after the  │ │ Next review  —       │ │
│ 3 Practice         │ last task: pass condition, self-assess, │ │ Next: work through   │ │
│ 4 Exit evidence    │ Record result                           │ │ the learning route.  │ │
│ 5 Transfer         │                                         │ │ ( Record evidence (+))│ │
│ current section    │ sources: table (source with kind tag,   │ │ Evidence (2) ▾       │ │
│ marked (scrollspy) │ exact locator, why, opened)             │ ╰──────────────────────╯ │
└────────────────────┴─────────────────────────────────────────┴──────────────────────────┘
```

- Rail: every block with a title, in order. Blocks marked `step: true` in the presentation config are numbered; others are listed without numbers. Each step shows its local status (answered, n of m opened, evidence recorded).
- Sources: the exact-locator column is the differentiator and stays prominent. The kind tag comes from the resource `type`.
- Exit evidence is a list of criteria without checkboxes; criteria are met by recording evidence.
- Tablet: the rail becomes a "2 of 5, Learning route ▾" bar above the content; the field log sits at the top of the content.
- Mobile: breadcrumb, title, subtitle, chips; a sticky top bar "Step 2 of 5, Learning route ▾"; a sticky bottom bar "◧ gap, Record evidence" opening the field log as a sheet. Tables become stacked rows with inline labels.

### Progress

The Atlas answers "what is there"; Progress answers "where do I stand". They must not open with the same picture: the tile grid belongs to the Atlas, and Progress summarises.

```text
 Progress · states come only from recorded evidence · 1 of 22 demonstrated or beyond · legend
 Where you stand                                  │ Next for you   1 ◧ Product framing (up to 5)
   AI engineering  ████▓▓░░░░░░  1/12 done        │ Review   Due today 1   Next 7 days 0
   Agent           ░░░░░░░░       0/8 done        │ Tool calling  due 29/09  ( Start review (↗) )
 Evidence by competency: title, state, target, evidence count, last recorded, next review
 Your data   ( Export progress.yaml )   ( Import progress.yaml )   confirmation and errors inline
```

- One row per region that has a ready route, ordered by the share done: its ready routes in
  proportion, one segment per state in its own hue, the rest left as `line`. The row links to the
  Atlas filtered to that domain (`?group=`), so browsing stays one click away.
- Counts and the legend carry the meaning, never the bar alone: each row names its states for a
  screen reader, and before hydration the bars are empty with the count as "…/N".
- Empty: every ready route unassessed, and "Start with a diagnostic on any ready route" with the CTA.

**Next step.** Computed by `src/lib/recommend.ts` from prerequisites, states, and review dates; advice only, never a state change. Ranked: check due, continue (gap, learning), start (prerequisites demonstrated or bridged), transfer, apply. Home shows up to 3 beside the hero once there is evidence, and keeps the start CTA; Progress shows up to 5 above the queue, without due checks (the queue has them). A row is the rank in `route`, the tile glyph and title link (a due check links to the diagnostic), and the reason as one muted line: hairline rows, no cards. In the field log it is one line under "Next:", either "Recommended next (n of 5)." with the reason or "Learn first:" with the blocking prerequisites.

### Labs

Every lab has a page that renders its README (a Markdown `text` block). A lab with a browser contract also has a `runner` block, and the page becomes a workbench: brief beside bench, no rail.

```text
 Atlas / Labs / Evaluation Harness Lab                                       breadcrumb
 Evaluation Harness Lab                                                      display
 View contract ↗   Copy link
 Practice for ◧ AI Evaluation and Experimentation            tracked items pointing at the lab
┌ brief, 5 fr, reading column ─────────┬ bench, 7 fr, sticky under the nav, scrolls inside ─┐
│ Lab brief                            │ Run the tests                                       │
│ README: tasks, transfer, evidence;   │ ╭─ double bezel ──────────────────────────────────╮ │
│ headings one level down; relative    │ │ starter.py your code │ tests.py │ cases.jsonl    │ │
│ links go to atlas pages or the repo  │ │ editor (CodeMirror, 18–32rem)                    │ │
│                                      │ │ Tab indents; Esc then Tab leaves. Draft saved.   │ │
│                                      │ │ ( Run tests (▷) )  ( □ Stop )    ↺ Reset to starter│ │
│                                      │ │ ⊗ A test failed  in 43 ms                        │ │
│                                      │ │ tests.py, line 36  Show in editor                │ │
│                                      │ │ ▌assert starter.authorize(normal_user, search)   │ │
│                                      │ │ ▸ Output                                          │ │
│                                      │ │ (after pass) Record evidence                     │ │
│                                      │ │ Show the reference solution                      │ │
│                                      │ ╰──────────────────────────────────────────────────╯ │
└──────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

- Tabs: the editable file first (marked "your code"), then the run file, then fixtures, read only. The reference appears as a last tab only after the learner opens it.
- Editor: JetBrains Mono without ligatures (code must look as typed), syntax colours from the `code-*` tokens, `lang="en"`, the bezel core as background. Before hydration the files show as plain `pre`.
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

Before hydration (controls disabled, no learner state drawn); empty; filtered to nothing; untranslated passage (`lang="en"` and "chưa dịch / not yet translated"); storage unavailable (works until the learner leaves the page and says so once, in the field log and on Progress); import errors listed inline; unknown `?item=` ("Not found" in the drawer); JavaScript off (Home and Progress tiles, ready rows, and route pages are plain links; the Atlas needs JavaScript); Phase 2 signed out ("Sign in to use AI help").

## Visual system

### Colour roles

| Role                                                                                                             | Use                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ground`                                                                                                         | page background: pale mineral grey-green (light), night chart (dark)                                       |
| `sheet`                                                                                                          | raised surfaces: plate core, drawer, field log core                                                        |
| `ink`, `ink-muted`                                                                                               | text; muted for secondary text                                                                             |
| `line`                                                                                                           | hairlines and contour strokes: translucent ink, not flat grey                                              |
| `route`                                                                                                          | magenta: selection ring, highlighted prerequisite lines, primary action (ready tiles use an `ink` outline) |
| `water`                                                                                                          | teal: links                                                                                                |
| `state-gap`, `state-learning`, `state-demonstrated`, `state-transferred`, `state-retained`, `state-applied`      | one hue per learner state (see The plate); always with shape and label                                     |
| `code-keyword`, `code-string`, `code-number`, `code-definition`, `code-comment`, `code-selection`, `code-gutter` | lab editor syntax and chrome only (see Labs)                                                               |

`pnpm run check:contrast` verifies every text and meaningful-line pair in both themes; add a pair when you add a role.

### Type

| Role         | Family                               | Setting                                          |
| ------------ | ------------------------------------ | ------------------------------------------------ |
| Display      | Hubot Sans, wide (wdth 118–125), 700 | 40–72px, leading 1.05                            |
| UI           | Hubot Sans, normal width, 400–600    | 15–16px, tabular numbers for counts              |
| Reading      | Newsreader (optical sizes)           | 18px, line-height 1.65, ≤ 68ch                   |
| Code and IDs | JetBrains Mono                       | code, and IDs in the drawer and route chips only |

Every family ships the `vietnamese` subset. Render test: `Ở đây, người học chứng minh kỹ năng; Ưu tiên, ngữ cảnh, Đầu ra`. Labels are sentence case, never tracked capitals.

### Shape and depth

- Double bezel (outer tray and inner core with concentric radii) only for the plate, the drawer, the field log, and the lab bench. Everything else sits flat on the ground.
- Radii: tray 28, core 22; cards and inputs 12; chips and buttons are pills.
- Hairlines use `line`. Shadows are soft and ambient and only on floating layers: nav, drawer, sheets, tooltips.
- Primary action: a pill whose trailing icon sits in its own circle; pressing scales it to 0.98 and nudges the icon circle.

### Motion

- Easing `cubic-bezier(0.32, 0.72, 0, 1)`; 180ms for controls, 450ms for the drawer and sheets.
- One orchestrated moment: on every Home load, plate regions settle in order (CSS only, 700ms total at most, no session script). Sections do not fade in on scroll.
- Other motion answers an action: the drawer slides, disclosures open, the selection ring grows.
- `prefers-reduced-motion`: every transition is instant and the plate appears at once.
- Animate only `transform` and `opacity`. Blur only on the floating nav and overlays.

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

| Tell                                                                   | Replace with                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Identical card grid with one radius and shadow everywhere              | Plate tiles, rows, and the four double-bezel surfaces only |
| Meta joined with middle dots, monospace micro-labels, tracked capitals | Chips, sentence case, monospace only for code and IDs      |
| Marketing headline, percent rings, streaks, XP, "N of M complete"      | Ready and mapped counts, evidence states, due reviews      |
| Learning/Done/Skip toggles on items                                    | Record evidence in the field log                           |
| Floating "Ask anything" input, sparkles                                | Labelled AI actions inside the drawer or a block (Phase 2) |
| `→` appended to links                                                  | A trailing icon inside the primary pill only               |
| Scroll-triggered fade-ins on every section                             | The single plate reveal                                    |
| Colour-only status                                                     | Shape, label, and colour                                   |
