# Changelog

Curriculum changes are tracked separately from routine documentation and repository maintenance.

## Unreleased

### Added

- Learner onboarding in [docs/START_HERE.md](docs/START_HERE.md).
- Broad baseline scan, evidence rubric, and periodic portfolio review.
- Learner progress/profile format and schema.
- Applied AI Engineer reference path.
- Tiny Transformer and Knowledge Assistant reference systems.
- Hands-on Self-Attention and Evaluation Harness labs with starter code, tests, and solutions.
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

### Changed

- Removed the redundant `agents.fundamentals` umbrella coverage node; the concrete Agent routes now carry the capability graph.

- Reworked the repository around a full learner lifecycle instead of topic completion.
- Separated roadmap **coverage** from **ready learning routes**.
- Added learner evidence states: demonstrated, transferred, retained, and applied.
- Added competency types with matching assessment evidence.
- Added precise learning-route and source-role rules.
- Promoted Self-Attention, Product Framing, Model Selection, Context Engineering, Structured Outputs, Tool Calling, Search and Retrieval, Embeddings, Chunking, Reranking, RAG Evaluation, AI Evaluation, Uncertainty Abstention and Trust, Deterministic vs Agentic Design, Agent State, Agent Memory, Planning, Verification, Long-Running Agents, AI Workflow Orchestration, Multi-Agent Systems, and Prompt Injection / Trust Boundaries to ready routes with verified source locators and practice.
- Turned project spines into evolving systems with baselines, metrics, failures, release decisions, and feedback.
- Added canonical prerequisite validation to eliminate orphan/ghost competency IDs.
- Aligned AI-agent and contribution rules with the catalog-first lifecycle.
- CI now validates curriculum/catalog contracts, projects, progress references, source roles/freshness, generated status, schemas, lab reference contracts, and internal links.
- Clarified that coverage status is a maintained scope candidate, not a claim of per-node source normalization or instructional completeness.

## 0.1.0 — 2026-09-22

Initial public repository structure.
