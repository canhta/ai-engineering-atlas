# Context Windows

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch) | Chapter 2, section 2.8 "Encoding word positions" (pos_embedding_layer = Embedding(context_length, output_dim)); Chapter 4, section 4.7 "Generating text" (generate_text_simple crops the context "if it exceeds the supported context size") | Why a learned absolute-position table fixes the maximum input length, and the simplest fix: keep only the last context_length tokens. |
| [Stanford CS336 — Language Modeling From Scratch](https://cs336.stanford.edu/) | Assignment 1 handout (version 26.0.3), problem transformer_accounting, part (e): GPT-2 XL with the context length raised to 16,384 | How total forward-pass FLOPs and each component's share change as the context grows. |
| [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172) | Section 2.1 "Experimental Setup", section 2.3 "Results and Discussion", and section 5 "Is More Context Is Always Better? A Case Study With Open-Domain QA" | Measured position sensitivity (accuracy is highest when the relevant passage is at the start or end), and evidence that more retrieved context is not always better. |
| [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Section "Why context engineering is important to building capable agents" (context rot; n² pairwise relationships) | Context as a finite attention budget, the production framing that ai.context-engineering builds on. |
<!-- learning-sources:end -->

## Why this matters

"The model has a 128K context window" packs three different constraints into one number:

1. **The hard limit.** Prompt tokens plus requested output tokens must fit. With learned absolute positions, the limit is the size of the position table.
2. **The cost.** Every token in the window takes KV-cache memory for the whole request, and attention work grows with length.
3. **Effective use.** Fitting is not the same as being used. Measured accuracy depends on where the relevant information sits.

[Context Engineering](../../07-ai-engineering/context-engineering/) designs systems under this constraint. This route teaches the constraint itself.

## Prerequisite check

- **Tokenization** (`llm.tokenization`): windows are counted in tokens, not characters.
- **KV cache** (`llm.kv-cache`): the memory a long request holds.

## 1. Diagnostic first

Before studying, try to:

1. say what happens to a request with a 120K-token prompt and 16K requested output on a 128K model, and give two fixes;
2. explain why 2,000 tokens into a model with `context_length=1024` and learned position embeddings fails;
3. decide whether "supports 1M tokens" is evidence that the model will find a fact in the middle of 1M tokens.

## 2. Mental model

Use the Learning sources table above:

1. **Hard limit.** Raschka §2.8: the position embedding is a table with `context_length` rows. Then §4.7: `generate_text_simple` crops the input to the supported context size. Say what the crop throws away.
2. **Cost.** CS336 Assignment 1, `transformer_accounting` (e): what happens to total FLOPs and to each component's share when GPT-2 XL goes from 1,024 to 16,384 tokens. Add the KV-cache memory from the previous route.
3. **Effective use.** Lost in the Middle §2.1 (the setup you will reproduce), §2.3 (accuracy is highest when the answer passage is at the start or end), and §5 (more retrieved passages is not always better).
4. **Production framing.** Anthropic's "Why context engineering is important to building capable agents": context rot and the attention budget.

```text
fits?      prompt_tokens + max_output_tokens ≤ window
costs?     KV memory ∝ tokens in the window; attention work grows with length
works?     measure it: accuracy by position, on your task and model
```

## 3. Guided practice

Call your Tiny Transformer (or Raschka's `GPTModel` from §4.6) with more tokens than `context_length` and without the crop. Read the error, explain it from the position table, fix it with truncation, and state what information the fix discards.

## 4. Independent practice — position experiment

Reproduce a small version of Lost in the Middle §2.1 with the paper's released data ([lost-in-the-middle repository](https://github.com/nelson-liu/lost-in-the-middle), `qa_data/10_total_documents/`): the same questions, with the answer passage at position 0, 4, or 9 of 10 documents.

- **Default:** 30 questions per position (90 calls) on the model the Knowledge Assistant uses. Estimate the cost before running.
- **No-cost path:** the same three files on a small instruction-tuned model you run locally, for example with Hugging Face Transformers on CPU. The repository publishes inputs and scripts, not model responses, so there are no recorded outputs to reuse; you produce your own.

Predict the accuracy at each position before running. Score an answer as correct if it contains one of the annotated answers, as the paper does. Report the sample size next to every number, and state what 30 questions per position can and cannot show.

## 5. Experiments

- The position experiment above.
- KV-cache memory at 25%, 50%, and 100% of a named model's window.
- The over-length failure from the guided practice.

## 6. Exit evidence

You are at **demonstrated** when you have:

- a fit calculation, and the over-length failure diagnosed from the error;
- KV-cache memory at full window length for a named model;
- a position results table for at least three positions and one model, with an interpretation that does not overclaim from a small sample;
- a written recommendation for one Knowledge Assistant request that exceeds or underuses the window.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 7. Transfer

A feature must summarize long documents. Choose between single-pass long context, map-reduce summarization, and retrieval, using fit, cost, and your position evidence.

## 8. Delayed review

Roughly 1 day, 1 week, and 1 month later, without notes:

- compute a fit or no-fit case;
- state the Lost in the Middle finding and one condition under which it may not hold;
- compute full-window KV memory for a new configuration.

## 9. Project connection

- [Tiny Transformer](../../../projects/tiny-transformer/): the over-length failure uses the context length you chose in the experiment contract.
- [Knowledge Assistant](../../../projects/knowledge-assistant/): the recommendation and, if you use its model, the position results feed [Context Engineering](../../07-ai-engineering/context-engineering/).
