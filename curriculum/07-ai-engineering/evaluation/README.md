# AI Evaluation and Experimentation

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 3 "Evaluation Methodology" and Chapter 4 section "Design Your Evaluation Pipeline" | Learn exact/model-based/comparative evaluation and connect evaluation criteria, methods, data, and system components. |
| [Made With ML — Evaluation](https://madewithml.com/courses/mlops/evaluation/) | Evaluation lesson; overall, per-class, slices, behavioral testing, and online evaluation sections | Connect aggregate metrics to failure analysis and production evaluation. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `ml.experimental-design` | [Made With ML — Evaluation](https://madewithml.com/courses/mlops/evaluation/) | Evaluation lesson sections covering overall evaluation, per-class evaluation, slices, behavioral testing, and online evaluation. | Patch the experiment-design discipline needed to make system comparisons meaningful. |
| `software.testing` | [Made With ML — Testing Machine Learning Systems](https://madewithml.com/courses/mlops/testing/) | Testing lesson sections "Types of tests" and "How should we test?". | Patch the testing vocabulary and regression mindset used by the evaluation harness. |
<!-- learning-sources:end -->

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

## Prerequisite check

Patch only missing prerequisites:

- **Experimental design** — use [Made With ML — Evaluation](https://madewithml.com/courses/mlops/evaluation/) to review overall metrics, per-class evaluation, slices, behavioral testing, and online evaluation. You should be able to define criteria before seeing the result.
- **Software testing** — use [Made With ML — Testing](https://madewithml.com/courses/mlops/testing/) sections **Types of tests** and **How should we test?**. You should be able to distinguish unit, integration/system, and regression evidence.

If both checks are already comfortable, skip these patches.
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
