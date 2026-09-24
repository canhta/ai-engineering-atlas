# Tiny Transformer

Reference project for the Foundation spine.

## Purpose

The goal is not to train a useful large language model.

The goal is to build a model small enough that the learner can inspect:

- token IDs;
- embeddings;
- tensor shapes;
- gradients;
- attention matrices;
- transformer blocks;
- decoding;
- training and inference costs.

Use a small synthetic or public-domain text corpus so iteration stays cheap.

## Experiment contract

Before writing model code, record:

- corpus and license;
- vocabulary/tokenization choice;
- context length;
- model size;
- training budget;
- one simple baseline;
- metrics to record.

**Artifact:** short experiment note.

## Training mechanics

Build or inspect enough numerical machinery to explain one training step:

```text
forward pass → loss → gradients → parameter update
```

Depending on prior knowledge, this may use an autodiff framework or a small autograd exercise.

**Evidence:**

- trace one parameter from forward computation to update;
- diagnose one unstable or missing-gradient case.

## Tokenizer and embeddings

Implement or configure a simple tokenizer and embedding lookup.

Use the [Tokenization competency](../../curriculum/06-llm-foundations/tokenization/) as the learning route for the tokenizer half. The embedding half (`llm.embeddings`) has no ready route yet.

**Experiment:**

- inspect sequence-length changes under at least two tokenization choices or vocabularies;
- record the effect on training/inference input length.

**Evidence:** explain what the tokenizer does that the embedding layer does not.

## Self-attention

Implement simplified causal self-attention.

Use the [Self-Attention competency](../../curriculum/06-llm-foundations/self-attention/) as the learning route.

**Required artifacts:**

- implementation;
- masking tests;
- attention visualization;
- sequence-length experiment.

## Transformer block

Compose:

- attention;
- residual connections;
- normalization;
- feed-forward network.

**Failure work:** break one residual or normalization path and diagnose training behavior.

## Language-model training

Train the small model enough to verify the pipeline.

Record:

- train/validation loss;
- learning rate;
- tokens/sec or step time;
- hardware;
- configuration.

The goal is not a leaderboard score. The goal is to connect training behavior to architecture and data choices.

## Decoding

Implement or compare decoding behavior.

Use the [Decoding and Sampling competency](../../curriculum/06-llm-foundations/decoding-sampling/) as the learning route; its [lab](../../labs/decoding-sampling/) implements the selection functions against tests.

At minimum compare deterministic decoding with one stochastic strategy. If you skipped Language-model training, decode with pretrained GPT-2 weights (Raschka, _Build a Large Language Model (From Scratch)_, §5.5) instead of your own model.

**Experiment:** sample several completions per setting and count distinct outputs; record the prediction first.

**Evidence:** explain why the same trained model can produce different output behavior under different decoding choices.

## Inference behavior

Measure the system rather than stopping at generation.

Use the [KV Cache](../../curriculum/06-llm-foundations/kv-cache/) and [LLM Inference Behavior](../../curriculum/06-llm-foundations/inference/) competencies as the learning routes.

Inspect at least:

- prompt length;
- generation length;
- latency;
- memory if observable;
- effect of repeated autoregressive decoding.

**KV cache extension:** add a KV cache to this model. Write a test that cached and uncached greedy decoding produce identical tokens. Inject one cache bug (forget to append, wrong attention-mask length, cache not cleared between prompts) and diagnose it from where the output diverges.

**Measurement:** time to first token across at least four prompt lengths, per-token latency across at least three output lengths, with and without the cache, and batch 1 against batch N. Record each prediction before running and explain each curve with prefill and decode.

**Evidence:** cache code and equivalence test, the measurement tables, and the diagnosed cache bug.

When the curriculum introduces quantization, extend this same project rather than creating a disconnected demo.

## Completion evidence

This project supports **applied** evidence only when the learner can connect a model-level change to measured behavior.

A finished repository with copied code is not sufficient.
