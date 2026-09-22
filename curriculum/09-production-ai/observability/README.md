# AI Observability and Request Replay

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OpenTelemetry GenAI semantic conventions — spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md) | Sections "Spans", "Inference", "Retrievals", "Execute tool span", "Capturing instructions, inputs, and outputs", and "Recording content on attributes" | Build the request/span model for inference, retrieval, and tools while preserving the explicit privacy boundary around model and user content. |
| [OpenTelemetry GenAI semantic conventions — metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md) | Sections "Generative AI client metrics", "gen_ai.client.token.usage", "gen_ai.client.operation.duration", "gen_ai.client.operation.time_to_first_chunk", and "gen_ai.invoke_workflow.duration" | Separate operation duration, workflow duration, token usage, and streaming time-to-first-chunk into metrics that match the operation being observed. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.api-service-design` | [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Sections "Reducing client complexity with idempotent API design" and "Retries and semantic equivalence" | Patch the service request, retry, and idempotency model needed to interpret traces and diagnostic replay without requiring the full API/service-design curriculum. |
<!-- learning-sources:end -->

## Why this matters

A bad AI result can come from the provider, retrieval, a tool, gateway policy, mutable data, configuration, or the application itself. Production evidence must make those failure domains distinguishable.

Observability is not the same as evaluation, and replay is not deterministic regeneration of a stochastic response.

## 1. Diagnostic first

Before studying the sources, define:

- the root request and nested operations that need correlation;
- workflow versus provider-call latency;
- which content is too sensitive to capture by default;
- which provenance identifiers are required for diagnosis;
- how a replay can diverge when upstream state changes.

If the answer is "log the prompt and response," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these boundaries explicit:

```text
trace
→ explains what executed

metric
→ measures an operational signal over time

evaluation
→ judges behavior against a quality contract

diagnostic replay
→ reconstructs a comparable execution from provenance
```

OpenTelemetry GenAI semantic conventions are current interoperability guidance in **Development** status, so treat their field names as evolving rather than permanent application schema.

## 3. Independent practice

Use the [Production Boundary evidence contract](../../../projects/knowledge-assistant/production-boundary/).

Instrument the same Knowledge Assistant path, inject failures, prove content exclusion or redaction, record provenance, and diagnose one incident from collected evidence.

## 4. Privacy and replay work

Keep prompt, user, tool, and output content out of telemetry by default unless policy explicitly allows capture.

For replay, record enough identity and configuration to explain what changed:

- provider and requested/actual model;
- inference parameters;
- prompt/template identifier or hash;
- retrieval/index/config identifier;
- tool schema/config identifier;
- gateway route/policy version when applicable;
- input or secure input reference;
- relevant feature/config flags.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect correlated success/failure traces, the privacy test, the provenance record, telemetry overhead, and one incident diagnosis and reproduce the reasoning without relying on an agent-written explanation.

A dashboard screenshot is not sufficient.

## 6. Transfer

Move the observability contract to a workflow with different providers, tools, retrieval state, privacy rules, or streaming behavior.

## 7. Applied evidence

Applied evidence is telemetry that catches or explains a real failure while staying privacy-safe and worth its storage/performance cost. Remove fields that do not earn that cost.
