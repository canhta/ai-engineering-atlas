# Cache Decision Record

## Problem and baseline

- Release/system identity:
- Workload:
- Latency problem:
- Cost/downstream-load problem:
- Uncached baseline:
- Quality/evaluation reference:

## Cache boundary

- Cached artifact:
- Cache type:
- Expected reuse pattern:
- Expected hit-rate range:
- Why this is reusable:
- Why caching is preferred over removing the work entirely:

## Scope and key

- Tenant scope:
- User scope:
- Authorization/permission scope:
- Prompt/model/config dimensions:
- Retrieval/data/index dimensions:
- Tool/policy dimensions:
- Sensitive material excluded from key/value:

## Freshness and invalidation

- Freshness tolerance:
- TTL:
- Refresh:
- Eviction:
- Explicit invalidation:
- Version/namespace invalidation:
- Stale-on-error behavior:
- Negative-cache behavior:

## Failure behavior

- Cold-cache behavior:
- Cache unavailable:
- Concurrent misses:
- Downstream request cap/load shedding:
- Cross-tenant collision:
- Poisoning/probing risk:
- Cache-format/version mismatch:

## Measurement

- Hits:
- Misses:
- Writes:
- Stale uses:
- Cached tokens, if provider prompt caching:
- Downstream calls:
- Latency effect:
- Cost effect:
- Quality/correctness effect:

## Decision

- Keep / reject / remove:
- Evidence:
- Cache idea deliberately rejected:
- Remaining risk:
