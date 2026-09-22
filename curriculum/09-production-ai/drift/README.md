# Drift Monitoring and Response

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Google — Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml) | Section "Training-Serving Skew", especially Rule #29 and Rule #37 "Measure Training/Serving Skew" | Ground production-change monitoring in actual serving data and show that pipeline/data changes and feedback loops can create harmful skew that must be measured explicitly. |
| [Google Cloud — Model Monitoring overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/model-monitoring/overview) | Sections "Model Monitoring v2 overview" and "Monitoring objectives" | Build the reference/current-window model: scheduled monitoring, distribution comparisons, explicit objectives, thresholds, and model-version-aware monitoring. |
| [Evidently — Data quality monitoring and drift detection for text data](https://www.evidentlyai.com/blog/evidently-data-quality-monitoring-and-drift-detection-for-text-data) | Sections "How does it work?" and "Drift detection on text data", including reference/current comparison, text content drift, and text descriptor drift | Inspect concrete ways to monitor unstructured text changes without pretending one scalar statistic completely describes an LLM application's traffic. |
| [NannyML — Don't let yourself be fooled by data drift](https://www.nannyml.com/blog/when-data-drift-does-not-affect-performance-machine-learning-models) | Sections "Limitations of univariate data drift", "When to use data drift methods?", and "Conclusion" | Prevent drift-first alerting from becoming noisy operational dogma: distribution shift can be real while model/product performance remains acceptable. |
<!-- learning-sources:end -->

## Why this matters

Production traffic, data, retrieval content, tools, and external providers keep changing after a release.

A distribution shift can be important, harmless, seasonal, or simply the result of a planned change. Likewise, a quality regression can occur without an obvious input-drift alert.

The route teaches drift as an investigation system connected to evaluation and release identity.

## 1. Diagnostic first

Before studying the sources, explain:

- what the reference and current populations are;
- why a weekday/weekend comparison may be misleading;
- how one tenant can drift while the aggregate stays stable;
- why data drift is not the same thing as answer-quality degradation;
- what evidence is required before a drift alert can trigger mitigation.

If the answer is "alert whenever a distribution test is significant," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
data/input drift
→ production population changed

quality regression
→ the product/evaluation contract worsened

data-quality failure
→ schema, missingness, corruption, or invalid values

planned release change
→ expected state change with a version identity

drift alert
→ reason to investigate, not automatic proof of failure
```

## 3. Independent practice

Use the [Drift Monitoring evidence contract](../../../projects/knowledge-assistant/drift-monitoring/).

Inject harmless drift, quality degradation, segment-only drift, a bad reference window, and a data-quality failure. Backtest thresholds and connect one material production slice to durable regression evidence.

## 4. Failure work

Exercise:

- seasonality-induced false alarm;
- aggregate masking;
- harmless query/topic shift;
- quality regression with weak drift signal;
- intentional release/config change;
- schema/data-quality breakage;
- noisy threshold.

At least one monitor should be rejected or removed.

## 5. Exit evidence

You are at **demonstrated** when another engineer can reproduce the reference/current comparison, inspect threshold rationale and segmentation, distinguish harmless drift from quality degradation, follow the response playbook, and verify that one real production slice became durable evaluation evidence.

A red drift chart is not sufficient.

## 6. Transfer

Move the monitoring design to a workload with different seasonality, delayed labels, user segments, and remediation cost.

## 7. Applied evidence

Applied evidence is a drift signal that materially improves investigation or catches a useful production change without drowning the team in false alarms.
