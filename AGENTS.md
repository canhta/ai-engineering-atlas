# AGENTS.md

Guidance for AI agents and coding assistants working in this repository.

## Read first

Before changing curriculum, assessments, learning routes, labs, projects, resources, or public-facing learning content, read:

1. [docs/LEARNING_MODEL.md](docs/LEARNING_MODEL.md)
2. [docs/CURRICULUM.md](docs/CURRICULUM.md)
3. [curriculum/catalog.yaml](curriculum/catalog.yaml)
4. [CONTRIBUTING.md](CONTRIBUTING.md)

The learning model takes precedence over folder conventions.

For work under `site/` (web atlas, Cloudflare Worker), read [site/AGENTS.md](site/AGENTS.md) first.

For any Vietnamese text, follow [docs/VIETNAMESE_STYLE.md](docs/VIETNAMESE_STYLE.md).

## Commands

`make check` (curriculum and docs, Python only), `make site-check` (the web atlas), `make format` and `make lint` (ruff for Python; prettier and eslint for everything else), `make hooks` (install the git hooks: formatters on commit, `make check` on push). Dependencies: `pip install -r requirements-dev.txt`, and `pnpm install` in `site/`.

Do not create content merely because a directory or schema field exists.

## One version of everything

Each doc, schema, content model, page, component, and lab exists in one version. A change replaces the old version in place and updates every caller in the same change: no `v1`/`v2` side by side, no legacy or deprecated copies, no compatibility shims, no parallel variants. History lives in git.

## Core principle

The repository is organized around **demonstrated capability and the learner lifecycle**, not around collecting topics or generating lessons.

A curriculum change must answer:

- What capability should the learner gain?
- Why does it belong in the roadmap?
- What prior knowledge is required?
- How can existing competence be diagnosed?
- What source teaches the missing mental model?
- What practice produces the skill?
- What evidence proves the outcome?
- Does transfer, delayed retrieval, or project integration matter?

If these questions cannot be answered from reviewed sources, keep the item at **coverage** status rather than filling the gap with model-generated material.

## Catalog-first rule

[curriculum/catalog.yaml](curriculum/catalog.yaml) is the canonical registry of competency IDs.

Before adding a prerequisite, project reference, progress reference, or ready route:

1. search the catalog for an existing competency;
2. reuse the existing stable ID when the capability is already represented;
3. if genuinely missing, add a **coverage** item with evidence through the RFC process;
4. only promote it to **ready** when the full learning-route contract is satisfied.

Never create prerequisite IDs ad hoc inside a competency file.

Never mark a catalog item ready merely because a README was written.

## Reference systems

Use these as design references, but extract their learning mechanisms rather than copying their surface layout.

- OSSU Computer Science — independent curriculum standards, prerequisites, alternate assessments, curriculum governance, final-project consolidation
- Microsoft ML / GenAI learning repositories — pre-assessment, scenario, goals, activities, project, assignment, feedback, challenge, post-assessment, progress rubric
- Made With ML — problem framing, one evolving system, evaluation, testing, production, feedback and iteration
- roadmap.sh — learner navigation, progress UX, skill-gap and AI-assistance patterns
- mlabonne/llm-course — resource discovery and concise technical maps

Other high-quality sources may be used when they are more authoritative for a competency.

## Curriculum workflow

Answer the questions above from reviewed sources, then:

1. check the catalog for overlap and take prerequisite IDs from it;
2. give every coverage-only prerequisite of a ready route a bridge with a diagnostic and a verified source locator;
3. write the contract in this order: capability, diagnostic, learning route, practice, exit evidence, transfer or review;
4. open an RFC for substantive changes;
5. run `make check`.

Do not equate "covered by a book/course" with "learned."

## Source rules

Locate the source exactly: chapter, lecture, section, assignment, visual segment, production case, or standard. "Read Stanford CS336", "Read AI Engineering", and "Watch 3Blue1Brown" are not learning routes.

For a ready route, verify the locator against the source before committing it.

The repository should route learners through sources rather than become an AI-written substitute for those sources.

## Learner-facing source rendering

A precise locator in `competency.yaml` is not enough if the learner README does not expose it.

For every `seeded` or `ready` route:

1. keep source IDs, exact locators, and purposes in the competency contract;
2. keep canonical source URLs in `resources/*.yaml`;
3. run `python scripts/render_learning_sources.py --write` after changing either layer;
4. do not hand-edit content between the generated `learning-sources` markers;
5. ensure `make check` passes so source-link drift cannot reach `main`.

The learner-facing result must answer: **what do I open, what exactly do I read, and why?**

## Practice packaging

Practice should match the capability. A lab, where one helps, gives a clear task, starter state, runnable checks, failure or debugging work, a transfer challenge where relevant, and a reference solution that is not the default path.

Do not create an empty lab directory to satisfy a template.

## Assessment rules

Assessment must match the capability type.

- Concept → explain, distinguish, calculate, recall
- Mechanism → trace, visualize, implement, predict
- Engineering skill → build, test, debug, modify
- System operation → configure, observe, recover, automate
- Design judgment → compare alternatives and defend a decision under constraints
- Production competency → ship, measure, detect failure, mitigate, rollback or improve

Do not use a generic quiz as the exit test for an engineering or production competency.

Passing an immediate exit test means demonstrated, not automatically transferred, retained, or applied.

Use [assessments/evidence-rubric.md](assessments/evidence-rubric.md) when reviewing learner evidence.

## Adaptive guidance

Do not force all learners through the same instruction.

- Low prior knowledge: worked examples, visual explanation, guided tasks, immediate feedback.
- Partial: targeted reading, completion tasks, debugging, comparison.
- Strong: diagnostics, independent implementation, transfer tasks, trade-off analysis, failure investigation.

## AI assistance

AI may:

- extract structure from sources;
- classify and map resources;
- explain approved source material;
- ask diagnostic or Socratic questions;
- generate constrained practice variations;
- inject bugs and failure cases;
- review code and reasoning against explicit criteria;
- recommend the next competency from prerequisites and learner evidence;
- support delayed retrieval and review;
- propose curriculum changes through an RFC.

AI must not:

- silently invent competencies;
- fabricate source coverage;
- create authoritative learning objectives without evidence;
- mark learning complete because material was consumed;
- treat self-reported confidence as mastery;
- use opaque LLM judgment as the sole evidence for important subjective assessments;
- generate full lesson content and then cite itself as the source;
- promote a coverage node to ready without the complete contract.

## Public-facing writing

Before changing README files, landing pages, metadata, or contribution docs, study comparable open-source repositories and reuse established conventions where appropriate.

Write concretely: short introductions, clear navigation, tables and indexes, real links, verifiable claims, explicit maturity and status.

Avoid manifesto language, marketing superlatives, generic AI-generated prose, repeated "not X, but Y" constructions, decorative diagrams that carry no learning or navigation value, empty directories that make the repository look complete, and coverage nodes presented as finished lessons.

## Before committing

- `make check` passes.
- Every rule above that the change touches is met, in particular: catalog IDs, verified locators, bridges for coverage-only prerequisites, assessment matching the capability type, and maturity stated truthfully.
- A promotion, demotion, catalog addition or removal, or lab addition or removal appends its dated event to `curriculum/changelog.yaml` (catalog changes name their Accepted RFC).
- Nothing was generated merely to fill a template.

If not, revise before committing.
