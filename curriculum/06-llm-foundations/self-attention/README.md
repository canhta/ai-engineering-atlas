# Self-Attention

**Target level:** L2 — Practical competence

## Prerequisites

- vector dot products
- embeddings
- softmax

## Diagnostic

Before studying, try to:

1. explain the roles of queries, keys, and values;
2. explain why autoregressive language models use a causal mask;
3. describe how the size of a full attention matrix changes with sequence length.

If these are already comfortable, complete the implementation and exit test rather than rereading the topic.

## Learn

Use the primary and visual resources listed in [competency.yaml](competency.yaml).

## Practice

Implement simplified causal self-attention and expose the intermediate score, mask, probability, and output tensors.

## Visualize

Plot the attention matrix for a short sequence. Compare the matrix before and after causal masking.

## Experiment

Increase sequence length and record runtime and memory use. Connect the measurements to the shape of the attention matrix.

## Exit criteria

You should be able to:

- explain Q, K, and V;
- implement basic causal self-attention;
- visualize and interpret an attention matrix;
- explain the sequence-length cost of full attention;
- diagnose an incorrect causal mask.
