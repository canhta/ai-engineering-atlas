# AI Workflow Orchestration

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Sections "Workflow: Routing", "Workflow: Parallelization", "Workflow: Orchestrator-workers", "Workflow: Evaluator-optimizer", "Agents", and "Combining and customizing these patterns" | Learn the core flow patterns and select the simplest orchestration pattern from task structure. |
| [OpenAI Agents SDK — Agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/) | Page introduction defining orchestration plus sections "Orchestrating via LLM" and "Orchestrating via code", including manager-style agents-as-tools, handoffs, chaining, evaluator loops, and parallel execution | Compare model-controlled and code-controlled orchestration and treat manager/handoff patterns as optional implementations rather than the capability definition. |
| [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) | Sections "Orchestration" and "Single-agent systems" | Reinforce single-agent-first architecture and incremental complexity when orchestration or delegation is justified. |
<!-- learning-sources:end -->

## Why this matters

Orchestration is not "use many agents."

It is the control problem:

```text
what runs next?
what runs conditionally?
what can run in parallel?
who decides?
what happens when one branch fails?
how are results combined and verified?
```

Use code for known/testable branch conditions by default. Give the model control only where task structure genuinely cannot be known ahead of time.

## 1. Diagnostic first

Take one Knowledge Assistant workflow and classify each flow decision as:

- code-controlled;
- model-controlled;
- hybrid.

Then identify any two tasks you believe can run in parallel and prove they do not depend on each other's outputs.

## 2. Mental model

Keep this distinction:

```text
planning
→ intended work structure

orchestration
→ runtime flow control

multi-agent
→ optional topology for delegated/specialized execution
```

You can orchestrate one agent, many model calls, tools, or deterministic stages without creating a multi-agent system.

## 3. Independent practice

Use the [Runtime and Orchestration evidence contract](../../../projects/knowledge-assistant/runtime-and-orchestration/).

Preserve a simpler single-flow baseline.

Add one justified:

- routing problem;
- parallel fan-out/fan-in problem; or
- dynamic subtask problem.

## 4. Failure work

Inject:

- wrong route;
- branch timeout;
- branch failure;
- partial fan-out completion;
- aggregation/fan-in verification failure.

Record whether siblings cancel, retry, degrade, or continue.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the orchestration graph, see who owns each decision, reproduce a branch failure, and verify the aggregate outcome.

A multi-agent diagram without measurable orchestration benefit is not enough.

## 6. Transfer

Move to a workflow with different branch uncertainty, concurrency opportunities, or failure-containment requirements.

## 7. Applied evidence

Applied evidence is a workflow where orchestration measurably improves task success, latency, or maintainability relative to a simpler flow—or an evidence-based decision to remove orchestration complexity.
