# RFC: Long-Running Agents and Orchestration Slice

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The agent path now has ready routes for:

- deterministic versus agentic design;
- durable state;
- memory;
- planning;
- verification.

The next two catalog nodes are still `coverage`:

- `agents.long-running`
- `agents.orchestration`

These capabilities are frequently collapsed into "put the agent in a loop" or "use multiple agents."

That hides two different engineering problems.

```text
long-running
= how work survives time, pauses, failures, and process boundaries

orchestration
= how execution flow is selected, sequenced, branched, parallelized,
  bounded, and recovered
```

A long-running workflow may be mostly deterministic. An orchestrated workflow may complete in seconds. Multi-agent topology is one possible orchestration pattern, not the definition of orchestration.

This RFC proposes a two-competency slice before any Multi-Agent Systems route.

## Evidence

### Anthropic — Effective harnesses for long-running agents

https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

Verified sections:

- **The long-running agent problem**
- **Incremental progress**
- **Getting up to speed**
- **Future work**

The production experiment shows several recurring long-horizon failure modes:

- tasks exceed one context window;
- compaction alone does not preserve enough operational continuity;
- an agent may attempt too much in one session and leave partial work;
- later sessions may spend time reconstructing work or incorrectly conclude that the task is complete;
- durable external artifacts such as progress records, tests, and repository state help new sessions continue incrementally.

The curriculum should extract the lifecycle and recovery principles rather than require the specific coding harness.

### Anthropic — Scaling Managed Agents: Decoupling the brain from the hands

https://www.anthropic.com/engineering/managed-agents

Verified sections include:

- **Decouple the brain from the hands**
- **Recovering from harness failure**
- **Many brains, many hands**
- **Conclusion**

The source separates:

- durable session/event state;
- a replaceable harness/runtime loop;
- replaceable execution environments/tools.

It demonstrates an important long-running property: the process that reasons or executes can fail and be replaced without making the durable session itself disappear.

This is useful production evidence for keeping durable run state outside ephemeral workers and for designing stable interfaces between reasoning, execution, and session state.

### Temporal — Durable Execution

https://docs.temporal.io/

The Temporal documentation describes durable execution as resuming application execution after crashes, network failures, or infrastructure outages, including workflows lasting days or longer.

This supports the runtime boundary for `agents.long-running`:

- persistence is not just saving a transcript;
- work must resume from a defined execution state;
- waits and retries can span process restarts;
- long duration increases the need for explicit cancellation, timeout, and retry semantics.

Temporal remains a production reference, not a required framework.

### OpenAI Agents SDK — Running agents

https://openai.github.io/openai-agents-python/running_agents/

Verified sections include:

- **Runner lifecycle and configuration**
- **The agent loop**
- **State and conversation management**
- **Durable execution integrations and human-in-the-loop**
- **Exceptions**

The documentation exposes several runtime controls relevant to long-running execution:

- explicit turn limits;
- resumable run state;
- persistent sessions;
- pause/resume around approval;
- durable-runtime integrations for long waits, retries, process restarts, and human-in-the-loop workflows.

The route should extract these lifecycle controls rather than teach the SDK API.

### OpenAI Agents SDK — Results / Run State

https://openai.github.io/openai-agents-python/results/

Verified section:

- **Interruptions and run state**

The documentation shows that interrupted runs can be serialized and resumed, but also documents recovery boundaries where replay can become unsafe after terminal effects.

This is useful evidence for a central curriculum point: "resumable" does not mean every state can be replayed safely. The learner must define which boundaries are recoverable and which require a new run or operator intervention.

### Anthropic — Building Effective Agents

https://www.anthropic.com/engineering/building-effective-agents

Verified workflow sections:

- **Workflow: Routing**
- **Workflow: Parallelization**
- **Workflow: Orchestrator-workers**
- **Workflow: Evaluator-optimizer**
- **Agents**
- **Combining and customizing these patterns**

The source provides a practical orchestration vocabulary:

- deterministic routing;
- independent parallel work;
- dynamic orchestrator-worker decomposition;
- evaluator/optimizer loops;
- open-ended agent loops.

It repeatedly recommends using the simplest pattern that satisfies the task.

### OpenAI Agents SDK — Agent orchestration

https://openai.github.io/openai-agents-python/multi_agent/

Verified sections include:

- orchestration definition: which agent/process runs, in what order, and how the next step is decided;
- **Orchestrating via LLM**
- code-controlled orchestration;
- manager-style "agents as tools";
- handoffs.

The key curriculum use is not "build multiple agents."

The source explicitly distinguishes:

1. model-directed flow decisions;
2. code-directed flow decisions;
3. mixed approaches.

That distinction maps directly to the existing deterministic-versus-agentic principle and gives concrete evidence that orchestration is a control-flow decision, not a synonym for multi-agent systems.

### OpenAI — A practical guide to building agents

https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

Verified sections:

- **Orchestration**
- **Single-agent systems**
- guidance to incrementally add complexity.

This reinforces the single-agent-first boundary: orchestration may remain inside one agent/workflow until specialization or delegation creates measurable value.

## Proposal

Create a two-competency **Long-Running + Orchestration Slice** after State/Planning/Verification and before Multi-Agent Systems.

```text
stateful verified workflow
→ define runtime lifecycle and execution budget
→ persist progress outside ephemeral workers
→ pause / wait / resume
→ retry or recover without duplicate effects
→ cancel / timeout / escalate
→ choose orchestration control model
→ route / branch / parallelize only when task structure justifies it
→ bound concurrency and failure propagation
→ verify aggregate outcome
→ compare simpler flow against orchestrated flow
```

## 1. `agents.long-running`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `agents.state`
- `agents.verification`
- `agents.deterministic-vs-agentic`

`agents.planning` is intentionally not a hard prerequisite. A durable workflow can be long-running even when its steps are predetermined.

### Boundary with adjacent competencies

`agents.long-running` should **not** absorb:

- `agents.state` — state defines execution continuity; long-running adds runtime lifecycle over long waits/failures;
- `agents.planning` — plans may evolve during a long run, but adaptive planning is not required for every long-running workflow;
- `agents.orchestration` — orchestration chooses and coordinates flow; long-running makes that flow durable over time;
- `agents.memory` — memory is reusable information across interactions, not the durable run lifecycle;
- `production.observability` — observability explains behavior; it does not by itself provide recovery semantics;
- `agents.multi-agent` — a single agent can run for hours or days.

### Runtime lifecycle model

A long-running run should have explicit lifecycle semantics such as:

```text
created
→ runnable
→ running
→ waiting / paused
→ running
→ completed

and failure exits such as:

running → retrying
running → blocked
running → cancelled
running → timed-out
running → failed
```

The exact state machine is product-dependent.

### Observable outcomes

The learner should be able to:

- define a durable run identity and lifecycle states;
- distinguish model turns from the longer-lived job/workflow;
- persist progress outside ephemeral model/runtime processes;
- define pause/resume behavior for long waits or human approval;
- define retry boundaries and identify unsafe replay points;
- make external side effects idempotent or otherwise replay-safe;
- set execution budgets such as time, turns, model/tool calls, or cost;
- define cancellation, timeout, and escalation behavior;
- resume after worker/process loss without losing accepted progress;
- avoid concurrent resume or duplicate ownership of the same run;
- record partial progress so a new worker/context can continue safely;
- verify completion against explicit outcome criteria instead of "the run stopped";
- compare a simple synchronous execution model against a durable long-running design and justify the added operational complexity.

### Required evidence

Extend the existing Knowledge Assistant with one workflow that cannot reasonably be treated as one uninterrupted request.

Acceptable examples:

- waiting for human approval;
- waiting for external data or a delayed job;
- multi-stage research/update work with a deliberate pause;
- a simulated task lasting across worker restarts.

Evidence must include:

- run lifecycle/state model;
- durable run ID;
- execution budget;
- timeout/cancellation policy;
- pause/wait condition;
- serialized recovery boundary;
- worker/process restart;
- resume trace;
- one retryable failure;
- one non-retryable or escalation case;
- duplicate/concurrent-resume protection;
- side-effect replay/idempotency evidence where relevant;
- partial-progress artifact;
- final verification;
- latency/cost/extra-runtime-overhead comparison with a simpler baseline.

A background loop that merely keeps calling the model until it says "done" is not sufficient evidence.

## 2. `agents.orchestration`

**Proposed level:** L3

**Competency types:**

- engineering skill
- system operation
- design-judgment

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `agents.deterministic-vs-agentic`
- `agents.state`
- `agents.planning`
- `agents.verification`

### Boundary with adjacent competencies

`agents.orchestration` should **not** become:

- `agents.multi-agent` — multi-agent is one topology that orchestration may coordinate;
- `agents.planning` — planning chooses intended work structure; orchestration executes/control-routes that structure;
- `agents.long-running` — orchestration may be short-lived; durability over hours/days is a separate capability;
- a framework/DAG tutorial;
- "let the model choose everything";
- simple function calling without flow-level coordination.

### Orchestration control model

The learner should explicitly choose among:

```text
code-controlled
→ deterministic sequencing / routing / parallelism

model-controlled
→ model chooses next action or delegation

hybrid
→ deterministic outer policy with bounded model-directed decisions
```

The default remains: keep deterministic decisions in code when the branch condition is known and testable.

### Observable outcomes

The learner should be able to:

- model the workflow as explicit stages, branches, dependencies, and terminal conditions;
- distinguish plan structure from runtime orchestration decisions;
- choose code-controlled versus model-controlled routing from task uncertainty;
- parallelize only independent work;
- define fan-out/fan-in aggregation behavior;
- set concurrency and resource limits;
- define per-stage timeout, retry, and failure-containment behavior;
- decide whether one failure cancels, degrades, retries, or leaves sibling work running;
- preserve correlation and state across branches;
- verify aggregate output after parallel or delegated work;
- compare single-flow versus routed/parallel/orchestrated variants on the same task set;
- avoid multi-agent decomposition when the same benefit can be achieved with tools, deterministic branches, or one agent;
- make an explicit orchestration topology decision from measured quality, latency, cost, and operational complexity.

### Required evidence

Extend one existing Knowledge Assistant workflow with a justified orchestration problem.

The task should contain at least one of:

- mutually exclusive routing paths;
- two or more genuinely independent subtasks that can run in parallel;
- a dynamic subtask set whose shape depends on intermediate results.

Evidence must include:

- orchestration graph/state diagram;
- control owner for each branch: code or model;
- baseline simpler flow;
- branch/routing criteria;
- concurrency limit;
- fan-out/fan-in behavior where parallelism is used;
- timeout/retry policy per relevant stage;
- one branch failure injection;
- failure-containment result;
- aggregate verification;
- task success;
- latency/cost/model/tool-call count;
- one ablation that removes or simplifies orchestration;
- explicit decision to keep single-flow, use orchestration, or defer multi-agent architecture.

A diagram with several agents but no measured routing/parallelization benefit is not sufficient evidence.

## Relationship between the two competencies

The routes should interact but remain independently assessable.

```text
orchestration
= what should run next / together / conditionally

long-running
= how that execution survives time and failure
```

Examples:

- a deterministic approval workflow may be long-running but not meaningfully agentic;
- a 10-second fan-out/fan-in research workflow may be orchestrated but not long-running;
- a durable orchestrated workflow may require both.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/runtime-and-orchestration/`

The package should extend the same stateful, planned, verified Knowledge Assistant.

Proposed progression:

```text
existing stateful verified workflow
→ synchronous/simple baseline
→ introduce real wait/restart boundary
→ durable long-running run lifecycle
→ recovery / cancel / timeout / budget evidence
→ identify routing/parallelism problem
→ simple-flow baseline
→ orchestrated variant
→ branch failure injection
→ aggregate verification
→ ablate orchestration
→ keep / simplify / remove decision
```

Proposed artifacts:

- run-lifecycle contract;
- execution-budget record;
- wait/resume trace;
- cancellation/timeout trace;
- retry/replay-safety test;
- partial-progress record;
- orchestration graph;
- control-ownership record;
- concurrency/fan-in record;
- branch-failure trace;
- orchestration ablation;
- architecture decision.

## Promotion gate

Neither node should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact source locators are rechecked during route authoring;
4. proposed new resources are registered only after approval;
5. learner-facing source blocks are generated and current;
6. Knowledge Assistant runtime-and-orchestration package is inspectable;
7. Long-Running evidence includes wait/pause, process restart, resume, budget, cancellation/timeout, and replay-safety work;
8. Long-Running evidence includes final verification rather than run termination alone;
9. Orchestration preserves a simpler-flow baseline;
10. Orchestration identifies code-controlled versus model-controlled decisions explicitly;
11. parallel work, if used, demonstrates independence and bounded concurrency;
12. branch failure containment is tested;
13. Multi-Agent remains optional and out of scope for promotion;
14. prerequisite-cycle validation passes;
15. seeded-state validation passes;
16. learner-source rendering passes;
17. `site/src/data/atlas.json` is regenerated under the current content-model contract;
18. final `make check` / CI passes;
19. review outcome is recorded before promotion.

## Alternatives considered

### Merge Long-Running into Agent State

Rejected. State gives persistence and recovery primitives, while Long-Running adds job lifecycle, waits, ownership, budgets, cancellation, timeout, and operational recovery over extended time.

### Require Planning before Long-Running

Rejected. A durable deterministic workflow can wait for hours or days without adaptive planning. Planning may be integrated when the task requires it.

### Define Orchestration as Multi-Agent

Rejected. Routing, branching, parallel model/tool calls, evaluator loops, and code-controlled workflows are orchestration even with one agent. Multi-Agent should only be added when specialization or delegation produces measurable value.

### Always let the LLM choose the next step

Rejected. Known/testable branches belong in deterministic code by default. Model-directed orchestration should be justified by uncertainty in the task structure.

### Use a workflow framework as the competency

Rejected. Temporal, OpenAI Agents SDK, LangGraph, and similar systems are implementation examples. The capability contract is runtime/control-flow reasoning that transfers across frameworks.

### Keep retrying forever

Rejected. Long-running systems need explicit budgets, terminal states, and escalation/cancellation behavior.

### Parallelize everything

Rejected. Parallelism is useful only when subtasks are sufficiently independent and the fan-in/verification contract is clear. Otherwise it creates cost, race conditions, or conflicting state.

## Impact

- affected competencies:
  - `agents.long-running`
  - `agents.orchestration`
- proposed prerequisites:
  - `agents.long-running` ← `agents.state`, `agents.verification`, `agents.deterministic-vs-agentic`
  - `agents.orchestration` ← `agents.deterministic-vs-agentic`, `agents.state`, `agents.planning`, `agents.verification`
- reused resources:
  - `article.anthropic-long-running-harnesses`
  - `article.anthropic-managed-agents`
  - `docs.temporal-overview`
  - `article.anthropic-building-effective-agents`
  - `guide.openai-practical-agents`
- proposed new resources after approval:
  - `docs.openai-agents-running`
  - `docs.openai-agent-orchestration`
  - `docs.openai-agents-results`
- proposed project integration:
  - Knowledge Assistant `runtime-and-orchestration/` evidence package
- catalog/generated status:
  - **no promotion before review and seeded validation**
- presentation/site:
  - no new competency fields are proposed; existing presentation blocks should be sufficient.

## Implementation outcome

Approved and implemented on 2026-09-22.

- `agents.long-running` promoted to `ready` at L3.
- `agents.orchestration` promoted to `ready` at L3.
- Long-Running remains distinct from State: the route adds lifecycle, wait/resume, budget, timeout/cancellation, ownership, worker replacement, and unsafe-replay boundaries over durable execution state.
- Orchestration remains distinct from Planning and Multi-Agent Systems: each flow decision records code/model/hybrid ownership, and multi-agent topology remains optional.
- The Knowledge Assistant now includes a `runtime-and-orchestration/` evidence package in the same project lineage.
- Long-Running evidence requires a synchronous baseline, pause/resume across process loss, retry/non-retryable failure handling, concurrent-resume protection, replay-safe side effects, explicit runtime budgets, and final outcome verification.
- Orchestration evidence preserves a simpler-flow baseline, bounds concurrency, tests branch failure containment and fan-in behavior, and includes an orchestration ablation before any multi-agent decision.
- Three OpenAI runtime/orchestration sources were registered alongside existing Anthropic and Temporal sources.
- Learner-facing source blocks are generated from the route/resource contracts.
- `site/src/data/atlas.json` is generated from source-of-truth content under the v2 presentation/content-model contract and must not be edited by hand.
- Seeded-state validation passed before promotion.
- Promotion-state repository and site validation passed on latest `main`.
- Repository status is now 116 catalog competencies, 21 ready routes, and 95 coverage-only competencies; Agents has 7 ready routes.

## Review checklist

- [x] Evidence is traceable and locators are specific enough for route authoring.
- [x] Long-Running is distinct from State, Planning, Memory, Orchestration, and Observability.
- [x] Orchestration is distinct from Planning and Multi-Agent Systems.
- [x] Long-Running target depth L3 is appropriate.
- [x] Orchestration target depth L3 is appropriate.
- [x] Long-Running evidence includes pause/wait, process restart, resume, budgets, cancellation/timeout, and replay safety.
- [x] Long-Running completion requires outcome verification rather than run termination.
- [x] Orchestration requires a simpler baseline and explicit control ownership.
- [x] Code-controlled flow remains the default for known/testable branches.
- [x] Parallelism requires independent work, bounded concurrency, and explicit fan-in.
- [x] Branch failure containment is part of orchestration evidence.
- [x] Multi-Agent remains outside this RFC.
- [x] Knowledge Assistant integration extends the existing evidence lineage.
- [x] Reviewer explicitly approves or requests changes before promotion.
