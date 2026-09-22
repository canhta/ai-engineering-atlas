# Abstention and Trust Experiment

## Fixed evaluation contract

- system version:
- evaluation-set version:
- answerability/risk-label version:
- validation split:
- held-out test split:
- baseline without abstention:

## Product decision

- what does "abstain" mean?:
- fallback / escalation:
- cost of a wrong answer:
- cost of an unnecessary abstention:

## Candidate signals

| Signal | Provenance | Expected relationship to risk | Known limitations |
| --- | --- | --- | --- |

## Validation sweep

For each threshold/policy candidate record:

| Policy / threshold | Coverage | Answered-case risk/quality | False abstention | Unsafe answers | Fallback success |
| --- | ---: | ---: | ---: | ---: | ---: |

Use validation data to choose the policy.

## Held-out test

Evaluate the chosen policy once on the held-out set.

Report:

- coverage;
- answered-case risk/quality;
- false/unnecessary abstention;
- unsafe answered cases;
- fallback/escalation success;
- latency/cost impact where relevant.

## Risk–coverage evidence

Include a risk–coverage curve or equivalent threshold sweep. Do not report answered-case accuracy without coverage.

## Failure slices

Include at least one:

- insufficient retrieval evidence;
- stale/conflicting evidence;
- shifted domain/query type;
- high apparent confidence but wrong answer;
- fallback/escalation failure.

## Signal comparison

Compare at least two signals or policies. Model self-evaluation, if used, is one candidate signal and must not be treated as ground truth.

## Decision

- selected policy:
- why:
- rejected alternatives:
- what evidence would change the decision:
- release / no-release conclusion:
