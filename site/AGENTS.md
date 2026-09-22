# site/AGENTS.md

Guidance for work under `site/` (the web atlas at aie.canhta.com) and its Cloudflare Worker. The repository-wide rules in the root [AGENTS.md](../AGENTS.md) still apply.

Design and scope: [RFC 0005](../rfcs/0005-interactive-web-atlas.md). Phase 0 (data) is done; the Astro app is being built in Phase 1.

## Before you change anything

- **UI, styles, layout, copy, or i18n strings** → read [DESIGN.md](DESIGN.md) first. It is the design source of truth; token values live in `src/styles/tokens.css`.
- **Anything the site shows about a competency** → change the curriculum YAML at the repository root, then regenerate the data. The site renders contracts; it does not own curriculum content.

## Data contract

- `src/data/atlas.json` is generated from the catalog, competency contracts, resources, labs, projects, and paths. Regenerate it with `python scripts/build_site_data.py --write`; `make check` fails when it is stale.
- Its shape is defined by [schemas/site-data.schema.json](../schemas/site-data.schema.json). A field the site needs goes into the builder and the schema in the same change.
- Only `seeded` and `ready` routes get pages. Coverage items render as "mapped, no route".

## Learner state

- Progress follows [LEARNING_MODEL.md](../LEARNING_MODEL.md): a state changes only through an evidence record. Opening a source, scrolling, or AI output leaves state unchanged.
- Progress lives in the browser and exports as `progress.yaml` valid against [schemas/progress.schema.json](../schemas/progress.schema.json). Use the schema's existing enum values (`independence: reference-open` for a revealed solution).

## Bilingual

- Every UI string key exists in both `en` and `vi`.
- English contracts are canonical. Vietnamese route text comes only from reviewed `competency.vi.yaml` files; a missing or stale translation shows English with `lang="en"` and the marker "chưa dịch / not yet translated". Machine translation is never rendered.
- The repository owner reviews Vietnamese before merge.

## Labs and runtime

- Labs run in Pyodide inside a Web Worker. Interrupting code needs `SharedArrayBuffer`, so every page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Any third-party asset must be same-origin or send CORP/CORS headers, or it will fail to load.
- Browser labs run the same `tests.py` as local labs. A lab change is verified both ways.

## AI tutor and Worker

- AI calls go through the Worker at `/api/*`. The provider key is a Worker secret and never reaches the browser.
- AI requires SSO sign-in. The browser sends an action, a route ID, and learner input; the Worker builds the prompt from the route contract.
- The Worker stores users and usage counters only. Learner answers and code pass through to the provider and are not stored, except messages the learner reports as wrong.
- AI roles and their limits are listed in RFC 0005 ("AI support"). A new role needs an RFC change first.

## Done means

- `make check` passes.
- For UI changes: pages reviewed against [DESIGN.md](DESIGN.md) in both languages, light and dark themes, at 375px and 1280px widths.
- Any command, token, or convention you changed is updated in this file or DESIGN.md in the same change.
