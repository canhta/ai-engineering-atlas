# AI Production Architecture

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Azure Well-Architected — AI workload architecture pattern](https://learn.microsoft.com/en-us/azure/well-architected/ai/architecture-pattern) | Sections "High-level AI workload architecture", "Workload composition", and the design considerations for "Lifetime and state", "Reach and dependencies", "Scalability and availability", and "Security and responsible AI" | Build a workload-level architecture model around component roles, state/lifetime, dependencies, scaling, and trust boundaries rather than a vendor service list. |
| [AWS — Architecting generative AI applications for production](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/preprod-architecting.html) | Sections "Decomposing generative AI monoliths into modular and reusable microservices", "Managing asset promotion and environment transitions", "Centralizing control and observability with AI gateways", and "Designing generative AI applications for performance and cost" | Study how production boundaries, coordinated artifact changes, shared control points, resilience, performance, and cost interact—and where decomposition can help or create more operational surface. |
| [AWS Generative AI Lens — Design principles](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/design-principles.html) | Section "Design principles", especially controlled autonomy, comprehensive observability, resource efficiency, distributed resilience, standardized resource management, and secure interaction boundaries | Use cross-cutting architecture principles as a review checklist while still requiring product-specific trade-offs rather than blindly applying every pattern. |
<!-- learning-sources:end -->

## Why this matters

The individual production mechanisms now exist. Architecture is the judgment required to compose only the ones the product needs, put the right boundaries around them, and make failure, state, ownership, scaling, and evolution explicit.

## 1. Diagnostic first

Before studying the sources:

- draw the Knowledge Assistant request, data, feedback, and control flows;
- identify persistent state and externally managed dependencies;
- defend one service boundary and one in-process boundary;
- walk provider and retrieval outages through the topology;
- compare a simpler and a more distributed design under the same product constraints.

If the reasoning is a component/tool list without constraints and failure behavior, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
component
→ a responsibility in the system

service boundary
→ an independently operated boundary that must earn its cost

data plane
→ user/request execution

control plane
→ configuration, evaluation, release, monitoring, recovery

degraded mode
→ deliberately reduced capability that still provides safe value
```

Architecture is an evidence-backed set of trade-offs, not a count of services.

## 3. Independent practice

Use the [Production Synthesis evidence contract](../../../projects/knowledge-assistant/production-synthesis/).

Produce two viable topologies, run the same failure/scale/change scenarios through both, select one, and simplify the selected design.

## 4. Failure and simplification work

- provider and retrieval outages;
- optional component failure;
- traffic concentrated on one bottleneck;
- independent artifact changes at different cadences;
- provider/component replacement;
- regional/dependency failure where relevant.

At least one piece of complexity should be rejected, removed, or moved back behind an explicit human decision.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the drivers, flows, state/dependency/trust boundaries, alternative topology comparison, failure matrix, degraded modes, owners, and the component you deliberately omitted or removed—and reproduce the architecture decision.

## 6. Transfer

Redesign for a product with different traffic, state, compliance, availability, provider, and team constraints.

## 7. Applied evidence

Applied evidence is a production topology whose complexity can be explained by current constraints and whose failure/recovery behavior is understood before the next incident.
