# Context Engineering

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Sections "Context engineering vs. prompt engineering", "The anatomy of effective context", "Context retrieval and agentic search", and "Context engineering for long-horizon tasks" | Establish context as the full inference state and introduce high-signal selection, just-in-time retrieval, and compaction under a finite attention budget. |
| [Harness engineering — leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/) | Section "We made repository knowledge the system of record" | Study a production pattern that keeps a small stable map in context while moving deeper knowledge into navigable external sources. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `ai.prompt-engineering` | [AI Engineering](https://github.com/chiphuyen/aie-book) | Chapter 5 "Prompt Engineering" — "Introduction to Prompting" (p. 212), "System Prompt and User Prompt" (p. 215), and "Prompt Engineering Best Practices" (from p. 220) | Patch only the instruction-design skill needed to distinguish prompt wording from broader context selection and management. |
<!-- learning-sources:end -->

## Why this matters

The model does not see your architecture. It sees the context you assemble for each inference.

That context can include:

- instructions;
- task input;
- examples;
- retrieved data;
- tool definitions and results;
- message history;
- persisted state.

The goal is not to fill the context window. The goal is to make the smallest useful set of high-signal information available at the right time.

## 1. Diagnostic first

For the current Knowledge Assistant:

1. inventory every context component that reaches the model;
2. identify stale, noisy, redundant, or conflicting context;
3. propose one ablation;
4. explain which failure would justify just-in-time retrieval or compaction.

Also distinguish context engineering from prompt engineering, retrieval, context-window mechanics, and memory.

## 2. Prompt-engineering prerequisite bridge

`ai.prompt-engineering` is not ready yet.

Patch only what this route needs with Chip Huyen, *AI Engineering*, Chapter 5:

- **Introduction to Prompting** — p. 212;
- **System Prompt and User Prompt** — p. 215;
- **Prompt Engineering Best Practices** — from p. 220.

You should be able to write clear task/system instructions, separate instructions from supplied context, use examples deliberately, and tie prompt changes to observed failures.

## 3. Mental model

Read Anthropic, [**Effective context engineering for AI agents**](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):

- **Context engineering vs. prompt engineering**
- **The anatomy of effective context**
- **Context retrieval and agentic search**
- **Context engineering for long-horizon tasks**

Then read OpenAI, [**Harness engineering**](https://openai.com/index/harness-engineering/), section **We made repository knowledge the system of record**.

Extract the mechanism, not the product architecture: keep a small stable map in context and make deeper knowledge discoverable when needed.

## 4. Independent experiment

Use the [Context and Tools evidence contract](../../../projects/knowledge-assistant/context-and-tools/).

Compare at least:

1. minimal high-signal context;
2. broader/noisier context;
3. dynamically selected or compacted context.

Keep the evaluation set and core system behavior fixed.

Record:

- context inventory and provenance;
- selection/compaction rule;
- approximate token/context size;
- quality;
- latency/cost where measurable;
- failure slices.

## 5. Failure work

Include at least one of each relevant class:

- stale context;
- distracting context;
- conflicting instructions/data;
- long history;
- missing critical constraint;
- compaction that drops an unresolved decision.

Do not respond by adding more context automatically. Diagnose first.

## 6. Exit evidence

You are at **demonstrated** when another engineer can reproduce the comparison and understand why information is kept, excluded, loaded just in time, or compacted.

A bigger context window is not evidence of better context engineering.

## 7. Transfer

Apply the same method to a system with a different source mix or time horizon.

## 8. Applied evidence

Applied evidence is a real context-policy change that improves measured behavior, reduces noise/cost without harming behavior, or prevents a regression caused by stale/conflicting context.
