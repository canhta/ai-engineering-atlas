# Applied AI Foundation Artifacts

This directory defines the evidence contract for the first Knowledge Assistant slice.

Do not treat the example files as answers. Replace them with evidence from your chosen corpus and user problem.

## Required progression

```text
product brief
→ versioned query set + relevance judgments
→ lexical baseline
→ failure taxonomy
→ embedding retrieval
→ same-query-set comparison
→ decision record
```

## Required artifacts

### 1. Product brief

Start from [product-brief.template.md](product-brief.template.md).

The brief must define the user/workflow, pain, value, simplest baseline, success criteria, constraints, unacceptable failures, scope, and stop condition before architecture selection.

### 2. Query/evaluation set

Use [queries.example.jsonl](queries.example.jsonl) only as a format example.

Your real set should contain representative queries and explicit relevance judgments. Version it; do not silently edit labels after seeing retrieval results.

### 3. Lexical baseline record

Record:

- corpus/version;
- retrieval configuration;
- metric(s);
- per-query top-k;
- latency;
- failure category for misses.

Keep this result after semantic retrieval is added.

### 4. Embedding retrieval record

Run against the same corpus version, query set, labels, metric, and comparable latency measurement.

Add query slices for at least:

- vocabulary mismatch/paraphrase;
- exact identifiers or rare lexical signals;
- domain-specific terminology.

### 5. Decision record

Start from [decision-record.template.md](decision-record.template.md).

The decision may be:

- keep lexical retrieval;
- use semantic retrieval;
- keep both for a later hybrid/reranking experiment;
- collect better evidence before changing architecture.

The record must explain which measured failures justify the next step.

## Evidence quality

A screenshot of a good-looking result is not enough.

The slice is complete when another engineer can reproduce the comparison and understand why the architecture changed—or why it did not.
