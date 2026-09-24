# Decoding and Sampling

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch) | Chapter 5, section 5.3 "Decoding strategies to control randomness": 5.3.1 "Temperature scaling", 5.3.2 "Top-k sampling", 5.3.3 "Modifying the text generation function"; the generation loop itself is Chapter 4, section 4.7 "Generating text" | Temperature and top-k added one at a time to a generate function you can read end to end. |
| [Stanford CS336 — Language Modeling From Scratch](https://cs336.stanford.edu/) | Assignment 1 handout (version 26.0.3), section 6 "Generating text": paragraphs "Softmax", "Decoding", and "Decoder tricks", equations 21-24 | Precise definitions: the one-step decoding equation, temperature-scaled softmax, and the nucleus set V(p) as the smallest set whose mass reaches p. |
| [How to generate text: using different decoding methods for language generation with Transformers](https://huggingface.co/blog/how-to-generate) | Sections "Greedy Search", "Beam search", "Sampling", "Top-K Sampling", and "Top-p (nucleus) sampling" | Greedy, beam search, and sampling compared on the same prompt, including repetition under greedy and beam search. |
| [Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) | Introduction (before "The original sin: floating-point non-associativity") and section "Batch invariance and “determinism”" | Why temperature 0 selects the argmax in theory yet a hosted API can still return different text: the logits themselves change with server batch size. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `dl.softmax` | [Stanford CS336 — Language Modeling From Scratch](https://cs336.stanford.edu/) | Assignment 1 handout (cs336_assignment1_basics.pdf, version 26.0.3), section 6 "Generating text", paragraphs "Softmax" and "Decoder tricks" (equation 23 and the note on tau → 0) | Patch softmax and temperature scaling as used at the output layer. |
<!-- learning-sources:end -->

## Why this matters

A language model outputs a score (logit) for every token in its vocabulary. Decoding turns those scores into one chosen token, appends it, and asks again. The choice rule is not part of the model, and changing it changes behavior as much as changing the prompt.

Other routes depend on it. [AI Evaluation](../../07-ai-engineering/evaluation/) measures run-to-run variance, which exists because of sampling. [Structured Outputs](../../07-ai-engineering/structured-outputs/) relies on constrained decoding, which is masking at this step.

## Prerequisite check

- **Tokenization** (`llm.tokenization`): the vocabulary that decoding chooses from.
- **Softmax** (`dl.softmax`, coverage): if you cannot compute softmax at temperature 1 and 0.5 for logits `[2.0, 1.0, 0.1]` and say where the distribution goes as temperature approaches 0, read the patch in the table above, then return.

## 1. Diagnostic first

Before studying, try to:

1. list the candidate set for top-k=3 and for top-p=0.8 given a 6-token probability vector;
2. predict what happens if temperature is applied to the probabilities instead of the logits;
3. explain why a greedy decoder can loop, and name two ways out;
4. explain why a temperature-0 request to a hosted API can still return different text.

If you can also pass the [decoding lab](../../../labs/decoding-sampling/) tests without the reference, move to the transfer task.

## 2. Mental model

Use the Learning sources table above, in this order:

1. Raschka §5.3–5.3.3: temperature and top-k added to a `generate` function you already know from §4.7.
2. CS336 Assignment 1 §6: the precise definitions. Equation 23 is temperature; equation 24 defines the nucleus as the smallest set whose mass reaches `p`.
3. von Platen, "How to generate text": greedy, beam search, and sampling on the same prompt. Note where greedy and beam search repeat.
4. Horace He, "Defeating Nondeterminism in LLM Inference", introduction and "Batch invariance": why temperature 0 is not a determinism guarantee from a hosted API.

```text
logits (one per vocabulary token, last position only)
  → mask (constrained decoding)            optional
  → divide by temperature (0 = argmax)
  → softmax
  → top-k, then top-p                      optional
  → sample one token → append → repeat until <eos> or the limit
```

Use the Transformer Explainer to watch GPT-2's distribution change as you move temperature, top-k, and top-p.

## 3. Guided practice

Load pretrained GPT-2 as in Raschka §5.5, then run the §5.3.3 `generate` at three temperature and top-k settings on one prompt. Write down what you expect each output to look like before you run it.

## 4. Independent lab

Complete the [Decoding and Sampling Lab](../../../labs/decoding-sampling/). It runs in the browser.

It includes:

- a starter with one contract per function;
- tests for the edge cases that cause real bugs (the top-p boundary token, temperature 0, the order of temperature and top-p, renormalization);
- a toy bigram model small enough to predict greedy output by hand;
- experiments, a bug-injection task, and the constrained-decoding transfer;
- a reference solution.

Attempt the starter before opening the reference.

## 5. Experiments

Predict first:

- sample 20 completions at three temperatures and count distinct outputs;
- produce a greedy repetition loop and remove it with sampling or a repetition penalty;
- mask the candidate set to an allowed vocabulary and show every output complies.

## 6. Exit evidence

You are at **demonstrated** when you have:

- decoding functions passing tests, including the top-p boundary and temperature 0;
- one diagnosed decoding bug, with the symptom you predicted and the one you saw;
- the diversity experiment with its prediction recorded first;
- an explanation, from the mechanism, of why the same trained model behaves differently under different decoding choices.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 7. Transfer

A feature requires the answer to be one of five labels. Explain which decoding-level control enforces that, which controls only make it more likely (temperature, top-k, the prompt), and what must still be validated after generation.

## 8. Delayed review

Roughly 1 day, 1 week, and 1 month later, without notes:

- write the top-p rule;
- compute a distribution by hand from logits and a temperature;
- explain one reason temperature 0 is not a determinism guarantee.

## 9. Project connection

[Tiny Transformer → Decoding](../../../projects/tiny-transformer/#decoding): compare greedy decoding with one stochastic strategy on your model. If you have not trained a model, use the pretrained GPT-2 weights from Raschka §5.5.
