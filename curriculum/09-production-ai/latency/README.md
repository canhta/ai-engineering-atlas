# Latency Engineering

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OpenAI — Latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization) | Sections "Seven principles", "Generate fewer tokens", "Use fewer input tokens", "Make fewer requests", "Parallelize", "Make your users wait less", and "Don’t default to an LLM" | Establish a practical taxonomy of AI-specific latency levers and the fact that the best lever depends on the measured path and product constraints. |
| [OpenTelemetry GenAI semantic conventions — metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md) | Metrics "gen_ai.client.operation.duration", "gen_ai.client.operation.time_to_first_chunk", and "gen_ai.invoke_workflow.duration" | Separate provider-operation duration, streaming first-chunk latency, and whole-workflow duration. |
| [Google SRE — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) | Latency percentile discussion in "Service Level Objectives", including the 50th, 95th, and 99th percentile example | Ground typical versus tail latency reasoning and define user-relevant objectives with distributions rather than averages. |
| [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) | Sections "The Four Golden Signals" and "Worrying About Your Tail (or, Instrumentation and Performance)" | Connect latency to errors, traffic, saturation, histograms, and tail behavior under load. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.performance-engineering` | [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) | Sections "The Four Golden Signals" and "Worrying About Your Tail (or, Instrumentation and Performance)" | Patch distribution, tail-latency, saturation, and bottleneck reasoning needed for AI latency work without requiring the full Performance Engineering curriculum. |
<!-- learning-sources:end -->

## Why this matters

AI latency is not one model-call number.

Users experience the whole critical path: application work, retrieval, tools, provider/model processing, retries, queueing, and possibly time-to-first-chunk before completion.

The route starts by measuring that path and defining which latency matters to the product.

## 1. Diagnostic first

Before studying the sources, explain:

- the critical path in one representative request;
- why p50 and p99 can tell different stories;
- why failed-request latency should not be mixed blindly with successful requests;
- which metric would change if you shorten output, remove a sequential request, or add streaming;
- how an optimization can appear faster by silently making the answer worse.

If the answer is only "use a faster model," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
workflow latency
→ full user/request path

provider operation latency
→ one model/provider operation

TTFC
→ first streamed chunk, only when streaming exists

tail latency
→ slow end of the distribution that averages can hide

critical path
→ serial work that determines completion
```

Optimize the measured path, not a generic checklist.

## 3. Independent practice

Use the [Performance & Economics evidence contract](../../../projects/knowledge-assistant/performance-economics/).

Baseline the Knowledge Assistant, write the bottleneck hypothesis first, make one targeted change, rerun the same workload, and compare latency distribution, errors, and quality.

## 4. Failure work

Exercise:

- a serial request chain;
- output-heavy generation;
- context/input reduction with little measured benefit;
- safe and unsafe parallelization;
- load that worsens tail latency;
- a candidate that improves p50 but harms p99 or quality.

At least one optimization should be rejected.

## 5. Exit evidence

You are at **demonstrated** when another engineer can reproduce the workload, inspect the critical path and p50/p95/p99 evidence, rerun the experiment, and understand why the optimization was kept or reverted from quality, reliability, and tail-latency evidence.

An average-latency screenshot is not sufficient.

## 6. Transfer

Move the latency contract to a workload with different interaction, concurrency, provider, and quality constraints.

## 7. Applied evidence

Applied evidence is a measured production improvement to a user-relevant latency objective that survives quality and reliability checks.
