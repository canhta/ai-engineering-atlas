# Release Decision Record

## Candidate identity

- Candidate release manifest:
- Current known-good manifest:
- Manifest diff:
- Mutable aliases observed:
- Concrete versions those aliases resolved to:

## Frozen pre-release gate

- Evaluation-set/reference version:
- Quality thresholds:
- Failure slices:
- Latency/error/cost thresholds:
- Informational metrics:
- Gate result:
- Evidence links:

## Rollout strategy

- Strategy: direct / rolling / canary / shadow / no-release
- Why this strategy matches the risk:
- Exposure:
- Duration or sample requirement:
- Control/current population:
- Graceful-degradation or fallback behavior that is separate from rollback:

## Live analysis

### AI quality

- Signals:
- Thresholds:
- Result:

### Operations

- Latency:
- Error rate:
- Cost/usage:
- Other:
- Result:

### Decision state

- Success condition:
- Failure condition:
- Inconclusive condition:
- Inconclusive action: pause / explicit operator decision / other

## Outcome

- Action: promote / pause / abort / rollback / no-release
- Evidence that triggered it:
- Operator or automation:
- Final exposed release manifest:

## Regression feedback

- Failure converted into regression case:
- Evaluation set updated:
- Follow-up alert or metric:
- What would change the release strategy next time:
