# Orchestration Experiment

## Fixed task contract

- system/workflow version:
- evaluation-set version:
- simpler-flow baseline:
- task property that may justify orchestration:

## Orchestration graph

Document stages, branches, dependencies, terminal conditions, and state passed between them.

## Control ownership

| Decision | Owner: code / model / hybrid | Why | Verification |
| --- | --- | --- | --- |

Keep known/testable branch conditions deterministic by default.

## Routing / parallelism

- route criteria:
- independent subtasks:
- concurrency limit:
- fan-out rule:
- fan-in/aggregation rule:
- shared-state rules:

## Failure policy

For each relevant stage:

- timeout:
- retry:
- cancellation:
- sibling-branch behavior:
- degradation/fallback:
- escalation:

## Branch failure injection

Record one branch failure and show:

```text
branch failure
→ containment decision
→ sibling behavior
→ aggregation state
→ final verification
```

## Aggregate verification

How is the combined outcome verified?

## Ablation

Compare:

1. simpler single-flow baseline;
2. orchestrated variant;
3. one simplified/removed orchestration element.

Measure:

- task success;
- latency;
- cost;
- model/tool calls;
- failure types;
- operational complexity.

## Decision

- keep single flow / use orchestration / simplify:
- defer multi-agent?:
- what evidence would justify a multi-agent topology later:
