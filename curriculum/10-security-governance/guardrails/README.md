# Guardrails

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OWASP LLM05:2025 Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/) | Sections "Common Examples of Vulnerability" and "Prevention and Mitigation Strategies", especially zero-trust treatment of model output, context-aware validation/encoding, parameterized operations, and downstream handling | Anchor guardrails in the concrete rule that model output is untrusted input to downstream systems and must be validated for its actual execution context. |
| [OpenAI Agents SDK — Guardrails](https://openai.github.io/openai-agents-python/guardrails/) | Sections "Workflow boundaries", "Input guardrails", "Execution modes", "Output guardrails", "Tool guardrails", and "Tripwires" | Study a concrete runtime model showing where checks execute, why blocking versus parallel timing matters, and why per-tool guardrails are needed around intermediate side-effect boundaries. |
<!-- learning-sources:end -->

## Why this matters

Guardrails fail when they are placed where the dangerous action has already happened. Their engineering value comes from choosing the correct boundary, timing, exact versus probabilistic mechanism, measurable error trade-off, and safe failure behavior.

## 1. Diagnostic first

Before studying the sources:

- identify which checks belong on initial input, retrieved/tool content, final output, and per-tool execution;
- show why a parallel check may finish after an expensive or side-effecting action starts;
- choose one property that should be deterministic and one that genuinely needs semantic classification;
- define how false positives and false negatives are measured;
- state what happens when the guardrail itself times out or fails.

If the answer is only “scan it” or “add a classifier,” keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
deterministic validator
→ exact property with enforceable rule/schema

probabilistic guardrail
→ semantic judgment with measurable errors

placement
→ the workflow boundary where the check runs

timing
→ before/parallel/after the protected action

trip/block
→ policy response, not proof the classifier is perfect

authorization/sandbox
→ independent deterministic controls that remain necessary
```

A final-output filter cannot undo a tool call that already sent data.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Implement one deterministic and one probabilistic check, evaluate their error behavior, then attack placement/timing and remove one redundant check.

## 4. Failure work

- tool side effect starts before a parallel guardrail trips;
- intermediate handoff/tool bypasses first-input/final-output coverage;
- false positive blocks a legitimate request;
- false negative reaches deterministic containment;
- guardrail dependency times out;
- unsafe model output reaches an interpreter;
- blocked sensitive payload leaks through logs/session state.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the guardrail contract, reproduce placement/timing failures, measure semantic classifier errors, verify fail-open/fail-closed behavior, and show deterministic security controls still contain guardrail misses.

## 6. Transfer

Move the design to a multi-agent enterprise workflow with write-capable tools and different latency, false-positive, regulatory, and irreversible-action costs.

## 7. Applied evidence

Applied evidence is a small set of guardrails with measured value, correct workflow placement, safe failure behavior, and explicit known blind spots.
