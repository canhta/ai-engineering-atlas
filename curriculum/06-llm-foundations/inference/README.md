# LLM Inference Behavior

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/) | Chapter 1.8 "Deep dive into Text Generation Inference with LLMs": sections "The Two-Phase Inference Process" ("The Prefill Phase", "The Decode Phase") and "Practical Challenges and Optimization" ("Key Performance Metrics", "The Context Length Challenge", "The KV Cache Optimization") | A practitioner-level map of prefill, decode, TTFT, TPOT, throughput, and memory. |
| [Stanford CS336 — Language Modeling From Scratch](https://cs336.stanford.edu/) | Lecture 10 (Inference), trace at cs336.stanford.edu/lectures/?trace=lecture_10: functions review_of_arithmetic_intensity, arithmetic_intensity_of_inference, and throughput_and_latency | Why prefill can be compute-bound and generation is memory-bound, what batching does to latency and throughput, and why TTFT is essentially prefill time. |
| [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) | Section 3 "Memory Challenges in LLM Serving" (already read in llm.kv-cache) | Why the number of requests a server can batch is limited by KV-cache memory. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.performance-engineering` | [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) | Sections "The Four Golden Signals" and "Worrying About Your Tail (or, Instrumentation and Performance)" | Patch distribution, tail-latency, saturation, and bottleneck reasoning needed to read inference measurements, without requiring the full Performance Engineering curriculum. |
<!-- learning-sources:end -->

## Why this matters

[Latency Engineering](../../09-production-ai/latency/) and [Streaming](../../09-production-ai/streaming/) ask you to predict what shorter prompts, shorter outputs, cached prefixes, and streaming will change. Those levers act on different phases of inference:

- **prefill** reads the whole prompt in one parallel pass and fills the KV cache; it sets time to first token;
- **decode** produces one token per step, reading the weights and the cache each time; it sets per-token latency.

This route gives you that model and makes you measure it, so a provider tip becomes a prediction you can check.

## Prerequisite check

- **KV cache** (`llm.kv-cache`) and **decoding** (`llm.decoding-sampling`): what each decode step reads and produces.
- **Performance engineering** (`systems.performance-engineering`, coverage): if you cannot distinguish mean from p50/p95/p99 or say what evidence a bottleneck claim needs, read the patch in the table above.

## 1. Diagnostic first

Before studying, try to:

1. compare a 4,000-token prompt with a 50-token answer against a 50-token prompt with a 1,000-token answer: which has the higher time to first token, which the higher total latency, and why;
2. estimate the memory to load a 7B-parameter model at 16-bit precision;
3. explain why a larger batch raises throughput but can raise per-request latency;
4. explain why generation is memory-bound even with spare compute.

## 2. Mental model

Use the Learning sources table above:

1. Hugging Face LLM Course 1.8: prefill, decode, and the four metrics (TTFT, TPOT, throughput, VRAM).
2. CS336 Lecture 10: open the trace and step through `arithmetic_intensity_of_inference` and `throughput_and_latency`. The summary lines are "Prefill is compute-bound, generation is memory-bound" and "time-to-first-token (TTFT) is essentially a function of prefill time".
3. PagedAttention §3 (read in the KV-cache route): batch size is limited by cache memory.

One check while you read: the course lists memory as growing quadratically with context length, while Raschka's KV-cache README says the cache grows linearly. Work out which memory each statement is about before you move on.

```text
TTFT       ≈ queueing + prefill (grows with prompt length)
per token  ≈ one decode step (reads weights + cache; grows slowly with context)
end to end ≈ TTFT + output_tokens × per-token latency
memory     ≈ weights + batch × sequence × KV bytes per token
```

## 3. Guided practice

CS336 Assignment 1, problem `transformer_accounting` (a): parameter count and load memory for the GPT-2 XL-shaped model. Then redo the memory at 16-bit precision and add the KV cache for one 1,024-token request.

## 4. Independent practice

In the [Tiny Transformer inference-behavior milestone](../../../projects/tiny-transformer/#inference-behavior), measure your model, or GPT-2 small on CPU if you have not trained one. Write every prediction down before you run.

- **Prompt sweep:** at least four prompt lengths with a fixed short output. Time the first token separately (for example, time a run that generates one token).
- **Output sweep:** at least three output lengths with a fixed prompt. Per-token latency is (total − first token) / (output tokens − 1).
- **Cache off:** repeat one sweep without the KV cache.
- **Batch:** batch 1 against batch N; record throughput (tokens/s across the batch) and per-request latency.

Report medians over several runs, not a single timing.

## 5. Exit evidence

You are at **demonstrated** when you have:

- tables and plots for both sweeps, the predictions recorded before running, and an explanation of each curve using prefill and decode;
- a memory estimate (weights plus KV cache) for a stated model, request length, and batch size;
- one claim from a provider latency guide (for example "generate fewer tokens") explained from the mechanism, with the conditions under which it does not help.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 6. Transfer

Take one Knowledge Assistant trace from [Latency Engineering](../../09-production-ai/latency/). From its input and output token counts, state whether prefill or decode dominates the model-call time and which optimization to try first.

## 7. Applied evidence

The Tiny Transformer completion rule applies: connect a model-level change (the cache, the context length, the batch size) to a measured change in behavior.

## 8. Delayed review

Roughly 1 day, 1 week, and 1 month later, without notes:

- sketch TTFT against prompt length and per-token latency against output length;
- estimate weights-plus-cache memory for a new configuration;
- explain the latency-throughput trade-off of a larger batch.
