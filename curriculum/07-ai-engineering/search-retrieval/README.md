# Search and Retrieval

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

RAG starts too late in the reasoning process. Before generation, vector databases, or rerankers, you need to know whether a simple retrieval system can find the right evidence and where it fails.

## 1. Diagnostic first

Given a small document collection and ten real queries, design a retrieval baseline with document/query representation, scoring/ranking, relevance judgments, top-k evaluation, latency measurement, and failure categories.

Explain one case where exact/term matching should be strong and one where vocabulary mismatch should hurt it.

## 2. Mental model

Primary source: Manning, Raghavan, and Schütze, [*Introduction to Information Retrieval*](https://nlp.stanford.edu/IR-book/).

Read:

- Chapter 6 — **Scoring, term weighting and the vector space model**, focusing on §§6.2–6.3;
- Chapter 8 — **Evaluation in information retrieval**, focusing on ranked-retrieval evaluation and relevance judgments.

Then use Chip Huyen, *AI Engineering*, Chapter 6 **RAG and Agents** → **Retrieval Algorithms** (from p. 257) to connect classical retrieval choices to modern AI/RAG systems.

## 3. Guided practice

Before tuning, choose five representative queries, inspect top results, label relevance, classify every miss, and predict which change should address each failure.

Useful categories: vocabulary mismatch, rare identifiers/error codes, noisy common terms, document structure, metadata/filtering need, stale/missing content, and relevance-label ambiguity.

## 4. Independent practice — lexical baseline

Use the [Knowledge Assistant](../../../projects/knowledge-assistant/). Preserve the corpus version, query/eval set, relevance labels, retrieval configuration, top-k results, metric(s), latency, and failure notes.

Do **not** remove this baseline when embeddings are added. It is the comparison control.

## 5. Exit evidence

You are at **demonstrated** when you can implement ranked lexical retrieval, explain why documents received their scores, measure retrieval separately from generation, identify concrete miss categories, and state which failures justify semantic retrieval.

## 6. Transfer

Move to a corpus where lexical signals matter differently—for example support tickets with IDs/error codes or policy documents requiring metadata filters—and design the baseline again.

## 7. Applied evidence

Applied evidence is a real retrieval decision based on measured behavior: keeping lexical search, adding a semantic path, changing indexing/tokenization, or rejecting complexity because the baseline already meets the contract.
