# RFC: Titled Project Milestones

- Status: Accepted (owner approval, 2026-09-24)
- Author: Canh Ta
- Created: 2026-09-24
- Extends: [content model RFC](0000-content-model.md)

Number note: renumbered on merge; 0020 is structured learning paths and 0021 dated curriculum changes.

## Summary

Replace the bare milestone ID list in `projects/*/project.yaml` with milestone entries that each carry a title, a short statement of what the milestone asks, the catalog competencies it integrates, the evidence it produces, and the evidence package directory it uses. Project-level `competencies` and `evidence` become the union of the milestone fields instead of separate lists.

No catalog node is added, removed, or promoted. No competency outcome, prerequisite, or target depth changes. Every title and ask is taken from existing project README text; where that text does not supply a field, this RFC flags the gap for the owner instead of filling it.

## Problem

A milestone today is a slug. `projects/knowledge-assistant/project.yaml`:

```yaml
milestones:
  - product-frame
  - lexical-baseline
  - vector-retrieval
  - chunking-quality
  # … 40 entries in total
competencies:
  - ai.product-framing
  - ai.model-selection
  - retrieval.search
  # … 40 entries, not tied to any milestone
evidence:
  - product-brief
  - baseline-results
  - versioned-eval-set
  # … 88 entries, not tied to any milestone
```

`schemas/project.schema.json` allows nothing more:

```json
"milestones": { "type": "array", "minItems": 1, "items": { "type": "string" } }
```

`curriculum/presentation.yaml` renders the list as it is:

```yaml
- { id: milestones, field: milestones, type: list, ordered: true, title: { en: Milestones, vi: Các mốc } }
```

So the web atlas project page shows 40 ordered slugs (`product-frame`, `lexical-baseline`, …) in reading type, then 88 evidence slugs, with no link from any milestone to the competency it integrates or the evidence it produces. `site/TODO.md` records this as open: "Project pages: milestones render as raw IDs … the project needs titled milestones from the content model before its page can read like a route."

The information the page needs already exists, but only as README prose. `projects/knowledge-assistant/README.md` has one section per milestone (`## Milestone 0 — lexical baseline`, …) with the route it uses, the ask, and an evidence list. Nothing connects those sections to the YAML IDs except their order, and the numbers in the headings are the only way other files refer to them.

## Evidence

### Numbered references already drift

- `curriculum/08-agents/deterministic-vs-agentic/README.md` → "6. Applied evidence": "Use this decision in the Knowledge Assistant Milestone 6 or another real system." Milestone 6 is **data lifecycle**. The deterministic-versus-agentic decision is Milestone 8, **tool use or agent workflow** ("Start with a deterministic workflow. Introduce agentic control only when flexibility is needed and measurable."). Nothing checks a numbered reference, so a wrong number stays wrong until a reader notices.
- `.github/PULL_REQUEST_TEMPLATE.md` → "Project impact" asks: "which reference project and milestone provide integration evidence?" There is no stable, checked way to name one.

### Competencies and evidence are not tied to milestones

- The Knowledge Assistant declares 40 competencies and 88 evidence IDs at project level. `scripts/validate_repo.py` checks that each competency exists in the catalog and that each ready route targeting `applied` appears in some project on a matching spine. It cannot say where in the project that competency is applied.
- Two project competencies have no milestone that names their route: `ai.model-selection` and `agents.deterministic-vs-agentic` (see F7 in [Open questions for the owner](#open-questions-for-the-owner)). Both target `applied`, so the only integration evidence the validator accepts is a project-level list entry.
- Evidence IDs exist only in `project.yaml`: no README, template, or script refers to `baseline-results`, `decision-records`, `security-tests`, or most others by ID.

### The contribution guide already defines a milestone's parts

`CONTRIBUTING.md` → "Project contributions": "A milestone should identify: problem/constraint; baseline or previous state; change being introduced; measurement; failure work; resulting evidence or decision." The README sections carry these as prose. This RFC gives the ask and the evidence a field each, so the page and the validator can use them.

### Learning model

`docs/LEARNING_MODEL.md` §11: "A small lab proves a local skill. A project exposes interactions, constraints, and trade-offs between skills." A project page that lists slugs does not show which skills a milestone brings together. Route pages already show a route's parts with titles and links; the project page is the one surface where the learner sees integration, and it shows the least.

### Reference system: Made With ML

Made With ML's MLOps course is organised as titled sections of titled lessons (Design: Setup, Product, Systems; Data: Preparation, Exploration, Preprocessing, Distributed; Model: Training, Tracking, Tuning, Evaluation, Serving; … Production: Jobs & Services, CI/CD workflows, Monitoring, Data engineering) under the headline "Learn how to combine machine learning with software engineering to design, develop, deploy and iterate on production ML applications" ([madewithml.com](https://madewithml.com/), checked 2026-09-24). Its product design lesson sets the one application the course works on: "a service that discovers and categorizes ML content from popular sources" ([Product design](https://madewithml.com/courses/mlops/product-design/), checked 2026-09-24).

The mechanism taken from it: each stage of the evolving system is a named step the learner can navigate to, not an identifier. The atlas keeps its own shape (one project, milestones, evidence packages); it does not copy Made With ML's sections.

### How milestone-based projects present milestones

[.scratch/research/changelog-and-milestones.md](../.scratch/research/changelog-and-milestones.md) (2026-09-24, section "RFC 0022") compares seven milestone-based projects: [Made With ML](https://github.com/GokuMohandas/Made-With-ML), The Odin Project ([Rock Paper Scissors](https://www.theodinproject.com/lessons/foundations-rock-paper-scissors)), Full Stack Open ([part 1](https://fullstackopen.com/en/part1/java_script), [general info](https://fullstackopen.com/en/part0/general_info)), CS50x ([Mario](https://cs50.harvard.edu/x/2024/psets/1/mario/more/)), Microsoft [ML-For-Beginners](https://github.com/microsoft/ML-For-Beginners/blob/main/2-Regression/README.md), Microsoft [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners/blob/main/06-text-generation-apps/README.md), and Boot.dev ([BookBot](https://www.boot.dev/courses/build-bookbot-python)). Findings this RFC applies:

- **A title and a short ask per step** is the common shape: Boot.dev's one-line chapter descriptions, CS50's "Problem to Solve", Microsoft's assignment "Instructions" (high confidence).
- **Evidence per unit.** Microsoft attaches a rubric to each assignment and CS50 a `check50` slug to each problem. Full Stack Open instead assesses the final state of one evolving app (medium-high confidence).
- **Number by position, reference by a stable slug.** Microsoft's ordered lists, Boot.dev's chapters, and CS50's weeks number by position in navigation; CS50 `check50` slugs, Made With ML URLs, and Microsoft folder paths are what other things refer to. Full Stack Open is the exception (it references exercises as `1.3`) and belongs to a course re-edited as a whole, which is the drift found above (high confidence).
- **No reference keeps generic project-level evidence** next to per-unit evidence: evidence belongs to an assignment, a problem slug, or a part submission (medium confidence).
- **No reference has a structured per-step skills field.** `integrates` is stricter than outside practice; it is justified by this repository's catalog-first rule and applied-integration check, and nothing in the survey argues for relaxing it (medium confidence).
- **No reference names one artifact under two units.** Full Stack Open accepts one final artifact as satisfying several steps (medium-low confidence for any rule on shared evidence).

The research does not answer the content gaps (F1–F7, F9): they are decisions about this project's text and the catalog.

## Proposal

### Milestone shape

Each entry in `milestones` becomes an object:

```yaml
milestones:
  - id: lexical-baseline # required; unchanged stable ID
    title: Lexical baseline # required; equals the README section title
    ask: >- # required; one or two sentences from the README section
      Build the simplest useful retrieval baseline. A keyword or lexical
      search is preferred over starting with RAG.
    integrates: [retrieval.search] # required; catalog IDs, may be empty only with a flag (below)
    evidence: [versioned-eval-set, baseline-results] # required, at least one
    package: foundation/ # optional; evidence package directory inside the project
```

| Field        | Required | Rule                                                                                                                                                                                                                                                                |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | yes      | `^[a-z0-9]+(-[a-z0-9]+)*$`, unique in the project. Existing IDs are kept as they are, so any reference to them survives.                                                                                                                                            |
| `title`      | yes      | Sentence case, no number prefix. Must equal a `## ` heading in the project README (see Validation).                                                                                                                                                                 |
| `ask`        | yes      | At most 300 characters. Taken from the milestone's README section (its lead instruction or its **Decision** line), cut but not reworded beyond grammar. It states what the learner does, not why the topic matters.                                                 |
| `integrates` | yes      | Catalog competency IDs, each checked against `curriculum/catalog.yaml` (catalog-first rule). A route the README section links with "Use the [X] route" is listed here; nothing else is added without an RFC. An empty list is allowed only while flagged.           |
| `evidence`   | yes      | Evidence IDs, at least one. An ID may appear in more than one milestone when two milestones share one record (for example one controlled optimization for latency and cost); the site marks every occurrence after the first "shared with <first milestone title>". |
| `package`    | no       | A directory inside the project that contains a `README.md` evidence contract (`foundation/`, `retrieval-quality/`, …). Several milestones may share a package.                                                                                                      |

The shape (title, ask, integrates, evidence) is kept as first drafted. Title and ask match the common shape in the survey above; per-milestone evidence matches Microsoft's per-assignment rubrics and CS50's per-problem slugs; `integrates` has no outside precedent and stays because of the catalog-first rule.

`title` and `ask` are English strings, as all curriculum text is today; the content model's `L10n` fallback (`{ en }`, rendered with `lang="en"` and the untranslated marker) applies until a reviewed Vietnamese translation following [docs/VIETNAMESE_STYLE.md](../docs/VIETNAMESE_STYLE.md) exists.

### Project-level lists become derived

To keep one version of each fact, `project.yaml` drops its top-level `competencies` and `evidence`:

- project competencies = the union of `milestones[].integrates`;
- project evidence = the union of `milestones[].evidence`.

`scripts/validate_repo.py`'s applied-integration check reads the union. A competency is part of a project only because some milestone integrates it, and every evidence ID belongs to at least one milestone.

### Schema sketch

`schemas/project.schema.json`:

```json
{
  "required": ["id", "title", "spines", "purpose", "milestones"],
  "properties": {
    "id": { "type": "string", "pattern": "^project\\.[a-z0-9.-]+$" },
    "title": { "type": "string", "minLength": 1 },
    "spines": { "…": "unchanged" },
    "purpose": { "type": "string", "minLength": 1 },
    "milestones": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["id", "title", "ask", "integrates", "evidence"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
          "title": { "type": "string", "minLength": 1 },
          "ask": { "type": "string", "minLength": 1, "maxLength": 300 },
          "integrates": { "type": "array", "uniqueItems": true, "items": { "type": "string" } },
          "evidence": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" }
          },
          "package": { "type": "string", "pattern": "^[a-z0-9-]+/$" }
        }
      }
    }
  },
  "additionalProperties": false
}
```

### README sections

The README keeps the milestone prose; only the heading changes, from `## Milestone 3 — hybrid retrieval and reranking` to `## Hybrid retrieval and reranking`. Numbers are dropped because they are what drifted. Other files link to a milestone by its heading anchor (`../../../projects/knowledge-assistant/#hybrid-retrieval-and-reranking`) or, on the site, by its ID. A position number appears in one place only: the project page's contents rail, where it is computed from order and never stored or referenced. This is the "number by position, reference by a stable slug" pattern from the survey.

The Knowledge Assistant's unnumbered "Product frame" section already fits this form. Its `###` subsections (User, Pain, …) stay as they are.

## Validation

In `scripts/validate_repo.py` (and so `make check`):

1. `project.yaml` validates against the schema above.
2. Milestone IDs are unique within a project.
3. Every `integrates` ID exists in the catalog.
4. Every `package` directory exists inside the project and contains `README.md`.
5. The project README has one `## <title>` heading per milestone, in the same order as `milestones`, and no other `##` heading between the first and last milestone heading. Extra sections before or after (the Knowledge Assistant's "What completion looks like", Tiny Transformer's "Purpose" and "Completion evidence") are allowed.
6. The applied-integration check uses the union of `integrates` on a matching spine, as today.
7. A flagged milestone (empty `integrates`) is reported as a warning listing the milestone, so the gap stays visible in `make check` output until an RFC resolves it. It is not an error, because resolving it is a curriculum decision.

`scripts/build_site_data.py --check` keeps failing on any `integrates` reference that does not resolve, as it does for every relation.

## Migration

Two projects, 48 milestones. Titles come from the README `##` headings with the number removed and the first letter capitalised. Asks come from the quoted sentence of that section. "Package" is the evidence contract the README section or the project intro names. "Evidence" pairs existing `project.yaml` IDs with the section's evidence list or its package's templates by name; no evidence ID is created.

Where the table shows **flag**, the existing reviewed text does not supply the field, and the owner must decide it in review ([Open questions for the owner](#open-questions-for-the-owner)). The draft does not fill those fields. The `(F8)` marks point to [Decisions taken from the research](#decisions-taken-from-the-research).

### Knowledge Assistant (`projects/knowledge-assistant/`)

| ID                                      | Title (README heading)                    | Ask taken from                                                                                                                                    | Integrates (README route link)              | Evidence (existing IDs)                                                                                                                                | Package                      |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `product-frame`                         | Product frame                             | "complete the AI Product and Problem Framing route and write a one-page product brief"                                                            | `ai.product-framing`                        | `product-brief`                                                                                                                                        | `foundation/`                |
| `lexical-baseline`                      | Lexical baseline                          | "build the simplest useful retrieval baseline. A keyword or lexical search is preferred over starting with RAG."                                  | `retrieval.search`                          | `versioned-eval-set`, `baseline-results`                                                                                                               | `foundation/`                |
| `vector-retrieval`                      | Embeddings and vector retrieval           | "add embedding-based retrieval. Do not remove the lexical baseline. Compare them on the same query set."                                          | `ai.embeddings`                             | **flag** (F4)                                                                                                                                          | `foundation/`                |
| `chunking-quality`                      | Chunking quality                          | **Decision** line: "choose a strategy for this corpus, not a universal chunk size" (see F9)                                                       | `retrieval.chunking`                        | `chunking-comparison`                                                                                                                                  | `retrieval-quality/`         |
| `hybrid-and-reranking`                  | Hybrid retrieval and reranking            | "Add hybrid retrieval or reranking only when the prior failure analysis supports it."                                                             | `retrieval.reranking`                       | `reranking-comparison`                                                                                                                                 | `retrieval-quality/`         |
| `rag`                                   | Answer generation / RAG                   | "Only after retrieval is measurable, add answer generation. Require source attribution."                                                          | **flag** (F1)                               | **flag** (F1)                                                                                                                                          | none named                   |
| `rag-evaluation`                        | RAG evaluation                            | "Do not report one undifferentiated RAG score. Separate retrieval, supplied context, generation, and end-to-end evidence."                        | `retrieval.rag-evaluation`, `ai.evaluation` | `rag-evaluation-record`                                                                                                                                | `retrieval-quality/`         |
| `data-lifecycle`                        | Data lifecycle                            | **flag** (F2)                                                                                                                                     | **flag** (F2)                               | **flag** (F2)                                                                                                                                          | none named                   |
| `context-policy`                        | Context engineering                       | "Inventory what actually reaches the model and compare context policies before adding new autonomy."                                              | `ai.context-engineering`                    | `context-experiment`                                                                                                                                   | `context-and-tools/`         |
| `tool-or-agent-workflow`                | Tool use or agent workflow                | "First identify a task the retrieval-only system cannot handle cleanly. Start with a deterministic workflow."                                     | `ai.tool-calling` (see F7)                  | `tool-contract`, `tool-use-evaluation`                                                                                                                 | `context-and-tools/`         |
| `structured-response`                   | Structured response contract              | "Introduce a versioned response contract because a real downstream consumer needs one"                                                            | `ai.structured-outputs`                     | `response-schema-record`                                                                                                                               | `output-and-trust/`          |
| `abstention-policy`                     | Abstention and trust policy               | **Decision** line: "record the chosen answer/abstain/fallback policy and what evidence would change it"                                           | `ai.uncertainty-abstention-trust`           | `abstention-experiment`                                                                                                                                | `output-and-trust/`          |
| `stateful-workflow`                     | Durable execution state                   | "Take one already-justified multi-step or interruptible workflow and make its execution state explicit."                                          | `agents.state`                              | `state-recovery-record`                                                                                                                                | `state-and-memory/`          |
| `long-term-memory`                      | Cross-session memory                      | "Add memory only for a measured cross-session need."                                                                                              | `agents.memory`                             | `memory-evaluation-record`                                                                                                                             | `state-and-memory/`          |
| `adaptive-planning`                     | Adaptive planning                         | "Only add explicit planning for a task whose structure depends on intermediate results."                                                          | `agents.planning`                           | `planning-experiment`                                                                                                                                  | `planning-and-verification/` |
| `verification-loop`                     | Verification loop                         | "Define success criteria before execution and verify real outcomes rather than trusting agent narration."                                         | `agents.verification`                       | `verification-experiment`                                                                                                                              | `planning-and-verification/` |
| `long-running-runtime`                  | Long-running runtime                      | "Introduce a real or simulated wait/process boundary instead of keeping one worker alive."                                                        | `agents.long-running`                       | `long-running-experiment`                                                                                                                              | `runtime-and-orchestration/` |
| `orchestrated-flow`                     | Orchestration                             | "Keep a simpler single-flow baseline." and the first experiment line, "identify a real routing, parallelism, or dynamic-subtask problem"          | `agents.orchestration`                      | `orchestration-experiment`                                                                                                                             | `runtime-and-orchestration/` |
| `multi-agent-decision`                  | Multi-agent decision                      | "Start from the same single-agent orchestration baseline and identify a measured limitation that independent roles or context windows may solve." | `agents.multi-agent`                        | `agent-contract`, `multi-agent-experiment`, `multi-agent-decision`                                                                                     | `multi-agent/`               |
| `mcp-interoperability`                  | MCP interoperability                      | "Add MCP only when the Knowledge Assistant has a real interoperability need … Preserve the direct/internal integration as the baseline."          | `agents.mcp`                                | `mcp-boundary`, `mcp-test-matrix`, `mcp-conformance-record`                                                                                            | `mcp/`                       |
| `model-gateway-boundary`                | Model gateway boundary                    | "Preserve the direct-provider path. Add a gateway only when … solves a measured problem."                                                         | `production.model-gateway`                  | `gateway-decision-record`, `gateway-contract`, `gateway-failure-matrix`, `production-overhead-record` (F8)                                             | `production-boundary/`       |
| `observability-and-replay`              | Observability and diagnostic replay       | "Instrument the request path so a production failure can be explained without treating logs as a transcript dump."                                | `production.observability`                  | `telemetry-contract`, `telemetry-privacy-test`, `diagnostic-replay-record`, `production-overhead-record` (F8)                                          | `production-boundary/`       |
| `latency-engineering`                   | Latency engineering                       | "Measure the existing Knowledge Assistant path before optimizing it."                                                                             | `production.latency`                        | `latency-objective`, `latency-baseline`, `critical-path-record`, `performance-economics-experiment`, `rejected-optimization-record` (F8)               | `performance-economics/`     |
| `cost-engineering`                      | Cost engineering                          | "Optimize the cost of useful behavior rather than raw provider spend."                                                                            | `production.cost`                           | `unit-economics-record`, `performance-economics-experiment`, `rejected-optimization-record` (F8)                                                       | `performance-economics/`     |
| `caching-engineering`                   | Caching engineering                       | "Add only one cache whose reuse pattern and stale-data tolerance are justified by the measured latency/cost problem."                             | `production.caching`                        | `cache-decision-record`, `cache-measurement-record`, `cache-failure-matrix`                                                                            | `delivery-mechanisms/`       |
| `streaming-delivery`                    | Streaming delivery                        | "Stream only the path where earlier partial output provides real user value."                                                                     | `production.streaming`                      | `stream-event-contract`, `stream-cancellation-record`, `stream-failure-matrix`                                                                         | `delivery-mechanisms/`       |
| `versioned-release-candidate`           | Versioned release candidate               | "Treat the deployed Knowledge Assistant as a set of behavior-defining artifacts, not one application image."                                      | `production.versioning`                     | `release-manifest`, `release-manifest-diff`, `alias-resolution-test`                                                                                   | `release-lifecycle/`         |
| `progressive-release-and-rollback`      | Progressive release and rollback          | "Release a concrete candidate manifest, not a moving alias."                                                                                      | `production.release-engineering`            | `evaluation-gate-record`, `release-plan`, `live-analysis-record`, `rollback-record`, `rollback-verification`, `release-decision`                       | `release-lifecycle/`         |
| `drift-monitoring`                      | Drift monitoring                          | "Monitor the released Knowledge Assistant for meaningful change without treating every distribution shift as a quality incident."                 | `production.drift`                          | `drift-contract`, `drift-window-record`, `drift-threshold-backtest`, `segmented-drift-record`, `drift-investigation-record`, `drift-response-playbook` | `drift-monitoring/`          |
| `architecture-synthesis`                | Architecture synthesis                    | "Review the whole Knowledge Assistant as one production system."                                                                                  | `production.architecture`                   | `architecture-driver-record`, `production-topology`, `architecture-failure-matrix`, `architecture-decision-set`                                        | `production-synthesis/`      |
| `operating-lifecycle-synthesis`         | Operating lifecycle synthesis             | "Map the full operating loop around the selected architecture."                                                                                   | `production.mlops-llmops`                   | `operating-lifecycle-map`, `automation-boundary-record`, `production-readiness-review`                                                                 | `production-synthesis/`      |
| `authentication-authorization-boundary` | Authentication and authorization boundary | "Build identity and resource authorization before relying on agent-level controls."                                                               | `security.auth`                             | `authentication-boundary-contract`, `token-session-validation-record`                                                                                  | `security-boundaries/`       |
| `multi-tenant-isolation`                | Multi-tenant isolation                    | "Run the Knowledge Assistant with at least two synthetic tenants."                                                                                | `security.multi-tenant`                     | `tenant-context-contract`, `tenant-isolation-matrix`                                                                                                   | `security-boundaries/`       |
| `tool-permission-boundary`              | Tool permission boundary                  | "Reduce the tool surface before testing prompt injection."                                                                                        | `security.tool-permissions`                 | `tool-capability-inventory`, `tool-permission-matrix`, `approval-policy`                                                                               | `security-boundaries/`       |
| `data-exfiltration-boundary`            | Data exfiltration boundary                | "Map protected data before testing how an attacker might move it."                                                                                | `security.data-exfiltration`                | `sensitive-data-flow-map`, `exfiltration-sink-policy`                                                                                                  | `security-boundaries/`       |
| `sandboxed-execution`                   | Sandboxed execution                       | "Add one intentionally untrusted execution task only after its runtime boundary is explicit."                                                     | `security.sandboxing`                       | `sandbox-contract`, `sandbox-failure-matrix`                                                                                                           | `security-boundaries/`       |
| `supply-chain-and-data-integrity`       | Supply-chain and data integrity           | "Inventory every external artifact that can change production behavior and prove how it is admitted."                                             | `security.supply-chain-data`                | `ai-supply-chain-inventory`, `artifact-admission-record`, `poisoning-test-record`                                                                      | `security-boundaries/`       |
| `guardrail-engineering`                 | Guardrail engineering                     | "Place checks on the boundary where a violation can still be prevented."                                                                          | `security.guardrails`                       | `guardrail-contract`, `guardrail-evaluation`, `guardrail-failure-matrix`                                                                               | `security-boundaries/`       |
| `integrated-security-attack-path`       | Integrated security attack path           | "Inject adversarial retrieved or tool content and treat model output as compromised."                                                             | `security.prompt-injection` (see F5)        | `security-boundary-failure-matrix`, `security-tests` (see F5)                                                                                          | `security-boundaries/`       |
| `incident-and-feedback`                 | Incident and feedback loop                | "Inject or analyze one failure" and the "Produce:" list (detection evidence … follow-up metric or alert)                                          | **flag** (F3)                               | `incident-analysis`, `regression-tests`                                                                                                                | none named                   |

The security package's stages 1–8 map one to one onto the eight security milestones (`security-boundaries/README.md` → "Stage 1 — authenticate and authorize" … "Stage 8 — attack the combined path").

### Tiny Transformer (`projects/tiny-transformer/`)

| ID                         | Title (README heading)   | Ask taken from                                                                                        | Integrates           | Evidence (existing IDs)                                | Package |
| -------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------ | ------- |
| `experiment-contract`      | Experiment contract      | "Before writing model code, record:" and its list (corpus and license … metrics to record)            | **flag** (F6)        | **flag** (F6)                                          | none    |
| `training-mechanics`       | Training mechanics       | "Build or inspect enough numerical machinery to explain one training step"                            | **flag** (F6)        | `explanation`, `failure-analysis`                      | none    |
| `tokenizer-and-embeddings` | Tokenizer and embeddings | "Implement or configure a simple tokenizer and embedding lookup."                                     | **flag** (F6)        | `experiment-results`, `explanation`                    | none    |
| `self-attention`           | Self-attention           | "Implement simplified causal self-attention."                                                         | `llm.self-attention` | `code`, `tests`, `visualization`, `experiment-results` | none    |
| `transformer-block`        | Transformer block        | "Compose: attention; residual connections; normalization; feed-forward network." and its failure work | **flag** (F6)        | `code`, `failure-analysis`                             | none    |
| `language-model-training`  | Language-model training  | "Train the small model enough to verify the pipeline."                                                | **flag** (F6)        | `experiment-results`                                   | none    |
| `decoding`                 | Decoding                 | "At minimum compare deterministic decoding with one stochastic strategy."                             | **flag** (F6)        | `explanation`                                          | none    |
| `inference-behavior`       | Inference behavior       | "Measure the system rather than stopping at generation."                                              | **flag** (F6)        | `experiment-results`                                   | none    |

Tiny Transformer's evidence IDs are generic (`code`, `tests`, `visualization`, `experiment-results`, `failure-analysis`, `explanation`); the pairing above follows each section's **Evidence**, **Required artifacts**, or **Failure work** wording and should be confirmed in review.

### Decisions taken from the research

These apply recommendations of [.scratch/research/changelog-and-milestones.md](../.scratch/research/changelog-and-milestones.md) (see [How milestone-based projects present milestones](#how-milestone-based-projects-present-milestones)). The owner can still reverse them in review.

- **F8 Shared evidence: allowed, with a note.** `performance-economics-experiment` and `rejected-optimization-record` come from the package's single "Stage 3 — one controlled optimization", which serves both latency and cost; `production-overhead-record` fits both gateway ("latency and operational-overhead comparison") and observability ("telemetry overhead"). They stay listed under both milestones, because splitting them would misstate the package. The site renders every occurrence after the first as "shared with <first milestone title>", so learners and reviewers do not count one record twice. Research confidence is medium-low (no reference names one artifact under two units; Full Stack Open accepts one final artifact for several steps), so assigning each record to one milestone remains an acceptable owner override.
- **Unplaced evidence: removed.** `experiment-results`, `decision-records`, and `traces` in the Knowledge Assistant name no single milestone and are dropped from its `project.yaml`: each milestone already names its specific record, and no surveyed project keeps generic project-level evidence next to per-unit evidence (medium confidence). If the owner wants one of them as a project-wide artifact (for example a trace store several milestones use), it is attached to the first milestone that produces it, not kept in a project-level list, which the derived union rules out. F4 may reuse one of them for `vector-retrieval`; it then belongs to that milestone under the same rule.

### Milestone order contradicts the contract prerequisites

The Knowledge Assistant's README order places milestones before the milestones that integrate their routes' prerequisites. Checked 2026-09-24 against the prerequisites in each integrated route's `competency.yaml`, using the `integrates` column above and the current heading numbers:

| Milestone (current number)                               | Integrates                                  | Prerequisite                 | Integrated at                                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| MCP interoperability (18)                                | `agents.mcp`                                | `security.prompt-injection`  | integrated security attack path (37); its own prerequisites `security.auth` (30) and `security.tool-permissions` (32) are also later |
| Multi-tenant isolation (31)                              | `security.multi-tenant`                     | `security.data-exfiltration` | data exfiltration boundary (33)                                                                                                      |
| Data exfiltration boundary (33)                          | `security.data-exfiltration`                | `security.prompt-injection`  | integrated security attack path (37)                                                                                                 |
| Guardrail engineering (36)                               | `security.guardrails`                       | `security.prompt-injection`  | integrated security attack path (37)                                                                                                 |
| Chunking quality (2), hybrid retrieval and reranking (3) | `retrieval.chunking`, `retrieval.reranking` | `ai.evaluation`              | RAG evaluation (5); the README's "Evaluation contract" in the product frame comes earlier but integrates no route in this draft      |

The first row is the one [.scratch/research/paths-ordering.md](../.scratch/research/paths-ordering.md) (Q2) names: MCP (18) comes before authentication (30) and tool permissions (32), which the contracts require before prompt injection and so before MCP. [RFC 0020](0020-structured-learning-paths.md) orders the path `security.auth` → `security.tool-permissions` → `security.prompt-injection` → … → `agents.mcp`; the project should not teach the opposite order. The other rows come from running the same check over every milestone.

This is an issue the migration must fix, not a decision this draft makes, because reordering milestones changes the project's reviewed text and its security package's stage order (`security-boundaries/README.md` stages 1–8 follow the milestones). Options for the owner:

- move MCP interoperability after the security milestones, or move authentication, tool permissions, and a prompt-injection milestone before MCP (the order RFC 0020 uses for the path);
- within the security block, order the milestones by their routes' prerequisites (auth, tool permissions, prompt injection, data exfiltration, multi-tenant, sandboxing, supply chain, guardrails), keeping the integrated attack path last as an integration milestone that reuses `security.prompt-injection`;
- for the evaluation row, either list `ai.evaluation` on an earlier milestone (the evaluation contract is used from the lexical baseline on) or accept that a project milestone may integrate a route whose prerequisite the learner meets outside the project;
- optionally add a validation rule: walking milestones in order, each integrated ready route's prerequisites are integrated earlier in the project or named in an exception with a reason, like RFC 0020's rule 3.

### Open questions for the owner

The existing reviewed text does not supply these fields. The milestone research states that comparable projects cannot answer them ("they are curriculum decisions about this project's text and the catalog"), so none has a research-backed answer. Where the path research ([.scratch/research/paths-ordering.md](../.scratch/research/paths-ordering.md)) bears on one, its suggestion is given so the owner can accept it in one line; otherwise the options are the draft's own.

- **F1 `rag`.** The section links no route. The catalog has no node for basic grounded answer generation; `retrieval.advanced-rag` (coverage) is a different scope. No evidence ID names the RAG artifact. Options: integrate `retrieval.rag-evaluation` here as well (the section's three-way evaluation split is that route's subject), add a catalog node through its own RFC, or merge this milestone into `rag-evaluation`.
  - _Related research (paths-ordering Q5):_ every compared roadmap has a basic RAG step before agents, and no catalog ID matches it; the suggestion is to log a catalog gap ("basic grounded answer generation with attribution") for a separate catalog RFC and not to map it to `retrieval.advanced-rag`. Until then, leave `integrates: []` with the warning.
- **F2 `data-lifecycle`.** The section opens "Make the corpus change.", which does not state an ask on its own (it reads as a truncated "make the corpus changeable"); the usable text is the "Support at least: add; update; delete; freshness verification" list and the failure exercise. It links no route. `retrieval.data-lifecycle` exists as a coverage node but is not linked from the README or listed in `project.yaml`, so adding it is a curriculum decision. No evidence ID names the freshness or stale-index diagnosis record. `deterministic-vs-agentic/README.md` points here by mistake (see Evidence).
  - _Research:_ none. RFC 0020 keeps `retrieval.data-lifecycle` on the path for "retrieval lifecycle", which is consistent with linking it here, but that is the owner's call.
- **F3 `incident-and-feedback`.** The section links no route and the catalog has no incident-response node (`data.feedback-loops` is coverage and not linked). The ask and evidence can be taken from the text; `integrates` cannot.
  - _Related research (paths-ordering Q8, medium confidence):_ "incident learning" maps to `production.mlops-llmops` ("Preserve lineage between ... production traces, incidents, and regression cases"; "One drift/incident signal reaches a continue, inspect, improve, or rollback decision ..."), with `production.observability` ("An incident is diagnosed from traces and metrics ...") for diagnosis; `data.feedback-loops` optionally as a coverage link for the feedback half.
- **F4 `vector-retrieval`.** `foundation/README.md` requires an "Embedding retrieval record" and a "Decision record" (template `decision-record.template.md`), but `project.yaml` has no ID for the first, and only the generic `experiment-results` and `decision-records` for either.
  - _Research:_ none. Under the unplaced-evidence decision above, reusing `experiment-results` or `decision-records` here makes this their first producing milestone; a new specific ID is the alternative.
- **F5 `integrated-security-attack-path`.** The section reuses prompt injection "together with the other ready security routes" without naming them. Listing only `security.prompt-injection` follows the link; listing all eight security competencies follows the sentence. `security-audit-record` could belong here or to `authentication-authorization-boundary` (whose route owns "security audit behavior", RFC 0017); the text does not say.
  - _Related research (paths-ordering Q7, medium confidence):_ OWASP LLM02, LLM08, and LLM03/LLM04 map onto `security.data-exfiltration`, `security.multi-tenant`, and `security.supply-chain-data`, the "other ready security routes" the sentence means. The research does not decide whether this milestone lists them; each already has its own milestone.
- **F6 Tiny Transformer.** Only Milestone 3 links a route (`llm.self-attention`). Coverage nodes that match the other milestones by name exist (`dl.backpropagation`, `llm.tokenization`, `llm.embeddings`, `llm.transformer`, `llm.training`, `llm.decoding-sampling`, `llm.inference`), but the README does not link them and `project.yaml` does not list them. Linking them states that these milestones integrate those capabilities, which is a curriculum claim; the draft leaves `integrates: []` with the warning until the owner decides. `experiment-contract`'s artifact ("short experiment note") has no evidence ID.
  - _Research:_ none.
- **F7 Project competencies with no milestone.** `ai.model-selection` (targets `applied`; its README says "Use the process for a real decision in the Knowledge Assistant" without naming a milestone) and `agents.deterministic-vs-agentic` (targets `applied`; its content matches `tool-or-agent-workflow`, but that section links only Tool Calling). Under the derived union, both would leave the project unless a milestone integrates them, and the applied check would then fail. Proposed resolution for the second: add it to `tool-or-agent-workflow` and fix the stale "Milestone 6" link. The first has no obvious home in the text (answer generation and the model gateway are candidates); the owner decides.
  - _Research:_ none. Note that `production.model-gateway` declares `ai.model-selection` as a prerequisite, which fits the model gateway boundary milestone as a candidate.
- **F9 `chunking-quality`.** Its lead sentence refers to "the Round 1 failure analysis", a term defined nowhere in the project. The draft takes the ask from the **Decision** line instead; the README sentence should be fixed separately.
  - _Research:_ none.

Migration does not merge until F1–F7 and F9 have an owner decision recorded in this RFC and the milestone order issue above is fixed or explicitly accepted.

## What the site renders

At a high level; the layout belongs to a site spec under `site/DESIGN.md`, like the other surfaces.

- `curriculum/presentation.yaml` replaces the project's `milestones` `list` block with a `milestones` block, and the `member` relation reads `milestones[].integrates` instead of `competencies`:

  ```yaml
  projects:
    relations:
      - { type: member, field: "milestones[].integrates", direction: out }
    blocks:
      - { id: purpose, field: purpose, type: text, title: { en: Purpose, vi: Mục đích } }
      - id: milestones
        field: milestones
        type: milestones
        item: { id: id, title: title, ask: ask, refs: integrates, evidence: evidence, path: package }
        title: { en: Milestones, vi: Các mốc }
  ```

- The content model gains one block type: `milestones` with `items: [{ id, title: L10n, ask: L10n, refs: ref[], evidence: string[], path? }]`. `schemas/site-data.schema.json` and `rfcs/0000-content-model.md`'s block table change in the same PR. The project-level `evidence` block goes; evidence now sits with its milestone.
- The project page reads like a route page: the contents rail lists the milestones by title, numbered by position (the only place a milestone number appears); each milestone section shows its title, the ask, an "Integrates" line set like the prerequisite line (route titles with the learner's state glyphs after hydration, mapped competencies unlinked), its evidence (a record already listed under an earlier milestone carries "shared with <that milestone's title>"), and a link to the package README. Each section has the anchor `#<id>`.
- Collection index: `passageOf()` for a project keeps using `purpose`; the "brings together" column is unchanged, since it reads the `member` relation.
- Evidence IDs still render as identifiers. Titling them is the same problem at a smaller scale and is out of scope; the page can set them as artifact names in the mono face until then.

## Implementation notes (2026-09-24)

The owner accepted this RFC on 2026-09-24. The migration shipped with the open questions still open, and every one of them stays visible in `make check` output as a warning until it is decided:

- **Kept flagged, not filled.** F1 (`rag`: `integrates` and `evidence` empty), F2 (`data-lifecycle`: no `ask`, `integrates`, or `evidence`), F3 (`incident-and-feedback`: `integrates` empty), F4 (`vector-retrieval`: `evidence` empty), F5 (`integrated-security-attack-path` integrates only the linked `security.prompt-injection`), F6 (Tiny Transformer: `integrates` empty on every milestone but `self-attention`; `experiment-contract` has no evidence), F9 (the chunking ask comes from the **Decision** line; the "Round 1" sentence is unchanged). The milestone order issue is not fixed: the Knowledge Assistant keeps its README order.
- **Schema, to keep a gap visible instead of filled.** `ask` is optional and `evidence` may be empty in `schemas/project.schema.json`; `scripts/validate_repo.py` warns on a missing `ask`, an empty `integrates`, or an empty `evidence`, as Validation 7 does for `integrates`.
- **F7.** `agents.deterministic-vs-agentic` joins `tool-or-agent-workflow` and the stale "Milestone 6" link now points at `#tool-use-or-agent-workflow`, as proposed above. `ai.model-selection` has no milestone yet, so under the derived union it has left the Knowledge Assistant. The applied-integration check reports it as a warning rather than an error, because its README already names the Knowledge Assistant: a ready route targeting `applied` whose README names a project on a matching spine, while no milestone of that project integrates it, is an owner question. A route that names no such project still fails.
- **Evidence left out by the derived union.** `experiment-results`, `decision-records`, and `traces` (the unplaced-evidence decision) and `security-audit-record` (F5: the text does not say which milestone produces it) are no longer in the Knowledge Assistant. Attaching `security-audit-record` to a milestone is part of deciding F5.

## Alternatives considered

### Derive titles and asks from README headings at build time

Rejected. It keeps one copy, but the build would parse prose ("the first sentence after the route link") and `integrates` would still need a structured home. A heading-equality check (Validation 5) gives the same single source of truth for the title with a stable parse.

### Generate the README milestone headings from `project.yaml`

Rejected for now. The README sections carry long reviewed prose that does not belong in YAML. Generating only headings between markers, as `render_learning_sources.py` does for sources, splits one section across two files. The equality check is simpler.

### Keep project-level `competencies` and `evidence` beside milestone fields

Rejected. Two lists describing the same membership would need a consistency check and would drift, against "one version of everything". The union carries the same information.

### Move each milestone into its package directory (`package/milestone.yaml`)

Rejected. Packages and milestones are not one to one: `security-boundaries/` serves eight milestones, and `rag`, `data-lifecycle`, `incident-and-feedback`, and all Tiny Transformer milestones have no package. Milestone order is also a project-level fact.

### Render the README on the project page and stop

Rejected. The page would show text, but not which competencies each milestone integrates or the learner's state on them, and references would still depend on heading numbers.

### Fill the flagged fields from the matching coverage nodes

Rejected. Linking `llm.tokenization` to a Tiny Transformer milestone, or `retrieval.data-lifecycle` to data lifecycle, states an integration the reviewed text does not make. That is the owner's decision, through this RFC's review or a later one.

## Impact

- affected competencies: none change. Project membership becomes per milestone; F7 decides whether `ai.model-selection` and `agents.deterministic-vs-agentic` stay integrated in the Knowledge Assistant.
- resource changes: none.
- schema: `schemas/project.schema.json` (milestone objects; top-level `competencies` and `evidence` removed); `schemas/site-data.schema.json` (`milestones` block).
- scripts: `scripts/validate_repo.py` (Validation 1–7); `scripts/build_site_data.py` (the `milestones` block type).
- content: both `project.yaml` files rewritten; 47 README headings lose their number (the Knowledge Assistant's "Product frame" already has none); `curriculum/08-agents/deterministic-vs-agentic/README.md`'s "Milestone 6" becomes a link to `#tool-use-or-agent-workflow`; `projects/README.md` unchanged; the Knowledge Assistant's milestone order and its security package's stage order change as the owner decides under [Milestone order contradicts the contract prerequisites](#milestone-order-contradicts-the-contract-prerequisites); the generic `experiment-results`, `decision-records`, and `traces` IDs leave the Knowledge Assistant unless attached to a producing milestone.
- site: one renderer component for the `milestones` block, the project page rail, and a test rendering it from a fixture; `site/TODO.md`'s "Project pages: milestones render as raw IDs" item closes in that PR.
- generated data: `site/src/data/atlas.json` regenerated.
- follow-up it enables: competency routes and the PR template can name a milestone by ID (`project:knowledge-assistant#lexical-baseline`) instead of a number or a package path.

## Review checklist

- [ ] Evidence is traceable: every title and ask quotes an existing README section; every evidence ID already exists in `project.yaml`.
- [x] Outside practice is cited to [.scratch/research/changelog-and-milestones.md](../.scratch/research/changelog-and-milestones.md) and its sources; the milestone shape, rail-only numbering, shared evidence, and unplaced evidence follow it.
- [ ] No competency is added, removed, or linked beyond what the README route links state; flagged fields are left for the owner.
- [ ] Every `integrates` ID is taken from `curriculum/catalog.yaml`.
- [x] F8 (shared evidence) and unplaced evidence are decided from cited research.
- [ ] F1–F7 and F9 have a recorded owner decision before migration.
- [ ] The milestone order issue (MCP before authentication and tool permissions, and the other rows) is fixed or explicitly accepted before migration.
- [ ] Milestone IDs are unchanged, so existing references survive.
- [ ] One version: project-level lists are derived, not duplicated; README headings are checked against titles.
- [ ] The applied-integration check still passes for every ready route targeting `applied`.
- [ ] Vietnamese strings for the new block title and any new site keys follow `docs/VIETNAMESE_STYLE.md` and are listed for owner review.
- [ ] `make check` and `make site-check` pass after implementation.
