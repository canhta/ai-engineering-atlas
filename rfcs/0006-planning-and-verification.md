# RFC: Planning and Verification Slice

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The agent path now has ready routes for:

- deterministic versus agentic design;
- durable state;
- cross-session memory.

The next two catalog nodes are still `coverage`:

- `agents.planning`
- `agents.verification`

These capabilities are commonly taught too loosely.

Planning often becomes "ask the model to think step by step" or "make a todo list," without a persistent task structure, dependencies, revision triggers, or evidence that planning improves execution.

Verification often becomes "ask another LLM whether the answer looks good," without environment ground truth, deterministic checks, calibrated graders, or false-positive/false-negative analysis.

This RFC proposes a two-competency slice:

```text
stateful workflow
→ explicit plan artifact
→ execute one step
→ observe environment
→ update / invalidate plan
→ verify intermediate and final outcomes
→ repair or replan from evidence
→ stop only when success criteria are satisfied
```

The slice should remain single-agent by default. Multi-agent orchestration is explicitly out of scope.

## Evidence

### Anthropic — Building Effective Agents

https://www.anthropic.com/engineering/building-effective-agents

Verified sections:

- **Workflow: Prompt chaining**
- **Workflow: Orchestrator-workers**
- **Workflow: Evaluator-optimizer**
- **Agents**
- **Combining and customizing these patterns**
- **Summary**
- **Appendix 1: Coding agents**

The source supports several curriculum boundaries.

For planning:

- fixed, predictable decomposition can be encoded as a workflow;
- dynamic decomposition belongs where subtasks cannot be known ahead of time;
- autonomous agents plan and operate while using environment feedback during execution;
- complexity should only be added when it produces measurable value.

For verification:

- intermediate programmatic checks can gate a chained workflow;
- evaluator-optimizer loops require explicit evaluation criteria and measurable improvement;
- agents should obtain ground truth from tool/environment results while working;
- coding agents are especially suitable because automated tests provide objective verification signals;
- human review remains important when automated checks do not cover broader requirements.

The route should extract these principles rather than prescribe one architecture.

### Anthropic — Harness design for long-running application development

https://www.anthropic.com/engineering/harness-design-long-running-apps

Verified evidence includes:

- the earlier harness decomposing a product spec into a task list;
- **Planner** behavior around expanding a short prompt into a higher-level product specification;
- the decision not to over-specify low-level implementation details because wrong assumptions can cascade downstream;
- the generator/evaluator loop;
- explicit grading criteria;
- evaluator interaction with the running application through Playwright;
- QA findings tied to concrete contract criteria;
- ablation showing planner/evaluator value changes as underlying model capability improves.

This provides two important lessons.

For planning:

- a plan should constrain goals/deliverables enough to prevent under-scoping;
- excessive low-level detail can become harmful when assumptions are wrong;
- planner scaffolding should be ablated because it can become unnecessary as models improve.

For verification:

- external evaluators are useful only when they add measured value;
- concrete acceptance criteria and environment interaction are stronger than unconstrained self-critique;
- evaluator behavior itself must be tuned/calibrated and can still miss defects.

This is a production case study, not a required planner-generator-evaluator architecture.

### Anthropic — Demystifying Evals for AI Agents

https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

Verified sections:

- **The structure of an evaluation**
- **Types of graders for agents**
- **Capability vs. regression evals**
- agent evaluation examples for coding, research, conversational, and computer-use agents;
- **Design the eval harness and graders**
- guidance to choose deterministic graders where possible, model graders where necessary, and calibrate model graders against human judgment.

The source distinguishes:

- transcript/trajectory;
- final environment outcome;
- grader logic.

It explicitly notes that an agent saying an action happened is not equivalent to the environment actually reflecting that action.

This is core evidence for verification: verify the real state or artifact when possible, not only the model's explanation of what it did.

### OpenAI — A practical guide to building agents

https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

Verified sections:

- **What is an agent?**
- **Configuring instructions**
- **Orchestration**
- **Single-agent systems**

The guide describes agents as systems that manage workflow execution, recognize completion, correct actions when needed, and halt or return control on failure. It also recommends breaking dense procedures into clearer steps and defining explicit actions and edge-case branches.

This is supporting cross-provider evidence that planning should map to executable workflow decisions and explicit completion conditions rather than hidden reasoning text.

### CRITIC — Large Language Models Can Self-Correct with Tool-Interactive Critiquing

https://arxiv.org/abs/2305.11738

The paper compares pure self-correction with correction that uses external tools such as search or code execution.

Its key curriculum use is narrow:

- external feedback can provide stronger evidence for correction than unsupported self-critique;
- a verification loop should identify which aspects of an output can be checked against an external source of truth.

The route should not require the CRITIC framework.

### SWE-bench — Can Language Models Resolve Real-World GitHub Issues?

https://arxiv.org/abs/2310.06770

SWE-bench evaluates patches against real repository tests.

The useful curriculum principle is that agent work can be judged by outcome artifacts and environment checks rather than by whether the trajectory sounds plausible.

The route should not become a coding-agent benchmark tutorial.

## Proposal

Create a two-competency **Planning + Verification Slice** after State and Memory and before Long-Running Agents / Orchestration / Multi-Agent Systems.

```text
goal + constraints
→ decide whether explicit planning is needed
→ create inspectable plan
→ persist plan/status in state
→ execute next action
→ observe real environment/tool result
→ update or invalidate plan
→ run verification
→ repair/replan if verification fails
→ stop when externally checkable success criteria pass
```

## 1. `agents.planning`

**Proposed level:** L3

**Competency types:**

- engineering skill
- design judgment

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `agents.deterministic-vs-agentic`
- `agents.state`
- `ai.evaluation`

### Boundary with adjacent competencies

`agents.planning` should **not** become:

- hidden chain-of-thought or reasoning-trace extraction;
- a generic todo-list exercise;
- `agents.orchestration` — a plan may assign work, but runtime coordination is broader;
- `agents.multi-agent` — planning can be performed by one agent;
- `agents.state` — a plan may be stored in state, but state contains more than the plan;
- `agents.verification` — planning predicts what should happen; verification checks what actually happened.

### Plan model

An inspectable plan should contain only task-relevant structure such as:

- goal / deliverable;
- constraints;
- success criteria;
- ordered steps or dependency graph;
- current step/status;
- prerequisites or blockers;
- artifacts/results required by later steps;
- assumptions;
- invalidation/replanning triggers.

The exact schema is not prescribed.

### Observable outcomes

The learner should be able to:

- decide when explicit planning is useful versus unnecessary overhead;
- decompose a task at an appropriate granularity;
- represent dependencies and blocking conditions explicitly;
- avoid over-specifying low-level implementation details that are likely to become stale;
- connect plan items to durable execution state rather than relying on an ephemeral prompt;
- update plan status from tool/environment results;
- detect when an assumption or dependency has been invalidated;
- replan from observed evidence rather than blindly continue the original plan;
- define termination/success conditions before execution;
- compare no-plan, static-plan, and adaptive-plan variants on the same task set;
- reject planner scaffolding when it does not improve outcomes enough to justify cost and complexity.

### Required evidence

Extend the Knowledge Assistant with one task whose subtasks depend on intermediate results.

Evidence must include:

- planning-need justification;
- plan schema/version;
- goals, constraints, and success criteria;
- dependency/step representation;
- plan-to-state mapping;
- baseline without explicit planning;
- at least one static-plan run;
- at least one adaptive/replanning run;
- one injected invalidated assumption or blocked step;
- plan revision trace;
- task success;
- number of steps/tool calls;
- latency/cost where measurable;
- plan churn or unnecessary replanning;
- decision to keep, simplify, or remove explicit planning.

A plan that is generated once and never consulted or updated is not sufficient evidence.

## 2. `agents.verification`

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

- `agents.state`
- `ai.evaluation`
- `software.testing`

`software.testing` is coverage-only, so a ready route requires a targeted bridge.

The bridge should cover only what this route needs:

- happy-path versus regression tests;
- deterministic assertions on outputs/state;
- integration/end-to-end checks;
- failure reproduction.

The existing Made With ML testing resource is a candidate bridge source.

### Boundary with adjacent competencies

`agents.verification` should **not** become:

- generic offline model evaluation;
- generic software testing;
- a second model saying "looks good";
- guardrails/security policy in general;
- `agents.planning` — verification can work without an explicit plan;
- `agents.verification` as proof of perfect correctness.

The competency is the engineering ability to gather and use evidence that intermediate or final agent work satisfies explicit task criteria.

### Verification hierarchy

Prefer the strongest practical evidence available for the property being checked:

1. deterministic/environment checks;
2. executable tests or invariants;
3. authoritative external data/tool checks;
4. calibrated model-based graders for subjective/open-ended properties;
5. human review where the criteria require expert judgment.

Multiple verifier types may be combined.

### Observable outcomes

The learner should be able to:

- define verifiable success criteria before running the agent;
- identify which criteria can be checked deterministically and which require subjective grading;
- verify real environment state or artifacts rather than trusting agent narration;
- insert verification at useful intermediate or terminal boundaries;
- distinguish verification failure from execution failure and planning failure;
- use failed verification to trigger repair, retry, replan, abstention, or human escalation;
- seed known defects and measure whether the verifier detects them;
- measure false positives and false negatives for non-trivial verifier logic;
- calibrate model-based graders against human judgment when used;
- preserve verifier provenance/version;
- compare task outcome with and without the verification loop;
- remove expensive verifier stages that no longer provide measurable lift.

### Required evidence

Use the same Knowledge Assistant task lineage.

Evidence must include:

- versioned success criteria;
- verifier inventory mapped to each criterion;
- at least one deterministic/environment verifier;
- at least one seeded defect;
- verification trace for a successful run;
- verification trace for a failed run;
- failure attribution;
- repair/retry/replan/escalation action;
- verifier false-positive/false-negative evidence where applicable;
- calibration evidence if a model grader is used;
- latency/cost overhead;
- baseline without the verification loop;
- final keep/simplify/remove decision.

A self-critique paragraph without external or calibrated evidence is not sufficient exit evidence.

## Planning + Verification integration

The two competencies should interact but remain independently assessable.

```text
plan
→ execute
→ environment result
→ verify
   ├─ pass → advance / complete
   └─ fail → diagnose
            ├─ repair current step
            ├─ retry
            ├─ replan
            ├─ abstain
            └─ escalate
```

The learner should explicitly classify a failure as one of:

- bad plan/decomposition;
- stale/invalidated plan assumption;
- execution/tool failure;
- state/recovery failure;
- verifier failure;
- genuine task failure.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/planning-and-verification/`

The package should extend the existing stateful Knowledge Assistant rather than introduce a new planner agent or multi-agent architecture.

Proposed progression:

```text
existing stateful workflow
→ identify task requiring adaptive decomposition
→ no-plan baseline
→ explicit plan in state
→ execute + update plan
→ inject changed condition / failed assumption
→ replan
→ define outcome verifiers
→ seed a defect
→ verify + repair/replan
→ compare quality / steps / latency / cost
→ keep / simplify / remove planning and verification scaffolding
```

Proposed artifacts:

- planning decision record;
- plan schema;
- plan execution trace;
- replanning trace;
- success-criteria record;
- verifier inventory;
- verification trace;
- seeded-defect test;
- verifier calibration record if needed;
- planning/verification ablation;
- architecture decision.

## Promotion gate

Neither node should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact source locators are rechecked during route authoring;
4. proposed new resources are registered and web-atlas data regenerated;
5. coverage-only prerequisites have targeted bridges;
6. competency YAML + learner README are complete;
7. learner-facing source blocks are generated and current;
8. Knowledge Assistant planning-and-verification evidence package is inspectable;
9. Planning includes no-plan/static/adaptive comparison and an invalidation/replanning case;
10. Verification includes environment/deterministic evidence and at least one seeded defect;
11. model graders, if used, include calibration evidence;
12. prerequisite-cycle validation passes;
13. seeded-state validation passes;
14. `site/src/data/atlas.json` is regenerated and current;
15. final `make check` / CI passes;
16. review outcome is recorded before promotion.

## Alternatives considered

### Merge Planning and Verification into one competency

Rejected. Planning proposes a path; verification checks evidence. They interact closely but have different failure modes and can exist independently.

### Treat chain-of-thought as the plan

Rejected. Hidden model reasoning is not a durable, inspectable execution contract and should not be required or extracted as curriculum evidence.

### Always plan before acting

Rejected. Simple tasks may perform better with direct execution. Planning should be justified by task structure and measured value.

### Make plans maximally detailed

Rejected. Overly detailed plans encode assumptions that can become wrong and create cascading errors. Plan granularity should constrain deliverables and dependencies without pretending all implementation details are knowable upfront.

### Use self-critique as verification

Rejected as a default. Self-review can be a signal, but strong verification should use environment state, tests, authoritative tools, calibrated graders, or human review depending on the criterion.

### Require a separate verifier agent

Rejected. Verification is a capability, not a multi-agent topology. Deterministic checks or the same agent invoking external checks may be sufficient.

### Introduce Multi-Agent Planning now

Rejected. The learner should first prove that planning and verification add value in a single-agent/stateful system before adding coordination overhead.

## Impact

- affected competencies:
  - `agents.planning`
  - `agents.verification`
- proposed prerequisites:
  - `agents.planning` ← `agents.deterministic-vs-agentic`, `agents.state`, `ai.evaluation`
  - `agents.verification` ← `agents.state`, `ai.evaluation`, `software.testing`
- reused resources:
  - `article.anthropic-building-effective-agents`
  - `article.anthropic-agent-evals`
  - `course.made-with-ml-testing`
- proposed new resources after approval:
  - `article.anthropic-harness-design-long-running-apps`
  - `guide.openai-practical-agents`
  - `paper.critic-tool-interactive`
  - `paper.swe-bench`
- proposed project integration:
  - Knowledge Assistant `planning-and-verification/` evidence package
- site/generated data:
  - resource/route changes after approval must regenerate `site/src/data/atlas.json`
- catalog/generated status:
  - **no promotion before review and seeded validation**

## Review checklist

- [ ] Evidence is traceable and locators are specific enough for route authoring.
- [ ] Planning is distinct from hidden reasoning, orchestration, state, and verification.
- [ ] Verification is distinct from generic evaluation, testing, and self-critique.
- [ ] Planning target depth L3 is appropriate.
- [ ] Verification target depth L3 is appropriate.
- [ ] Planning evidence includes a no-plan baseline and adaptive replanning case.
- [ ] Plan granularity avoids unnecessary low-level over-specification.
- [ ] Verification checks real outcomes/environment where possible.
- [ ] Verification includes a seeded-defect case.
- [ ] Model graders require calibration when used.
- [ ] Failure attribution distinguishes plan, execution, state, verifier, and task failures.
- [ ] Multi-agent orchestration remains out of scope.
- [ ] Knowledge Assistant integration extends existing evidence lineage.
- [ ] Reviewer explicitly approves or requests changes before promotion.
