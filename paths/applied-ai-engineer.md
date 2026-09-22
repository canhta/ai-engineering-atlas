# Applied AI Engineer Path

This is the first reference path through AI Engineering Atlas.

It is designed for a software engineer who wants to build, evaluate, and operate AI product features.

It is **gap-driven**, not a fixed course sequence.

## Target profile

The learner should eventually be able to:

- frame an AI problem and define a simple baseline;
- choose models and system patterns under quality, latency, and cost constraints;
- build retrieval/RAG systems and evaluate retrieval separately from generation;
- design and evaluate tool/agent workflows;
- operate AI systems with traces, release gates, security boundaries, and feedback loops;
- reason about enough model internals to debug system behavior and make informed trade-offs.

## Phase A — remove blocking software/system gaps

Use the baseline scan for:

- software engineering;
- systems;
- data engineering.

Do not redo fundamentals you can already demonstrate.

Exit when you can reliably reason about:

- APIs and test boundaries;
- async/concurrent work;
- retries, timeouts, idempotency, backpressure;
- storage and data lifecycle;
- observability and debugging.

## Phase B — ML and DL mental models

Target the minimum foundation required to reason about:

- train/validation/test design;
- probability and experimental uncertainty;
- embeddings;
- optimization and training behavior;
- neural network computation.

If you already work comfortably here, use diagnostics and move on.

## Phase C — LLM foundations

Core topics:

- tokenization;
- embeddings;
- attention;
- transformer blocks;
- decoding;
- context windows and KV cache;
- inference cost/latency.

Reference project:

- [Tiny Transformer](../projects/tiny-transformer/)

Use the project to inspect mechanisms, not to become an LLM researcher.

## Phase D — AI application core

Build capability in:

- [problem framing and baselines](../curriculum/07-ai-engineering/product-framing/);
- model selection;
- prompting;
- [context engineering](../curriculum/07-ai-engineering/context-engineering/);
- [structured outputs](../curriculum/07-ai-engineering/structured-outputs/);
- [tool calling](../curriculum/07-ai-engineering/tool-calling/);
- [uncertainty and abstention](../curriculum/07-ai-engineering/uncertainty-abstention-trust/).

The learner should be able to justify why a chosen pattern is simpler or better than an alternative.

For context and tools, preserve the same evaluation lineage from the Knowledge Assistant: first prove what information belongs in context, then add external actions behind deterministic application controls before considering agentic autonomy.

Before increasing autonomy further, make the response contract explicit and measure when the system should answer versus abstain or fall back. Treat schema validity and confidence-like signals as evidence inputs, not as proof of correctness.

## Phase E — retrieval and RAG

Ready retrieval routes:

- [Search and Retrieval](../curriculum/07-ai-engineering/search-retrieval/)
- [Embeddings for AI Applications](../curriculum/07-ai-engineering/embeddings/)
- [Chunking](../curriculum/07-ai-engineering/chunking/)
- [Reranking](../curriculum/07-ai-engineering/reranking/)
- [RAG Evaluation](../curriculum/07-ai-engineering/rag-evaluation/)

Build in roughly this dependency order:

```text
lexical baseline
→ embeddings
→ vector retrieval
→ chunking when corpus/boundary failures justify it
→ hybrid retrieval as needed
→ reranking when candidate ordering is the bottleneck
→ RAG
→ RAG evaluation
→ retrieval lifecycle
```

Reference system:

- [Knowledge Assistant](../projects/knowledge-assistant/)

Do not add architecture components without a measured failure that motivates them.

## Phase F — evaluation as a core engineering skill

Evaluation should appear before heavy agent or production complexity.

Ready route:

- [AI Evaluation and Experimentation](../curriculum/07-ai-engineering/evaluation/)

Exit at L3 when you can:

- version evaluation data;
- evaluate components separately;
- measure stochastic variation;
- analyze failures and slices;
- calibrate subjective evaluation where needed;
- make a release decision from evidence.

## Phase G — agents

Learn:

- deterministic versus agentic control;
- [state](../curriculum/08-agents/state/) and [memory](../curriculum/08-agents/memory/);
- tool schemas and permission boundaries;
- [planning](../curriculum/08-agents/planning/) and [verification](../curriculum/08-agents/verification/);
- retries and [long-running tasks](../curriculum/08-agents/long-running/);
- [workflow orchestration](../curriculum/08-agents/orchestration/);
- [multi-agent systems](../curriculum/08-agents/multi-agent/);
- [MCP](../curriculum/08-agents/mcp/);
- trajectory/tool-use evaluation.

Default rule:

> Start deterministic. Introduce agentic choice only when flexibility creates measurable value.

Before planning or long-running orchestration, make execution state durable enough to survive interruption, then add cross-session memory only for information whose future value can be measured. After that, externalize planning only when adaptive decomposition helps, verify real environment outcomes instead of trusting agent narration, then make long-duration runs bounded and resumable before adding orchestration complexity. Add a multi-agent topology only when independent specialist roles or context windows measurably earn their coordination cost. Add MCP only when a real interoperability requirement justifies a versioned protocol boundary over the existing direct integration.

## Phase H — production and security

Target L3 in:

- model/provider gateway;
- tracing and replay;
- latency/cost;
- versioning;
- eval/release gates;
- graceful degradation;
- security boundaries;
- prompt injection;
- auth around data/tools;
- incident learning.

Use the production milestones in the Knowledge Assistant.

## Phase I — specialize

Select from:

- LLM systems;
- post-training/reasoning;
- AI platform;
- search/retrieval;
- multimodal/voice/document AI;
- developer tools.

Choose from job/project requirements, not completeness anxiety.

## Completion standard

Do not define completion as "all roadmap boxes checked."

A strong Applied AI Engineer portfolio should show:

- several demonstrated/retained core competencies;
- transferred evidence in unfamiliar tasks;
- at least one integrated AI system;
- evaluation artifacts;
- one or more production/failure artifacts;
- explicit design trade-offs;
- evidence that unnecessary complexity was rejected as often as it was added.
