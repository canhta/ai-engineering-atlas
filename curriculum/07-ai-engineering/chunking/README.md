# Chunking

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 6 "RAG and Agents" → "Retrieval Optimization" (pp. 268-272) | Place data preparation and retrieval optimization inside the RAG pipeline rather than treating chunking as an isolated splitter API. |
| [Max–Min semantic chunking of documents for RAG application](https://link.springer.com/article/10.1007/s10791-025-09638-7) | Section 4.2 "RAG evaluation" | Study a controlled comparison where multiple chunking methods are evaluated while retrieval and generation components remain consistent; use the experimental pattern, not the proposed algorithm as a default. |
<!-- learning-sources:end -->

## Why this matters

Chunking changes the unit your retriever can find. A poor boundary can split required evidence, mix unrelated material, duplicate context, or create passages too broad to rank precisely.

The goal is not to learn a splitter API. It is to make chunking a measured retrieval decision.

## 1. Diagnostic first

Given a fixed corpus, retriever, and query set:

- propose three chunking strategies worth comparing;
- define what stays fixed;
- define retrieval and operational measurements;
- predict which query types each strategy should help or hurt;
- explain how you would distinguish a chunking failure from a retriever failure.

If you can do this concretely, move directly to the project experiment.

## 2. Mental model

Use:

1. Chip Huyen, *AI Engineering*, Chapter 6 **RAG and Agents** → **Retrieval Optimization** (pp. 268–272).
2. Kiss, Nagy, Szilágyi, [*Max–Min semantic chunking of documents for RAG application*](https://link.springer.com/article/10.1007/s10791-025-09638-7), especially §4.2 **RAG evaluation**.

The paper is here for its experimental pattern: several chunking methods are compared while the retrieval/generation setup is kept consistent. It is **not** evidence that semantic chunking should be your default.

## 3. Independent experiment

Use the [Retrieval Quality evidence contract](../../../projects/knowledge-assistant/retrieval-quality/).

Compare at least three sensible configurations, for example:

- fixed-size;
- structure-aware / recursive;
- an overlap variant;
- a semantic-boundary strategy.

Keep the corpus, query set, relevance judgments, retriever, and metric definitions fixed where possible.

Record more than one aggregate number:

- Recall@K / ranking quality;
- latency;
- index size;
- duplicated/wasted context;
- query slices;
- concrete misses.

## 4. Failure work

For failed queries classify the dominant problem:

- relevant evidence split across boundaries;
- over-fragmentation;
- chunk too broad/noisy;
- too much duplicated context;
- document structure ignored;
- retriever failure rather than chunking;
- ambiguous relevance label.

Predict the fix before re-indexing.

## 5. Exit evidence

You are at **demonstrated** when another engineer can reproduce the chunking comparison and understand why the selected strategy won for this corpus—and where it still loses.

Do not claim a universal “best chunk size.”

## 6. Transfer

Repeat the design for a structurally different corpus. The task is to change the experiment appropriately, not copy the previous winning configuration.

## 7. Applied evidence

Applied evidence is a real indexing/chunking decision that changes from measured retrieval behavior, including a justified decision to keep a simple strategy.
