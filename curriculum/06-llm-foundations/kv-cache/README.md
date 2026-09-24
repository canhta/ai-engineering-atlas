# KV Cache

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch) | Bonus material ch04/03_kv-cache/README.md: sections "How it works" and "KV cache implementation" (steps 1-5: registering the cache buffers, forward pass with use_cache, clearing the cache, propagating use_cache, using the cache in generation) | The cache added to a GPT implementation you already know, one marked change at a time. |
| [Hugging Face Transformers — How caching works](https://huggingface.co/docs/transformers/cache_explanation) | Sections "Attention matrices", "Cache class", and "Cache storage implementation" | The cached-attention equation, per-layer caching, cache tensor shapes [batch, heads, seq_len, head_dim], and the rule that the attention mask covers past plus new tokens. |
| [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) | Section 2.2 "LLM Service & Autoregressive Generation" and section 3 "Memory Challenges in LLM Serving" (the OPT-13B calculation: 2 × 5120 × 40 × 2 bytes = 800 KB per token) | Why KV memory, not compute, limits how many requests a server can batch, including fragmentation. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `llm.transformer` | [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch) | Chapter 4, section 4.5 "Connecting attention and linear layers in a transformer block" and section 4.6 "Coding the GPT model" | Patch only the stacked-block structure needed to see that the cache is kept per layer. |
<!-- learning-sources:end -->

## Why this matters

Without a cache, generating token `t` recomputes the keys and values of every earlier token, in every layer. Under causal masking those keys and values never change, so a model can keep them and compute only the new token's.

That saves compute and costs memory: every request holds its own cache, in every layer, growing with every token. That memory, not arithmetic, is what limits how many requests a server can batch. Provider prompt caching ([Caching](../../09-production-ai/caching/)) is the same cache reused across requests that share a prefix.

## Prerequisite check

- **Self-attention** (`llm.self-attention`, ready): Q, K, V and the causal mask.
- **Decoding** (`llm.decoding-sampling`): the loop the cache speeds up.
- **Transformer blocks** (`llm.transformer`, coverage): if you cannot say where K and V are computed in each block and how many K/V tensors one forward pass produces, read the patch in the table above.

## 1. Diagnostic first

Before studying, try to:

1. state which tensors are new at step `t` and which come from the cache;
2. compute the per-token cache size for OPT-13B (hidden size 5120, 40 layers, FP16);
3. explain why editing one early token of a prompt invalidates a prompt cache for everything after it;
4. explain why the cache is used at inference time but not in training.

If you can also add a cache to a small GPT and prove equivalence, go to the transfer task.

## 2. Mental model

Use the Learning sources table above:

1. Raschka's KV-cache bonus, "How it works" and steps 1–5 of "KV cache implementation". Read each `# NEW` change in `gpt_with_kv_cache.py` and say why it is needed.
2. Hugging Face "How caching works": the shapes, the per-layer cache, and the attention-mask length rule.
3. PagedAttention §2.2 and §3: why a serving system's batch size is limited by cache memory.

```text
per token, per request:
  2 (K and V) × n_layers × (n_heads × head_dim) × bytes_per_element

per request:  × sequence length
per server:   × concurrent requests
```

Check the formula against the paper: 2 × 5120 (hidden size) × 40 (layers) × 2 bytes = 800 KB per token for OPT-13B. When you size a model from its published configuration, check whether it shares K/V heads across query heads (grouped-query attention); if it does, use the number of K/V heads, not query heads.

## 3. Guided practice

Run Raschka's `gpt_ch04.py` and `gpt_with_kv_cache.py`, reproduce the "Simple performance comparison" on your hardware, and confirm both produce the same text. The weights are random; equivalence does not need a trained model.

## 4. Independent practice

In the [Tiny Transformer inference-behavior milestone](../../../projects/tiny-transformer/#inference-behavior), add a cache to your model. If you have no Tiny Transformer model yet, use Raschka's `gpt_ch04.py` as the starter and leave `gpt_with_kv_cache.py` closed until you are done: it is the reference.

Write the equivalence test first: greedy decoding with and without the cache must produce identical tokens. The bonus folder's `tests.py` shows one way to write it.

## 5. Experiments

Predict first:

- tokens per second with and without the cache at two generation lengths;
- cache size against sequence length, compared with your calculation;
- one injected bug (forget to append, keep the attention mask at the uncached length, or do not clear the cache between prompts), diagnosed from where the output first diverges from the uncached reference.

## 6. Exit evidence

You are at **demonstrated** when you have:

- a cached decoder that matches uncached greedy decoding token for token, with a test;
- a KV-memory calculation for a named open model, checked against its published configuration;
- one diagnosed injected cache bug;
- an explanation of provider prompt-prefix caching in terms of KV reuse.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 7. Transfer

Read Tip 2, "Truncate Cache via Sliding Window", in Raschka's "Optimizing the KV Cache Implementation". Predict what the model can no longer attend to and which tasks degrade, then check with a prompt longer than the window.

## 8. Delayed review

Roughly 1 day, 1 week, and 1 month later, without notes:

- write the cached-attention update;
- compute KV memory for a new configuration;
- explain one cache bug and its symptom.

## 9. Project connection

[Tiny Transformer → Inference behavior](../../../projects/tiny-transformer/#inference-behavior): the cache is added to the same model you measure in [LLM Inference Behavior](../inference/).
