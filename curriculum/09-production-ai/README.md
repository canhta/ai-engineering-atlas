# Production AI

Operational practices for AI systems serving real users.

## Ready routes

- [Model Provider and Gateway Architecture](model-gateway/) — decide when centralized provider control earns its complexity, then prove routing and failure behavior against a direct baseline.
- [AI Observability and Request Replay](observability/) — correlate privacy-safe production evidence and reconstruct failures from provenance without treating traces as evaluation scores.
- [Latency Engineering](latency/) — define user-relevant latency objectives, measure distributions and critical paths, then improve the dominant bottleneck without hiding quality or tail regressions.
- [Cost Engineering](cost/) — attribute AI spend, define useful unit economics, and optimize cost per successful outcome rather than raw spend or price per token.
- [AI Caching](caching/) — justify reuse, define freshness and authorization-safe keys, survive cold/unavailable caches, and prove latency/cost value against correctness and security risk.
- [Streaming](streaming/) — improve time to first useful output with an explicit event, cancellation, reconnect, partial-state, backpressure, and safety contract.
- [Model Prompt and Retrieval Versioning](versioning/) — identify the complete behavior-defining release state so traces, evaluation, replay, incidents, and rollback refer to concrete artifacts rather than mutable aliases.
- [AI Release Engineering](release-engineering/) — gate a concrete candidate, expose it gradually when warranted, analyze live AI and operational evidence, then promote, abort, or verify rollback.

## Scope

- model and provider gateways
- routing, fallback, and rate limits
- prompt, model, retrieval, and tool versioning
- tracing and replay
- latency and tail-performance engineering
- cost allocation and unit economics
- cacheability, freshness, and cache failure handling
- streamed delivery, cancellation, and partial-state handling
- release gates and regression testing
- reliability and graceful degradation
- incident analysis and production feedback
