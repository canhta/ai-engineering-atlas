# Contributing

Contributions are welcome while the curriculum is being built.

Before contributing to curriculum or learning content, read:

1. [LEARNING_MODEL.md](LEARNING_MODEL.md)
2. [CURRICULUM.md](CURRICULUM.md)
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

Substantive catalog additions should use an RFC.

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

For curriculum release semantics, see [VERSIONING.md](VERSIONING.md).

## Writing and layout

Follow [AGENTS.md](AGENTS.md).

Public-facing documentation should be concise, navigable, source-based, and explicit about maturity. Coverage should never be presented as a completed learning route.
