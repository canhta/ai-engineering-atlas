# MLOps and LLMOps

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Google Cloud — Deploy and operate generative AI applications](https://docs.cloud.google.com/architecture/deploy-operate-generative-ai-applications) | Sections "What are DevOps and MLOps?", "Lifecycle of a generative AI application", "Develop and experiment", "Deploy", "Log and monitor", and "Govern" | See how GenAI extends the operating lifecycle beyond a trained model to prompts, chains, retrieval/grounding data, evaluation, component lineage, monitoring, and governance. |
| [Google Cloud — MLOps continuous delivery and automation pipelines](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning) | Sections "DevOps versus MLOps", "MLOps level 0: Manual process", "MLOps level 1: ML pipeline automation", and "MLOps level 2: CI/CD pipeline automation" | Use predictive MLOps as a contrast model for CI/CD/CT, metadata, validation, pipeline triggers, and gradual automation—then decide which parts actually apply to the GenAI workload. |
| [AWS Generative AI Lens — Automate lifecycle management](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/genops4.html) | Section "Automate lifecycle management" and best practices "Automate generative AI application lifecycle with infrastructure as code (IaC)" and "Implement GenAIOps to optimize the application lifecycle" | Connect reproducible environments, version control, CI/CD, governance, and automation into one lifecycle while keeping automation proportional to operational need. |
| [Made With ML — Orchestration for Machine Learning](https://madewithml.com/courses/mlops/orchestration/) | Section "Continual learning", especially the monitoring actions "continue", "improve", "inspect", and "rollback" | Preserve explicit human/operational decisions in the feedback loop instead of turning every monitor event into automatic retraining or deployment. |
<!-- learning-sources:end -->

## Why this matters

The production mechanisms now exist; the final operating problem is keeping changes reproducible and closing the loop from experiment to production evidence and back again. GenAI adds prompts, retrieval, chains, tools, policies, and external models to the artifacts that classic MLOps already had to manage.

## 1. Diagnostic first

Before studying the sources:

- draw one end-to-end operating loop from change hypothesis to production feedback;
- state whether this product trains or fine-tunes a model at all;
- choose which lifecycle transitions should be automated and which require human approval;
- show how a prior production state is reconstructed from metadata and release identity;
- explain how a drift/incident signal becomes a durable regression case rather than an automatic retrain.

If the reasoning is a component/tool list without constraints and failure behavior, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
DevOps
→ software change/release/operation practices

MLOps
→ DevOps plus model/data/experiment lifecycle where training exists

LLMOps / GenAIOps
→ operate compound AI artifacts such as prompts, external models,
   retrieval, tools, policies, evaluations, and chains

automation
→ a risk/toil decision, not a maturity badge
```

Continuous training is optional. Reproducibility, validation, release identity, monitoring, and feedback are not.

## 3. Independent practice

Use the [Production Synthesis evidence contract](../../../projects/knowledge-assistant/production-synthesis/).

Map every existing Knowledge Assistant evidence package onto one operating lifecycle, run one real change through it, and remove one automation or system-of-record boundary that does not reduce risk, lead time, or toil.

## 4. Failure and simplification work

- prompt-only change forced through irrelevant training steps;
- retrieval/data change with different validation needs;
- drift alert that should lead to inspect or continue instead of update;
- environment/config promotion mismatch;
- missing lineage for a prior production release;
- unsafe automatic transition that needs a human gate.

At least one piece of complexity should be rejected, removed, or moved back behind an explicit human decision.

## 5. Exit evidence

You are at **demonstrated** when another engineer can follow artifact and evidence lineage from hypothesis through release and production feedback, reproduce one prior state, understand every automated/manual transition, and see one production failure become a future evaluation/release constraint.

## 6. Transfer

Design the lifecycle for a different system with different training/tuning needs, data ownership, release cadence, compliance, and team structure.

## 7. Applied evidence

Applied evidence is an operating loop that makes safe changes faster, recovers from bad changes, and continuously converts production learning into better future decisions without accumulating unnecessary platforms.
