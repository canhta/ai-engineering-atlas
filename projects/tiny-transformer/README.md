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

## Milestone 0 — experiment contract

Before writing model code, record:

- corpus and license;
- vocabulary/tokenization choice;
- context length;
- model size;
- training budget;
- one simple baseline;
- metrics to record.

**Artifact:** short experiment note.

## Milestone 1 — training mechanics

Build or inspect enough numerical machinery to explain one training step:

```text
forward pass → loss → gradients → parameter update
```

Depending on prior knowledge, this may use an autodiff framework or a small autograd exercise.

**Evidence:**

- trace one parameter from forward computation to update;
- diagnose one unstable or missing-gradient case.

## Milestone 2 — tokenizer and embeddings

Implement or configure a simple tokenizer and embedding lookup.

**Experiment:**

- inspect sequence-length changes under at least two tokenization choices or vocabularies;
- record the effect on training/inference input length.

**Evidence:** explain what the tokenizer does that the embedding layer does not.

## Milestone 3 — self-attention

Implement simplified causal self-attention.

Use the [Self-Attention competency](../../curriculum/06-llm-foundations/self-attention/) as the learning route.

**Required artifacts:**

- implementation;
- masking tests;
- attention visualization;
- sequence-length experiment.

## Milestone 4 — transformer block

Compose:

- attention;
- residual connections;
- normalization;
- feed-forward network.

**Failure work:** break one residual or normalization path and diagnose training behavior.

## Milestone 5 — language-model training

Train the small model enough to verify the pipeline.

Record:

- train/validation loss;
- learning rate;
- tokens/sec or step time;
- hardware;
- configuration.

The goal is not a leaderboard score. The goal is to connect training behavior to architecture and data choices.

## Milestone 6 — decoding

Implement or compare decoding behavior.

At minimum compare deterministic decoding with one stochastic strategy.

**Evidence:** explain why the same trained model can produce different output behavior under different decoding choices.

## Milestone 7 — inference behavior

Measure the system rather than stopping at generation.

Inspect at least:

- prompt length;
- generation length;
- latency;
- memory if observable;
- effect of repeated autoregressive decoding.

When the curriculum introduces KV cache or quantization, extend this same project rather than creating a disconnected demo.

## Completion evidence

This project supports **applied** evidence only when the learner can connect a model-level change to measured behavior.

A finished repository with copied code is not sufficient.
