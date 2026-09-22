# RFC: Interactive Web Atlas

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Problem

The atlas is readable only as a GitHub repository. A learner has to open `catalog.yaml`, find a route folder, read `competency.yaml` or the rendered README, and track progress by hand-editing `progress.yaml`.

The contracts already hold what an interactive course needs: prerequisites, diagnostics with pass conditions, source locators with purposes, practice, exit evidence, transfer, and a progress schema with separate demonstrated / transferred / retained / applied states. None of it is navigable, and nothing guides the learner through the loop:

```text
map → diagnostic → targeted route → practice / lab → evidence → delayed review → project
```

Decisions already made by the repository owner:

- the site is public;
- it lives in this repository under `site/`;
- it is published at `ai-eng.canhta.com`;
- the interface is bilingual (English / Vietnamese);
- labs run in the browser;
- the site needs strong interactivity and AI support, not a static reader;
- hosting is Cloudflare;
- AI features use a project-owned API key and require SSO sign-in; the rest of the site works without an account;
- the repository owner reviews Vietnamese translations;
- `self-attention` runs in the browser; under the one-version rule (root AGENTS.md) its lab is either ported to NumPy in place or stays local-only (open decision).

## Evidence

Mechanisms taken from comparable projects. Claims about AI tutoring and in-browser practice were checked against the linked primary sources on 2026-09-22.

**Navigation and curriculum structure**

| Project                                                          | Mechanism adopted                                                                                                                                                        | Deliberately not adopted                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| [roadmap.sh](https://github.com/kamranahmedse/developer-roadmap) | Clickable skill map, node side panel with resources, per-node progress, "what next" view; one content file per node                                                      | Its content (the repository license restricts reuse); a single "Done" toggle that records consumption as completion |
| The Odin Project                                                 | Curriculum content separate from the app, which only renders it; lessons route to external sources                                                                       | Heavy server stack before it is needed                                                                              |
| Exercism                                                         | Runnable tests for exercises; mentor review against explicit criteria                                                                                                    | Self-hosted Docker test runners                                                                                     |
| Codecrafters                                                     | Learner pushes work, CI runs staged checks, result becomes evidence                                                                                                      | Proprietary runner infrastructure                                                                                   |
| Microsoft ML/GenAI for Beginners                                 | Pre-assessment before and challenge after each lesson                                                                                                                    | Multiple-choice quizzes as exit evidence for engineering competencies                                               |
| Made With ML                                                     | One evolving system across lessons                                                                                                                                       | —                                                                                                                   |
| Anki / FSRS                                                      | Spaced scheduling for delayed retrieval                                                                                                                                  | AI-generated flashcards                                                                                             |
| [Hugging Face course](https://github.com/huggingface/course)     | Per-language content directories (`chapters/<lang>/`, including `vi`) with a translated table of contents; quiz items where every distractor carries its own explanation | Notebook-only execution via external Colab links                                                                    |

**In-browser practice and automated feedback**

| Project                                                                                                                                                                                                        | Mechanism adopted                                                                                                                                                                                                                                                                               | Deliberately not adopted |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| [futurecoder](https://github.com/alexmojaki/futurecoder/wiki/How-course-content-works)                                                                                                                         | Python in a Pyodide Web Worker, no backend; exercise steps with a solution plus tests, including randomized inputs so hard-coded answers fail; targeted messages for known mistakes; help ladder of small hints → Parsons-shuffled solution → gradual reveal; predict-the-output before running | —                        |
| [Exercism test runner](https://github.com/exercism/docs/blob/main/building/tooling/test-runners/interface.md) / [analyzer](https://github.com/exercism/docs/blob/main/building/tooling/analyzers/interface.md) | Result contract with `pass` / `fail` / `error` and a `task_id` linking each test to a task; typed feedback comments (`essential`, `actionable`, `informative`, `celebratory`) stored as reviewed, parameterized message keys                                                                    | Docker runners           |
| [Brilliant](https://blog.brilliant.org/hand-crafted-machine-made/)                                                                                                                                             | Declarative exercise formats that AI can draft and humans review before publishing                                                                                                                                                                                                              | —                        |

**AI tutoring**

| Project                                                                                                                                                  | Mechanism adopted                                                                                                                                                                                                                                                                                                          | Deliberately not adopted                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [CS50.ai / Duck](https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf) (SIGCSE 2024)                                                               | Guide rather than give solutions, enforced by a course-specific system prompt kept in config; feature-scoped actions ("explain highlighted code", "explain changes"); retrieval over approved course material; a visible usage budget ("hearts") with a stated reflective purpose; staff can endorse or correct AI answers | —                                                                                                                                        |
| [Khanmigo](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/)                                       | A separate system that verifies calculations behind the tutor; tutor evaluation on outcomes: rate of giving the answer away before the learner attempts, and independent correctness on the next item                                                                                                                      | Flat refusal to help, which [reportedly](https://hechingerreport.org/proof-points-khanmigo-math-ai-tutor/) led students to stop using it |
| [Codecademy](https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant) / [Boot.dev Boots](https://www.boot.dev/blog/wiki/boots/) | Hints first, escalating only if the learner persists; full solution behind a separate explicit step; using help has a visible cost                                                                                                                                                                                         | XP penalties as a game mechanic                                                                                                          |
| [Duolingo](https://blog.duolingo.com/explain-my-answer-now-free/)                                                                                        | Explanations offered only after the learner submits, on request, contrasting their answer with the expected one; holding a wrong AI message opens a report menu ([Duolingo Max](https://blog.duolingo.com/duolingo-max/))                                                                                                  | Unverified adaptive-difficulty models                                                                                                    |

Repository facts that shape the design:

- `curriculum/catalog.yaml` has 116 items; 17 are `ready`, the rest `coverage` (2026-09-22).
- Prerequisite edges exist only in the route `competency.yaml` files. Coverage items carry no edges, so a full dependency graph is not available. The map must lay out by domain and draw edges only where they are declared.
- `schemas/progress.schema.json` (version 2) already defines learner state and evidence records.
- `labs/` contain `starter`, `tests`, and `solution` files runnable locally. Browser feasibility per lab:

  | Lab                                 | Dependencies                 | In-browser                                                                                                |
  | ----------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
  | `evaluation-harness`                | Python stdlib, `cases.jsonl` | Yes, Pyodide, unchanged                                                                                   |
  | `prompt-injection-boundaries`       | Python stdlib                | Yes, Pyodide, unchanged                                                                                   |
  | `self-attention`                    | `torch>=2.2`                 | Not as written (Pyodide has no PyTorch build); port to NumPy in place, or keep local-only (open decision) |
  | `agentic-design`, `model-selection` | None (written decision labs) | Yes, as a structured form with rubric; no execution                                                       |

## Proposal

### Principles

1. **The repository stays the source of truth.** The site reads YAML at build time and never holds curriculum content of its own. No lesson text is written for the site.
2. **Maturity is visible.** `coverage` nodes render as "mapped, no route yet" with no route page. Only `ready` (and `seeded`, if used) nodes get a learning page.
3. **Progress follows ../docs/LEARNING_MODEL.md.** State changes need an evidence record; reading a source never changes state. Self-reported evidence is labelled `review_method: self`.
4. **Progress is portable.** Browser state imports and exports `progress.yaml` that validates against `schemas/progress.schema.json`.
5. **Drift fails CI.** The site data build runs in `make check`.

### Architecture

```text
curriculum/**/competency.yaml ┐
curriculum/catalog.yaml       ├─ scripts/build_site_data.py ─→ site/src/data/atlas.json
resources/*.yaml              │                                        │
paths/*.md, labs/*            ┘                                        ▼
                                        site/ (Astro, static) ─┐
                                        worker/ (/api/*: SSO, AI proxy, budgets) ─┴─→ Cloudflare Worker ─→ ai-eng.canhta.com
```

- **Data build:** `scripts/build_site_data.py` (Python, reusing the existing loaders and validators) emits one JSON file: nodes, declared edges, routes with resolved source URLs, labs, paths. `--check` mode fails if the committed JSON is stale, following `render_learning_sources.py`.
- **Site:** Astro with React islands only where interaction is needed (map, diagnostic, progress). Static output; no server.
- **Map:** React Flow with ELK layout, grouped by domain lanes, filterable by path (`paths/applied-ai-engineer.md` as the first path).
- **Hosting:** one Cloudflare Worker with static assets serves the built site and the `/api/*` routes on the same origin, custom domain `ai-eng.canhta.com`. Whether to use Workers static assets or Pages is confirmed against current Cloudflare docs at setup; both support `_headers`. Cloudflare over GitHub Pages because in-browser labs need `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers: Pyodide can interrupt runaway code only through [`SharedArrayBuffer`](https://pyodide.org/en/stable/usage/keyboard-interrupts.html), which requires them, and GitHub Pages cannot set custom headers. Cloudflare sets them through a `_headers` file, does not meter static bandwidth (Pyodide downloads are large), and runs the AI proxy in the same deployment.
- **Security headers:** strict Content-Security-Policy and no third-party scripts, so the session cookie and learner input are not exposed to injected code.

### Bilingual content

The curriculum contracts stay in English and remain canonical. Sources keep their original language.

- **UI strings** (navigation, labels, states, instructions): full English and Vietnamese, in `site/src/i18n/{en,vi}.json`.
- **Route text** (`why`, `outcomes`, diagnostic tasks, `pass_condition`, locator `purpose`, practice, exit evidence): Vietnamese lives in `curriculum/<domain>/<route>/competency.vi.yaml`, keyed by the same fields. Each translation file records the hash of the English contract it was translated from.
- **Drift:** `build_site_data.py --check` marks a translation stale when the English hash changes. Stale or missing translations render the English text with a visible "chưa dịch / not yet translated" marker, never a silent machine translation.
- **Review:** a translation may be AI-drafted but must be reviewed by the repository owner before merge (`reviewed_by` field); it adds no new claims beyond the English contract. Additional Vietnamese reviewers can be added later through CONTRIBUTING.md.
- **URLs:** `/en/...` and `/vi/...` via Astro i18n routing; language switch keeps the current page.

### In-browser labs

- **Runtime:** Pyodide in a Web Worker so tests cannot freeze the page; CodeMirror editor preloaded with `starter.py`.
- **Files:** the data build copies each lab's `starter.py`, `tests.py`, and fixtures into the lab bundle. `solution.py` is shipped only because `tests.py` imports it as a reference; the UI hides it behind an explicit "show reference solution" step, recorded in the evidence item as `independence: reference-open` (existing schema value).
- **Evidence:** a passing run offers an `implementation` evidence item with `review_method: automated`, stored in local progress with the result and the learner's code hash in `note`. The learner picks the competency (the tracked items whose relations point at the lab) and the state it supports; the form starts at `learning`, since the lab README lists more than passing tests for `demonstrated`.
- **Decision labs:** `agentic-design` and `model-selection` render their templates as structured forms; the learner self-reviews against the rubric (`review_method: self`). The written answer is exported with progress.
- **`self-attention`:** the one-version rule rules out a NumPy copy next to the PyTorch lab. Options: port the lab to NumPy in place (one lab, runnable locally and in Pyodide), or keep it PyTorch and local-only. Owner decision; the port changes a lab and gets its own review.
- **Runtime (as built):** Pyodide is self-hosted from the npm `pyodide` package under `/pyodide/<version>/` (core and standard library only; `browser.packages` is rejected until packages are hosted too) and loads on the first Run. Stop interrupts through the `SharedArrayBuffer` interrupt buffer; a 20-second wall-clock limit terminates and recreates the worker.
- **Test-to-task mapping:** each browser run returns an Exercism-style result (`pass` / `fail` / `error`, per-test `task_id`), so the UI can show which lab task a failure belongs to. _As built:_ one result per run (the failing assert's file, line, and source, or the error's type, message, and traceback in the lab files); `task_id` needs lab tests grouped by task, which is a lab change.
- **Feedback keys:** known mistakes map to reviewed, parameterized message keys in `en` and `vi` (typed `essential` / `actionable` / `informative`, following Exercism), shown before any AI help. These are written per lab and reviewed like curriculum content.
- **Help ladder:** targeted message → small hint → pointer to the failing assertion → AI lab coach → reference solution. The highest level used is recorded on the evidence item (`independence`: `independent` → `minimal-hints` → `guided` → `reference-open`). Help is never blocked; its use is visible in the evidence.
- **Predict first:** for mechanism-type labs, the learner predicts an output or shape before running (futurecoder pattern); the prediction is stored with the run.
- **Anti-hard-coding:** where a lab's inputs allow it, tests add randomized cases so a passing run reflects the mechanism rather than memorized outputs. This changes lab tests and goes through the lab's review.
- **Contract:** a lab opts in through a `browser:` block in `labs/<id>/lab.yaml` (`runtime`, `editable`, `run`, `reference`, `files`, `packages`). `validate_labs.py` checks it, and `site/scripts/test-labs.mjs` (CI) runs each browser lab under Pyodide in Node: the starter with `solution.py` pasted at its end must pass (the reference defines only the stubs, so it cannot replace `starter.py` outright), and the unmodified starter must give the same result class, file, and line as CPython `python tests.py`, which the script runs itself.

### Interactivity

Interaction must produce practice or evidence. Scrolling and clicking alone do not count as progress.

| Surface                | Interaction                                                                                                                                                                   | Driven by                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Map                    | Pan/zoom, filter by path/domain/state, prerequisite highlight, "what can I start now"                                                                                         | catalog + declared prerequisites + local progress                                           |
| Diagnostic             | Write answers per task, AI follow-up questions, compare against `pass_condition`, choose route branch                                                                         | `diagnostic` block                                                                          |
| Route                  | Per-source checklist of _opened_ items (not counted as progress), inline notes, "explain this locator"                                                                        | `learning_route`                                                                            |
| Experiment playgrounds | Small in-browser tools that run the experiments a route already lists (e.g. chunk size vs retrieval hit rate, tool surface comparison, injection attempts against a boundary) | `experiments` block; each playground needs an RFC entry naming the experiment it implements |
| Labs                   | Editor, run tests, failure diff, hint ladder, bug-injection variants                                                                                                          | `labs/*`                                                                                    |
| Evidence               | Evidence timeline per competency, state history, export                                                                                                                       | progress schema                                                                             |
| Review                 | Daily due list, retrieval prompts, transfer tasks                                                                                                                             | `review_on`, `transfer`                                                                     |

Playgrounds are practice tools for listed experiments, not teaching content. They do not replace the route's sources.

### AI support

AI roles follow the allowed list in AGENTS.md. Every role gets a system prompt built from the route's contract (outcomes, diagnostic, locators, exit evidence, rubric), versioned in the repository as config (the CS50 pattern). It has no side-effecting tools and treats learner-pasted text as untrusted input.

Interaction rules taken from the systems above:

- **Attempt first.** Explanations and hints are offered after the learner submits an answer or runs code, on request (Duolingo, CS50).
- **Scoped actions over open chat.** "Explain this failing test", "explain this locator", "question my diagnostic answer" come before a free-form chat box (CS50).
- **Guide, then escalate.** The tutor starts Socratic and escalates if the learner persists. It does not flatly refuse (Khanmigo, Codecademy).
- **Visible budget.** A per-user question budget that refills over time, enforced by the Worker and shown in the UI. It encourages precise questions and caps spend on the project key (CS50 hearts).
- **Report wrong answers.** Every AI message has a "report as wrong" control; reports are exported with progress and can be filed as an issue (Duolingo, CS50 staff review).
- **Deterministic checks stay deterministic.** Test results, schema checks and next-step logic are computed, and the tutor only explains them (Khanmigo's separate math checker).

| Role                   | What it does                                                                                                                             | Evidence effect                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Diagnostic interviewer | Asks Socratic follow-ups on the learner's diagnostic answers and maps gaps to route steps                                                | Suggests a route branch; the learner records the diagnostic result. Cannot set any state                              |
| Source guide           | Explains _why_ a locator matters and what to look for, points to the exact section, answers questions about a passage the learner pastes | None                                                                                                                  |
| Lab coach              | Reads code and test output, gives graded hints (nudge → concept → pointer to the failing assertion); never produces the solution         | Hint level lowers `independence` (`minimal-hints` / `guided`)                                                         |
| Variation generator    | Produces bug-injected or modified lab variants                                                                                           | A variant is shown only if the reference solution passes and the variant fails under Pyodide                          |
| Evidence reviewer      | Reviews decision-lab write-ups and transfer answers against the explicit rubric, quoting the criterion for each comment                  | Feedback only in Phases 1–2; the learner's own self-review against the rubric is the evidence (`review_method: self`) |
| Review partner         | Runs delayed retrieval from existing diagnostic tasks without showing the source                                                         | Feedback only; `retained` requires the learner's self-review against `pass_condition`                                 |
| Next-step explainer    | Explains the deterministic recommendation in plain language                                                                              | None; the recommendation itself is computed, not generated                                                            |

Access model:

- **Project key, server-side.** The repository owner provides the provider API key as a Worker secret. It never reaches the browser.
- **SSO required for AI.** Learners sign in (OAuth; GitHub and Google as the default providers) before any AI action. Sessions use an HttpOnly cookie on `ai-eng.canhta.com`. Browsing, diagnostics, labs, and local progress work without signing in.
- **Worker responsibilities:** build the prompt server-side from the route contract (the browser sends only the action, route ID, and learner input); enforce per-user and global budgets; block bots before sign-in; stream responses.
- **Storage:** Cloudflare D1 for user records and usage counters only. Learner answers and code are sent to the model provider to produce feedback and are not stored by the site, except messages the learner explicitly reports as wrong. A privacy page states this in both languages.
- **Guardrails are enforceable** because the server owns the prompt. AI output still does not change learner states in this RFC; whether `ai-assisted` or `human-and-ai` evidence may count is decided later from tutor-eval results.
- **Provider:** chosen by the owner and set as config behind a small provider interface, so the model or provider can change without touching the site.
- **Why not Cloudflare Access:** it restricts apps to known users, with a small free seat limit; a public course needs self-service sign-in.
- **Models:** a small fast model for hints and follow-ups, a stronger model for evidence review; model IDs are config, not hard-coded.

Quality control, using the atlas's own `ai.evaluation` practice:

- a versioned set of tutor test cases per route (diagnostic answers at gap/partial/strong levels, lab states, injection attempts);
- outcome metrics adapted from Khanmigo: the rate at which the tutor gives away an answer before the learner attempts, and whether a learner coached on one case can solve a held-out case without help;
- checks that the lab coach never emits code that passes the lab tests (run under Pyodide), that reviewers cite rubric criteria, and that the interviewer does not introduce claims absent from the contract or sources;
- the eval set runs in CI against recorded outputs, with a live run before prompt or model changes.

### Phases

**Phase 0 — Data layer**

- `build_site_data.py` with `--write` / `--check`.
- JSON schema for the emitted file under `schemas/`.
- Wire `site-data` into `make check` and `.github/workflows/ci.yml`.

Exit: CI fails when a competency changes without regenerating site data.

**Phase 1 — Static atlas (first public release)**

- Home: what the atlas is, maturity counts (ready vs coverage), where to start.
- Map: all catalog nodes by domain; ready nodes clickable; declared prerequisite edges.
- Competency page for each ready route: why, prerequisites with bridges, outcomes, diagnostic, learning route (source, locator, purpose, link), practice, exit evidence, transfer, linked lab.
- Path page for Applied AI Engineer.
- Progress in `localStorage`; import/export `progress.yaml`; per-node state badge from `current_state`.

- English and Vietnamese UI; route pages fall back to English with a marker where no reviewed translation exists.

Exit: every ready route is reachable from the map in both languages, every source link resolves, a learner can export a schema-valid `progress.yaml`.

**Phase 1b — In-browser labs**

- Pyodide worker, editor, run-tests button, test output panel.
- `evaluation-harness` and `prompt-injection-boundaries` runnable in the browser.
- `self-attention` in the browser if the owner chooses the in-place NumPy port.
- `agentic-design` and `model-selection` as rubric forms.
- Lab runs recorded as evidence in local progress.

Exit: all three code labs pass against their reference solutions in the browser and in the CI Pyodide job; a failing starter shows the same failures as `python tests.py` locally.

**Phase 2 — Diagnostic, next step, and AI tutor**

- Worker with SSO sign-in, AI proxy, budgets, and D1; privacy page.
- AI roles above behind sign-in; tutor evaluation set in CI.
- First two experiment playgrounds, chosen from ready routes with existing `experiments` entries.

- Diagnostic flow: learner writes answers per task, then sees the `pass_condition` and records a self-assessed result as a `diagnostic` evidence item. Passing routes the learner past mental-model sources to practice.
- Next-step recommendation from declared prerequisites and current states; surface `prerequisite_support` bridges for coverage-only prerequisites.
- Delayed review queue using `ts-fsrs`, driven by `review_on`, with prompts taken from existing diagnostic tasks only.

Exit: the recommendation for a given `progress.yaml` is deterministic and covered by tests.

**Phase 3 — Verified evidence (separate RFC before starting)**

- GitHub sign-in; learner forks a lab template; GitHub Actions runs lab `tests.*`; the site reads the result and records `review_method: automated`.
- Peer or mentor review against `assessments/evidence-rubric.md` for design-judgment evidence.
- Optional progress sync to the signed-in account.

This phase extends the Phase 2 Worker with stored evidence and is out of scope for this RFC beyond naming it.

### Defaults (change if the owner disagrees)

- Vietnamese translations of route text are added route by route after Phase 1 ships; v1 may launch with UI strings only.
- No analytics or tracking. The only cookie is the session cookie for signed-in AI use.

## Alternatives considered

- **Docusaurus / MkDocs Material.** Good for docs, weaker for a custom interactive map and client state. Astro keeps pages static and adds islands only where needed.
- **GitHub Pages.** Simplest hosting, but it cannot send the cross-origin isolation headers Pyodide needs to interrupt code. A service-worker shim could work around this but adds fragility.
- **Open AI chat as the main tutor surface.** Rejected in favor of scoped actions after an attempt; open chat invites answer-seeking and is harder to evaluate.
- **Separate site repository.** Loses the `make check` guarantee that site and contracts agree; revisit only if site CI becomes slow.
- **Bring-your-own-key AI in the browser.** No server cost, but the learner controls the prompt, so guardrails and budgets cannot be enforced, and every page that handles a key becomes an XSS target. Replaced by a project key behind SSO.
- **Full backend from the start.** Only the AI proxy needs a server in Phase 2; progress stays local-first until Phase 3.
- **Generating lesson pages for coverage nodes.** Rejected by AGENTS.md; coverage stays visibly incomplete.

## Impact

- affected competencies: none; no curriculum content changes.
- resource changes: none; resource URLs are read, not edited.
- new files: `site/`, `worker/`, `scripts/build_site_data.py`, `schemas/site-data.schema.json`, `schemas/competency-translation.schema.json`, per-lab browser metadata and feedback keys, tutor prompt config and eval set.
- modified files: `Makefile`, `.github/workflows/ci.yml`, `scripts/validate_labs.py`, `README.md` (link to the site), `CONTRIBUTING.md` (translation and browser-lab rules).
- generated-document impact: `site/src/data/atlas.json` becomes a checked generated file.

## Open questions

- Should `seeded` routes appear with a "draft" label in v1, or stay hidden until ready?
- Should the map show coverage nodes by default, or only behind a "show full coverage map" toggle?
- Should decision-lab answers ever leave the browser (e.g. shared for peer review), or stay local until Phase 3?
- Which model provider and model IDs does the project key use?
- SSO providers: GitHub and Google, or others (e.g. Microsoft)?
- Budget numbers: questions per user per day, and a global monthly spending cap.

## Review checklist

- [ ] Evidence is traceable.
- [ ] No curriculum content is generated for the site.
- [ ] Phase exit criteria are testable.
- [ ] Coverage vs ready is represented truthfully in the UI.
- [ ] Progress export validates against `schemas/progress.schema.json`.
- [ ] Translations are reviewed, hash-linked to the English contract, and never presented as canonical.
- [ ] Browser labs run the same `tests.py` as the local labs.
- [ ] Every AI role maps to an allowed use in AGENTS.md and cannot be the sole evidence for a subjective state.
- [ ] Every playground names the `experiments` entry it implements.
