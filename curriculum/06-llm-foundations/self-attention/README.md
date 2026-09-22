# Self-Attention

**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

## Why this matters

Self-attention is one of the core mechanisms inside transformer models. For an AI engineer, the goal is not only to recognize the formula. You should be able to trace the tensors, implement a simplified version, inspect its behavior, and diagnose masking or shape failures.

## Start with the diagnostic

Before reading Chapter 3, try to:

1. explain the roles of Q, K, and V;
2. state the shape of the attention-score matrix for a sequence of length n;
3. explain why an autoregressive decoder needs a causal mask;
4. predict what happens to the score matrix when sequence length doubles;
5. implement or debug a very small single-head attention example.

If this is already comfortable, skip the guided material and go to the independent implementation and transfer task.

## Learning route

### Mental model

Primary source:

- Sebastian Raschka, *Build a Large Language Model (From Scratch)* — **Chapter 3, sections 3.3-3.5**.

Use the chapter to progress from simple self-attention to trainable Q/K/V and causal attention.

Visual companions:

- 3Blue1Brown — Attention in Transformers
- Jay Alammar — The Illustrated Transformer

Use these to inspect the mechanism, not as replacements for the implementation.

### Guided practice

While following the first attention examples, stop at each operation and record:

- input shape;
- Q/K/V shapes;
- score-matrix shape;
- mask shape;
- softmax dimension;
- output shape.

Explain why each step exists before moving on.

### Independent practice

From a blank function signature, implement causal single-head self-attention without using a framework attention primitive.

Add tests for:

- output shape;
- no access to future tokens;
- deterministic output for a fixed input and weights;
- a deliberately broken mask.

## Experiment

Before running code, predict the result.

Then:

1. increase sequence length;
2. record score-matrix size, runtime, and memory;
3. visualize the attention probabilities;
4. compare correct and incorrect masking.

The objective is to connect the mathematical object to runtime behavior.

## Exit evidence

You are at **demonstrated** when you can:

- explain Q/K/V, scaling, and causal masking from memory;
- implement causal self-attention;
- interpret the attention matrix;
- diagnose a broken mask;
- derive the sequence-length cost from tensor dimensions.

## Transfer

Given a sequence of image patches instead of text tokens, explain:

- what Q/K/V are computed from;
- what remains unchanged in the mechanism;
- whether a causal mask is required and why.

Passing this task moves the evidence toward **transferred**.

## Delayed review

Suggested retrieval checks: roughly 1 day, 1 week, and 1 month later.

Start from memory:

- redraw the mechanism;
- reconstruct the important tensor shapes;
- explain one masking failure;
- write the core computation before reopening the source.

## Project connection

This competency feeds the **Foundation spine**:

numerical operations → autograd → neural network → tokenizer → **attention** → transformer → decoding.
