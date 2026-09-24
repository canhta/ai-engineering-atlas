# RFC 0023 — LLM Inference Foundations Slice

- Status: Accepted (owner approval, 2026-09-24)
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-24
- Reviewed: 2026-09-24
- Review decision: Approved by the repository owner on 2026-09-24 with the answers recorded under [Owner decisions](#owner-decisions)

## Summary

Promote five existing LLM Foundations coverage nodes, in this order:

1. `llm.tokenization` — Tokenization
2. `llm.decoding-sampling` — Decoding and Sampling
3. `llm.kv-cache` — KV Cache
4. `llm.inference` — LLM Inference Behavior
5. `llm.context-windows` — Context Windows

No catalog node is added, removed, or renamed. No prerequisite of an existing ready route changes in this RFC (see Open questions).

The owner approved the slice on 2026-09-24. All five routes are ready; see [Review outcome](#review-outcome).

## Problem

LLM Foundations is 1 / 11 ready. Only `llm.self-attention` has a route, and the Tiny Transformer project links a route from one milestone out of eight (RFC 0022, finding F6).

Meanwhile twelve AI Engineering and eleven Production AI routes are ready, and several of them assume inference mechanics that no route teaches:

| Ready route              | What it assumes (quoted from its `competency.yaml` or RFC)                                                                                                                                                                     | Foundation node it rests on         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `production.latency`     | "Compare reducing input tokens, reducing output tokens, removing one sequential provider call, and streaming, and state which latency metric each change is expected to affect."                                               | `llm.inference`, `llm.tokenization` |
| `production.streaming`   | "Explain that streaming primarily changes time to first useful output and perceived latency, not necessarily total completion time."                                                                                           | `llm.inference`                     |
| `production.caching`     | "Distinguish provider prompt-prefix caching from application response, retrieval, embedding, tool-result, and other application caches." RFC 0013: "It does not replace `llm.kv-cache`, which belongs to inference internals." | `llm.kv-cache`                      |
| `production.cost`        | "Define at least one technical unit metric such as cost per request, token, or workflow."                                                                                                                                      | `llm.tokenization`                  |
| `ai.structured-outputs`  | "Explain constrained generation conceptually"; its route reads the provider section "Constrained decoding".                                                                                                                    | `llm.decoding-sampling`             |
| `ai.evaluation`          | "Measure repeated-run variance for stochastic systems."                                                                                                                                                                        | `llm.decoding-sampling`             |
| `ai.context-engineering` | RFC 0003: "`llm.context-windows` — context-window mechanics/capacity are foundation knowledge; this competency is system design under that constraint."                                                                        | `llm.context-windows`               |

A learner who reaches these routes without the foundation can pass them by following provider advice ("generate fewer tokens", "turn on prompt caching") without being able to predict when the advice works. The production routes deliberately stop at the provider boundary; the reason behind the advice has no home.

The Applied AI Engineer path (RFC 0020, stage `llm-foundations`, phase C) lists eight entries: tokenization, embeddings, self-attention, transformer, decoding, context windows, KV cache, inference. All five nodes proposed here are on that list. With this slice, six of the eight are ready.

## Why these five, and why this order

### The slice is the inference path, not the training path

The candidate nodes split into two groups:

```text
model internals / training          inference / serving behavior
- llm.embeddings                    - llm.tokenization
- llm.transformer                   - llm.decoding-sampling
- llm.positional-information        - llm.kv-cache
- llm.training                      - llm.inference
- llm.quantization (optimization)   - llm.context-windows
```

The right-hand group is what the ready AI Engineering and Production routes depend on (table above). The left-hand group matters mostly to learners who train or modify models, which is the LLM-systems specialization, not the Applied AI Engineer core.

The right-hand group can also be taught without first training a model: every practice task below runs on either a pretrained GPT-2 checkpoint or on fixed tensors. That removes the dependency on `llm.training`, which needs GPU budget (CS336 Assignment 1 §7 budgets in B200-hours).

### Order

```text
llm.tokenization
      ↓  (tokens are the unit of every later measurement)
llm.decoding-sampling
      ↓  (the autoregressive loop is what the cache accelerates)
llm.kv-cache   ← llm.self-attention (ready)
      ↓
llm.inference  (prefill vs decode, TTFT, per-token latency, throughput, memory)
      ↓
llm.context-windows  (budget, KV memory at full length, position effects)
```

Evidence for the order, from the sources themselves:

- **CS336 Assignment 1** (Spring 2026, handout version 26.0.3): §2 Byte-Pair Encoding Tokenizer → §3 Transformer LM Architecture → §6 Generating text.
- **CS336 Lecture 1** covers tokenization; **Lecture 10 (Inference)** runs `review_of_arithmetic_intensity` → `arithmetic_intensity_of_inference` → `throughput_and_latency` → `reduce_kv_cache_size` → `quantization` → … → `paged_attention`. The lecture establishes the prefill/decode and latency/throughput model first, then treats KV-cache size and quantization as optimizations against it.
- **Raschka, Build a Large Language Model (From Scratch)**: Chapter 2 (tokenization, §2.5 BytePair encoding) → Chapter 4 §4.7 Generating text → Chapter 5 §5.3 Decoding strategies → Chapter 4 bonus `ch04/03_kv-cache`.
- **Hugging Face LLM Course, Chapter 1.8 "Deep dive into Text Generation Inference with LLMs"**: "Context Length and Attention Span" → "The Two-Phase Inference Process" (prefill, decode) → "Sampling Strategies" → "Key Performance Metrics" → "The Context Length Challenge" → "The KV Cache Optimization".

`llm.context-windows` goes last because its useful content for an application engineer is the interaction of three earlier ideas: token counting, KV-cache memory growth, and measured quality at different positions.

### Why not the other candidates now

| Node                         | Reason to defer                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `llm.embeddings`             | Overlaps `dl.embeddings` (coverage, already bridged by the self-attention route) and retrieval embeddings in AI Engineering. The boundary between the three needs a catalog decision before a route is written; see Open questions.        |
| `llm.transformer`            | Needed by `llm.kv-cache` only for "one K/V cache per layer". A bridge covers that (below). A full route belongs with training in a model-internals slice.                                                                                  |
| `llm.positional-information` | RFC 0020 Q11 suggests leaving it off the path. Only `llm.context-windows` touches it, and only through the absolute-position failure, which Raschka §2.8 covers inside the context-window route.                                           |
| `llm.training`               | Tiny Transformer Milestone 5. Needs compute budget and `dl.optimization` / `dl.backpropagation` (both coverage). Best proposed together with `llm.transformer`.                                                                            |
| `llm.quantization`           | CS336 Lecture 10 motivates it with "Less memory means higher latency/throughput (since inference is memory-bound)", which is the `llm.inference` model. Promote after `llm.inference`, with `math.numerical-computing` (coverage) bridged. |

## Evidence

### Source verification

Every locator below was opened on 2026-09-24. "Verified" means the heading, section number, timestamp, or problem name was read in the live source. The table is the record the promotion gate checks against.

| #   | Source                                                                                                                        | Locator                                                                                                                                                                                                              | Status                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | CS336 lecture code `lecture_01.py` (linked from cs336.stanford.edu as `?trace=lecture_01`)                                    | functions `intro_to_tokenization`, `tokenization_examples`, `character_tokenizer`, `byte_tokenizer`, `word_tokenizer`, `bpe_tokenizer`, `get_compression_ratio`                                                      | Verified                                                                                                     |
| 2   | CS336 Assignment 1 handout `cs336_assignment1_basics.pdf` (v26.0.3, Spring 2026)                                              | §2.1–2.6; Problems `train_bpe`, `tokenizer`, `tokenizer_experiments` (§2.7)                                                                                                                                          | Verified                                                                                                     |
| 3   | Karpathy, "Let's build the GPT Tokenizer" (YouTube, 2h13m)                                                                    | 00:14:56–00:57:36 (Unicode, UTF-8, BPE, encode/decode); 01:51:41 "revisiting LLM tokenization quirks"                                                                                                                | Verified on YouTube itself (chapter list in the video description), 2026-09-24                               |
| 4   | `karpathy/minbpe` `exercise.md`                                                                                               | Steps 1–3 (`BasicTokenizer`, `RegexTokenizer`, match GPT-4 via tiktoken)                                                                                                                                             | Verified                                                                                                     |
| 5   | Raschka, LLMs-from-scratch                                                                                                    | Ch. 2 §2.5 "BytePair encoding"; bonus `ch02/05_bpe-from-scratch/bpe-from-scratch-simple.ipynb` §1–3                                                                                                                  | Verified                                                                                                     |
| 6   | OpenAI Cookbook, "How to count tokens with tiktoken" (now at developers.openai.com/cookbook)                                  | §5 "Comparing encodings"; §6 "Counting tokens for chat completions API calls" (including the note that counts are an estimate)                                                                                       | Verified                                                                                                     |
| 7   | Tiktokenizer (tiktokenizer.vercel.app)                                                                                        | Interactive tokenizer with model selector and token count                                                                                                                                                            | Verified                                                                                                     |
| 8   | Raschka, LLMs-from-scratch                                                                                                    | Ch. 5 §5.3 "Decoding strategies to control randomness", §5.3.1 "Temperature scaling", §5.3.2 "Top-k sampling", §5.3.3 "Modifying the text generation function"                                                       | Verified                                                                                                     |
| 9   | CS336 Assignment 1                                                                                                            | §6 "Generating text" (Softmax, Decoding, Decoder tricks; equations 21–24); Problem `decoding`                                                                                                                        | Verified                                                                                                     |
| 10  | von Platen, "How to generate text" (Hugging Face blog)                                                                        | Sections "Greedy Search", "Beam search", "Sampling", "Top-K Sampling", "Top-p (nucleus) sampling"                                                                                                                    | Verified                                                                                                     |
| 11  | Hugging Face Transformers docs, "Generation strategies"                                                                       | "Basic decoding methods": "Greedy search", "Sampling", "Beam search"                                                                                                                                                 | Verified                                                                                                     |
| 12  | Transformer Explainer (Polo Club, GPT-2 small in the browser)                                                                 | Temperature, top-k, and top-p controls on the output probability view                                                                                                                                                | Verified                                                                                                     |
| 13  | Raschka, LLMs-from-scratch                                                                                                    | Ch. 4 §4.7 "Generating text"; Ch. 5 §5.5 "Loading pretrained weights from OpenAI"                                                                                                                                    | Verified                                                                                                     |
| 14  | Raschka, LLMs-from-scratch bonus `ch04/03_kv-cache/README.md`                                                                 | "How it works"; "KV cache implementation" steps 1–5; "Simple performance comparison"; "KV cache advantages and disadvantages"; "Optimizing the KV Cache Implementation" (Tip 1 pre-allocation, Tip 2 sliding window) | Verified                                                                                                     |
| 15  | Hugging Face Transformers docs, "How caching works" (`cache_explanation`)                                                     | Sections "Attention matrices", "Cache class", "Cache storage implementation"                                                                                                                                         | Verified                                                                                                     |
| 16  | Kwon et al., "Efficient Memory Management for Large Language Model Serving with PagedAttention" (SOSP 2023, arXiv 2309.06180) | §2.2 "LLM Service & Autoregressive Generation"; §3 "Memory Challenges in LLM Serving" (includes the OPT-13B 800 KB per token calculation); §4.1 "PagedAttention"                                                     | Verified                                                                                                     |
| 17  | CS336 lecture code `lecture_10.py` (Inference)                                                                                | functions `review_of_arithmetic_intensity`, `arithmetic_intensity_of_inference`, `throughput_and_latency`, `reduce_kv_cache_size`                                                                                    | Verified                                                                                                     |
| 18  | Hugging Face LLM Course, Chapter 1.8                                                                                          | "The Two-Phase Inference Process", "The Prefill Phase", "The Decode Phase", "Key Performance Metrics", "The Context Length Challenge", "The KV Cache Optimization"                                                   | Verified                                                                                                     |
| 19  | Huyen, _AI Engineering_, Ch. 9 "Inference Optimization"                                                                       | "Inference Overview", "Inference Performance Metrics"                                                                                                                                                                | Heading verified in the book's public ToC only; body not read (book is paid). **Dropped** (owner decision 7) |
| 20  | Huyen, _AI Engineering_, Ch. 2 "Understanding Foundation Models"                                                              | "Sampling Fundamentals", "Sampling Strategies", "The Probabilistic Nature of AI"                                                                                                                                     | Heading verified in ToC only. **Dropped** (owner decision 7)                                                 |
| 21  | Huyen, _AI Engineering_, Ch. 5 "Prompt Engineering"                                                                           | "Context Length and Context Efficiency"                                                                                                                                                                              | Heading verified in ToC only. **Dropped** (owner decision 7)                                                 |
| 22  | Liu et al., "Lost in the Middle: How Language Models Use Long Contexts" (TACL 2023, arXiv 2307.03172)                         | §2.1 "Experimental Setup"; §2.3 "Results and Discussion"; §5 "Is More Context Is Always Better?"                                                                                                                     | Verified                                                                                                     |
| 23  | Anthropic, "Effective context engineering for AI agents" (`article.anthropic-context-engineering`, already registered)        | Section "Why context engineering is important to building capable agents" (context rot; n² pairwise relationships)                                                                                                   | Verified                                                                                                     |
| 24  | CS336 Assignment 1                                                                                                            | Problem `transformer_accounting` (a) parameter memory and (e) context length 16,384                                                                                                                                  | Verified                                                                                                     |
| 25  | Raschka, LLMs-from-scratch                                                                                                    | Ch. 2 §2.8 "Encoding word positions"                                                                                                                                                                                 | Verified                                                                                                     |
| 26  | Raschka, LLMs-from-scratch                                                                                                    | Ch. 4 §4.5 "Connecting attention and linear layers in a transformer block", §4.6 "Coding the GPT model"                                                                                                              | Verified                                                                                                     |
| 27  | Google SRE Book, "Monitoring Distributed Systems" (`docs.google-sre-monitoring`, already registered)                          | "The Four Golden Signals"; "Worrying About Your Tail" — reused unchanged from the `production.latency` bridge                                                                                                        | Verified in repo (not rechecked)                                                                             |

Totals: 27 locators. 23 verified in the live source (the Karpathy timestamps were rechecked on YouTube during route authoring); 3 verified only as headings in a table of contents (Huyen), which the routes do not use; 1 reused from an already-reviewed route and rechecked. The [source recheck](#source-recheck-2026-09-24) records what changed during authoring.

### Curriculum evidence

- **Stanford CS336** puts tokenization in Lecture 1 and a full lecture on inference (Lecture 10); Assignment 1 requires a from-scratch BPE tokenizer and a decoder with temperature and top-p. This is the strongest university evidence that tokenization and decoding are implementation-level, not vocabulary-level, knowledge.
- **Hugging Face LLM Course Chapter 1.8** treats prefill/decode, TTFT, TPOT, throughput, context length, and KV cache as introductory material for practitioners, which supports L2 rather than L3 depth for the Applied AI Engineer.
- **Huyen, _AI Engineering_** (`book.chip-huyen-ai-engineering`) places sampling in Ch. 2 and inference metrics in Ch. 9 of a book aimed at application engineers. ToC-level evidence only; no route cites it (owner decision 7).
- **The existing ready routes** listed in Problem are production evidence that these mechanics are needed downstream.
- **vLLM / PagedAttention** is the primary source for why KV-cache memory, not compute, limits serving batch size.

## Proposal

Common conventions for all five routes:

- Target level **L2** (perform and diagnose). The LLM-systems specialization can later require L3 on `llm.inference` and `llm.kv-cache`.
- Practice runs on fixed tensors or on a pretrained GPT-2 small checkpoint, loaded as in Raschka §5.5 or Hugging Face Transformers. No route requires the learner to have trained a model.
- Exit evidence is trace/implement/predict/measure. None of the five uses a quiz as exit evidence.
- Review intervals follow the self-attention route: `[1, 7, 30]` days, starting with retrieval, not rereading.

---

## 1. `llm.tokenization` — Tokenization

**Competency types:** mechanism, engineering-skill
**Target level:** L2
**Target states:** demonstrated, transferred, retained

### Why

Every production number the later routes use (cost per request, input vs output tokens, context budget, cached tokens) is counted in tokens. Tokenization is a separate trained stage with its own failure modes: the same text costs different token counts across models, non-English text and code tokenize less efficiently, and special tokens can be injected through user text.

### Prerequisites

None from the catalog. Bytes and UTF-8 are taught inside the route (Karpathy 00:14:56–00:22:47; CS336 A1 §2.1–2.2), which is smaller than bridging `software.python-ai`.

### Boundary

Not this route: embedding lookup (`llm.embeddings`), cost accounting (`production.cost`), prompt wording (`ai.prompt-engineering`).

### Outcomes

- Explain why LLMs use subword tokens rather than characters, bytes, or words, in terms of vocabulary size and sequence length.
- Trace BPE training on a small string: count pairs, merge, repeat.
- Implement BPE `train`, `encode`, `decode` and show `decode(encode(x)) == x` on non-ASCII text.
- Measure compression ratio (bytes/token) and show how it changes across tokenizer, language, and domain.
- Count tokens for a real provider request and explain why the count is an estimate.
- Diagnose a tokenization-caused failure (split digits, whitespace, special-token handling, non-English cost).

### Diagnostic

- Given `"héllo 👋"`, state how many UTF-8 bytes it has and why a byte-level tokenizer never produces an unknown token.
- Given pair counts for a short byte sequence, perform one BPE merge by hand.
- Predict whether the same paragraph in English and in Vietnamese costs the same number of tokens on one tokenizer, and why.
- Explain why a user typing `<|endoftext|>` into a chat box is a tokenizer concern.

Pass condition: skip guided instruction only if the learner answers the conceptual items and completes minbpe step 1 independently.

### Learning route

- **Mental model:** Karpathy, "Let's build the GPT Tokenizer", 00:14:56–00:57:36 (Unicode, UTF-8, BPE, training loop, decode, encode, regex splitting). _Purpose:_ build the tokenizer while watching it built.
- **Alternative mental model (text):** Raschka Ch. 2 §2.5 and bonus `bpe-from-scratch-simple.ipynb` §1–3. _Purpose:_ the same algorithm as a readable notebook, for learners who prefer text.
- **Visual:** Tiktokenizer. _Purpose:_ see token boundaries and counts change across model tokenizers on the learner's own text.
- **Guided practice:** minbpe `exercise.md` steps 1–2 (`BasicTokenizer`, then `RegexTokenizer`).
- **Independent practice:** minbpe step 3 (match GPT-4's `cl100k_base` output via tiktoken). Strong learners may instead do CS336 A1 Problems `train_bpe` and `tokenizer`, which ship with tests.
- **Production link:** OpenAI Cookbook §5 and §6. _Purpose:_ compare encodings and count chat-message tokens, including why the count is an estimate.

### Experiments

- Compression ratio for one tokenizer on English prose, Vietnamese prose, Python code, and JSON (CS336 A1 Problem `tokenizer_experiments` (a)–(b) is the pattern).
- Predict, then measure, token count for the same Knowledge Assistant prompt under two tokenizers.
- Karpathy 01:51:41 quirks: pick two (arithmetic digits, trailing whitespace, special tokens) and reproduce them.

### Exit evidence

- Working BPE tokenizer with round-trip tests including non-ASCII input.
- One table of bytes/token across at least three text types, with an explanation of the differences.
- One reproduced tokenization failure with a diagnosis.
- Explain what the tokenizer does that the embedding layer does not (this is Tiny Transformer Milestone 2's existing evidence line).

### Transfer

Given a tokenizer you have not used (for example a SentencePiece tokenizer, Karpathy 01:28:42), predict how it handles bytes and unknown characters, then check.

### Review

- Perform one BPE merge from memory on a new string.
- Explain from memory why token counts differ across providers.

### Project integration

Tiny Transformer **Milestone 2 — tokenizer and embeddings**: link `llm.tokenization`. The milestone's existing experiment ("inspect sequence-length changes under at least two tokenization choices") becomes the route's project evidence. The embedding half stays with `llm.embeddings` (coverage).

### Practice packaging

No new lab. minbpe and CS336 A1 already give a task, starter state, tests, and an external reference solution.

---

## 2. `llm.decoding-sampling` — Decoding and Sampling

**Competency types:** mechanism
**Target level:** L2
**Target states:** demonstrated, transferred, retained

### Why

The same model gives different outputs under different decoding settings. Downstream routes rely on this: evaluation measures run-to-run variance (`ai.evaluation`), structured outputs rely on constrained decoding (`ai.structured-outputs`). Without the mechanism, "temperature 0 is deterministic" and "top-p makes it creative" are slogans.

### Prerequisites

- `llm.tokenization` (this slice; promoted first).
- `dl.softmax` (coverage) — bridge:
  - diagnostic: Given logits `[2.0, 1.0, 0.1]`, compute softmax at temperature 1 and at temperature 0.5, and state which way the distribution moves as temperature approaches 0.
  - source: `course.stanford-cs336`
  - locator: Assignment 1 handout §6 "Generating text", paragraphs "Softmax" and "Decoder tricks" (equation 23).
  - purpose: Patch softmax and temperature scaling as used at the output layer.

`llm.self-attention` is deliberately not a prerequisite: decoding operates on the output distribution and can be learned before attention.

### Boundary

Not this route: structured-output API design (`ai.structured-outputs`), evaluation statistics (`ai.evaluation`), speculative decoding (`llm.inference` or later specialist work).

### Outcomes

- Explain the autoregressive loop: logits for the last position → distribution → choose token → append → repeat until end-of-sequence or a limit.
- Implement greedy, temperature, top-k, and top-p selection over a logits vector.
- Predict how temperature, top-k, and top-p change the candidate set and the distribution.
- Explain why beam search suits input-grounded tasks and why it tends to repeat in open-ended generation.
- Explain why temperature 0 or greedy decoding does not by itself guarantee identical outputs from a hosted provider.
- Explain constrained decoding as masking the candidate set before selection.

### Diagnostic

- Given a 6-token probability vector, list the candidate set for top-k=3 and for top-p=0.8.
- Predict what happens to output diversity if temperature is applied after softmax instead of to the logits.
- Explain why a greedy decoder can loop.

### Learning route

- **Mental model:** Raschka Ch. 5 §5.3–5.3.3. _Purpose:_ temperature and top-k, then modifying `generate`.
- **Mental model (precise definitions):** CS336 A1 §6 "Generating text", equations 21–24. _Purpose:_ the one-step decoding equation and the top-p definition.
- **Visual:** Transformer Explainer, temperature/top-k/top-p controls. _Purpose:_ watch the GPT-2 distribution reshape as each control moves.
- **Comparison reading:** von Platen, "How to generate text", sections Greedy Search through Top-p. _Purpose:_ greedy vs beam vs sampling on the same prompt.
- **Optional context:** dropped. Huyen Ch. 2 could not be verified against the book body (owner decision 7). The temperature-0 outcome is taught instead by Horace He, "Defeating Nondeterminism in LLM Inference" (added during authoring).
- **Guided practice:** Raschka §5.3.3, run `generate` with pretrained GPT-2 weights (§5.5) at three temperature/top-k settings.
- **Independent practice:** new lab `labs/decoding-sampling/` (below).

### Experiments

- For one prompt, sample 20 completions at three temperatures and count distinct outputs. Predict first.
- Show a greedy repetition loop and remove it with sampling or a repetition penalty.
- Mask the candidate set to a small allowed vocabulary (for example digits only) and show the output always complies: the mechanism behind constrained decoding.

### Exit evidence

- Decoding functions (greedy, temperature, top-k, top-p) passing tests, including edge cases (top-p boundary token, temperature → 0).
- One diagnosed decoding bug.
- The diversity experiment with a prediction recorded before running.
- An explanation, using the mechanism, of why the same trained model produces different behavior under different decoding choices (Tiny Transformer Milestone 6's existing evidence line).

### Transfer

Given a structured-output requirement (for example, "the answer must be one of five labels"), explain which decoding-level control enforces it, which only makes it more likely, and what must still be validated after generation.

### Review

- Write the top-p selection rule from memory.
- Given logits and a temperature, compute the distribution by hand.

### Project integration

Tiny Transformer **Milestone 6 — decoding**: link `llm.decoding-sampling`. Learners who have not done Milestone 5 (training, `llm.training` coverage) use pretrained GPT-2 weights; the milestone text should say so.

### Practice packaging — new lab justified

`labs/decoding-sampling/`: NumPy only, runs under the existing Pyodide lab contract.

- Task: implement `greedy`, `apply_temperature`, `top_k_filter`, `top_p_filter`, `sample` over fixed logits with a seeded generator.
- Checks: shapes, distributions sum to one, excluded tokens have zero probability, the top-p set is the smallest set reaching `p`, seeded determinism.
- Failure work: temperature applied to probabilities instead of logits; top-p boundary off by one; filtering before vs after temperature; sampling from unnormalized scores.
- Transfer: a masking task that forces output into an allowed set.

Why a lab rather than an external source: CS336's `decoding` problem needs a trained model and gives no failure work; Raschka §5.3 gives code but no tests. Neither checks the edge cases that cause real bugs.

---

## 3. `llm.kv-cache` — KV Cache

**Competency types:** mechanism
**Target level:** L2
**Target states:** demonstrated, transferred, retained

### Why

The KV cache is why generation cost per new token is roughly flat instead of growing with the prefix, and why long contexts and many concurrent requests exhaust accelerator memory. Provider prompt caching (`production.caching`) is prefix reuse of this cache across requests. RFC 0013 already separates the two and leaves the internal half to this node.

### Prerequisites

- `llm.self-attention` (ready).
- `llm.decoding-sampling` (this slice).
- `llm.transformer` (coverage) — bridge:
  - diagnostic: Given a model with `n_layers`, `n_heads`, and `head_dim`, state where K and V are computed in each transformer block and how many K/V tensors one forward pass produces.
  - source: `book.raschka-llm-from-scratch`
  - locator: Chapter 4, §4.5 "Connecting attention and linear layers in a transformer block" and §4.6 "Coding the GPT model".
  - purpose: Patch only the stacked-block structure needed to see that the cache is per layer.

### Boundary

Not this route: application or provider cache operations (`production.caching`); serving schedulers and batching (`llm.inference`); GQA/MQA and cache quantization as design topics (later specialist or `llm.quantization`).

### Outcomes

- Explain why past K and V can be reused under causal masking and why Q cannot be reused the same way.
- Implement incremental decoding with a cache and show outputs equal full recomputation.
- Calculate KV-cache memory per token and per request from layers, heads, head dimension, and bytes per element.
- Predict how cache memory grows with sequence length and batch size.
- Explain the trade-off: less compute per step, more memory held per request.
- Relate provider prompt-prefix caching to KV reuse across requests with an identical prefix.

### Diagnostic

- Given the cached-attention equation, state which tensors are new at step `t` and which are read from the cache.
- Compute the per-token KV-cache size for a stated model (the vLLM paper's OPT-13B example: 2 × 5120 × 40 × 2 bytes = 800 KB is the pattern).
- Explain why changing one token early in a prompt invalidates a provider's prompt cache for everything after it.

### Learning route

- **Mental model:** Raschka bonus `ch04/03_kv-cache/README.md`, sections "How it works" and "KV cache implementation" steps 1–5. _Purpose:_ the cache added to a known GPT implementation, one change at a time.
- **Mental model (shapes):** Hugging Face Transformers, "How caching works", sections "Attention matrices" and "Cache storage implementation". _Purpose:_ the tensor shapes, per-layer caching, and the attention-mask length rule.
- **Production reading:** PagedAttention paper §2.2 and §3. _Purpose:_ why KV memory, not compute, limits serving, including the 800 KB/token calculation and fragmentation.
- **Guided practice:** run Raschka's `gpt_ch04.py` vs `gpt_with_kv_cache.py` and reproduce the "Simple performance comparison" on your own hardware; read "KV cache advantages and disadvantages".
- **Independent practice:** Tiny Transformer Milestone 7 extension (below).

### Experiments

- Predict, then measure, tokens/sec with and without cache at two generation lengths.
- Plot cache size against sequence length; compare with the calculation.
- Inject a cache bug (forget to append; wrong mask length with cache; cache not cleared between prompts) and diagnose it from output divergence against the uncached reference.

### Exit evidence

- Cached decoding that matches uncached decoding token for token under greedy decoding, with a test.
- KV-memory calculation for a named open model, checked against the model's config.
- One diagnosed injected cache bug.
- An explanation of prompt-prefix caching in terms of KV reuse.

### Transfer

Given a sliding-window cache (Raschka "Optimizing the KV Cache Implementation", Tip 2), predict what the model can no longer attend to and which tasks would degrade.

### Review

- Write the cached-attention update from memory.
- Compute KV memory for a new model configuration.

### Project integration

Tiny Transformer **Milestone 7 — inference behavior** already says: "When the curriculum introduces KV cache or quantization, extend this same project rather than creating a disconnected demo." Add the cache there and link `llm.kv-cache`.

### Practice packaging

No new lab proposed. The Raschka bonus provides starter state (`gpt_ch04.py`), a reference (`gpt_with_kv_cache.py`), and `tests.py`; the equivalence test and the failure work live in the Tiny Transformer. See Open questions for a browser-runnable alternative.

---

## 4. `llm.inference` — LLM Inference Behavior

**Competency types:** mechanism, engineering-skill
**Target level:** L2
**Target states:** demonstrated, transferred, applied

### Why

`production.latency` and `production.streaming` ask learners to reason about input vs output tokens and time to first chunk. The reason those levers behave differently is the two-phase model: prefill processes the prompt in parallel and is compute-bound; decode produces one token at a time and is memory-bound. This route supplies that model and makes the learner measure it.

### Prerequisites

- `llm.kv-cache` (this slice).
- `llm.decoding-sampling` (this slice).
- `systems.performance-engineering` (coverage) — reuse the existing bridge from `production.latency` unchanged (`docs.google-sre-monitoring`, "The Four Golden Signals" and "Worrying About Your Tail").

### Boundary

Not this route: production latency objectives, traces, and SLOs (`production.latency`); stream protocol design (`production.streaming`); quantization methods (`llm.quantization`); serving-cluster operations (Specializations).

### Outcomes

- Explain prefill and decode and which one dominates time to first token and per-token latency.
- Explain arithmetic intensity at the level of "prefill is compute-bound, generation is memory-bound".
- Distinguish time to first token, time per output token, end-to-end latency, and throughput, and the latency–throughput trade-off under batching.
- Estimate model weight memory from parameter count and precision, and total memory as weights plus KV cache.
- Measure TTFT and per-token latency as prompt length and output length vary, and explain the curves.
- Predict which of "shorter prompt", "shorter output", "cache the prefix", "stream" changes which metric.

### Diagnostic

- A request has a 4,000-token prompt and a 50-token answer; another has a 50-token prompt and a 1,000-token answer. Which has the higher TTFT, which the higher total latency, and why?
- Estimate the memory needed to load a 7B-parameter model at 16-bit precision.
- Explain why batching more requests raises throughput but can raise per-request latency.

### Learning route

- **Mental model:** Hugging Face LLM Course Chapter 1.8, sections "The Two-Phase Inference Process" through "The KV Cache Optimization". _Purpose:_ a practitioner-level map of prefill, decode, metrics, and memory.
- **Mental model (deeper):** CS336 Lecture 10, `review_of_arithmetic_intensity`, `arithmetic_intensity_of_inference`, `throughput_and_latency`. _Purpose:_ why decode is memory-bound and what the latency/throughput trade-off is.
- **Production reading:** PagedAttention paper §3 (already read in `llm.kv-cache`) for why batch size is memory-limited.
- **Optional context:** dropped. Huyen Ch. 9 could not be verified against the book body (owner decision 7).
- **Guided practice:** CS336 A1 Problem `transformer_accounting` (a) — parameter count and load memory for a GPT-2 XL-shaped model.
- **Independent practice:** Tiny Transformer Milestone 7 measurement (below).

### Experiments

- With GPT-2 small on CPU (Hugging Face Transformers `generate`, or the learner's Tiny Transformer), measure TTFT and per-token latency across at least four prompt lengths and three output lengths. Predict the shape of each curve first.
- Repeat with the cache disabled and explain the difference.
- Batch 1 vs batch N: record throughput and per-request latency.

### Exit evidence

- A measurement table and plots for prompt-length and output-length sweeps, with predictions recorded before running and a written explanation of each curve using prefill/decode.
- A memory estimate (weights + KV cache) for a stated model, request length, and batch size.
- One claim from a provider latency guide (for example "generate fewer tokens") explained from the mechanism, with the conditions under which it does not help.

### Transfer

Take one Knowledge Assistant trace from `production.latency` and state, from its token counts, whether prefill or decode dominates the model-call time and which optimization to try first.

### Review

- Sketch TTFT vs prompt length and per-token latency vs output length from memory.
- Estimate weights-plus-cache memory for a new configuration.

### Project integration

Tiny Transformer **Milestone 7 — inference behavior**: link `llm.inference`. The milestone already requires prompt length, generation length, latency, memory, and "effect of repeated autoregressive decoding"; this route makes those measurements the applied evidence. The project README's completion rule ("connect a model-level change to measured behavior") is the `applied` state.

### Practice packaging

No new lab. The measurement needs a real model and wall-clock timing, which the Pyodide lab runtime is not suited for.

---

## 5. `llm.context-windows` — Context Windows

**Competency types:** mechanism, design-judgment
**Target level:** L2
**Target states:** demonstrated, transferred, retained

### Why

`ai.context-engineering` is system design under a context-window constraint and explicitly leaves the constraint itself to this node (RFC 0003). The constraint has three parts an engineer must separate: the hard token limit (input plus output), the memory and latency cost of long inputs, and the gap between the advertised window and the length the model uses well.

### Prerequisites

- `llm.tokenization` (this slice).
- `llm.kv-cache` (this slice).

`llm.positional-information` is not a prerequisite. The one positional fact needed (a learned absolute-position table has a fixed size) is taught in the route via Raschka §2.8.

### Boundary

Not this route: choosing and assembling context (`ai.context-engineering`); retrieval (`retrieval.*`); context-extension methods such as RoPE scaling (`llm.positional-information`).

### Outcomes

- Compute whether a request fits: prompt tokens + requested output tokens vs the model's window.
- Explain why a model with learned absolute positions cannot accept inputs longer than its trained context length.
- Calculate the KV-cache memory of a request at full window length.
- Explain the difference between advertised context length and effective use, citing measured evidence.
- Measure how answer accuracy changes with the position of relevant information in a long input.
- Recommend truncation, summarization, retrieval, or reordering for a request that does not fit or does not work, with reasons.

### Diagnostic

- A model has a 128K window. A request has a 120K-token prompt and asks for 16K output tokens. What happens, and what are two fixes?
- Why does feeding 2,000 tokens into a model with `context_length=1024` and learned position embeddings fail?
- Is "the model supports 1M tokens" evidence that it will find a fact in the middle of 1M tokens?

### Learning route

- **Mental model (hard limit):** Raschka Ch. 2 §2.8 "Encoding word positions". _Purpose:_ why the position table fixes the maximum input length.
- **Mental model (cost):** CS336 A1 Problem `transformer_accounting` (e). _Purpose:_ how forward-pass FLOPs and component shares change when context grows from 1,024 to 16,384.
- **Mental model (effective use):** Liu et al., "Lost in the Middle", §2.1 and §2.3, and §5. _Purpose:_ measured position sensitivity, and evidence that more retrieved context is not always better.
- **Production framing:** Anthropic, "Effective context engineering for AI agents", section "Why context engineering is important to building capable agents". _Purpose:_ context rot and the attention-budget framing that `ai.context-engineering` builds on.
- **Optional context:** dropped. Huyen Ch. 5 could not be verified against the book body (owner decision 7).
- **Guided practice:** in the Tiny Transformer (or Raschka's GPT), feed an over-length input, read the failure, and fix it with truncation.
- **Independent practice:** a small position-sensitivity experiment (below).

### Experiments

- Reproduce a small version of Lost in the Middle §2.1: a fixed question, one relevant passage and N distractors, relevant passage at the start, middle, and end. Record accuracy per position. Predict first.
- Compute KV memory at 25%, 50%, and 100% of a named model's window.

### Exit evidence

- Fit calculation and the over-length failure diagnosed from the error.
- KV memory at full window for a named model.
- Position-sensitivity results table for at least three positions and one model, with an interpretation that does not overclaim from a small sample.
- A written recommendation for one Knowledge Assistant request that exceeds or underuses the window.

### Transfer

For a long-document summarization feature, decide between single-pass long context, map-reduce summarization, and retrieval, using the fit, cost, and position evidence.

### Review

- Compute a fit/no-fit case from memory.
- State the Lost in the Middle finding and one condition under which it may not hold.

### Project integration

- Tiny Transformer: the over-length failure uses the Milestone 0 context-length choice. No new milestone.
- Knowledge Assistant: the position experiment reuses its evaluation set and feeds `ai.context-engineering`. Where it attaches (an existing milestone or a note in the context-engineering route) is an open question.

### Practice packaging

No new lab. The position experiment needs a capable instruction-following model, which means either a hosted API (cost) or a local model (hardware). The route must state both options and a small default sample size.

---

## New resources to register after approval

Registered already and reused: `course.stanford-cs336`, `book.raschka-llm-from-scratch`, `book.chip-huyen-ai-engineering`, `course.huggingface-llm`, `article.anthropic-context-engineering`, `docs.google-sre-monitoring`.

Proposed new resource entries (IDs are resource IDs, not competency IDs):

| Proposed ID                     | Source                                               | Role                                      |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| `visual.karpathy-gpt-tokenizer` | Karpathy, "Let's build the GPT Tokenizer"            | teaching, visual                          |
| `repo.karpathy-minbpe`          | github.com/karpathy/minbpe                           | practice                                  |
| `docs.openai-tiktoken-counting` | OpenAI Cookbook, "How to count tokens with tiktoken" | production reference                      |
| `visual.tiktokenizer`           | tiktokenizer.vercel.app                              | visual                                    |
| `visual.transformer-explainer`  | poloclub.github.io/transformer-explainer             | visual                                    |
| `article.hf-how-to-generate`    | Hugging Face blog, "How to generate text"            | teaching                                  |
| `docs.hf-generation-strategies` | Hugging Face Transformers, "Generation strategies"   | reference                                 |
| `docs.hf-kv-cache`              | Hugging Face Transformers, "How caching works"       | teaching                                  |
| `paper.vllm-pagedattention`     | Kwon et al., SOSP 2023                               | curriculum evidence, production reference |
| `paper.lost-in-the-middle`      | Liu et al., TACL 2023                                | curriculum evidence, assessment pattern   |

## Promotion gate

No route in this slice moves from `coverage` to `ready` until:

1. the owner reviews this RFC and approves the slice, order, and target levels;
2. every locator in the Source verification table is rechecked during route authoring; the Karpathy timestamps are checked on YouTube itself;
3. the three Huyen locators are verified against the book body or dropped (owner decision 7: dropped);
4. each route's prerequisites use catalog IDs, and every coverage prerequisite (`dl.softmax`, `llm.transformer`, `systems.performance-engineering`) has a bridge with a diagnostic and a verified locator;
5. routes are promoted in order; a route is not promoted before its in-slice prerequisites;
6. `labs/decoding-sampling/` exists with tests, failure work, and a reference that is not the default path, and passes `scripts/validate_labs.py` and the Pyodide lab test;
7. KV-cache exit evidence includes a cached-vs-uncached equivalence test;
8. inference exit evidence includes measurements with predictions recorded before running;
9. context-window exit evidence includes a measured position experiment, not only a citation of Lost in the Middle;
10. Tiny Transformer README and `project.yaml` link the routes at Milestones 2, 6, and 7, resolving RFC 0022 finding F6 for these nodes;
11. new resources are registered in `resources/*.yaml` with `source_verified` and `last_checked`;
12. `python scripts/render_learning_sources.py --write`, `python scripts/render_status.py --write`, and `python scripts/build_site_data.py --write` are run;
13. `make check` and `make site-check` pass;
14. the review outcome is recorded in this RFC before promotion.

## Alternatives considered

### Promote the model-internals path first (embeddings, transformer, positional, training)

Rejected for now. It follows textbook order, but no ready AI Engineering or Production route depends on those nodes directly, it needs GPU budget for training, and `llm.embeddings` has an unresolved boundary with `dl.embeddings`.

### Promote all ten remaining nodes in one RFC

Rejected. The size makes locator verification and review unreliable, and it would force the embeddings boundary decision and the training compute question into the same review.

### Fold KV cache into `llm.inference`

Considered. The catalog already has both IDs, the Applied AI Engineer path lists both, and RFC 0013 points at `llm.kv-cache` by name. KV cache is also a traceable mechanism with its own implementation and bugs, while inference behavior is mostly measurement. Keeping them separate matches the catalog and gives two differently-typed assessments.

### Include `llm.quantization` instead of `llm.context-windows`

Rejected. Quantization builds on the memory-bound model from `llm.inference` and needs a `math.numerical-computing` bridge; it is the natural next item. Context windows has a ready downstream consumer today (`ai.context-engineering`).

### Use one provider's documentation as the main source

Rejected. Provider pages describe API parameters, not the mechanism, and change often. They are used only as production links (token counting) and as the evidence the mechanism explains.

### Add hard prerequisite edges from the ready production routes to these nodes

Deferred to the owner (Open questions). It would change ready contracts and push experienced production engineers through foundation routes they can already diagnose out of.

### Write new labs for every route

Rejected. minbpe, CS336 A1, and the Raschka KV-cache bonus already give tasks, starters, and tests. Only decoding lacks runnable edge-case and failure checks, so only decoding gets a new lab.

## Impact

If approved and fully implemented:

- five nodes move from `coverage` to `ready`; no node is added, removed, or renamed;
- repository counts become **115** catalog / **48** ready / **67** coverage-only (the draft said 46 / 69; two routes were promoted by RFC 0019 while this RFC was in review);
- LLM Foundations becomes **6 / 11** ready;
- Applied AI Engineer path stage `llm-foundations` becomes 6 of 8 entries ready (remaining: `llm.embeddings`, `llm.transformer`);
- new lab: `labs/decoding-sampling/`;
- Tiny Transformer: Milestones 2, 6, 7 link routes; Milestone 6 notes the pretrained-weights path; Milestone 7 gains the KV-cache extension;
- ten new resource entries;
- generated files: `curriculum/STATUS.md`, learner-facing source blocks, `site/src/data/atlas.json`.

## Open questions for the owner

All seven were answered on 2026-09-24; see [Owner decisions](#owner-decisions).

1. **Slice and order.** Approve the five nodes and the order tokenization → decoding → KV cache → inference → context windows? Or swap context windows for quantization?
2. **Downstream edges.** Should `production.latency`, `production.streaming`, and `production.caching` list `llm.inference` / `llm.kv-cache` as prerequisites (with bridges), or should the link stay informal? The draft recommends no hard edge, to avoid forcing production-first learners through foundations.
3. **KV-cache lab.** Accept Raschka's bonus plus the Tiny Transformer as practice, or add a small NumPy `labs/kv-cache/` (cached vs full recompute equivalence, injected bugs) so the evidence is browser-runnable? Extending `labs/self-attention/` is a third option but mixes two competencies in one lab.
4. **Target level of `llm.inference`.** L2 for the Applied AI Engineer, with L3 left to the LLM-systems specialization?
5. **Context-window experiment cost.** Is a hosted-API default acceptable for the position experiment, or must a local-model path be the default?
6. **`llm.embeddings` boundary.** Keep `llm.embeddings` distinct from `dl.embeddings` and retrieval embeddings, merge it, or remove it? This blocks the next LLM Foundations slice, not this one.
7. **Huyen locators.** Is ToC-level verification acceptable for optional reading, or should they be dropped until someone verifies them against the book?

## Review checklist

- [x] Evidence is traceable; every locator has a verification status.
- [x] Existing catalog IDs are reused; no ID is invented.
- [x] The five nodes do not duplicate each other or the ready production routes.
- [x] Coverage prerequisites have bridges with diagnostics and verified locators.
- [x] Exit evidence matches capability type (trace, implement, predict, measure); no quiz is used as exit evidence.
- [x] L2 target depth is appropriate for each node.
- [x] Only one new lab is proposed, and the need for it is stated.
- [x] Tiny Transformer is extended rather than replaced.
- [x] Deferred nodes have a stated reason and a next step.
- [x] Reviewer explicitly approves or requests changes before implementation.

## Owner decisions

Answers to the seven open questions, given by the repository owner on 2026-09-24.

1. **Slice and order.** The five nodes, in the proposed order: tokenization → decoding → KV cache → inference → context windows. Quantization stays deferred.
2. **Downstream edges.** No hard prerequisite edge from `production.latency`, `production.streaming`, or `production.caching`. The link stays informal: the routes point at each other in prose.
3. **KV-cache practice.** Raschka's KV-cache bonus plus the Tiny Transformer inference-behavior step, as proposed. No `labs/kv-cache/`.
4. **Level of `llm.inference`.** L2.
5. **Context-window experiment.** Keep the default (the Knowledge Assistant's hosted model), with a no-cost path the learner can run. The route names it: a small instruction-tuned model run locally on the paper's released data. A recorded-outputs path is not offered, because the Lost in the Middle repository publishes inputs and scripts but no model responses, and this repository does not generate substitutes.
6. **`llm.embeddings` boundary.** Left open for the next slice; not touched here.
7. **Huyen readings.** Dropped unless the exact section locators could be verified against the book content. They could not: the book body is paid, and the public `chiphuyen/aie-book` repository has the ToC and chapter summaries, not the chapters. No route cites Huyen, and she is not listed as curriculum evidence for these five routes.

## Review outcome

Recorded 2026-09-24, before promotion.

- **Decision:** approved by the repository owner with the answers above. No catalog node added, removed, or renamed.
- **Result:** all five routes promoted to `ready`. Counts: 115 catalog, 48 ready, 67 coverage. LLM Foundations is 6 / 11 ready.
- **Prerequisites and bridges:** `dl.softmax` (bridge in `llm.decoding-sampling`: CS336 A1 §6 "Softmax" and "Decoder tricks"), `llm.transformer` (bridge in `llm.kv-cache`: Raschka §4.5–4.6), and `systems.performance-engineering` (bridge in `llm.inference`, reused unchanged from `production.latency`). The other prerequisites are ready or promoted earlier in this slice.
- **Applied AI Engineer path:** `llm.context-windows` moved after `llm.inference` in stage `llm-foundations`, because its prerequisite `llm.kv-cache` came later on the path and `make check` validates path order against prerequisites. The order now matches this RFC. Six of the stage's eight entries are ready.
- **Lab:** `labs/decoding-sampling/` (browser runner, NumPy). Starter with one contract per function, `tests.py` with edge-case checks, a toy bigram model (`toy_lm.py`) small enough to predict greedy output by hand, experiments, four bugs to inject, a constrained-decoding transfer, and `solution.py` as the reference. Each of the four listed bugs was checked to fail at least one test.
- **Tiny Transformer:** `tokenizer-and-embeddings` integrates `llm.tokenization` (the embedding half waits for `llm.embeddings`); `decoding` integrates `llm.decoding-sampling` and notes the pretrained GPT-2 path; `inference-behavior` integrates `llm.kv-cache` and `llm.inference` and gains the KV-cache extension (equivalence test, injected bug) and the measurement plan. This resolves the RFC 0022 F6 warnings for these three milestones; the other F6 warnings stay.
- **Knowledge Assistant:** not changed. Where the context-window position experiment attaches (an existing milestone or the context-engineering route) is still open; the route links the Knowledge Assistant in prose only.

### Changes made during authoring

- **Karpathy range.** The mental-model locator runs from 00:14:56 to the end of the regex chapter (01:11:38), not to 00:57:36, because regex splitting starts at 00:57:36 and minbpe step 2 needs it.
- **Temperature 0.** No verified source in the draft taught why temperature 0 does not guarantee identical outputs from a hosted API. Horace He and Thinking Machines Lab, "Defeating Nondeterminism in LLM Inference" (2025-09-10), introduction and "Batch invariance and “determinism”", was verified and added as `article.thinking-machines-nondeterminism`.
- **Position-experiment data.** `repo.lost-in-the-middle` was registered for the released data files (`qa_data/10_total_documents/…gold_at_0`, `_4`, `_9`), which the experiment uses in both the default and the no-cost path.
- **Context-window truncation.** Raschka §4.7 was added next to §2.8: `generate_text_simple` crops the input "if it exceeds the supported context size", which is the guided fix.
- **Inference route caveat.** The Hugging Face course lists context-length memory as growing quadratically, while Raschka's KV-cache README says the cache grows linearly. The route asks the learner to work out which memory each statement describes rather than asserting one.

### Source recheck (2026-09-24)

Every locator a route cites was opened in the live source on 2026-09-24 before it was committed.

| Resource ID                                | Source                                                                    | Locators verified                                                                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `course.stanford-cs336`                    | Lecture 1 and 10 traces (`var/traces/lecture_01.json`, `lecture_10.json`) | Lecture 1: `tokenization`, `intro_to_tokenization`, `bpe_tokenizer`, `get_compression_ratio`. Lecture 10: `review_of_arithmetic_intensity`, `arithmetic_intensity_of_inference`, `throughput_and_latency`, `reduce_kv_cache_size` |
| `course.stanford-cs336`                    | Assignment 1 handout, version 26.0.3 (Spring 2026)                        | §2.1–2.7 and problems `train_bpe`, `tokenizer`, `tokenizer_experiments`; §6 "Generating text" (Softmax, Decoding, Decoder tricks; equations 21–24) and problem `decoding`; problem `transformer_accounting` (a), (e)              |
| `book.raschka-llm-from-scratch`            | LLMs-from-scratch repository notebooks and bonus READMEs                  | §2.5, §2.8, §4.5, §4.6, §4.7, §5.3–5.3.3, §5.5; `bpe-from-scratch-simple.ipynb` §1–3; `ch04/03_kv-cache/README.md` sections and Tips 1–2; the folder ships `tests.py`                                                             |
| `visual.karpathy-gpt-tokenizer`            | YouTube video `zduSFxRajkE`                                               | Chapter timestamps 00:14:56, 00:57:36, 01:11:38, 01:28:42, 01:51:41 in the description                                                                                                                                            |
| `repo.karpathy-minbpe`                     | `exercise.md`                                                             | Steps 1–3                                                                                                                                                                                                                         |
| `docs.openai-tiktoken-counting`            | OpenAI Cookbook on developers.openai.com                                  | Sections 5 and 6; the estimate note                                                                                                                                                                                               |
| `visual.tiktokenizer`                      | tiktokenizer.vercel.app                                                   | Model selector and token count                                                                                                                                                                                                    |
| `article.hf-how-to-generate`               | Hugging Face blog                                                         | Greedy Search, Beam search, Sampling, Top-K Sampling, Top-p (nucleus) sampling                                                                                                                                                    |
| `docs.hf-generation-strategies`            | Transformers docs                                                         | Basic decoding methods: Greedy search, Sampling, Beam search                                                                                                                                                                      |
| `visual.transformer-explainer`             | Polo Club                                                                 | Temperature, Sampling (Top-k, Top-p) controls; section "Output Probabilities"                                                                                                                                                     |
| `article.thinking-machines-nondeterminism` | Thinking Machines Lab blog                                                | Introduction; "Batch invariance and “determinism”"                                                                                                                                                                                |
| `docs.hf-kv-cache`                         | Transformers docs, "How caching works"                                    | Attention matrices; Cache class; Cache storage implementation                                                                                                                                                                     |
| `paper.vllm-pagedattention`                | arXiv 2309.06180                                                          | §2.2; §3 including the OPT-13B 800 KB per token calculation                                                                                                                                                                       |
| `course.huggingface-llm`                   | LLM Course, Chapter 1.8                                                   | The Two-Phase Inference Process (Prefill, Decode); Key Performance Metrics; The Context Length Challenge; The KV Cache Optimization                                                                                               |
| `paper.lost-in-the-middle`                 | arXiv 2307.03172 (TACL 2023)                                              | §2.1, §2.3, §5; the accuracy metric (an answer appears in the output)                                                                                                                                                             |
| `repo.lost-in-the-middle`                  | nelson-liu/lost-in-the-middle                                             | README "Multi-Document Question Answering Data"; `qa_data/10_total_documents/` files for positions 0, 4, 9; no model responses published                                                                                          |
| `article.anthropic-context-engineering`    | Anthropic engineering blog                                                | "Why context engineering is important to building capable agents" (context rot; n² pairwise relationships)                                                                                                                        |
| `docs.google-sre-monitoring`               | Google SRE book                                                           | "The Four Golden Signals"; "Worrying About Your Tail"                                                                                                                                                                             |
