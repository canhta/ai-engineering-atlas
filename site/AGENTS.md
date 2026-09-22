# site/AGENTS.md

Guidance for work under `site/` (the web atlas at ai-eng.canhta.com) and its Cloudflare Worker. The repository-wide rules in the root [AGENTS.md](../AGENTS.md) still apply.

Design and scope: [web atlas RFC](../rfcs/0000-interactive-web-atlas.md). Stack: Astro (static output) with React Aria islands, Node 26, pnpm, Cloudflare Workers static assets.

## Commands

Run from `site/` unless noted.

| Command | Use |
|---|---|
| `pnpm install` | Install; build scripts are allowed only for the packages in `pnpm-workspace.yaml` |
| `pnpm run dev` | Dev server. Astro's CSP and `_headers` do not apply in dev |
| `pnpm run check` | Typecheck, unit tests, style lint, i18n parity, token contrast, headers, icons, content coupling, build |
| `pnpm run test:e2e` | Browser tests of the interactions against the built site (starts `pnpm run preview`) |
| `pnpm run build` then `pnpm run preview` | Serve `dist/` through Wrangler with `_headers` applied (http://127.0.0.1:8787) |
| `node scripts/capture.mjs` | With preview running: screenshots (en/vi × light/dark × 375/1280), axe, header and overflow checks |
| `make site-check` | From the repository root: what CI runs for the site |

Deploys run only through the manual **Deploy site** workflow (`.github/workflows/deploy.yml`, Actions → Run workflow). It runs every check and the browser tests before `wrangler deploy`. Do not deploy from a local machine or an agent session.

`astro check` needs TypeScript 6; TypeScript 7 lacks the API it uses. Keep `typescript` on `^6` until Astro supports 7.

## Before you change anything

- **Any site work** → check [TODO.md](TODO.md) for status and open decisions; mark items done, or add new ones, in the same change.

- **UI, styles, layout, copy, or i18n strings** → read [DESIGN.md](DESIGN.md) first. It is the design source of truth; token values live in [src/styles/tokens.css](src/styles/tokens.css), and `stylelint.config.mjs` rejects literal colours and gradients, and accepts fonts, radii, shadows, blur, durations, and easing only as tokens.
- **Anything the site shows about a competency** → change the curriculum YAML at the repository root, then regenerate the data. The site renders contracts; it does not own curriculum content.

## Data contract

- `src/data/atlas.json` is the content model v2 ([RFC](../rfcs/0000-content-model.md), [schema](../schemas/site-data.schema.json)): site, vocabularies, collections, items with typed blocks, relations, resources. Regenerate it with `python scripts/build_site_data.py --write`; `make check` fails when it is stale.
- The site renders only the content model. Curriculum field names, section titles, and vocabulary labels live in [curriculum/presentation.yaml](../curriculum/presentation.yaml), not in `src/`. `pnpm run check:coupling` fails when a curriculum field name (from `presentation.yaml` and `schemas/competency.schema.json`) appears in `src/` outside `src/data/`.
- `src/lib/atlas.ts` is the only reader of the model. Islands never import it (it would ship the whole model to the browser); pages pass them plain props. `text(l10n, lang)` returns `{value, lang}`: render `lang` on the element when it differs from the page language.
- Blocks render through `src/components/blocks/Block.astro`, one component per block type. Route and project pages share `src/components/sheet/ItemSheet.astro`.
- To show a new content field, add a block to `presentation.yaml`; do not special-case it in the site. Unknown block types render as `data`.
- Pages exist only where an item has `page` (competencies: `page_when` on status). Items without a page render as list entries.

## Learner state

- Progress follows [LEARNING_MODEL.md](../LEARNING_MODEL.md): a state changes only through an evidence record. Opening a source, scrolling, or AI output leaves state unchanged.
- Progress lives in the browser and exports as `progress.yaml` valid against [schemas/progress.schema.json](../schemas/progress.schema.json). Use the schema's existing enum values (`independence: reference-open` for a revealed solution).

## Bilingual

- Every UI string key exists in both [src/i18n/en.json](src/i18n/en.json) and `vi.json` with the same `{params}`; `pnpm run check:i18n` enforces it.
- Curriculum text rendered on a `/vi/` page carries `lang="en"` (WCAG 3.1.2).
- English contracts are canonical. Vietnamese route text comes only from reviewed `competency.vi.yaml` files; a missing or stale translation shows English with `lang="en"` and the marker "chưa dịch / not yet translated". Machine translation is never rendered.
- The repository owner reviews Vietnamese before merge.

## Labs and runtime

- Labs run in Pyodide inside a Web Worker. Interrupting code needs `SharedArrayBuffer`, so every page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Any third-party asset must be same-origin or send CORP/CORS headers, or it will fail to load.
- Browser labs run the same `tests.py` as local labs. A lab change is verified both ways.
- CSP comes from `astro.config.mjs` (`security.csp`): scripts are hash-only; styles allow `'unsafe-inline'` because React Aria server-renders `style` attributes. Only `pnpm run test:e2e` (real CSP via Wrangler) catches a violation, so run it after adding an island or third-party code.

## AI tutor and Worker

- AI calls go through the Worker at `/api/*`. The provider key is a Worker secret and never reaches the browser.
- AI requires SSO sign-in. The browser sends an action, a route ID, and learner input; the Worker builds the prompt from the route contract.
- The Worker stores users and usage counters only. Learner answers and code pass through to the provider and are not stored, except messages the learner reports as wrong.
- AI roles and their limits are listed in the web atlas RFC ("AI support"). A new role needs an RFC change first.

## Done means

- `make check` and `make site-check` pass.
- For UI changes: `node scripts/capture.mjs` reports no problems, and you have looked at the screenshots against [DESIGN.md](DESIGN.md). In Claude Code, the `atlas-ui-review` skill runs this review.
- Any command, token, or convention you changed is updated in this file or DESIGN.md in the same change.
