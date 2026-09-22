# Knowledge Assistant

Reference project for the AI System and Production spines.

For the first product/search/embeddings slice, use the [foundation evidence contract](foundation/) so the product brief, query set, baseline comparison, and retrieval decision remain inspectable.

The system answers questions over a changing document collection and must provide evidence for where its answers came from.

The project is deliberately generic: use public technical documentation, a public-domain corpus, or your own permitted material.

## Product frame

Before choosing models or a vector database, complete the [AI Product and Problem Framing](../../curriculum/07-ai-engineering/product-framing/) route and write a one-page product brief.

### User

Choose a concrete user such as:

- support engineer;
- developer using internal documentation;
- operations engineer;
- analyst working with a document collection.

### Pain

Describe the current workflow and failure cost.

Examples:

- slow manual search;
- stale answers;
- difficult navigation across many documents;
- inability to find the source of an answer.

### Value proposition

State what the system should improve.

Do not use "AI assistant" as the value proposition.

### Constraints

Record constraints such as:

- update frequency;
- permissions;
- latency;
- cost;
- data sensitivity;
- citation requirement;
- acceptable failure behavior.

### Evaluation contract

Before architecture work, define:

- representative queries;
- retrieval relevance criteria;
- answer criteria;
- unacceptable failures;
- latency/cost measurements;
- baseline to beat.

This follows the same discipline as Made With ML's product-first approach: problem and evaluation come before model complexity.

---

## Milestone 0 — lexical baseline

Use the [Search and Retrieval](../../curriculum/07-ai-engineering/search-retrieval/) route and build the simplest useful retrieval baseline.

A keyword or lexical search is preferred over starting with RAG.

**Artifacts:**

- product brief;
- small versioned query set;
- baseline retrieval results;
- failure notes.

**Decision:** what failure justifies adding semantic retrieval?

## Milestone 1 — embeddings and vector retrieval

Use the [Embeddings for AI Applications](../../curriculum/07-ai-engineering/embeddings/) route and add embedding-based retrieval.

Do not remove the lexical baseline.

Compare them on the same query set.

**Measure:**

- retrieval relevance;
- obvious miss categories;
- latency;
- indexing/update cost where useful.

**Evidence:** identify query types where each method wins or fails.

## Milestone 2 — hybrid retrieval and reranking

Add hybrid retrieval or reranking only when the prior failure analysis supports it.

**Experiment:**

- baseline vs vector vs hybrid/reranked;
- inspect false positives and false negatives;
- record the quality/latency trade-off.

## Milestone 3 — answer generation / RAG

Only after retrieval is measurable, add answer generation.

Require source attribution.

Separate evaluation into:

1. retrieval quality;
2. answer quality given retrieved context;
3. end-to-end behavior.

This prevents generation quality from hiding retrieval failures.

## Milestone 4 — evaluation harness

Use the [AI Evaluation competency](../../curriculum/07-ai-engineering/evaluation/).

Version:

- query/eval set;
- system configuration;
- results;
- failure taxonomy.

Include:

- component metrics;
- end-to-end metrics;
- repeated runs for stochastic behavior;
- latency;
- cost where measurable.

Create a release decision from the results.

## Milestone 5 — data lifecycle

Make the corpus change.

Support at least:

- add;
- update;
- delete;
- freshness verification.

If the chosen scenario has permissions, add ACL-aware retrieval and test that unauthorized content cannot be returned.

**Failure exercise:** intentionally create a stale or incorrectly indexed document and diagnose it.

## Milestone 6 — tool use or agent workflow

Do **not** add an agent because the roadmap contains an Agents section.

First identify a task the retrieval-only system cannot handle cleanly.

Examples:

- fetch live system status;
- create a structured ticket;
- compare information from multiple tools;
- execute a multi-step workflow.

Start with a deterministic workflow. Introduce agentic control only when flexibility is needed and measurable.

**Evidence:**

- tool schema;
- authorization boundary;
- idempotency/retry behavior;
- trajectory/tool-use evaluation;
- failure recovery.

## Milestone 7 — service and observability

Expose the system through an API or application boundary.

Trace at least:

- request ID;
- model calls;
- retrieval calls;
- tool calls;
- latency;
- errors;
- token/cost data when available.

A trace should help answer **why** a bad result happened.

## Milestone 8 — release gate

Create a pre-release check that uses the evaluation harness.

A release decision should include:

- quality regressions;
- critical failure cases;
- latency/cost constraints;
- security checks relevant to the system.

The output is a recorded **go / no-go decision with evidence**, not merely a CI green check.

## Milestone 9 — security failure work

Test realistic trust-boundary failures.

At minimum consider:

- indirect prompt injection in retrieved content;
- unauthorized document access;
- dangerous or malformed tool arguments;
- sensitive data in logs/traces.

Mitigations should live outside the model prompt when the control requires real authorization or isolation.

## Milestone 10 — incident and feedback loop

Inject or analyze one failure:

- stale index;
- provider timeout;
- retrieval regression;
- malformed document;
- tool failure;
- prompt-injection attempt.

Produce:

1. detection evidence;
2. user impact;
3. diagnosis;
4. mitigation;
5. durable regression test;
6. follow-up metric or alert.

This is where production learning becomes part of the curriculum rather than an appendix.

---

# What completion looks like

A strong project record contains the evolution of decisions:

```text
problem
→ baseline
→ measured failure
→ architecture change
→ experiment
→ release decision
→ production/failure evidence
→ feedback
```

The final architecture matters less than whether each increase in complexity can be explained from evidence.
