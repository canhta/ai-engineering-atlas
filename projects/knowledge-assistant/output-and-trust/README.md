# Output and Trust Evidence Contract

This package extends the same Knowledge Assistant product, evaluation set, retrieval/RAG evidence, context policy, and tool boundary from earlier milestones.

Do not create a new toy dataset for this slice.

## Required progression

```text
existing answer
→ versioned response contract
→ schema-constrained output
→ deterministic semantic validation
→ explicit answered / abstained / review states
→ answerability or risk labels
→ candidate signal comparison
→ threshold sweep
→ answer / abstain / fallback policy
→ regression + release decision
```

## 1. Structured response contract

Use [response-schema.template.md](response-schema.template.md).

The contract must record:

- downstream consumer need;
- schema/version;
- required and optional fields;
- enums/nullability/additional-property policy;
- provider/model and supported-schema constraints;
- deterministic semantic validation;
- refusal/unavailable handling;
- incomplete/truncated handling where observable;
- one schema-compatible but semantically invalid case;
- one schema migration decision.

Compare against the prior free-form output baseline. Successful parsing alone is not evidence of correctness.

## 2. Answerability / risk labels

Extend the existing evaluation data with labels that support the product decision.

Examples:

- answerable with current evidence;
- insufficient evidence;
- stale/conflicting evidence;
- high-risk / needs review;
- safe to answer.

Keep label definitions versioned and inspect disagreements.

## 3. Uncertainty / evidence signals

Use [abstention-experiment.template.md](abstention-experiment.template.md).

Candidate signals may include:

- retrieval sufficiency/relevance;
- citation or evidence coverage;
- deterministic validation failures;
- log probabilities when available and meaningful;
- consistency/disagreement;
- model self-evaluation;
- task-specific checker/classifier;
- rule-based risk indicators.

Do not call a signal "confidence" unless its empirical relationship to correctness has been evaluated.

## 4. Threshold and policy selection

Choose thresholds or policies using validation data, not the final test set.

Preserve a baseline without abstention.

Measure at minimum:

- overall coverage;
- answered-case risk/quality;
- false or unnecessary abstention;
- unsafe answered cases;
- fallback/escalation success;
- failure slices.

A system that abstains on almost everything is not automatically reliable.

## 5. Shift / failure work

Test at least one case involving:

- insufficient retrieved evidence;
- stale or conflicting evidence;
- distribution/domain shift;
- semantic validation failure despite schema validity;
- signal that looks confident but is wrong;
- fallback/escalation failure.

## Completion standard

Another engineer should be able to answer:

- what output contract downstream code relies on;
- what schema validity guarantees and does not guarantee;
- what deterministic semantic checks run after generation;
- what signal drives answer versus abstain;
- how the threshold was selected without test leakage;
- how risk changes as coverage changes;
- what happens after abstention;
- which failure or shift would trigger a policy change.
