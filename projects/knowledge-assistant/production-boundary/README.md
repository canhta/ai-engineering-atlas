# Production Boundary Evidence Contract

Extend the same Knowledge Assistant built in the earlier milestones. Do not start a separate production demo: carry forward the request set, evaluation lineage, retrieval/tool behavior, and direct model-provider path.

## Baseline first

Before adding infrastructure, preserve:

- the direct provider request path;
- representative success and failure requests;
- model/provider identity;
- task-quality or evaluation evidence already used by the project;
- latency and cost/usage measurements where available.

The baseline is what makes later gateway and telemetry complexity measurable.

## Stage 1 — model gateway

Use [gateway-evidence.template.md](gateway-evidence.template.md).

Add centralized provider control only for a concrete need such as routing, failover, quota, credential ownership, or common telemetry policy. Exercise failure behavior instead of proving only a happy-path proxy.

The gateway record must include timeout and throttling failures, bounded retries, compatible fallback, deliberately rejected incompatible fallback, bypass/credential boundaries, and direct-versus-gateway overhead.

## Stage 2 — observability and replay

Use [observability-evidence.template.md](observability-evidence.template.md).

Instrument the same request path. Keep model/user/tool content out of telemetry by default, preserve correlation across the important operations, and record enough provenance to reconstruct a comparable failed execution.

A replay is diagnostic reconstruction. It is not a claim that a stochastic model response or mutable external system can be reproduced byte-for-byte.

## Exit condition

Another engineer should be able to inspect the artifacts, reproduce at least one injected production failure, find its failure domain from traces and metrics, verify the privacy/content policy, and understand the decision to keep, simplify, or remove each added production mechanism.

A dashboard screenshot, a proxy that only forwards requests, or an agent-written incident explanation without raw evidence is not sufficient.
