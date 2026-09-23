# Guardrail Failure Matrix

## Unsafe side effect before guardrail completion

- Attack:
- Parallel behavior:
- Blocking behavior:
- Evidence:
- Result:

## Intermediate tool or handoff bypass

- Attack:
- Expected placement:
- Observed:
- Evidence:
- Result:

## False positive

- Test:
- Expected:
- Observed:
- User impact:
- Threshold/policy decision:

## False negative

- Test:
- Expected:
- Observed:
- Deterministic containment:
- Regression added:

## Timeout or dependency failure

- Failure:
- Fail-open / fail-closed policy:
- Observed:
- Evidence:
- Result:

## Downstream interpretation

- HTML / URL / SQL / shell / path / template context:
- Deterministic validation/encoding:
- Observed:
- Result:

## Blocked-content leakage

- Rejected payload:
- Session/log/trace behavior:
- Evidence:
- Result:

## Simplification

- Guardrail removed/relocated/replaced:
- Why:
- Replacement control:
