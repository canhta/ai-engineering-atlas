# Uncertainty Abstention and Trust

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [SelectiveNet — A Deep Neural Network with an Integrated Reject Option](https://proceedings.mlr.press/v97/geifman19a.html) | Sections 1 "Introduction", 2 "Selective Prediction Problem Formulation", and 5 "Coverage Accuracy" | Establish the reject-option formulation, coverage, selective risk, and the risk–coverage trade-off without requiring the SelectiveNet model itself. |
| [On Calibration of Modern Neural Networks](https://proceedings.mlr.press/v70/guo17a.html) | Section 2 "Definitions", "Reliability Diagrams", and "Expected Calibration Error (ECE)" | Distinguish predictive accuracy from calibration and learn how empirical reliability is inspected over groups of comparable cases. |
| [Language Models (Mostly) Know What They Know](https://arxiv.org/abs/2207.05221) | Calibration results and Section 3 "From Calibration to Knowing What You Know", including P(True) self-evaluation experiments | Treat model self-evaluation as a measurable signal whose calibration and task transfer must be validated rather than trusted by label. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `math.probability` | [On Calibration of Modern Neural Networks](https://proceedings.mlr.press/v70/guo17a.html) | Section 2 "Definitions" plus the reliability-diagram and Expected Calibration Error discussion | Patch only the probability and calibration reasoning needed to interpret confidence or risk signals and select policies without test leakage. |
<!-- learning-sources:end -->

## Why this matters

A system that always answers can be unsafe. A system that always abstains can be useless.

The engineering problem is to choose an operating policy that trades off:

- answer coverage;
- error or risk among answered cases;
- unnecessary abstention;
- fallback or escalation success.

A number called "confidence" is only useful if its relationship to correctness has been measured.

## 1. Diagnostic first

Given a Knowledge Assistant with a confidence-like score:

1. define what an abstention means for the user;
2. define the fallback or escalation path;
3. explain how you would test whether the score separates safe from risky cases;
4. choose where threshold tuning happens;
5. explain why answered-case accuracy alone can be misleading.

If you can do this concretely, move to the project experiment.

## 2. Probability / calibration prerequisite bridge

`math.probability` is not ready yet.

Use the generated prerequisite patch above to review only the concepts needed here:

- confidence versus empirical correctness;
- calibration over comparable cases;
- reliability diagrams;
- validation/test separation.

Do not expand this into a full probability course unless the diagnostic remains blocking.

## 3. Mental model

Use the Learning sources table above.

The core decision loop is:

```text
candidate signal
→ validate relationship to risk
→ choose threshold/policy on validation data
→ answer / abstain / fallback
→ measure risk + coverage on held-out data
```

SelectiveNet supplies the decision framework, not a required model architecture.

## 4. Independent experiment

Use the [Output and Trust evidence contract](../../../projects/knowledge-assistant/output-and-trust/).

Preserve the no-abstention baseline.

Compare at least two candidate signals or policies.

Examples:

- retrieval sufficiency;
- evidence/citation coverage;
- deterministic validation failures;
- consistency/disagreement;
- model self-evaluation;
- task-specific checker;
- rule-based risk signal.

Choose the policy on validation data, then evaluate it once on a held-out test set.

## 5. Failure work

Include:

- insufficient evidence;
- stale/conflicting evidence;
- one shifted slice;
- a confident-looking but wrong case;
- fallback/escalation failure.

Measure unnecessary abstention as well as unsafe answered cases.

## 6. Exit evidence

You are at **demonstrated** when another engineer can reproduce the threshold/policy selection and inspect:

- signal provenance;
- validation/test split;
- risk–coverage trade-off;
- false abstention;
- unsafe answers;
- fallback results;
- shifted-slice behavior.

A model saying "90% confident" is not evidence of 90% correctness.

## 7. Transfer

Move to a domain with different error costs or fallback options and redesign the operating point.

## 8. Applied evidence

Applied evidence is a real answer/abstain/fallback policy that changes from measured failures, catches unsafe answers, or rejects an unhelpful confidence signal.
