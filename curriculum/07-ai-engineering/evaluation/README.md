# AI Evaluation and Experimentation

**Target level:** L3 — Deep engineering competence

Evaluation is used to compare changes, identify regressions, and decide whether an AI system is ready to release.

## Diagnostic

Try to design an evaluation for a model, prompt, retrieval, or agent change that includes:

- a versioned test set;
- explicit success metrics;
- repeated runs where outputs are stochastic;
- failure categories;
- latency and cost;
- a release threshold.

## Practice

Build a small evaluation harness that compares at least two system configurations and records quality, latency, cost, and failure categories.

Include both deterministic checks and semantic checks where appropriate. When using model-based judges, calibrate them against human-reviewed examples rather than treating the judge as ground truth.

## Exit criteria

You should be able to:

- create and version an evaluation set;
- choose metrics that match the task;
- measure repeated-run variance;
- analyze failures rather than only aggregate scores;
- turn production failures into regression cases;
- justify a release decision with recorded evidence.
