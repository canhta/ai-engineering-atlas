# Web atlas: progress and todo

Tracks delivery of the [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Mark an item done in the same change that finishes it, and add new work here before starting it.

Last updated: 2026-09-24

## Done

### Phase 0: data

- [x] `scripts/build_site_data.py` compiles catalog, routes, resources, labs, projects, and paths into `src/data/atlas.json`; `make check` fails when stale
- [x] `schemas/site-data.schema.json`

### Harness

- [x] UI/UX research: [rfcs/0000-ui-ux-research.md](../rfcs/0000-ui-ux-research.md)
- [x] Agent-doc research: [rfcs/0000-agent-harness-research.md](../rfcs/0000-agent-harness-research.md)
- [x] [DESIGN.md](DESIGN.md), [AGENTS.md](AGENTS.md), `CLAUDE.md` imports, root pointer
- [x] `scripts/validate_agent_docs.py`: imports, size budgets, commands exist, skill frontmatter
- [x] Hook blocking edits to generated files; CODEOWNERS; PR checkbox
- [x] `atlas-ui-review` skill with seeded-defect evaluations (3/3 pass)

### Phase 1: atlas and interactive core

- [x] Astro 7 static site, Node 26, pnpm, Cloudflare Workers static assets config
- [x] `/en/` and `/vi/` routes; 145 UI strings in both languages
- [x] Tokens, fonts with Vietnamese subsets (replaced by the editorial print redesign below)
- [x] Icons through `src/lib/icons.ts` (Phosphor since the redesign)
- [x] Home, map, route pages (fixed section order), progress page
- [x] Map: search, ready-only, learner-state and project filters, live count, keyboard disclosures
- [x] Route: learner panel with Record evidence and timeline; diagnostic workspace; per-source Opened checklist
- [x] Progress: counts by state, review queue, import/export `progress.yaml` validated against the schema
- [x] Enforcement: stylelint design rules, token contrast, i18n parity, headers, icons, unit tests, Playwright e2e under real CSP
- [x] CI job `site` (Node 26, pnpm, Playwright)

## Next

### Launch

- [x] First green run of the `site` CI job on GitHub (run 35696021496)
- [x] Deploy the Worker `ai-engineering-atlas` with `wrangler deploy`
- [x] Custom domain `ai-eng.canhta.com`; production passes `capture.mjs` (headers, axe, overflow)
- [x] Manual deploy workflow (`workflow_dispatch`) with checks and browser tests before deploy
- [x] Repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; `production` environment limited to `main`; first CI deploy 2026-09-22 (run 35704294981), production passes `capture.mjs`
- [x] Link the site from the root `README.md`

### Content-driven site (next, owner request)

- [x] Versioned content model contract: collections → items → typed blocks; the site renders only the contract ([RFC](../rfcs/0000-content-model.md), `schemas/site-data.schema.json` v2)
- [x] Content side (agent A): `curriculum/presentation.yaml` (field → block, section order, en/vi section titles, vocabularies) and the generic adapter `scripts/build_site_data.py`; unmapped fields render as `data` blocks and are reported
- [x] Site renderer uses a block registry; no curriculum field names in `site/src` (`src/lib/atlas.ts`, `src/components/blocks/`, `pnpm run check:coupling`)
- [x] Site test that renders every block type from a fixture, including `data` with unknown shapes (`src/components/blocks/blocks.vitest.ts`)

### Visual redesign: survey plate (replaced by the editorial print redesign below)

- [x] DESIGN.md survey-plate direction; tokens (mineral ground, ink, magenta route), Hubot Sans / Newsreader / JetBrains Mono (variable, Vietnamese subsets), Phosphor light icons
- [x] Milestone 1: global frame (floating pill nav, mobile menu overlay, breadcrumb, footer), route sheet (rail with steps and scrollspy, one-task diagnostic, sources table, field log with mobile sheet), project pages from the same renderer
- [x] Milestone 2: the plate (`src/components/plate/`) in overview, explore, and progress modes; Home, Atlas (plate, list, filters, drawer with `?item=`, `?ready=1`, `?group=`), and Progress rebuilt on it; mobile Playwright project
- [x] Milestone 3: seven distinguishable learner states (fill and hue per state), one bridge wording, capture at 390/1440 over home, atlas, drawer, progress, and route, and tests for the states surfaces must handle (unknown `?item=`, empty review queue, import errors, storage blocked, JavaScript off, reduced motion)
- [x] Owner review of the survey-plate redesign: superseded, the owner rejected it (ADR 0001); the review moved to the editorial print redesign below
- [x] Before-hydration pass: controls are disabled until hydration. The Atlas drawer stays a JavaScript surface; Home, Progress, ready rows, and route pages work without it (DESIGN.md → states)

### Editorial print redesign ([ADR 0001](../docs/adr/0001-editorial-print-direction.md), tickets in `.scratch/visual-redesign/issues/`)

- [x] 01 Print system everywhere: paper/ink/magenta tokens in light and night-chart dark, Newsreader + IBM Plex Sans (Hubot Sans removed), plain top bar and footer, no glass, bezels, trays, pill buttons, or plate settle-in; stylelint rejects undefined tokens and blur; DESIGN.md visual system and review tells rewritten
- [x] 02 The plate carries names: ready routes as named tiles, mapped competencies as circle marks, italic region labels with "N ready of M"; region placement from the pure, tested `src/lib/plate-layout.ts` (rows fill, no stretched last row); prerequisite lines on hover and focus only; the unused progress mode removed
- [x] 03 Home shows the method: title, promise, start action, the plate, then a server-rendered specimen of the route `site.specimen` names (first diagnostic task, first source with its exact locator and why, exit evidence, margin notes); next steps lead once there is evidence; the four-step row and ready-routes list removed. New vi strings await owner review
- [x] 04 Route page as a chapter: section label, details line (`detailsOf()` in `atlas.ts`, also in the Atlas drawer) instead of chips, numbered contents rail, sources as a bibliography with the locator first, field log in a sticky ruled margin column; project pages share it, lab workbenches unchanged
- [x] 05 Region locator plate at the top of the route's margin column: the plate in `locator` mode (`RegionLocator.astro`, server-rendered), this route filled, in-region prerequisites ringed, every mark named with a tooltip, a key, and a line linking prerequisites in other regions; omitted below 1024
- [x] After 03: `chips` and `sources` dropped from `ItemDetail`, and the `drawer.sources` strings with them
- [x] 06 Review and close-out: every surface captured in en/vi, light/dark, 390/1440, with and without progress, and reviewed against DESIGN.md. Fixed: the prerequisite bridge is a hairline-hung bibliography entry (locator first), not a boxed card; sources in bridges and practice cite like the bibliography (no type chip); the practice link to a project is a plain link, not a button with an arrow; the prerequisite line keeps each item with its "(bridge below)" note; a lab without a lead loses the bare rule under its title; the unassessed ready glyph is the tile's landscape rectangle (a square read as a checkbox); Home's next steps align with the title; the locator key counts prerequisites beyond three; the field log is the bottom bar below 1024, so tablets start with the route; the diagnostic spans the reading column; the Atlas view toggle lost its fieldset padding; Library meta uses a comma, not a middle dot; the drawer takes focus as soon as it opens from the keyboard (explore tiles open it on the key itself, so React Aria no longer waits for tile transitions)
- [ ] Owner review of the redesign and its Vietnamese strings. New or changed `vi` keys: 03 `home.jump`, `home.specimen.label`, `home.specimen.open`, `home.specimen.reading`, `home.specimen.purpose`, `home.note.diagnose.title`, `home.note.diagnose.body`, `home.note.read.title`, `home.note.read.body`, `home.note.record.title`, `home.note.record.body`; 04 `details.label`, `details.sources`, `details.sourceOne`, `details.tasks`, `details.taskOne`; 05 `plate.tileHere`, `plate.tilePrereq`, `locator.title`, `locator.description`, `locator.here`, `locator.needs`, `locator.elsewhere`; 06 `prereq.bridgeHere` (new), `prereq.bridge` (reworded for the drawer: "trên trang lộ trình"), `locator.needsMany` (new)

#### Follow-ups from the redesign review (each surface gets its own spec, like 03–05)

- [x] Restructure Atlas, filters: a ruled key above the plate (search, one React Aria menu button per facet naming its choice, the ready toggle, the live count, Clear), no native selects; the mobile sheet uses the same buttons (DESIGN.md → Atlas)
- [ ] Restructure Atlas, opening: the page opens with the same plate as Home, so it does not yet answer "what is there" differently; the drawer is the only surface with item detail
- [x] Restructure Progress as a field logbook: summary and region bars on top, the evidence log (every record once, newest first, read-only) replacing the per-competency table, next steps, review, and Your data in the ruled margin (after the log below 1024). New strings for owner review: `progress.log`, `progress.logCount`, `progress.logOne`, `progress.entryFacts`, `progress.supports`, `method.*` (en and vi)
- [x] Restructure the collection indexes (Labs, Projects, Paths): now a full-width ruled catalogue (stacked entries on a phone), each item with what it asks (`passageOf()`), how it runs (`benchOf()`, from its blocks), and the routes it is practice for or, for projects, brings together (`trackedItemsFrom()`), with the learner's state glyphs after hydration. New `vi` keys for owner review: `collection.covers`, `collection.col.title`, `collection.col.asks`, `collection.col.runs`, `collection.runs.runner`, `collection.runs.form`, `collection.runs.none`
- [x] Restructure Library (editorial-surfaces 03): a bibliography in sections, one per resource type with its count, beside a contents column (search, types, count; sticky from 1024); entries set the source beside its citing pages, the first two shown and the rest behind "and N more"; 22,580px → 11,951px at 1440. New `vi` keys for owner review: `library.contents`, `library.more`, `library.otherKind`; `library.kind` removed
- [ ] Project pages: milestones render as raw IDs (`product-frame`, `lexical-baseline`) in reading type; the project needs titled milestones from the content model before its page can read like a route
- [x] The Prerequisites block shows the learner's state: each head is an island (`PrereqHead.tsx`) that server-renders the maturity glyph and label and takes the state glyph and label after hydration, as the prerequisite line does (`tests/prerequisites.spec.ts`)
- [x] Review polish (next-screens 01, `tests/polish.spec.ts`): route links with a state glyph name the maturity or state for screen readers (visually hidden text in the prerequisite line and catalogue, `aria-describedby` in the Prerequisites block); Library search matching only a collapsed citation opens "and N more"; the Library contents list "All types" before hydration too, so nothing shifts; catalogue rows with more than six routes group them by region; catalogue passages without a translation get the marker; the Atlas sheet's filter menus open downward, never over its title; "Start review" is an outlined secondary. New `vi` key for owner review: `prereq.state`
- [ ] Plate, last desktop row: Multimodal and Specializations stretch beside the taller Security & Governance block. `plate-layout.ts` balances columns, not heights; balancing heights needs the tile count per row, left for when the plate's rules next change
- [ ] Home specimen at 1440: the diagnostic entry is shorter than the source entry beside it and leaves space under it; filling it would be decoration, so it waits for the specimen to show more of the diagnostic (for example the pass condition)
- [ ] Home on a phone: the specimen sits below the stacked plate (about 3,000px down); "See a route up close" jumps to it. The design keeps plate first; revisit if analytics show visitors never reach it

### Phase 1 follow-ups

- [ ] Graph view (React Flow + ELK), or retire it: the plate now draws declared prerequisite lines on hover and focus (owner decision)
- [x] Remember the language choice: `/` opens the language of the last page viewed
- [x] Wide tables stack into labelled rows on mobile: sources, atlas, and the Progress evidence table
- [x] Home ready-route rows wrap unevenly at 375px (rebuilt in milestone 2)
- [ ] Path filter: `paths/applied-ai-engineer.md` is prose; a structured path list is a curriculum change (RFC)
- [x] "Practice for" lists only tracked items pointing at another collection's item (a lab, a project); a prerequisite between routes no longer shows as practice (`atlas.test.ts`)
- [x] The floating nav blurs what scrolls under it: the build kept only `-webkit-backdrop-filter`, which Chromium ignores, so the unprefixed declaration is the only one
- [x] Two DESIGN.md tells removed: the trailing "Atlas →" link on collection indexes (the breadcrumb links back), and "N/M done" on Progress region rows, now "N of M demonstrated" on one shared column grid

### Phase 1b: in-browser labs

- [x] Pyodide (self-hosted from npm, loaded on first Run) in a Web Worker; Stop via `SharedArrayBuffer`; 20 s limit recreates the worker; `'wasm-unsafe-eval'` and `worker-src 'self'` in the CSP
- [x] Editor (CodeMirror 6, token theme, drafts per lab, Reset behind a confirm) and results panel (pass / fail / error / stopped / timeout)
- [ ] Results grouped by `task_id`: the lab tests are plain asserts in one `main()`, so a run has one result; grouping needs the tests split by task, which is a lab change with its own review
- [x] Lab browser contract (`lab.yaml`) checked by `scripts/validate_labs.py`
- [x] `evaluation-harness` and `prompt-injection-boundaries` in the browser; every lab has a README page at `/{lang}/labs/<id>/`
- [x] Reference solution behind a confirmed reveal, remembered per lab as `independence: reference-open`; automated `implementation` evidence with the code's SHA-256
- [ ] Owner review of the lab UI and its Vietnamese strings
- [x] Pyodide package wheels served from our own origin, verified against `pyodide-lock.json` (`scripts/fetch-pyodide-wheels.mjs`)
- [x] `self-attention` ported to NumPy in place; it runs in the browser like the other code labs
- [x] `agentic-design` and `model-selection` as rubric forms
- [ ] Help ladder and reviewed feedback keys (en/vi); highest step recorded as `independence`
- [x] CI step running each browser lab under Pyodide (Node) against CPython `python tests.py` (`pnpm run test:labs`, in `make site-check`, `ci.yml`)

### Phase 2: diagnostics, next step, AI tutor

- [x] Deterministic next-step recommendation from prerequisites and states, with tests (`src/lib/recommend.ts`; Home, Progress, field log)
- [x] Replace fixed review intervals with `ts-fsrs`
- [x] Worker `/api/*`: SSO (GitHub, Google), HttpOnly session, D1 users and usage counters (`worker/`, ticket `.scratch/phase2/issues/01-sign-in.md`): only `/api/*` runs the Worker first; OAuth with state and PKCE, server-side code exchange, opaque sessions hashed in D1, same-origin sign-out, `/api/me` always 200 (`available: false` without configuration, the other endpoints 503); sign-in menu in the top bar; `pnpm run test:worker`
- [ ] Owner setup before sign-in can go live: OAuth apps, D1 database and its binding in `wrangler.jsonc`, migrations, Worker secrets (`.scratch/phase2/owner-setup.md`)
- [ ] Owner review of the sign-in and privacy Vietnamese strings: `footer.privacy`, `account.signIn`, `account.signInWith`, `account.signedIn`, `account.signOut`, `account.signOutFailed`, `privacy.title`, `privacy.intro`, `privacy.browser.title`, `privacy.browser.body`, `privacy.cookie.title`, `privacy.cookie.body`, `privacy.cookie.optional`, `privacy.stored.title`, `privacy.stored.user`, `privacy.stored.sessions`, `privacy.stored.usage`, `privacy.stored.not`, `privacy.sent.title`, `privacy.sent.signin`, `privacy.sent.ai`, `privacy.sent.host`, `privacy.delete.title`, `privacy.delete.body`
- [ ] AI proxy with the project key as a Worker secret; per-user and global budgets (writes the D1 `usage` table)
- [ ] Tutor roles from the RFC (diagnostic interviewer, source guide, lab coach, evidence reviewer, review partner, next-step explainer)
- [ ] Tutor evaluation set in CI (give-away rate, held-out independent correctness, no passing code from the coach)
- [x] Privacy page (en/vi): `/{lang}/privacy/`, linked from the footer (`tests/account.spec.ts`)
- [ ] First two experiment playgrounds, each naming its `experiments` entry

### Screens to add (from the roadmap.sh teardown, 2026-09-22)

roadmap.sh gives every collection an index, a maintenance signal, and a shareable profile. We have item pages but nothing that lists them: `/en/labs/` is a 404 today.

- [x] Collection index pages `/{lang}/labs/`, `/{lang}/projects/`, `/{lang}/paths/`: generic, from the content model's collections, linked from the Atlas
- [ ] Path as a screen: an ordered sequence of routes with the learner's state against each, the way a role roadmap reads. `paths/applied-ai-engineer.md` is prose today, so this is a curriculum change first (structured path list) and needs an RFC
- [x] Library `/{lang}/sources/`: every source we route through, searchable and filterable by type, each row linking to the public resource and to the routes that cite it with their locators
- [ ] What changed `/{lang}/changelog/`: routes promoted to ready, labs added, per release. roadmap.sh's "actively maintained" signal, and the honest counterpart to our coverage numbers
- [x] How it works `/{lang}/how/`: the learning model in learner language (states, what counts as evidence, why review comes back), linked from Home's hero and the footer (`tests/how.spec.ts`). New `vi` keys for owner review: `how.title`, `how.intro`, `how.states.title`, `how.states.note`, `how.evidence.title`, `how.evidence.intro`, `how.evidence.col`, `how.evidence.note`, `how.steps.title`, `how.steps.intro`, `how.steps.some`, `how.steps.example`, `how.review.title`, `how.review.delay`, `how.review.when`, `how.review.how`, `how.review.due`; and the new `description` (en, vi) of each `state` and `competency_type` value in `curriculum/presentation.yaml`
- [ ] Public profile `/{lang}/u/<handle>/`: opt-in, shareable, the prerequisite for any ranking. Needs Phase 2 accounts
- [x] Search across everything (routes, labs, projects, sources), not just the Atlas list: `/{lang}/search/` and a Search tab in the top bar; a static index per language built from the content model (`/{lang}/search/index.json`), accent-insensitive, `?q=` shareable, a plain form without JavaScript. New `vi` keys for owner review: `nav.search`, `search.title`, `search.intro`, `search.label`, `search.placeholder`, `search.routes`, `search.citedBy`, `search.loading`, `search.failed`, `search.none`, `search.resultOne`, `search.results`, `search.browse`, `search.atlasList`

### Community and motivation (owner request)

- [ ] Public ranking: leaderboards by day, week, month, and all time, from recorded evidence. Three things to settle first: (a) progress is local-first and private today, so publishing is opt-in per learner and needs an account (Phase 2 SSO); (b) self-reported evidence is gameable, so a public ranking is only meaningful on verified evidence (Phase 3) or on counts that cannot be inflated (lab runs passing in CI, review streaks); (c) rank what the learning model values — evidence recorded, routes demonstrated, review streaks kept — not time spent or pages opened. Needs an RFC before implementation.

### Phase 3

- [ ] Separate RFC for verified evidence (lab CI on forks, peer review, progress sync)

### Bilingual content

- [ ] Owner review of `src/i18n/vi.json`
- [ ] `competency.vi.yaml` format, schema, and source-hash staleness check; render reviewed translations

### Harness upkeep

- [x] Formatting and linting: ruff (Python), prettier and eslint (everything else), pre-commit hooks, and a `lint` CI job

- [x] Root `AGENTS.md` pruned to 175 lines; the budget in `validate_agent_docs.py` is now 200
- [ ] Owner decision on updating the global `writing-for-agents` skill (differences listed in the agent-harness research)

## Owner decisions still open

- Model provider and model IDs for the project key
- SSO providers beyond GitHub and Google
- Budgets: questions per user per day, global monthly cap
- Should decision-lab answers ever leave the browser before Phase 3
