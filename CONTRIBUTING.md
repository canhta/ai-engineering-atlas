# Contributing

Contributions are welcome while the curriculum is being built.

Before contributing to curriculum or learning content, read:

1. [LEARNING_MODEL.md](LEARNING_MODEL.md)
2. [CURRICULUM.md](CURRICULUM.md)
3. [AGENTS.md](AGENTS.md) if using an AI assistant

## What a curriculum contribution must preserve

Keep these separate:

- **Competency** — what the learner should be able to do.
- **Learning route** — the precise source material used to build the missing mental model.
- **Practice** — work that develops the skill.
- **Assessment evidence** — work that proves the outcome.
- **Learner state** — evidence such as demonstrated, transferred, retained, or applied.

A popular resource is not automatically a competency. Completing a resource is not automatically evidence of mastery.

## Proposing a competency

A strong proposal should include:

- the capability that is missing;
- why it belongs in the roadmap;
- supporting curriculum or industry evidence;
- prerequisites;
- competency type;
- target depth;
- diagnostic idea;
- precise learning sources;
- practice appropriate to the skill;
- exit evidence;
- transfer, project integration, or delayed review when relevant.

If these pieces are not yet known, an RFC may remain incomplete rather than filling them with generated content.

## Proposing a resource

Include:

- title and URL;
- author or organization;
- exact chapter, section, lecture, or assignment when possible;
- competency it supports;
- role: curriculum evidence, teaching, visual, practice, assessment, production reference, or benchmark;
- why it improves the current learning route.

Prefer official course pages, textbooks, documentation, papers, author repositories, maintained engineering references, and primary sources where practical.

## Assessment contributions

Assessment should match the capability.

Examples:

- concept → explain, distinguish, calculate;
- mechanism → trace, visualize, implement;
- engineering skill → build, test, debug;
- design judgment → compare alternatives under constraints;
- production skill → ship, observe, diagnose, mitigate.

Avoid generic quizzes as the only evidence for engineering competencies.

## Substantive curriculum changes

Open an RFC before a large pull request when changing:

- required competencies;
- prerequisites;
- target level;
- observable outcomes;
- required evidence.

Resource replacements normally do not require an RFC unless they change the expected capability.

## Pull requests

Keep pull requests focused.

A resource mapping, curriculum change, assessment design, and repository refactor should be separate when they can be reviewed independently.

For learner-facing changes, describe how the change affects the lifecycle:

- diagnosis;
- learning;
- practice;
- evidence;
- transfer;
- retention;
- project integration.

## Writing and layout

Follow [AGENTS.md](AGENTS.md).

Public-facing documentation should be concise, navigable, source-based, and free of generic promotional copy.
