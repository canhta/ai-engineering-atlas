# RFC: Agent State and Memory Slice

- Status: Draft
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22

## Problem

The repository now has a measured AI application core, deterministic-versus-agentic design, tool boundaries, structured outputs, and abstention. Before adding planning, verification, long-running orchestration, or multi-agent systems, two existing catalog nodes need explicit capability boundaries:

- `agents.state`
- `agents.memory`

These concepts are frequently collapsed into "chat history" or one framework's persistence API.

That creates several curriculum failures:

- execution state is inferred from conversation text instead of modeled explicitly;
- a context window is treated as the durable source of truth;
- "memory" means storing all messages forever;
- agent resume/recovery is not tested;
- memory writes are accepted without provenance, update, deletion, freshness, or scope rules;
- retrieval of stale or wrong memories is not evaluated as a failure mode;
- state checkpoints and long-term memory are conflated even though they solve different problems.

This RFC proposes a two-competency slice:

```text
measured tool-enabled workflow
→ explicit run/session state
→ durable checkpoints / event history
→ interruption + resume
→ state/context boundary
→ explicit memory scope
→ memory write policy
→ memory retrieval policy
→ update / correction / deletion
→ memory benefit + harm evaluation
→ decision: what belongs in state, memory, corpus, or current context
```

## Evidence

### Google ADK — Conversational Context: Session, State, and Memory

https://adk.dev/sessions/

Verified section:

- **Core Concepts**

The documentation explicitly separates:

- `Session` — one current conversation thread and its event history;
- `State` — mutable data used inside that session;
- `Memory` — searchable information that can span past sessions or external sources.

This is the clearest conceptual boundary for the curriculum: execution/session state, long-term memory, and current model context are related but not interchangeable.

### Google ADK — State: The Session's Scratchpad

https://adk.dev/sessions/state/

Verified sections:

- **What is session.state?**
- **Key Characteristics of State**
- **How State is Updated: Recommended Methods**

The source emphasizes serializable, mutable state and tracked updates tied to session events. The curriculum should extract the general engineering principles rather than require ADK.

### Google ADK — Memory: Long-term knowledge with MemoryService

https://adk.dev/sessions/memory/

Verified sections:

- **Memory: Long-term knowledge with MemoryService**
- **The MemoryService role**

The source separates current-session state/history from searchable cross-session information and exposes explicit ingest/search operations. The route extends this with provenance, scope, correction, deletion, freshness, and harm evaluation because those are required for a production-quality memory lifecycle.

### Temporal — Durable Execution

https://docs.temporal.io/

Temporal's documentation defines durable execution around resuming application execution after crashes, network failures, or infrastructure outages.

This supports the state requirement that persistence must enable recovery semantics rather than merely save a transcript. Temporal is a production reference, not a required framework.

### Agent state

#### Anthropic — Scaling Managed Agents: Decoupling the brain from the hands

https://www.anthropic.com/engineering/managed-agents

Verified sections:

- **Decouple the brain from the hands**
- **The session is not Claude's context window**

The source separates:

- a **session** — durable append-only record of events;
- a **harness** — control loop;
- a **sandbox** — execution environment.

It shows why recoverable agent operation should not depend on one process or one model context surviving. The session log can survive harness failure and support resume from the last durable event.

The second section explicitly separates durable session history from the model's context window. Context may be compacted, sliced, or transformed; the durable session remains available outside the window.

The curriculum lesson is architectural: **durable state and current inference context are distinct concerns**.

#### Anthropic — Effective harnesses for long-running agents

https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

Verified sections:

- **The long-running agent problem**
- **Incremental progress**
- **Getting up to speed**

The source demonstrates a practical state handoff pattern across fresh context windows:

- persistent feature/task state;
- progress notes;
- git history / durable artifacts;
- incremental work;
- verification of the environment before continuing.

The route should extract the state-continuity and resume principles rather than require the Claude Agent SDK.

#### LangGraph — Persistence

https://docs.langchain.com/oss/python/langgraph/persistence

Verified sections:

- persistence overview;
- **Checkpointer vs. store**.

The documentation gives a concrete implementation distinction:

- checkpoints persist thread-scoped graph state for continuity, human-in-the-loop, time travel, and fault tolerance;
- stores persist application-defined data across threads.

This is useful as a concrete persistence model, not as the competency definition.

### Agent memory

#### Anthropic — Effective context engineering for AI agents

https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

Verified section:

- **Context engineering for long-horizon tasks**, especially **Structured note-taking**.

The source describes persistent notes outside the current context window that can be loaded into later contexts. This supports the distinction between current inference context and persistent memory.

#### LangGraph — Persistence

https://docs.langchain.com/oss/python/langgraph/persistence

Verified distinction:

- thread-scoped checkpoint state;
- cross-thread application-defined durable storage.

This provides a useful concrete example for separating resumable workflow state from longer-lived user/fact/shared memory.

#### Packer et al. — MemGPT: Towards LLMs as Operating Systems

https://arxiv.org/html/2310.08560v2

Verified sections:

- **1 Introduction**
- **2 MemGPT (MemoryGPT)**
- **2.1 Main context (prompt tokens)**
- **2.2 Queue Manager**
- **3.1 MemGPT for conversational agents**
- **3.1.1 Deep memory retrieval task**

The paper separates information currently in the prompt from external persistent context and evaluates whether retrieving older information improves multi-session consistency.

The route should extract:

- finite current context versus persistent storage;
- explicit movement/retrieval of information back into context;
- the need to evaluate whether memory actually improves behavior.

It should **not** teach the MemGPT architecture as the default design.

## Proposal

Create a two-competency **Agent State + Memory Slice** before Planning.

The progression is:

```text
agentic or long-running need justified
→ explicit state schema
→ durable event/checkpoint record
→ restart/resume
→ state transition evidence
→ memory need justified
→ scope + write policy
→ retrieve into context
→ correction / deletion / freshness
→ evaluate benefit and harm
→ decide what persists where
```

## 1. `agents.state`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- design judgment

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `agents.deterministic-vs-agentic`
- `ai.context-engineering`

The first prerequisite ensures stateful complexity is only added after the learner can justify an agentic/long-running workflow. The second provides the distinction between durable state and the subset projected into current model context.

### Boundary with adjacent competencies

`agents.state` should **not** absorb:

- `ai.context-engineering` — context is what the model sees now; state can exist durably outside that window;
- `agents.memory` — memory stores reusable knowledge across interactions; state records execution progress and control-relevant facts for a run/session;
- `agents.long-running` — state persistence is a mechanism required by long-running operation, while scheduling, leases, heartbeats, and operational orchestration remain a broader later competency;
- `production.observability` — traces/logs provide operational evidence, while state is application/runtime data required to resume or decide the next action;
- `systems.databases-storage` — a database may implement state persistence, but storage internals are not the competency.

### State categories

The route may model state such as:

- run/session identity;
- goal / task contract;
- current phase or step;
- completed steps;
- pending work;
- tool/action results needed later;
- approvals / human decisions;
- retry counts or failure state;
- artifact references;
- last durable checkpoint/event;
- terminal status.

The exact schema depends on the workflow.

### Observable outcomes

The learner should be able to:

- distinguish durable execution state, current model context, external environment state, and long-term memory;
- define an explicit state schema instead of relying on the transcript as implicit state;
- choose snapshot/checkpoint, event-log, or hybrid persistence based on resume/debug needs;
- define state ownership and valid transitions;
- persist enough information to resume after model, harness, or process interruption;
- reconstruct or inspect how a run reached its current state;
- keep already-completed side effects from being repeated incorrectly after resume;
- version state and handle one compatible or breaking state-schema change;
- project only the state needed for the next model call into context;
- test restart, resume, and corrupted/stale-state behavior.

### Required evidence

Extend the Knowledge Assistant with one multi-step or interruptible workflow whose complexity has already been justified.

Required evidence:

- state schema/version;
- state-versus-context inventory;
- transition diagram or transition table;
- checkpoint or event-log strategy;
- durable run/session identifier;
- trace of normal multi-step progression;
- injected interruption/crash after at least one completed step;
- successful resume without repeating an already-completed side effect;
- one stale/corrupt/incompatible-state case;
- one state-schema migration decision;
- decision explaining why transcript-only state would be insufficient.

A workflow that only succeeds in one uninterrupted process is not sufficient evidence.

## 2. `agents.memory`

**Proposed level:** L3

**Competency types:**

- engineering skill
- design judgment
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `agents.state`
- `ai.context-engineering`
- `ai.evaluation`

Memory is proposed after State because the learner must first distinguish resumable execution data from reusable knowledge. Evaluation is required because memory can help or harm depending on write and retrieval policy.

### Boundary with adjacent competencies

`agents.memory` should **not** become:

- full conversation history retention;
- a vector database tutorial;
- ordinary RAG over a product document corpus;
- agent execution state;
- user profile storage without lifecycle or privacy rules;
- "store everything and retrieve top-k."

A memory system should have an explicit reason to persist information and an explicit rule for when that information is read back into context.

### Memory dimensions

The route should reason explicitly about:

- **scope** — task, thread, user, team/org, global;
- **content type** — facts/preferences, episodic events, learned procedures/notes, references to artifacts;
- **write policy** — what is worth remembering and who/what may write it;
- **read policy** — when and how memory is retrieved;
- **provenance** — where the memory came from;
- **freshness** — when it was observed/updated and whether it can expire;
- **conflict** — what happens when new information contradicts stored memory;
- **correction/deletion** — how memories are updated or forgotten;
- **isolation** — which identity/tenant may access it;
- **context projection** — what subset is brought into the current model call.

### Observable outcomes

The learner should be able to:

- distinguish state, current context, RAG corpus knowledge, and long-term agent memory;
- justify what information should be remembered instead of retained in the current context or recomputed;
- define memory scope, schema, provenance, freshness, write rules, and retrieval rules;
- evaluate memory retrieval on tasks that genuinely require prior-session information;
- measure both benefit and harm from memory;
- detect and correct stale, conflicting, or false memories;
- support update and deletion rather than append-only accumulation;
- prevent cross-user or cross-tenant memory leakage;
- choose simple structured/file/key-value memory when sufficient instead of defaulting to embeddings/vector search;
- record when a memory is loaded into context and how it influenced behavior.

### Required evidence

Use the same Knowledge Assistant lineage, but add a scenario that genuinely spans interactions or sessions.

The learner must compare:

1. no persistent memory;
2. a simple explicit memory policy;
3. at least one alternative write/read policy.

Required evidence:

- memory schema and scope;
- write criteria;
- read/retrieval criteria;
- provenance and freshness fields;
- multi-session evaluation cases;
- benefit metric or task-success delta;
- harmful/irrelevant-memory cases;
- stale/conflicting memory test;
- correction/update test;
- deletion/forgetting test;
- cross-user/tenant isolation test where identity exists;
- context projection trace showing which memories were loaded;
- decision on whether the memory system is worth keeping.

Memory should be rejected if the measured benefit does not justify its complexity or if harmful recall cannot be controlled.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/state-and-memory/`

This package should extend the same project rather than create a separate toy agent.

Proposed progression:

```text
existing tool-enabled assistant
→ justify one interruptible / multi-step workflow
→ explicit run state
→ durable checkpoint/event history
→ interruption + resume test
→ multi-session information need
→ explicit memory policy
→ memory write/read
→ stale/conflict/correction/deletion tests
→ no-memory vs memory evaluation
→ keep / change / remove decision
```

Proposed artifacts:

- state schema;
- transition record;
- interruption/resume experiment;
- state migration record;
- memory schema;
- memory write/read policy;
- multi-session memory eval;
- stale/conflict/correction/deletion traces;
- isolation test;
- state-vs-memory-vs-context decision record.

## Promotion gate

Neither node should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact source locators are rechecked during route authoring;
4. competency YAML + learner README are complete;
5. learner-facing source blocks are generated and current;
6. Knowledge Assistant evidence integration is inspectable;
7. State practice includes interruption/resume and duplicate-side-effect protection;
8. Memory practice includes no-memory baseline, multi-session evidence, stale/conflict/correction/deletion cases, and harmful-memory evaluation;
9. prerequisite-cycle validation passes;
10. seeded-state validation passes;
11. final `make check` / CI passes;
12. review outcome is recorded before promotion.

## Alternatives considered

### Merge state and memory into one competency

Rejected. Resumable execution state and reusable long-term knowledge have different lifecycle, scope, correctness, and evaluation requirements.

### Treat conversation history as state

Rejected. A transcript can be evidence, but it is a poor implicit control-state contract and may be compacted or omitted from the current context.

### Treat the current context window as durable state

Rejected. Durable session/state should survive context trimming, compaction, model changes, and process restarts.

### Treat all persisted information as memory

Rejected. Checkpoints, event logs, user preferences, task artifacts, and product knowledge serve different purposes and should not share one undifferentiated lifecycle.

### Default memory to a vector database

Rejected. Structured or key-value memory may be more precise, cheaper, and safer for many facts/preferences. Retrieval method should follow memory type and access requirements.

### Store everything forever

Rejected. Unbounded retention creates stale/conflicting data, privacy risk, storage cost, and context noise. Memory requires update, deletion, and scope rules.

### Teach one persistence framework

Rejected. LangGraph is useful as a concrete checkpointer/store distinction, but the capability must survive framework changes.

## Impact

- affected competencies:
  - `agents.state`
  - `agents.memory`
- proposed prerequisites:
  - `agents.state` ← `agents.deterministic-vs-agentic`, `ai.context-engineering`
  - `agents.memory` ← `agents.state`, `ai.context-engineering`, `ai.evaluation`
- new resources:
  - `docs.google-adk-session-state-memory`
  - `docs.google-adk-state`
  - `docs.google-adk-memory`
  - `docs.temporal-overview`
  - `article.anthropic-managed-agents`
  - `article.anthropic-long-running-harnesses`
  - `docs.langgraph-persistence`
  - `paper.memgpt`
- reused resource:
  - `article.anthropic-context-engineering`
- proposed project integration:
  - Knowledge Assistant state-and-memory evidence package
- catalog/generated status:
  - **no promotion before review and seeded validation**

## Review checklist

- [ ] Evidence is traceable and source locators are specific enough to author routes.
- [ ] State is distinct from model context, memory, environment state, and observability.
- [ ] Memory is distinct from run/session state and ordinary RAG corpus retrieval.
- [ ] Proposed prerequisite graph is acyclic.
- [ ] State evidence includes injected interruption and successful resume.
- [ ] State evidence prevents duplicate side effects after resume.
- [ ] Memory evidence includes a no-memory baseline.
- [ ] Memory has explicit scope, provenance, freshness, write, read, update, and deletion rules.
- [ ] Harmful/stale/conflicting memory is evaluated, not only successful recall.
- [ ] Cross-user or tenant isolation is tested where identities exist.
- [ ] Framework examples do not redefine the competencies.
- [ ] Knowledge Assistant integration extends existing evidence lineage.
- [ ] Reviewer explicitly approves or requests changes before promotion.
