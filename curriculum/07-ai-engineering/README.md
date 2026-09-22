# AI Engineering

Techniques for building applications on top of foundation models.

## Scope

- [problem framing and deterministic baselines](product-framing/)
- [model selection](model-selection/)
- prompting and [structured outputs](structured-outputs/)
- [context engineering](context-engineering/)
- [tool calling](tool-calling/)
- [uncertainty, abstention, and trust](uncertainty-abstention-trust/)
- [embeddings](embeddings/) and [search and retrieval](search-retrieval/)
- [chunking](chunking/) and [reranking](reranking/)
- RAG, [RAG evaluation](rag-evaluation/), and retrieval data lifecycle
- [evaluation and experimentation](evaluation/)
- feedback and improvement loops
- fine-tuning and adaptation
- cost, latency, and reliability trade-offs

## Ready routes

- [AI Product and Problem Framing](product-framing/) — define the user problem, baseline, constraints, success criteria, and evidence before choosing AI architecture.
- [Model Selection](model-selection/) — choose from task-specific evidence and constraints rather than model reputation.
- [Context Engineering](context-engineering/) — select and manage high-signal inference context through measured ablations instead of filling the window.
- [Structured Outputs](structured-outputs/) — design typed response contracts, validate semantic invariants, and version them safely.
- [Uncertainty Abstention and Trust](uncertainty-abstention-trust/) — choose answer/abstain/fallback policies from validated signals and explicit risk–coverage evidence.
- [Tool Calling](tool-calling/) — design provider-independent tool contracts with deterministic validation, authorization, retries, idempotency, and trace-based evaluation.
- [Search and Retrieval](search-retrieval/) — build and measure a lexical retrieval baseline before adding semantic complexity.
- [Embeddings for AI Applications](embeddings/) — compare semantic retrieval against the same lexical evidence contract.
- [Chunking](chunking/) — test chunk boundaries as a retrieval/index decision rather than accepting splitter defaults.
- [Reranking](reranking/) — improve candidate ordering only when first-stage recall and the quality/latency trade-off justify it.
- [RAG Evaluation](rag-evaluation/) — separate retrieval, context, generation, and end-to-end evidence instead of relying on one RAG score.
- [AI Evaluation and Experimentation](evaluation/) — build repeatable evidence from evaluation data through release decisions.

See [../STATUS.md](../STATUS.md) for repository-wide maturity.
