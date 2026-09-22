# Self-Attention Lab

Companion lab for [llm.self-attention](../../curriculum/06-llm-foundations/self-attention/).

## Goal

Implement causal single-head self-attention and make the important intermediate tensors inspectable.

This lab is deliberately smaller than a framework's production attention implementation.

## Setup

Run it in the browser from the lab page, or locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Task 1 — implement

Complete `causal_self_attention` in [starter.py](starter.py).

Inputs:

- `x`: `[sequence, model_dim]`
- `w_q`, `w_k`, `w_v`: projection matrices

Return:

- output;
- raw scores;
- causal mask;
- attention probabilities.

Write the mechanism yourself with NumPy array operations: no attention helper from a framework, and no `scipy.special.softmax`.

## Task 2 — tests

Run:

```bash
python tests.py
```

The tests check:

- shapes;
- row probabilities sum to one;
- future positions receive zero probability;
- output matches the reference implementation for a fixed example.

Do not stop when the tests pass. Inspect why they pass.

## Task 3 — visualize

Use the returned probability matrix to make a small heatmap or table.

Answer:

- Which cells are forced to zero?
- What changes if causal masking is removed?
- What does one row represent?

## Task 4 — break it

Introduce one bug:

- mask the diagonal too;
- mask the wrong triangle;
- apply softmax on the wrong dimension;
- remove the scaling factor.

Predict the symptom before running the test.

Then diagnose it from tensor values or the attention matrix.

## Experiment

Measure elapsed time for several sequence lengths while keeping model dimension fixed.

Record:

```text
sequence length
score matrix shape
elapsed time
peak memory if available
```

The goal is to connect `n × n` attention scores to observed behavior.

## Transfer challenge

Replace text-token intuition with a sequence of image-patch embeddings.

Explain:

- what the sequence elements now represent;
- what Q/K/V still mean operationally;
- when causal masking would or would not make sense.

## Evidence

To claim **demonstrated**, keep:

- implementation;
- test output;
- visualization;
- one failure diagnosis;
- short explanation of sequence-length cost.

Try the lab before opening [solution.py](solution.py).
