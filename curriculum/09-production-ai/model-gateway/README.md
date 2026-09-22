# Model Provider and Gateway Architecture

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Azure Architecture Center — Gateway in front of model deployments](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-multi-backend) | Sections "Introduce a gateway for multiple model deployments", "Reasons to avoid a gateway for multiple model deployments", and the multi-instance topology guidance covering retry, circuit breaking, throttling, load balancing, security, and model-version consistency | Establish when a gateway earns its complexity, which responsibilities belong at the boundary, and why reliability policy must preserve model compatibility. |
| [Cloudflare AI Gateway — Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/) | Sections "Introduction" and "Core Concepts" | Inspect concrete conditional, percentage, model, rate-limit, budget, fallback, and route-version controls without treating one product as the definition of a gateway. |
| [Cloudflare AI Gateway — Request handling](https://developers.cloudflare.com/ai-gateway/configuration/request-handling/) | Sections "Request timeouts" and "Request retries" | Ground timeout, retry, and backoff behavior in bounded request-handling policy rather than unlimited transparent retries. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.api-service-design` | [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Sections "Reducing client complexity with idempotent API design" and "Retries and semantic equivalence" | Patch the API contract, failure, retry, and idempotency reasoning needed before centralized gateway policy, without forcing the full API/service-design curriculum. |
<!-- learning-sources:end -->

## Why this matters

A gateway is useful only when centralized provider control earns the extra component.

The route starts from a direct provider path and asks whether routing, reliability, quota, credential, or telemetry policy is difficult enough to justify a gateway. A transparent proxy with no measurable operational value is not the goal.

## 1. Diagnostic first

Before studying the sources, decide:

- what problem the gateway would solve;
- which failures are retryable, fallback-eligible, or fail-fast;
- which model/provider alternatives are actually compatible;
- who owns credentials and request correlation;
- what evidence would make you remove the gateway.

If those decisions collapse into "send requests through one URL," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
model selection
→ which model fits product constraints

gateway routing
→ which allowed deployment/provider handles this request now

fallback
→ a failure policy, not permission to switch to any available model
```

The client-facing contract should stay stable while provider-specific policy remains inspectable.

## 3. Independent practice

Use the [Production Boundary evidence contract](../../../projects/knowledge-assistant/production-boundary/).

Preserve the direct-provider baseline, then introduce the gateway and exercise timeout, throttling, compatible fallback, incompatible fallback rejection, credential/bypass, and correlation behavior.

## 4. Failure work

A ready implementation should make these cases observable:

- provider timeout;
- 429 or throttling;
- retry exhaustion;
- compatible fallback or failover;
- incompatible model/version rejection;
- gateway credential or authentication failure;
- application validation failure.

Bound retries. Do not hide provider failures behind silent fallback.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the direct baseline, gateway contract, routing/failure policy, compatibility rules, failure matrix, and overhead comparison and reproduce the declared behavior.

A proxy that only forwards requests is not sufficient.

## 6. Transfer

Move the boundary to a different provider mix, tenant policy, latency budget, and model-compatibility contract.

## 7. Applied evidence

Applied evidence is a production gateway that earns its operational cost—or a measured decision to keep the direct integration because centralized control does not.
