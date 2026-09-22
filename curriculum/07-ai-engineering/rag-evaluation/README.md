# RAG Evaluation

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

A bad RAG answer does not tell you what failed.

The retriever may have missed the evidence. The right evidence may have been ranked too low or surrounded by noise. The generator may have ignored good context. Or the evaluator itself may be unreliable.

RAG evaluation is the ability to localize those failures and make a release or architecture decision from evidence.

## 1. Diagnostic first

For one wrong answer, specify evidence that would distinguish:

- retrieval miss;
- poor ranking/context selection;
- sufficient context but unfaithful generation;
- sufficient/faithful context but poor answer quality;
- bad or ambiguous evaluation labels.

Then explain how you would validate an LLM-based evaluator before allowing it to block a release.

## 2. Mental model

Use three sources for different jobs.

1. Es et al., [**RAGAs: Automated Evaluation of Retrieval Augmented Generation**](https://aclanthology.org/2024.eacl-demo.16/) — focus on the decomposition into relevant/focused retrieved context, faithful use of context, and generation quality.
2. Chip Huyen, *AI Engineering*, Chapter 4 **Design Your Evaluation Pipeline** (pp. 200–207) — evaluate all components, define guidelines, methods, and data.
3. [Ragas metrics documentation](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/) — inspect concrete metric definitions as examples.

RAGAS is **not** the curriculum objective and its automatic metrics are not ground truth.

## 3. Evaluation contract

Use the [Retrieval Quality evidence contract](../../../projects/knowledge-assistant/retrieval-quality/).

Separate:

1. **retrieval** — did required evidence enter the candidate/context set?
2. **context** — is supplied context sufficient, focused, and traceable?
3. **generation** — is the answer faithful to supplied evidence and useful?
4. **end to end** — does final behavior satisfy the product contract?

Preserve evaluator provenance for model-based metrics: model/version, rubric or metric definition, and calibration sample.

## 4. Failure experiments

Useful experiments include:

- change retrieval while holding generation fixed;
- provide oracle/relevant context for selected cases;
- deliberately add irrelevant context and inspect degradation;
- compare a model-based evaluator with human-reviewed labels;
- convert production/project failures into regression cases.

These experiments localize the failing component instead of tuning the whole RAG stack blindly.

## 5. Exit evidence

You are at **demonstrated** when you can:

- evaluate retrieval separately from generation;
- attribute failures to components;
- explain what each metric actually measures;
- show calibration/provenance for subjective model-based judgments;
- produce a release/architecture decision from multiple evidence types;
- add durable regression cases.

A single “RAG score” is not enough.

## 6. Transfer

Move to a domain with different relevance, citation, freshness, or abstention requirements and redesign the evaluation contract.

## 7. Applied evidence

Applied evidence exists when component-level evaluation catches a regression, changes a retrieval/generation decision, blocks a release, or turns a real failure into a durable test.
