# Response Schema Record

## Consumer requirement

- consumer:
- workflow:
- fields required downstream:
- failure if contract breaks:

## Schema

- schema version:
- provider/model:
- structured-output mechanism:
- supported-schema limitations:

Attach or link the exact schema.

## Contract decisions

- required fields:
- optional / nullable fields:
- enums:
- additional properties:
- refusal / unavailable state:
- incomplete / truncated state:

## Deterministic semantic validation

List invariants the schema cannot prove.

Examples:

- cited document IDs exist;
- citation spans support the answer;
- numeric range is meaningful;
- status and answer fields are mutually consistent.

## Test matrix

Include:

- normal valid output;
- malformed / transport failure;
- incomplete output;
- refusal / unavailable path;
- schema-valid but semantically invalid output;
- unsupported-schema/provider limitation.

## Baseline comparison

Compare the structured contract with the previous free-form parsing path.

Record:

- parse/contract failure rate;
- semantic failure rate;
- latency;
- token/cost impact where measurable.

## Schema migration

Describe one schema change:

- old version:
- new version:
- breaking or compatible:
- consumer migration:
- rollback / compatibility plan:

## Decision

Why is this contract appropriate for the current system?
