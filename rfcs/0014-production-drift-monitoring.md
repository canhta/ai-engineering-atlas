# RFC 0014 — Production Drift Monitoring

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner through continued implementation approval

## Summary

Promote the existing `production.drift` coverage node to a ready route.

No catalog node is added or removed.

Drift is the final concrete Production AI capability before the broader synthesis nodes `production.architecture` and `production.mlops-llmops`.

## Core decision

The route must enforce this distinction:

> **distribution drift is an investigation signal, not proof of quality degradation.**

The reverse also matters:

> **quality can regress without a clear input-distribution drift alert.**

A production learner therefore needs both drift monitoring and independent evaluation/feedback evidence.

## Why now

The learner already has:

- production observability;
- versioned release identity;
- AI evaluation;
- release gates and rollback;
- latency/cost evidence;
- caching/streaming failure behavior.

That makes it possible to compare a current population against a known-good reference while preserving enough context to explain whether a change came from traffic, data, release identity, provider behavior, retrieval state, or actual quality degradation.

## Evidence reviewed

### Google — Rules of Machine Learning

<https://developers.google.com/machine-learning/guides/rules-of-ml>

Relevant sections:

- "Training-Serving Skew";
- Rule #29;
- Rule #37 "Measure Training/Serving Skew".

This establishes explicit serving-time measurement and the reality that data/pipeline changes and feedback loops can alter production behavior.

### Google Cloud — Model Monitoring overview

<https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/model-monitoring/overview>

Relevant sections:

- "Model Monitoring v2 overview";
- "Monitoring objectives".

This provides the reference/current, scheduled-window, distribution, threshold, and model-version monitoring model.

The current v2 product is marked Preview, so it is used as a monitoring-pattern reference rather than a recommendation to depend on a pre-GA service.

### Evidently — Data quality monitoring and drift detection for text data

<https://www.evidentlyai.com/blog/evidently-data-quality-monitoring-and-drift-detection-for-text-data>

Relevant sections:

- "How does it work?";
- "Drift detection on text data".

This gives an LLM-relevant example of comparing reference/current text populations through text-content and descriptor drift.

### NannyML — Don't let yourself be fooled by data drift

<https://www.nannyml.com/blog/when-data-drift-does-not-affect-performance-machine-learning-models>

Relevant sections:

- "Limitations of univariate data drift";
- "When to use data drift methods?";
- "Conclusion".

This is included specifically to prevent the curriculum from teaching drift as a direct proxy for production performance.

## Capability boundary

`production.drift` owns:

- reference/current window design;
- signal and segment selection;
- input/query and output/response distribution monitoring;
- text/unstructured drift patterns;
- threshold/backtest discipline;
- false-positive analysis;
- correlation with quality/operational evidence;
- response playbooks;
- feeding material production slices back into evaluation.

It does not own:

- generic observability instrumentation;
- full AI evaluation design;
- release/version identity;
- retrieval data lifecycle;
- automatic retraining;
- one vendor's drift algorithm.

## Knowledge Assistant integration

Add:

`projects/knowledge-assistant/drift-monitoring/`

Insert a `drift-monitoring` milestone after progressive release/rollback and before security failure work.

Required project evidence:

- drift contract;
- reference/current window record;
- threshold/backtest record;
- segmented drift record;
- harmless-drift record;
- quality-without-drift record;
- drift investigation;
- response playbook;
- evaluation/regression-set update.

## Promotion gate

- [x] the existing catalog node is reused;
- [x] all prerequisites are ready;
- [x] reference and current populations are explicit;
- [x] release identity is part of reference/current interpretation;
- [x] input/query and quality drift are distinguished;
- [x] data-quality failures are separate from statistical drift;
- [x] thresholds require rationale/backtesting rather than arbitrary constants;
- [x] seasonality/sample-size effects are considered;
- [x] segmented monitoring is required;
- [x] one harmless drift case is required;
- [x] one quality regression without obvious drift is required;
- [x] one noisy monitor is rejected;
- [x] alerts map to an investigation/response playbook;
- [x] material production slices feed durable evaluation evidence;
- [x] exact source locators are recorded;
- [x] the existing Knowledge Assistant is extended rather than replaced;
- [x] generated status/site data is updated in the same batch;
- [x] repository validation must pass before completion.

## Alternatives considered

### Make drift the main production quality monitor

Rejected. Drift can create false alarms and can miss quality failures.

### Alert on every statistically significant distribution change

Rejected. Large sample sizes, seasonality, harmless traffic changes, and segmentation can make significance unactionable.

### Automatically retrain or roll back on drift

Rejected. The appropriate response depends on quality impact and root cause.

### Monitor only aggregate traffic

Rejected. Important tenant, language, route, or workflow shifts can be hidden by a stable aggregate.

### Treat an intentional release change as unexplained drift

Rejected. Versioning and release identity must explain planned changes first.

## Impact

After implementation:

- `production.drift` becomes ready;
- repository counts become **115 catalog / 32 ready / 83 coverage**;
- Production AI becomes **11 / 9 ready**.

Only `production.architecture` and `production.mlops-llmops` remain as Production AI coverage nodes. They should be treated as synthesis routes over the now-ready concrete capabilities rather than as new bags of topics.
