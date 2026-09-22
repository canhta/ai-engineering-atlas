# RFC 0016 — Tool Permissions and Data Exfiltration

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner through continued implementation approval

## Summary

Promote two existing Security & Governance nodes:

- `security.tool-permissions` — Tool Permissions;
- `security.data-exfiltration` — Data Exfiltration.

No catalog node is added or removed.

The dependency order deliberately avoids a cycle:

```text
ai.tool-calling + deterministic-vs-agentic design
            │
            ▼
security.tool-permissions
            │
            ▼
security.prompt-injection
            │
            ▼
security.data-exfiltration
```

Prompt injection already treats tool permissions as a prerequisite. Tool permissions therefore does not depend on prompt injection.

## Why this slice now

Prompt injection becomes materially dangerous when a manipulated model can access too much functionality, too much data, or a powerful outbound sink.

The next security skills should therefore establish two deterministic boundaries:

1. what actions a model-controlled tool path is authorized to perform;
2. what sensitive data may flow from protected sources to external sinks.

## Evidence reviewed

### OWASP LLM06:2025 — Excessive Agency

<https://genai.owasp.org/llmrisk/llm062025-excessive-agency/>

Relevant sections:

- "Common Examples of Risks";
- "Prevention and Mitigation Strategies";
- "Example Attack Scenarios".

The source identifies excessive functionality, permissions, and autonomy as root causes and recommends minimizing extensions/functionality/permissions, executing in user context, requiring approval, and implementing complete mediation.

### MCP 2026-07-28 — Security Best Practices

<https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx>

Relevant sections:

- "Confused Deputy Problem";
- "Token Passthrough";
- "Scope Minimization".

The source provides concrete permission failures around wrong trust assumptions, broad tokens, audit/accountability loss, data-exfiltration risk, and progressive least-privilege scope elevation.

### MCP 2026-07-28 — Authorization Security Considerations

<https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx>

Relevant sections:

- "Token Audience Binding and Validation";
- "Confused Deputy Problem";
- "Access Token Privilege Restriction".

This supplies normative audience/resource and upstream-token separation rules.

### OWASP LLM02:2025 — Sensitive Information Disclosure

<https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/>

Relevant sections:

- "Common Examples of Vulnerability";
- "Prevention and Mitigation Strategies".

The source covers protected data classes, sanitization, least-privilege access, restricted data sources, and tokenization/redaction, while warning that prompt restrictions alone can be bypassed.

### OpenAI — Designing AI agents to resist prompt injection

Existing source:

- `article.openai-agent-prompt-injection`

Relevant section:

- "How this informs our defenses in ChatGPT".

The source frames real agent attacks as a combination of an attacker-controlled **source** and a dangerous **sink**, including transmission of sensitive conversation information to third parties.

### OpenTelemetry GenAI semantic conventions — spans

Existing source:

- `docs.otel-genai-spans`

Relevant sections:

- "Capturing instructions, inputs, and outputs";
- "Recording content on attributes".

This keeps observability from becoming a parallel sensitive-data leak.

## Tool-permissions boundary

The competency owns:

- minimum tool surface;
- least functionality;
- least privilege;
- user/service execution context;
- complete mediation;
- resource/audience-bound credentials;
- progressive scope elevation;
- high-impact approval;
- fail-closed execution;
- privileged-action audit evidence;
- negative authorization testing.

It does not replace the later full `security.auth` competency, which can cover broader identity/authentication/authorization architecture.

## Data-exfiltration boundary

The competency owns:

- sensitive-data classification;
- source-to-sink flow mapping;
- authorization before context assembly;
- context minimization;
- credential/secret separation;
- tenant-safe retrieval/cache behavior;
- external sink policy;
- sensitive transmission approval;
- telemetry/cache/replay confidentiality;
- alternate exfiltration channels;
- synthetic/canary attack tests;
- regression feedback.

It does not duplicate prompt injection. Prompt injection is one manipulation source; exfiltration is the confidentiality failure path that remains dangerous even if manipulation cannot be perfectly detected.

## Knowledge Assistant integration

Add:

`projects/knowledge-assistant/security-boundaries/`

Insert three milestones after Production AI synthesis:

1. `tool-permission-boundary`;
2. `data-exfiltration-boundary`;
3. `integrated-security-attack-path`.

The integrated milestone reuses the existing prompt-injection route and proves that untrusted content cannot bypass the permission or sensitive-data boundaries.

## Promotion gate

- [x] existing catalog IDs are reused;
- [x] prerequisite graph has no cycle;
- [x] tool permissions has no coverage-only prerequisite and does not depend on `agents.mcp`, avoiding the existing MCP → prompt-injection dependency path;
- [x] data exfiltration depends only on ready routes after this batch;
- [x] least functionality and least privilege are explicit;
- [x] user/resource-scoped authorization is enforced outside the model;
- [x] complete mediation is required;
- [x] token audience and passthrough failures are tested;
- [x] step-up scope and high-impact approvals are explicit;
- [x] sensitive sources and sinks are mapped separately from attacker-controlled input;
- [x] sensitive data is authorized before entering model context;
- [x] credentials remain outside model-visible context;
- [x] retrieval/cache/telemetry boundaries preserve confidentiality;
- [x] alternate exfiltration channels are tested;
- [x] synthetic/canary protected values replace real secrets in tests;
- [x] integrated prompt-injection attack path is part of the project;
- [x] learner-facing source locators are explicit;
- [x] repository validators must pass before completion.

## Impact

After implementation:

- Security & Governance becomes **10 / 3 ready**;
- repository counts become **115 catalog / 36 ready / 79 coverage**.

The next security work should continue with concrete enforcement boundaries such as sandboxing, authentication/authorization, and multi-tenant isolation before broader guardrails/governance synthesis.
