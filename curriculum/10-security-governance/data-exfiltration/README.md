# Data Exfiltration

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OWASP LLM02:2025 Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) | Sections "Common Examples of Vulnerability" and "Prevention and Mitigation Strategies", especially sanitization, access controls, restricted data sources, tokenization/redaction, and the warning that prompt restrictions can be bypassed | Establish the sensitive-information classes and application controls that must exist outside model instructions. |
| [Designing AI agents to resist prompt injection](https://openai.com/index/designing-agents-to-resist-prompt-injection/) | Section "How this informs our defenses in ChatGPT", especially source-sink analysis and safeguards around transmitting potentially sensitive information to third parties | Model exfiltration as an attacker-controlled source plus a dangerous sink, then constrain or confirm the transmission even when manipulation succeeds. |
| [MCP Security Best Practices — 2026-07-28](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx) | Section "Token Passthrough", especially accountability/audit, trust-boundary, privilege, and data-exfiltration risks | Show why reusable credentials and broad upstream tokens are themselves sensitive cross-boundary data and why proxy boundaries must not leak them. |
| [OpenTelemetry GenAI semantic conventions — spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md) | Sections "Capturing instructions, inputs, and outputs" and "Recording content on attributes" | Apply the same confidentiality policy to observability so tracing does not become a second exfiltration channel. |
<!-- learning-sources:end -->

## Why this matters

Prompt injection is only one way to influence an AI system. Confidentiality requires controlling the entire flow of protected data: what can be read, what enters context, what is stored or logged, and which output/tool/network sinks are allowed to receive it.

## 1. Diagnostic first

Before studying the sources:

- classify the protected data in one Knowledge Assistant request;
- draw every source, transformation, store, model-context step, and sink;
- identify where authorization must happen before context assembly;
- name an exfiltration sink other than plain assistant text;
- explain why a model instruction such as “never reveal secrets” is only defense-in-depth.

If the design depends on the model deciding its own permission or confidentiality policy, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
attacker-controlled source
→ content that can manipulate behavior

sensitive source
→ protected data the system may be able to access

sink
→ destination that can disclose or transmit data

source-to-sink policy
→ deterministic rule about which protected flow is allowed

model refusal
→ useful defense-in-depth, not the confidentiality boundary
```

The safest secret is often the one that never enters model context.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Map and constrain one complete Knowledge Assistant sensitive-data path, then simulate an indirect-injection exfiltration attempt using synthetic protected values.

## 4. Failure work

- unauthorized protected retrieval;
- cross-tenant cache reuse;
- credential or token entering model context;
- unapproved external URL/tool sink;
- hidden destination in markdown, structured data, or tool arguments;
- sensitive content in traces/replay artifacts;
- partial streamed disclosure before final validation.

## 5. Exit evidence

You are at **demonstrated** when another engineer can follow the sensitive-data flow, reproduce the synthetic exfiltration attacks, and see application policy prevent protected data from reaching unauthorized context, caches, telemetry, or external sinks even if model behavior is compromised.

## 6. Transfer

Redesign the data-flow policy for a system with different protected sources, tenants, external destinations, retention rules, and user approvals.

## 7. Applied evidence

Applied evidence is a production confidentiality boundary whose allowed sensitive flows are explicit, whose forbidden flows are technically impossible or blocked, and whose attack regressions remain durable.
