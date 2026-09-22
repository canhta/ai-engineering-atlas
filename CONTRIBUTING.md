# Contributing

Contributions are welcome while the curriculum is being built.

Before contributing to curriculum or learning content, read:

1. [docs/LEARNING_MODEL.md](docs/LEARNING_MODEL.md)
2. [docs/CURRICULUM.md](docs/CURRICULUM.md)
3. [curriculum/catalog.yaml](curriculum/catalog.yaml)
4. [AGENTS.md](AGENTS.md) if using an AI assistant

## The contribution model

Keep these layers separate:

- **Catalog competency** — stable capability ID and domain placement.
- **Ready route** — diagnostic, precise sources, practice, and evidence for a catalog competency.
- **Resource** — external material used for a learning function.
- **Assessment evidence** — work that proves an outcome.
- **Learner state** — demonstrated, transferred, retained, applied, etc.

A popular resource is not automatically a competency. Completing a resource is not automatically evidence of mastery.

## Adding curriculum coverage

If a capability belongs in the roadmap but does not yet have a complete route:

1. check that it is not already represented in `curriculum/catalog.yaml`;
2. gather curriculum/industry evidence;
3. propose a stable ID, title, domain, and placement;
4. add it as **coverage**;
5. do not create placeholder lesson files merely to make it appear complete.

Substantive catalog additions should use an RFC. Curriculum RFCs are numbered from `0001`; system RFCs (site, tooling, infrastructure) use the `0000-` prefix, next to the template.

## Promoting coverage to a ready route

A catalog item may become **ready** when it has:

- observable outcomes;
- prerequisites using catalog IDs;
- prerequisite bridges for any prerequisite that is still coverage-only;
- a diagnostic;
- exact source locators;
- practice matching the capability;
- exit evidence;
- transfer when required;
- delayed review when required;
- project integration when required;
- learner-facing README;
- passing repository validation.

The golden examples are:

- [Self-Attention](curriculum/06-llm-foundations/self-attention/)
- [AI Evaluation and Experimentation](curriculum/07-ai-engineering/evaluation/)

## Learner-facing source links

For every `seeded` or `ready` competency, the learner README contains a generated **Learning sources** block derived from:

- `learning_route.mental_model`;
- `prerequisite_support`;
- the canonical URLs in `resources/*.yaml`.

Do not maintain that block by hand. After changing a source, locator, purpose, prerequisite bridge, or resource URL, run:

```bash
python scripts/render_learning_sources.py --write
```

Then run `make check`. CI fails when the learner-facing block is missing or stale.

The goal is that a learner can open a route and immediately see **what source to open, exactly what to read, and why it is there** without reading YAML.

## Web atlas data

The web atlas in `site/` reads one generated file, `site/src/data/atlas.json`: the content model defined in the [content model RFC](rfcs/0000-content-model.md) and [schemas/site-data.schema.json](schemas/site-data.schema.json). It is compiled from the catalog, competency contracts, resources, labs, projects, and paths. Do not edit it by hand. After changing any of those sources, run:

```bash
python scripts/build_site_data.py --write
```

[curriculum/presentation.yaml](curriculum/presentation.yaml) decides how content appears: collections, fields and their vocabularies, and the ordered page blocks with English and Vietnamese titles. When you add a field to `competency.yaml`, either map it to a block there or list it under `ignore`. An unmapped field still renders as a generic `data` block, and the build prints a warning naming it. The build fails on a stale file, an unknown block type, an unresolved reference, or a value missing from its vocabulary.

Domain titles come from `title` in [curriculum/manifest.yaml](curriculum/manifest.yaml). See the [web atlas RFC](rfcs/0000-interactive-web-atlas.md) for the site design.

## Proposing a resource

Include:

- canonical URL;
- author or organization;
- exact chapter, section, lecture, assignment, or documentation page when possible;
- competency it supports;
- role: curriculum evidence, teaching, visual, practice, assessment, production reference, or benchmark;
- why it improves the current route;
- availability/freshness notes.

Prefer official course pages, textbooks, documentation, papers, author repositories, maintained engineering references, and primary sources where practical.

## Assessment contributions

Assessment should match the capability.

Examples:

- concept → explain, distinguish, calculate;
- mechanism → trace, visualize, implement;
- engineering skill → build, test, debug;
- system operation → configure, observe, recover;
- design judgment → compare alternatives under constraints;
- production skill → ship, observe, diagnose, mitigate.

Avoid generic quizzes as the only evidence for engineering competencies.

## Project contributions

Reference projects should create integration pressure, not act as giant tutorials.

A milestone should identify:

- problem/constraint;
- baseline or previous state;
- change being introduced;
- measurement;
- failure work;
- resulting evidence or decision.

Prefer extending an existing reference system when it creates a useful learning progression.

## Pull requests

Keep pull requests focused.

For learner-facing changes, describe how the change affects:

- diagnosis;
- learning;
- practice;
- evidence;
- transfer;
- retention;
- project integration.

Run:

```bash
make check
```

before opening a PR.

For curriculum release semantics, see [docs/VERSIONING.md](docs/VERSIONING.md).

## Writing and layout

Follow [AGENTS.md](AGENTS.md).

Public-facing documentation should be concise, navigable, source-based, and explicit about maturity. Coverage should never be presented as a completed learning route.
