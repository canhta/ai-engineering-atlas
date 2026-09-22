# AI Evaluation and Experimentation

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

AI systems are probabilistic and compound. A single average score rarely tells you whether a change is better, which component failed, or whether the system is safe to release.

The capability is not "know evaluation metrics." It is the ability to turn a product or system objective into repeatable evidence and a release decision.

## 1. Diagnostic first

Without reading the sources, design an evaluation for one change to a prompt, retriever, model, or agent.

Your design should answer:

- what success means;
- what data represents the task;
- what is evaluated at component level;
- what is evaluated end to end;
- what needs repeated runs;
- how failures are categorized;
- which latency or cost constraints matter;
- what result blocks a release.

If you can already do this concretely, move directly to the lab and transfer task.

## 2. Mental model

Primary route:

- Chip Huyen, *AI Engineering*:
  - [Chapter 3 — Evaluation Methodology](https://github.com/chiphuyen/aie-book/blob/main/ToC.md#3-evaluation-methodology)
  - Chapter 4 — **Design Your Evaluation Pipeline**: evaluate components, create guidelines, define methods and data.
- [Made With ML — Evaluation](https://madewithml.com/courses/mlops/evaluation/):
  - overall evaluation;
  - per-class evaluation;
  - slices;
  - behavioral testing;
  - online/production evaluation.

The two sources serve different functions: Chip Huyen gives the foundation-model evaluation framework; Made With ML shows the progression from aggregate metrics to engineering failure analysis.

## 3. Guided practice

Take an AI feature you already know and create an evaluation matrix:

| Item | Question |
| --- | --- |
| Objective | What behavior are we trying to improve? |
| Unit | Output, retrieval result, trajectory, latency event, etc.? |
| Data | What examples represent real use? |
| Metric | What measurement matches the objective? |
| Failure taxonomy | How will failures be grouped? |
| Operational constraints | Latency, cost, reliability? |
| Gate | What blocks release? |

## 4. Independent lab

Complete the [Evaluation Harness Lab](../../../labs/evaluation-harness/).

It includes:

- a small versioned eval set;
- starter harness;
- contract tests;
- reference implementation;
- slice comparison;
- release-gate task;
- regression-case task;
- agent-evaluation transfer challenge.

The fixture is intentionally small. Part of the exercise is identifying why it is insufficient for a real product.

## 5. Exit evidence

You are at **demonstrated** when you can:

- version an evaluation set;
- choose metrics from the system objective rather than convenience;
- evaluate important components separately;
- compare changes repeatably;
- analyze failures beyond aggregate scores;
- define a release gate with quality and operational constraints.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 6. Transfer

Now evaluate an agent workflow.

Your design must include evidence about actions or trajectory — tool selection, arguments, retries, authorization, or recovery — rather than only the final answer.

Passing this moves the competency toward **transferred**.

## 7. Applied evidence

The strongest evidence is using evaluation to make a real decision:

- catch a regression;
- reject a release;
- change a retrieval or model choice;
- convert a production failure into a durable regression case.

The [Knowledge Assistant](../../../projects/knowledge-assistant/) supplies a reference system for this.

## 8. Delayed review

After a delay, reconstruct:

```text
product objective
→ evaluation unit
→ representative data
→ metric / judge
→ failure analysis
→ release decision
```

Then place a new failure into the pipeline without rereading first.
