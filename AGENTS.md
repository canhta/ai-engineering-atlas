# AGENTS.md

Guidance for AI agents and coding assistants working in this repository.

## Read first

Before changing curriculum, assessments, learning routes, labs, projects, or public-facing learning content, read:

1. [LEARNING_MODEL.md](LEARNING_MODEL.md)
2. [CURRICULUM.md](CURRICULUM.md)
3. [CONTRIBUTING.md](CONTRIBUTING.md)

The learning model takes precedence over folder conventions.

Do not create content merely because a directory or schema field exists.

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

If these questions cannot be answered from reviewed sources, mark the competency incomplete rather than filling the gap with model-generated material.

## Reference systems

Use these as design references, but extract their learning mechanisms rather than copying their surface layout.

- OSSU Computer Science — independent curriculum standards, prerequisites, alternate assessments, curriculum governance, final-project consolidation
- Microsoft learning repositories — scenario, learning goals, explanation, assignment, solution, knowledge check, challenge, next step
- Made With ML — problem framing, one evolving system, evaluation, testing, production, feedback and iteration
- roadmap.sh — learner navigation, progress UX, skill-gap and AI-assistance patterns
- mlabonne/llm-course — resource discovery and concise technical maps

Other high-quality sources may be used when they are more authoritative for a competency.

## Curriculum content

AI must not infer required curriculum content solely from general model knowledge.

When adding or changing a competency:

1. Gather curriculum evidence.
2. Define the observable capability.
3. Identify prerequisites.
4. Decide the competency type and appropriate evidence.
5. Design a diagnostic that can reveal prior knowledge.
6. Select a precise learning route through real sources.
7. Select or design practice.
8. Define exit evidence.
9. Add transfer, project integration, or delayed review when the competency requires them.
10. Check for overlap with existing competencies.
11. Use an RFC for substantial changes.

Do not equate "covered by a book/course" with "learned."

## Source rules

Prefer precise source locations over broad recommendations.

Bad:

- "Read Stanford CS336."
- "Read AI Engineering."
- "Watch 3Blue1Brown."

Better:

- exact chapter;
- exact lecture;
- exact section;
- exact assignment;
- exact visual segment;
- exact production case or standard.

The repository should route learners through sources rather than become an AI-written substitute for those sources.

## Assessment rules

Assessment must match the capability type.

- Concept → explain, distinguish, calculate, recall
- Mechanism → trace, visualize, implement, predict
- Engineering skill → build, test, debug, modify
- System operation → configure, observe, recover, automate
- Design judgment → compare alternatives and defend a decision under constraints
- Production competency → ship, measure, detect failure, mitigate, rollback or improve

Do not use a generic quiz as the exit test for an engineering or production competency.

Passing an immediate exit test means demonstrated, not automatically retained or applied.

## Adaptive guidance

Do not force all learners through the same instruction.

When prior knowledge is low, prefer worked examples, visual explanation, guided tasks, and immediate feedback.

When knowledge is partial, prefer targeted reading, completion tasks, debugging, and comparison.

When knowledge is strong, prefer diagnostics, independent implementation, transfer tasks, trade-off analysis, and failure investigation.

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
- use an opaque LLM judgment as the sole evidence for important subjective assessments;
- generate full lesson content and then cite itself as the source.

## Public-facing writing

Before changing README files, landing pages, metadata, or contribution docs, study comparable open-source repositories and reuse established conventions where appropriate.

Prefer:

- concrete descriptions;
- short introductions;
- clear navigation;
- tables and indexes;
- real links;
- verifiable claims.

Avoid:

- manifesto language;
- marketing superlatives;
- generic AI-generated prose;
- repeated "not X, but Y" constructions;
- decorative diagrams with no learning or navigation value;
- empty directories created only to make the repository look complete.

Detailed policy belongs in dedicated files rather than the root README.

## Before committing

Check:

- Does this change follow LEARNING_MODEL.md?
- Is the competency evidence-based?
- Is the learning route precise enough to start immediately?
- Does practice match the capability?
- Does assessment measure the stated outcome?
- Did I distinguish demonstrated, transferred, retained, and applied evidence?
- Did I avoid generating content merely to fill a template?
- Is public wording concrete and restrained?

If not, revise before committing.
