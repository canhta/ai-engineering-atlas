# RFC 0017 — Identity, Tenant Isolation, and Sandboxed Execution

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-23
- Reviewed: 2026-09-23
- Review decision: Approved by repository owner through continued implementation approval

## Summary

Promote three existing Security & Governance coverage nodes:

- `security.auth` — Authentication and Authorization;
- `security.multi-tenant` — Multi-Tenant Isolation;
- `security.sandboxing` — Sandboxing.

No catalog node is added or removed.

These routes extend the deterministic security boundaries already built around prompt injection, tool permissions, and data exfiltration.

## Boundary decisions

### Authentication and authorization

This route owns identity assertion validation, session lifecycle, access-token/resource scope, deny-by-default resource authorization, reauthentication, revocation, and security audit behavior.

It does not make the model an authorization engine.

### Multi-tenant isolation

This route is deliberately separate from authentication/authorization.

An authenticated and authorized user can still reach another tenant if tenant context is lost or resource scoping is inconsistent. The route therefore owns tenant context, pooled/silo/bridge decisions, tenant-aware retrieval/cache/state/background paths, and cross-tenant negative testing.

### Sandboxing

This route is deliberately separate from tool permission.

Tool permission decides whether code execution is allowed. Sandboxing constrains what the allowed process can touch after it starts.

The route owns filesystem, network, privilege, resource, lifetime, cleanup, and runtime-isolation boundaries for untrusted execution.

## Evidence reviewed

### RFC 9700 — OAuth 2.0 Security Best Current Practice

Relevant sections:

- 2.1 Protecting Redirect-Based Flows;
- 2.2 Sender-Constrained Access Tokens;
- 2.3 Access Token Privilege Restriction;
- 4.14.2 Recommendations.

### OpenID Connect Core 1.0

Relevant sections:

- Section 2 ID Token;
- Section 3.1.3.7 ID Token Validation.

### NIST SP 800-63B-4

Relevant sections:

- Authenticator Assurance Level 2;
- Phishing Resistance;
- Session Management.

### OWASP Authorization Cheat Sheet

Relevant sections:

- Enforce Least Privileges;
- Deny by Default;
- Validate the Permissions on Every Request.

### AWS SaaS Architecture Fundamentals — Tenant isolation

The source explicitly distinguishes authentication/authorization from tenant isolation and requires tenant context to scope every tenant resource access.

### Azure Architecture Center — Multitenant identity

Relevant sections:

- Authorization;
- Add tenant identity and role information to tokens;
- User and tenant conflation;
- Role and resource authorization conflation.

### Azure Architecture Center — Tenancy models

Relevant section:

- Tenant isolation and the isolation continuum.

### Anthropic — Claude Code sandboxing

Relevant section:

- Sandboxing as complementary filesystem and network isolation boundaries.

### gVisor — Security Model

Relevant sections:

- Threats: The Anatomy of an Exploit;
- Goals: Limiting Exposure;
- What can a sandbox do?;
- Principles: Defense-in-Depth.

### Kubernetes — Configure a Security Context

Relevant controls:

- runAsNonRoot;
- allowPrivilegeEscalation;
- Linux capabilities;
- readOnlyRootFilesystem;
- seccompProfile.

## Knowledge Assistant integration

Extend:

`projects/knowledge-assistant/security-boundaries/`

The security progression becomes:

1. authentication and authorization boundary;
2. multi-tenant isolation;
3. tool permission boundary;
4. data-exfiltration boundary;
5. sandboxed execution;
6. integrated security attack path.

## Promotion gate

- [x] existing catalog IDs are reused;
- [x] no new prerequisite cycle is introduced;
- [x] all three promoted routes have no unresolved coverage-only prerequisite;
- [x] authentication and authorization remain distinct;
- [x] session, token, revocation, and per-request authorization behavior are testable;
- [x] tenant isolation is explicitly separate from ordinary auth;
- [x] tenant context spans retrieval, cache, state, tools, background jobs, and audit paths;
- [x] pool/silo/bridge isolation is a per-resource decision;
- [x] sandboxing is separate from tool permission;
- [x] filesystem and network isolation are both required where applicable;
- [x] privilege escalation, resource exhaustion, persistence, and credential discovery are tested;
- [x] security evidence uses failure injection rather than happy-path login/container demos;
- [x] learner-facing source locators are explicit;
- [x] project evidence extends the existing Knowledge Assistant;
- [x] repository validators must pass before completion.

## Impact

After implementation:

- Security & Governance becomes **10 / 6 ready**;
- repository counts become **115 catalog / 39 ready / 76 coverage**.

The remaining Security & Governance coverage nodes are guardrails, AI safety/governance, supply-chain/data security, and privacy/legal/responsible AI.
