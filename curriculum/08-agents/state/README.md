# Agent State

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Google ADK — Conversational Context: Session, State, and Memory](https://adk.dev/sessions/) | Section "Core Concepts", especially the distinction among Session, State, and Memory | Establish a clean boundary between one conversation thread, mutable session state, and cross-session memory. |
| [Google ADK — State: The Session's Scratchpad](https://adk.dev/sessions/state/) | Sections "What is session.state?", "Key Characteristics of State", and "How State is Updated: Recommended Methods" | Study serializable mutable state and tracked state updates as one concrete implementation model. |
| [LangGraph — Thinking in LangGraph](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph) | Sections "Step 3: Design your state", "What belongs in state?", "Keep state raw, format prompts on-demand", the interrupt/checkpointer example, and "Advanced considerations — Node granularity trade-offs" | Learn to keep raw execution data in state, derive prompt/context views on demand, and connect checkpoint granularity to recovery behavior. |
| [Temporal Documentation — Durable Execution](https://docs.temporal.io/) | Documentation overview describing durable execution and resuming where execution left off after crashes, network failures, or infrastructure outages | Ground recovery semantics in a production durable-execution model without requiring Temporal. |
| [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | Sections "The long-running agent problem", "Incremental progress", and "Getting up to speed" | See why context compaction alone is insufficient and how durable progress artifacts allow fresh contexts to continue work. |
<!-- learning-sources:end -->

## Why this matters

An agent can have a perfect prompt and still fail operationally if the process crashes and no one knows which step already happened.

State answers:

- what execution is this?
- what has completed?
- what is pending?
- what must survive a restart?
- what side effects already occurred?
- what is the next legal transition?

Current model context is only a projection of that information.

## 1. Diagnostic first

For one multi-step Knowledge Assistant workflow, classify information into:

- durable execution state;
- event history;
- current model context;
- observability data;
- external environment state;
- long-term memory.

Then define the crash case where a tool side effect succeeds but the process stops before the next step.

If you cannot resume that case without guessing or duplicating the action, state is still a gap.

## 2. Mental model

Use the Learning sources table above.

Keep this boundary:

```text
durable state
→ determines execution continuity

context
→ the subset formatted for this inference

history / logs
→ evidence of what happened

memory
→ reusable information for later interactions
```

Do not use the transcript as the control-state machine.

## 3. Independent practice

Use the [State and Memory evidence contract](../../../projects/knowledge-assistant/state-and-memory/).

Add:

- state schema/version;
- transition table;
- durable run ID;
- checkpoint or event strategy;
- side-effect correlation/idempotency;
- interruption injection;
- restart/resume path.

## 4. Failure work

Test:

- crash after a successful side effect;
- stale or corrupt state;
- incompatible state version;
- checkpoint too early or too late;
- derived data persisted unnecessarily;
- context missing a state field that is actually required for the next step.

Measure repeated work after recovery.

## 5. Exit evidence

You are at **demonstrated** when another engineer can kill the workflow, restart it, inspect the durable state, and observe it continue from the correct transition without repeating completed side effects.

A long conversation transcript is not sufficient evidence.

## 6. Transfer

Apply the same state/recovery design to a workflow with different side effects or checkpoint costs.

## 7. Applied evidence

Applied evidence is a real workflow where explicit state prevents lost progress, duplicate actions, or unrecoverable runs and where schema evolution is handled deliberately.
