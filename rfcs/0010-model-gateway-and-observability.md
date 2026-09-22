# RFC: Model Gateway and AI Observability Slice

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The Production AI domain currently has 11 catalog competencies and no ready routes.

The Knowledge Assistant already reaches a service-and-observability milestone, but the curriculum does not yet define the learner capabilities required to operate that production boundary.

The first Production AI slice should not begin with broad umbrella nodes such as:

- `production.architecture`;
- `production.mlops-llmops`.

Those labels are too broad to diagnose or assess directly.

This RFC proposes two concrete capabilities instead:

- `production.model-gateway`;
- `production.observability`.

They answer two distinct production questions:

```text
model gateway
= where provider/model traffic is controlled

observability
= how a production request is explained, measured, and reproduced enough to diagnose
```

The two capabilities reinforce each other but remain independently assessable.

## Evidence

### Azure Architecture Center — gateway in front of model deployments

https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-multi-backend

Verified sections include:

- introduction and gateway decision criteria;
- **Introduce a gateway for multiple model deployments**;
- **Reasons to avoid a gateway for multiple model deployments**;
- **Multiple instances in a single region and a single subscription**;
- topology tips covering retry, circuit breaking, `Retry-After`, load balancing, model-version consistency, and unified telemetry.

The source establishes several important boundaries.

A gateway can provide:

- a stable client-facing model boundary;
- centralized routing;
- failover/load balancing;
- client/tenant-aware policy;
- security segmentation;
- quota/rate control;
- unified telemetry.

But a gateway is not automatically justified.

The same source explicitly notes cases where direct client configuration is simpler and the added reliability, security, cost, maintenance, and performance impact of a gateway may not be worth another architectural component.

That trade-off belongs in the learner evidence.

The source also warns against load balancing or failing over between incompatible model versions because behavior may change unexpectedly.

### Cloudflare AI Gateway — Dynamic Routing

https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/

Verified sections:

- **Introduction**;
- **Core Concepts**.

The routing model provides concrete production examples for:

- conditional routes;
- percentage routes;
- model selection;
- rate limits;
- budget limits;
- fallback paths;
- route versions.

This source is used as an implementation example, not as the definition of an AI gateway.

### Cloudflare AI Gateway — Request handling

https://developers.cloudflare.com/ai-gateway/configuration/request-handling/

Verified sections:

- **Request timeouts**;
- **Request retries**.

The source provides concrete timeout/retry/backoff behavior and reinforces a central gateway requirement:

```text
provider failure
→ classified gateway policy
→ bounded retry / fallback / failure
```

The route should not teach unlimited retries or hide provider failures behind opaque fallback.

### OpenTelemetry GenAI semantic conventions — spans

https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md

Verified sections include:

- **Spans**;
- **Inference**;
- **Retrievals**;
- **Execute tool span**;
- **Capturing instructions, inputs, and outputs**;
- **Recording content on attributes**.

The current GenAI conventions define logical operations for model calls and related AI operations.

They support useful correlation fields such as:

- operation;
- provider;
- requested model;
- response model;
- errors;
- conversation/workflow identifiers where appropriate.

The source also gives an important privacy boundary: model instructions, user inputs, and outputs can be sensitive and large, and should not be captured by default.

The curriculum must therefore treat "log every prompt" as an anti-pattern rather than an observability default.

The GenAI conventions are currently marked **Development**. The route should teach them as current interoperability guidance, not as a permanently stable schema.

### OpenTelemetry GenAI semantic conventions — metrics

https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md

Verified sections include:

- **Generative AI client metrics**;
- `gen_ai.client.operation.duration`;
- `gen_ai.client.operation.time_to_first_chunk`;
- token-usage / inference-usage metrics;
- workflow duration guidance.

These metrics support a transferable production model:

- request duration;
- streaming time-to-first-chunk when applicable;
- model/provider dimensions;
- token usage where reliably available;
- workflow-level versus provider-call latency boundaries.

The learner should still derive alerts and SLOs from product requirements rather than blindly collecting every available metric.

## Proposal

Create a two-competency **Production Boundary Slice**.

```text
direct model/provider integration
→ establish gateway need
→ stable provider boundary
→ routing / timeout / retry / fallback policy
→ failure injection
→ instrument request path
→ correlate model / retrieval / tool work
→ define privacy-safe telemetry
→ reproduce one failure from recorded provenance
→ compare production value versus added complexity
```

## 1. `production.model-gateway`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- design judgment
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.model-selection`
- `ai.evaluation`
- `systems.api-service-design`

`systems.api-service-design` is currently coverage-only and therefore requires a targeted prerequisite bridge rather than a full forced detour.

The bridge should cover only:

- stable request/response boundaries;
- status/error classes;
- timeout semantics;
- authentication boundary;
- idempotency/retry awareness.

### Boundary with adjacent competencies

`production.model-gateway` should **not** absorb:

- `production.architecture` — broader deployment/system topology;
- `production.caching` — cache semantics and correctness;
- `production.cost` — cost optimization strategy;
- `production.latency` — end-to-end latency engineering;
- `production.streaming` — stream transport and partial-response semantics;
- `production.release-engineering` — rollout gates and rollback policy;
- `ai.model-selection` — choosing which model best fits the product constraints.

The gateway route may observe or enforce budgets, latency limits, or rollout rules, but those deeper competencies remain separate.

### Observable outcomes

The learner should be able to:

- decide whether a gateway is justified relative to a direct provider integration;
- define the stable client-facing contract and provider-specific escape hatches;
- keep routing policy separate from application business logic;
- route by explicit product/tenant/request constraints;
- distinguish load balancing, failover, fallback, and deliberate model selection;
- define provider/model compatibility requirements for fallback;
- prevent silent fallback between behaviorally incompatible model versions;
- define bounded timeout and retry behavior;
- use authoritative throttling signals such as `Retry-After` where available;
- define rate/quota controls and explain their failure behavior;
- define provider credential ownership and prevent clients from bypassing the gateway policy boundary;
- classify provider errors versus gateway-policy errors versus application errors;
- preserve request correlation across retries and fallbacks;
- test one provider outage/throttle scenario;
- compare direct and gateway variants on reliability, operational complexity, latency overhead, and policy consistency;
- remove the gateway when centralized control does not earn its complexity.

### Required evidence

Extend the Knowledge Assistant from a direct model/provider call to a gateway boundary.

Evidence must include:

- direct-provider baseline;
- gateway responsibility diagram;
- stable request/response contract;
- provider/model inventory;
- route policy;
- provider/model compatibility policy;
- timeout policy;
- retry/backoff policy;
- fallback policy;
- rate/quota policy;
- credential/auth boundary;
- request correlation ID;
- injected provider timeout;
- injected throttling / `429` case;
- one fallback or failover case;
- one incompatible-model fallback that is deliberately rejected;
- latency overhead;
- error/failure taxonomy;
- decision to keep, simplify, or remove the gateway.

A proxy that only forwards requests to one provider is not sufficient evidence.

## 2. `production.observability`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.evaluation`
- `systems.api-service-design`

The same narrow API-service bridge may be reused.

`production.model-gateway` is intentionally not a hard prerequisite.

Observability is needed even when an application calls a model provider directly.

### Boundary with adjacent competencies

`production.observability` should **not** become:

- `ai.evaluation` — evaluation decides whether behavior is good enough;
- `production.versioning` — versioning controls lifecycle and identity of deployed artifacts;
- `production.drift` — drift detects systematic distribution/behavior change;
- `production.release-engineering` — release gates decide whether a version should ship;
- a vendor dashboard tutorial;
- raw prompt/response logging by default.

Observability records enough evidence to explain production behavior.

Evaluation, release, drift, and versioning act on that evidence in different ways.

### Request replay boundary

"Replay" in this route means:

> reconstruct a comparable execution from captured request context and version/provenance identifiers for diagnosis.

It does **not** mean byte-identical deterministic reproduction of a stochastic model response.

A replay record should identify, where applicable:

- provider;
- requested and actual model;
- inference parameters;
- prompt/template identifier or hash;
- retrieval/index/config identifier;
- tool schema/config identifier;
- gateway route/policy version;
- request input or secure reference to it;
- relevant feature/config flags.

This records provenance needed for diagnosis without replacing the deeper `production.versioning` competency.

### Observable outcomes

The learner should be able to:

- define a trace boundary for the user request and important nested AI operations;
- propagate correlation across model, retrieval, tool, and gateway operations;
- distinguish workflow latency from provider-call latency;
- record provider, requested model, response model, errors, and route/fallback outcome;
- collect latency and token/usage metrics where reliably available;
- capture time-to-first-chunk only for streaming operations;
- create useful failure dimensions without high-cardinality abuse;
- define what content is excluded, redacted, sampled, or stored separately;
- keep prompts, user messages, tool arguments/results, and outputs out of telemetry by default unless policy explicitly allows capture;
- connect production traces to evaluation or incident records without making the trace itself a quality score;
- reconstruct one failure using recorded provenance;
- identify when replay diverges because the upstream model, data, tool state, or configuration changed;
- define dashboards/alerts around product-relevant failure and latency signals rather than metric collection for its own sake;
- use traces to distinguish provider, retrieval, tool, gateway, and application failures;
- measure observability storage/performance overhead;
- remove telemetry that is expensive, sensitive, or not actionable.

### Required evidence

Instrument the same Knowledge Assistant production path.

Evidence must include:

- request/trace ID;
- trace diagram or span inventory;
- model/provider attributes;
- retrieval/tool/gateway correlation where those operations exist;
- latency metric;
- token/usage metric when reliably available;
- streaming TTFC only if the workflow streams;
- error taxonomy;
- privacy/content-capture policy;
- redaction or content-exclusion test;
- one successful request trace;
- one provider failure trace;
- one retrieval or tool failure trace;
- one fallback/routing trace if a gateway exists;
- one diagnostic replay record;
- explicit provenance/version identifiers used for replay;
- measured telemetry overhead;
- one decision to drop or reduce a high-cost/high-risk telemetry field;
- incident diagnosis based on the collected evidence.

A dashboard screenshot without a reproducible failure analysis is not sufficient exit evidence.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/production-boundary/`

The package should extend the current Knowledge Assistant rather than create a separate production demo.

Proposed progression:

```text
direct provider baseline
→ gateway decision
→ gateway contract
→ routing/retry/fallback failure work
→ request correlation
→ GenAI trace/metric instrumentation
→ privacy-safe content policy
→ injected production failures
→ diagnostic replay
→ keep / simplify / remove decisions
```

Proposed artifacts:

- gateway decision record;
- gateway contract;
- route/fallback policy record;
- gateway failure matrix;
- telemetry contract;
- trace/span inventory;
- privacy/redaction policy;
- incident trace;
- replay record;
- gateway/observability overhead comparison;
- architecture decision.

## Promotion gate

Neither competency should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. exact source locators are rechecked during route authoring;
3. official gateway and OpenTelemetry sources are registered only after approval;
4. `systems.api-service-design` has a targeted prerequisite bridge in both routes;
5. the Knowledge Assistant production-boundary package is inspectable;
6. the gateway route preserves a direct-provider baseline;
7. gateway evidence includes timeout, throttling, bounded retries, fallback/failover, and incompatible-version rejection;
8. credential ownership and gateway-bypass risk are explicit;
9. the observability route distinguishes traces, metrics, evaluation, and replay;
10. sensitive model/user content is not captured by default;
11. one content-redaction/exclusion test exists;
12. observability evidence includes model/provider/error/latency correlation;
13. one production failure is diagnosed from traces rather than from agent narration;
14. request replay is defined as diagnostic reconstruction rather than deterministic model reproduction;
15. replay provenance identifiers are present;
16. telemetry overhead is measured;
17. prerequisite-cycle validation passes;
18. learner-facing source blocks are generated;
19. `curriculum/STATUS.md` is regenerated;
20. `site/src/data/atlas.json` is regenerated only through `scripts/build_site_data.py --write`;
21. `make check` and `make site-check` pass;
22. review outcome is recorded before promotion.

## Alternatives considered

### Start with `production.architecture`

Rejected for this slice.

The node is too broad to diagnose cleanly while all concrete Production AI capabilities remain coverage-only.

It should be reviewed after several concrete production routes exist; it may remain a synthesis competency or prove redundant.

### Start with `production.mlops-llmops`

Rejected for the same reason.

It currently names a broad operational umbrella rather than one directly assessable capability.

### Merge gateway and observability into one competency

Rejected.

A system can be observable without a gateway, and a gateway can exist with poor observability. They should integrate in the project but remain separately assessable.

### Teach one gateway product

Rejected.

Azure API Management and Cloudflare AI Gateway are evidence and implementation examples. The route must transfer to custom gateways, other managed gateways, or direct service code.

### Fail over to any available model

Rejected.

Fallback must preserve a defined compatibility contract. Availability does not make two model versions or capabilities behaviorally interchangeable.

### Retry every provider failure

Rejected.

Retries must be bounded and failure-class aware. Some errors should fail fast or route elsewhere.

### Log every prompt and response

Rejected.

Current OpenTelemetry GenAI guidance treats model/user content as potentially sensitive and large. Content capture should be explicit and opt-in.

### Treat a trace as an evaluation score

Rejected.

Tracing explains execution. Evaluation judges quality against a defined contract.

### Treat replay as exact reproduction

Rejected.

Generative systems, external tools, mutable retrieval data, and provider changes can make exact reproduction impossible. Replay is a diagnostic reconstruction using recorded provenance.

## Impact

If approved and fully implemented:

- `production.model-gateway` moves from `coverage` to `ready`;
- `production.observability` moves from `coverage` to `ready`;
- no catalog node is added or removed;
- repository counts become:
  - **115** catalog competencies;
  - **25** ready routes;
  - **90** coverage-only competencies;
- Production AI becomes **11 / 2 ready**.

### Proposed resources after approval

Register current official sources such as:

- Azure Architecture Center — gateway in front of multiple model deployments or instances;
- Cloudflare AI Gateway — Dynamic Routing;
- Cloudflare AI Gateway — Request handling;
- OpenTelemetry GenAI semantic conventions — spans;
- OpenTelemetry GenAI semantic conventions — metrics.

The OpenTelemetry GenAI conventions should be marked as evolving/development material and reviewed frequently.

### Project integration

Add a Knowledge Assistant `production-boundary/` evidence package and replace the current generic service-and-observability milestone with explicit gateway and observability milestones.

## Review checklist

- [x] Gateway and observability are distinct assessable capabilities.
- [x] `production.architecture` is intentionally deferred rather than force-promoted.
- [x] `production.mlops-llmops` is intentionally deferred rather than force-promoted.
- [x] Gateway target depth L3 is appropriate.
- [x] Observability target depth L3 is appropriate.
- [x] Gateway keeps a direct-provider baseline.
- [x] Gateway includes explicit fallback/model-compatibility policy.
- [x] Gateway includes bounded timeout/retry/throttling failure work.
- [x] Gateway can be rejected when centralized control does not justify the component.
- [x] Observability separates trace evidence from evaluation.
- [x] Sensitive prompt/user/output capture is opt-in rather than default.
- [x] Replay means diagnostic reconstruction, not deterministic response reproduction.
- [x] Replay provenance does not silently replace the future Versioning competency.
- [x] OpenTelemetry GenAI convention stability is represented honestly.
- [x] Knowledge Assistant integration extends the existing project lineage.
- [x] Reviewer explicitly approves or requests changes before implementation.
