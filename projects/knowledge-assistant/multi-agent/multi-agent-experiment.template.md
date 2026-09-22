# Multi-Agent Experiment

## Fixed baseline

- system/version:
- evaluation-set version:
- single-agent orchestration baseline:
- measured limitation:

## Topology hypothesis

Why should independent agents outperform or simplify the baseline?

## Topology

- manager / handoff / orchestrator-workers / other:
- agent contracts:
- final-answer owner:
- shared context/state:
- isolated context/state:

## Delegation budget

- max active agents:
- max total agents:
- max depth:
- per-agent budget:
- total model/tool/cost budget:

## Coordination traces

Record representative:

```text
parent goal
→ delegation
→ specialist work
→ specialist result + provenance
→ aggregation
→ final verification
```

## Failure work

Include:

- duplicated delegation / overlapping work;
- coverage gap;
- conflicting specialist conclusions;
- one timeout/failure;
- recursive/runaway delegation attempt.

For each, record detection and recovery behavior.

## Aggregate verification

- end-state verifier:
- provenance checks:
- unresolved conflict policy:

## Baseline comparison

| Variant                    | Quality | Coverage | Latency | Tokens / cost | Model/tool calls | Coordination failures |
| -------------------------- | ------: | -------: | ------: | ------------: | ---------------: | --------------------: |
| Single-agent orchestration |         |          |         |               |                  |                       |
| Multi-agent topology       |         |          |         |               |                  |                       |
| Ablated topology           |         |          |         |               |                  |                       |

## Topology ablation

Merge or remove at least one agent and rerun the same task set.

## Decision

- keep / simplify / revert:
- which agent boundaries earned their cost:
- which should collapse back into tools/stages:
- what evidence would change the decision:
