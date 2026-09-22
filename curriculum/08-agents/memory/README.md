# Agent Memory

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Google ADK — Conversational Context: Session, State, and Memory](https://adk.dev/sessions/) | Section "Core Concepts", especially Session, State, and Memory | Establish the distinction between single-thread history/state and searchable information spanning past sessions. |
| [Google ADK — Memory: Long-term knowledge](https://adk.dev/sessions/memory/) | Sections "Memory: Long-term knowledge with MemoryService" and "The MemoryService role" | Study explicit memory ingestion and later search as a concrete cross-session memory interface. |
| [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Section "Context engineering for long-horizon tasks", especially "Structured note-taking" | Separate persistent external notes or memory from the smaller subset loaded into the current context. |
| [LangGraph — Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) | Persistence overview and the "Checkpointer vs. store" distinction | Compare thread-scoped checkpoint state with application-defined storage that can span threads. |
| [MemGPT — Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560) | Sections 1 "Introduction", 2 "MemGPT (MemoryGPT)", 2.1 "Main context (prompt tokens)", 2.2 "Queue Manager", 3.1 "MemGPT for conversational agents", and 3.1.1 "Deep memory retrieval task" | Study finite current context versus persistent external storage and the need to evaluate retrieval of older information without adopting the architecture as a default. |
<!-- learning-sources:end -->

## Why this matters

Long-term memory is useful only when the system remembers the right thing for the right scope and can later correct or forget it.

Do not start with:

```text
store every message
→ embed everything
→ retrieve top-k forever
```

Start with a product need and a lifecycle.

## 1. Diagnostic first

Classify candidate information as:

- execution state;
- current context;
- session history;
- product corpus;
- long-term memory candidate;
- information that should not be retained.

Then define:

- who/what owns the memory;
- why it deserves persistence;
- when it should be retrieved;
- when it becomes stale;
- how it is corrected;
- how it is deleted.

## 2. Mental model

Use the Learning sources table above.

Keep this distinction:

```text
state
→ continue this execution correctly

memory
→ reuse selected information in future interactions

context engineering
→ decide what state/memory/corpus information enters this inference
```

A vector database is one storage/retrieval mechanism, not the definition of memory.

## 3. Independent practice

Use the [State and Memory evidence contract](../../../projects/knowledge-assistant/state-and-memory/).

Add one cross-session use case such as a durable project convention, confirmed non-sensitive preference, or unresolved work item.

Do not use sensitive personal data in the reference exercise.

Compare:

1. no persistent memory;
2. one explicit write/read policy;
3. one alternative policy.

## 4. Failure work

Test:

- irrelevant memory;
- stale memory;
- conflicting memory;
- correction/update;
- deletion/forgetting;
- cross-user or cross-scope access where identity exists;
- relevant memory that should not be loaded for the current task.

Measure harmful recall, not only successful recall.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect:

- memory scope/schema;
- admission rule;
- provenance/freshness;
- retrieval rule;
- context projection;
- update/delete behavior;
- no-memory baseline;
- benefit and harm measurements.

A demo where the model remembers one earlier sentence is not enough.

## 6. Transfer

Move the policy to a system with different privacy, freshness, scope, or retention requirements.

## 7. Applied evidence

Applied evidence is a real memory policy that demonstrably improves cross-session behavior while controlling stale, harmful, or incorrectly scoped recall—or a measured decision to remove memory because it adds more risk/cost than value.
