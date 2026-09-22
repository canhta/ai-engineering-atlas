# Web Atlas Design

Design rules for every page and component under `site/`. They apply to agents and humans alike.

Why each rule exists: [UI/UX research](../rfcs/0000-ui-ux-research.md). Product scope: [web atlas RFC](../rfcs/0000-interactive-web-atlas.md).

Token values live in code, in `site/src/styles/tokens.css`. This file names roles and intent; it never restates a value. When a rule here and the tokens disagree, the tokens are wrong or this file is stale: fix one of them in the same change.

## Principles

1. **Evidence, not completion.** The interface shows what a learner has demonstrated, with its evidence. Opening, reading, or clicking never changes a learner state.
2. **Truthful maturity.** Ready routes look finished; coverage items look quiet and read "mapped, no route". The home page states the counts.
3. **Route to sources.** Pages point at exact external locators and say why. The site hosts no lesson prose.
4. **Border-first, dense, calm.** Structure comes from 1px borders, spacing, and type. Colour carries meaning.
5. **Attempt first.** Help and AI appear after the learner acts, attached to the thing they act on.

## Layout by surface

### Map

- Default view: list grouped by the 12 domains, one `<details>` per domain (open when it has ready routes), a table row per competency: title, status, level, prerequisites, learner state. Under 700px each row stacks.
- Filters and learner state are a React Aria island layered on the same list; the static list stays usable without JavaScript.
- Graph view: a toggle. It draws ready routes and their declared prerequisites only, from `edges` in `atlas.json`.
- One filter bar drives both views: path/project, learner state, ready only.
- Coverage rows: muted text, no fill, not clickable, label "mapped, no route".
- The list is the accessible long description of the graph; keep them equivalent.

### Route page

Fixed section order, generated from `competency.yaml`:

Why → Prerequisites (with bridges) → Diagnostic → Learning route → Practice / Lab → Exit evidence → Transfer.

- Learning route is a table: `Source | Exact locator | Why read it | Opened`. "Opened" is a personal checklist and is not progress.
- External links show the domain and an external-link glyph with visually hidden text "opens external site".
- Reading column `max-width: 68ch`; tables may run wider.

### Diagnostic

- The learner writes an answer per task, submits, then sees the `pass_condition` and records a self-assessed result.
- AI actions ("Question my answer") unlock after submission.

### Lab

- Two panes: editor | results. One column under ~700px.
- Results grouped by lab task: `pass` / `fail` / `error`. First failing task expanded with the assertion message and its test code.
- **Run tests** is the primary action; **Stop** is visible whenever Python runs; a status line reports Pyodide loading.
- Help ladder as numbered, explicit steps below the failure: 1 Hint → 2 Point to assertion → 3 Explain this failure (AI) → 4 Reference solution. The highest step used is written into the evidence.
- Tests run on an explicit action only, because each run is an evidence event.

### AI tutor

- Entry points are text-labelled actions attached to an object: a failing task, a locator row, a submitted diagnostic answer.
- Actions show a disabled reason until an attempt exists, and "Sign in to use AI help" when signed out.
- The thread opens in a docked side panel (360–420px; bottom sheet on mobile). It quotes the source object at the top.
- The budget reads as text: "7 of 10 questions · +1 every 3 min".
- Every AI message has **Report as wrong**.
- A fixed line: "AI feedback does not change your progress."
- The reader's scroll position stays put while text streams.

### Progress

- Each state has an icon, a text label, and a colour, so no state depends on colour alone. Icons are the registry names of the same state (`unassessed`, `gap`, `learning`, `demonstrated`, `transferred`, `retained`, `applied`).
- Per competency: evidence timeline (date, kind, `review_method`, `independence`, link).
- Review queue header: "Due today: 3 · Next 7 days: 5". After answering, show the next due date.
- Path summaries count demonstrated-or-better only. Each state gets its own count; mixed percentages are not used.

## Typography

| Role | Family | Notes |
|---|---|---|
| UI | IBM Plex Sans | 15–16px, tabular numerals for counts |
| Reading (route text) | Source Serif 4 | 17–18px, line-height 1.6, 68ch |
| Code | IBM Plex Mono | editor, test output, IDs such as `ai.tool-calling` |

- Every family must ship the `vietnamese` subset. Self-host `latin` + `vietnamese` subsets only.
- Body line-height ≥ 1.5 (1.6 for reading), headings ≥ 1.25, so stacked Vietnamese marks never collide.
- Labels use sentence case. Vietnamese text keeps its original case.
- Render test string for any font or size change: `Ở đây, người học chứng minh kỹ năng; Ưu tiên, ngữ cảnh, Đầu ra`.

## Colour

Role-based 12-step scales (Radix structure) for light and dark themes:

| Steps | Role |
|---|---|
| 1–2 | app and subtle backgrounds |
| 3–5 | component background: normal, hover, pressed |
| 6–8 | decorative borders and separators |
| 9–10 | solid fills, primary action; step 9 also for the focus ring and borders that carry meaning (step 8 fails 3:1) |
| 11–12 | secondary and primary text |

- `gray`: warm neutral. `accent`: one hue for links, focus, the primary action, and the ready marker.
- State tokens: `state-gap` (amber), `state-demonstrated` (green); transferred, retained, applied share one hue family and are told apart by glyph. Lab: `pass`, `fail`.
- Components read semantic tokens (`--text`, `--border`, `--focus`, `--state-*`), never scale steps or literal colours.
- `pnpm run check:contrast` verifies every text and meaningful-border pair in both themes; add a pair there when you add a semantic token.

## Shape, density, elevation

- 1px borders at gray 6 (`--border`); borders that carry meaning use `--border-strong`. Radius 4–6px.
- Shadows only on floating layers: popovers, menus, the mobile bottom sheet.
- 8px spacing grid; list rows ~36px.

## Motion

- Colour and opacity transitions of 100–150ms, ease-out, on state change only.
- Under `prefers-reduced-motion: reduce`, map pan and zoom and focus auto-pan are instant.
- Content appears in place; scrolling triggers nothing.

## Icons

- One library: IBM Carbon (`@carbon/icons-react`), drawn for IBM Plex. It is imported only in `src/lib/icons.ts`, which maps semantic names (`external`, `ready`, `gap`, `run`, …) to icons. Astro pages use `<Icon name=…>`; React islands import the registry.
- One name, one icon everywhere. A new meaning gets a new registry name.
- Every icon sits beside a text label and is `aria-hidden`; an icon never carries meaning alone. Sizes: 16 inline, 20 in toolbars.
- `pnpm run check:icons` rejects inline `<svg>`, SVG files and data URIs, direct icon-package imports, and emoji or symbols used as icons.

## Components

- Static pages: plain Astro and CSS.
- Interactive islands: React Aria Components (Tree/GridList, Tabs, ComboBox, Dialog, Disclosure). Supply Vietnamese strings for any built-in text, since React Aria ships no `vi-VN` locale.
- Map graph: React Flow with memoized flat nodes, `ariaLabelConfig` in both languages, zoom buttons next to pan.
- Adding another UI library needs a note in this file saying which gap it fills.

## Bilingual

- URLs `/en/…` and `/vi/…`. The switcher reads "English · Tiếng Việt", keeps the current page, and remembers the choice. Language is never chosen by flag or forced redirect.
- UI strings: every key exists in both `en` and `vi`.
- Route text without a reviewed translation renders in English, wrapped in `lang="en"`, with the marker "chưa dịch / not yet translated".

## Accessibility baseline (WCAG 2.2 AA)

- 1.4.1: state = glyph + text + colour.
- 1.4.11: borders that carry meaning, graph edges, and focus rings reach 3:1.
- 2.5.7: everything done by dragging also works by buttons or the list.
- 2.5.8: targets ≥ 24×24px, including graph nodes and "Opened" checkboxes.
- 2.4.11: the tutor panel and sticky headers leave the focused element visible.
- 4.1.3: test results, Python loading, and budget changes are announced with `role="status"`.
- 3.1.2: untranslated passages carry their own `lang`.

## Review tells

When reviewing a page, each tell on the left is replaced by the pattern on the right.

| Tell | Replace with |
|---|---|
| Gradient, mesh, or glass background | Flat gray 1–2 background, border structure |
| Marketing hero headline | Counts (ready / mapped) and a "Start with a diagnostic" link |
| Grid of icon + title + blurb cards | Rows or a table that expose status and locators |
| Sparkle icon, floating chat bubble, mascot, emoji | Text-labelled action attached to its object; registry icon beside text |
| Streak, XP, confetti, % read, padlock | Evidence state, timeline, due counts |
| Large soft shadows, 12px+ radii | 1px border, 4–6px radius |
| Scroll-triggered animation | Content in place |
| Single sans family everywhere | Plex Sans UI + Source Serif 4 reading + Plex Mono code |
| Colour-only status | Glyph + label + colour |
