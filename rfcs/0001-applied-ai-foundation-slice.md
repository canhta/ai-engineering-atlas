# RFC: Applied AI Foundation Slice — retrospective governance review

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Problem

The first Applied AI Foundation slice was implemented and promoted directly from `coverage` to `ready` for:

- `ai.product-framing`
- `retrieval.search`
- `ai.embeddings`

The routes have source locators, diagnostics, practice, exit evidence, transfer tasks, project integration, and passing repository validation. However, the promotion did not follow the repository's required substantive curriculum governance path: RFC/proposal → review → promotion.

This RFC records the missing governance decision. It does **not** assume that CI success or AI-authored research is sufficient approval.

## Evidence

### Product framing

- Made With ML — Product Design  
  https://madewithml.com/courses/mlops/product-design/  
  Verified sections: **Background**, **Value proposition**, **Objectives**, **Solution**, **Feasibility**.
- Chip Huyen — *AI Engineering*  
  Chapter 1 route currently uses **Planning AI Applications**, especially **Use Case Evaluation**, **Setting Expectations**, **Milestone Planning**, and **Maintenance**.

These sources support a product-first capability that separates user/problem framing, success criteria, constraints, alternatives, and feasibility from implementation choice.

### Search and retrieval

- Manning, Raghavan, Schütze — *Introduction to Information Retrieval*  
  https://nlp.stanford.edu/IR-book/  
  Route uses Chapter 6 §§6.2–6.3 for term weighting/vector-space ranking and Chapter 8 for ranked-retrieval evaluation.
- Chip Huyen — *AI Engineering*  
  Chapter 6 **RAG and Agents** → **Retrieval Algorithms** (starts p.257 in the published table of contents).

These sources support a lexical ranked-retrieval baseline, relevance judgments, ranking evaluation, and failure analysis before semantic complexity.

### Embeddings for AI applications

- Chip Huyen — *AI Engineering*  
  Chapter 3 embedding material and Chapter 6 retrieval material.
- Sentence Transformers — Semantic Search  
  https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html
- Manning, Raghavan, Schütze — *Introduction to Information Retrieval*, Chapter 6 §6.3 for vector scoring.

The route uses these sources to distinguish semantic representation from retrieval evaluation and to require a controlled lexical-vs-semantic comparison.

## Proposal

Review the three already-landed ready routes as one coherent **Applied AI Foundation Slice**.

The intended learner progression is:

```text
user/problem
→ measurable product contract
→ lexical retrieval baseline
→ retrieval failure taxonomy
→ embedding retrieval
→ same-evidence comparison
→ architecture decision
```

### Proposed competency contracts for review

#### `ai.product-framing`

- target level: L3
- types: design judgment
- target states: demonstrated, transferred, applied
- prerequisite: none
- central evidence: product brief, baseline-to-beat, success criteria, constraints, unacceptable failures, stop condition
- project integration: Knowledge Assistant foundation evidence contract

#### `retrieval.search`

- target level: L3
- types: engineering skill, design judgment
- target states: demonstrated, transferred, applied
- prerequisite: `ai.product-framing`
- central evidence: reproducible lexical ranked-retrieval baseline, relevance labels, ranking metric, latency, failure taxonomy
- project integration: same corpus/query set carried forward into semantic retrieval

#### `ai.embeddings`

- target level: L3
- types: mechanism, engineering skill, design judgment
- target states: demonstrated, transferred, applied
- prerequisites: `retrieval.search`, `math.dot-product`
- prerequisite bridge: targeted vector-similarity patch for `math.dot-product`
- central evidence: trace text → representation → similarity → ranking; controlled lexical-vs-semantic comparison; query-slice failure analysis
- project integration: Knowledge Assistant retrieval decision record

### Reviewer decision

The reviewer should choose one outcome:

1. **Accept** the current contracts and retain the three nodes as `ready`.
2. **Request changes** to outcomes, prerequisites, target depth, source route, or evidence before acceptance.
3. **Demote** one or more nodes to `coverage` until the required changes are complete.

Until review, this RFC remains Draft and should not be treated as retroactive approval.

## Alternatives considered

### Immediately revert all three routes to coverage

This would restore strict process order but discard usable work before a reviewer has assessed whether the contracts are substantively sound.

### Leave the current state undocumented

Rejected because it would hide a governance violation and make future contributors believe CI alone is enough to approve a substantive curriculum change.

### Treat passing CI as review

Rejected. Validators check repository contracts; they do not provide human curriculum approval.

## Impact

- affected competencies:
  - `ai.product-framing`
  - `retrieval.search`
  - `ai.embeddings`
- resource changes:
  - Made With ML Product Design
  - *AI Engineering*
  - *Introduction to Information Retrieval*
  - Sentence Transformers Semantic Search
- project impact:
  - `projects/knowledge-assistant/foundation/`
- generated-document impact:
  - current status counts already include these three routes
- migration:
  - none unless review requests demotion or contract changes

## Review checklist

- [ ] Evidence is traceable.
- [ ] The competencies do not duplicate existing catalog nodes.
- [ ] Target level and target states are justified.
- [ ] Prerequisites and the `math.dot-product` bridge are justified.
- [ ] Exit criteria are testable.
- [ ] The Knowledge Assistant artifacts are sufficient evidence rather than completion-by-template.
- [ ] Resource choices do not silently redefine the competencies.
- [ ] Reviewer explicitly accepts, requests changes, or requests demotion.
