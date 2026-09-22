# Versioning

AI Engineering Atlas versions **curriculum meaning** separately from routine repository edits.

The policy is inspired by the way OSSU treats curriculum changes as more important than presentation changes.

## Version shape

Use semantic-style versions:

```text
MAJOR.MINOR.PATCH
```

The current version is recorded in [curriculum/manifest.yaml](../curriculum/manifest.yaml).

## MAJOR

Use a major version when the expected capability graph materially changes.

Examples:

- adding or removing a required domain for the main path;
- redefining the meaning of an existing competency;
- changing target depth in a way that changes what learners must demonstrate;
- changing prerequisite structure enough to alter the intended progression;
- changing the evidence model in a backward-incompatible way.

A major version means an existing learner record may need migration or reinterpretation.

## MINOR

Use a minor version when the curriculum remains compatible but a learning route meaningfully improves.

Examples:

- promoting coverage to a ready route;
- replacing or adding a primary teaching source;
- adding a new lab, assessment, transfer task, or project integration;
- adding an optional competency/specialization without redefining existing required outcomes;
- changing a route while preserving the same competency meaning and target depth.

Existing evidence remains interpretable.

## PATCH

Use a patch version for changes that do not alter learning expectations.

Examples:

- broken links;
- wording/formatting;
- source metadata/freshness updates;
- typo fixes;
- CI/tooling changes;
- generated-status updates;
- presentation/navigation changes.

## Resource changes versus curriculum changes

A competency is the capability. A resource is one route to that capability.

Replacing a book, lecture, or article should normally be a MINOR or PATCH change depending on learner impact, not a MAJOR change, as long as outcomes/prerequisites/evidence stay stable.

## Release checklist

Before publishing a curriculum release:

1. `make check` is green;
2. [curriculum/STATUS.md](../curriculum/STATUS.md) matches the catalog;
3. ready-route sources are within their review intervals;
4. CHANGELOG entries describe learner-facing changes;
5. migrations are documented if evidence/progress semantics changed;
6. tag the commit only after the release state is internally consistent.

Do not create a release solely because many files changed.
