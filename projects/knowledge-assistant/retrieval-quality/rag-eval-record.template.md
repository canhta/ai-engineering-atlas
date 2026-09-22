# RAG Evaluation Record

## Evaluation contract

- product objective:
- corpus version:
- query/eval-set version:
- system version:
- unacceptable failures:

## Retrieval evidence

- Recall@K / context recall:
- ranking / context precision:
- important query slices:
- retrieval failures:

## Context evidence

- required evidence present?
- irrelevant/noisy context?
- duplicated context?
- missing provenance?
- context failures:

## Generation evidence

- faithfulness / groundedness:
- answer relevance / correctness:
- abstention behavior where relevant:
- generation failures:

## End-to-end evidence

- task success:
- latency:
- cost:
- critical failures:

## Evaluator provenance

For each model-based metric:

- evaluator model/version:
- rubric/prompt version:
- human-reviewed calibration sample:
- known limitations:

## Diagnosis

Classify bad examples as primarily:

- retrieval miss;
- ranking/context-selection failure;
- insufficient/noisy context;
- unfaithful generation;
- answer-quality failure despite sufficient context;
- ambiguous or invalid evaluation label.

## Release / architecture decision

## Regression cases added
