# Start Here

AI Engineering Atlas is designed for learners who already have uneven experience across software engineering, ML, and modern AI.

Do not start by reading the curriculum from top to bottom.

## 1. Choose a target

Write down the kind of work you want to be able to do over the next 3-6 months.

Examples:

- build reliable AI product features;
- own RAG and search quality;
- design and evaluate agent workflows;
- move from AI prototypes to production systems;
- deepen model and inference understanding.

Your target affects depth and ordering. It does not change what a competency means.

## 2. Run the baseline scan

Use [assessments/baseline.md](assessments/baseline.md).

The scan is intentionally broad. Its job is not to produce a score. Its job is to answer:

> Which areas can I already demonstrate, and where should I investigate a gap?

For strong areas, move directly to competency diagnostics. For weak areas, start from the domain page and prerequisites.

## 3. Create your learner record

If you want to track progress in Git:

1. copy [progress/profile.example.yaml](progress/profile.example.yaml) to a file in your fork;
2. copy [progress/progress.example.yaml](progress/progress.example.yaml);
3. record evidence, not hours watched.

The core states are:

```text
unassessed → gap → learning → demonstrated → transferred → retained → applied
```

See [progress/README.md](progress/README.md).

## 4. Pick one gap

Do not select "RAG" or "LLMs" as a learning task if the real gap is smaller.

Prefer:

- reranking;
- retrieval evaluation;
- causal masking;
- model selection under latency constraints;
- tool retry semantics;
- prompt-injection boundaries.

Browse the human-readable [Roadmap](ROADMAP.md) first. Check [Curriculum Status](curriculum/STATUS.md) to see which topics currently have complete learning routes.

The machine-readable [competency catalog](curriculum/catalog.yaml) provides stable IDs for progress/tooling, but learners should not need to browse raw YAML to choose what to study.

Coverage nodes are part of the audited roadmap but may not yet have a complete learning route. If a ready route depends on one of those coverage-only prerequisites, the route provides a **prerequisite bridge**: a quick diagnostic plus a precise source section for patching only the blocking gap.

## 5. Follow the learning route

A ready competency should tell you:

- why the capability matters;
- what you need first;
- exact source sections;
- what to practice;
- what to measure or break;
- what evidence is needed to exit;
- whether transfer, delayed recall, or project integration is required.

The source is there to build the missing mental model. Consuming the source is not the goal.

## 6. Produce evidence

Use [assessments/evidence-rubric.md](assessments/evidence-rubric.md).

Good evidence is inspectable:

- code;
- tests;
- benchmark output;
- experiment notes;
- architecture decision;
- failure analysis;
- trace;
- incident write-up;
- explanation recorded without notes.

Confidence alone is not evidence.

## 7. Integrate important skills into a project

Two reference projects carry competencies across multiple domains:

- [Tiny Transformer](projects/tiny-transformer/) — model internals and inference foundations;
- [Knowledge Assistant](projects/knowledge-assistant/) — retrieval, evaluation, agents, and production engineering.

These projects evolve over time. They are not tutorials to copy line by line.

## 8. Revisit after a delay

For important competencies, attempt retrieval before rereading.

Ask:

- Can I reconstruct the mechanism?
- Can I solve a variant?
- Can I still debug it?
- Have I used it inside a larger system?

A passing exit test today is "demonstrated." It is not automatically "retained" or "applied."

## 9. Review the learning cycle

After a meaningful cluster of work — several related competencies, a major project milestone, or roughly 6-12 weeks — run a [portfolio review](assessments/portfolio-review.md).

Use it to decide:

- which state transitions are supported by evidence;
- where transfer still fails;
- what complexity you correctly rejected;
- what the next 1-3 gaps should be.

Then begin the next cycle.

## Suggested first session

If you are new to the repository:

1. 10 min — define your target;
2. 45-90 min — baseline scan;
3. 15 min — create your progress record;
4. pick one gap;
5. run that competency's diagnostic;
6. only then open the learning source.

The goal of the first session is a useful learning decision, not content consumption.
