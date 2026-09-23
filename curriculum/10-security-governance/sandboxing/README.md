# Sandboxing

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Anthropic — Making Claude Code more secure and autonomous with sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) | Sections "Sandboxing: a safer and more autonomous approach" and the discussion of filesystem isolation and network isolation | Ground an AI-agent-specific sandbox in two complementary boundaries: which files code can access and which network destinations it can reach, especially under prompt injection. |
| [gVisor — Security Model](https://gvisor.dev/docs/architecture_guide/security/) | Sections "Threats: The Anatomy of an Exploit", "Goals: Limiting Exposure", "What can a sandbox do?", and "Principles: Defense-in-Depth" | Build a deeper isolation mental model around host attack surface, syscall mediation, defense in depth, resource/network controls, and the limits of sandboxing. |
| [Kubernetes — Configure a Security Context for a Pod or Container](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) | SecurityContext controls including `runAsNonRoot`, `allowPrivilegeEscalation`, Linux capabilities, `readOnlyRootFilesystem`, and `seccompProfile` | Translate sandbox intent into concrete process/container hardening controls that reduce privilege and host exposure. |
<!-- learning-sources:end -->

## Why this matters

Once an AI system executes code or shell commands, the runtime itself becomes a security boundary. Authorization decides whether the tool may run; the sandbox determines what the process can touch after it runs.

## 1. Diagnostic first

Before studying the sources:

- list host, tenant, credential, and network assets that untrusted code must not reach;
- explain why a root container with broad mounts is not a sandbox;
- design deny-by-default egress with a small allowlist;
- define CPU/memory/PID/storage/time limits;
- compare native container, application-kernel sandbox, and VM-style isolation.

If the answer relies on model text, UI visibility, or one happy-path test as the security boundary, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
tool permission
→ may execution start?

filesystem boundary
→ what data can the process read/write?

network boundary
→ where can the process communicate?

runtime privilege
→ what host/kernel capabilities can it exercise?

resource boundary
→ how much CPU/memory/process/storage/time can it consume?

lifetime boundary
→ what state survives and who can see it later?
```

Sandboxing reduces blast radius; it does not replace secure architecture, authorization, or output validation.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Add one intentionally untrusted execution path, then try to escape, exfiltrate, escalate, exhaust resources, persist state, and feed malicious output back into the application.

## 4. Failure work

- path traversal/symlink/mount escape;
- forbidden outbound network;
- cloud metadata/credential discovery;
- privilege escalation or extra capability;
- fork/memory/disk/time exhaustion;
- cross-run or cross-tenant persistence;
- malicious stdout/file re-entry.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the sandbox contract, reproduce filesystem/network/privilege/resource failures, verify cleanup, and justify the selected isolation strength and overhead.

## 6. Transfer

Move the sandbox to a browser automation or data-analysis agent with different persistence, GPU, filesystem, and network needs.

## 7. Applied evidence

Applied evidence is an execution boundary that measurably contains untrusted code without silently exposing host, tenant, credential, network, or resource authority.
