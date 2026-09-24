# RFC: Structured Learning Paths

- Status: Draft
- Author: Canh Ta
- Created: 2026-09-24

## Problem

A path is a role-oriented view over the competency graph ([paths/README.md](../paths/README.md)). The only path, [paths/applied-ai-engineer.md](../paths/applied-ai-engineer.md), is prose: nine phases (A to I) that name topics in free text, link some ready routes by folder, and never use a catalog ID.

That has three consequences:

- **Nothing checks it.** A path can name a topic with no catalog competency, drop a ready route, or order a route before its prerequisites, and `make check` still passes. The current path orders several routes before their prerequisites (see [Ordering against the catalog](#ordering-against-the-catalog)).
- **The site cannot use it.** The content model loads the path as a title and a repository link, with no blocks and no relations ([curriculum/presentation.yaml](../curriculum/presentation.yaml), `collections.paths`). Two web atlas items wait on this RFC in [site/TODO.md](../site/TODO.md): "Path as a screen" (an ordered sequence of routes with the learner's state against each) and "Path filter" on the Atlas.
- **It drifts from the curriculum.** RFCs 0013 to 0018 promoted twelve production and security routes. The Knowledge Assistant integrates all twelve; the path names one of them (authentication).

## Evidence

### Repository rules

- [AGENTS.md](../AGENTS.md) → Catalog-first rule: "Before adding a prerequisite, project reference, progress reference, or ready route: search the catalog for an existing competency; reuse the existing stable ID". A path reference is the same kind of reference and should follow the same rule.
- [docs/LEARNING_MODEL.md](../docs/LEARNING_MODEL.md) → Goal and role: "The role determines required depth. It should not silently change the underlying competency definition."
- [docs/CURRICULUM.md](../docs/CURRICULUM.md) → Curriculum changes: a change to prerequisites, target depth, or required evidence needs an RFC. A path that restates depth or order in prose can contradict the contracts without review.
- [projects/knowledge-assistant/project.yaml](../projects/knowledge-assistant/project.yaml) already lists its competencies by catalog ID, validated by [schemas/project.schema.json](../schemas/project.schema.json). Paths are the only learner-facing sequence that is not machine-readable.

### OSSU (reference system)

[OSSU Computer Science](https://github.com/ossu/computer-science), README, verified 2026-09-24:

- The curriculum is ordered in top-level sections: Prerequisites, Intro CS, Core CS, Advanced CS, Final project.
- Every course table has a `Prerequisites` column.
- Core CS is required: "All coursework under Core CS is **required**, unless otherwise indicated."
- Advanced CS is elective: "students should choose a subset of courses from Advanced CS based on interest."
- Order is a recommendation that allows skipping: "we recommend working through courses (especially Core CS) in order from top to bottom", "only skipping a course when you are certain that you've already learned the material previously".

The mechanisms to extract are ordered stages, required and elective items, prerequisites shown next to each item, and order as a default rather than a gate. The course-level layout is not reused: here the unit is a catalog competency, and skipping is decided by learner evidence (the [baseline scan](../assessments/baseline.md) and diagnostics), not by self-report.

### How comparable roadmaps order the same topics

[.scratch/research/paths-ordering.md](../.scratch/research/paths-ordering.md) (2026-09-24) checks each open question of this draft against comparable roadmaps and against the competency contracts. Its sources: roadmap.sh [AI Engineer](https://roadmap.sh/ai-engineer) and [AI Agents](https://roadmap.sh/ai-agents) (node order read from page data); Chip Huyen, _AI Engineering_ ([ToC](https://github.com/chiphuyen/aie-book/blob/main/ToC.md), [chapter summaries](https://github.com/chiphuyen/aie-book/blob/main/chapter-summaries.md)); OSSU [Computer Science](https://github.com/ossu/computer-science) and [Data Science](https://github.com/ossu/data-science); Microsoft [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners); [Made With ML](https://madewithml.com/courses/mlops/systems-design/); DeepLearning.AI [_Agentic AI_](https://www.deeplearning.ai/courses/agentic-ai/); the Hugging Face [Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction); [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) (LLM01, LLM06, LLM08); the [MCP specification](https://modelcontextprotocol.io/specification/latest) and its [Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices). The findings this RFC applies:

- **Evaluation before the routes that use it** (Q1, high confidence). _AI Engineering_ teaches evaluation (ch. 3–4, with "Model Selection" inside ch. 4) before prompt engineering (ch. 5) and RAG and agents (ch. 6). Made With ML defines metrics and evaluation before modeling. DeepLearning.AI puts evals and error analysis before planning and multi-agent patterns. roadmap.sh and the Hugging Face course place evaluation late, but they are topic maps that state no prerequisites.
- **Authorization and tool permissions before prompt injection, and all three before MCP** (Q2, high confidence). OWASP LLM01 mitigation 4 ("Enforce privilege control and least privilege access") and LLM06 ("Complete mediation": "Implement authorization in downstream systems rather than relying on an LLM to decide if an action is allowed") rest prompt-injection defense on authorization and permission controls. _AI Engineering_ covers prompt attacks at the end of ch. 5, before agents; Microsoft's course puts "Securing Your Generative AI Applications" (lesson 13) before RAG (15) and agents (17). The MCP specification puts "Security and Trust & Safety" in its overview. roadmap.sh places MCP before security, again without prerequisites.
- **Conditional steps stay required** (Q6, medium to high confidence). Each conditional route's exit evidence is the decision itself (for example memory: "The final decision records whether memory is worth keeping"), and the path's completion standard asks for evidence "that unnecessary complexity was rejected as often as it was added". OSSU uses electives for interest, not for runtime conditions.
- **The eleven Knowledge Assistant production and security routes belong on the path** (Q9, high confidence). _AI Engineering_ ch. 10 (guardrails, gateway, caches, monitoring, orchestration, feedback), roadmap.sh AI Agents' security block, and OWASP 2025 (LLM02, LLM03, LLM06, LLM08) treat these as baseline topics for the role.

The research marks as needing the owner every question that is a mapping of this repository's prose onto catalog IDs (Q3, Q4, Q5, Q7, Q8, Q10, Q11). Its suggested answers are recorded next to those questions below, not applied.

## Proposal

### A. One YAML file per path

`paths/<id>.yaml` replaces `paths/<id>.md`. The file ID stays the path ID (`applied-ai-engineer`), so `target_role: applied-ai-engineer` in [progress/profile.example.yaml](../progress/profile.example.yaml) keeps resolving.

```yaml
id: applied-ai-engineer
title: Applied AI Engineer
audience: A software engineer who wants to build, evaluate, and operate AI product features.
target_profile: # observable goals, carried over from the prose "Target profile"
  - frame an AI problem and define a simple baseline
  - ...
assumes: # prerequisites of on-path routes that this path deliberately does not teach
  - math.dot-product
stages:
  - id: application-core # stable anchor, kebab-case
    title: AI application core
    guidance: | # short Markdown, carried over from the prose; no new teaching content
      The learner should be able to justify why a chosen pattern is simpler or better than an alternative.
    target_level: L3 # optional; only where the path states a depth
    entries:
      - id: ai.product-framing # a catalog ID; nothing else is allowed here
      - id: ai.model-selection
        order_exceptions: # optional; a prerequisite placed later on purpose (illustrative; the migrated path needs none)
          - prerequisite: ai.evaluation
            reason: ...
      - id: specialization.ai-devtools # illustrative only; placement is not a proposal
        required: false # default true
        when: a job or project needs it # optional condition, shown next to an optional entry
completion: # carried over from the prose "Completion standard"
  - several demonstrated or retained core competencies
  - ...
```

Schema sketch, `schemas/path.schema.json`:

| Field                          | Type                       | Rule                                                             |
| ------------------------------ | -------------------------- | ---------------------------------------------------------------- |
| `id`                           | string                     | required; equals the file stem                                   |
| `title`, `audience`            | string                     | required                                                         |
| `target_profile`, `completion` | string[]                   | required, non-empty                                              |
| `assumes`                      | string[]                   | optional; catalog IDs, unique, not on the path                   |
| `stages`                       | object[]                   | required, at least one; order is the path order                  |
| `stages[].id`, `.title`        | string                     | required; `id` unique in the file                                |
| `stages[].guidance`            | string (Markdown)          | optional                                                         |
| `stages[].target_level`        | `L0`...`L4`                | optional                                                         |
| `stages[].entries`             | object[]                   | required, at least one; order within the stage is the path order |
| `entries[].id`                 | string                     | required; catalog ID; each ID once per path                      |
| `entries[].required`           | boolean                    | default `true`                                                   |
| `entries[].when`               | string                     | optional; only on `required: false`                              |
| `entries[].target_level`       | `L0`...`L4`                | optional; overrides the stage value                              |
| `entries[].order_exceptions`   | `{prerequisite, reason}[]` | optional; see rules 3 and 4                                      |
| `additionalProperties`         |                            | `false` at every level                                           |

A path has no per-entry teaching text, sources, or evidence. Those stay in the competency contract; the path only selects, orders, and marks.

### B. Validation

`scripts/validate_schemas.py` validates every `paths/*.yaml` against the schema. `scripts/validate_repo.py` adds:

1. **Catalog IDs.** Every `entries[].id` and `assumes` ID exists in [curriculum/catalog.yaml](../curriculum/catalog.yaml). Removing or renaming a catalog ID that a path uses fails the check, as it does for projects.
2. **No duplicates.** An ID appears once per path, and never in both `entries` and `assumes`.
3. **Ordering.** Walking entries in file order, every prerequisite of a ready entry (from its `competency.yaml`) must be an earlier entry, listed in `assumes`, or named in that entry's `order_exceptions` with a non-empty reason. Anything else is an error that names the entry and the prerequisite. Coverage entries have no declared prerequisites, so they are placed by the author and reviewed here.
4. **Exceptions stay honest.** An `order_exceptions.prerequisite` must be a declared prerequisite of that entry and must appear later on the path; a stale exception is an error.
5. **Coverage is allowed and visible.** A coverage entry is valid. The build copies its catalog `status` into the content model, and the site marks it "mapped, no route" (the existing `status` vocabulary). A required coverage entry is reported in the check output, not failed, so the count of unrouted required steps is visible in every run.
6. **Target level.** `target_level` is only allowed on ready entries (directly, or through the stage). It must not exceed the route's own `target_level`; a path cannot demand evidence the route does not define. Coverage entries inherit no level from the stage.
7. **Required and conditional.** `when` is only allowed with `required: false`.

### C. Site

`curriculum/presentation.yaml` reads paths from `paths/*.yaml` and declares:

- a `member` relation from `path:<id>` to each entry (the relation type projects already use), which is enough for the **Atlas path filter**: a `path` facet that keeps the plate's layout and dims tiles not on the selected path;
- a `sequence` block (new block type in the content model): `stages: [{ id, title: L10n, guidance?: L10n, target_level?, entries: [{ ref, required, when?: L10n, target_level?, order_exceptions?: [{ ref, reason: L10n }] }] }]`;
- `text` and `list` blocks for `audience`, `target_profile`, and `completion`.

The **path screen** at `/{lang}/paths/<id>/` renders the stages in order. Each entry row shows the competency title (linked when it has a page), ready or mapped, required or optional with its `when`, the target level, and the learner's state glyph after hydration (the same glyphs as the Atlas and the collection indexes). An order exception shows as a note on the row. The screen does not compute a percentage or a "done" state: [CONTEXT.md](../CONTEXT.md) rules out progress percentages, and the path's own completion standard is evidence-based.

The `sequence` block follows [the content model RFC](0000-content-model.md): the site learns a block type, not path field names. Detailed layout belongs to [site/DESIGN.md](../site/DESIGN.md) and a site ticket after this RFC is accepted.

### D. Migrating `applied-ai-engineer`

One version of everything: `paths/applied-ai-engineer.md` is deleted in the same change that adds `paths/applied-ai-engineer.yaml`. Its prose moves into `guidance`, `target_profile`, and `completion`, shortened where the structure now carries it (phase headings become stage titles; links to route folders become entry IDs). Callers updated in the same change: [README.md](../README.md), [curriculum/README.md](../curriculum/README.md), [paths/README.md](../paths/README.md), [site/TODO.md](../site/TODO.md), `curriculum/presentation.yaml`, and `site/src/data/atlas.json` (regenerated). The rendered path page on the site becomes the readable version; the YAML is readable on GitHub as-is.

The list below is derived from the current prose and the catalog, with the four decisions in [Decisions taken from the research](#decisions-taken-from-the-research) (Q1, Q2, Q6, Q9) applied. Each prose topic maps to the catalog ID whose title matches it. Where the match is not exact, the entry carries a flag `[Qn]` that points to [Open questions for the owner](#open-questions-for-the-owner). Prose topics with no catalog ID are listed as comments, not entries: the path must not invent competencies.

```yaml
stages:
  - id: blocking-gaps # Phase A
    entries:
      - { id: systems.api-service-design } # "APIs"
      - { id: software.testing } # "test boundaries"
      - { id: systems.os-concurrency } # "async/concurrent work"
      - { id: systems.distributed-systems } # [Q3] "retries, timeouts, idempotency, backpressure"
      - { id: systems.databases-storage } # [Q3] "storage and data lifecycle"
      - { id: systems.observability } # "observability and debugging"
  - id: ml-dl-models # Phase B
    entries:
      - { id: ml.experimental-design } # [Q4] "train/validation/test design", "experimental uncertainty"
      - { id: math.probability } # "probability"
      - { id: dl.embeddings } # "embeddings"
      - { id: dl.optimization } # "optimization and training behavior"
      - { id: dl.foundations } # [Q4] "neural network computation"
  - id: llm-foundations # Phase C; reference project: projects/tiny-transformer
    entries:
      - { id: llm.tokenization }
      - { id: llm.embeddings }
      - { id: llm.self-attention } # ready
      - { id: llm.transformer } # "transformer blocks"
      - { id: llm.decoding-sampling } # "decoding"
      - { id: llm.context-windows }
      - { id: llm.kv-cache }
      - { id: llm.inference } # "inference cost/latency"
  - id: evaluation # prose Phase F, moved before D (Q1); keeps the phase F guidance
    target_level: L3 # "Exit at L3"; ai.evaluation targets L3
    entries:
      - { id: ai.evaluation } # ready
  - id: application-core # Phase D
    entries:
      - { id: ai.product-framing } # ready
      - { id: ai.model-selection } # ready
      - { id: ai.prompt-engineering } # "prompting"
      - { id: ai.context-engineering } # ready
      - { id: ai.structured-outputs } # ready
      - { id: ai.tool-calling } # ready; candidate for "tool schemas" [Q7]
      - { id: ai.uncertainty-abstention-trust } # ready
  - id: retrieval-rag # Phase E; reference system: projects/knowledge-assistant
    entries:
      - { id: retrieval.search } # ready; "lexical baseline"
      - { id: ai.embeddings } # ready
      - { id: retrieval.vector-search } # [Q5] "vector retrieval"
      - { id: retrieval.chunking } # ready; condition in stage guidance (Q6)
      # "hybrid retrieval as needed": no catalog ID [Q5]
      - { id: retrieval.reranking } # ready; condition in stage guidance (Q6)
      # "RAG": no catalog ID [Q5]
      - { id: retrieval.rag-evaluation } # ready
      - { id: retrieval.data-lifecycle } # "retrieval lifecycle"
  - id: agents # Phase G
    entries:
      - { id: agents.deterministic-vs-agentic } # ready; "deterministic versus agentic control"
      - { id: agents.state } # ready
      - { id: agents.memory } # ready; condition in stage guidance (Q6)
      - { id: security.auth } # ready; moved from H (Q2); "auth around data/tools"
      - { id: security.tool-permissions } # ready; added (Q9), placed here (Q2); candidate for "permission boundaries" [Q7]
      - { id: security.prompt-injection } # ready; moved from H (Q2)
      - { id: agents.planning } # ready
      - { id: agents.verification } # ready
      - { id: agents.long-running } # ready; "retries and long-running tasks"
      - { id: agents.orchestration } # ready
      - { id: agents.multi-agent } # ready; condition in stage guidance (Q6)
      - { id: agents.mcp } # ready; condition in stage guidance (Q6)
      # "trajectory/tool-use evaluation": no catalog ID [Q7]
  - id: production-security # Phase H; no stage target_level (Q2)
    entries:
      - { id: production.model-gateway } # ready
      - { id: production.observability } # ready; "tracing and replay"
      - { id: production.latency } # ready
      - { id: production.cost } # ready
      - { id: production.caching } # ready; added (Q9)
      - { id: production.streaming } # ready; added (Q9)
      - { id: production.versioning } # ready
      - { id: production.release-engineering } # ready; "eval/release gates"
      - { id: production.drift } # ready; added (Q9)
      - { id: production.architecture } # ready; added (Q9); candidate for "graceful degradation" [Q8]
      - { id: production.mlops-llmops } # ready; added (Q9); candidate for "incident learning" [Q8]
      - { id: security.data-exfiltration } # ready; added (Q9); candidate for "security boundaries" [Q7]
      - { id: security.multi-tenant } # ready; added (Q9); candidate for "security boundaries" [Q7]
      - { id: security.sandboxing } # ready; added (Q9); candidate for "security boundaries" [Q7]
      - { id: security.supply-chain-data } # ready; added (Q9); candidate for "security boundaries" [Q7]
      - { id: security.guardrails } # ready; added (Q9); candidate for "security boundaries" [Q7]
  - id: specialize # Phase I; "Select from", so every entry is optional
    entries:
      - { id: specialization.llm-systems, required: false }
      - { id: specialization.post-training-reasoning, required: false }
      - { id: specialization.ai-platform, required: false }
      - { id: specialization.search-retrieval, required: false }
      - { id: multimodal.foundations, required: false } # "multimodal/voice/document AI"
      - { id: multimodal.voice, required: false }
      - { id: multimodal.document, required: false }
      - { id: specialization.ai-devtools, required: false } # "developer tools"
```

Counts: 70 entries, 41 of them ready routes (every ready route in the catalog), 29 mapped. Stage titles, `guidance`, and `when` text are carried over from the prose at implementation time and are omitted above. Stage guidance also carries the prose conditions kept under Q6: chunking "when corpus/boundary failures justify it" and reranking "when candidate ordering is the bottleneck" (stage E); memory "only for information whose future value can be measured", multi-agent "only when independent specialist roles ... measurably earn their coordination cost", and MCP "only when a real interoperability requirement justifies" it (stage G). If the owner wants the prose "Target L3" visible in stage H, it goes into that stage's `guidance` text, not `target_level`.

### Ordering against the catalog

Running validation rule 3 over the first draft's list, in prose order, against the prerequisites declared in the current `competency.yaml` files gave these results:

| Entry (stage)                                                                                                                     | Prerequisite                      | Where it was            | Now                                                   |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- | ----------------------------------------------------- |
| `ai.model-selection`, `ai.context-engineering`, `ai.structured-outputs`, `ai.tool-calling`, `ai.uncertainty-abstention-trust` (D) | `ai.evaluation`                   | later, stage F          | resolved: `ai.evaluation` has its own stage before D  |
| `retrieval.chunking`, `retrieval.reranking`, `retrieval.rag-evaluation` (E)                                                       | `ai.evaluation`                   | later, stage F          | resolved, as above                                    |
| `agents.mcp` (G)                                                                                                                  | `security.prompt-injection`       | later, stage H          | resolved: prompt injection moved into G, before MCP   |
| `security.prompt-injection` (H)                                                                                                   | `security.auth`                   | later in the same stage | resolved: auth placed first of the three security IDs |
| `security.prompt-injection` (H)                                                                                                   | `security.tool-permissions`       | not on the path         | resolved: tool permissions added before it (Q9)       |
| `llm.self-attention` (C), `ai.embeddings` (E)                                                                                     | `math.dot-product`                | not on the path         | open [Q10]                                            |
| `llm.self-attention` (C)                                                                                                          | `dl.softmax`                      | not on the path         | open [Q10]                                            |
| `production.latency` (H)                                                                                                          | `systems.performance-engineering` | not on the path         | open [Q10]                                            |
| `production.release-engineering` (H)                                                                                              | `systems.cloud-infrastructure`    | not on the path         | open [Q10]                                            |
| `production.streaming` (H), added under Q9                                                                                        | `systems.networking`              | not on the path         | open [Q10]                                            |

Re-running the check over the list above (2026-09-24, a script over every ready entry's `competency.yaml` prerequisites) finds no prerequisite placed later on the path. The only failures left are the five prerequisites not on the path, all decided by Q10. Every added production and security route has its prerequisites earlier: for example `production.architecture` needs `agents.orchestration` (G) and all nine earlier production routes, `security.data-exfiltration` needs `production.caching` (H) and `security.prompt-injection` (G), and `security.supply-chain-data` needs `security.sandboxing`, which needs `production.architecture`. No `order_exceptions` are needed.

Target level: the first draft's stage H `target_level: L3` failed rule 6 on `security.prompt-injection` (L2). With the stage level dropped and prompt injection in stage G, no stage level sits over an L2 route. The only stage level left is the evaluation stage's L3, which `ai.evaluation` targets.

### Decisions taken from the research

Each decision below applies a recommendation of [.scratch/research/paths-ordering.md](../.scratch/research/paths-ordering.md) rated high or medium to high, backed by the sources in [Evidence](#how-comparable-roadmaps-order-the-same-topics), and consistent with the competency contracts. The owner can still reverse any of them in review.

- **Q1. Evaluation comes after the routes that require it.** Decided: `ai.evaluation` moves into its own stage between C and D, carrying the phase F guidance ("version evaluation data... make a release decision from evidence") and its "Exit at L3". No `order_exceptions`. Its own prerequisites (`ml.experimental-design`, `software.testing`) are in stages B and A, so the move creates no new violation. The prose line "Evaluation should appear before heavy agent or production complexity" still holds.
- **Q2. Security order and stage level.** Decided: in stage G, at the prose's "tool schemas and permission boundaries" (after `agents.memory`, which is after `agents.deterministic-vs-agentic`), the order is `security.auth` → `security.tool-permissions` → `security.prompt-injection`; `agents.mcp` stays last in G. Stage H has no `target_level`: every ready route left in H targets L3 in its own contract, so the stage value added nothing and caused the rule-6 failure. If an L2 route ever sits under a stage level, the entry-level `target_level` override is used; rule 6 is not weakened. The Knowledge Assistant's milestone order (MCP before auth and tool permissions) contradicts the same prerequisites; that is recorded as a migration issue in [RFC 0022](0022-titled-project-milestones.md#milestone-order-contradicts-the-contract-prerequisites), not fixed here.
- **Q6. Required or conditional.** Decided: chunking, reranking, memory, multi-agent, and MCP stay required, with their prose conditions in stage `guidance`. Each route's exit evidence is the measured decision, and "not needed, here is the evidence" is a valid demonstration. `required: false` and `when` are kept for stage I and for any optional depth entries the owner adds under Q5 or Q11.
- **Q9. Ready routes the prose does not name.** Decided: all eleven are added. `security.tool-permissions` goes into stage G (Q2); the other ten go into H in the order shown above, which satisfies every declared prerequisite. Adding `production.streaming` puts its prerequisite `systems.networking` into Q10.

### Open questions for the owner

These are mappings of this repository's prose onto catalog IDs, or scope choices, which the research cannot settle. Each carries the research's suggested answer so the owner can accept it in one line or replace it.

- **Q3. Phase A mappings.** "Retries, timeouts, idempotency, backpressure" is mapped to `systems.distributed-systems`, and "storage and data lifecycle" to `systems.databases-storage`. The prose also says "Use the baseline scan for ... data engineering", which could mean `data.foundation` belongs in stage A. Confirm or change.
  - _Suggested (medium):_ keep `systems.distributed-systems`; split "storage and data lifecycle" into `systems.databases-storage` (storage) and `data.foundation` (data lifecycle), and add `data.foundation` to stage A. Reason: the baseline scan's Systems section tests timeouts, retries, backoff, and idempotency as distributed-systems failures, and its Data Engineering section tests ingestion, update, deletion, freshness, and lineage, which is the Data Engineering README's scope. All three are coverage entries, so they add no ordering constraints.
- **Q4. Phase B mappings.** "Train/validation/test design" could be `ml.experimental-design` or `ml.classical-ml`; "neural network computation" could be `dl.foundations` or `dl.backpropagation`. The list uses the first of each. Also confirm whether `math.statistics` belongs with "experimental uncertainty".
  - _Suggested (medium for the first, low to medium for the rest):_ `ml.experimental-design` (it is a declared prerequisite of `ai.evaluation` with a bridge, and `ml.classical-ml` is broader than the phrase); add `math.statistics` next to `math.probability`; `dl.foundations` for "neural network computation", or `dl.backpropagation` if the entry should match what the baseline scan tests ("explain what backpropagation computes"). Not both.
- **Q5. Retrieval steps without a matching ID.** The prose chain names "vector retrieval", "hybrid retrieval", and "RAG". The catalog has `retrieval.vector-search` ("Vector Search Internals"), which may be deeper than the prose step; no hybrid-retrieval ID; and `retrieval.advanced-rag` ("Advanced RAG Patterns"), which is not the same as the basic RAG step. Decide whether these steps are covered inside existing routes (then drop them) or need catalog entries (a separate RFC).
  - _Suggested:_ drop "vector retrieval" as an entry, since `ai.embeddings` outcomes already cover embedding retrieval and its comparison with the lexical baseline; list `retrieval.vector-search` only as `required: false` for search specialists, if at all. Drop "hybrid retrieval" as an entry and keep "hybrid as needed" in stage E guidance next to `retrieval.reranking` (_AI Engineering_ treats hybrid search as dependent on "each application and its failure modes"; the reranking route's transfer task names hybrid retrieval). Keep "RAG" as a guidance line pointing at the Knowledge Assistant milestone and log a possible catalog gap (basic grounded answer generation with attribution) for a separate catalog RFC; do not map it to `retrieval.advanced-rag`. Every compared roadmap has a basic RAG step before agents, so the gap is real.
- **Q7. Topics that map to several IDs.** "Tool schemas and permission boundaries" (phase G) and "security boundaries" (phase H) could be `security.tool-permissions`, `security.sandboxing`, `security.multi-tenant`, or `security.data-exfiltration`. "Trajectory/tool-use evaluation" has no ID. The placement of `security.tool-permissions` is decided by Q2 and Q9; what remains is which prose phrase each ID stands for.
  - _Suggested (medium to high for the first and third, medium for the second):_ "tool schemas and permission boundaries" = `ai.tool-calling` (its outcome "Define clear tool names, descriptions, schemas...") plus `security.tool-permissions` (OWASP LLM06 mitigations match its outcomes). "Security boundaries" = `security.data-exfiltration`, `security.multi-tenant`, `security.sandboxing`, `security.guardrails`, `security.supply-chain-data`, the set Q9 adds (OWASP LLM02, LLM08, and LLM03/LLM04 map onto them). "Trajectory/tool-use evaluation": no new ID; covered by `ai.evaluation`'s transfer task and `agents.verification` ("Separate trajectory from outcome"), noted in stage G guidance.
- **Q8. Topics with no catalog ID.** "Graceful degradation" and "incident learning" (phase H). Candidates are content inside `production.architecture`, `production.mlops-llmops`, or `data.feedback-loops`.
  - _Suggested (high for the first, medium for the second):_ "graceful degradation" = `production.architecture` (outcome "Prevent one optional AI capability from taking down a useful degraded product path"; exit evidence "At least one degraded user experience is deliberately designed and tested"). "Incident learning" = `production.mlops-llmops` (incident lineage and the "continue, inspect, improve, or rollback decision"), with `production.observability` for diagnosis; optionally add `data.feedback-loops` as a coverage entry for the feedback half. No new ID.
- **Q10. Prerequisites the path does not teach.** `math.dot-product`, `dl.softmax`, `systems.performance-engineering`, `systems.cloud-infrastructure`, and (after Q9) `systems.networking`. Put each in `assumes` or add it as an entry.
  - _Suggested (medium to high for the systems items, medium for the math items):_ all five in `assumes`, with the stage A guidance or `audience` saying that assumed items are diagnosed through the dependent routes' bridges. Each already has a bridge with a diagnostic and locator in the dependent route. The baseline scan does not test dot products or softmax directly, so "the baseline covers it" would be only partly true; the bridges do cover it. Alternative: add `math.dot-product` and `dl.softmax` to stage B as coverage entries.
- **Q11. `llm.positional-information`** is in the LLM Foundations domain but not in the phase C list. Leave it off, or add it.
  - _Suggested (medium):_ leave it off. The baseline scan's LLM section and phase C list the same topics without it, and `llm.training` and `llm.quantization` are already left off. If it should be visible, add it `required: false` with `when: debugging long-context or context-extension behavior`.

## Alternatives considered

### Keep the prose and add a front-matter list

Keeps two descriptions of one path, and the prose can contradict the list without failing a check. Rejected under "one version of everything".

### Derive the path from domains and the prerequisite graph

A topological sort of the domains the role needs would order routes automatically. It cannot express that a role skips part of a domain, marks electives, or states a depth, and the order would change whenever an unrelated prerequisite changed. The explicit list plus the ordering check keeps the author's intent and still catches contradictions.

### Put path membership on each competency (`paths: [applied-ai-engineer]` in the catalog)

Spreads one path across 59 catalog lines, gives no order or stages, and makes a path edit a catalog edit.

### Generate a Markdown copy of each path for GitHub readers

A generated `paths/*.md` (like `curriculum/STATUS.md`) would be readable without the site. It adds a render script and a second file per path for a page the site already renders. Can be added later if GitHub readers need it; not proposed here.

### Store only IDs in the path and drop the prose guidance

The phase guidance ("Start deterministic...", "Do not add architecture components without a measured failure...") is routing advice that belongs to the role, not to any one competency. Dropping it would lose reviewed content.

## Impact

- affected competencies: none. No catalog item, prerequisite, target level, outcome, or evidence changes. Q5, Q7, and Q8 may lead to separate catalog RFCs.
- resource changes: none.
- migration or generated-document impact:
  - add `schemas/path.schema.json`, path checks in `scripts/validate_schemas.py` and `scripts/validate_repo.py`;
  - replace `paths/applied-ai-engineer.md` with `paths/applied-ai-engineer.yaml` after the owner answers Q3, Q4, Q5, Q7, Q8, Q10, and Q11 (Q1, Q2, Q6, and Q9 are decided above);
  - update the links in `README.md`, `curriculum/README.md`, and `paths/README.md`;
  - `curriculum/presentation.yaml`: paths from `paths/*.yaml`, a `member` relation, a `sequence` block;
  - `scripts/build_site_data.py`, `schemas/site-data.schema.json`: the `sequence` block type;
  - site: the path screen and the Atlas path facet, then close both items in `site/TODO.md`;
  - regenerate `site/src/data/atlas.json`.

## Review checklist

- [x] Evidence is traceable (repository rules quoted; OSSU claims verified against its README; ordering evidence cited to [.scratch/research/paths-ordering.md](../.scratch/research/paths-ordering.md) and its sources).
- [x] The path introduces no competency: every entry is an existing catalog ID (checked against `curriculum/catalog.yaml`); unmapped prose topics are listed as open questions.
- [x] The ordering rule matches the prerequisites in the competency contracts, and every exception carries a reason. The list above has no prerequisite placed later and needs no exceptions; the five off-path prerequisites wait on Q10.
- [ ] Coverage entries are allowed and visibly marked as mapped.
- [ ] A path target level cannot exceed a route's own target level.
- [ ] The prose file is replaced, not kept alongside, and every caller is updated in the same change.
- [ ] The site renders learner states from evidence records only, with no completion percentage.
- [x] Q1, Q2, Q6, and Q9 are decided from cited research and applied to the list.
- [ ] Q3, Q4, Q5, Q7, Q8, Q10, and Q11 are answered by the owner before the YAML file is written.
- [ ] Reviewer explicitly approves or requests changes before implementation.
