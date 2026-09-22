# RFC 0005 companion: UI/UX research

- Status: Research notes for [RFC 0005](0005-interactive-web-atlas.md)
- Checked: 2026-09-22
- Scope: skill map, route pages, diagnostics, in-browser labs, AI tutor, progress, bilingual type, foundations

Claims carry a source link. Anything that could not be confirmed from a primary source is listed under [Unverified](#unverified).

## Summary

1. **Map = list first, graph second.** Default view is a domain-grouped list (tree/table) of all 116 items; the React Flow graph is a toggle and draws only the 30 declared edges. The list is the accessible equivalent, not an afterthought.
2. **Coverage nodes are quiet.** Ready routes are full-contrast, clickable rows; 101 coverage items are muted text labelled "mapped, no route", never locked-padlock tiles.
3. **Route page = a source table.** Columns: source, exact locator, why, opened (not progress). Reading column max 68ch, no hosted lesson prose.
4. **Lab = editor left, tests right, grouped by lab task.** Exercism-style `pass/fail/error` per task, first failure expanded, help ladder below the failure.
5. **AI = scoped buttons attached to an artifact** (a failing test, a locator, a diagnostic answer), shown after an attempt, with a visible budget counter and a "report as wrong" control on every message. No floating chat bubble.
6. **Progress = evidence, not completion.** Per-competency state plus an evidence timeline; no streaks, XP, or percent-read. Review queue shows due counts like Anki.
7. **Type:** IBM Plex Sans (UI), Source Serif 4 (reading), IBM Plex Mono or JetBrains Mono (code). All have the `vietnamese` subset on Google Fonts; self-host them.
8. **Color:** neutral 12-step scale plus one accent; evidence states use shape + label + color, never color alone.
9. **Components:** React Aria Components for islands (combobox, tabs, tree, dialogs); plain Astro for everything static. Skip Starlight.
10. **Motion:** none by default beyond 100–150 ms state transitions; map pan/zoom respects `prefers-reduced-motion`; no scroll-triggered animation.

## 1. Skill map and graph navigation

Findings:

- roadmap.sh renders each roadmap as one clickable diagram; progress is marked per node with right-click = Done, Shift+click = In progress, Alt+click = Skipped ([roadmap.sh](https://roadmap.sh/backend?r=backend-beginner), via search snippet). This records consumption as completion, which the RFC already rejects.
- Duolingo replaced its skill tree with a linear path because learners asked whether they were learning the "correct" or "best" way, and tree users tended to max out one skill before moving on instead of interleaving ([Duolingo blog](https://blog.duolingo.com/new-duolingo-home-screen-design/)).
- Exercism structures a track's concept exercises "as a tree with an introductory exercise at the top", each exercise declaring `concepts` and `prerequisites` ([syllabus docs](https://github.com/exercism/docs/blob/main/building/tracks/syllabus/README.md), [concept exercises](https://github.com/exercism/docs/blob/main/building/tracks/concept-exercises.md)).
- Khan Academy's course mastery percentage counts only skills at Proficient or Mastered; Not started / Attempted / Familiar do not count ([Khan help: course and unit mastery](https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery)).
- W3C: complex images (charts, diagrams, maps) need a short description plus a long description with equivalent information; data tables are an accepted alternative ([WAI complex images](https://www.w3.org/WAI/tutorials/images/complex/)).
- React Flow ships Tab focus for nodes/edges, Enter/Space select, arrow-key movement, auto-pan to the focused node (`autoPanOnNodeFocus`), `ariaRole`, `domAttributes`, a localizable `ariaLabelConfig`, and aria-live announcements ([React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility)).
- React Flow performance: memoize custom node components, do not read the whole `nodes` array inside components, collapse hierarchies, and cut shadows/gradients/animations on large graphs ([React Flow performance](https://reactflow.dev/learn/advanced-use/performance)).
- WAI-ARIA tree view pattern: hierarchical list with expand/collapse, arrow keys, type-ahead recommended for trees with more than 7 root nodes — the atlas has 12 domains ([APG treeview](https://github.com/w3c/aria-practices/blob/main/content/patterns/treeview/treeview-pattern.html)).
- WCAG 2.2 2.5.7: anything done by dragging must also work with a single pointer without dragging ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/22/dragging-movements.html)). Pan-only maps fail this unless buttons or the list give equivalent access.

Repository fact: 101 of 116 items are `coverage`, 30 edges exist, all touching ready routes (`site/src/data/atlas.json`). A force- or ELK-laid graph of 116 nodes with 30 edges is mostly disconnected dots.

**Adopt:** list view as default (12 domain groups, rows with status, level, prerequisites), graph as a secondary "prerequisites" view scoped to ready routes and their declared neighbours; same filters drive both; zoom buttons alongside pan; `ariaLabelConfig` strings in both languages; memoized node components with flat styling.
**Avoid:** a single all-nodes canvas as the landing view; padlock "locked" nodes (coverage is unmapped, not locked); per-node "Done" toggles; decorative edges between domains that the data does not declare.

## 2. Route pages that link out

Findings:

- Line length: 45–90 characters including spaces ([Practical Typography](https://practicaltypography.com/line-length.html)); WCAG 1.4.8 (AAA) asks for a mechanism for width ≤ 80 characters, no justified text, and line spacing ≥ 1.5 ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/visual-presentation.html)).
- MDN reference pages follow a fixed section order ending in Specifications, Browser compatibility, See also ([MDN CSS property template](https://github.com/mdn/content/blob/main/files/en-us/mdn/writing_guidelines/page_structures/page_types/css_property_page_template/index.md)). A predictable section order is what makes 15 route pages scannable.
- Full Stack Open puts exercises at the end of each section and has learners submit via GitHub; a language selector sits in the top navigation ([Full Stack Open part 1a](https://fullstackopen.com/en/part1/introduction_to_react)).
- Hugging Face course keeps per-language content directories including `vi` (cited in RFC 0005: [huggingface/course](https://github.com/huggingface/course)).

**Adopt:** fixed section order generated from `competency.yaml`: Why → Prerequisites → Diagnostic → Learning route → Practice / Lab → Exit evidence → Transfer. Learning route as a table: `Source | Exact locator | Why read it | Opened ☐`. External links show the domain (e.g. `arxiv.org`) and an external-link glyph with visually hidden "opens external site". Reading column `max-width: 68ch`; tables may run wider.
**Avoid:** summarising the source on the page (AGENTS.md forbids AI-written substitutes); "estimated reading time" or "% read"; card grids for sources (they hide the locator, which is the useful part).

## 3. In-browser code environments

Findings:

- futurecoder: learner must run code to advance; predict-the-output multiple choice before running; small hints that gradually guide; solution revealed bit by bit; or a Parsons problem with the shuffled solution ([README](https://github.com/alexmojaki/futurecoder/blob/master/README.md)).
- Exercism test runner results: per-test `status`, human-readable `message` shown when a test fails, `output` capped at 500 chars, `test_code` shown for concept exercises because students otherwise cannot see the tests; top-level error messages must never show "call stacks without context" ([test runner interface](https://github.com/exercism/docs/blob/main/building/tooling/test-runners/interface.md)).
- Exercism analyzer comments: `essential` soft-blocks, `actionable` encouraged before completion, `informative` and `celebratory` need no action ([analyzer interface](https://github.com/exercism/docs/blob/main/building/tooling/analyzers/interface.md)).
- Sandpack: `SandpackTests` shows a test hierarchy with per-test outcome; `SandpackLayout` is two columns and collapses to one column under 700 px ([Sandpack components](https://sandpack.codesandbox.io/docs/advanced-usage/components)).
- Pyodide needs `SharedArrayBuffer` (and therefore COOP/COEP headers) to interrupt running code ([Pyodide keyboard interrupts](https://pyodide.org/en/stable/usage/keyboard-interrupts.html)).

**Adopt:** two panes (editor | results), single column under ~700 px; results grouped by lab task (`task_id`), failing task expanded with the assertion's `message` and the test code; a Stop button whenever code runs; runtime status line ("Loading Python 3.x…", size) during Pyodide boot; help ladder rendered as a numbered list where each rung is an explicit button and the rung used is written into the evidence.
**Avoid:** raw tracebacks as the only output; hiding tests the learner is graded on; auto-running on keystroke (runs are evidence events); a "Show solution" button at the same level as "Run tests".

## 4. AI tutor UI

Findings:

- CS50: "Explain Highlighted Code" explains selected lines and complements the correctness checker `check50`; the Duck follows "pedagogical guardrails" to guide rather than give solutions; answers on Ed can be endorsed, amended or deleted by staff; throttling via visible hearts — 10 hearts, one regained every three minutes — both to control GPT-4 cost and to encourage precise questions and reflective breaks; the paper also notes AI answers carry "complete and authoritative confidence even when wrong" ([Liu et al., SIGCSE 2024](https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf)).
- Duolingo "Explain My Answer" is a learner-tapped button in the answer feedback, available after both correct and incorrect answers ([Duolingo blog](https://blog.duolingo.com/explain-my-answer-now-free/)).
- Codecademy: highlight code → "Explain code" button; assistant knows the current checkpoint; hints first, answers only if the learner persists ([Codecademy blog](https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant)).
- GitHub Copilot scopes actions to the selection with `/explain`, `/fix`, `/tests` ([Copilot cheat sheet](https://docs.github.com/en/copilot/reference/cheat-sheet)).
- Khan Academy tracks "giving the answer away before a student submitted a response" as a guardrail metric and verifies math with a separate system ([Khan blog](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/)).
- NN/g: state what the bot can do instead of "ask me anything"; offer suggested prompts as buttons; avoid autoscroll so long answers read from the top ([NN/g chatbot guidelines](https://www.nngroup.com/articles/ai-chatbots-design-guidelines/)); novel icons for unfamiliar features get ignored ([NN/g prompt controls](https://www.nngroup.com/articles/prompt-controls-genai/)).

**Adopt:** text-labelled action buttons attached to the object they concern ("Explain this failure" under a failing task, "Why this locator?" in a route row, "Question my answer" under a submitted diagnostic answer); actions disabled with a reason until an attempt exists; a docked side panel (not a modal) showing the thread, the source object quoted at top, budget as "7 of 10 questions · +1 every 3 min" in text, and per-message "Report as wrong"; a fixed one-line note "AI feedback does not change your progress."; no autoscroll.
**Avoid:** sparkle icons or a floating chat bubble; a mascot; open "Ask anything" as the entry point; hearts or other game metaphors for the budget; streaming text that pushes the reader's position.

## 5. Progress and evidence

Findings:

- Khan mastery levels: Attempted, Familiar (50 pts), Proficient (80), Mastered (100); Mastered only via unit test or course challenge from Proficient ([Khan help: mastery levels](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work)).
- Khan chose "skills to proficient" over time on platform as its outcome measure, citing correlation with external MAP scores ([Khan blog](https://blog.khanacademy.org/why-khan-academy-will-be-using-skills-to-proficient-to-measure-learning-outcomes/)).
- Anki shows New / Learning / To Review counts before a session; each answer button shows the next review interval ([Anki manual: studying](https://docs.ankiweb.net/studying.html)).
- `ts-fsrs` is a TypeScript FSRS scheduler (FSRS v6) ([repo](https://github.com/open-spaced-repetition/ts-fsrs)).
- The atlas already defines states unassessed → applied, with "passing an exit test does not yet mean ... retained or transferable" (`LEARNING_MODEL.md`).

**Adopt:** state badge with a distinct glyph per state (e.g. `○` unassessed, `◐` gap/learning, `●` demonstrated, `●→` transferred, `●↻` retained, `■` applied) plus text; evidence timeline per competency listing type, date, `review_method`, `independence`; review queue header "Due today: 3 · Upcoming 7 days: 5", and on answer, show the next due date like Anki; path-level summary counts only demonstrated-or-better, Khan-style.
**Avoid:** streaks, XP, confetti, "courses completed", progress rings driven by opened links; any single percentage that mixes states.

## 6. Bilingual EN/VI

Findings:

- Vietnamese stacks marks (e.g. circumflex + acute, hook above over circumflex/breve/horn); good designs modify combined marks so they "must not disrupt the kerning and leading" ([Vietnamese Typography](https://vietnamesetypography.com/diacritical-details/)).
- Google Fonts metadata (checked 2026-09-22, [fonts.google.com/metadata/fonts](https://fonts.google.com/metadata/fonts)) lists the `vietnamese` subset for: IBM Plex Sans / Mono / Serif, Source Serif 4, Source Sans 3, Be Vietnam Pro (designed by Lâm Bảo, Tony Le, ViệtAnh Nguyễn), Literata, Newsreader, JetBrains Mono, Geist, Geist Mono, Inter, Public Sans, Noto Sans/Serif. **Not** listed for: Fira Code, Instrument Sans, Instrument Serif, Atkinson Hyperlegible (and Next), Sora, Martian Mono, Red Hat Text/Mono, Schibsted Grotesk.
- W3C i18n: put language links on every page, write each language name in its own language, don't use flags for translations, let users override negotiation and remember the choice ([qa-site-conneg](https://github.com/w3c/i18n-drafts/blob/gh-pages/questions/qa-site-conneg.en.html)); language-specific URLs are "probably the way to go" ([qa-when-lang-neg](https://github.com/w3c/i18n-drafts/blob/gh-pages/questions/qa-when-lang-neg.en.html)).
- WCAG 3.1.2: the language of each passage must be programmatically determinable ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/language-of-parts.html)) — relevant when VI pages fall back to English route text.
- Astro i18n: `prefixDefaultLocale: true` gives `/en/…` and `/vi/…`; `getRelativeLocaleUrl()`; `fallback` with `fallbackType: "rewrite"` serves fallback content without redirect ([Astro docs](https://docs.astro.build/en/guides/internationalization/)).
- React Aria's built-in string translations cover 34 locales and do not include `vi-VN` ([react-spectrum intl directory](https://github.com/adobe/react-spectrum/tree/main/packages/@adobe/react-spectrum/intl/actionbar)); its site claims 30+ languages ([React Aria](https://react-aria.adobe.com/)).

**Adopt:** `/en/…` and `/vi/…` with `prefixDefaultLocale: true`; switcher text "English · Tiếng Việt" in the header, keeping the same page; remember choice in `localStorage`; English fallback blocks wrapped in `lang="en"` with the "chưa dịch / not yet translated" marker; body line-height 1.6 and headings ≥ 1.25 so stacked marks don't collide (test string: `Ở đây, người học chứng minh kỹ năng; Ưu tiên, ngữ cảnh, Đầu ra`); supply `vi` strings for any React Aria component that has built-in text.
**Avoid:** flags; auto-redirect on `Accept-Language` without an override; fonts without the Vietnamese subset (fallback glyphs render in a different face mid-word); `text-transform: uppercase` on Vietnamese labels (see Unverified).

## 7. Foundations

Findings:

- Radix Primitives: unstyled, WAI-ARIA patterns, per-component install ([Radix](https://www.radix-ui.com/primitives/docs/overview/introduction)).
- React Aria Components: 50+ components, APG-based, adaptive mouse/touch/keyboard, unstyled with data-attribute states ([React Aria](https://react-aria.adobe.com/)).
- Ark UI: headless, Zag.js state machines, React/Solid/Vue/Svelte ([README](https://github.com/chakra-ui/ark/blob/main/README.md)).
- Starlight is Astro's documentation framework with navigation, search, i18n, dark mode; deeper changes need component overrides ([Starlight](https://starlight.astro.build/), [overriding components](https://github.com/withastro/starlight/blob/main/docs/src/content/docs/guides/overriding-components.mdx)).
- Radix Colors defines a 12-step scale by role: 1–2 backgrounds, 3–5 component bg (normal/hover/pressed), 6–8 borders and focus rings, 9–10 solid, 11–12 text ([Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)).
- Vercel Geist: two typefaces (Sans, Mono), grid as "core part of the Vercel aesthetic", material presets for radii/fills/strokes/shadows ([Geist](https://vercel.com/geist/introduction)).

**Adopt:** React Aria Components for the few interactive widgets (Tree/GridList for the map list, Tabs, ComboBox search, Dialog, Disclosure) because it covers Tree and keyboard/touch; Radix is a fine alternative but has no tree. Plain Astro + CSS custom properties for everything else. Tokens structured by role, Radix-style.
**Avoid:** Starlight (its sidebar/content chrome would dominate and route pages are not docs pages); shadcn defaults used unmodified; a component library whose look ships with it.

## 8. "AI slop" tells to avoid

| Tell | Why it fails here |
|---|---|
| Purple/blue gradient, mesh hero, glassmorphism | No information; blur and gradients also cost render time on the map ([React Flow perf](https://reactflow.dev/learn/advanced-use/performance)) |
| Marketing hero ("Master AI engineering") | AGENTS.md forbids marketing language; home should show counts: 15 ready / 101 mapped |
| Uniform card grids with icon + title + blurb | Hides status and locators; equal visual weight misrepresents maturity |
| Decorative icons, emoji bullets, sparkles for AI | Novel icons get ignored ([NN/g](https://www.nngroup.com/articles/prompt-controls-genai/)); AGENTS.md bans decorative elements |
| Inter everywhere, one weight | Generic; pair a sans UI face with a serif reading face instead |
| Padlocks, streaks, XP, confetti | Reward consumption; contradict LEARNING_MODEL.md states |
| Progress rings on link clicks | Reading never changes state (RFC 0005 principle 3) |
| Floating chat bubble, "Ask me anything" | NN/g: state capabilities ([guidelines](https://www.nngroup.com/articles/ai-chatbots-design-guidelines/)); RFC chooses scoped actions |
| Large soft shadows, 16px+ radii everywhere | Low density; hides borders that carry structure (WCAG 1.4.11 needs 3:1 for component boundaries) |
| Scroll-triggered fade-ins, parallax | Vestibular trigger ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)); slows reference use |

## Recommended design direction

### Layouts

Competency names and values in the wireframes are illustrative, not catalog entries.

Map (default list view):

```text
┌ Atlas ─ Map  Paths  Review(3)  Progress        English · Tiếng Việt ┐
│ Filter: [Path: Applied AI Engineer ▾] [State ▾] [Ready only ☐]  [List|Graph] │
│ 15 ready routes · 101 mapped without a route                                 │
│ ▾ AI Engineering (26)                                     state   level      │
│   ● Evaluation harness            ready   L2   needs: Prompting basics   ◐   │
│     Retrieval quality             ready   L2   needs: Embeddings         ○   │
│     Fine-tuning basics            mapped, no route                           │
│ ▸ LLM Foundations (11)                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

Route page:

```text
Evaluation harness                         L2 · ready · ◐ learning
Why ········ (≤68ch)
Prerequisites: Prompting basics ●  Python testing ○ → bridge
Diagnostic  [Start: 3 tasks]
Learning route
 Source            Locator                  Why                      Opened
 AI Engineering ↗  Ch. 4 §"Evaluation…"     defines metric types     ☐
Practice → Lab: evaluation-harness [Open lab]
Exit evidence · Transfer
```

Lab:

```text
┌ editor (starter.py) ───────────────┬ Tests · Task 1 ✓ Task 2 ✗ Task 3 – ┐
│                                    │ ✗ Task 2: score_cases                │
│                                    │   expected 0.5, got 0.0              │
│                                    │   test code ▸                        │
│                                    │ Help: 1 Hint · 2 Point to assertion  │
│                                    │   · 3 Explain this failure (AI) ·    │
│ [Run tests ⌘↵] [Stop]              │   4 Reference solution               │
└────────────────────────────────────┴──────────────────────────────────────┘
```

Tutor panel (docked right, 360–420 px; bottom sheet on mobile):

```text
Explain this failure — Task 2          7 of 10 · +1 every 3 min
> quoted: AssertionError expected 0.5, got 0.0
Tutor: What does your loop do with cases where …?
                                            [Report as wrong]
[Reply…]                       AI feedback does not change your progress.
```

Progress:

```text
Evaluation harness   ●  demonstrated  (2026-09-20)
 2026-09-20  implementation  automated  independent   lab run #4 ✓
 2026-09-18  diagnostic      self       –             gap on task 2
 Next review: 2026-09-27
```

### Typography

- UI: IBM Plex Sans (variable `wght`, `wdth`), 15–16 px, tabular numerals for counts.
- Reading text on route pages: Source Serif 4 (variable `opsz`), 17–18 px, line-height 1.6, `max-width: 68ch`.
- Code: IBM Plex Mono (same family, simplest) or JetBrains Mono (variable).
- Fallback option if Plex is rejected: Be Vietnam Pro for UI (static weights only).
- Self-host via `@fontsource` or subset files; load `latin` + `vietnamese` subsets only.

### Color tokens

Role-based 12-step scales (Radix structure), defined for light and dark:

- `--gray-1…12`: slightly warm neutral; text on 12, secondary on 11, borders 6–8.
- `--accent-1…12`: one hue (e.g. deep teal or ink blue) for links, focus ring (step 8), primary action (step 9).
- State tokens: `--state-gap` (amber), `--state-demonstrated` (green), `--state-transferred`/`retained`/`applied` as shades of one hue family distinguished by glyph; `--fail` (red), `--pass` (green) in the lab.
- Coverage items use `--gray-11` text, no fill; ready items `--gray-12` with an accent marker.

### Density and shape

Border-first: 1 px borders at `--gray-6`, radius 4–6 px, no drop shadows except popovers. Row height ~36 px in lists; 8 px spacing grid.

### Motion

State transitions 100–150 ms ease-out on color/opacity only; node focus auto-pan and zoom instant when `prefers-reduced-motion: reduce`; no looping animation, no scroll-driven effects.

### Accessibility baseline (WCAG 2.2 AA items that bite here)

- 1.4.1 Use of color: state = glyph + text + color ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/use-of-color.html)).
- 1.4.11 Non-text contrast 3:1 for node borders, edges that carry meaning, focus rings ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/21/non-text-contrast.html)).
- 2.5.7 Dragging: zoom/pan buttons and the list view ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/22/dragging-movements.html)).
- 2.5.8 Target size ≥ 24×24 CSS px, incl. graph nodes and "Opened" checkboxes ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/22/target-size-minimum.html)).
- 2.4.11 Focus not obscured: docked tutor panel and sticky headers must not cover the focused element ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/22/focus-not-obscured-minimum.html)).
- 4.1.3 Status messages: test results, "Python loading", budget changes announced via `role="status"` ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/21/status-messages.html)).
- 3.1.2 Language of parts: `lang="en"` on untranslated blocks in `/vi/` pages ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/language-of-parts.html)).
- Graph: short description + list view as the long description ([WAI](https://www.w3.org/WAI/tutorials/images/complex/)).

## Unverified

Resolved on re-check (2026-09-22): Duolingo's report control is confirmed in the [Duolingo Max post](https://blog.duolingo.com/duolingo-max/) ("holding down the inaccurate message"), and RFC 0005 now cites it. Khanmigo "hidden reasoning" is absent from both Khan Academy posts and was removed from RFC 0005.

- roadmap.sh progress shortcuts come from a search-result snippet of roadmap.sh pages, not a fetched page or source file.
- Boot.dev, Brilliant, Codecademy career paths, Execute Program, Josh W. Comeau courses, JupyterLite, Stripe docs, Linear docs, Tailwind docs, Observable, Are.na, Anthropic docs, Rauno/Paco sites: not reviewed in this pass; no claims made about them.
- Specific Vietnamese line-height value (1.6) and the uppercase caution: reasoning from stacked-mark geometry, not from a primary source; verify by rendering the test string in each chosen font.
- W3C WAI pages (w3.org) returned 403 to automated fetching; WAI complex-images claims come from search results of that page, while WCAG text was read from the `w3c/wcag` GitHub source.
- Khan Academy help pages were read via search-result excerpts (direct fetch returned 403).
