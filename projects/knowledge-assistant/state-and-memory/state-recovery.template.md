# State Recovery Experiment

## Workflow contract

- workflow version:
- task/evaluation-set version:
- durable run/session ID:
- external side effect(s):

## State schema

- schema version:
- persisted fields:
- derived fields:
- values intentionally not persisted:
- terminal states:

## State transitions

| From | Event / condition | To | Side effect? | Checkpoint after transition? |
| --- | --- | --- | --- | --- |

## Checkpoint / event strategy

- persistence mechanism:
- checkpoint boundaries:
- correlation/request IDs:
- idempotency strategy:
- replay assumptions:

## Normal trace

Record the expected multi-step path.

## Interruption test

Inject an interruption after at least one completed step.

Record:

- last durable checkpoint/event;
- process/harness state lost;
- state loaded on restart;
- next transition;
- side effects observed;
- duplicated side effects, if any;
- repeated work;
- recovery latency.

## Corrupt / stale / incompatible state

Inject one state failure and record detection and recovery behavior.

## State migration

- old schema version:
- new schema version:
- compatible or breaking:
- migration/fallback:
- handling for in-flight old runs:

## Decision

Why is explicit state needed here, and why would transcript-only continuity be insufficient?
