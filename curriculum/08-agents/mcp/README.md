# Model Context Protocol

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [MCP TypeScript SDK v2 — Protocol versions](https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions) | Sections "Name the two eras", "Negotiate the era from the client", "Pin an era", and the legacy/modern behavior matrix | Establish the legacy-versus-modern protocol boundary and the modern server/discover negotiation model. |
| [MCP TypeScript SDK v2 — Supporting protocol revision 2026-07-28](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28) | Sections "Serving the 2026-07-28 revision", "Replacing per-session state", "Auth on 2026-07-28", "Server identity in result _meta; clientInfo demoted to SHOULD", "Multi-round-trip requests", "Mcp-Param-* and standard headers", and "Cache fields and cache hints" | Understand the stateless request envelope, request-scoped state, authorization changes, modern headers, multi-round-trip input, and cache behavior. |
| [MCP TypeScript SDK v2 — Overview](https://ts.sdk.modelcontextprotocol.io/v2/) | Overview and server/client entry points describing MCP hosts, servers, tools, resources, and prompts | Ground the interoperability model and the three core server primitives in the current v2 SDK documentation. |
| [MCP TypeScript SDK v2 — Build your first client](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-client.html) | Sections "List the server’s tools" and "Add a resource and read it" | Contrast callable tool discovery with URI-addressed resource discovery/read behavior. |
| [MCP TypeScript SDK v2 — Prompts](https://ts.sdk.modelcontextprotocol.io/v2/servers/prompts) | Sections "Register a prompt", "Validate the arguments with the schema", and "Build the messages" | Distinguish user-selectable prompt templates from tools and resources and inspect their argument-validation contract. |
| [MCP Tasks Extension — 2026-07-28](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks) | Sections "Capability Negotiation", "Supported Methods", "Tasks", "Task Polling", and "Security Considerations" | Treat durable async Tasks as an optional extension with explicit capability negotiation, polling, cancellation, and per-request authorization. |
| [MCP Conformance — 2026-07-28](https://plan.modelcontextprotocol.io/conformance/1) | 2026-07-28 conformance coverage dashboard | Connect protocol learning to versioned conformance evidence rather than only one successful host connection. |
<!-- learning-sources:end -->

## Why this matters

MCP is not "tool calling with another SDK."

It is an interoperability protocol between a host/client and servers that expose capabilities through standardized primitives.

The current protocol model also matters:

```text
legacy MCP
→ initialize handshake
→ session-negotiated version/capabilities

modern 2026-07-28 MCP
→ server/discover
→ per-request protocol metadata
→ stateless core
```

A learner who only knows the old lifecycle can build something that works in one SDK example while misunderstanding the current protocol.

## 1. Diagnostic first

Explain:

- host, client, and server responsibilities;
- tools versus resources versus prompts;
- why capability advertisement is not authorization;
- how a modern request differs from legacy initialize/session MCP;
- what should happen on version mismatch, malformed input, or unauthorized access.

If the explanation depends on "the SDK handles it" without a protocol model, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these boundaries explicit:

```text
Tool Calling
→ model/application execution contract

MCP
→ interoperable protocol contract around discoverable primitives

capability support
≠ authentication
≠ authorization
```

Treat `clientInfo` and `serverInfo` as self-reported metadata, not security identities.

## 3. Independent practice

Use the [MCP evidence contract](../../../projects/knowledge-assistant/mcp/).

Expose a deliberately small surface:

- one read-oriented tool;
- one URI-addressed resource;
- optionally one prompt with a real user-facing purpose.

Preserve the direct/internal integration as a baseline.

## 4. Failure work

Test:

- unsupported or pinned protocol version;
- unsupported capability;
- malformed tool input;
- unauthorized resource access;
- downstream tool/resource failure;
- stale capability/cache assumptions;
- input_required re-entry if the use case needs it.

If you use Tasks, verify that the implementation actually supports the extension and test polling, cancellation, and authorization.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the supported revision, discovery/capability trace, primitive contracts, security boundary, failure matrix, and interoperability evidence and reproduce the result.

A screenshot showing "connected to MCP server" is not enough.

## 6. Transfer

Move the protocol boundary to a different host/server relationship with different transport, authorization, resource-scope, compatibility, or async requirements.

## 7. Applied evidence

Applied evidence is an MCP integration that earns its adapter/versioning complexity through real interoperability—or a measured decision to stay with the direct integration.
