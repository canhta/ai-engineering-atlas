# RFC: Retrieval Quality Slice

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Problem

The Knowledge Assistant now has product framing, lexical retrieval, embedding retrieval, and general AI evaluation. The next risk is to turn the roadmap into a checklist of RAG techniques—chunking, reranking, and RAG metrics—without proving which failure each technique fixes.

Three existing catalog nodes are still `coverage`:

- `retrieval.chunking`
- `retrieval.reranking`
- `retrieval.rag-evaluation`

This RFC proposes the capability contracts and dependency boundaries for those nodes. It does **not** promote them to `ready`.

## Evidence

### Retrieval optimization / chunking context

- Chip Huyen — *AI Engineering*, Chapter 6 **RAG and Agents**  
  Published table of contents places **Retrieval Algorithms** at p.257 and **Retrieval Optimization** at p.268.  
  https://github.com/chiphuyen/aie-book/blob/main/ToC.md
- Chip Huyen's Chapter 6 resource list explicitly includes chunking resources under RAG.  
  https://github.com/chiphuyen/aie-book/blob/main/resources.md
- Kiss, Nagy, Szilágyi — *Max–Min semantic chunking of documents for RAG application* (2025)  
  https://link.springer.com/article/10.1007/s10791-025-09638-7  
  Useful here as experiment-design evidence, not as a recommendation to adopt Max–Min. Section 4 holds the retrieval/generation setup fixed while varying chunking; §4.2 compares multiple chunking methods in the same RAG pipeline.

The curriculum lesson to extract is: chunking is an experimentally testable retrieval/data-representation decision. A semantic splitter should not be assumed superior to a simple baseline.

### Reranking

- Sentence Transformers — **Retrieve & Re-Rank**  
  https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html

Verified sections:

- **Retrieve & Re-Rank Pipeline**
- **Retrieval: Bi-Encoder**
- **Re-Ranker: Cross-Encoder**

The source describes a two-stage system: a fast first-stage retriever produces a candidate set, then a slower CrossEncoder scores query-document pairs for final ranking. It also makes the central engineering constraint explicit: a reranker cannot score the entire large corpus cheaply, so first-stage candidate retrieval remains necessary.

The curriculum should generalize the capability beyond one Sentence Transformers API.

### RAG evaluation

- Existing ready competency: `ai.evaluation`
- Es et al. — **RAGAs: Automated Evaluation of Retrieval Augmented Generation** (EACL 2024)  
  https://aclanthology.org/2024.eacl-demo.16/

The paper motivates separate evaluation dimensions:

- whether retrieval identifies relevant and focused context;
- whether generation uses supplied context faithfully;
- generation quality itself.

RAGAS is evidence for decomposing evaluation, not a requirement to use the Ragas framework or to trust one automatic score.

## Proposal

Create a coherent **Retrieval Quality Slice** using the same Knowledge Assistant evidence contract.

```text
existing lexical + semantic baselines
→ chunking experiment
→ retrieval failure analysis
→ reranking experiment
→ answer generation
→ retrieval/context/generation/end-to-end evaluation
→ architecture + release decision
```

### 1. `retrieval.chunking`

**Proposed level:** L3  
**Types:** engineering skill, design judgment  
**Target states:** demonstrated, transferred, applied

**Proposed prerequisites:**

- `retrieval.search`
- `ai.embeddings`
- `ai.evaluation`

**Observable outcomes:**

- explain chunking as a retrieval/index representation decision rather than preprocessing boilerplate;
- compare fixed-size, overlap, structure-aware, or semantic-boundary strategies appropriate to the corpus;
- keep corpus/query/evaluation evidence fixed while changing chunking;
- measure retrieval effects such as Recall@K/ranking quality alongside index/context cost and latency;
- diagnose boundary loss, over-fragmentation, duplicated context, overly broad chunks, and corpus-structure mismatch;
- choose a chunking strategy from measured behavior rather than framework defaults.

**Required evidence:**

- exact splitter configurations;
- controlled comparison across at least three sensible strategies;
- query-slice and failure analysis;
- architecture decision explaining what improved and what regressed.

The route should **not** teach Max–Min as the canonical algorithm. The paper is evidence that chunking strategies can and should be compared under controlled conditions.

### 2. `retrieval.reranking`

**Proposed level:** L3  
**Types:** engineering skill, design judgment  
**Target states:** demonstrated, transferred, applied

**Proposed prerequisites:**

- `retrieval.search`
- `ai.evaluation`

`ai.embeddings` is useful project context but should not be a hard prerequisite because first-stage candidates may be lexical, dense, hybrid, or another retrieval method.

**Observable outcomes:**

- separate candidate generation from final ranking;
- explain why first-stage candidate recall creates an upper bound for reranking;
- add a more expensive query-document scorer only after first-stage failure analysis;
- evaluate ranking improvement using an appropriate metric such as MRR/NDCG plus query slices;
- sweep candidate-set size and measure quality/latency trade-offs;
- diagnose failures a reranker cannot fix because the relevant document never entered the candidate set.

**Required evidence:**

- first-stage retriever/version;
- candidate-set size and candidate recall;
- reranker/version;
- ranking metric before/after;
- end-to-end retrieval latency;
- candidate-size experiment;
- decision on whether quality gain justifies operational cost.

The route should be provider/framework independent; CrossEncoder is a concrete teaching mechanism, not the competency definition.

### 3. `retrieval.rag-evaluation`

**Proposed level:** L3  
**Types:** engineering skill, design judgment, production competency  
**Target states:** demonstrated, transferred, applied

**Proposed prerequisites:**

- `ai.evaluation`
- `retrieval.search`

**Observable outcomes:**

- separate retrieval, supplied-context, generation, and end-to-end failure;
- choose retrieval metrics from explicit relevance judgments where available;
- evaluate whether context is sufficient/focused and whether generated answers are faithful to supplied evidence;
- use model-based evaluators only with recorded provenance, explicit rubric/metric definition, and human-reviewed calibration where judgment is subjective;
- convert failure cases into regression cases;
- make an architecture/release decision without collapsing the system into one "RAG score."

**Required evidence:**

- versioned eval set and system configuration;
- retrieval evidence;
- context-quality evidence;
- generation evidence;
- end-to-end operational evidence;
- failure taxonomy;
- evaluator provenance/calibration where model judges are used;
- regression cases and release/architecture decision.

RAGAS should be presented as one concrete decomposition/metric family, not as the curriculum source of truth.

## Knowledge Assistant integration

The already-added `projects/knowledge-assistant/retrieval-quality/` directory is proposed as the project evidence contract.

It currently preserves:

- controlled chunking experiment;
- reranking candidate-set and latency evidence;
- separate retrieval/context/generation/end-to-end evaluation;
- model-evaluator provenance;
- architecture decision and regression cases.

The project artifact should remain evidence scaffolding. Completion requires learner-generated results, not filling a template.

## Promotion gate

No node in this RFC should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact source locators are rechecked during route authoring;
4. competency YAML + learner README are complete;
5. practice/evidence matches the approved capability;
6. Knowledge Assistant integration is inspectable;
7. `make check` / CI passes;
8. the promotion is pushed only after the review decision is recorded.

## Alternatives considered

### One broad "RAG" competency

Rejected because it hides independent failure surfaces and makes diagnostics too coarse.

### Framework-first route

Examples would be LangChain splitters, a specific vector database, a specific reranker API, or Ragas as the learning objective. Rejected because the capability should survive tool changes.

### Promote all three because resources already exist

Rejected. Resource availability does not establish the competency contract or constitute review.

### Skip chunking and reranking until full RAG

Rejected because retrieval quality should be measurable before generation is allowed to hide retrieval failures.

## Impact

- affected competencies:
  - `retrieval.chunking`
  - `retrieval.reranking`
  - `retrieval.rag-evaluation`
- existing prerequisite competencies:
  - `retrieval.search`
  - `ai.embeddings`
  - `ai.evaluation`
- resource changes already staged:
  - `paper.maxmin-chunking`
  - `docs.sentence-transformers-retrieve-rerank`
  - `paper.ragas-evaluation`
  - `docs.ragas-rag-metrics`
- project scaffolding already staged:
  - `projects/knowledge-assistant/retrieval-quality/`
- catalog/generated status:
  - **no change until RFC review and completed routes**

## Review checklist

- [ ] Evidence is traceable.
- [ ] The three competencies are sufficiently distinct.
- [ ] None duplicates an existing catalog competency.
- [ ] Proposed target levels and target states are justified.
- [ ] Chunking prerequisites are justified.
- [ ] Reranking does not incorrectly require dense retrieval.
- [ ] RAG evaluation remains a specialization of evaluation rather than duplicating `ai.evaluation`.
- [ ] Exit criteria are inspectable and testable.
- [ ] Model-based evaluators are not treated as ground truth.
- [ ] Resource examples do not redefine the competency around a framework.
- [ ] Project evidence creates meaningful integration pressure.
- [ ] Reviewer explicitly approves or requests changes before promotion.
