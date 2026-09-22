# Planning Experiment

## Fixed task contract

- workflow/system version:
- evaluation-set version:
- tools:
- goal:
- constraints:
- success criteria:

## Why explicit planning might help

What task property makes direct execution insufficient?

## Plan schema

- plan version:
- step/dependency representation:
- blocker representation:
- assumption representation:
- invalidation/replanning triggers:
- mapping into durable state:

## Variants

| Variant       | Planning behavior | Task success | Steps/tool calls | Latency | Cost | Plan churn |
| ------------- | ----------------- | -----------: | ---------------: | ------: | ---: | ---------: |
| No plan       |                   |              |                  |         |      |            |
| Static plan   |                   |              |                  |         |      |            |
| Adaptive plan |                   |              |                  |         |      |            |

## Replanning case

Inject one changed condition or invalidated assumption.

Record:

```text
plan
→ execution result
→ evidence that invalidates assumption/step
→ diagnosis
→ plan revision
→ continued execution
```

## Failure analysis

Classify failures as:

- decomposition/plan failure;
- invalidated assumption;
- execution/tool failure;
- state failure;
- verifier failure;
- genuine task failure.

## Decision

- keep / simplify / remove explicit planning:
- chosen granularity:
- rejected alternatives:
- what evidence would change the decision:
