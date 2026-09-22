# Performance & Economics Evidence Contract

Extend the same Knowledge Assistant, production-boundary, and evaluation lineage. Do not create a separate benchmark toy.

Use one representative workload so latency and cost changes remain comparable to the quality contract.

```text
representative workload
→ frozen quality contract
→ latency + usage baseline
→ critical path + cost attribution
→ bottleneck / cost-driver hypothesis
→ one controlled change
→ rerun same workload
→ compare quality + latency + cost
→ keep / reject / revert
```

## Baseline first

Preserve:

- workload/request-set identity;
- release manifest or equivalent system identity;
- evaluation criteria;
- successful and failed request classification;
- end-to-end and component traces;
- token/usage evidence when available;
- request count, tool/retrieval activity, and retries;
- direct and shared cost assumptions.

Do not optimize before the baseline is inspectable.

## Stage 1 — latency

Use [latency-experiment.template.md](latency-experiment.template.md).

Measure distributions, not only an arithmetic mean.

At minimum distinguish:

- workflow duration;
- provider/model operation duration;
- retrieval/tool/application contribution where material;
- successful versus failed requests;
- p50/p95/p99 or a comparable distribution;
- time-to-first-chunk only when the path streams.

Write the bottleneck hypothesis before changing the system.

## Stage 2 — cost

Use [unit-economics.template.md](unit-economics.template.md).

Define:

- what cost is in scope;
- which metadata allocates it to this workflow;
- which shared costs are included or deliberately excluded;
- one technical unit metric;
- one useful-outcome or product unit metric.

Cost per token is not enough by itself.

A cheaper model or route should be rejected when quality, latency, reliability, retries, or successful-outcome rate makes the unit economics worse.

## Stage 3 — one controlled optimization

Use [optimization-decision.template.md](optimization-decision.template.md).

Change one dominant driver at a time where practical.

Possible levers include:

- output size;
- request count;
- safe parallelism;
- model route;
- unnecessary LLM work;
- batch/asynchronous execution for latency-insensitive work;
- retry/tool/agent amplification.

Caching and streaming are later mechanism competencies; do not use them here as unexamined magic switches.

## Exit condition

Another engineer should be able to reproduce the baseline, identify the measured bottleneck and dominant cost driver, rerun the optimization against the same workload, inspect the quality/latency/cost trade-off, and understand why one optimization was kept while another was rejected or reverted.

A provider dashboard screenshot or lower monthly bill without a comparable workload and useful-outcome denominator is not sufficient.
