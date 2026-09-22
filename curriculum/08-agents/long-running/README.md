# Long-Running Agents

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | Sections "The long-running agent problem", "Incremental progress", "Getting up to speed", and "Future work" | Study why context compaction alone is insufficient and how durable progress artifacts let fresh sessions continue long-horizon work. |
| [Scaling Managed Agents — Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents) | Sections "Decouple the brain from the hands", "Recovering from harness failure", "Many brains, many hands", and "Conclusion" | Separate durable session state from replaceable harness and execution processes and examine recovery after runtime failure. |
| [Temporal Documentation — Durable Execution](https://docs.temporal.io/) | Documentation overview of durable execution and resuming workflows after crashes, network failures, or infrastructure outages | Ground long-duration runtime semantics in a production durable-execution model without requiring Temporal. |
| [OpenAI Agents SDK — Running agents](https://openai.github.io/openai-agents-python/running_agents/) | Sections covering the agent loop and turn limits, state/conversation management, human-in-the-loop pause/resume, durable execution integrations, and exceptions | Inspect concrete runtime controls for bounded runs, interruptions, persisted state, and durable waits. |
| [OpenAI Agents SDK — Results and resumable run state](https://openai.github.io/openai-agents-python/results/) | Section "Interruptions and run state", including serialization/resume, failed resumed-session write recovery, and unrecoverable terminal-state boundaries | Study resumable snapshots together with explicit cases where replay after terminal effects is unsafe. |
<!-- learning-sources:end -->

## Why this matters

A workflow can have durable state and still fail operationally when it runs for hours, waits for approval, crosses worker restarts, or exhausts a budget.

Long-running runtime engineering answers:

- what survives process loss;
- how a paused run resumes;
- what can be retried;
- what must never be replayed;
- who owns the run;
- when the run must stop.

A process that simply stays alive is not durable execution.

## 1. Diagnostic first

Design a workflow that pauses for human approval and resumes in a different process.

Explain:

- durable run identity;
- persisted state;
- replay boundary;
- timeout/cancellation;
- execution budget;
- concurrent-resume protection.

If the recovery story depends on "the same process is still alive," this remains a gap.

## 2. Mental model

Use the Learning sources table above.

Keep the layers distinct:

```text
model turn
→ short-lived reasoning/execution step

worker/harness
→ replaceable process

durable run
→ persists lifecycle, accepted progress, and recovery state
```

Stopping is not the same as completing. Final success still requires verification.

## 3. Independent practice

Use the [Runtime and Orchestration evidence contract](../../../projects/knowledge-assistant/runtime-and-orchestration/).

Introduce one real or simulated long wait:

- human approval;
- delayed external job;
- scheduled resume;
- deliberate worker restart.

Preserve a simpler synchronous baseline.

## 4. Failure work

Test:

- worker/process loss;
- retryable failure;
- ambiguous side-effect commit;
- duplicate/concurrent resume;
- exhausted budget;
- timeout or cancellation;
- unrecoverable terminal replay.

## 5. Exit evidence

You are at **demonstrated** when another engineer can pause the run, replace the worker, resume safely, observe bounded retry/cancellation behavior, and verify the final outcome without duplicated side effects.

## 6. Transfer

Move to a workflow with different wait durations, side effects, budget constraints, or operator recovery requirements.

## 7. Applied evidence

Applied evidence is a production-like run lifecycle that preserves accepted work across failures and waits while bounding cost, preventing unsafe replay, and exposing explicit terminal behavior.
