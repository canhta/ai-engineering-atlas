# AI Product and Problem Framing

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Made With ML — Product Design](https://madewithml.com/courses/mlops/product-design/) | Product Design lesson sections "Background", "Value proposition", "Objectives", "Solution", and "Feasibility" | Build the product-first sequence from user pain through objectives, alternatives, constraints, out-of-scope behavior, and feasibility. |
| [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 1 "Planning AI Applications", especially "Use Case Evaluation", "Setting Expectations", "Milestone Planning", and "Maintenance" (pp. 28-34) | Connect product framing to foundation-model suitability, expectations, milestones, and lifecycle cost. |
<!-- learning-sources:end -->

## Why this matters

A model, RAG stack, or agent is not a product requirement. The capability here is to convert a real user problem into a falsifiable engineering contract before architecture choices make the solution expensive to change.

## 1. Diagnostic first

Before reading anything, frame: **Build an AI assistant over our documentation.**

Write the concrete user/workflow, pain and failure cost, value proposition, simplest baseline to beat, observable success criteria, constraints, unacceptable failures, alternatives, out-of-scope behavior, and evidence that would make you stop or reject the AI approach.

If the frame can drive evaluation and a release decision without naming a model or framework, move directly to independent practice.

## 2. Mental model

Primary route:

1. [Made With ML — Product Design](https://madewithml.com/courses/mlops/product-design/): **Background → Value proposition → Objectives → Solution → Feasibility**.
2. Chip Huyen, *AI Engineering*, Chapter 1 **Planning AI Applications**, especially **Use Case Evaluation**, **Setting Expectations**, **Milestone Planning**, and **Maintenance** (pp. 28–34).

Made With ML supplies the product-design sequence. *AI Engineering* pressure-tests foundation-model suitability, expectations, milestones, and lifecycle cost.

## 3. Guided practice

Rewrite one vague feature request as a one-page contract:

| Item | Required decision |
| --- | --- |
| User/workflow | Who is blocked, and where? |
| Pain | What is costly, slow, risky, or impossible today? |
| Value | What user outcome should improve? |
| Baseline | What is the simplest current or deterministic alternative? |
| Success | What observable evidence beats the baseline? |
| Constraints | Latency, cost, freshness, privacy, permissions, reliability |
| Failure | What outcomes are unacceptable? |
| Scope | What will deliberately not be solved now? |
| Milestones | What is the smallest sequence that tests the riskiest assumptions? |

Do not add a model/provider/framework section.

## 4. Independent practice — Knowledge Assistant

Use the [Knowledge Assistant](../../../projects/knowledge-assistant/). Produce a one-page product brief, 10–20 representative questions, relevance/answer criteria, unacceptable failures, meaningful operational constraints, the simplest baseline, and a first milestone/stop condition.

The first architecture is not RAG. The next route is the lexical retrieval baseline.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the frame and answer what problem is being solved, what baseline must be beaten, what success means, what constraints dominate, what failure blocks release, and what evidence prevents additional complexity.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 6. Transfer

Frame a different problem such as support-ticket triage or structured document extraction. Include a non-AI baseline and a credible reason the AI project might be rejected.

## 7. Applied evidence

Applied evidence exists when the frame changes a real build decision: a feature is descoped, a simpler baseline is retained, a success metric changes, or an architecture choice is rejected because it does not satisfy the product contract.
