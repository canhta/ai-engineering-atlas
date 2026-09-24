# Changelog

Curriculum changes (routes promoted to ready, labs added, items removed) come from [curriculum/changelog.yaml](curriculum/changelog.yaml), where each has a date and the RFC that decided it; `make check` fails when that record and the catalog disagree. Repository and documentation changes are written by hand below it.

## Curriculum changes

<!-- curriculum-changes:start -->

Generated from [curriculum/changelog.yaml](curriculum/changelog.yaml) by `scripts/render_status.py`. Do not edit by hand.

### Unreleased

#### 2026-09-23

- Promoted to ready under [RFC 0018](rfcs/0018-ai-supply-chain-and-guardrails.md): [Guardrails](curriculum/10-security-governance/guardrails/), [AI Supply Chain and Data Security](curriculum/10-security-governance/supply-chain-data/).
- Promoted to ready under [RFC 0017](rfcs/0017-identity-tenant-isolation-and-sandboxing.md): [Authentication and Authorization](curriculum/10-security-governance/auth/), [Multi-Tenant Isolation](curriculum/10-security-governance/multi-tenant/), [Sandboxing](curriculum/10-security-governance/sandboxing/).

#### 2026-09-22

- Promoted to ready under [RFC 0016](rfcs/0016-tool-permissions-and-data-exfiltration.md): [Tool Permissions](curriculum/10-security-governance/tool-permissions/), [Data Exfiltration](curriculum/10-security-governance/data-exfiltration/).
- Promoted to ready under [RFC 0015](rfcs/0015-production-ai-synthesis.md): [AI Production Architecture](curriculum/09-production-ai/architecture/), [MLOps and LLMOps](curriculum/09-production-ai/mlops-llmops/).
- Promoted to ready under [RFC 0014](rfcs/0014-production-drift-monitoring.md): [Drift Monitoring and Response](curriculum/09-production-ai/drift/).
- Promoted to ready under [RFC 0013](rfcs/0013-ai-caching-and-streaming.md): [AI Caching](curriculum/09-production-ai/caching/), [Streaming](curriculum/09-production-ai/streaming/).
- Promoted to ready under [RFC 0012](rfcs/0012-ai-latency-and-cost-engineering.md): [Cost Engineering](curriculum/09-production-ai/cost/), [Latency Engineering](curriculum/09-production-ai/latency/).
- Promoted to ready under [RFC 0011](rfcs/0011-versioned-ai-releases.md): [Model Prompt and Retrieval Versioning](curriculum/09-production-ai/versioning/), [AI Release Engineering](curriculum/09-production-ai/release-engineering/).
- Promoted to ready under [RFC 0010](rfcs/0010-model-gateway-and-observability.md): [Model Provider and Gateway Architecture](curriculum/09-production-ai/model-gateway/), [AI Observability and Request Replay](curriculum/09-production-ai/observability/).
- Promoted to ready under [RFC 0009](rfcs/0009-model-context-protocol.md): [Model Context Protocol](curriculum/08-agents/mcp/).
- Promoted to ready under [RFC 0008](rfcs/0008-multi-agent-and-agent-catalog-cleanup.md): [Multi-Agent Systems](curriculum/08-agents/multi-agent/).
- Removed from the map under [RFC 0008](rfcs/0008-multi-agent-and-agent-catalog-cleanup.md): `agents.fundamentals`.
- Promoted to ready under [RFC 0007](rfcs/0007-long-running-and-orchestration.md): [Long-Running Agents](curriculum/08-agents/long-running/), [AI Workflow Orchestration](curriculum/08-agents/orchestration/).
- Promoted to ready under [RFC 0006](rfcs/0006-planning-and-verification.md): [Planning](curriculum/08-agents/planning/), [Verification](curriculum/08-agents/verification/).
- Promoted to ready under [RFC 0005](rfcs/0005-agent-state-and-memory.md): [Agent State](curriculum/08-agents/state/), [Agent Memory](curriculum/08-agents/memory/).
- Promoted to ready under [RFC 0004](rfcs/0004-structured-outputs-and-abstention.md): [Structured Outputs](curriculum/07-ai-engineering/structured-outputs/), [Uncertainty Abstention and Trust](curriculum/07-ai-engineering/uncertainty-abstention-trust/).
- Promoted to ready under [RFC 0003](rfcs/0003-context-engineering-and-tool-calling.md): [Context Engineering](curriculum/07-ai-engineering/context-engineering/), [Tool Calling](curriculum/07-ai-engineering/tool-calling/).
- Promoted to ready under [RFC 0002](rfcs/0002-retrieval-quality-slice.md): [Chunking](curriculum/07-ai-engineering/chunking/), [Reranking](curriculum/07-ai-engineering/reranking/), [RAG Evaluation](curriculum/07-ai-engineering/rag-evaluation/).
- Promoted to ready under [RFC 0001](rfcs/0001-applied-ai-foundation-slice.md): [AI Product and Problem Framing](curriculum/07-ai-engineering/product-framing/), [Search and Retrieval](curriculum/07-ai-engineering/search-retrieval/), [Embeddings for AI Applications](curriculum/07-ai-engineering/embeddings/).
- Promoted to ready before the RFC process: [Model Selection](curriculum/07-ai-engineering/model-selection/), [Deterministic vs Agentic Design](curriculum/08-agents/deterministic-vs-agentic/), [Prompt Injection and Trust Boundaries](curriculum/10-security-governance/prompt-injection/). Promoted in one commit with no RFC; no RFC reviews this promotion.
- Lab added: [Prompt Injection Trust-Boundary Lab](labs/prompt-injection-boundaries/).
- Lab added: [Workflow vs Agent Lab](labs/agentic-design/).
- Lab added: [Model Selection Lab](labs/model-selection/).
- Promoted to ready before the RFC process: [AI Evaluation and Experimentation](curriculum/07-ai-engineering/evaluation/). Promoted in its competency.yaml before the catalog existed; no RFC reviews this promotion.
- Promoted to ready before the RFC process: [Self-Attention](curriculum/06-llm-foundations/self-attention/). Promoted in its competency.yaml before the catalog existed; no RFC reviews this promotion.
- Lab added: [Evaluation Harness Lab](labs/evaluation-harness/).
- Lab added: [Self-Attention Lab](labs/self-attention/).

### 0.1.0 — 2026-09-22

No curriculum changes recorded.

<!-- curriculum-changes:end -->

## Repository changes

### Unreleased

#### Added

- Learner onboarding in [docs/START_HERE.md](docs/START_HERE.md).
- Broad baseline scan, evidence rubric, and periodic portfolio review.
- Learner progress/profile format and schema.
- Applied AI Engineer reference path.
- Tiny Transformer and Knowledge Assistant reference systems.
- Canonical [competency catalog](curriculum/catalog.yaml) with stable IDs for audited coverage.
- Generated [curriculum status](curriculum/STATUS.md) with drift checking.
- Catalog, project, progress, competency, and resource schemas.
- Source review policy and review intervals for actively used sources.
- Lifecycle-based competency and lab authoring templates.
- Internal Markdown link validation in CI.
- Generated learner-facing source tables with clickable canonical sources, exact locators, and prerequisite patches.
- Prerequisite-cycle validation for curriculum route dependencies.
- Prerequisite bridges for ready routes whose dependencies are still coverage-only.
- Evidence-provenance and state-history tracking for learner progress.
- Executable JSON Schema validation for catalog, resources, competencies, projects, and progress.
- Reference-solution validation for hands-on labs.
- PR template and curriculum versioning policy.
- Dated curriculum change log ([curriculum/changelog.yaml](curriculum/changelog.yaml), [RFC 0021](rfcs/0021-dated-curriculum-changes.md)): replayed against the catalog by `make check`, rendered into this file and the web atlas's "What changed" page.

#### Changed

- Reworked the repository around a full learner lifecycle instead of topic completion.
- Separated roadmap **coverage** from **ready learning routes**.
- Added learner evidence states: demonstrated, transferred, retained, and applied.
- Added competency types with matching assessment evidence.
- Added precise learning-route and source-role rules.
- Turned project spines into evolving systems with baselines, metrics, failures, release decisions, and feedback.
- Added canonical prerequisite validation to eliminate orphan/ghost competency IDs.
- Aligned AI-agent and contribution rules with the catalog-first lifecycle.
- CI now validates curriculum/catalog contracts, projects, progress references, source roles/freshness, generated status, schemas, lab reference contracts, and internal links.
- Clarified that coverage status is a maintained scope candidate, not a claim of per-node source normalization or instructional completeness.

### 0.1.0 — 2026-09-22

Initial public repository structure.
