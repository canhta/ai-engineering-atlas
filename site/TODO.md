# Web atlas: progress and todo

Tracks delivery of the [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Mark an item done in the same change that finishes it, and add new work here before starting it.

Last updated: 2026-09-22

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
- [x] Tokens, fonts with Vietnamese subsets (replaced by the survey-plate redesign below)
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

### Visual redesign (next, owner request)

- [x] DESIGN.md survey-plate direction; tokens (mineral ground, ink, magenta route), Hubot Sans / Newsreader / JetBrains Mono (variable, Vietnamese subsets), Phosphor light icons
- [x] Milestone 1: global frame (floating pill nav, mobile menu overlay, breadcrumb, footer), route sheet (rail with steps and scrollspy, one-task diagnostic, sources table, field log with mobile sheet), project pages from the same renderer
- [x] Milestone 2: the plate (`src/components/plate/`) in overview, explore, and progress modes; Home, Atlas (plate, list, filters, drawer with `?item=`, `?ready=1`, `?group=`), and Progress rebuilt on it; mobile Playwright project
- [x] Milestone 3: seven distinguishable learner states (fill and hue per state), one bridge wording, capture at 390/1440 over home, atlas, drawer, progress, and route, and tests for the states surfaces must handle (unknown `?item=`, empty review queue, import errors, storage blocked, JavaScript off, reduced motion)
- [ ] Owner review of the live survey-plate redesign and the Vietnamese wording
- [x] Before-hydration pass: controls are disabled until hydration. The Atlas drawer stays a JavaScript surface; Home, Progress, ready rows, and route pages work without it (DESIGN.md → states)

### Phase 1 follow-ups

- [ ] Graph view (React Flow + ELK), or retire it: the plate now draws declared prerequisite lines on hover and focus (owner decision)
- [x] Remember the language choice: `/` opens the language of the last page viewed
- [x] Wide tables stack into labelled rows on mobile: sources, atlas, and the Progress evidence table
- [x] Home ready-route rows wrap unevenly at 375px (rebuilt in milestone 2)
- [ ] Path filter: `paths/applied-ai-engineer.md` is prose; a structured path list is a curriculum change (RFC)

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
- [ ] Worker `/api/*`: SSO (GitHub, Google), HttpOnly session, D1 users and usage counters
- [ ] AI proxy with the project key as a Worker secret; per-user and global budgets
- [ ] Tutor roles from the RFC (diagnostic interviewer, source guide, lab coach, evidence reviewer, review partner, next-step explainer)
- [ ] Tutor evaluation set in CI (give-away rate, held-out independent correctness, no passing code from the coach)
- [ ] Privacy page (en/vi)
- [ ] First two experiment playgrounds, each naming its `experiments` entry

### Screens to add (from the roadmap.sh teardown, 2026-09-22)

roadmap.sh gives every collection an index, a maintenance signal, and a shareable profile. We have item pages but nothing that lists them: `/en/labs/` is a 404 today.

- [ ] Collection index pages `/{lang}/labs/`, `/{lang}/projects/`, `/{lang}/paths/`: generic, from the content model's collections (label, items, which have pages), so a new collection needs no new page
- [ ] Path as a screen: an ordered sequence of routes with the learner's state against each, the way a role roadmap reads. `paths/applied-ai-engineer.md` is prose today, so this is a curriculum change first (structured path list) and needs an RFC
- [ ] Sources library `/{lang}/sources/`: every resource with the routes that use it and the exact locators, so a learner can see which book or course actually earns its place
- [ ] What changed `/{lang}/changelog/`: routes promoted to ready, labs added, per release. roadmap.sh's "actively maintained" signal, and the honest counterpart to our coverage numbers
- [ ] How it works `/{lang}/how/`: the learning model in learner language (states, what counts as evidence, why review comes back). Home carries four steps; the model deserves a page
- [ ] Public profile `/{lang}/u/<handle>/`: opt-in, shareable, the prerequisite for any ranking. Needs Phase 2 accounts
- [ ] Search across everything (routes, labs, projects, sources), not just the Atlas list

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
