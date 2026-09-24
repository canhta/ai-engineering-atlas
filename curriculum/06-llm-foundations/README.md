# LLM Foundations

Mechanisms and system behavior behind modern language models.

## Ready routes

- [Tokenization](tokenization/) — build and inspect a byte-level BPE tokenizer, measure bytes per token across languages and domains, and diagnose tokenization-caused failures.
- [Self-Attention](self-attention/) — implement causal self-attention, interpret the attention matrix, and diagnose masking and shape bugs.
- [Decoding and Sampling](decoding-sampling/) — implement greedy, temperature, top-k, and top-p selection and the generation loop, and explain constrained decoding as masking.
- [KV Cache](kv-cache/) — add a cache to a GPT with an equivalence test, size its memory, and relate it to provider prompt caching.
- [LLM Inference Behavior](inference/) — measure prefill and decode (time to first token, per-token latency, throughput) and estimate weights-plus-cache memory.
- [Context Windows](context-windows/) — separate the hard token limit, the cost of long inputs, and measured effective use by position.

## Scope

- tokenization
- embeddings and positional information
- self-attention
- transformer blocks
- language-model training objectives
- decoding and sampling
- context windows and KV cache
- inference performance
- quantization and model compression
- model families and capability trade-offs
