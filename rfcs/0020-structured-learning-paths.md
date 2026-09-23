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
        order_exceptions: # optional; a prerequisite placed later on purpose
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

The list below is derived only from the current prose and the catalog. Each prose topic maps to the catalog ID whose title matches it. Where the match is not exact, the entry carries a flag `[Qn]` that points to [Open questions for the owner](#open-questions-for-the-owner). Prose topics with no catalog ID are listed as comments, not entries: the path must not invent competencies.

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
  - id: application-core # Phase D
    entries:
      - { id: ai.product-framing } # ready
      - { id: ai.model-selection } # ready [Q1]
      - { id: ai.prompt-engineering } # "prompting"
      - { id: ai.context-engineering } # ready [Q1]
      - { id: ai.structured-outputs } # ready [Q1]
      - { id: ai.tool-calling } # ready [Q1]
      - { id: ai.uncertainty-abstention-trust } # ready [Q1]
  - id: retrieval-rag # Phase E; reference system: projects/knowledge-assistant
    entries:
      - { id: retrieval.search } # ready; "lexical baseline"
      - { id: ai.embeddings } # ready
      - { id: retrieval.vector-search } # [Q5] "vector retrieval"
      - { id: retrieval.chunking } # ready [Q1] [Q6] "when corpus/boundary failures justify it"
      # "hybrid retrieval as needed": no catalog ID [Q5]
      - { id: retrieval.reranking } # ready [Q1] [Q6] "when candidate ordering is the bottleneck"
      # "RAG": no catalog ID [Q5]
      - { id: retrieval.rag-evaluation } # ready [Q1]
      - { id: retrieval.data-lifecycle } # "retrieval lifecycle"
  - id: evaluation # Phase F
    target_level: L3 # "Exit at L3"
    entries:
      - { id: ai.evaluation } # ready [Q1]
  - id: agents # Phase G
    entries:
      - { id: agents.deterministic-vs-agentic } # ready; "deterministic versus agentic control"
      - { id: agents.state } # ready
      - { id: agents.memory } # ready [Q6]
      # "tool schemas and permission boundaries": [Q7]
      - { id: agents.planning } # ready
      - { id: agents.verification } # ready
      - { id: agents.long-running } # ready; "retries and long-running tasks"
      - { id: agents.orchestration } # ready
      - { id: agents.multi-agent } # ready [Q6]
      - { id: agents.mcp } # ready [Q2] [Q6]
      # "trajectory/tool-use evaluation": no catalog ID [Q7]
  - id: production-security # Phase H
    target_level: L3 # "Target L3 in:" [Q2]
    entries:
      - { id: production.model-gateway } # ready
      - { id: production.observability } # ready; "tracing and replay"
      - { id: production.latency } # ready
      - { id: production.cost } # ready
      - { id: production.versioning } # ready
      - { id: production.release-engineering } # ready; "eval/release gates"
      # "graceful degradation": no catalog ID [Q8]
      # "security boundaries": [Q7]
      - { id: security.prompt-injection } # ready [Q2]
      - { id: security.auth } # ready; "auth around data/tools"
      # "incident learning": no catalog ID [Q8]
      # ready routes the prose does not name: [Q9]
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

Counts: 59 entries, 30 of them ready routes, 29 mapped. Stage titles, `guidance`, and `when` text are carried over from the prose at implementation time and are omitted above.

### Ordering against the catalog

Running validation rule 3 over the list above, in prose order, against the prerequisites declared in the current `competency.yaml` files gives these results. Each one needs an owner decision before the file can pass; none is resolved here.

| Entry (stage)                                                                                                                     | Prerequisite                      | Where it is                  |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------- |
| `ai.model-selection`, `ai.context-engineering`, `ai.structured-outputs`, `ai.tool-calling`, `ai.uncertainty-abstention-trust` (D) | `ai.evaluation`                   | later, stage F [Q1]          |
| `retrieval.chunking`, `retrieval.reranking`, `retrieval.rag-evaluation` (E)                                                       | `ai.evaluation`                   | later, stage F [Q1]          |
| `agents.mcp` (G)                                                                                                                  | `security.prompt-injection`       | later, stage H [Q2]          |
| `security.prompt-injection` (H)                                                                                                   | `security.auth`                   | later in the same stage [Q2] |
| `security.prompt-injection` (H)                                                                                                   | `security.tool-permissions`       | not on the path [Q7]         |
| `llm.self-attention` (C), `ai.embeddings` (E)                                                                                     | `math.dot-product`                | not on the path [Q10]        |
| `llm.self-attention` (C)                                                                                                          | `dl.softmax`                      | not on the path [Q10]        |
| `production.latency` (H)                                                                                                          | `systems.performance-engineering` | not on the path [Q10]        |
| `production.release-engineering` (H)                                                                                              | `systems.cloud-infrastructure`    | not on the path [Q10]        |

Target level: stage H states L3, but `security.prompt-injection` targets L2 in its contract, so rule 6 fails on it [Q2].

### Open questions for the owner

- **Q1. Evaluation comes after the routes that require it.** The prose puts AI Evaluation in phase F and says "Evaluation should appear before heavy agent or production complexity". Eight ready routes in phases D and E declare `ai.evaluation` as a prerequisite. Options: move `ai.evaluation` to the start of stage D (or its own stage before D), or keep phase order and add eight `order_exceptions` with a reason. The first matches the contracts; the second keeps the prose.
- **Q2. Security order.** `agents.mcp` (phase G) requires `security.prompt-injection` (phase H), and `security.prompt-injection` requires `security.auth`, listed after it in the prose. Stage H says "Target L3" but the prompt-injection route is L2. Decide whether the path moves prompt injection and auth before MCP, whether the stage level applies to every entry, and whether an L2 route can sit in an L3 stage.
- **Q3. Phase A mappings.** "Retries, timeouts, idempotency, backpressure" is mapped to `systems.distributed-systems`, and "storage and data lifecycle" to `systems.databases-storage`. The prose also says "Use the baseline scan for ... data engineering", which could mean `data.foundation` belongs in stage A. Confirm or change.
- **Q4. Phase B mappings.** "Train/validation/test design" could be `ml.experimental-design` or `ml.classical-ml`; "neural network computation" could be `dl.foundations` or `dl.backpropagation`. The list uses the first of each. Also confirm whether `math.statistics` belongs with "experimental uncertainty".
- **Q5. Retrieval steps without a matching ID.** The prose chain names "vector retrieval", "hybrid retrieval", and "RAG". The catalog has `retrieval.vector-search` ("Vector Search Internals"), which may be deeper than the prose step; no hybrid-retrieval ID; and `retrieval.advanced-rag` ("Advanced RAG Patterns"), which is not the same as the basic RAG step. Decide whether these steps are covered inside existing routes (then drop them) or need catalog entries (a separate RFC).
- **Q6. Required or conditional.** The prose makes several steps conditional: chunking "when corpus/boundary failures justify it", reranking "when candidate ordering is the bottleneck", memory "only for information whose future value can be measured", multi-agent "only when independent specialist roles ... measurably earn their coordination cost", MCP "only when a real interoperability requirement justifies" it. The list above keeps them required and does not guess. Mark each as `required: false` with `when`, or keep required because the learner should be able to make the decision even when the answer is "not needed".
- **Q7. Topics that map to several IDs.** "Tool schemas and permission boundaries" (phase G) and "security boundaries" (phase H) could be `security.tool-permissions`, `security.sandboxing`, `security.multi-tenant`, or `security.data-exfiltration`. `security.tool-permissions` is also a prerequisite of prompt injection. "Trajectory/tool-use evaluation" has no ID.
- **Q8. Topics with no catalog ID.** "Graceful degradation" and "incident learning" (phase H). Candidates are content inside `production.architecture`, `production.mlops-llmops`, or `data.feedback-loops`, but that needs a check against those contracts, not a guess.
- **Q9. Ready routes the prose does not name.** The prose says "Use the production milestones in the Knowledge Assistant", whose `project.yaml` includes eleven ready routes absent from the path: `production.caching`, `production.streaming`, `production.drift`, `production.architecture`, `production.mlops-llmops`, `security.tool-permissions`, `security.multi-tenant`, `security.data-exfiltration`, `security.sandboxing`, `security.supply-chain-data`, `security.guardrails`. Add them to stage H (the validator then orders them by prerequisites), or keep the path to what the prose names.
- **Q10. Prerequisites the path does not teach.** `math.dot-product`, `dl.softmax`, `systems.performance-engineering`, and `systems.cloud-infrastructure`. Put each in `assumes` (the baseline scan covers it) or add it as an entry.
- **Q11. `llm.positional-information`** is in the LLM Foundations domain but not in the phase C list. Leave it off, or add it.

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
  - replace `paths/applied-ai-engineer.md` with `paths/applied-ai-engineer.yaml` after Q1 to Q11 are answered;
  - update the links in `README.md`, `curriculum/README.md`, and `paths/README.md`;
  - `curriculum/presentation.yaml`: paths from `paths/*.yaml`, a `member` relation, a `sequence` block;
  - `scripts/build_site_data.py`, `schemas/site-data.schema.json`: the `sequence` block type;
  - site: the path screen and the Atlas path facet, then close both items in `site/TODO.md`;
  - regenerate `site/src/data/atlas.json`.

## Review checklist

- [ ] Evidence is traceable (repository rules quoted; OSSU claims verified against its README).
- [ ] The path introduces no competency: every entry is an existing catalog ID; unmapped prose topics are listed as open questions.
- [ ] The ordering rule matches the prerequisites in the competency contracts, and every exception carries a reason.
- [ ] Coverage entries are allowed and visibly marked as mapped.
- [ ] A path target level cannot exceed a route's own target level.
- [ ] The prose file is replaced, not kept alongside, and every caller is updated in the same change.
- [ ] The site renders learner states from evidence records only, with no completion percentage.
- [ ] Q1 to Q11 are answered by the owner before the YAML file is written.
- [ ] Reviewer explicitly approves or requests changes before implementation.
