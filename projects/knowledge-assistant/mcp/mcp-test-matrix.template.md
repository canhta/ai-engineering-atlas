# MCP Protocol Test Matrix

## Fixed contract

- server version:
- client/host version:
- protocol revision:
- auth mode:
- direct-integration baseline:

## Test cases

| Case | Expected protocol result | Expected application result | Observed |
| --- | --- | --- | --- |
| modern discovery succeeds | | | |
| unsupported/pinned version | | | |
| unsupported capability | | | |
| malformed tool input | | | |
| unauthorized operation | | | |
| resource outside allowed scope | | | |
| downstream tool/resource failure | | | |
| stale capability/cache assumption | | | |

## Multi-round-trip

If applicable:

- input_required trigger:
- request state handling:
- maximum rounds:
- malformed/untrusted client input case:
- retry/re-entry result:

## Tasks

If applicable:

- extension capability evidence:
- task creation:
- durable task ID:
- polling interval behavior:
- task update/input:
- cancellation:
- per-task authorization:
- crash/restart polling recovery:

## Interoperability / conformance

- conformance version:
- tests/checks used:
- alternate client/host if tested:
- unsupported features / known gaps:

## Comparison

Record MCP versus the direct integration:

- task outcome:
- latency:
- operational complexity:
- versioning/maintenance cost:
- security surface:

## Decision

- keep / simplify / remove MCP:
- compatibility policy:
- what evidence would change the decision:
