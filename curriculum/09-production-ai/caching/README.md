# AI Caching

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Amazon Builders' Library — Caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) | Sections "When we use caching", "Cache expiration", "Other considerations", and "Amazon best practices and considerations" | Build the production cache mental model: justify reuse, tolerate staleness deliberately, measure hit/miss behavior, survive cold or unavailable caches, prevent thundering herds, and account for security risks. |
| [OpenAI — Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) | Sections "Why prompt caching matters", "What is the prompt cache?", "Which settings affect the cached prefix?", and "Prompt cache keys" | Distinguish provider-side prompt-prefix reuse from response caching, understand prefix matching and key scoping, and measure cached-token reuse instead of assuming any repeated request is a cache hit. |
<!-- learning-sources:end -->

## Why this matters

A cache can make an AI system cheaper and faster while quietly making it stale, unsafe, or dependent on warm state.

AI systems also contain several very different cache opportunities. Provider prompt-prefix reuse is not the same thing as reusing a final model answer, retrieval result, embedding, or tool output.

The route starts by deciding what is actually reusable and what correctness boundary that reuse requires.

## 1. Diagnostic first

Before studying the sources, explain:

- which Knowledge Assistant artifacts are safe to reuse;
- which tenant/user/permission dimensions belong in the key;
- what should invalidate the entry;
- how much staleness is acceptable;
- what happens when the cache is cold or disappears;
- why a high hit rate can still be wrong.

If the answer is only "put it in Redis," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
prompt-prefix cache
→ reuses model prefix-processing work

result/response cache
→ reuses an application result

freshness contract
→ how old reused data may be

cache key
→ exact correctness + authorization boundary

cold path
→ behavior when no reusable entry exists
```

A cache should improve a measured problem without becoming an untested dependency.

## 3. Independent practice

Use the [Delivery Mechanisms evidence contract](../../../projects/knowledge-assistant/delivery-mechanisms/).

Add one justified cache, preserve the uncached path, inject stale/cold/unavailable/concurrent-miss/security failures, and compare quality, latency, cost, and downstream load.

## 4. Failure work

Exercise:

- stale entries;
- changed prompt/model/retrieval/tool/policy identity;
- cold or flushed caches;
- cache outage;
- concurrent misses;
- cross-tenant key collisions;
- downstream errors;
- a cache whose hit rate is too low to justify itself.

At least one cache idea should be rejected or removed.

## 5. Exit evidence

You are at **demonstrated** when another engineer can reproduce the cache/no-cache comparison, explain every key dimension and invalidation rule, survive cold/unavailable cache operation, reproduce the freshness/security tests, and understand why the cache is worth keeping.

A hit-rate dashboard alone is not sufficient.

## 6. Transfer

Move the cache design to a workload with different reuse, freshness, authorization, and dependency-load constraints.

## 7. Applied evidence

Applied evidence is a production cache that measurably improves latency/cost/load while preserving the declared correctness and security boundary—or a measured decision not to cache.
