# Knowledge Assistant

Reference project for the AI System and Production spines.

For the first product/search/embeddings slice, use the [foundation evidence contract](foundation/) so the product brief, query set, baseline comparison, and retrieval decision remain inspectable.

For chunking, reranking, and RAG evaluation, continue with the [Retrieval Quality evidence contract](retrieval-quality/) and keep the same evidence lineage instead of restarting with a new demo dataset.

For runtime context and external actions, continue with the [Context and Tools evidence contract](context-and-tools/). Reuse the same evaluation lineage so context/tool changes can be compared against the measured RAG system.

For typed responses and answer-versus-abstain decisions, continue with the [Output and Trust evidence contract](output-and-trust/). Keep the same evaluation lineage so output reliability and abstention policy are measured against the system you already built.

For durable execution and cross-session information, continue with the [State and Memory evidence contract](state-and-memory/). State must first prove crash/restart continuity; memory is added only after a real cross-session need is demonstrated.

For adaptive decomposition and outcome checking, continue with the [Planning and Verification evidence contract](planning-and-verification/). Keep this single-agent/stateful first: prove planning and verification value before adding orchestration or multiple agents.

For work that spans waits, restarts, routing, or parallel branches, continue with the [Runtime and Orchestration evidence contract](runtime-and-orchestration/). First make the run durable; then add orchestration only where routing or concurrency measurably improves the same task lineage.

For tasks where independent specialist contexts might create measurable value, continue with the [Multi-Agent evidence contract](multi-agent/). Preserve the single-agent orchestration baseline and keep the multi-agent topology only if specialization earns its coordination cost.

For provider control and production diagnosis, continue with the [Production Boundary evidence contract](production-boundary/). Preserve the direct-provider path as a baseline so gateway and telemetry complexity have something real to beat.

The system answers questions over a changing document collection and must provide evidence for where its answers came from.

The project is deliberately generic: use public technical documentation, a public-domain corpus, or your own permitted material.

## Product frame

Before choosing models or a vector database, complete the [AI Product and Problem Framing](../../curriculum/07-ai-engineering/product-framing/) route and write a one-page product brief.

### User

Choose a concrete user such as:

- support engineer;
- developer using internal documentation;
- operations engineer;
- analyst working with a document collection.

### Pain

Describe the current workflow and failure cost.

Examples:

- slow manual search;
- stale answers;
- difficult navigation across many documents;
- inability to find the source of an answer.

### Value proposition

State what the system should improve.

Do not use "AI assistant" as the value proposition.

### Constraints

Record constraints such as:

- update frequency;
- permissions;
- latency;
- cost;
- data sensitivity;
- citation requirement;
- acceptable failure behavior.

### Evaluation contract

Before architecture work, define:

- representative queries;
- retrieval relevance criteria;
- answer criteria;
- unacceptable failures;
- latency/cost measurements;
- baseline to beat.

This follows the same discipline as Made With ML's product-first approach: problem and evaluation come before model complexity.

---

## Milestone 0 — lexical baseline

Use the [Search and Retrieval](../../curriculum/07-ai-engineering/search-retrieval/) route and build the simplest useful retrieval baseline.

A keyword or lexical search is preferred over starting with RAG.

**Artifacts:**

- product brief;
- small versioned query set;
- baseline retrieval results;
- failure notes.

**Decision:** what failure justifies adding semantic retrieval?

## Milestone 1 — embeddings and vector retrieval

Use the [Embeddings for AI Applications](../../curriculum/07-ai-engineering/embeddings/) route and add embedding-based retrieval.

Do not remove the lexical baseline.

Compare them on the same query set.

**Measure:**

- retrieval relevance;
- obvious miss categories;
- latency;
- indexing/update cost where useful.

**Evidence:** identify query types where each method wins or fails.

## Milestone 2 — chunking quality

Use the [Chunking](../../curriculum/07-ai-engineering/chunking/) route.

Change chunk boundaries only because the Round 1 failure analysis or corpus structure gives you a reason to test them.

**Experiment:**

- compare at least three sensible strategies;
- keep the corpus/query/evaluation contract fixed;
- measure retrieval quality plus index/context cost;
- inspect query slices and concrete boundary failures.

**Decision:** choose a strategy for this corpus, not a universal chunk size.

## Milestone 3 — hybrid retrieval and reranking

Use the [Reranking](../../curriculum/07-ai-engineering/reranking/) route when candidate ordering remains a measured problem.

Add hybrid retrieval or reranking only when the prior failure analysis supports it.

**Experiment:**

- baseline vs vector vs hybrid/reranked;
- inspect false positives and false negatives;
- record the quality/latency trade-off.

## Milestone 4 — answer generation / RAG

Only after retrieval is measurable, add answer generation.

Require source attribution.

Separate evaluation into:

1. retrieval quality;
2. answer quality given retrieved context;
3. end-to-end behavior.

This prevents generation quality from hiding retrieval failures.

## Milestone 5 — RAG evaluation

Use both the [RAG Evaluation](../../curriculum/07-ai-engineering/rag-evaluation/) route and the general [AI Evaluation competency](../../curriculum/07-ai-engineering/evaluation/).

Do not report one undifferentiated RAG score. Separate retrieval, supplied context, generation, and end-to-end evidence.

Version:

- query/eval set;
- system configuration;
- results;
- failure taxonomy.

Include:

- component metrics;
- end-to-end metrics;
- repeated runs for stochastic behavior;
- latency;
- cost where measurable.

Create a release decision from the results.

## Milestone 6 — data lifecycle

Make the corpus change.

Support at least:

- add;
- update;
- delete;
- freshness verification.

If the chosen scenario has permissions, add ACL-aware retrieval and test that unauthorized content cannot be returned.

**Failure exercise:** intentionally create a stale or incorrectly indexed document and diagnose it.

## Milestone 7 — context engineering

Use the [Context Engineering](../../curriculum/07-ai-engineering/context-engineering/) route.

Inventory what actually reaches the model and compare context policies before adding new autonomy.

**Experiment:**

- minimal high-signal context;
- broader/noisier context;
- dynamically selected or compacted context;
- stale/distractor failure case.

**Decision:** record what is deliberately kept, excluded, loaded just in time, or compacted.

## Milestone 8 — tool use or agent workflow

Use the [Tool Calling](../../curriculum/07-ai-engineering/tool-calling/) route for the tool boundary.

Do **not** add an agent because the roadmap contains an Agents section.

First identify a task the retrieval-only system cannot handle cleanly.

Examples:

- fetch live system status;
- create a structured ticket;
- compare information from multiple tools;
- execute a multi-step workflow.

Start with a deterministic workflow. Introduce agentic control only when flexibility is needed and measurable.

**Evidence:**

- tool contract/schema and parameter semantics;
- deterministic validation and authorization/approval boundary;
- idempotency/retry behavior;
- raw tool-call traces and tool-use evaluation;
- result-shaping decision;
- failure recovery;
- explicit decision to stay deterministic or justify later agentic control.

## Milestone 9 — structured response contract

Use the [Structured Outputs](../../curriculum/07-ai-engineering/structured-outputs/) route.

Introduce a versioned response contract because a real downstream consumer needs one—not because JSON looks cleaner.

**Evidence:**

- schema/version and consumer requirement;
- contract tests;
- deterministic semantic validation;
- refusal/unavailable and incomplete-output handling;
- schema-valid but semantically invalid failure case;
- one schema migration decision;
- comparison with the prior free-form baseline.

## Milestone 10 — abstention and trust policy

Use the [Uncertainty Abstention and Trust](../../curriculum/07-ai-engineering/uncertainty-abstention-trust/) route.

Do not use model self-reported confidence as the policy by default.

**Experiment:**

- preserve the no-abstention baseline;
- define answerability/risk labels;
- compare at least two candidate signals or policies;
- select the operating point on validation data;
- evaluate once on held-out test data;
- report risk together with coverage;
- measure unnecessary abstention, unsafe answers, and fallback/escalation outcome;
- test at least one stale, insufficient-evidence, or shifted slice.

**Decision:** record the chosen answer/abstain/fallback policy and what evidence would change it.

## Milestone 11 — durable execution state

Use the [Agent State](../../curriculum/08-agents/state/) route.

Take one already-justified multi-step or interruptible workflow and make its execution state explicit.

**Evidence:**

- state schema/version;
- transition table;
- durable run/session identifier;
- persisted versus derived values;
- checkpoint/event boundaries;
- interruption after a completed side effect;
- restart/resume trace;
- duplicate-side-effect prevention;
- stale/corrupt/incompatible-state test;
- one state migration decision.

**Decision:** explain why transcript-only continuity is insufficient.

## Milestone 12 — cross-session memory

Use the [Agent Memory](../../curriculum/08-agents/memory/) route.

Add memory only for a measured cross-session need.

**Experiment:**

- preserve a no-memory baseline;
- define memory scope, provenance, freshness, admission/write rules, and retrieval rules;
- compare at least two memory policies;
- test irrelevant, stale, conflicting, corrected, and deleted memories;
- test cross-user/cross-scope isolation where identity exists;
- trace exactly which memories enter current context;
- measure task benefit together with harmful recall, latency, and context/token cost.

**Decision:** keep, change, or remove memory from evidence.

## Milestone 13 — adaptive planning

Use the [Planning](../../curriculum/08-agents/planning/) route.

Only add explicit planning for a task whose structure depends on intermediate results.

**Experiment:**

- preserve a no-plan baseline;
- compare static and adaptive plans;
- persist the plan in durable state;
- inject a changed condition or invalidated assumption;
- preserve the replanning trace;
- measure task success, steps/tool calls, latency/cost, and plan churn.

**Decision:** keep, simplify, or remove explicit planning from evidence.

## Milestone 14 — verification loop

Use the [Verification](../../curriculum/08-agents/verification/) route.

Define success criteria before execution and verify real outcomes rather than trusting agent narration.

**Evidence:**

- verifier inventory mapped to success criteria;
- at least one deterministic/environment verifier;
- one seeded defect;
- successful and failed verification traces;
- failure attribution;
- repair/retry/replan/abstain/escalate action;
- verifier false-positive/false-negative evidence where applicable;
- model-grader calibration if a model grader is used;
- verification overhead and ablation.

**Decision:** keep, simplify, or remove each verifier stage.

## Milestone 15 — long-running runtime

Use the [Long-Running Agents](../../curriculum/08-agents/long-running/) route.

Introduce a real or simulated wait/process boundary instead of keeping one worker alive.

**Evidence:**

- durable run lifecycle and ID;
- execution budget;
- pause/wait and resume trace;
- worker/process replacement;
- retryable and non-retryable failure behavior;
- timeout/cancellation/escalation;
- concurrent-resume protection;
- side-effect replay/idempotency evidence;
- partial-progress artifact;
- final verification;
- comparison with the simpler synchronous baseline.

**Decision:** keep, simplify, or remove the durable runtime from evidence.

## Milestone 16 — orchestration

Use the [AI Workflow Orchestration](../../curriculum/08-agents/orchestration/) route.

Keep a simpler single-flow baseline.

**Experiment:**

- identify a real routing, parallelism, or dynamic-subtask problem;
- mark every flow decision as code-controlled, model-controlled, or hybrid;
- bound concurrency;
- define fan-out/fan-in where relevant;
- inject a branch failure or timeout;
- record failure-containment behavior;
- verify the aggregate result;
- ablate one orchestration stage;
- compare quality, latency, cost, calls, and operational complexity.

**Decision:** keep single flow, use orchestration, or defer multi-agent architecture.

## Milestone 17 — multi-agent decision

Use the [Multi-Agent Systems](../../curriculum/08-agents/multi-agent/) route.

Do not add agents because the architecture diagram looks more capable. Start from the same single-agent orchestration baseline and identify a measured limitation that independent roles or context windows may solve.

**Experiment:**

- define each agent boundary and why it cannot be a simpler tool/prompt branch;
- record manager, handoff, or orchestrator-worker ownership;
- make context/state/tool/permission sharing explicit;
- bound per-agent and total work;
- inject duplicated delegation or a coverage gap;
- inject conflicting specialist conclusions;
- inject one subagent failure or timeout;
- verify the aggregate result;
- compare quality, latency, token/cost, tool calls, and coordination overhead;
- remove or merge one agent as a topology ablation.

**Decision:** keep the multi-agent topology, simplify it, or return to single-agent orchestration.

## Milestone 18 — MCP interoperability

Use the [Model Context Protocol](../../curriculum/08-agents/mcp/) route.

Add MCP only when the Knowledge Assistant has a real interoperability need across hosts/clients or reusable server capabilities. Preserve the direct/internal integration as the baseline.

**Evidence:**

- supported MCP revision and legacy-compatibility policy;
- host/client/server responsibility diagram;
- modern discovery and capability/version trace;
- deliberately small tool/resource/prompt inventory;
- deterministic tool validation and application-side authorization;
- resource URI/scope validation;
- version/capability mismatch test;
- malformed input and downstream failure tests;
- authorization failure test where applicable;
- optional multi-round-trip or Tasks evidence only when the use case requires it;
- interoperability or conformance evidence;
- latency, maintenance, and operational-complexity comparison with the direct integration.

**Decision:** keep MCP, simplify the exposed surface, or return to the direct integration.

## Milestone 19 — model gateway boundary

Use the [Model Provider and Gateway Architecture](../../curriculum/09-production-ai/model-gateway/) route and the [Production Boundary evidence contract](production-boundary/).

Preserve the direct-provider path. Add a gateway only when centralized routing, reliability policy, quota, credential, or telemetry control solves a measured problem.

**Evidence:**

- gateway decision and responsibility boundary;
- stable request/response contract;
- provider/model inventory and compatibility policy;
- routing, timeout, retry/backoff, fallback, rate/quota, and credential policy;
- request correlation across retry and fallback;
- provider timeout and 429/throttling failures;
- one compatible fallback or failover case;
- one incompatible model/version fallback that is deliberately rejected;
- gateway-bypass/credential-boundary test;
- latency and operational-overhead comparison with the direct path.

**Decision:** keep the gateway, simplify it, or return to direct provider integration.

## Milestone 20 — observability and diagnostic replay

Use the [AI Observability and Request Replay](../../curriculum/09-production-ai/observability/) route and continue in the same [Production Boundary evidence contract](production-boundary/).

Instrument the request path so a production failure can be explained without treating logs as a transcript dump.

**Evidence:**

- request/trace ID and span inventory;
- model/provider, retrieval, tool, application, and optional gateway correlation;
- workflow and provider-call latency;
- token/usage metrics when reliable;
- streaming time-to-first-chunk only when the path actually streams;
- explicit privacy/content-capture policy;
- redaction or content-exclusion test;
- successful, provider-failure, and retrieval/tool-failure traces;
- provenance for model, prompt/template, retrieval/index, tool, route/policy, input reference, and relevant configuration;
- one diagnostic replay record;
- telemetry overhead and one field deliberately reduced or dropped;
- incident diagnosis from collected evidence.

**Decision:** keep only telemetry that is actionable, privacy-safe, and worth its overhead.

## Milestone 21 — release gate

Create a pre-release check that uses the evaluation harness.

A release decision should include:

- quality regressions;
- critical failure cases;
- latency/cost constraints;
- security checks relevant to the system.

The output is a recorded **go / no-go decision with evidence**, not merely a CI green check.

## Milestone 22 — security failure work

Test realistic trust-boundary failures.

At minimum consider:

- indirect prompt injection in retrieved content;
- unauthorized document access;
- dangerous or malformed tool arguments;
- sensitive data in logs/traces.

Mitigations should live outside the model prompt when the control requires real authorization or isolation.

## Milestone 23 — incident and feedback loop

Inject or analyze one failure:

- stale index;
- provider timeout;
- retrieval regression;
- malformed document;
- tool failure;
- prompt-injection attempt.

Produce:

1. detection evidence;
2. user impact;
3. diagnosis;
4. mitigation;
5. durable regression test;
6. follow-up metric or alert.

This is where production learning becomes part of the curriculum rather than an appendix.

---

# What completion looks like

A strong project record contains the evolution of decisions:

```text
problem
→ baseline
→ measured failure
→ architecture change
→ experiment
→ release decision
→ production/failure evidence
→ feedback
```

The final architecture matters less than whether each increase in complexity can be explained from evidence.
