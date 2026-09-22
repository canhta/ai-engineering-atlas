# Reranking

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

A first-stage retriever must search broadly and cheaply. A reranker can spend more compute on a much smaller candidate set to improve final ordering.

That second stage is useful only when:

1. the relevant evidence reached the candidate set; and
2. the ranking improvement is worth the added latency/cost.

## 1. Diagnostic first

Explain:

- why an expensive pairwise scorer is not normally run over millions of documents;
- why candidate recall constrains the reranker's ceiling;
- what metric would show that top results improved;
- how you would choose candidate-set size.

If those answers are concrete, start with the project experiment.

## 2. Mental model

Primary route: [Sentence Transformers — Retrieve & Re-Rank](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html).

Read exactly:

- **Retrieve & Re-Rank Pipeline**
- **Retrieval: Bi-Encoder**
- **Re-Ranker: Cross-Encoder**

The important abstraction is broader than this library:

```text
fast candidate generation
→ candidate set
→ slower query-document scoring
→ final ranking
```

The documentation explicitly allows the first stage to be lexical or dense. CrossEncoder is a concrete teaching mechanism, not the competency definition.

Use *Introduction to Information Retrieval*, Chapter 8, for ranked-retrieval evaluation.

## 3. Independent experiment

Use the [Retrieval Quality evidence contract](../../../projects/knowledge-assistant/retrieval-quality/).

Record:

- first-stage retriever/version;
- candidate-set size;
- candidate Recall@K;
- reranker/version;
- ranking metric before/after;
- p50/p95 retrieval latency where possible;
- query slices.

Sweep candidate-set size instead of choosing 100 because an example used 100.

## 4. Failure work

A reranker cannot recover a document that never entered the candidate set.

For bad results distinguish:

- first-stage miss;
- relevant candidate present but ordered badly;
- reranker/domain mismatch;
- ambiguous relevance label;
- quality gain too small for added latency.

## 5. Exit evidence

You are at **demonstrated** when you can show both sides of the trade-off: improved ordering and its operational price.

“Cross-encoder score went up” is not sufficient evidence.

## 6. Transfer

Change the first-stage candidate generator and redesign the experiment around its new error profile.

## 7. Applied evidence

Applied evidence is a real decision to keep, tune, or remove reranking based on candidate recall, ranking quality, latency, and failure analysis.
