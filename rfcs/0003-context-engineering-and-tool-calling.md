# RFC: Context Engineering and Tool Calling Slice

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Problem

The Applied AI path now covers product framing, retrieval quality, and evaluation. The next step should not jump directly to agents.

Two existing catalog nodes are still `coverage`:

- `ai.context-engineering`
- `ai.tool-calling`

Both are easy to teach badly:

- context engineering can collapse into "write a longer prompt" or "stuff more retrieved text into the window";
- tool calling can collapse into one provider SDK demo while skipping validation, permissions, retries, idempotency, tool-result design, and evaluation.

This RFC proposes capability boundaries that remain useful across model providers and agent frameworks.

## Evidence

### Context engineering

#### Anthropic — Effective context engineering for AI agents

https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

Verified sections include:

- **Context engineering vs. prompt engineering**
- **Why context engineering is important to building capable agents**
- **The anatomy of effective context**
- **Context retrieval and agentic search**
- **Context engineering for long-horizon tasks**

The source defines context engineering as curating and maintaining the information available to the model at inference time, including system instructions, tools, external data, examples, message history, and dynamically retrieved state. Its guiding principle is to use the smallest high-signal context that supports the desired behavior.

The source also distinguishes:

- up-front context from just-in-time retrieval;
- static instructions from dynamically retrieved information;
- long context from useful context;
- current context from persistence mechanisms such as notes/memory;
- full history retention from compaction.

#### OpenAI — Harness engineering: leveraging Codex in an agent-first world

https://openai.com/index/harness-engineering/

This production case reinforces context as a scarce resource. The useful design pattern is "give the agent a map, not a giant instruction manual": repository knowledge remains external and navigable while the runtime context stays focused on the task.

This is supporting production evidence, not a requirement to copy Codex architecture.

### Tool calling

#### OpenAI — Function Calling

https://help.openai.com/en/articles/8555517-function-calling-in-the-openai-api

Verified behavior includes:

- tools connect models to external systems;
- tool arguments are defined with a schema;
- strict structured outputs can constrain generated arguments to the supported schema;
- schema-valid output still does not replace application execution, authorization, or operational error handling.

The curriculum should extract the interface contract, not teach a specific Responses API call.

#### Anthropic — Tool use

https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview

Verified flow:

```text
tool definition
→ model emits tool request
→ application executes tool
→ application returns tool result/error
→ model continues
```

Tool definitions include a name, description, and input schema. Client-side tool execution remains application code.

#### Anthropic — Writing effective tools for agents — with agents

https://www.anthropic.com/engineering/writing-tools-for-agents

Verified sections include:

- **What is a tool?**
- **Running an evaluation**
- **Choosing the right tools for agents**
- **Namespacing your tools**
- **Returning meaningful context from your tools**
- **Optimizing tool responses for token efficiency**
- **Prompt-engineering your tool descriptions**

The useful engineering principles are:

- expose a small set of distinct, high-value tools rather than mirroring every backend endpoint;
- evaluate tool use on realistic tasks;
- inspect raw tool-call traces and errors;
- return high-signal, token-efficient results;
- make input semantics explicit and enforceable;
- treat tool descriptions/specifications as part of model context.

#### AWS Builders' Library — Making retries safe with idempotent APIs

https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/

Verified sections include:

- **Reducing client complexity with idempotent API design**
- **Retries and semantic equivalence**

This supports the non-LLM systems requirement that retries on mutating operations need explicit idempotency semantics. Tool calling should not teach "retry on failure" without considering duplicate side effects.

#### Existing ready security route

`security.prompt-injection` already establishes the trust-boundary rule that model output is not authorization. The proposed tool-calling competency should build on that route rather than duplicate its security curriculum.

## Proposal

Create a two-competency **Context + Tool Boundary Slice** in the Knowledge Assistant before any new agentic control is introduced.

```text
measured RAG system
→ context inventory
→ context budget + selection policy
→ ablation / failure experiments
→ tool contract
→ deterministic execution boundary
→ tool-use evaluation
→ only then decide whether agentic control is justified
```

## 1. `ai.context-engineering`

**Proposed level:** L3

**Competency types:**

- engineering skill
- design judgment

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.evaluation`
- `ai.prompt-engineering`

`ai.prompt-engineering` is currently coverage-only, so a ready context-engineering route would require a prerequisite bridge rather than pretending the full prompt-engineering route is ready.

The bridge should only patch the minimum needed capability:

- clear task/system instructions;
- separation of instructions from supplied context;
- use of a few representative examples when justified;
- prompt changes evaluated against explicit failures rather than intuition.

A suitable bridge source is Chip Huyen, *AI Engineering*, Chapter 5 **Introduction to Prompting** and **Prompt Engineering Best Practices**.

### Boundary with adjacent competencies

`ai.context-engineering` should **not** absorb:

- `ai.prompt-engineering` — wording/instruction design is one input to context, not the entire context system;
- `retrieval.search` / RAG competencies — retrieval produces candidate information; context engineering decides what actually enters the model call and in what form;
- `llm.context-windows` — context-window mechanics/capacity are foundation knowledge; this competency is system design under that constraint;
- `agents.memory` — memory is persistence across time/sessions; context engineering decides what persistent state is loaded into the current inference;
- `ai.tool-calling` — tool definitions/results are context components, but execution contracts belong to the tool-calling competency.

### Observable outcomes

The learner should be able to:

- inventory the context presented to a model call: stable instructions, task input, examples, retrieved data, tool definitions/results, message history, and persisted state;
- identify which context is necessary, redundant, stale, conflicting, or too low-signal;
- define a context budget and selection policy from product/evaluation requirements rather than maximum context-window size;
- compare up-front retrieval with just-in-time or progressive context loading;
- design compaction/summarization/trimming while preserving critical goals, constraints, decisions, and unresolved state;
- measure quality, latency, token/cost, and failure behavior under context ablations;
- record context provenance/version so regressions can be reproduced.

### Required evidence

A Knowledge Assistant experiment should compare at least three context configurations on the same evaluation set, for example:

1. minimal high-signal context;
2. broad / noisy context;
3. dynamically selected or compacted context.

The learner must record:

- exact context components and versions;
- token/context size;
- retrieval/context-selection policy;
- quality metrics;
- latency/cost where measurable;
- failure slices;
- at least one distractor/stale-context test;
- a decision explaining what context is deliberately excluded.

A larger context that performs worse is a valid and useful outcome.

## 2. `ai.tool-calling`

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

- `ai.evaluation`
- `security.prompt-injection`
- `systems.api-service-design`

`systems.api-service-design` is coverage-only, so the ready route would need a targeted prerequisite bridge.

The bridge should cover only:

- request/response contract clarity;
- validation errors versus transient execution errors;
- timeout/retry behavior;
- idempotency for mutating operations.

The AWS Builders' Library idempotency article is proposed for the retry/idempotency portion of this bridge.

### Boundary with adjacent competencies

`ai.tool-calling` should **not** become:

- a tutorial for OpenAI, Anthropic, LangChain, MCP, or any single framework;
- `ai.structured-outputs` — tool argument schemas are one constrained-output use case, but general structured generation is broader;
- `security.tool-permissions` — this competency must respect application authorization boundaries, while deep permission architecture remains a security competency;
- `agents.deterministic-vs-agentic` — a deterministic workflow can use tools without being an agent.

### Observable outcomes

The learner should be able to:

- design a small, distinct tool surface from a user/workflow need instead of exposing every backend endpoint;
- define clear tool names, descriptions, schemas, parameter semantics, and result/error contracts;
- validate model-generated tool arguments before execution;
- keep identity, authorization, approval, and side-effect policy in deterministic application code;
- handle tool success, validation errors, transient failures, timeouts, retries, and non-retryable failures;
- make mutating retries safe through idempotency semantics where required;
- return concise, task-relevant tool results rather than dumping backend payloads into model context;
- record and evaluate tool selection, arguments, results, errors, latency, retries, and final task outcome;
- distinguish failures caused by tool selection, malformed arguments, execution, permissions, or post-tool reasoning.

### Required evidence

The Knowledge Assistant should gain one justified tool-enabled workflow, for example:

- fetch live service status;
- retrieve fresh information unavailable in the indexed corpus;
- create a structured support ticket;
- perform one controlled write action.

The learner must provide:

- tool contract/schema;
- deterministic validation;
- authorization/approval boundary;
- idempotency strategy for any mutating tool;
- success and error result format;
- trace showing tool call → execution → result → final response;
- adversarial or malformed-argument tests;
- timeout/retry test;
- tool-use evaluation on realistic tasks;
- failure taxonomy;
- decision on whether the workflow should remain deterministic or motivates later agentic control.

## Knowledge Assistant integration

If approved, add a new evidence package such as:

`projects/knowledge-assistant/context-and-tools/`

It should extend the same product/evaluation lineage from earlier slices rather than introduce a fresh toy dataset.

Proposed artifacts:

- context inventory;
- context-ablation experiment;
- context decision record;
- tool contract;
- tool execution trace;
- error/retry/idempotency tests;
- tool-use evaluation;
- deterministic-vs-agentic handoff decision.

The project package should be evidence scaffolding only. Filling a template is not evidence of competence.

## Promotion gate

Neither node should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact locators are rechecked during route authoring;
4. coverage-only prerequisites have targeted bridges;
5. competency YAML + learner README are complete;
6. Knowledge Assistant evidence integration is inspectable;
7. tool-calling practice includes deterministic security/side-effect controls;
8. seeded-state validation passes;
9. final `make check` / CI passes;
10. the accepted review decision is recorded before promotion.

## Alternatives considered

### Merge context engineering into prompt engineering

Rejected because current model behavior depends on much more than instruction wording: retrieved data, tool definitions/results, history, persistent state, and context selection/compaction all affect inference.

### Treat retrieval/RAG as context engineering

Rejected because retrieval quality and runtime context selection are related but distinct failure surfaces.

### Teach tool calling through one provider SDK

Rejected because provider syntax changes while the engineering contract—schema, validation, execution, permissions, error handling, idempotency, and evaluation—remains.

### Require an agent before learning tools

Rejected. Tool use is useful in deterministic workflows, and the repository already establishes "start deterministic" as the default architecture rule.

### Make `security.tool-permissions` a prerequisite now

Not proposed as a hard prerequisite because the existing ready `security.prompt-injection` route already provides the minimum trust-boundary principle required for this slice. Deep permission architecture should remain independently promotable later.

## Impact

- affected competencies:
  - `ai.context-engineering`
  - `ai.tool-calling`
- prerequisite relationships proposed:
  - `ai.context-engineering` ← `ai.evaluation`, `ai.prompt-engineering`
  - `ai.tool-calling` ← `ai.evaluation`, `security.prompt-injection`, `systems.api-service-design`
- new/updated resources:
  - `article.anthropic-context-engineering`
  - `article.openai-harness-engineering`
  - `docs.openai-function-calling`
  - `docs.anthropic-tool-use`
  - `article.anthropic-writing-tools`
  - `article.openai-agent-prompt-injection`
  - `article.aws-idempotent-apis`
- proposed project integration:
  - Knowledge Assistant context/tool evidence package
- catalog/generated status:
  - **no change until RFC approval and completed route validation**

## Review checklist

- [ ] Evidence is traceable and source locators are specific enough to author routes.
- [ ] Context engineering is distinct from prompt engineering, retrieval, context-window mechanics, and memory.
- [ ] Tool calling is distinct from structured outputs, permission architecture, and agentic control.
- [ ] Proposed L3 depth is appropriate for an Applied AI Engineer.
- [ ] Context-engineering prerequisites are justified.
- [ ] Tool-calling prerequisites and API-design bridge are justified.
- [ ] Context evidence includes ablation/failure work rather than token-count optimization alone.
- [ ] Tool evidence includes validation, errors, retries, idempotency, and deterministic authorization.
- [ ] Tool-result design considers context quality/token efficiency.
- [ ] Evaluation covers raw tool traces, not final-answer quality alone.
- [ ] Knowledge Assistant integration extends the existing evidence lineage.
- [ ] Reviewer explicitly approves or requests changes before any promotion.
