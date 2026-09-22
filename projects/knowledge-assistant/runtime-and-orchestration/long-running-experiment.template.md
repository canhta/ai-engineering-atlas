# Long-Running Runtime Experiment

## Fixed workflow contract

- system/workflow version:
- evaluation-set version:
- durable run ID:
- external side effects:
- synchronous baseline:

## Lifecycle

| State | Enter condition | Exit condition | Durable? |
| --- | --- | --- | --- |

Include waiting/paused, terminal, timeout/cancelled, and failure states where relevant.

## Execution budget

- wall-clock deadline:
- max model turns:
- max tool calls:
- max cost/token budget:
- escalation behavior when budget is exhausted:

## Pause / wait / resume

- wait condition:
- persisted state:
- process/worker stopped?:
- resume trigger:
- resumed transition:
- duplicate-work protection:

## Recovery tests

Record:

- worker/process restart;
- retryable failure;
- non-retryable or escalation case;
- unsafe replay boundary;
- concurrent-resume / duplicate-owner attempt.

## Side-effect safety

- correlation/idempotency identifiers:
- replay-safe operations:
- operations that must not be replayed:
- recovery behavior after ambiguous commit:

## Partial progress

What durable artifact lets a fresh worker/context continue without reconstructing everything?

## Final verification

How is completion verified independently of "the run stopped"?

## Comparison

Measure versus the simpler synchronous baseline:

- task success;
- recovery success;
- repeated work;
- latency;
- cost;
- operational complexity.

## Decision

- keep / simplify / remove durable runtime:
- what evidence would change the decision:
