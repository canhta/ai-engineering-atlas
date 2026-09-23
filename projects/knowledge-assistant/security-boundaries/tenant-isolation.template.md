# Tenant Isolation Contract

## Tenant context

- Tenant identifier:
- Source of tenant context:
- User-to-tenant membership source:
- Multi-tenant user selection:
- Client-supplied tenant value trusted: no / exception:
- Revalidation point:

## Boundary map

For each shared layer:

- API / service:
- Primary database:
- Retrieval / vector index:
- Cache:
- Memory / checkpoint:
- Tool:
- File/object store:
- Queue / event / background job:
- Replay / diagnostics:
- Telemetry / audit:

Record:

- Tenant scope carried:
- Enforcement mechanism:
- Negative test:
- Residual shared state:

## Isolation model

- Pooled components:
- Siloed components:
- Bridge/mixed components:
- Security rationale:
- Compliance rationale:
- Cost rationale:
- Noisy-neighbor rationale:

## Operations

- Admin/support cross-tenant access:
- Per-tenant quota / rate control:
- Onboarding:
- Suspension:
- Offboarding:
- Retention / deletion:
- Orphaned cache/job/credential cleanup:

## Cross-tenant tests

- Forged tenant ID:
- Cross-tenant retrieval:
- Cache collision:
- Memory/checkpoint collision:
- Background job loses tenant:
- Admin/support elevation:
