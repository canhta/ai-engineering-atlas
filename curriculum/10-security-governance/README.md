# Security & Governance

Security and governance concerns specific to AI systems, in addition to standard application security.

## Ready routes

- [Authentication and Authorization](auth/) — validate identity and session boundaries, then enforce deny-by-default resource authorization independently of model output.
- [Multi-Tenant Isolation](multi-tenant/) — propagate trusted tenant context through shared retrieval, caches, state, tools, background work, and operations.
- [Tool Permissions](tool-permissions/) — minimize agent functionality and privilege, enforce user/resource authorization outside the model, and bound high-impact actions with explicit scope and approval.
- [Prompt Injection and Trust Boundaries](prompt-injection/) — threat-model direct/indirect injection and enforce privileged boundaries outside the model.
- [Data Exfiltration](data-exfiltration/) — classify sensitive data, map source-to-sink flows, authorize before context construction, and constrain outbound destinations even when the model is manipulated.
- [Sandboxing](sandboxing/) — contain untrusted execution with explicit filesystem, network, privilege, resource, lifetime, and cleanup boundaries.

## Scope

- authentication, sessions, and resource authorization
- tenant context and cross-tenant isolation
- prompt injection and untrusted content
- authorization around tools and retrieved data
- excessive agency and action approvals
- sensitive-data flow and exfiltration sinks
- sandboxed code and process execution
- model, data, and dependency provenance
- poisoning and supply-chain risks
- privacy, retention, and deletion
- auditability and policy enforcement
- model and dataset licensing

These topics extend normal application security; they do not replace it.

See [../STATUS.md](../STATUS.md) for repository-wide maturity.
