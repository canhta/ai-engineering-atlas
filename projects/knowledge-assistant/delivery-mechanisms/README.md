# Delivery Mechanisms Evidence Contract

Extend the same Knowledge Assistant. Do not build a separate cache demo or streaming toy.

Start from the measured performance/economics baseline:

```text
latency + cost problem
→ mechanism hypothesis
→ uncached / non-stream baseline
→ correctness contract
→ failure injection
→ quality + latency + cost comparison
→ keep / reject / remove
```

## Stage 1 — caching

Use [cache-decision.template.md](cache-decision.template.md).

Choose one cache boundary only when requests actually reuse something valuable.

The record must answer:

- what is being reused;
- who is allowed to reuse it;
- what makes an entry stale;
- which prompt/model/data/tool/policy changes invalidate it;
- whether stale data is ever acceptable;
- what happens when the cache is cold or unavailable;
- what prevents concurrent misses from overwhelming dependencies;
- what security or tenant-isolation risk the cache introduces.

Provider prompt caching is a prefix-processing optimization, not a final-response cache.

## Stage 2 — streaming

Use [streaming-contract.template.md](streaming-contract.template.md).

Streaming should have an explicit lifecycle, not an anonymous sequence of text chunks.

Define:

- created/start;
- delta/partial;
- completed;
- failed;
- cancelled;
- reconnect/restart/resume behavior.

Measure time to first chunk separately from total completion.

Propagate cancellation upstream when the user leaving means continued work no longer has value.

## Stage 3 — failure matrix

Use [delivery-failure-matrix.template.md](delivery-failure-matrix.template.md).

At minimum exercise:

- stale cache;
- cache unavailable;
- cold cache or mass invalidation;
- concurrent cache misses;
- authorization-scope collision;
- mid-stream provider/application failure;
- client cancellation;
- network disconnect/reconnect;
- slow consumer/backpressure;
- incomplete structured/tool fragments where applicable.

## Exit condition

Another engineer should be able to disable the cache and streaming paths, reproduce the baseline, reproduce the declared failure cases, inspect the security/correctness boundaries, and understand why each mechanism is kept or rejected from measured quality, latency, cost, and user-experience evidence.

A high hit rate or visually faster text animation is not sufficient.
