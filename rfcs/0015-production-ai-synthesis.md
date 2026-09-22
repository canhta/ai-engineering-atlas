# RFC 0015 — Production AI Synthesis

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner through continued implementation approval

## Summary

Promote the final two Production AI coverage nodes as synthesis competencies:

- `production.architecture` — AI Production Architecture;
- `production.mlops-llmops` — MLOps and LLMOps.

No catalog node is added or removed.

These routes do not introduce new bags of topics. They require the learner to integrate and simplify the concrete Production AI capabilities already demonstrated.

## Why synthesis now

The Production AI domain now has concrete routes for:

- model/provider gateway decisions;
- observability and diagnostic replay;
- latency engineering;
- cost engineering;
- caching;
- streaming;
- versioning;
- release engineering;
- drift monitoring.

Earlier RFCs intentionally deferred architecture and MLOps/LLMOps because teaching the umbrella first would encourage tool and pattern collection without the underlying engineering skills.

That prerequisite problem is now resolved.

## Evidence reviewed

### Azure — AI workload architecture pattern

<https://learn.microsoft.com/en-us/azure/well-architected/ai/architecture-pattern>

Relevant sections:

- "High-level AI workload architecture";
- "Workload composition";
- design considerations for "Lifetime and state";
- "Reach and dependencies";
- "Scalability and availability";
- "Security and responsible AI".

The pattern separates data/model/application/practices/platform concerns and emphasizes that components have different lifetime, state, dependency, scale, and security properties.

### AWS — Architecting generative AI applications for production

<https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/preprod-architecting.html>

Relevant sections:

- "Decomposing generative AI monoliths into modular and reusable microservices";
- "Managing asset promotion and environment transitions";
- "Centralizing control and observability with AI gateways";
- "Designing generative AI applications for performance and cost".

This source connects boundaries, independent evolution, asset coordination, gateways, resilience, performance, and cost. The route does not interpret this as a requirement to decompose everything into microservices.

### AWS Generative AI Lens — Design principles

<https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/design-principles.html>

Relevant section:

- "Design principles".

The principles include controlled autonomy, comprehensive observability, resource efficiency, distributed resilience, standardized resource management, and secure interaction boundaries.

### Google Cloud — Deploy and operate generative AI applications

<https://docs.cloud.google.com/architecture/deploy-operate-generative-ai-applications>

Relevant sections:

- "What are DevOps and MLOps?";
- "Lifecycle of a generative AI application";
- "Develop and experiment";
- "Deploy";
- "Log and monitor";
- "Govern".

This source is especially important because it distinguishes GenAI lifecycle artifacts—prompts, chains, grounding/retrieval data, model/provider choices, evaluation, and lineage—from a classic trained-model-only pipeline.

### Google Cloud — MLOps continuous delivery and automation pipelines

<https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning>

Relevant sections:

- "DevOps versus MLOps";
- "MLOps level 0: Manual process";
- "MLOps level 1: ML pipeline automation";
- "MLOps level 2: CI/CD pipeline automation".

This is primarily predictive-ML guidance and is deliberately used as a contrast: continuous training and training pipelines should not be copied into a GenAI product when the workload does not train a model.

### AWS Generative AI Lens — Automate lifecycle management

<https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/genops4.html>

Relevant section:

- "Automate lifecycle management";
- GENOPS04-BP01;
- GENOPS04-BP02.

This connects IaC, CI/CD, environment management, version control, governance, and GenAIOps.

### Made With ML — Orchestration

<https://madewithml.com/courses/mlops/orchestration/>

Relevant section:

- "Continual learning";
- monitoring decisions "continue", "improve", "inspect", and "rollback".

This is used to preserve a human decision boundary in feedback loops rather than teaching automatic retraining as the default.

## Architecture synthesis boundary

`production.architecture` is the ability to compose the minimum production topology that satisfies constraints.

It owns:

- architecture drivers;
- component/state boundaries;
- request/data/control flows;
- trust and dependency boundaries;
- failure propagation and degradation;
- scaling/availability choices;
- operational ownership;
- alternative topology comparison;
- evolutionary architecture;
- deliberate omission/removal of unnecessary mechanisms.

It does not teach every distributed-system pattern or every cloud service.

## MLOps/LLMOps synthesis boundary

`production.mlops-llmops` is the ability to operate the complete AI change lifecycle reproducibly.

It owns:

- lifecycle mapping;
- artifact systems of record;
- metadata and lineage;
- CI/CD/CT applicability;
- environment promotion;
- triggers;
- automation versus human approval;
- production feedback into evaluation;
- operational ownership;
- lifecycle/toolchain simplification.

It does not require continuous training when no model is trained.

It does not define maturity by the number of installed platforms.

## Knowledge Assistant integration

Add:

`projects/knowledge-assistant/production-synthesis/`

Insert after drift monitoring:

1. `architecture-synthesis`;
2. `operating-lifecycle-synthesis`.

The learner must first review and simplify the architecture, then map the complete operating loop around the chosen topology.

## Promotion gate

- [x] all prerequisites are ready;
- [x] architecture composes existing capabilities rather than duplicating them;
- [x] at least two topology alternatives are compared;
- [x] at least one component/mechanism is omitted or removed;
- [x] state/lifetime, dependency, trust, scaling, failure, and ownership boundaries are explicit;
- [x] degraded modes and failure propagation are tested;
- [x] MLOps/LLMOps distinguishes predictive continuous training from GenAI lifecycle operation;
- [x] prompts/retrieval/tools/policies/evaluation are treated as lifecycle artifacts where applicable;
- [x] CI/CD checks map to real change surfaces;
- [x] CT/tuning/retraining is optional and must be justified;
- [x] automation/manual approval boundaries are explicit;
- [x] production evidence closes back into evaluation/regression evidence;
- [x] metadata/lineage can explain or reproduce a prior production state;
- [x] at least one automation or platform component is rejected or consolidated;
- [x] exact source locators are recorded;
- [x] project evidence extends the existing Knowledge Assistant;
- [x] repository validators must pass before completion.

## Impact

After implementation:

- Production AI becomes **11 / 11 ready**;
- repository counts become **115 catalog / 34 ready / 81 coverage**.

This completes the Production AI domain without redefining coverage as mastery: each route still requires learner evidence to move from unassessed to demonstrated/transferred/applied.
