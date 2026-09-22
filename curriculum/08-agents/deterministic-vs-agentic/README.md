# Deterministic vs Agentic Design

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

Agentic systems add flexibility, but also cost, latency, non-determinism, and a larger failure surface.

The competency is not "know agent patterns." It is the engineering judgment to increase autonomy only when a simpler design measurably fails the task.

## 1. Diagnostic first

Given a task, decide among:

- one model call;
- fixed workflow;
- workflow with bounded model decisions;
- autonomous agent loop.

Explain:

- whether the steps are known in advance;
- whether later steps depend on unpredictable environment results;
- how success is measured;
- what evidence would justify more autonomy;
- what stop and permission boundaries are required.

## Prerequisite check

Patch only the blocking capability:

- **Evaluation** — if you cannot compare two architectures on the same task set, use [AI Evaluation and Experimentation](../../07-ai-engineering/evaluation/).
- **Tool calling** — use Anthropic's **Building block: The augmented LLM** and **Appendix 2: Prompt engineering your tools** in [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents). Be clear about what the model proposes versus what application code executes.
- **Testing** — use [Made With ML — Testing](https://madewithml.com/courses/mlops/testing/) to review regression/system testing before comparing workflow failures.

Do not let a prerequisite patch turn into framework study.
## 2. Mental model

Primary source:

- Anthropic — [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

Focus on:

- **What are agents?** — workflow vs agent distinction;
- **When (and when not) to use agents** — simplest-solution and trade-off principle;
- **Building blocks, workflows, and agents** — chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer, agent loops;
- **Combining and customizing these patterns** — measure and add complexity only when outcomes improve.

The article notes that parts of the tooling landscape have changed since publication; this route uses its architecture/decision framework, not its tooling list.

## 3. Independent practice

Complete the [Workflow vs Agent Lab](../../../labs/agentic-design/).

Use a real task when possible and evaluate the baseline and agentic design on the same task set.

## 4. Exit evidence

You are at **demonstrated** when you can:

- start from a simple baseline;
- identify measured failures that justify additional autonomy;
- choose an architecture based on task structure;
- compare task success, cost, latency, and failure types;
- bound tools and stopping conditions;
- explicitly reject agentic complexity when it is not justified.

## 5. Transfer

Choose architectures for:

1. a task whose subtasks and branches are known in advance;
2. a task whose next steps depend on intermediate tool/environment results.

Explain why different autonomy levels may be appropriate.

## 6. Applied evidence

Use this decision in the [Knowledge Assistant](../../../projects/knowledge-assistant/) Milestone 6 or another real system.

Keep the baseline, failure analysis, traces, and comparison that justified the final architecture.
