# RFC 0013 — AI Caching and Streaming

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Summary

Promote two existing Production AI coverage nodes:

- `production.caching` — AI Caching;
- `production.streaming` — Streaming.

No catalog node is added or removed.

These are mechanism routes after latency and cost engineering. They must earn their complexity from measured evidence rather than being treated as defaults.

## Why this slice now

The learner now has request traces, latency distributions, TTFC vocabulary, cost-per-useful-outcome evidence, quality gates, and provider/gateway failure handling.

Caching and streaming can therefore be learned as controlled production mechanisms:

- caching must prove reuse, freshness, security, cold-path safety, and measured value;
- streaming must prove user-visible TTFC value plus correct event, cancellation, reconnect, partial-state, and backpressure behavior.

## Evidence reviewed

Sources were rechecked on 2026-09-22.

### Amazon Builders' Library — Caching challenges and strategies

<https://aws.amazon.com/builders-library/caching-challenges-and-strategies/>

Relevant sections:

- "When we use caching";
- "Cache expiration";
- "Other considerations";
- "Amazon best practices and considerations".

The source emphasizes reuse/hit ratio, eventual-consistency tolerance, cache hit/miss and downstream metrics, cold/cache-disabled operation, thundering-herd protection, expiration/eviction choices, and cache security.

### OpenAI — Prompt caching

<https://developers.openai.com/api/docs/guides/prompt-caching>

Relevant sections:

- "Why prompt caching matters";
- "What is the prompt cache?";
- "Which settings affect the cached prefix?";
- "Prompt cache keys".

The source distinguishes prompt-prefix processing reuse from final-response caching. Reuse depends on matching rendered prefixes and relevant settings, and cached-token behavior can be observed rather than assumed.

### OpenAI — Streaming API responses

<https://developers.openai.com/api/docs/guides/streaming-responses>

Relevant material:

- "Enable streaming";
- semantic typed events;
- "Read the responses";
- "Advanced use cases";
- "Moderation risk".

The source exposes typed lifecycle events, partial deltas, structured/tool streaming, and the increased difficulty of moderating partial output.

### MDN — Using server-sent events

<https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events>

Relevant sections:

- "Receiving events from the server";
- "Error handling";
- "Closing event streams";
- "Event stream format".

This grounds one-way SSE transport, event framing, reconnect behavior, and close semantics.

### MDN — Streams API concepts

<https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts>

Relevant sections:

- "Backpressure";
- "Internal queues and queuing strategies".

This supplies the slow-consumer and bounded-buffer mental model.

### MDN — AbortController.abort()

<https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort>

The method can abort fetches, response-body consumption, or streams and provides a concrete cancellation primitive.

### OpenTelemetry GenAI metrics

Existing source:

- `docs.otel-genai-metrics`

Relevant metric:

- `gen_ai.client.operation.time_to_first_chunk`.

This keeps TTFC separate from provider operation and whole-workflow duration.

## Capability boundary — AI Caching

The route covers production cacheability and correctness across possible AI cache layers, including provider prompt-prefix reuse, retrieval/tool/result caches, derived-data caches, and full-response caches when justified.

It does not require Redis or a specific cache product.

It does not promote semantic caching as a default because similar text is not automatically equivalent behavior.

It does not replace `llm.kv-cache`, which belongs to inference internals rather than application cache operation.

Required capability includes choosing what is reusable, authorization-safe key scope, freshness/invalidation, version-aware keys, measured hit value, cold/no-cache operation, thundering-herd protection, cache security, and rejecting caches that do not earn their risk.

## Capability boundary — Streaming

The route covers application response streaming: TTFC versus completion, typed events, partial state, one-way SSE-style delivery, cancellation, reconnect/resume/restart policy, backpressure, buffering, mid-stream failure, and partial-output moderation/validation risk.

It is not a Realtime voice/WebRTC/WebSocket curriculum. A bidirectional transport may be selected when needed, but response streaming should not be conflated with realtime multimodal sessions.

## Knowledge Assistant integration

Add:

`projects/knowledge-assistant/delivery-mechanisms/`

The same Knowledge Assistant must preserve its performance/economics baseline.

Add milestones after cost engineering and before versioned release candidate:

1. `caching-engineering`;
2. `streaming-delivery`.

## Promotion gate

- [x] existing catalog nodes are reused;
- [x] caching has no unresolved coverage-only prerequisite;
- [x] streaming has a targeted `systems.networking` bridge;
- [x] cacheability, freshness, invalidation, and key scope are explicit;
- [x] cold-cache/cache-unavailable behavior is tested;
- [x] thundering-herd protection is included where relevant;
- [x] cross-tenant/authorization cache isolation is tested;
- [x] prompt caching is distinguished from response caching;
- [x] cache benefit is measured against latency/cost/quality;
- [x] TTFC is separated from total completion latency;
- [x] streaming uses typed lifecycle/failure semantics;
- [x] cancellation reaches upstream work according to policy;
- [x] disconnect/reconnect and duplicate/resume behavior are tested;
- [x] slow-consumer/backpressure behavior is tested;
- [x] partial structured/tool fragments cannot trigger premature side effects;
- [x] partial-output moderation/validation risk is explicit;
- [x] at least one caching idea and one streaming path are rejected;
- [x] learner-facing source locators are explicit;
- [x] project evidence extends the existing Knowledge Assistant;
- [x] generated status/site data is updated in the same change;
- [x] repository validators must pass before the batch is considered complete.

## Alternatives considered

### Treat prompt caching as the whole caching competency

Rejected. Provider prefix reuse is one cache layer and does not teach application freshness, tenant isolation, invalidation, or cache-outage behavior.

### Require semantic caching

Rejected. Similarity is not equivalence; semantic caches need their own correctness and privacy proof.

### Add Redis as a prerequisite

Rejected. The capability is cache design and operation, not one storage product.

### Treat streaming as making the model faster

Rejected. Streaming usually changes TTFC and perceived responsiveness, not total generation completion.

### Require SSE everywhere

Rejected. SSE is an appropriate one-way transport example; other interaction patterns may require different transports.

### Ignore disconnects because the client left

Rejected. Upstream work may continue to consume resources or cause side effects.

### Treat partial output as final output

Rejected. Partial text, structured output, and tool arguments can be incomplete and unsafe to act upon.

## Impact

After implementation:

- `production.caching` becomes ready;
- `production.streaming` becomes ready;
- repository counts become **115 catalog / 31 ready / 84 coverage**;
- Production AI becomes **11 / 8 ready**.

The remaining Production AI coverage nodes are `production.architecture`, `production.mlops-llmops`, and `production.drift`. Drift remains the next concrete capability before architecture/MLOps synthesis.
