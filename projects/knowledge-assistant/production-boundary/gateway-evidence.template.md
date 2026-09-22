# Gateway Evidence Record

Use this record for the existing Knowledge Assistant request path. Keep links to raw traces, configuration, and test artifacts instead of pasting screenshots as proof.

## Direct-provider baseline

- Request path:
- Provider/model:
- Representative request set:
- Quality or task behavior:
- Latency:
- Failure behavior:
- Operational constraints that might justify a gateway:

## Gateway decision

- Problem centralized control is expected to solve:
- Why the application cannot solve it more simply:
- Responsibilities assigned to the gateway:
- Responsibilities deliberately left in application code:
- Condition under which the gateway should be removed:

## Stable contract

- Client-facing request shape:
- Client-facing response/error shape:
- Provider-specific escape hatches:
- Request/correlation identifier:
- Credential owner and rotation boundary:
- How direct provider bypass is prevented or detected:

## Provider and compatibility policy

- Primary provider/model:
- Allowed alternatives:
- Required behavioral/capability compatibility:
- Explicitly incompatible fallback:
- How requested and actual model are recorded:

## Routing and failure policy

- Routing inputs:
- Timeout budget:
- Retryable failures:
- Non-retryable failures:
- Backoff and retry bound:
- 429 / throttling behavior:
- Rate/quota policy:
- Fallback/failover policy:
- Circuit-breaking behavior if used:

## Failure evidence

Record artifact links and observed behavior for:

- provider timeout;
- 429 / throttling;
- compatible fallback or failover;
- incompatible model/version rejection;
- authentication or credential failure;
- direct-gateway bypass attempt;
- application validation failure.

## Overhead comparison

- Direct path latency:
- Gateway path latency:
- Additional infrastructure or maintenance:
- Policy/reliability value gained:
- New failure modes introduced:

## Decision

Keep, simplify, or remove the gateway. State which evidence drove the decision and what future evidence would reverse it.
