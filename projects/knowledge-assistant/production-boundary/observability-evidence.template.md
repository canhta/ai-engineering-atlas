# Observability and Replay Evidence Record

The goal is to explain a production request and reconstruct a comparable execution. Do not use this record to justify logging raw model or user content by default.

## Trace boundary

- Root user/application request:
- Request/trace identifier:
- Model operations:
- Retrieval operations:
- Tool operations:
- Gateway operations, if present:
- Other application operations that matter to diagnosis:

## Telemetry contract

For every signal, record its purpose and owner.

- Provider and requested/actual model:
- Workflow duration:
- Provider-call duration:
- Token/usage metrics, when reliable:
- Streaming time-to-first-chunk, only when applicable:
- Error/failure dimensions:
- Route/fallback outcome, if applicable:
- Sampling policy:
- Retention policy:

## Privacy and content policy

- Prompt/instruction capture:
- User-input capture:
- Tool argument/result capture:
- Model-output capture:
- Fields excluded by default:
- Redaction mechanism:
- Secure references used instead of raw content:
- Redaction/content-exclusion test artifact:

## Replay provenance

Record the values or secure references needed for diagnosis:

- provider;
- requested model;
- actual/response model;
- inference parameters;
- prompt/template identifier or hash;
- retrieval/index/config identifier;
- tool schema/config identifier;
- gateway route/policy version, if present;
- request input or secure input reference;
- relevant feature/config flags.

State which upstream state can change and prevent an exact replay.

## Failure evidence

Preserve raw artifact links for:

- one successful request;
- one provider failure;
- one retrieval or tool failure;
- one fallback/routing path if a gateway exists;
- one privacy redaction/content-exclusion case;
- one diagnostic replay.

## Incident diagnosis

- User-visible symptom:
- First failing span or signal:
- Failure domain:
- Supporting trace/metric evidence:
- Replay result:
- Configuration or upstream divergence discovered:
- Mitigation:
- Regression test or alert added:

## Telemetry overhead

- Latency overhead:
- Storage/volume:
- High-cardinality risks:
- Sensitive-field risks:
- Field reduced or dropped:
- Reason it was not worth keeping:

## Decision

Keep only signals that are actionable, privacy-safe, and worth their operational cost. Record what remains deliberately unobserved.
