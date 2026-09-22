# Tool Contract

## User/system need

What measured failure or missing capability justifies this tool?

## Purpose

## Non-goals

## Interface

- tool name:
- tool description:
- input schema:
- parameter semantics:
- validation rules:

## Deterministic control boundary

- authenticated identity source:
- authorization check:
- approval requirement:
- policy that model output cannot override:

## Execution semantics

- timeout:
- retryable errors:
- non-retryable errors:
- retry policy:
- mutating operation?:
- idempotency key/strategy if mutating:

## Result contract

### Success

What minimal high-signal result returns to the model?

### Validation error

### Transient execution error

### Authorization / approval error

## Context shaping

- pagination/filtering/truncation:
- fields omitted from model context:
- sensitive data handling:

## Observability

Record at least tool selection, validated arguments, execution outcome, latency, retries, and correlation/request ID.
