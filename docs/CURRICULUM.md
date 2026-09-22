# Curriculum

AI Engineering Atlas separates the curriculum into layers so coverage, teaching material, and learner evidence do not collapse into one file.

The learning lifecycle is defined in [LEARNING_MODEL.md](LEARNING_MODEL.md).

## Curriculum layers

### 1. Domain manifest

[curriculum/manifest.yaml](../curriculum/manifest.yaml) defines the broad domains and default depth.

### 2. Competency catalog

[curriculum/catalog.yaml](../curriculum/catalog.yaml) is the canonical registry of stable competency IDs.

A catalog item may be:

- **coverage** — it belongs in the audited roadmap but does not yet have a complete learning route;
- **ready** — it has a lifecycle-based competency package that satisfies the repository contract.

This allows prerequisites and projects to reference a stable graph without pretending every node is already a finished lesson.

### Coverage provenance

`coverage` means the capability is part of the maintained scope map. It does **not** mean the repository already has precise per-node teaching sources, assessments, or normalized curriculum evidence for that item.

Do not use a coverage node as proof that a topic is required at a particular depth.

Before promotion to `ready`, the route must record traceable `curriculum_evidence`, exact learning-source locators, and matching practice/evidence. If source review shows that a coverage node is redundant, misplaced, or unsupported, change the catalog through the RFC process rather than inventing a route to preserve it.

### 3. Ready competency package

A ready competency has its own folder with `competency.yaml` and learner-facing `README.md`.

It should define:

- why the capability belongs in the curriculum;
- competency type;
- target level and evidence states;
- prerequisites using catalog IDs;
- observable outcomes;
- diagnostic;
- precise source route;
- guided/independent practice;
- experiments or failure work when appropriate;
- exit evidence;
- transfer when relevant;
- delayed retrieval when relevant;
- project integration when relevant.

### 4. Resource registry

[resources/](../resources/) identifies external sources.

The exact chapter, lecture, assignment, or documentation locator belongs in the competency route.

## Competency levels

| Level | Expected capability                                                              |
| ----- | -------------------------------------------------------------------------------- |
| L0    | Recognize the concept and its purpose                                            |
| L1    | Explain, distinguish, and reason about common use cases and trade-offs           |
| L2    | Perform the skill and diagnose common failures                                   |
| L3    | Transfer the skill, design under constraints, compare alternatives, and optimize |
| L4    | Reproduce, extend, deeply optimize, or teach specialist techniques               |

These levels describe capability depth. Retention and real-system application are tracked separately.

## Evidence states

Learner evidence may move through:

```text
unassessed → gap → learning → demonstrated → transferred → retained → applied
```

Not every competency needs the final state. Role and target depth determine how far evidence must go.

## Curriculum versus resources

The competency describes the capability.

Books, lectures, papers, assignments, visuals, and repositories are resources used to build or assess that capability.

Replacing a resource should not silently redefine the competency.

## Curriculum changes

Use a curriculum RFC when proposing:

- adding/removing a catalog competency;
- changing domain placement;
- changing prerequisites;
- changing target depth;
- changing observable outcomes;
- changing required evidence.

Resource replacements normally do not require a curriculum change unless they alter what the learner is expected to know or do.

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [rfcs/0000-template.md](../rfcs/0000-template.md).
