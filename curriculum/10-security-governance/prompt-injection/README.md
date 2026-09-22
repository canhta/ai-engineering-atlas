# Prompt Injection and Trust Boundaries

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Sections: "Types of Prompt Injection Vulnerabilities", "Prevention and Mitigation Strategies", and "Example Attack Scenarios" | Establish direct/indirect injection risks, impact, least-privilege controls, human approval, external-content segregation, and adversarial testing. |
| [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 5 "Defensive Prompt Engineering" — Jailbreaking and Prompt Injection, and Defenses Against Prompt Attacks | Connect prompt attacks to application-level defensive design in foundation-model systems. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `security.auth` | [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Prevention and Mitigation Strategies, especially privilege control and human approval for high-risk operations. | Patch the identity-versus-model boundary needed to understand deterministic authorization. |
| `security.tool-permissions` | [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Prevention and Mitigation Strategies, especially least privilege and privilege control. | Patch the tool-permission model needed for the trust-boundary lab. |
| `ai.tool-calling` | [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Building block: The augmented LLM; Appendix 2: Prompt engineering your tools. | Patch the model/tool interaction needed to reason about compromised tool requests. |
<!-- learning-sources:end -->

## Why this matters

A model can be influenced by user input or by external content it reads.

Security therefore cannot depend on the model reliably following a privileged instruction hierarchy. The application must contain the damage even when the model proposes the wrong action.

## 1. Diagnostic first

Before studying, answer:

1. What is the difference between direct and indirect prompt injection?
2. Why does adding RAG not remove prompt-injection risk?
3. Where should authorization be enforced if the model can call a privileged tool?
4. How would you test the system under a simulated compromised model output?

## Prerequisite check

Patch only what is missing:

- **Authentication/authorization boundary** — in the OWASP mitigation section, focus on privilege control and least privilege. You should understand that authenticated identity and authorization policy come from application/security state, not model text.
- **Tool permissions** — be able to assign a read-only versus privileged tool to explicit permissions and name the enforcement point.
- **Tool calling** — use Anthropic's **augmented LLM** and **Prompt engineering your tools** sections in [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) if model-proposed tool calls versus application execution are unclear.

The lab deliberately reinforces these prerequisites, so a full security course is not required before starting.
## 2. Mental model

Primary security source:

- OWASP Gen AI Security Project — [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

Focus on:

- **Types of Prompt Injection Vulnerabilities**;
- **Prevention and Mitigation Strategies**;
- **Example Attack Scenarios**.

In particular, connect the risk to application controls such as least privilege, human approval for high-risk actions, separating external content, and adversarial testing.

Companion:

- Chip Huyen, *AI Engineering* — Chapter 5 **Defensive Prompt Engineering**, especially **Jailbreaking and Prompt Injection** and **Defenses Against Prompt Attacks**.

## 3. Independent practice

Complete the [Prompt Injection Trust-Boundary Lab](../../../labs/prompt-injection-boundaries/).

The lab assumes the model may emit a malicious privileged tool request. Your authorization layer must still reject it for an unauthorized user.

This is deliberately different from building a prompt detector.

## 4. Exit evidence

You are at **demonstrated** when you can:

- distinguish direct and indirect injection;
- draw trust boundaries for external content and tools;
- enforce authorization outside the model;
- apply least privilege / approval to high-risk actions;
- test the boundary under simulated adversarial input;
- explain why prompt-only defense is insufficient.

## 5. Transfer

Threat-model an email assistant that can read messages and send replies.

Identify:

- untrusted message content;
- privileged actions;
- identity/authorization checks;
- approval points;
- adversarial tests.

## 6. Applied evidence

Apply the controls to the [Knowledge Assistant](../../../projects/knowledge-assistant/) security milestone or another real system.

The strongest evidence is a durable adversarial/regression test that continues to pass when prompts/models change.
