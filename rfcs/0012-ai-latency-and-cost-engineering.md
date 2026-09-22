# RFC 0012 — AI Latency and Cost Engineering

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Summary

Promote the next two concrete Production AI capabilities:

- `production.latency` — Latency Engineering;
- `production.cost` — Cost Engineering.

Do not add or remove catalog nodes.

The proposed dependency shape is:

```text
production.observability
        │
        ├───────────────┐
        ▼               ▼
production.latency   production.cost
        │               │
        └──────┬────────┘
               ▼
later mechanism routes:
production.caching
production.streaming
```

The two routes should share one Knowledge Assistant performance/economics evidence package, but remain independently assessable:

- latency asks whether the user/request path is fast enough and where time is spent;
- cost asks whether the delivered outcome is economically efficient and where spend comes from.

Neither competency should collapse into "use fewer tokens" or "pick a cheaper model".

## Why this slice now

The repository now has:

- a provider/gateway boundary;
- privacy-safe request tracing and GenAI metrics;
- versioned release identity;
- release gates with explicit latency/cost constraints.

That creates the missing prerequisites for meaningful performance and economics work.

The current Knowledge Assistant can already produce:

- end-to-end request duration;
- provider operation duration;
- token/usage measurements when available;
- route/model identity;
- release-manifest identity;
- evaluation quality evidence.

The next learner question should therefore be:

> Which latency and cost drivers matter for this product, and which change improves them without degrading the quality contract?

## Evidence reviewed

Sources were rechecked on 2026-09-22.

They are proposed as teaching/evidence references, not as mandatory platforms.

### OpenAI — Latency optimization

Current documentation:

- <https://developers.openai.com/api/docs/guides/latency-optimization>

Relevant sections:

- "Seven principles";
- "Process tokens faster";
- "Generate fewer tokens";
- "Use fewer input tokens";
- "Make fewer requests";
- "Parallelize";
- "Make your users wait less";
- "Don't default to an LLM".

Important evidence:

- latency is not just model inference speed;
- output generation is often a major latency driver;
- reducing input tokens can have a much smaller latency effect than reducing output tokens;
- sequential request count adds round-trip latency;
- independent work can sometimes be parallelized;
- user-perceived waiting and end-to-end completion are distinct;
- some work should not use an LLM at all;
- optimization choices conflict and must be tested on production-like examples.

Curriculum implication:

> latency optimization should start from the measured critical path and product SLO, not from generic "shorter prompt" advice.

### OpenTelemetry GenAI semantic conventions — metrics

Already registered:

- `docs.otel-genai-metrics`

Relevant sections:

- `gen_ai.client.operation.duration`;
- `gen_ai.client.operation.time_to_first_chunk`;
- `gen_ai.invoke_workflow.duration`;
- `gen_ai.client.token.usage`.

Curriculum implication:

The route can distinguish:

- workflow latency;
- model/provider operation latency;
- streaming time-to-first-chunk when applicable;
- token usage as an input to both latency and cost analysis.

The GenAI conventions remain evolving/development material and should not be treated as permanent application schema.

### Google SRE — Service Level Objectives

Current reference:

- <https://sre.google/sre-book/service-level-objectives/>

Relevant material:

- latency percentiles;
- avoiding arithmetic mean as the only latency indicator;
- 50th / 95th / 99th percentile interpretation;
- workload-specific latency objectives.

Key evidence:

- averages can hide tail latency;
- high percentiles expose plausible worst-case user experience;
- queueing/load can amplify tail behavior;
- latency objectives should match workload and user expectations.

### Google SRE — Monitoring Distributed Systems

Current reference:

- <https://sre.google/sre-book/monitoring-distributed-systems/>

Relevant sections:

- "The Four Golden Signals";
- "Worrying About Your Tail";
- latency versus traffic/errors/saturation.

Key evidence:

- successful and failed request latency should be distinguished;
- tail latency matters;
- latency can worsen before a system reaches nominal 100% utilization;
- request distributions/histograms are more useful than means alone.

This source is proposed as a targeted bridge for the coverage-only `systems.performance-engineering` prerequisite.

### OpenAI — Cost optimization

Current documentation:

- <https://developers.openai.com/api/docs/guides/cost-optimization>

Relevant sections:

- "Cost and latency";
- "Batch API";
- "Flex processing".

Key evidence:

- request count, token count, and model choice are direct cost levers;
- latency and cost often interact;
- asynchronous/batch execution can trade latency for lower cost;
- lower-priority workloads may tolerate slower processing in exchange for lower cost.

The route must generalize beyond OpenAI-specific mechanisms.

### FinOps Framework — Unit Economics

Current reference:

- <https://www.finops.org/framework/capabilities/unit-economics/>

Relevant sections:

- "Definition";
- "Define Unit Metrics which support Organizational Goals";
- resource-efficiency versus business unit metrics;
- cost per request / workload / token examples;
- trend and decision use.

Key evidence:

- raw total spend is not enough to judge efficiency;
- technical unit cost and business unit cost are different but connected;
- cost per token is only one possible technical metric;
- cost per transaction, tenant, workflow, case resolved, or successful task can be more decision-useful.

Curriculum implication:

> the learner should optimize cost per useful outcome, not celebrate a cheaper bill caused by lower traffic or worse product quality.

### FinOps Framework — Allocation

Current reference:

- <https://framework.finops.org/framework/capabilities/allocation/>

Relevant material:

- allocation strategy;
- tags/labels/metadata;
- shared-cost strategy;
- allocation compliance.

Curriculum implication:

A cost metric is operationally useful only when spend/usage can be attributed to the relevant product, tenant, workflow, model route, or feature.

## Proposed capability 1 — `production.latency`

### Title

Latency Engineering

### Target

- level: **L3**
- competency types:
  - engineering skill;
  - system operation;
  - design judgment;
  - production competency.
- target states:
  - demonstrated;
  - transferred;
  - applied.

### Why this is one competency

AI latency is a critical-path engineering problem across:

- application processing;
- network/provider round trips;
- retrieval;
- reranking;
- tool calls;
- model input processing;
- output generation;
- retries/fallback;
- queueing;
- optional streaming and post-processing.

The competency is not "make model calls faster".

It is:

> define the product latency objective, measure the path, find dominant contributors and tail behavior, change one bottleneck, and prove the quality/reliability trade-off.

### Boundary with adjacent competencies

`production.latency` should **not** become:

- `production.observability` — observability provides measurements and traces;
- `systems.performance-engineering` — general profiling/capacity/performance remains broader;
- `production.streaming` — streaming is one mechanism for perceived/partial-result latency;
- `production.caching` — caching is one mechanism that can alter latency;
- `production.model-gateway` — routing may affect latency but is not the objective;
- `production.cost` — latency and cost interact but have different success criteria;
- provider benchmarking without product constraints.

### Prerequisites

Proposed prerequisites:

- `production.observability`;
- `ai.evaluation`;
- `systems.performance-engineering`.

`systems.performance-engineering` is coverage-only and needs a targeted bridge.

Proposed bridge:

- diagnostic: given a request-latency histogram and a trace, distinguish mean from p50/p95/p99, identify the critical path, and state what evidence is needed before claiming a bottleneck;
- source: Google SRE "Monitoring Distributed Systems";
- locator: "The Four Golden Signals" and "Worrying About Your Tail";
- purpose: patch distribution/tail-latency and bottleneck reasoning without requiring the full systems performance curriculum.

### Observable outcomes

The learner should be able to:

- define a latency objective from product/user needs;
- distinguish end-to-end workflow latency from model/provider operation latency;
- distinguish time-to-first-chunk from total completion time when streaming exists;
- inspect p50/p95/p99 or comparable distributions rather than only averages;
- separate successful-request latency from error latency;
- identify the request critical path from traces;
- measure contribution from retrieval, tool, gateway, model, and application stages;
- identify serial model/tool calls that can be removed, combined, or safely parallelized;
- determine when output generation dominates the path;
- determine when input/context size is or is not a material latency driver;
- compare smaller/faster model routing against the quality contract;
- distinguish user-perceived latency from total system completion;
- reason about queueing/load/saturation when latency worsens under traffic;
- preserve timeout/retry/fallback correctness while optimizing;
- design a before/after experiment on representative requests;
- report both latency distribution and quality effects;
- reject an optimization that improves median latency while materially worsening tail latency, errors, or quality;
- decide when a non-LLM deterministic path is the right latency optimization.

### Diagnostic

Before study:

1. Given one trace, identify the critical path and estimate which stage is worth optimizing first.
2. Explain why average latency can improve while p99 user experience gets worse.
3. Compare reducing 30% input tokens, reducing 30% output tokens, removing one sequential provider call, and streaming; state which metric each is expected to affect.
4. Define a performance experiment that cannot "win" by silently reducing answer quality.

Skip introductory material only if the learner can connect product latency objectives, distribution/tail measurements, critical-path analysis, and quality-preserving experiments.

### Proposed learning route

Mental-model sources:

1. **OpenAI — Latency optimization**
   - locator: "Seven principles", then "Generate fewer tokens", "Use fewer input tokens", "Make fewer requests", "Parallelize", "Make your users wait less", and "Don't default to an LLM";
   - purpose: establish a practical taxonomy of AI-specific latency levers and their conflicting trade-offs.

2. **OpenTelemetry GenAI metrics**
   - locator: `gen_ai.client.operation.duration`, `gen_ai.client.operation.time_to_first_chunk`, and `gen_ai.invoke_workflow.duration`;
   - purpose: distinguish provider-call, streaming first-chunk, and whole-workflow measurements.

3. **Google SRE — Service Level Objectives**
   - locator: percentile/tail-latency discussion in "Service Level Objectives";
   - purpose: ground p50/p95/p99 reasoning and workload-specific latency objectives.

4. **Google SRE — Monitoring Distributed Systems**
   - locator: "The Four Golden Signals" and "Worrying About Your Tail";
   - purpose: connect latency distributions to errors, traffic, saturation, and tail behavior.

### Guided practice

- Take a representative Knowledge Assistant trace and annotate every latency component.
- Mark serial versus parallelizable stages.
- Mark user-visible first useful result versus total completion.
- Choose the first optimization only after estimating its share of the critical path.

### Independent practice

Add a Knowledge Assistant performance experiment:

- baseline at least one representative workload;
- capture p50/p95/p99 or comparable distribution;
- preserve quality/eval evidence;
- make one architecture/request-shape/model change;
- rerun the same workload;
- inspect tail/error/quality regressions;
- keep or revert from evidence.

### Required experiments

- remove or combine one sequential request and measure end-to-end effect;
- shorten output while holding task quality criteria constant;
- reduce input/context size and verify whether the measured effect is material rather than assumed;
- parallelize one independent operation and verify correctness under failure;
- compare a faster/smaller model on a bounded task against the quality gate;
- increase traffic/load and inspect tail-latency behavior;
- if streaming exists, separate time-to-first-chunk from full completion;
- reject at least one latency optimization because quality, errors, or tail latency regresses.

### Required exit evidence

Evidence must include:

- latency objective/SLO or explicit target;
- workload/request-set definition;
- baseline p50/p95/p99 or equivalent distribution;
- critical-path trace;
- component latency breakdown;
- successful versus failed request treatment;
- TTFC only when streaming applies;
- one measured bottleneck hypothesis;
- before/after experiment;
- quality comparison;
- error/reliability comparison;
- load/tail-latency observation;
- one optimization kept;
- one optimization rejected or reverted;
- final decision documenting what remains the dominant latency constraint.

## Proposed capability 2 — `production.cost`

### Title

Cost Engineering

### Target

- level: **L3**
- competency types:
  - engineering skill;
  - system operation;
  - design judgment;
  - production competency.
- target states:
  - demonstrated;
  - transferred;
  - applied.

### Why this is one competency

Production AI cost can come from:

- model input/output usage;
- cached/non-cached input;
- tools/server-side features;
- retrieval/vector/storage services;
- reranking;
- gateways;
- agent loops and retries;
- observability;
- batch/background jobs;
- self-hosted compute;
- fixed/shared infrastructure.

The learner needs to move from:

> "this request used N tokens"

to:

> "this feature costs X per successful business/product unit, these are the dominant drivers, and this change improves unit economics without violating quality, latency, or reliability constraints."

### Boundary with adjacent competencies

`production.cost` should **not** become:

- provider price-table memorization;
- `production.observability` — observability supplies usage/correlation;
- `ai.model-selection` — model selection includes capability/quality fit, not full production economics;
- `production.caching` — caching is one cost mechanism;
- `production.latency` — cost/latency may move together or trade off;
- enterprise finance/accounting;
- raw total-spend dashboards with no usage/outcome denominator.

### Prerequisites

Proposed prerequisites:

- `production.observability`;
- `ai.evaluation`;
- `ai.product-framing`.

No coverage-only prerequisite is required.

### Observable outcomes

The learner should be able to:

- define the cost boundary for one AI product/workflow;
- attribute variable usage to feature, workflow, tenant, route, or request class;
- distinguish total spend from unit cost;
- define at least one technical unit metric such as cost/request or cost/token;
- define one product/business unit metric such as cost/successful answer, task, case, or tenant;
- account for input, output, cached input, tools/features, retrieval, retries, and shared service cost when material;
- distinguish synchronous interactive work from batch/background work with different latency-value trade-offs;
- identify dominant cost drivers from production usage rather than intuition;
- compare smaller/cheaper models under the existing quality contract;
- measure whether reducing tokens or requests actually reduces unit cost;
- identify runaway agent/tool loops and retries as cost failures;
- define budget/guardrail behavior for abnormal spend;
- explain when a more expensive request is justified by higher successful-outcome rate;
- compare cost changes together with quality and latency;
- avoid using current provider list prices as the competency itself;
- make one optimization decision from unit economics.

### Diagnostic

Before study:

1. Given total monthly model spend and request count, explain why cost/request may still be a misleading product metric.
2. Build a cost equation for one Knowledge Assistant request including provider, retrieval/tool, retry, and shared costs that materially apply.
3. Explain how switching to a cheaper model can increase cost per successful task.
4. Choose a unit metric for an interactive assistant and a different one for an offline enrichment pipeline.

Skip introductory material only if the learner can attribute meaningful cost, define a useful denominator, and evaluate optimization against quality/latency rather than spend alone.

### Proposed learning route

Mental-model sources:

1. **FinOps — Unit Economics**
   - locator: "Definition", "Define Unit Metrics which support Organizational Goals", and resource-efficiency versus business-unit metric examples;
   - purpose: move from raw spend to technical and product unit economics.

2. **FinOps — Allocation**
   - locator: "Maintain an allocation strategy", "Maintain a tagging & hierarchy strategy", and "Validate allocation compliance";
   - purpose: establish that useful unit cost requires usage/spend attribution.

3. **OpenAI — Cost optimization**
   - locator: "Cost and latency", "Batch API", and "Flex processing";
   - purpose: inspect concrete AI levers such as request/token reduction, model choice, and latency-for-cost trade-offs.

4. **OpenTelemetry GenAI metrics**
   - locator: `gen_ai.client.token.usage` plus model/provider attributes;
   - purpose: connect token/usage measurement to request/release identity instead of estimating cost from prompts alone.

### Guided practice

For one Knowledge Assistant workflow:

- define direct/variable cost categories;
- define one technical unit and one product unit;
- attribute usage by model route and workflow;
- calculate baseline unit cost;
- identify the largest controllable driver.

### Independent practice

Run one cost experiment on the Knowledge Assistant:

- freeze the quality/evaluation contract;
- baseline cost per useful outcome;
- change one driver such as model route, request count, output size, batch mode, or unnecessary agent/tool work;
- measure cost, quality, latency, and error changes;
- keep or reject the change.

### Required experiments

- compare total spend versus cost/request versus cost/successful answer and explain how the conclusions differ;
- compare two model/routes using cost per successful task rather than price/token alone;
- reduce one token/request driver and measure actual unit-cost effect;
- inject a retry or agent-loop amplification failure and verify budget/guardrail detection;
- move one latency-insensitive workload to an async/batch-style path and record the latency/cost trade-off;
- attribute shared retrieval/gateway/observability cost when it is material;
- reject at least one cheaper configuration because quality or latency violates the product contract.

### Required exit evidence

Evidence must include:

- cost boundary;
- allocation dimensions;
- direct/variable/shared cost inventory;
- technical unit metric;
- product/business unit metric;
- baseline total cost and unit cost;
- provider/model/request/token usage breakdown where available;
- retry/tool/agent amplification treatment;
- one abnormal-spend guardrail;
- before/after optimization experiment;
- quality comparison;
- latency comparison;
- cost-per-successful-outcome comparison;
- one optimization kept;
- one cheaper option rejected for quality/latency/reliability reasons;
- final decision identifying the dominant remaining cost driver.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/performance-economics/`

This package should extend the same request/evaluation/release lineage.

Proposed progression:

```text
representative workload
→ quality contract
→ latency + usage baseline
→ latency distribution / critical path
→ cost allocation + unit metric
→ bottleneck / cost-driver hypothesis
→ one controlled optimization
→ rerun same workload
→ compare quality + latency + cost
→ keep / reject / revert
```

Proposed artifacts:

- workload definition;
- latency objective;
- latency baseline;
- critical-path record;
- component-latency breakdown;
- cost boundary;
- allocation record;
- unit-economics record;
- optimization experiment;
- quality/latency/cost comparison;
- rejected-optimization record;
- final decision.

The current Knowledge Assistant project should insert two milestones after observability and before versioned release candidate:

1. `latency-engineering`;
2. `cost-engineering`.

This placement is intentional:

- observability supplies the measurements;
- latency/cost work establishes operational constraints;
- versioning/release then pins and gates candidates using those constraints.

## Promotion gate

Neither competency should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. exact source locators are rechecked during route authoring;
3. sources are registered only after approval;
4. `production.latency` has a targeted `systems.performance-engineering` prerequisite bridge;
5. `production.cost` has no unresolved coverage-only prerequisite;
6. the Knowledge Assistant performance-economics package is inspectable;
7. latency evidence distinguishes workflow, provider operation, and TTFC where applicable;
8. latency evidence includes a distribution/tail metric rather than mean alone;
9. successful and failed request latency are not silently mixed;
10. latency optimization uses representative workloads and preserves quality evidence;
11. at least one latency optimization is rejected or reverted;
12. cost evidence defines both allocation and a meaningful denominator;
13. cost evidence includes at least one product/outcome unit metric rather than only cost/token;
14. model-price comparisons are evaluated as cost per successful outcome;
15. retry/tool/agent amplification is represented in cost failure work;
16. one abnormal-spend/budget guardrail exists;
17. one cheaper configuration is rejected because it violates quality/latency/reliability;
18. latency and cost evidence link to concrete release/request identity where applicable;
19. caching and streaming remain mechanisms, not silently promoted as part of these routes;
20. prerequisite-cycle validation passes;
21. learner-facing source blocks are generated;
22. `curriculum/STATUS.md` and `site/src/data/atlas.json` are regenerated through repository generators;
23. `make check` and `make site-check` pass;
24. review outcome is recorded before promotion.

## Alternatives considered

### Promote `production.caching` first

Deferred.

Caching is a mechanism whose value should be measured against latency, cost, correctness, and freshness objectives.

The learner should first know what they are optimizing.

### Promote `production.streaming` first

Deferred.

Streaming primarily changes time-to-first-useful-output and user-perceived waiting.

It should be taught after latency metrics distinguish TTFC from total completion.

### Merge latency and cost

Rejected.

They share measurements and optimization levers, but can conflict:

- a lower-cost async path may be slower;
- parallelization may reduce latency while increasing cost;
- a faster model tier may cost more;
- a cheaper model may require retries or reduce successful-outcome rate.

The learner must be able to optimize one while constraining the other.

### Optimize average latency

Rejected.

Average latency can hide the tail and can mix successful/failed requests into misleading values.

### Use token count as the cost competency

Rejected.

Tokens are one usage driver.

The production decision needs attribution plus a useful outcome denominator.

### Choose the cheapest model

Rejected.

A cheaper model that lowers successful-task rate can increase cost per useful outcome.

### Require every optimization technique

Rejected.

The route should diagnose the dominant driver first, then choose the smallest justified change.

### Use current provider prices as durable curriculum

Rejected.

Price tables change.

Routes should teach cost models, attribution, unit economics, and controlled experiments; current pricing can be looked up when doing the project.

## Impact

If approved and fully implemented:

- `production.latency` moves from `coverage` to `ready`;
- `production.cost` moves from `coverage` to `ready`;
- no catalog node is added or removed;
- repository counts become:
  - **115** catalog competencies;
  - **29** ready routes;
  - **86** coverage-only competencies;
- Production AI becomes **11 / 6 ready**.

### Proposed resources after approval

Register or reuse:

- OpenAI — Latency optimization;
- OpenAI — Cost optimization;
- OpenTelemetry GenAI semantic conventions — metrics (already registered);
- Google SRE — Service Level Objectives;
- Google SRE — Monitoring Distributed Systems;
- FinOps Framework — Unit Economics;
- FinOps Framework — Allocation.

These are evidence/examples, not mandatory vendors or frameworks.

## Review checklist

- [ ] Latency is defined as an end-to-end critical-path/product objective, not only model speed.
- [ ] Tail latency/distributions are required.
- [ ] Successful and failed latency are distinguished.
- [ ] TTFC is only required when streaming applies.
- [ ] Quality is frozen/compared during latency experiments.
- [ ] Cost uses allocation and unit economics rather than raw spend alone.
- [ ] At least one product/outcome unit metric is required.
- [ ] Cost per successful outcome can reject a nominally cheaper model.
- [ ] Retry/tool/agent amplification is included as a cost failure mode.
- [ ] Latency/cost trade-offs remain explicit.
- [ ] Caching and streaming stay separate mechanism competencies.
- [ ] Provider-specific sources are examples rather than definitions.
- [ ] Reviewer explicitly approves or requests changes before route implementation.
