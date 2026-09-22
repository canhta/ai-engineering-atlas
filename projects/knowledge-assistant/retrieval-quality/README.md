# Retrieval Quality Evidence Contract

This directory defines the evidence contract for the second Knowledge Assistant slice.

The goal is not to add more RAG components. The goal is to show **which measured failure each component fixes**.

## Required progression

```text
existing lexical + embedding baselines
→ chunking experiment
→ retrieval failure analysis
→ reranking experiment
→ answer generation
→ retrieval / generation / end-to-end evaluation
→ decision record
```

Keep the corpus, query set, relevance judgments, and evaluation definitions versioned. Change one major variable at a time when comparing retrieval choices.

## 1. Chunking experiment

Start from [experiment-record.template.md](experiment-record.template.md).

Compare at least three sensible strategies for the chosen corpus, for example:

- fixed-size;
- structure-aware / recursive;
- overlap variant;
- semantic boundary strategy.

Do not optimize only for average answer quality. Preserve retrieval-level evidence such as Recall@K, ranking quality, index size, duplicated context, and representative failure slices.

Record the exact splitter configuration so the experiment can be reproduced.

## 2. Reranking experiment

Start from the best justified first-stage retriever, not an artificially perfect candidate set.

Record:

- candidate retriever and candidate-set size;
- candidate Recall@K;
- reranker;
- ranking metric such as MRR or NDCG;
- end-to-end retrieval latency;
- query slices;
- failures the reranker cannot recover because the relevant item was never retrieved.

Vary candidate-set size and measure the quality/latency trade-off.

## 3. RAG evaluation

Use [rag-eval-record.template.md](rag-eval-record.template.md).

Separate at least:

1. **retrieval** — did the system fetch and rank the required evidence?
2. **context** — is the supplied context focused and sufficient?
3. **generation** — does the answer use the supplied context faithfully and answer the question?
4. **end to end** — does the final behavior satisfy the product contract?

A single "RAG score" is not acceptable evidence.

If an LLM-based evaluator is used, record the rubric/model/version and calibrate a sample against human-reviewed labels. Model-based metrics are estimators, not ground truth.

## Completion standard

This slice is complete when another engineer can answer:

- which chunking choice improved which retrieval slice;
- whether reranking improved ordering enough to justify its latency/cost;
- whether bad answers are caused by retrieval, context construction, or generation;
- what evidence justifies the next architecture change.
