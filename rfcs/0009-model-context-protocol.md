# RFC: Model Context Protocol Slice

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The Agents domain now has one remaining coverage node:

- `agents.mcp` — Model Context Protocol

MCP should not be taught as:

- "install an MCP SDK";
- "wrap one function as a tool";
- "a multi-agent communication protocol";
- a 2025-era `initialize` / session tutorial that is already stale.

The current final protocol revision is `2026-07-28`, which starts a new stateless era:

```text
legacy MCP (through 2025-11-25)
→ initialize handshake
→ negotiated session state
→ Mcp-Session-Id / session-scoped capabilities

modern MCP (2026-07-28)
→ server/discover
→ no initialize handshake
→ protocol version + client capabilities on every request
→ stateless core
```

A useful MCP competency therefore needs to teach protocol boundaries, capability negotiation, primitive semantics, authorization, interoperability, and migration — not one SDK's decorator API.

## Evidence

### MCP TypeScript SDK v2 — Protocol versions

https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions

Verified sections include:

- **Name the two eras**
- **Negotiate the era from the client**
- the behavior matrix comparing 2025 legacy and 2026 modern MCP.

The current stable SDK documents `2026-07-28` as the modern era:

- there is no `initialize` handshake;
- clients discover servers through `server/discover`;
- protocol version and capabilities travel with each request;
- legacy fallback remains possible when explicitly supported.

This route should teach the era boundary because many MCP examples and libraries still expose 2025-era concepts.

### MCP TypeScript SDK v2 — Supporting protocol revision 2026-07-28

https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28

Verified sections include:

- **Serving the 2026-07-28 revision**
- **Replacing per-session state**
- **Auth on 2026-07-28**
- **Server identity in result `_meta`; `clientInfo` demoted to SHOULD**
- **Multi-round-trip requests**
- **`subscriptions/listen`**
- _*Mcp-Param-* and standard headers_*
- **Cache fields and cache hints**

This is important evidence that the modern protocol is not just "old MCP without a session ID."

The modern request boundary includes:

- per-request protocol metadata;
- capability discovery;
- explicit request-scoped state where interaction spans rounds;
- request/response correlation;
- changed notification/subscription behavior;
- cache semantics;
- modern authorization behavior.

The route should extract those protocol concepts rather than require the TypeScript SDK.

### MCP v2 server/client SDK documentation

https://ts.sdk.modelcontextprotocol.io/v2/

The stable v2 documentation describes MCP as a standard connecting AI applications to systems that expose:

- **tools**
- **resources**
- **prompts**

These primitives have different product semantics and should not be collapsed into "everything is a tool."

### Tools

Current MCP SDK/spec documentation defines tools as callable functionality with explicit schemas and structured results.

For the `2026-07-28` revision, tool `inputSchema` / `outputSchema` align with JSON Schema 2020-12 and structured output can represent any conforming JSON value.

The curriculum should connect this to the existing Tool Calling competency:

```text
Tool Calling
= model/application execution boundary

MCP tool
= interoperable protocol representation of a callable capability
```

MCP does not remove the need for deterministic validation, authorization, approval, idempotency, or side-effect controls.

### Resources

Current MCP SDK/spec documentation defines resources as URI-addressed data that clients can discover/read.

The learner should distinguish:

- a resource from a tool;
- a resource URI from arbitrary filesystem access;
- protocol-level discovery/read semantics from the application's underlying storage authorization.

Resource handlers must still prevent path traversal, scope leakage, and unauthorized reads.

### Prompts

Current MCP SDK/spec documentation defines prompts as user-selectable prompt templates rather than privileged executable actions.

This distinction matters because tools, resources, and prompts have different ownership, risk, and UI semantics.

### Discovery and per-request capabilities

For modern MCP, `server/discover` exposes supported protocol versions and capabilities before ordinary use.

Every modern request then carries its protocol version and client capability envelope.

The learner should be able to explain:

- discovery versus invocation;
- capability advertisement versus authorization;
- protocol version negotiation versus product feature flags;
- why self-reported `clientInfo` / `serverInfo` are not security identities.

### Multi-round-trip requests

The `2026-07-28` protocol removes the old server-to-client JSON-RPC request channel.

Instead, interactions such as elicitation/sampling/roots can be represented through an `input_required` result; the client supplies input and retries the original request with the relevant response/state.

This is a protocol-level state-machine concept.

The route should teach:

- input-required response;
- opaque/request-scoped state;
- client-supplied input as untrusted data;
- retry/re-entry behavior;
- bounded rounds and failure handling.

It should not require use of deprecated legacy server-to-client request APIs.

### Authorization

Current MCP v2 HTTP serving supports OAuth-style resource-server behavior and bearer-token validation.

The security boundary remains:

```text
capability advertisement
≠ authentication
≠ authorization
```

An MCP server must still:

- validate access tokens for the intended protected resource;
- enforce scopes/permissions in application code;
- treat client metadata as informational rather than authoritative identity;
- avoid granting a tool/resource merely because the client advertised a capability.

The route should reuse the existing Prompt Injection / Trust Boundaries competency rather than invent a separate security model.

### Tasks extension

The current Tasks extension for the `2026-07-28` era provides an optional asynchronous execution model in which a server may return a task handle instead of a synchronous final result.

The extension supports concepts such as:

- durable task ID;
- task status;
- polling with `tasks/get`;
- client input with `tasks/update`;
- cancellation;
- eventual result/error.

Tasks are **not part of the core mental model required to understand MCP tools/resources/prompts**.

They should be taught as an optional extension and only when the integration genuinely has long-running operations.

The route should also note that SDK support can lag the protocol/extension specification, so learners must verify implementation support instead of assuming every SDK implements every extension.

### Conformance

The MCP project publishes conformance tracking for the `2026-07-28` revision.

The competency should require protocol-level tests rather than only demonstrating that one host happens to connect successfully.

Conformance does not replace product-level authorization, semantic validation, or security tests.

## Proposal

Create one L3 route for `agents.mcp`.

```text
existing safe tool boundary
→ identify interoperability need
→ choose MCP primitive
→ discover / negotiate capabilities
→ expose protocol contract
→ connect a client/host
→ verify modern 2026 request behavior
→ enforce auth/trust boundaries
→ test failures / compatibility
→ decide whether MCP is worth the adapter complexity
```

## `agents.mcp`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- design judgment

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.tool-calling`
- `security.prompt-injection`

No hard dependency on:

- `agents.multi-agent`;
- `agents.orchestration`;
- `agents.long-running`;
- `agents.memory`.

MCP can be used by a deterministic or non-agentic host.

The existing Tool Calling route supplies execution-contract reasoning. Prompt Injection / Trust Boundaries supplies deterministic authorization and untrusted-content boundaries.

### Boundary with adjacent competencies

`agents.mcp` should **not** become:

- a general API/service-design course;
- a tool-calling duplicate;
- a framework-specific SDK tutorial;
- a multi-agent communication course;
- a remote-code-execution shortcut;
- a requirement to expose all backend endpoints;
- an assumption that the protocol itself provides authorization policy.

### Observable outcomes

The learner should be able to:

- explain the host/client/server roles without tying them to one vendor product;
- distinguish modern `2026-07-28` MCP from handshake-era MCP;
- explain `server/discover` and per-request capability/version metadata;
- distinguish tools, resources, and prompts by semantics and risk;
- choose which application capability should or should not be exposed through MCP;
- design a small interoperable MCP surface instead of mirroring an internal API;
- validate MCP tool arguments/results and preserve application-side authorization;
- prevent resource path/scope leakage and treat protocol metadata as untrusted/self-reported where appropriate;
- implement or inspect one modern MCP client/server exchange;
- explain multi-round-trip `input_required` behavior and bound repeated interaction;
- handle discovery/version mismatch, unsupported capability, validation failure, auth failure, and downstream execution failure distinctly;
- reason about cache/discovery freshness and capability changes;
- verify interoperability with more than one client or with protocol-level tests where practical;
- distinguish core MCP from optional extensions such as Tasks;
- verify SDK support before relying on a protocol extension;
- compare direct/internal integration with MCP and justify whether protocol interoperability earns the added adapter/versioning complexity.

### Modern versus legacy evidence

The learner must explicitly compare:

| Concern                     | Legacy era                           | Modern `2026-07-28`               |
| --------------------------- | ------------------------------------ | --------------------------------- |
| startup                     | `initialize` handshake               | `server/discover`                 |
| protocol version            | session-negotiated                   | per request                       |
| capabilities                | session-negotiated                   | per request                       |
| session ID                  | may use MCP session                  | no core session                   |
| server → client interaction | server-to-client request channel     | multi-round-trip `input_required` |
| change notifications        | legacy notification/session patterns | `subscriptions/listen` model      |

The learner does not need to implement every legacy behavior.

The purpose is to prevent stale architecture assumptions.

## Required evidence

Extend the Knowledge Assistant with a small MCP interoperability boundary.

The reference implementation should expose a deliberately narrow surface such as:

- one read-oriented search/retrieval tool;
- one URI-addressed resource;
- optionally one prompt if it has a genuine user-facing use case.

Do not expose a privileged mutation merely to make the exercise look advanced.

Evidence must include:

- integration problem and why MCP is justified;
- MCP revision/era supported;
- host/client/server responsibility diagram;
- `server/discover` or equivalent capability evidence;
- tool/resource/prompt inventory and rationale;
- tool schema and deterministic validation;
- resource URI/scope validation;
- authorization boundary for HTTP use where applicable;
- client/server trace for one successful modern exchange;
- unsupported-version or unsupported-capability test;
- malformed-input test;
- auth/permission failure test where applicable;
- downstream tool/resource failure test;
- one legacy-versus-modern compatibility or migration note;
- one multi-round-trip analysis or test if the chosen interaction requires client input;
- optional Tasks experiment only if the workflow has a real asynchronous operation;
- interoperability or conformance evidence;
- latency/cost/operational-overhead comparison with the pre-MCP integration;
- decision to keep, simplify, or remove MCP.

A screenshot showing "connected to MCP server" is not sufficient exit evidence.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/mcp/`

The package should extend the current Knowledge Assistant without changing its core product objective.

Proposed progression:

```text
existing internal tool/resource integration
→ interoperability requirement
→ minimal MCP surface
→ modern discovery / capability exchange
→ successful tool/resource interaction
→ invalid input / auth / version failure
→ optional multi-round-trip interaction
→ interoperability/conformance evidence
→ direct integration vs MCP comparison
→ keep / simplify / remove decision
```

Proposed artifacts:

- MCP decision record;
- host/client/server boundary diagram;
- primitive inventory;
- capability/discovery trace;
- tool/resource contract;
- auth/trust-boundary record;
- protocol-failure test matrix;
- compatibility/migration note;
- optional Tasks record;
- interoperability/conformance record;
- architecture decision.

## Promotion gate

`agents.mcp` should not move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. exact `2026-07-28` source locators are rechecked during route authoring;
3. sources come from the current MCP specification/official SDK documentation, not stale tutorials;
4. the learner route explicitly distinguishes modern and legacy protocol eras;
5. tools/resources/prompts are differentiated semantically;
6. capability advertisement is distinguished from authorization;
7. client/server metadata is not treated as authenticated identity;
8. deterministic validation and permission enforcement remain outside model output;
9. the Knowledge Assistant MCP evidence package is inspectable;
10. version/capability mismatch is tested;
11. malformed protocol/application input is tested;
12. authorization failure is tested for HTTP/authenticated setups;
13. resource scope/path boundaries are tested if resources are exposed;
14. multi-round-trip behavior is addressed if the selected interaction requires it;
15. Tasks remains optional and implementation support is verified before use;
16. interoperability or protocol-level conformance evidence is present;
17. a non-MCP baseline is preserved;
18. prerequisite-cycle validation passes;
19. learner-facing source blocks are generated;
20. `curriculum/STATUS.md` is regenerated;
21. `site/src/data/atlas.json` is regenerated only through `scripts/build_site_data.py --write`;
22. `make check` and `make site-check` pass;
23. review outcome is recorded before promotion.

## Alternatives considered

### Teach MCP as part of Tool Calling

Rejected.

Tool Calling is the application execution boundary. MCP is an interoperability protocol spanning discovery, version/capability negotiation, tools/resources/prompts, transport behavior, and optional extensions.

### Require Multi-Agent first

Rejected.

MCP is useful in deterministic and single-agent applications. It is not inherently an agent-to-agent protocol.

### Teach the `initialize` handshake as the main lifecycle

Rejected.

That would teach a stale 2025-era mental model as current architecture. The route should explain legacy behavior for compatibility but center the current `2026-07-28` stateless era.

### Teach only tools

Rejected.

Tools are important but incomplete. Resources and prompts have different semantics, UI expectations, and trust boundaries.

### Expose every backend endpoint through MCP

Rejected.

The existing Tool Calling route already establishes that model-facing surfaces should be task-oriented and minimal.

### Treat advertised capabilities as permission

Rejected.

Capabilities describe protocol support. Authentication and authorization remain separate security decisions.

### Require Tasks

Rejected.

Tasks are optional and relevant only to asynchronous/long-running operations. SDK support may lag the extension specification.

### Require one SDK

Rejected.

Official SDKs are implementation examples. The competency should transfer across languages and hosts.

## Impact

If approved and implemented:

- `agents.mcp` moves from `coverage` to `ready`;
- no catalog nodes are added or removed;
- repository counts become:
  - **115** catalog competencies;
  - **23** ready routes;
  - **92** coverage-only competencies;
- Agents domain becomes **9 / 9 ready**.

### Proposed resources after approval

Register current official sources such as:

- MCP TypeScript SDK v2 protocol versions;
- MCP TypeScript SDK support for `2026-07-28`;
- official MCP server/client v2 documentation;
- official Tasks extension documentation;
- current MCP conformance tracking.

Avoid third-party tutorials as curriculum authority.

### Project integration

Add a Knowledge Assistant `mcp/` evidence package and MCP interoperability milestone.

## Implementation outcome

Approved and implemented on 2026-09-22.

- `agents.mcp` promoted to `ready` at L3.
- The route centers the current `2026-07-28` stateless MCP era and keeps legacy `initialize`/session behavior only as compatibility and migration context.
- MCP remains distinct from Tool Calling, Orchestration, and Multi-Agent Systems; its hard prerequisites are `ai.tool-calling` and `security.prompt-injection`.
- Tools, resources, and prompts are taught as distinct primitives with different semantics and trust boundaries.
- Capability/version advertisement is explicitly separated from authentication and application authorization.
- Modern multi-round-trip `input_required` behavior is represented without teaching deprecated server-to-client request assumptions.
- Tasks remains optional and requires implementation-support verification before use.
- The Knowledge Assistant now includes an `mcp/` evidence package preserving a direct-integration baseline, protocol failure matrix, resource-scope tests, and interoperability/conformance evidence.
- Official current-spec MCP sources are registered; no third-party tutorial is curriculum authority.
- Learner-facing source blocks, curriculum status, and site content are generated from source-of-truth files.
- Repository status after promotion is expected to be 115 catalog competencies, 23 ready routes, and 92 coverage-only competencies; Agents is 9 / 9 ready.

## Review checklist

- [x] MCP is distinct from Tool Calling, Orchestration, and Multi-Agent Systems.
- [x] The route centers the current `2026-07-28` stateless era.
- [x] Legacy lifecycle is taught only for compatibility/migration context.
- [x] `server/discover` and per-request capabilities/versioning are represented.
- [x] Tools, resources, and prompts are differentiated.
- [x] Capability advertisement is distinct from authentication/authorization.
- [x] Self-reported client/server metadata is not used as security identity.
- [x] HTTP authorization preserves deterministic application-side enforcement.
- [x] Resource scope/path validation is represented.
- [x] Multi-round-trip input is represented without teaching deprecated server-request assumptions.
- [x] Tasks is optional rather than required core MCP.
- [x] Interoperability/conformance evidence is required.
- [x] A pre-MCP/direct-integration baseline is preserved.
- [x] Knowledge Assistant integration extends existing evidence lineage.
- [x] Reviewer explicitly approves or requests changes before implementation.
