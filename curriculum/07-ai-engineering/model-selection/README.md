# Model Selection

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 4 "Evaluate AI Systems" — Evaluation Criteria, Model Selection, Model Selection Workflow, Model Build Versus Buy, and Navigate Public Benchmarks | Connect task-specific evaluation criteria to an explicit model-selection workflow and operational trade-offs. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `ai.product-framing` | [Made With ML — Product Design](https://madewithml.com/courses/mlops/product-design/) | Product Design lesson sections covering users, pain points, value proposition, objectives, constraints, and feasibility. | Patch the product constraints that make model selection a decision rather than a benchmark lookup. |
<!-- learning-sources:end -->

## Why this matters

There is no universally "best model" for an AI product.

The useful decision is:

> Which candidate satisfies this task's hard constraints and gives the best measured trade-off for the product?

Quality, latency, cost, deployment, privacy, structured output, context requirements, and operational burden can all change the answer.

## 1. Diagnostic first

Before reading the source, answer:

1. What evidence would you collect before choosing between three models?
2. Which product requirements are hard constraints versus preferences?
3. Why can a public benchmark leader still be the wrong model?
4. What result would make you change your selection?

If your answer already includes a task-specific eval, operational measurements, explicit constraints, and uncertainty, move directly to the lab.

## Prerequisite check

Two capabilities matter before model selection:

- **Product framing** — if you cannot state user, pain, measurable value, hard constraints, and a simpler alternative, patch this with [Made With ML — Product Design](https://madewithml.com/courses/mlops/product-design/).
- **Evaluation** — this is already a ready route in the Atlas. If you cannot define representative evaluation data and comparison criteria, use [AI Evaluation and Experimentation](../evaluation/) first.

The goal is enough context to make a real selection decision, not completion of a product-management course.
## 2. Mental model

Primary route:

- Chip Huyen, *AI Engineering* — **Chapter 4: Evaluate AI Systems**
  - Evaluation Criteria
  - Model Selection
  - Model Selection Workflow
  - Model Build Versus Buy
  - Navigate Public Benchmarks

Use Chapter 4 to connect model capability evaluation with application constraints rather than treating model selection as a leaderboard lookup.

## 3. Independent practice

Complete the [Model Selection Lab](../../../labs/model-selection/).

The lab deliberately uses synthetic candidate profiles. The learning goal is the decision process.

Then, for stronger evidence, replace them with results measured on your own small eval set.

## 4. Exit evidence

You are at **demonstrated** when you can:

- filter candidates by hard constraints;
- define the decision rule before choosing;
- compare task-specific quality, latency, cost, and operational constraints;
- justify rejection decisions;
- identify uncertainty and evidence that would change the choice.

## 5. Transfer

Repeat the decision for a workload with different constraints — for example batch classification or private/offline deployment.

A good process should remain stable while the selected model may change.

## 6. Applied evidence

Use the process for a real decision in the [Knowledge Assistant](../../../projects/knowledge-assistant/) or another system.

Preserve:

- eval-set version;
- measured candidate results;
- decision record;
- later evidence that confirms or overturns the choice.
