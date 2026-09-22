# Cost Engineering

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [FinOps Framework — Unit Economics](https://www.finops.org/framework/capabilities/unit-economics/) | Sections "Definition" and "Define Unit Metrics which support Organizational Goals", including resource-efficiency and business-unit metric examples | Move from raw spend to technical and product unit economics that connect technology cost to delivered value. |
| [FinOps Framework — Allocation](https://framework.finops.org/framework/capabilities/allocation/) | Sections "Maintain an allocation strategy", "Maintain a tagging & hierarchy strategy", "Maintain a shared cost strategy", and "Validate allocation compliance" | Establish that useful unit economics requires attributable usage and an explicit policy for direct and shared costs. |
| [OpenAI — Cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization) | Sections "Cost and latency", "Batch API", and "Flex processing" | Inspect concrete AI cost levers and latency-for-cost trade-offs while keeping the transferable model provider-independent. |
| [OpenTelemetry GenAI semantic conventions — metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md) | Metric "gen_ai.client.token.usage" plus model/provider attributes used to correlate usage to the request path | Connect measured provider usage to request, route, and release identity instead of estimating cost from prompt text alone. |
<!-- learning-sources:end -->

## Why this matters

A lower bill is not automatically better unit economics.

Traffic may have fallen, answer quality may have degraded, retries may have increased, or a cheaper model may require more attempts to complete the same useful task.

Cost engineering connects attributable spend to delivered value.

## 1. Diagnostic first

Before studying the sources, explain:

- why total spend and cost per request can still be misleading;
- which costs materially belong to one Knowledge Assistant workflow;
- how shared retrieval, gateway, or observability cost should be treated;
- why the cheapest price per token can lose on cost per successful task;
- which unit metric fits an interactive assistant versus an offline pipeline.

If the answer is only "reduce tokens," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
total spend
→ absolute cost

technical unit cost
→ cost per request / token / workflow

useful-outcome unit cost
→ cost per successful answer / task / case / other value unit

allocation
→ how usage and shared cost are attributed to the unit

optimization
→ lower unit cost without breaking quality, latency, or reliability
```

Provider price tables are inputs to a cost model, not the competency.

## 3. Independent practice

Use the [Performance & Economics evidence contract](../../../projects/knowledge-assistant/performance-economics/).

Baseline cost per useful outcome, identify the dominant controllable driver, change one thing, rerun the same workload, and compare quality, latency, errors, and unit economics.

## 4. Failure work

Exercise:

- retry amplification;
- agent or tool loops;
- a cheaper model with worse successful-outcome rate;
- a batch/asynchronous trade-off for latency-insensitive work;
- shared-cost attribution;
- an abnormal-spend guardrail.

At least one nominally cheaper configuration should be rejected.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the cost boundary, allocation rule, technical and useful-outcome unit metrics, reproduce the optimization, and understand why the chosen configuration beats a cheaper-looking alternative under the product contract.

A raw monthly-spend dashboard is not sufficient.

## 6. Transfer

Redesign the unit economics for a workload with a different value unit, traffic shape, shared platform mix, and latency tolerance.

## 7. Applied evidence

Applied evidence is a measurable improvement in cost per useful outcome that remains inside the declared quality, latency, and reliability constraints.
