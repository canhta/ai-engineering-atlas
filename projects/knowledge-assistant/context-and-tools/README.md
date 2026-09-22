# Context and Tools Evidence Contract

This directory defines the evidence contract for the Knowledge Assistant context-engineering and tool-calling slice.

Reuse the same product objective, evaluation set, and system lineage from the earlier Knowledge Assistant milestones. Do not restart with a toy assistant.

## Required progression

```text
measured RAG system
→ context inventory
→ context ablation
→ context selection / compaction decision
→ justified tool need
→ tool contract
→ deterministic execution boundary
→ tool-use evaluation
→ deterministic-vs-agentic handoff decision
```

## 1. Context inventory

Start from [context-experiment.template.md](context-experiment.template.md).

Inventory what enters the model call:

- stable/system instructions;
- task/user input;
- few-shot examples if any;
- retrieved data;
- tool definitions;
- tool results;
- message history;
- persisted notes/state.

Record source/version/provenance for each component.

## 2. Context ablation

Compare at least three context configurations on the same evaluation set:

1. minimal high-signal context;
2. broader/noisier context;
3. dynamically selected, trimmed, or compacted context.

Include at least one stale or distracting-context case.

Measure:

- task/eval quality;
- token/context size;
- latency;
- cost when measurable;
- failure slices.

The goal is not to minimize tokens at any cost. The goal is to identify which information improves behavior and which information creates noise or fragility.

## 3. Tool contract

Use [tool-contract.template.md](tool-contract.template.md).

Add one tool only because a measured user/system need cannot be handled cleanly by the existing retrieval-only system.

The contract must define:

- purpose and non-goals;
- name/description;
- input schema and parameter semantics;
- validation rules;
- identity/authorization/approval boundary;
- success result;
- validation error;
- transient error;
- non-retryable error;
- timeout and retry policy;
- idempotency strategy for mutations;
- context-size/result-shaping rules.

## 4. Tool execution evidence

Use [tool-eval.template.md](tool-eval.template.md).

Preserve raw-enough traces to inspect:

```text
user/task
→ tool available
→ tool selected or skipped
→ proposed arguments
→ deterministic validation
→ authorization / approval
→ execution
→ result or error
→ model continuation
→ final task outcome
```

Do not treat a good final answer as proof that tool use was correct.

## 5. Failure work

Test at least:

- malformed arguments;
- ambiguous tool choice;
- unauthorized or unapproved action;
- timeout/transient failure;
- retry behavior;
- duplicate mutating request if the workflow mutates state;
- oversized/noisy tool result;
- prompt-injected or adversarial content attempting to cross a privileged boundary.

## Completion standard

This slice is complete when another engineer can answer:

- which context was deliberately kept, dropped, or loaded just in time and why;
- whether larger context actually helped;
- why the tool exists;
- where model control ends and deterministic application control begins;
- how retries and side effects are made safe;
- whether the workflow should remain deterministic or later justify agentic control.
