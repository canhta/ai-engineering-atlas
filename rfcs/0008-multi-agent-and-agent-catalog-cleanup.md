# RFC: Multi-Agent Systems and Agent Catalog Cleanup

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The Agents domain now has ready routes for:

- deterministic versus agentic design;
- state;
- memory;
- planning;
- verification;
- long-running agents;
- orchestration.

Three catalog nodes remain at `coverage`:

- `agents.fundamentals`
- `agents.multi-agent`
- `agents.mcp`

They should not all be turned into routes simply because they exist in the catalog.

`agents.fundamentals` is now an umbrella label whose underlying capabilities are already represented by concrete ready nodes. It does not define an independent observable capability, prerequisite boundary, or exit evidence.

`agents.multi-agent` does define a distinct engineering decision:

```text
single-agent orchestration
→ identify a measured limitation
→ split work across independently operating agents
→ coordinate delegation / handoff / parallel work
→ aggregate and verify
→ measure coordination overhead
→ keep or revert the topology
```

`agents.mcp` is orthogonal. It is a protocol/integration capability whose current specification changed materially in the 2026-07-28 release. It should receive its own evidence review and RFC rather than being bundled into multi-agent architecture.

This RFC therefore proposes:

1. remove `agents.fundamentals` from the catalog instead of inventing a redundant route;
2. create a ready-route contract for `agents.multi-agent`;
3. leave `agents.mcp` at coverage for a separate protocol-focused slice.

## Evidence

### Internal curriculum evidence for removing `agents.fundamentals`

The repository's learning model defines progress around demonstrated capabilities, not topic labels.

The existing Agents domain now decomposes the broad "fundamentals" space into independently assessable capabilities:

- deterministic versus agentic control;
- durable state;
- memory;
- planning;
- verification;
- long-running runtime;
- orchestration.

Each has a distinct diagnostic, source route, practice contract, failure work, and exit evidence.

By contrast, `agents.fundamentals` currently has:

- no unique learner contract;
- no prerequisite role that cannot be expressed through the concrete nodes;
- no distinct exit evidence;
- only broad resource coverage.

Keeping it as a future route would violate the repository rule: do not create content merely because a directory or catalog node exists.

The proposed action is removal, not promotion.

### Anthropic — How we built our multi-agent research system

https://www.anthropic.com/engineering/multi-agent-research-system

Verified sections:

- **Benefits of a multi-agent system**
- **Architecture overview for Research**
- **Prompt engineering and evaluations for research agents**
- **Effective evaluation of agents**
- **Production reliability and engineering challenges**
- Appendix notes on end-state evaluation and long-horizon conversation management

The production case provides several curriculum boundaries.

#### When multi-agent helped

The system performed best on breadth-first research tasks with several independent directions that could be explored in parallel.

Subagents provided:

- separate context windows;
- separation of concerns;
- independent exploration trajectories;
- parallel tool use;
- compression of findings before returning them to the lead agent.

The article also reports significant performance gains on Anthropic's internal research evaluation for that workload.

This evidence is workload-specific. The route should not generalize it into "multi-agent is better."

#### When multi-agent did not fit

Anthropic explicitly notes that multi-agent systems are a poor fit when:

- agents need to share the same context heavily;
- subtasks have many dependencies;
- the task offers little real parallelism.

The article calls out many coding tasks as less parallelizable than research.

This is central to the competency: a learner should be able to reject multi-agent architecture.

#### Coordination cost

The article reports substantial token overhead and describes early failures such as:

- spawning far too many subagents;
- duplicated searches;
- gaps in delegation;
- excessive updates;
- poor tool selection.

It therefore recommends explicit task boundaries, effort budgets, and delegation instructions.

The curriculum should require coordination-budget evidence rather than counting the number of agents as progress.

#### Evaluation and reliability

Multi-agent trajectories are non-deterministic, so end-state or outcome evaluation is often more useful than requiring one prescribed path.

The production system also needed:

- durable execution;
- retries and checkpoints;
- tracing;
- observability of interaction patterns;
- careful deployment coordination.

These requirements reinforce the existing State, Verification, Long-Running, and Orchestration prerequisites.

### OpenAI Agents SDK — Agent orchestration

https://openai.github.io/openai-agents-python/multi_agent/

Verified sections:

- orchestration definition;
- **Orchestrating via LLM**
- **Core SDK patterns**
- **Orchestrating via code**
- manager-style agents-as-tools;
- handoffs.

The source distinguishes two common multi-agent topologies:

- a manager retains control and calls specialist agents as tools;
- a handoff transfers control to a specialist.

It also distinguishes model-directed flow from code-directed flow.

The curriculum use is architectural:

- who owns the user-facing interaction?
- who owns delegation?
- what context crosses the boundary?
- what guardrails/permissions remain centralized?
- when is the specialist merely a tool versus an independent active agent?

The route should not teach one SDK.

### OpenAI Agents SDK — Handoffs

https://openai.github.io/openai-agents-python/handoffs/

The handoff documentation shows delegation as an explicit transfer to a specialist agent with its own instructions and behavior.

This supports a boundary for the route:

```text
multiple model calls
≠ automatically multi-agent

multi-agent
= multiple independently configured agent roles/control contexts
  coordinated through explicit delegation/topology
```

A deterministic parallel map over the same agent prompt is orchestration, not necessarily a meaningful multi-agent architecture.

## Proposal

### A. Remove `agents.fundamentals`

Delete the catalog node and remove it from resource `covers` lists.

Do not create a replacement route.

The concrete ready routes are the actual curriculum.

This is a substantive catalog removal and therefore requires this RFC.

### B. Create `agents.multi-agent`

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

- `agents.orchestration`

No additional hard prerequisite is proposed.

`agents.orchestration` already carries the required state, planning, verification, and deterministic-versus-agentic graph.

`agents.long-running` is not a hard prerequisite because a multi-agent workflow may be short-lived.

`agents.memory` is not a hard prerequisite because agents may coordinate without persistent cross-session memory.

### Boundary with adjacent competencies

`agents.multi-agent` should **not** become:

- a synonym for orchestration;
- several model calls using the same role/prompt;
- parallel tool calls;
- a framework tutorial;
- an excuse to split every task into specialists;
- a requirement that every agent communicate peer-to-peer;
- a claim that more agents imply more capability.

The competency is the engineering ability to decide when multiple independently configured agents create measurable value and to control the coordination cost and failure modes that follow.

### Multi-agent topology model

The learner should be able to reason about at least:

#### Manager / agents-as-tools

```text
manager
├─ specialist A
├─ specialist B
└─ specialist C

manager retains final control
```

Useful when:

- one place should own the final answer;
- shared policy/guardrails should stay centralized;
- specialists are bounded subtasks.

#### Handoff / active-specialist transfer

```text
triage
→ specialist

specialist becomes active owner
```

Useful when:

- the specialist should directly own the next interaction;
- prompts/tools/permissions differ enough to justify a context switch.

#### Orchestrator-workers

```text
lead
├─ worker A
├─ worker B
└─ worker C
   ↓
aggregation
```

Useful when:

- subtasks are genuinely independent;
- separate context windows create value;
- breadth or specialization justifies the coordination overhead.

The exact topology is not prescribed.

### Observable outcomes

The learner should be able to:

- identify a measured limitation in the single-agent orchestrated baseline before adding agents;
- explain why each specialist is an independent agent rather than a tool/function/prompt branch;
- choose manager, handoff, orchestrator-worker, or another topology from task ownership and context needs;
- define each agent's objective, inputs, expected outputs, tools, permissions, and execution budget;
- define what context/state is shared and what remains isolated;
- write delegation contracts that avoid duplicated work and coverage gaps;
- bound the number of agents and total work;
- define termination conditions for parent and child agents;
- aggregate outputs with provenance back to the contributing agent/evidence;
- detect and resolve conflicting subagent conclusions;
- handle one subagent timeout/failure without silently corrupting the aggregate result;
- prevent recursive or runaway delegation;
- evaluate the final state/outcome without requiring one fixed trajectory;
- compare quality, latency, token/cost, tool calls, and coordination failures against the single-agent orchestration baseline;
- remove or collapse the multi-agent topology when specialization does not justify the overhead.

### Required evidence

Extend the Knowledge Assistant only with a task that has a plausible multi-agent advantage.

A suitable reference task is breadth-first research requiring several independent information tracks before synthesis.

Evidence must include:

- single-agent orchestration baseline;
- multi-agent topology diagram;
- justification for each agent boundary;
- per-agent objective and output contract;
- context/state sharing policy;
- tool/permission boundary per agent where relevant;
- per-agent and total execution budget;
- delegation trace;
- aggregate provenance;
- one duplicated-work or delegation-gap test;
- one conflicting-results case;
- one subagent failure/timeout case;
- runaway/recursive-delegation protection;
- aggregate outcome verification;
- quality;
- latency;
- token/cost;
- model/tool-call counts;
- coordination overhead;
- one ablation that merges/removes an agent;
- final decision: keep multi-agent, simplify topology, or return to single-agent orchestration.

A demo with several named agents but no measured baseline is not sufficient evidence.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/multi-agent/`

The package should extend the existing orchestrated Knowledge Assistant.

Proposed progression:

```text
single-agent orchestrated baseline
→ identify independent breadth/specialization gap
→ define agent boundaries
→ multi-agent variant
→ delegation / handoff trace
→ duplicate-work failure
→ conflicting-result failure
→ subagent failure
→ aggregate verification
→ cost / token / latency comparison
→ topology ablation
→ keep / simplify / revert decision
```

Proposed artifacts:

- multi-agent decision record;
- topology/ownership record;
- agent contract template;
- delegation trace;
- coordination-budget record;
- conflict-resolution trace;
- subagent-failure trace;
- aggregate-verification record;
- multi-agent ablation;
- architecture decision.

## Why MCP is not included

`agents.mcp` remains at `coverage`.

MCP is a protocol and integration capability, not a multi-agent topology.

The protocol also changed materially in the current `2026-07-28` specification, including the stateless core, discovery/capability behavior, authorization changes, extensions, and task lifecycle.

A correct MCP route therefore needs its own current-spec review and should not inherit assumptions from older session-oriented versions.

## Promotion gate

The catalog cleanup and Multi-Agent route should not be implemented until:

1. this RFC is reviewed;
2. the removal of `agents.fundamentals` is explicitly approved;
3. exact multi-agent source locators are rechecked during route authoring;
4. the Anthropic multi-agent production source is registered after approval;
5. the Multi-Agent competency YAML + learner README are complete;
6. learner-facing source blocks are generated;
7. Knowledge Assistant multi-agent evidence package is inspectable;
8. a single-agent orchestration baseline is preserved;
9. each agent boundary has an explicit reason;
10. context/state/tool/permission ownership is explicit;
11. delegation duplication/gap failure is tested;
12. conflicting results are tested;
13. subagent failure/timeout is tested;
14. runaway agent/delegation budgets are explicit;
15. aggregate verification is present;
16. quality, latency, token/cost, and coordination overhead are compared;
17. one topology ablation is performed;
18. prerequisite-cycle validation passes;
19. `curriculum/STATUS.md` is regenerated;
20. learner-source rendering passes;
21. `site/src/data/atlas.json` is regenerated through `scripts/build_site_data.py --write` and is never edited by hand;
22. `make check` and `make site-check` pass;
23. review outcome is recorded before promotion.

## Alternatives considered

### Create an Agent Fundamentals route

Rejected.

The node no longer names an independent capability. A route would mostly repeat the ready routes already present and violate the capability-first learning model.

### Keep Agent Fundamentals as an umbrella prerequisite

Rejected.

Prerequisites should name the smallest actual capability required. An umbrella prerequisite makes diagnostics and bridges less precise.

### Merge Multi-Agent into Orchestration

Rejected.

Orchestration covers control flow even in one-agent or deterministic systems. Multi-Agent adds independent agent roles/contexts, delegation semantics, coordination overhead, conflict, and topology decisions.

### Make Long-Running a prerequisite

Rejected.

Some useful multi-agent work is short-lived. Long-running runtime should be added only when the workflow actually crosses durable time/process boundaries.

### Require peer-to-peer communication

Rejected.

Manager, handoff, and orchestrator-worker topologies may be sufficient. Peer messaging is one optional design, not the competency.

### Require more agents for better performance

Rejected.

The route requires a single-agent baseline and topology ablation. Multi-agent architecture must earn its complexity through measured outcomes.

### Bundle MCP with Multi-Agent

Rejected.

MCP solves a protocol/integration problem and is currently evolving independently of multi-agent architecture. It deserves a separate route grounded in the current specification.

## Impact

### Catalog

If approved and fully implemented:

- remove `agents.fundamentals`;
- promote `agents.multi-agent` from `coverage` to `ready`;
- leave `agents.mcp` at `coverage`.

Expected repository counts after implementation:

- **115** catalog competencies;
- **22** ready routes;
- **93** coverage-only competencies;
- Agents domain: **9** competencies / **8** ready routes.

### Resources

After approval:

- add `article.anthropic-multi-agent-research-system`;
- reuse `docs.openai-agent-orchestration`;
- optionally add a specific OpenAI handoff resource only if route authoring needs a locator not covered well enough by the orchestration page;
- remove `agents.fundamentals` from existing resource `covers` lists.

### Project integration

Add a Knowledge Assistant `multi-agent/` evidence package and a measured multi-agent-decision milestone.

### MCP

No MCP content change in this RFC.

A subsequent RFC should use the current `2026-07-28` MCP specification rather than older session-oriented assumptions.

## Implementation outcome

Approved and implemented on 2026-09-22.

- Removed the redundant `agents.fundamentals` coverage node after confirming it had no prerequisite, project, progress, or ready-route dependents.
- Removed `agents.fundamentals` from the two resource `covers` lists that referenced the umbrella label.
- `agents.multi-agent` promoted to `ready` at L3 with `agents.orchestration` as its hard prerequisite.
- Multi-Agent remains downstream of a measured single-agent orchestration baseline; every independent agent boundary requires explicit task, context, tool, permission, and budget justification.
- The route requires duplicate/gap delegation failure work, conflicting-result handling, subagent timeout/failure containment, runaway-delegation limits, aggregate verification, cost/token/latency comparison, and topology ablation.
- The Knowledge Assistant now includes a `multi-agent/` evidence package in the same project lineage.
- Added Anthropic's production multi-agent research system as curriculum evidence and reused the existing OpenAI orchestration and Anthropic effective-agent sources.
- `agents.mcp` remains `coverage` for a separate current-spec protocol RFC.
- Generated learner sources, curriculum status, and content-model data were synchronized from the source contracts and validated by CI.
- Repository status is now 115 catalog competencies, 22 ready routes, and 93 coverage-only competencies; Agents has 9 competencies and 8 ready routes.

## Review checklist

- [x] `agents.fundamentals` is confirmed redundant and safe to remove.
- [x] Removal does not break prerequisites, projects, progress, or routes.
- [x] Multi-Agent is distinct from Orchestration.
- [x] Multi-Agent target depth L3 is appropriate.
- [x] A single-agent orchestration baseline is mandatory.
- [x] Each agent boundary requires measurable justification.
- [x] Context/state/tool/permission ownership is explicit.
- [x] Delegation duplication/gaps are evaluated.
- [x] Conflicting outputs are evaluated.
- [x] Subagent failures/timeouts are evaluated.
- [x] Agent-count/work budgets prevent runaway delegation.
- [x] Aggregate outcome verification is required.
- [x] Cost/token/latency overhead is measured.
- [x] A topology ablation can conclude that multi-agent should be removed.
- [x] MCP remains separate and coverage-only.
- [x] Knowledge Assistant integration extends existing evidence lineage.
- [x] Reviewer explicitly approves or requests changes before implementation.
