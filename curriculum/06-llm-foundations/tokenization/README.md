# Tokenization

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → retained

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE) | Chapters 00:14:56 "strings in Python, Unicode code points" through 00:57:36 "regex patterns to force splits across categories" (ends 01:11:38): Unicode, UTF-8, BPE walkthrough, counting and merging pairs, the training loop and compression ratio, decoding, encoding, regex splitting | Build the GPT tokenizer while watching it built, from bytes to a regex-split byte-level BPE. |
| [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch) | Chapter 2, section 2.5 "BytePair encoding"; bonus notebook ch02/05_bpe-from-scratch/bpe-from-scratch-simple.ipynb sections 1-3 ("The main idea behind byte pair encoding", "A simple BPE implementation", "BPE implementation walkthrough") | The same algorithm as a readable notebook, for learners who prefer text to video. |
| [OpenAI Cookbook — How to count tokens with tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken) | Sections "5. Comparing encodings" and "6. Counting tokens for chat completions API calls" | Compare encodings on the same string and count chat-message tokens, including the note that the count is an estimate. |
<!-- learning-sources:end -->

## Why this matters

A model never sees text. It sees integer token IDs produced by a tokenizer that was trained separately, on its own data, with its own algorithm. Cost, latency, context budgets, and prompt caching are all counted in those tokens.

Many odd model behaviors trace back to this stage: arithmetic on numbers split into uneven pieces, a trailing space that changes the output, Vietnamese text that costs several times more tokens than the same content in English, and a special token that a user can type into a chat box.

## 1. Diagnostic first

Before studying, try to:

1. count the UTF-8 bytes in `"héllo 👋"` and explain why a byte-level tokenizer never needs an unknown token;
2. perform one BPE merge by hand from a table of pair counts;
3. predict whether the same paragraph costs the same number of tokens in English and in Vietnamese on one tokenizer;
4. explain why a user typing `<|endoftext|>` is a tokenizer concern.

If you can also complete [minbpe](https://github.com/karpathy/minbpe/blob/master/exercise.md) step 1 without help, skip to the independent practice.

## 2. Mental model

Use the Learning sources table above. Pick one primary source:

- **Video:** Karpathy, from 00:14:56 (Unicode code points) to 01:11:38 (the end of the regex chapter). Pause before each implementation step and write it yourself first; the video's own advice is to try each step before he gives it away.
- **Text:** Raschka §2.5, then the bonus notebook `bpe-from-scratch-simple.ipynb` sections 1–3.

Keep these distinctions explicit:

```text
string → UTF-8 bytes → (regex split) → BPE merges → token IDs
token IDs → embedding lookup (not this route: llm.embeddings)

vocabulary size ↑  → sequence length ↓, embedding table ↑
merges are learned from the tokenizer's training data, not the model's
```

Then read the OpenAI Cookbook sections 5 and 6 to see the same string under several encodings and how chat messages are counted.

## 3. Guided practice

[minbpe exercise](https://github.com/karpathy/minbpe/blob/master/exercise.md) steps 1 and 2: `BasicTokenizer`, then `RegexTokenizer` with the GPT-4 split pattern. Compare the merges you learn before and after regex splitting.

## 4. Independent practice

minbpe step 3: load the GPT-4 merges and match tiktoken's `cl100k_base` on the exercise's test string, including the byte shuffle the exercise describes. The minbpe repository code is the reference solution; open it only after an honest attempt.

Strong learners may instead complete Stanford CS336 Assignment 1 problems `train_bpe` and `tokenizer` (handout §2.4–2.6), which ship with tests.

## 5. Experiments

Predict first, then measure:

- bytes per token for one tokenizer on English prose, Vietnamese prose, Python code, and JSON;
- the token count of one Knowledge Assistant prompt under two tokenizers (use [Tiktokenizer](https://tiktokenizer.vercel.app/) or tiktoken);
- two quirks from Karpathy's chapter 01:51:41, such as arithmetic on split digits, trailing whitespace, or special tokens. Reproduce each and explain it from the tokenizer.

## 6. Exit evidence

You are at **demonstrated** when you have:

- a BPE tokenizer with round-trip tests that include non-ASCII input;
- a bytes-per-token table across at least three text types, with an explanation;
- one reproduced tokenization failure with a diagnosis;
- an explanation of what the tokenizer does that the embedding layer does not.

Use the [evidence rubric](../../../assessments/evidence-rubric.md).

## 7. Transfer

Take a tokenizer you have not used, such as a SentencePiece tokenizer (Karpathy chapter 01:28:42). Predict how it handles raw bytes and characters outside its vocabulary, then check on real input.

## 8. Delayed review

Roughly 1 day, 1 week, and 1 month later, without notes:

- perform one BPE merge on a new string;
- explain why token counts differ across providers and languages;
- name one tokenization failure and the input that triggers it.

## 9. Project connection

[Tiny Transformer → Tokenizer and embeddings](../../../projects/tiny-transformer/#tokenizer-and-embeddings): compare sequence length under two tokenizers on the project corpus. The embedding half of that milestone belongs to `llm.embeddings`, which is not a ready route yet.
