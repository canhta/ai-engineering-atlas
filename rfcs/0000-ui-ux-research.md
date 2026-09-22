# Web atlas RFC companion: UI/UX research

- Status: Research notes for [web atlas RFC](0000-interactive-web-atlas.md)
- Checked: 2026-09-22 (text sources); visual teardown 2026-09-22
- Scope: skill map, route pages, diagnostics, in-browser labs, AI tutor, progress, bilingual type, foundations

Claims carry a source link or name the screenshot they come from. Anything not confirmed from a primary source or a screenshot is listed under [Unverified](#unverified).

## Summary

1. **Home = survey plate, bent to proven conventions.** A whole-map diagram is the recognised form for a role roadmap (roadmap.sh). Keep it as the desktop hero, but draw only declared prerequisite lines and add a Khan-style legend. On phones, a scaled diagram is unreadable (roadmap.sh), so show a per-domain grid of squares instead (Khan).
2. **Map = plate + list on one page.** The plate gives overview; the domain-grouped list stays the accessible equivalent. Clicking a node opens a right-hand drawer (roadmap.sh), which becomes a full-screen sheet on mobile. The drawer holds a route summary and a link to the route page. It has no Done/Skip toggles.
3. **Coverage items stay quiet.** They are outlined, unfilled, and labelled "mapped, no route". Never use padlocks.
4. **Route page = route sheet with a waypoint rail.** Follow the docs convention (Stripe, Hugging Face): breadcrumb, a large title with a one-line subtitle, a left rail of numbered waypoints (Diagnostic → Sources → Practice → Exit evidence), and a prerequisite bridge line near the top (Khan "Not feeling ready?", master.dev "Prerequisite:").
5. **Sources = a table with the exact locator.** No competitor shows locators; roadmap.sh shows only type badges and titles. The locator column is what makes us different, so keep the table.
6. **Progress = evidence, not completion.** Use one square per competency with shape and fill by state, plus a legend (Khan). Add the evidence timeline and review due counts. Avoid streaks, XP, "N of M steps complete", and percent rings.
7. **Labs:** editor | results, grouped by task, help ladder below the failure (Exercism, futurecoder).
8. **AI:** text-labelled actions attached to objects (roadmap.sh "Quick Explain / Quiz me" row inside the node panel is the closest precedent). No floating "Ask anything" bar (roadmap.sh, Hugging Face both have one; it competes with content on mobile).
9. **Type and colour:** IBM Plex Sans UI, Source Serif 4 reading, Plex Mono code (all ship `vietnamese`); a neutral 12-step scale plus one accent. State is shown by glyph + label + colour.
10. **Tone:** restrained, like Stripe docs and Khan. Leave out the marketing chrome that Boot.dev, master.dev and Brilliant use (star ratings, enrolment counts, sale banners, per-item illustrations).

## Competitor teardown (visual, 2026-09-22)

Method: Playwright (Chromium) screenshots at 1440×900 and 390×844, viewport and full page (clipped at 3200 px), in `/tmp/competitor-shots/`. Public pages only, no login. Sizes are estimated by eye from screenshots, not measured from CSS. Blocked: **Exercism** (`/tracks/python`, `/tracks/python/concepts`) returned a Cloudflare "verify you are human" page at both widths, so no visual claims are made about it. The freeCodeCamp certification page at 1440 px showed only a loading spinner after 5.5 s; the 390 px capture loaded. `frontendmasters.com/learn/` redirects to `master.dev/learn/`.

### roadmap.sh — [/ai-engineer](https://roadmap.sh/ai-engineer), [home](https://roadmap.sh/)

- **Navigation of a large set:** one long vertical diagram. A blue spine carries yellow topic nodes. Pale-yellow subtopic nodes are grouped in bordered boxes left and right, joined to the spine by dotted connectors. Short section labels sit on the spine ("Working With LLMs", "AI Models"). Nodes are text only: label, fill, border.
- **Page chrome:** a white card on a pale ground with a back link, a 48 px heavy title with a grey subtitle, and tabs (Roadmap / Projects / AI Tutor) plus "Personalize". Below that sit a yellow "Join 33,032+ others tracking…" strip and a collapsible "What is an…?" disclosure. Ad and partner cards sit inside the diagram area.
- **Detail panel:** clicking a node opens a right drawer about 40% wide and dims the map. The drawer has tabs (Resources / AI Tutor), a segmented status control (Learning / Done / Skip), a 40 px title, a description paragraph, and a "Learn with AI" card with three buttons (Quick Explain, Teach Me, Quiz me). It groups resources as "Premium" and "Free", each with a coloured type badge (Article, Video) and a linked title. None shows a chapter or section locator. On 390 px the drawer becomes a full-screen sheet with icon-only controls.
- **Mobile:** the whole diagram is scaled to fit 390 px, which makes node labels about 5–7 px. They cannot be read without pinch-zoom. A floating "AI Tutor · Ask anything" pill covers the diagram.
- **Home:** dark navy, gradient headline, full-width search ("What do you want to learn today?"), and a three-column grid of equal bordered tiles with a bookmark glyph. The first tile is a purple "Learn with AI" gradient.
- **Reads as:** recognisable and dense, but visually loud (saturated yellow, ads). The status toggle records consumption.

### Khan Academy — [Algebra 1](https://www.khanacademy.org/math/algebra), [Unit 1](https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra)

- **Mastery grid (strongest pattern seen):** under the course title ("182 skills") sits a legend of state swatches: Mastered (filled purple with a crown), Proficient (filled lavender), Familiar (half-filled orange), Attempted (orange outline), Not started (grey outline), plus a glyph for Quiz (bolt) and one for Unit test (star). Each unit is one row of about 20 px squares, one per skill, laid out in two columns. Units without exercises say "This unit's exercises do not count toward course mastery."
- **Layout:** a left rail of units ("UNIT 1" small-caps eyebrow above the title; the active one has a tinted background). The content column holds white bordered cards per lesson.
- **Unit page:** a card per lesson, split **Learn** (list with a type glyph per item) | **Practice** (a card per exercise: title, "Get 5 of 7 questions to level up!", a Practice button, and a state label "Not started" in a right cell). One practice card is flagged "Up next for you" with a blue top border and a filled Start button.
- **Prerequisite bridge:** top-right text line "Not feeling ready for this? Check out *Get ready for Algebra 1*."
- **Mobile:** the unit name moves above its squares, which wrap onto several lines. The grid stays readable at 390 px. The Learn/Practice columns become two narrow columns and wrap heavily.
- **Noise:** teacher banner, sign-up band and donation overlay on first load.

### Brilliant — [courses](https://brilliant.org/courses/), [Linear Relationships](https://brilliant.org/courses/linear-functions/)

- Catalogue: paths, each a tinted band of equal illustrated tiles joined by faint connectors. Course page: a summary card ("45 Lessons · 761 Exercises") beside a vertical path of 3D discs, the current one coloured, later ones faded; one centred column on mobile.
- Reads as: polished but illustration-led. Equal tile weight cannot show maturity or state.

### Boot.dev — [courses](https://www.boot.dev/courses), [RAG course](https://www.boot.dev/courses/learn-retrieval-augmented-generation), [backend path](https://www.boot.dev/paths/backend?tech=python-golang)

- Dark textured "fantasy" theme; catalogue is a three-column card grid with star ratings, enrolled counts, hours and NEW/UPDATED pills.
- Course page: after a marketing hero, a **numbered chapter list** (large numeral, title, one-line description, hairline dividers) is the clearest element. Path page: a numbered stack of course cards listing chapters, "Enter Course" bottom-right.
- Reads as: gamified marketing ("75 Addicting lessons", leaderboard in the nav).

### freeCodeCamp — [/learn](https://www.freecodecamp.org/learn), [JavaScript certification](https://www.freecodecamp.org/learn/javascript-v9/) (390 px only)

- /learn: one centred column of bordered rows under section headings.
- Certification page: an accordion tree ("Variables and Strings · 0 of 101 steps complete"). Child rows carry a hollow status circle and a small coloured **type tag** (Theory, Workshop, Lab, Review, Quiz) that makes activity kind scannable.

### master.dev (formerly Frontend Masters) — [/learn](https://master.dev/learn/), [AI Engineering path](https://master.dev/learn/ai-engineering/)

- Path page: a hero with a large "0%" progress ring. It is followed by "Core Coursework · Take these in order" and a **"Prerequisite:" line linking two other paths**. The body is a zig-zag vertical rail: an "Up First" / "Up Next" text box explains each step, and a course card (thumbnail, title, instructor) sits opposite, joined by orthogonal connector lines. "Elective Coursework · Optional, take in any order" follows as a grid.
- Mobile: the zig-zag collapses into one column with a single vertical connector.
- Noise: a sale countdown banner, a regional-pricing strip, and photo heroes.

### Stripe docs — [Build a payments page](https://docs.stripe.com/payments/checkout)

- Centred search and "Ask AI"; product tabs with an active underline.
- Collapsible left nav (uppercase group labels, chevrons, the active item in the accent colour). Breadcrumb; H1 about 32 px bold; a **one-line subtitle about 24 px regular**; then a row of small page actions (Ask about this page · Copy for LLM · View as Markdown) separated by hairlines.
- One accent (blue-violet) for links and active state only; no card chrome around text. Mobile: the sidebar collapses into a "≡ Overview" bar naming the current section.
- Reads as: the high-end reference; hierarchy comes from type size and weight alone.

### Hugging Face LLM course — [chapter 1.1](https://huggingface.co/learn/llm-course/chapter1/1)

- Three columns: a left chapter nav (numbered uppercase chapter headings, the current page as a black filled pill), a centred reading column, and a right "on this page" TOC in grey. A language selector (EN) sits in the left rail header.
- An "Ask a question" pill sits on the section heading, and a floating "Ask HuggingChat" input sits bottom-right.
- Mobile: the nav collapses to "LLM Course documentation / Introduction ▾"; the floating input overlaps content.

### Current atlas — [/en/](https://ai-eng.canhta.com/en/), [/en/map/](https://ai-eng.canhta.com/en/map/), [/en/routes/ai.tool-calling/](https://ai-eng.canhta.com/en/routes/ai.tool-calling/)

- Home: a left-aligned text column that takes about 55% of 1440 px, leaving the right side empty. The count line "19 ready routes · 97 mapped without a route · 5 labs" is correct but reads as body text. The ready list repeats an identical blue dot + "ready" on all 19 rows, so the column carries no information.
- Map: domains collapse with "0 ready of 8" beside the name (useful). Inside, a table has Status / Level / Prerequisites / Your state; coverage rows are muted. On 390 px the search, two selects and a checkbox fill the first screen before any competency appears.
- Route: the metadata line (ID · target level · capability type · ready) reads like debug output. "Your state" is a bordered box with Record evidence (good). Four large textareas make the diagnostic the tallest section. The sources table (Source+domain | Read/inspect | Why | Opened) is already the strongest element and has no competitor equivalent.
- Reads as generic: one size step between H1 and body, no overview graphic, every section equal weight.

### Adopt / Avoid / Bend by surface

| Surface | Adopt (source) | Avoid (why) | Bend the survey plate |
|---|---|---|---|
| Home | Whole-map diagram as the recognisable roadmap form (roadmap.sh); a state legend directly above the plate (Khan); search in the header, not as the hero (Stripe) | Gradient headline, a "Learn with AI" tile, equal tile grids (roadmap.sh home, Brilliant); enrolment counts, stars, sale banners (Boot.dev, master.dev) | Plate on ≥ 1024 px. Under that, show a per-domain wrapped grid of squares (Khan mobile) instead of a scaled plate (roadmap.sh mobile fails) |
| Map | Right drawer about 40% wide over a dimmed plate; full-screen sheet on mobile (roadmap.sh); section labels on the spine; "N ready of M" per domain (current atlas) | Learning/Done/Skip toggles (records consumption); resource type badges without locators; "Premium resources" | Keep the list below or behind a toggle as the long description. The drawer shows why, prerequisites with state, diagnostic size, source count, and "Open route". Only ready nodes open a drawer. |
| Route page | Breadcrumb + H1 + one-line subtitle + small action row (Stripe); left waypoint rail with the current item filled (HF, Stripe); "Not feeling ready? → bridge" line (Khan); "Prerequisite:" line + Up first/Up next rail (master.dev); numbered steps with one-line purpose (Boot.dev) | Hosted lesson prose (HF chapter style); a hero progress ring (master.dev "0%"); floating AI input (HF, roadmap.sh) | Route sheet = the waypoint rail (Diagnostic, Sources, Practice, Exit evidence, Transfer) on the left, content right. On mobile the rail collapses into a "Waypoint 2 of 5 ▾" bar (Stripe mobile) |
| Sources table | Kind tag per row, e.g. Chapter / Section / Paper / Doc (fCC type tags); domain under the title (current atlas) | Premium/Free split and badge-only resources (roadmap.sh) | Keep the locator column. It is our differentiator, and no competitor shows one |
| Diagnostic | Practice card with the goal stated ("Get 5 of 7…") and a state cell on the right (Khan) | Four open textareas shown at once (current atlas) | Show one task at a time, or collapse tasks into disclosures, with "Task 2 of 4" |
| Learner panel / evidence | State cell beside each actionable item; the next suggested item marked "Up next" (Khan) | Mixed percentages; "N of M steps complete" (fCC) | Panel = state glyph + label, target, next review, and Record evidence. Pin it in the rail on desktop |
| Progress | Legend + one square per competency, with fill = state and glyph = assessment kind (Khan); an explicit "does not count" note for mapped items (Khan) | Streaks, XP, leaderboard (Boot.dev nav); progress rings (master.dev) | Reuse the plate squares as the progress overview, so Home, Map and Progress share one visual vocabulary |
| Navigation | Product tabs + active underline (Stripe); breadcrumb on every deep page; language switch in the header or rail (HF) | A hamburger-only nav on desktop (roadmap.sh home) | Three tabs are enough: Atlas, Map, Progress |
| Mobile | Titled collapse bar for in-page nav (Stripe, HF); single-column rail with one connector (master.dev); wrapped squares (Khan) | Scaled diagrams; filters filling the first screen (current atlas); floating AI pills | Filters go behind a "Filters (2)" button; the plate becomes a grid |

## 1. Skill map and graph navigation

- roadmap.sh marks progress per node (screenshot: Learning / Done / Skip in the node drawer). This records consumption as completion, which the RFC rejects.
- Duolingo replaced its tree with a linear path. Learners asked whether they were learning the "best" way, and tree users maxed out one skill instead of interleaving skills ([Duolingo blog](https://blog.duolingo.com/new-duolingo-home-screen-design/)).
- Exercism structures concept exercises "as a tree with an introductory exercise at the top", each declaring `concepts` and `prerequisites` ([syllabus docs](https://github.com/exercism/docs/blob/main/building/tracks/syllabus/README.md)).
- Khan course mastery counts only Proficient or Mastered skills ([Khan help](https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery)).
- W3C: complex images need a short and a long description, and a data table is an accepted alternative ([WAI complex images](https://www.w3.org/WAI/tutorials/images/complex/)).
- React Flow ships Tab focus, Enter/Space select, arrow movement, `autoPanOnNodeFocus`, and a localizable `ariaLabelConfig` ([accessibility](https://reactflow.dev/learn/advanced-use/accessibility)). For performance, memoize nodes and cut shadows, gradients and animation ([performance](https://reactflow.dev/learn/advanced-use/performance)).
- APG treeview recommends type-ahead for more than 7 roots; the atlas has 12 domains ([APG](https://github.com/w3c/aria-practices/blob/main/content/patterns/treeview/treeview-pattern.html)). WCAG 2.5.7 requires a non-drag alternative ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/22/dragging-movements.html)).

Repository fact: most of the 116 items are `coverage`, and all declared edges touch ready routes (`site/src/data/atlas.json`). A force layout would therefore show mostly isolated dots. The plate must use a fixed domain layout, with only the declared edges drawn.

## 2. Route pages that link out

- Line length 45–90 characters ([Practical Typography](https://practicaltypography.com/line-length.html)); WCAG 1.4.8 (AAA): width ≤ 80 characters, line spacing ≥ 1.5 ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/visual-presentation.html)).
- MDN pages follow a fixed section order ([MDN template](https://github.com/mdn/content/blob/main/files/en-us/mdn/writing_guidelines/page_structures/page_types/css_property_page_template/index.md)). A predictable order makes many route pages scannable.

**Avoid:** summarising sources on the page (AGENTS.md); reading time and "% read"; card grids for sources (they hide the locator).

## 3. In-browser code environments

- futurecoder: run to advance, predict-the-output before running, graduated hints, piecewise solution reveal ([README](https://github.com/alexmojaki/futurecoder/blob/master/README.md)).
- Exercism test runner: per-test `status`, a human `message`, `output` capped at 500 chars, `test_code` shown for concept exercises, and no bare call stacks ([interface](https://github.com/exercism/docs/blob/main/building/tooling/test-runners/interface.md)). Analyzer comment levels: `essential`, `actionable`, `informative`, `celebratory` ([analyzer](https://github.com/exercism/docs/blob/main/building/tooling/analyzers/interface.md)).
- Sandpack's two-column layout collapses under 700 px ([components](https://sandpack.codesandbox.io/docs/advanced-usage/components)). Pyodide needs `SharedArrayBuffer` (COOP/COEP) to interrupt code ([docs](https://pyodide.org/en/stable/usage/keyboard-interrupts.html)).

**Avoid:** raw tracebacks as the only output; hidden graded tests; auto-run on keystroke; a "Show solution" button at the same level as "Run tests".

## 4. AI tutor UI

- CS50: "Explain Highlighted Code", guardrails to guide rather than solve, staff endorsement of answers, and a visible budget of 10 hearts with one regained every 3 minutes. The paper also notes AI answers carry "complete and authoritative confidence even when wrong" ([Liu et al., SIGCSE 2024](https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf)).
- Duolingo "Explain My Answer" appears in answer feedback ([blog](https://blog.duolingo.com/explain-my-answer-now-free/)). Codecademy offers "Explain code" on a selection, hints before answers ([blog](https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant)). Copilot scopes `/explain`, `/fix` and `/tests` to a selection ([cheat sheet](https://docs.github.com/en/copilot/reference/cheat-sheet)).
- Khan tracks "giving the answer away" as a guardrail metric ([blog](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/)).
- NN/g: state what the bot can do, offer suggested prompts as buttons, and don't autoscroll ([guidelines](https://www.nngroup.com/articles/ai-chatbots-design-guidelines/)); novel icons get ignored ([prompt controls](https://www.nngroup.com/articles/prompt-controls-genai/)).
- Screenshots: roadmap.sh places three labelled AI buttons inside the node drawer (a good fit with scoped actions) but also a floating "Ask anything" pill. Hugging Face attaches "Ask a question" to a section heading and also floats a chat input.

**Adopt:** labelled actions on the object ("Explain this failure", "Why this locator?", "Question my answer"), disabled with a reason until an attempt exists; a docked panel with the quoted object, a text budget ("7 of 10 questions · +1 every 3 min"), "Report as wrong" on every message, and the fixed line "AI feedback does not change your progress."
**Avoid:** sparkle icons, a floating bubble or pill, "Ask anything", game-style budgets, and autoscroll.

## 5. Progress and evidence

- Khan levels: Attempted, Familiar, Proficient, Mastered; Mastered is reached only through a unit test or course challenge ([Khan help](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work)). Khan measures "skills to proficient" ([blog](https://blog.khanacademy.org/why-khan-academy-will-be-using-skills-to-proficient-to-measure-learning-outcomes/)). The screenshot shows how this is encoded: outline → half fill → full fill → full fill with a mark.
- Anki shows New / Learning / To Review counts and the next interval on each answer button ([manual](https://docs.ankiweb.net/studying.html)); `ts-fsrs` implements FSRS v6 ([repo](https://github.com/open-spaced-repetition/ts-fsrs)).

**Adopt:** Khan-style fill progression mapped onto our states: unassessed = outline, gap = outline with a mark, learning = half fill, demonstrated = full fill, and transferred / retained / applied = full fill plus a distinct glyph. Always add a text label. Per competency, an evidence timeline (type, date, `review_method`, `independence`); a review header "Due today: 3 · Next 7 days: 5"; path summaries count demonstrated-or-better only.

## 6. Bilingual EN/VI

- Vietnamese stacks marks that "must not disrupt the kerning and leading" ([Vietnamese Typography](https://vietnamesetypography.com/diacritical-details/)).
- Google Fonts lists the `vietnamese` subset for IBM Plex Sans/Mono/Serif, Source Serif 4, Be Vietnam Pro, Literata, Newsreader, JetBrains Mono, Geist, Inter, and Noto. It is not listed for Fira Code, Instrument Sans/Serif, Atkinson Hyperlegible, Sora, or Martian Mono ([metadata](https://fonts.google.com/metadata/fonts)).
- W3C i18n: language links on every page, each language named in its own language, no flags, user override remembered ([qa-site-conneg](https://github.com/w3c/i18n-drafts/blob/gh-pages/questions/qa-site-conneg.en.html)). WCAG 3.1.2 language of parts ([source](https://github.com/w3c/wcag/blob/main/guidelines/sc/20/language-of-parts.html)). Astro `prefixDefaultLocale` and `fallbackType: "rewrite"` ([docs](https://docs.astro.build/en/guides/internationalization/)). React Aria ships no `vi-VN` strings ([intl dir](https://github.com/adobe/react-spectrum/tree/main/packages/@adobe/react-spectrum/intl/actionbar)).
- Screenshots: Hugging Face puts its language selector in the course rail; Stripe puts locale at the bottom of the left nav. Neither uses flags for the language itself; Stripe uses a flag for country.

**Adopt:** `/en/` and `/vi/` URLs; "English · Tiếng Việt" in the header; untranslated blocks get `lang="en"` and the "chưa dịch / not yet translated" marker; line-height 1.6 for reading text.

## 7. Foundations

- React Aria Components: APG-based, includes Tree ([site](https://react-aria.adobe.com/)); Radix Primitives has no tree ([Radix](https://www.radix-ui.com/primitives/docs/overview/introduction)); Starlight's docs chrome needs overrides for deeper changes ([overrides](https://github.com/withastro/starlight/blob/main/docs/src/content/docs/guides/overriding-components.mdx)).
- Radix Colors 12-step roles ([scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)); Vercel Geist treats the grid as core to its aesthetic ([Geist](https://vercel.com/geist/introduction)).

**Adopt:** React Aria for islands, plain Astro elsewhere, role-based tokens. **Avoid:** Starlight, unmodified shadcn.

## 8. "AI slop" tells to avoid

| Tell | Seen in | Why it fails here |
|---|---|---|
| Gradient headline or tile, glass, mesh | roadmap.sh home | No information; costs render time on the plate |
| Marketing hero, countdown, stars, enrolment counts | Boot.dev, master.dev | AGENTS.md bans marketing; show ready/mapped counts |
| Uniform icon/illustration card grids | Brilliant, master.dev, Boot.dev | Equal weight misrepresents maturity; hides status and locators |
| Sparkle icons, floating "Ask anything" | roadmap.sh, Hugging Face | Novel icons get ignored ([NN/g](https://www.nngroup.com/articles/prompt-controls-genai/)); covers content on mobile |
| Done/Skip toggles, "% complete" rings, "N of M steps" | roadmap.sh, master.dev, fCC | Reward consumption; contradict LEARNING_MODEL.md |
| Padlocks, streaks, XP, leaderboards | Boot.dev nav | Same |
| One text-size step, every section equal weight | current atlas | Reads as generic; Stripe uses H1 + subtitle + section size steps |
| Scroll-triggered motion | — | Vestibular trigger ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)) |

## Recommended design direction

Competency names in the wireframes are illustrative. `site/DESIGN.md` still says "list default, graph as toggle" for the Map. Update it to the plate + list rule below in a separate change.

Home (≥ 1024 px):

```text
Atlas  Map  Progress                          [Search ⌘K]   English · Tiếng Việt
AI Engineering Atlas
Diagnose first, learn the smallest gap, produce evidence.      (subtitle size)
19 ready · 97 mapped, no route · 5 labs      Legend: ○ unassessed ◐ learning ● demonstrated …
┌ plate ─────────────────────────────────────────────────────────────────────┐
│ LLM FOUNDATIONS   AI ENGINEERING           AGENTS            SECURITY    … │
│ ▫ ▫ ▪─────────────▪──▪──▪        ▪──────────▪──▪             ▪             │
│ ▫ ▫ ▫             ▫  ▪  ▫        ▫  ▫       ▫                ▫             │
│ (▪ ready, filled by learner state; ▫ mapped, outline only; lines = declared │
│  prerequisites only)                                                       │
└────────────────────────────────────────────────────────────────────────────┘
Start with a diagnostic → [next suggested route]
```

Under 1024 px, the plate becomes wrapped rows of squares: a domain name, then its squares.

Map node drawer (right, about 40%; full-screen sheet on mobile):

```text
Tool Calling                               ai.tool-calling · L3      [×]
◐ learning · target: applied
Why (2 lines) · Needs: AI Evaluation ● · API Design ○ → bridge
Diagnostic: 4 tasks · Sources: 5 exact locators · Lab: yes
[Open route]            (no Done / Skip controls)
```

Route sheet:

```text
Map / AI Engineering / Tool Calling
Tool Calling                                        ◐ learning  [Record evidence]
Design and validate tool contracts…           (one-line subtitle)
Not ready? API and Service Design is a gap → bridge (1 section, aws.amazon.com)
┌ rail ───────────┬ content (≤ 68ch prose; tables wider) ─────────────────────┐
│ 1 Diagnostic ●  │ Task 2 of 4  [answer]  [Submit]                           │
│ 2 Sources       │ Kind | Source (domain) | Exact locator | Why | Opened     │
│ 3 Practice      │                                                           │
│ 4 Exit evidence │                                                           │
│ 5 Transfer      │                                                           │
│ Your state      │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

Mobile: the rail becomes a sticky "2 Sources ▾ (of 5)" bar.

Progress: the same squares as the plate, grouped by domain, with the legend on top. Below that sit the review queue and per-competency evidence timelines. Mapped items carry a note that they do not count.

Lab and tutor panels follow sections 3–4 unchanged: editor | results by task with a help ladder; a docked tutor panel of 360–420 px (bottom sheet on mobile).

**Typography:** IBM Plex Sans UI 15–16 px with tabular numerals; Source Serif 4 at 17–18 px and line-height 1.6 for route prose; Plex Mono for IDs and code. Add a distinct subtitle step (about 1.35× body, regular weight) under every H1, as Stripe does; the current pages lack this middle step. Uppercase small eyebrows (as Khan and Stripe use) are for English only; Vietnamese labels keep sentence case.

**Colour:** warm neutral 12-step scale plus one accent, used for links, focus, ready outlines and the primary action. State fills come from state tokens. Coverage is outline only, never tinted.

**Shape and density:** 1 px borders, 4–6 px radius, shadows only on the drawer and popovers; 8 px grid; list rows about 36 px; plate squares ≥ 24 px (WCAG 2.5.8).

**Motion:** 100–150 ms colour/opacity transitions only; the drawer slides in 150 ms and appears instantly under `prefers-reduced-motion`.

**Accessibility (WCAG 2.2 AA):** 1.4.1 glyph + label + colour; 1.4.11 3:1 for meaningful borders, edges and focus; 2.5.7 plate reachable without dragging (the list and keyboard); 2.5.8 targets ≥ 24 px; 2.4.11 drawer, tutor panel and sticky bars never cover focus; 4.1.3 `role="status"` for results and loading; 3.1.2 `lang` on untranslated blocks; the plate has a short description and the list as its long description.

## Unverified

- Exercism track and concept pages were blocked by Cloudflare at both widths, so its visual design is not reviewed. Exercism claims above come from its docs repository only.
- freeCodeCamp's certification page at 1440 px did not finish loading, so only the 390 px layout is described.
- Pixel sizes (title heights, drawer width, mobile label size) are estimated from screenshots, not from CSS.
- Brilliant, Boot.dev and master.dev logged-in learner views (actual progress UI) were not seen; claims cover public pages only.
- Codecademy, Execute Program, JupyterLite, Linear and Tailwind docs: not reviewed.
- Vietnamese line-height 1.6 and the uppercase caution are reasoning from stacked-mark geometry; verify by rendering the test string `Ở đây, người học chứng minh kỹ năng; Ưu tiên, ngữ cảnh, Đầu ra`.
- W3C WAI pages and Khan help pages were read via search excerpts (direct fetch returned 403).
