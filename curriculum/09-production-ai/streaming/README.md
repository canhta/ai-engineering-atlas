# Streaming

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OpenAI — Streaming API responses](https://developers.openai.com/api/docs/guides/streaming-responses) | Sections "Enable streaming", semantic events around the typed event examples, "Read the responses", "Advanced use cases", and "Moderation risk" | Study a typed AI streaming lifecycle, incremental deltas, completion/error events, advanced partial tool/structured data, and the moderation cost of exposing partial output. |
| [MDN — Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) | Sections "Receiving events from the server", "Error handling", "Closing event streams", and "Event stream format" | Ground SSE as a one-way event transport with message framing, event IDs, reconnect timing, errors, and explicit close semantics. |
| [MDN — Streams API concepts](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts) | Sections "Backpressure" and "Internal queues and queuing strategies" | Build the slow-consumer mental model and avoid treating producer throughput as independent of client or downstream capacity. |
| [MDN — AbortController.abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) | Method "abort()" and its description of aborting fetch requests, response-body consumption, or streams | Connect user cancellation and disconnect handling to actual termination of application or transport work. |
| [OpenTelemetry GenAI semantic conventions — metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md) | Metric "gen_ai.client.operation.time_to_first_chunk" together with operation and workflow duration metrics | Measure the benefit streaming claims to provide without confusing first chunk, provider duration, and whole-workflow completion. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.networking` | [MDN — Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) | Sections "Receiving events from the server", "Error handling", "Closing event streams", and "Event stream format" | Patch the HTTP/SSE transport concepts needed for production response streaming without requiring the full Networking curriculum. |
<!-- learning-sources:end -->

## Why this matters

Streaming can make a system feel faster without making generation complete faster.

The cost is a real protocol: partial state, typed events, disconnects, cancellation, reconnects, buffering, backpressure, partial validation, and failures after the user has already seen output.

The route treats streaming as a production delivery mechanism rather than a UI animation.

## 1. Diagnostic first

Before studying the sources, explain:

- TTFC versus full completion;
- what events define start, partial, complete, failure, and cancellation;
- what should happen when the user disconnects;
- how reconnects can create duplicate or restarted output;
- what a slow consumer does to buffers;
- why incomplete structured/tool data must not trigger side effects.

If the answer is only "set stream=true," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
TTFC
→ time until the first useful streamed chunk

completion latency
→ time until the response/workflow is done

delta
→ partial state, not final truth

cancel
→ stop work that no longer has value

backpressure
→ slow downstream consumption constrains upstream flow
```

Streaming should improve a declared user experience, not merely produce animated text.

## 3. Independent practice

Use the [Delivery Mechanisms evidence contract](../../../projects/knowledge-assistant/delivery-mechanisms/).

Stream one Knowledge Assistant path, preserve the non-streaming baseline, define the event contract, propagate cancellation, and inject disconnect, slow-consumer, partial-data, and mid-stream failure cases.

## 4. Failure work

Exercise:

- provider failure after partial output;
- client cancellation;
- network disconnect/reconnect;
- duplicate/restarted events;
- slow consumer;
- proxy or server buffering;
- incomplete structured/tool fragments;
- partial-output moderation or validation limits.

At least one path should remain non-streaming because the trade-off is not worth it.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the event contract, reproduce TTFC/completion measurements, cancel upstream work, reproduce disconnect/backpressure/failure cases, and verify incomplete output is never presented or acted on as final state.

A visually responsive demo is not sufficient.

## 6. Transfer

Move the stream contract to a workload with different transport directionality, partial-result value, moderation needs, and cancellation cost.

## 7. Applied evidence

Applied evidence is streamed delivery that improves real user-perceived latency while keeping cancellation, failure, partial-state, safety, cost, and operational behavior explicit.
