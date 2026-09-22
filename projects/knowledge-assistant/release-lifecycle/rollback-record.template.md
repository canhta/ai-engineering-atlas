# Rollback Record

## Trigger

- Candidate manifest:
- Known-good target manifest:
- Failure or release condition that triggered rollback:
- Trace/evaluation/release evidence:

## Rollback scope

Confirm the target identity for each behavior-defining artifact:

- application:
- model and inference configuration:
- prompt/template:
- response contract:
- retrieval data/index/config:
- tools:
- gateway route/policy:
- safety/policy config:
- feature/config snapshot:

## Execution

- Rollback mechanism:
- Started:
- Completed:
- Failures during rollback:
- Any graceful-degradation action used while rollback completed:

## Identity verification

- Observed release manifest after rollback:
- Diff versus known-good target:
- Unexpected newer artifact still active:
- Alias resolution rechecked:

## Behavior verification

- Smoke cases:
- Regression cases:
- AI-quality result:
- Operational result:
- User-visible recovery:

## Follow-up

- Durable regression test:
- Incident/release record:
- Alert or gate change:
- Was rollback complete, partial, or failed:
