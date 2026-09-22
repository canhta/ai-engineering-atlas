# Multi-Agent Systems

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | Sections "Benefits of a multi-agent system", "Architecture overview for Research", "Prompt engineering and evaluations for research agents", "Effective evaluation of agents", and "Production reliability and engineering challenges" | Study a production multi-agent system that gains breadth from parallel specialist contexts while exposing token, delegation, evaluation, and reliability costs. |
| [OpenAI Agents SDK — Agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/) | Sections "Core SDK patterns", "Orchestrating via LLM", and "Orchestrating via code", especially agents-as-tools versus handoffs | Compare manager ownership, handoff ownership, and code-controlled versus model-controlled delegation without treating one SDK as the competency. |
| [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Sections "Workflow: Orchestrator-workers", "Agents", "Combining and customizing these patterns", and "Summary" | Keep multi-agent topology downstream of simpler workflow patterns and require measurable benefit before adding coordination complexity. |
<!-- learning-sources:end -->

## Why this matters

Multi-agent architecture is useful only when separate agent roles or context windows solve a concrete limitation that a simpler orchestration cannot solve as well.

Start with:

```text
single-agent orchestration baseline
→ measured limitation
→ justified agent boundary
→ coordination contract
→ failure work
→ aggregate verification
→ topology ablation
```

More named agents is not evidence of a better system.

## 1. Diagnostic first

Take one existing Knowledge Assistant orchestration.

For every proposed specialist, explain:

- what independent objective it owns;
- what context or tools it needs;
- why a tool/prompt branch is insufficient;
- who owns the final answer;
- what happens if it fails;
- what measurable outcome would justify keeping it.

If these answers are vague, keep the single-agent baseline.

## 2. Mental model

Use the Learning sources table above.

Keep these patterns distinct:

```text
manager / agents-as-tools
→ manager retains final control

handoff
→ specialist becomes the active owner

orchestrator-workers
→ lead decomposes work, workers execute, lead aggregates
```

The topology should follow task ownership and context boundaries, not framework fashion.

## 3. Independent practice

Use the [Multi-Agent evidence contract](../../../projects/knowledge-assistant/multi-agent/).

Preserve the same task set and the single-agent orchestration baseline.

Introduce one justified multi-agent topology and record every boundary, budget, context-sharing rule, and delegation event.

## 4. Failure work

Test:

- duplicate delegation;
- delegation coverage gap;
- conflicting specialist conclusions;
- specialist timeout/failure;
- runaway recursive delegation;
- aggregate verification failure.

Measure coordination failures, not only final-answer quality.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the topology and delegation traces, reproduce a specialist failure or conflict, verify the aggregate result, and compare the topology against the single-agent baseline on quality and cost.

A diagram with several agents is not enough.

## 6. Transfer

Move to a task with different parallelism, context-sharing, specialization, or permission constraints and redesign the topology.

## 7. Applied evidence

Applied evidence is a real multi-agent topology that measurably earns its coordination overhead—or an evidence-based decision to collapse back to a simpler architecture.
