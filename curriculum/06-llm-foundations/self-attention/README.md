# Self-Attention

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

## Why this matters

Self-attention is a core mechanism inside transformer models. For an AI engineer, recognizing the formula is not enough. You should be able to trace the tensors, implement a simplified version, inspect its behavior, and diagnose masking or shape failures.

## 1. Diagnostic first

Before studying, try to:

1. explain the roles of Q, K, and V;
2. state the shape of the attention-score matrix for a sequence of length (n);
3. explain why an autoregressive decoder needs a causal mask;
4. predict what happens to the score matrix when sequence length doubles;
5. implement or debug a tiny single-head attention example.

If you can already do this and satisfy the exit evidence, skip guided study.

## Prerequisite check

You do **not** need to complete full prerequisite courses first. Patch only the gap that blocks the attention route.

- **Dot product** — if you cannot compute/interpret a vector dot product, use Raschka Chapter 3 §3.3 simple self-attention examples and trace how dot products become attention scores.
- **Embeddings** — if token IDs versus learned vectors are unclear, use Raschka Chapter 2 §2.7, **Creating token embeddings**.
- **Softmax** — if normalized score-to-weight behavior is unclear, use the softmax step in Raschka Chapter 3 §3.3 and explain why rows become positive normalized weights.

Return to the diagnostic after the patch. Do not expand a small prerequisite gap into a separate long course unless the gap persists.
## 2. Mental model

Primary route:

- Sebastian Raschka, *Build a Large Language Model (From Scratch)* — [Chapter 3 code](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch03/01_main-chapter-code), especially **sections 3.3-3.5**:
  - attention weights;
  - trainable self-attention;
  - causal attention.

The section numbers were verified against the official repository.

Visual companions:

- [3Blue1Brown — Attention in Transformers](https://www.3blue1brown.com/lessons/attention/)
- [Jay Alammar — The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)

Use visuals to inspect the mechanism, not as a substitute for implementation.

## 3. Guided practice

While following the chapter examples, record:

- input shape;
- Q/K/V shapes;
- score-matrix shape;
- mask shape;
- softmax dimension;
- output shape.

Explain why each operation exists before moving on.

## 4. Independent lab

Complete the [Self-Attention Lab](../../../labs/self-attention/).

It includes:

- starter implementation;
- contract tests;
- reference solution;
- visualization task;
- bug-injection exercise;
- sequence-length experiment;
- transfer challenge.

Attempt the starter before opening the reference solution.

## 5. Exit evidence

You are at **demonstrated** when you can:

- explain Q/K/V, scaling, and causal masking from memory;
- implement causal self-attention;
- interpret the attention matrix;
- diagnose a broken mask;
- derive sequence-length cost from tensor dimensions.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 6. Transfer

Given a sequence of image patches instead of text tokens, explain:

- what Q/K/V are computed from;
- what remains unchanged;
- whether a causal mask is required and why.

Passing this moves the evidence toward **transferred**.

## 7. Delayed review

Suggested retrieval checks: roughly 1 day, 1 week, and 1 month later.

Before reopening the source:

- redraw the mechanism;
- reconstruct important tensor shapes;
- explain one masking failure;
- write the core computation.

## 8. Project connection

This competency feeds the [Tiny Transformer](../../../projects/tiny-transformer/) Foundation spine.

The project revisits attention inside a full transformer and later connects it to decoding and inference measurements.
