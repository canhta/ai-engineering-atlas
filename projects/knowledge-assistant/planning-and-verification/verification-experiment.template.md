# Verification Experiment

## Fixed task contract

- workflow/system version:
- evaluation-set version:
- success-criteria version:
- baseline without verification:

## Success criteria and verifier inventory

| Criterion | Verifier | Evidence source | Deterministic? | Version |
| --- | --- | --- | --- | --- |

Prefer environment state, executable tests, invariants, or authoritative data where possible.

## Successful trace

Record:

```text
execution
→ claimed result
→ verifier invocation
→ observed evidence
→ pass/fail
→ next action
```

## Seeded defect

- injected defect:
- expected detector:
- observed detector result:
- repair/retry/replan/escalation:
- post-fix verification:

## Verifier quality

Where the verifier can be wrong, measure:

- true positives;
- false positives;
- true negatives;
- false negatives.

If a model grader is used:

- model/version:
- rubric/version:
- human calibration sample:
- agreement/disagreement:
- known failure slices:

## Overhead

- latency:
- cost:
- additional tool/model calls:

## Ablation

Compare the same task set with and without the verification loop.

## Decision

- keep / simplify / remove verifier stage:
- verifier gaps:
- when human review remains necessary:
- what evidence would change the decision:
