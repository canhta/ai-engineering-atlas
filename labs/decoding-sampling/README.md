# Decoding and Sampling Lab

Companion lab for [llm.decoding-sampling](../../curriculum/06-llm-foundations/decoding-sampling/).

## Goal

Implement the step that turns a model's logits into the next token: greedy selection, temperature, top-k, top-p, sampling, and the autoregressive loop around them. The tests check the edge cases where decoding code usually goes wrong.

The "model" is [toy_lm.py](toy_lm.py): a fixed bigram table over eight words. It returns one logit per vocabulary entry, as a real model does for the last position, and it is small enough that you can predict greedy output by reading it. Decoding GPT-2 itself is the route's guided practice (Raschka §5.3 with the weights from §5.5).

## Setup

Run it in the browser from the lab page, or locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Task 1 — implement

Complete the functions in [starter.py](starter.py). Each docstring is the contract.

| Function                  | What it does                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `softmax`                 | Temperature-scaled softmax (CS336 A1 equation 23), numerically stable                             |
| `greedy`                  | Argmax, lowest index on a tie                                                                     |
| `top_k_filter`            | Keep the `k` most likely tokens, renormalize                                                      |
| `top_p_filter`            | Keep the smallest set whose mass reaches `p` (CS336 A1 equation 24), renormalize                  |
| `next_token_distribution` | Mask, then temperature (0 means greedy), then top-k, then top-p                                   |
| `sample`                  | One `rng.random()` draw, inverted through the cumulative distribution                             |
| `generate`                | The loop: logits for the sequence so far → distribution → sample → append, until `<eos>` or limit |
| `mask_logits`             | The transfer task (below); implement it last                                                      |

Use NumPy array operations. Do not call a framework's generation or sampling helper.

## Task 2 — tests

```bash
python tests.py
```

The tests check:

- distributions sum to one and excluded tokens get exactly zero probability;
- temperature scales the logits, sharpens below 1, and flattens above 1; temperature 0 is greedy;
- the top-p set is the smallest set that reaches `p`, including the token that crosses `p`;
- temperature is applied before top-p;
- the same seed gives the same token, and sample frequencies follow the distribution;
- the loop stops at `<eos>` or `max_new_tokens` and returns only new tokens;
- the result matches the reference on random logits.

When a test passes, ask what bug it would catch.

## Task 3 — experiments

Write each prediction down before you run anything.

1. **Diversity.** Once the tests pass, run `python starter.py` locally. It generates 20 completions from `the` at temperatures 0.2, 0.7, and 1.2 and counts distinct outputs. Predict the three counts first. Then explain, from the bigram table, which choice points make outputs differ at 0.2.
2. **Greedy loop.** Predict the greedy output from `the` by reading the table. Confirm with `generate(..., temperature=0)`. Find two ways out of the loop: sampling, and a repetition penalty (lower the logit of any token already generated, then check whether the loop still forms).
3. **Top-k vs top-p.** For the logits after `the` and after `cat`, list the candidate set for `top_k=2` and for `top_p=0.9`. Explain why top-p keeps a different number of tokens at different positions while top-k does not.

## Task 4 — break it

Make one change at a time in your passing implementation. Predict which check fails and what the symptom will be, then run the tests.

- Apply the temperature to the probabilities instead of the logits (divide the probabilities by `tau` and renormalize).
- Make the top-p boundary off by one: drop the token that crosses `p`.
- Apply top-p before the temperature.
- Skip the renormalization after a filter, so `sample` draws from scores that do not sum to one.

For each, write down the symptom you would see in generated text, not only the failing assertion.

## Transfer challenge — constrained decoding

A classifier prompt must answer with one of a fixed set of labels.

1. Implement `mask_logits` and the `allowed` argument of `next_token_distribution`. The last tests check that no token outside the allowed set can be produced, at any temperature.
2. Answer in writing:
   - Which of these guarantees the output is in the label set: masking the logits, a lower temperature, top-k, or an instruction in the prompt? Which only make it more likely?
   - A label is several tokens long (`"not relevant"`). What must the mask depend on at each step?
   - What must still be validated after generation, even with the mask?

Compare your answers with the constrained-decoding section that [ai.structured-outputs](../../curriculum/07-ai-engineering/structured-outputs/) reads.

## Evidence

To claim **demonstrated**, keep:

- the implementation and the passing test output;
- the three experiment predictions and results;
- one diagnosed bug from Task 4, with the symptom you predicted and the one you saw;
- the transfer answers.

Try the lab before opening [solution.py](solution.py).
