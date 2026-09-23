# Security Boundaries Evidence Contract

Extend the same Knowledge Assistant. The goal is not to prove that prompt injection can always be detected.

Assume the model can be mistaken or manipulated and make the deterministic boundaries survive anyway:

```text
identity + tenant context
→ authorization
→ untrusted source
→ model/control decision
→ tool / protected data / sandboxed execution
→ output / external sink / persisted state
```

## Stage 1 — authenticate and authorize

Use [authentication-boundary.template.md](authentication-boundary.template.md).

Define:

- trusted issuer / principal;
- token or assertion validation;
- session lifetime and revocation;
- access-token resource/scope;
- deny-by-default authorization;
- resource/object checks;
- step-up or fresh authentication for higher-risk actions;
- service versus user identity.

The model never decides who the caller is or whether an API request is authorized.

## Stage 2 — isolate tenants

Use [tenant-isolation.template.md](tenant-isolation.template.md).

Track tenant context through:

- API requests;
- retrieval/vector data;
- caches and memories;
- tools and credentials;
- jobs/retries/resume;
- telemetry and audit;
- admin/support access.

Test at least two synthetic tenants. Authentication and authorization alone are not sufficient evidence of isolation.

## Stage 3 — minimize and authorize tools

Use [tool-permission-matrix.template.md](tool-permission-matrix.template.md).

For every tool/action record:

- why the capability exists;
- user or service identity;
- resource/tenant scope;
- downstream permission;
- complete-mediation point;
- approval requirement;
- rate/blast-radius limit;
- audit evidence.

Remove unnecessary functionality before trying to secure it.

## Stage 4 — map sensitive data

Use [sensitive-data-flow.template.md](sensitive-data-flow.template.md).

Classify protected sources and every place the data can flow:

- retrieval;
- tools;
- model context;
- output;
- streaming;
- cache;
- logs/traces;
- diagnostic replay;
- files/messages;
- URLs or external APIs.

Authorize before context assembly. Do not depend on the model to decide what it is allowed to see or where it may transmit protected data.

## Stage 5 — sandbox untrusted execution

Use [sandbox-contract.template.md](sandbox-contract.template.md) and [sandbox-failure-matrix.template.md](sandbox-failure-matrix.template.md).

Define:

- readable/writable filesystem;
- network egress;
- process identity and capabilities;
- credential exposure;
- CPU/memory/PID/storage/time limits;
- persistence and cleanup;
- tenant/job lifetime;
- behavior when policy cannot be applied.

## Stage 6 — control the AI supply chain

Use [supply-chain-record.template.md](supply-chain-record.template.md).

Inventory models/providers, adapters, code dependencies, containers, prompts, data/indexes, tools/services, and evaluation artifacts.

Record immutable identity, supplier/source, provenance/integrity evidence, admission status, owner, and downstream dependents.

Use synthetic tampering/poisoning fixtures to prove the admission and response path.

## Stage 7 — engineer guardrails

Use [guardrail-contract.template.md](guardrail-contract.template.md) and [guardrail-failure-matrix.template.md](guardrail-failure-matrix.template.md).

For each guardrail define:

- threat/policy objective;
- exact workflow boundary;
- deterministic or probabilistic implementation;
- blocking/parallel timing;
- failure/fallback behavior;
- false-positive/false-negative evidence;
- release identity.

Guardrails complement deterministic security controls; they do not replace them.

## Stage 8 — attack the combined path

Use [security-boundary-failure-matrix.template.md](security-boundary-failure-matrix.template.md).

Use synthetic secrets or canary records.

Treat model output as attacker-controlled and attempt identity, tenant, permission, exfiltration, cache/telemetry, streaming, and sandbox bypasses.

## Exit condition

Another engineer should be able to replay the attack cases and see deterministic policy—not model obedience—protect identity, tenant boundaries, actions, sensitive data, and execution isolation.

A successful login, model refusal, or container startup alone is not sufficient evidence.
