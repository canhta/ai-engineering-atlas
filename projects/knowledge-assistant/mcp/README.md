# MCP Evidence Contract

This package extends the same Knowledge Assistant. MCP is added only for a real interoperability need; it does not replace the product's existing tool, retrieval, authorization, or evaluation contracts.

## Required progression

```text
existing direct/internal integration
→ interoperability requirement
→ choose MCP primitive
→ modern discovery / capability exchange
→ successful interaction
→ version / validation / auth / downstream failures
→ optional multi-round-trip or Tasks behavior
→ interoperability / conformance evidence
→ direct integration vs MCP comparison
→ keep / simplify / remove decision
```

## 1. Boundary and primitive inventory

Use [mcp-boundary.template.md](mcp-boundary.template.md).

Record:

- supported protocol revision/era;
- host/client/server responsibilities;
- every exposed tool/resource/prompt and why it belongs;
- what remains internal;
- auth and permission owner;
- resource URI/scope rules;
- compatibility policy.

## 2. Protocol failure matrix

Use [mcp-test-matrix.template.md](mcp-test-matrix.template.md).

At minimum exercise:

- modern discovery/version evidence;
- unsupported version or capability;
- malformed tool/prompt input;
- unauthorized tool/resource access where applicable;
- downstream application failure;
- resource-scope/path violation;
- stale capability/cache assumption.

## 3. Optional modern extensions

Only add multi-round-trip input or Tasks when the integration requires them.

If used, record:

- capability/extension support;
- bounded rounds or polling;
- durable identifiers/state;
- cancellation;
- authorization on each relevant request;
- implementation/version support.

## 4. Interoperability and conformance

Do not treat one host connection as protocol proof.

Record either:

- protocol/conformance test evidence; or
- more than one compatible client/host where practical.

Keep product-level authorization and semantic tests separate from protocol conformance.

## Completion standard

Another engineer should be able to answer:

- what MCP revision is supported;
- what the modern lifecycle is;
- why each primitive is exposed;
- where authorization is enforced;
- how version/capability failures behave;
- whether optional extensions are actually supported;
- what MCP improves relative to the direct integration;
- whether the adapter should be kept.
