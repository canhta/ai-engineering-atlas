# Tool Calling

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Anthropic — Tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) | Tool use overview covering tool definitions with name/description/input schema and the client-side execution loop that returns tool results to the model | Establish the model-proposes/application-executes control flow and the structure of a tool contract. |
| [OpenAI — Function Calling](https://help.openai.com/en/articles/8555517-function-calling-in-the-openai-api) | Function Calling overview and Structured Outputs note describing schema-constrained function arguments with strict mode | Show schema-constrained model output while keeping application validation/execution as a separate responsibility. |
| [Writing effective tools for agents — with agents](https://www.anthropic.com/engineering/writing-tools-for-agents) | Sections "Running an evaluation", "Choosing the right tools for agents", "Returning meaningful context from your tools", "Optimizing tool responses for token efficiency", and "Prompt-engineering your tool descriptions" | Connect tool-surface design, descriptions, result shaping, token efficiency, and raw-trace evaluation. |
| [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Sections "Reducing client complexity with idempotent API design" and "Retries and semantic equivalence" | Make timeout/retry behavior safe for mutating operations through explicit idempotency semantics. |
| [Designing AI agents to resist prompt injection](https://openai.com/index/designing-agents-to-resist-prompt-injection/) | Guidance on designing agent/tool boundaries so untrusted model-controlled content cannot directly authorize privileged actions | Reinforce that security policy and approval remain deterministic application controls even when the model chooses or parameterizes tools. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.api-service-design` | [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Sections "Reducing client complexity with idempotent API design" and "Retries and semantic equivalence" | Patch the API contract, error, retry, and idempotency reasoning required for safe tool execution without requiring the full API/service-design curriculum. |
<!-- learning-sources:end -->

## Why this matters

A model can propose a tool call. Your application is still responsible for deciding what is valid, allowed, retryable, and safe to execute.

A useful mental model is:

```text
tool contract
→ model proposes tool + arguments
→ deterministic validation
→ authorization / approval
→ execution
→ result or error
→ model continues
```

The model does not become your authorization system because the arguments match a schema.

## 1. Diagnostic first

Design one tool for the Knowledge Assistant and specify:

- why it exists;
- name/description;
- input schema;
- parameter semantics;
- validation;
- authorization/approval;
- result/error shapes;
- timeout;
- retry policy;
- idempotency if it mutates state;
- how you will evaluate correct and incorrect tool use.

If this is concrete and provider-independent, move to the project.

## 2. API/service prerequisite bridge

`systems.api-service-design` is not ready yet.

Patch the reliability reasoning needed here with AWS Builders' Library, [**Making retries safe with idempotent APIs**](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/):

- **Reducing client complexity with idempotent API design**
- **Retries and semantic equivalence**

You should be able to distinguish validation failures from retryable execution failures and explain how a repeated mutating request avoids duplicate side effects.

## 3. Tool-call mechanism

Use:

- Anthropic [**Tool use**](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) for tool definitions and the client-side execution loop;
- OpenAI [**Function Calling**](https://help.openai.com/en/articles/8555517-function-calling-in-the-openai-api) for schema-constrained arguments and strict structured outputs.

Provider syntax is not the learning objective.

## 4. Designing tools that models can use

Read Anthropic, [**Writing effective tools for agents — with agents**](https://www.anthropic.com/engineering/writing-tools-for-agents), especially:

- **Running an evaluation**
- **Choosing the right tools for agents**
- **Returning meaningful context from your tools**
- **Optimizing tool responses for token efficiency**
- **Prompt-engineering your tool descriptions**

Prefer a small, distinct task-oriented tool surface over mirroring every backend endpoint.

## 5. Deterministic trust boundary

Model-selected tools and arguments are untrusted proposals.

Identity, authorization, approval, and privileged side effects remain application controls.

Use the existing [Prompt Injection and Trust Boundaries](../../10-security-governance/prompt-injection/) route as the deeper security integration point. Tool Calling does not make it a hard prerequisite because that route already references Tool Calling; keeping both as hard prerequisites would create a cycle.

## 6. Independent practice

Use the [Context and Tools evidence contract](../../../projects/knowledge-assistant/context-and-tools/).

Add one justified tool-enabled workflow such as:

- live service status;
- fresh data unavailable in the corpus;
- structured support-ticket creation;
- one controlled write action.

Test:

- should call;
- should not call;
- malformed arguments;
- permission/approval failure;
- timeout/transient error;
- retry;
- duplicate mutation/idempotency where relevant;
- oversized/noisy result;
- adversarial content attempting to cross a privileged boundary.

Preserve traces from model proposal through deterministic execution and final outcome.

## 7. Exit evidence

You are at **demonstrated** when another engineer can inspect the tool contract, replay representative traces, verify policy enforcement, and understand why retries/results behave as designed.

A good final answer with an invisible or unsafe tool trajectory is not sufficient evidence.

## 8. Transfer

Move the same design to a tool with different side effects, permissions, latency, or failure behavior.

## 9. Applied evidence

Applied evidence is a real workflow where tool-use evaluation or operational failure changes the tool surface, validation, policy, retry behavior, result shaping, or the decision to stay deterministic versus become agentic.
