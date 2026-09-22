# Planning

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Sections "Workflow: Orchestrator-workers", "Agents", "Combining and customizing these patterns", and "Summary" | Distinguish predictable workflow decomposition from dynamic task decomposition and keep complexity tied to measurable need. |
| [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) | Sections "Scaling to full-stack coding" → "The architecture" (Planner), "Iterating on the harness", and "Removing the sprint construct" | Study planner granularity, under-scoping, cascading assumptions, and ablation of planner/decomposition scaffolding as model capability changes. |
| [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) | Sections "What is an agent?", "Configuring instructions", "Orchestration", and "Single-agent systems" | Ground planning in executable workflow control, explicit steps/branches, completion conditions, and single-agent-first architecture. |
<!-- learning-sources:end -->

## Why this matters

Planning is not a request for hidden reasoning. It is an external execution artifact that helps a stateful system decide what to do next and when the original assumptions are no longer valid.

A useful plan is inspectable, updateable, and removable.

## 1. Diagnostic first

For one Knowledge Assistant task, decide whether you need:

- direct execution;
- a static plan;
- adaptive planning.

Then define one event that should invalidate the current plan.

If your only justification is "the task is complex," the planning need is not yet specific enough.

## 2. Mental model

Keep this distinction:

    hidden model reasoning
    ≠
    inspectable execution plan

    plan
    → stored in / referenced by durable state
    → updated from real tool/environment results
    → revised when assumptions fail

Do not preserve chain-of-thought as curriculum evidence.

## 3. Independent practice

Use the [Planning and Verification evidence contract](../../../projects/knowledge-assistant/planning-and-verification/).

Compare:

1. no explicit plan;
2. static plan;
3. adaptive plan.

Keep the task set and tools fixed.

## 4. Failure work

Inject:

- a failed dependency;
- missing required information;
- a changed environment condition; or
- a false initial assumption.

Preserve the evidence that triggered replanning.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the plan artifact, replay the task, see the assumption become invalid, and understand why the plan changed.

A generated todo list that is never consulted or updated is not enough.

## 6. Transfer

Move to a task with a different dependency graph and decide whether planning should be coarser, finer, or removed.

## 7. Applied evidence

Applied evidence is a real workflow where explicit planning measurably improves execution or failure recovery—or an evidence-based decision to remove planner scaffolding because it no longer adds enough value.
