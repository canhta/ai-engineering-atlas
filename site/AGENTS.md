# site/AGENTS.md

Guidance for work under `site/` (the web atlas at ai-eng.canhta.com) and its Cloudflare Worker. The repository-wide rules in the root [AGENTS.md](../AGENTS.md) still apply.

Design and scope: [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Stack: Astro (static output) with React Aria islands, Node 26, pnpm, Cloudflare Workers static assets.

## Commands

Run from `site/` unless noted.

| Command                                  | Use                                                                                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install`                           | Install; build scripts are allowed only for the packages in `pnpm-workspace.yaml`                                                                                                                                                          |
| `pnpm run dev`                           | Dev server. Astro's CSP and `_headers` do not apply in dev                                                                                                                                                                                 |
| `pnpm run check`                         | Typecheck, unit tests (`node --test` for logic and the Worker, Vitest for the block renderer), style lint, i18n parity, token contrast, headers, icons, content coupling, build                                                            |
| `pnpm run test:worker`                   | The Worker alone (part of `check`): routing, `/api/me` and 503 without configuration, OAuth with provider HTTP mocked, sessions against the D1 migrations in Node's SQLite                                                                 |
| `pnpm run test:labs`                     | Browser labs under Pyodide in Node: the reference passes, and the starter gives the same result as `python3 tests.py` (needs `python3`, or set `PYTHON`)                                                                                   |
| `pnpm run test:e2e`                      | Browser tests against the built site (starts `pnpm run preview`): desktop at 1440px; tests tagged `@mobile` at 390px                                                                                                                       |
| `pnpm run build` then `pnpm run preview` | Serve `dist/` through Wrangler with `_headers` applied (http://127.0.0.1:8787, or `ATLAS_PORT`)                                                                                                                                            |
| `node scripts/capture.mjs`               | With preview running: screenshots (home, atlas, drawer, progress, route, lab by default; en/vi × light/dark × 390/1440), axe, header and overflow checks. `CAPTURE_PROGRESS=<progress.yaml>` seeds learner progress                        |
| `make site-check`                        | From the repository root: what CI runs for the site                                                                                                                                                                                        |
| `ATLAS_PORT=8791 …`                      | Parallel worktrees set `ATLAS_PORT` (default 8787) to a free port; `preview`, the browser tests, and `capture.mjs` read it. Browser tests reuse any server on that port, so check it is free first (`lsof -iTCP:$ATLAS_PORT -sTCP:LISTEN`) |

Two workflows: **CI** (`ci.yml`) runs on every push and decides whether a commit is good; **CD** (`cd.yml`) is manual (Actions → CD → Run workflow), refuses a commit whose CI run is not green, then builds and deploys. Do not deploy from a local machine or an agent session.

`astro check` needs TypeScript 6; TypeScript 7 lacks the API it uses. Keep `typescript` on `^6` until Astro supports 7.

## Before you change anything

- **Any site work** → check [TODO.md](TODO.md) for status and open decisions; mark items done, or add new ones, in the same change.

- **UI, styles, layout, copy, or i18n strings** → read [DESIGN.md](DESIGN.md) first. It is the design source of truth; token values live in [src/styles/tokens.css](src/styles/tokens.css), and `stylelint.config.mjs` rejects literal colours, gradients, and blur, accepts fonts, radii, shadows, durations, and easing only as tokens, and rejects any `var(--…)` that `tokens.css` (or the Astro font config) does not define (`scripts/stylelint-known-tokens.mjs`).
- **Anything the site shows about a competency** → change the curriculum YAML at the repository root, then regenerate the data. The site renders contracts; it does not own curriculum content.

## Data contract

- `src/data/atlas.json` is the content model v2 ([RFC](../rfcs/0000-content-model.md), [schema](../schemas/site-data.schema.json)): site, vocabularies, collections, items with typed blocks, relations, resources. Regenerate it with `python scripts/build_site_data.py --write`; `make check` fails when it is stale.
- The site renders only the content model. Curriculum field names, section titles, and vocabulary labels live in [curriculum/presentation.yaml](../curriculum/presentation.yaml), not in `src/`. `pnpm run check:coupling` fails when a curriculum field name (from `presentation.yaml` and `schemas/competency.schema.json`) appears in `src/` outside `src/data/`.
- `src/lib/atlas.ts` is the only reader of the model. Islands never import it (it would ship the whole model to the browser); pages pass them plain props. `text(l10n, lang)` returns `{value, lang}`: render `lang` on the element when it differs from the page language.
- Blocks render through `src/components/blocks/Block.astro`, one component per block type. Route, project, and lab pages share `src/components/sheet/ItemSheet.astro`; a page with a `runner` block uses its workbench layout.
- Atlas filters come from the model: the tracked collection's `facets` (the `page_when` field is the "Ready routes only" toggle), the learner state, and one facet per other collection whose items have relations pointing at tracked items (projects today).
- To show a new content field, add a block to `presentation.yaml`; do not special-case it in the site. Unknown block types render as `data`.
- Pages exist only where an item has `page` (competencies: `page_when` on status). Items without a page render as list entries.

## Tests

- Browser tests read counts, task numbers, and source counts from `src/data/atlas.json`; never type a number such as "19 of 116" into a test. The curriculum grows, and a pinned count fails on the next route promotion instead of on a regression.
- Every test fails on a console error, an uncaught exception, or a CSP violation.

## Learner state

- Progress follows [../docs/LEARNING_MODEL.md](../docs/LEARNING_MODEL.md): a state changes only through an evidence record. Opening a source, scrolling, or AI output leaves state unchanged.
- Progress lives in the browser and exports as `progress.yaml` valid against [schemas/progress.schema.json](../schemas/progress.schema.json). Use the schema's existing enum values (`independence: reference-open` for a revealed solution).
- The next-step rules live only in `src/lib/recommend.ts` (pure, deterministic, tested in `recommend.test.ts`). Pages pass it the graph from `nextGraph()`; the recommendation is advice and never changes a state.
- Delayed-retrieval scheduling (when the next check is due) lives only in `src/lib/review.ts`, the one module that imports `ts-fsrs`; `progress.ts` calls it and no longer holds fixed review intervals. FSRS decides _when_ to check, never a state: `recordEvidence` still moves `current_state` from the reported evidence alone.

## Bilingual

- Every UI string key exists in both [src/i18n/en.json](src/i18n/en.json) and `vi.json` with the same `{params}`, and no `vi` value is longer than 1.3 × its `en` value + 12 characters; `pnpm run check:i18n` enforces it.
- **Any Vietnamese string** → follow [../docs/VIETNAMESE_STYLE.md](../docs/VIETNAMESE_STYLE.md): voice, glossary, word choice, punctuation, numbers, and dates. `check:i18n` enforces its mechanical rules.
- Dates shown to learners go through `formatDate(iso, lang)` in `src/lib/dates.ts` (Intl: dd/mm/yyyy on `/vi/`, "Jan 1, 2026" on `/en/`) inside `<time dateTime={iso}>`. Files keep ISO dates.
- Curriculum text rendered on a `/vi/` page carries `lang="en"` (WCAG 3.1.2).
- English contracts are canonical. Vietnamese route text comes only from reviewed `competency.vi.yaml` files; a missing or stale translation shows English with `lang="en"` and the marker "chưa dịch / not yet translated". Machine translation is never rendered.
- The repository owner reviews Vietnamese before merge.

## Labs and runtime

- A lab runs in the browser when `labs/<id>/lab.yaml` has a `browser:` contract (checked by `scripts/validate_labs.py`); the adapter turns it into a `runner` block (`runtime: pyodide`) or a `form` block (`runtime: form`, the two decision labs: DESIGN.md → Labs → The form variant). Labs without it get a README-only page. Do not edit `starter.py`, `tests.py`, `solution.py`, a lab README, or a decision lab's rubric/template wording as part of site work: lab changes get their own review.
- Pyodide is self-hosted: `astro.config.mjs` copies the npm package's core files to `dist/pyodide/<version>/` (each under Cloudflare's 25 MiB static-asset limit; the build fails otherwise) and serves them in dev. Only the core and standard library ship; `browser.packages` is rejected.
- `src/lib/lab-run.ts` is the one run harness (runs the run file as `__main__`, classifies pass, fail, error, stopped), shared by the worker (`lab-worker.ts`, loaded on the first Run by `lab-session.ts`) and `scripts/test-labs.mjs`. Stop sets the `SharedArrayBuffer` interrupt; the 20 s limit terminates the worker.
- Interrupting code needs `SharedArrayBuffer`, so every page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Any third-party asset must be same-origin or send CORP/CORS headers, or it will fail to load.
- Browser labs run the same `tests.py` as local labs; `pnpm run test:labs` proves it against CPython. CPython-only parity dependencies live in `site/requirements-labs.txt` and must stay aligned with `browser.packages`. Run it after any lab change.
- A lab may declare `browser.packages` with packages Pyodide itself builds (`numpy` today). `scripts/fetch-pyodide-wheels.mjs` (prebuild) downloads their wheels into `node_modules/pyodide`, checked against `pyodide-lock.json`, and the build ships them beside the runtime so `loadPackage` stays same-origin. Anything Pyodide does not build stays out of the browser.
- Lab drafts (`atlas.lab-code.v1.<ref>`) and opened references (`atlas.lab-reference.v1`) live in guarded local storage next to progress.
- CSP comes from `astro.config.mjs` (`security.csp`): scripts are hash-only plus `'wasm-unsafe-eval'` (Pyodide's WebAssembly, no JavaScript eval) and `worker-src 'self'`; styles allow `'unsafe-inline'` because React Aria server-renders `style` attributes. Only `pnpm run test:e2e` (real CSP via Wrangler) catches a violation, so run it after adding an island or third-party code.

## AI tutor and Worker

- The Worker lives in `worker/` (`index.ts` entry, `api.ts` routes). `wrangler.jsonc` runs it first for `/api/*` only, which `check:headers` enforces: `_headers` never applies to a Worker response, so pages must stay assets. API responses set their own headers in `worker/http.ts`.
- Sign-in: `GET /api/auth/{github,google}` → provider → `/api/auth/{provider}/callback` (state and PKCE S256, code exchanged server-side, provider token discarded, no email asked for); `GET /api/me`; `POST /api/auth/signout` (same-origin only). `/api/me` is asked on every page, so it always answers 200 (a failed request would be a console error): `{available: true, user, providers}` with `user` null when signed out, or `{available: false}`. The top bar's `AccountMenu.tsx` renders nothing unless `available` is true.
- One cookie, `__Host-atlas-session` (HttpOnly, Secure, SameSite=Lax): a signed 10-minute sign-in check, then an opaque session token. D1 keeps an HMAC of the token with a 30-day expiry. Changing what is stored or sent means changing `/{lang}/privacy/` in the same change.
- Configuration: secrets `SESSION_SECRET`, `GITHUB_CLIENT_ID`/`_SECRET`, `GOOGLE_CLIENT_ID`/`_SECRET`; var `ALLOWED_ORIGINS`; D1 binding `DB`. Anything missing makes `/api/me` answer `{available: false}` and the other `/api/*` endpoints 503, and leaves the site as it is. Locally, put them in `.dev.vars` (git-ignored) and apply migrations with `wrangler d1 migrations apply DB --local`.
- D1 holds users, sessions, and usage counters only (`worker/migrations/`, one numbered SQL file per change, never edited once applied). Learner answers, code, and progress never go there.
- AI calls will go through the same Worker, behind sign-in; the provider key is a Worker secret and never reaches the browser. The browser sends an action, a route ID, and learner input; the Worker builds the prompt from the route contract. Learner answers and code pass through to the provider and are not stored, except messages the learner reports as wrong.
- AI roles and their limits are listed in the web atlas RFC ("AI support"). A new role needs an RFC change first.

## Done means

- `make check` and `make site-check` pass.
- For UI changes: `node scripts/capture.mjs` reports no problems, and you have looked at the screenshots against [DESIGN.md](DESIGN.md). In Claude Code, the `atlas-ui-review` skill runs this review.
- Any command, token, or convention you changed is updated in this file or DESIGN.md in the same change.
