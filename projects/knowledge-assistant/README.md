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

For artifact identity, progressive delivery, and rollback drills, continue with the [Release Lifecycle evidence contract](release-lifecycle/). Every evaluation, trace, rollout, and rollback decision should point to a concrete release manifest rather than a mutable environment label.

For latency and unit-economics work, continue with the [Performance & Economics evidence contract](performance-economics/). Reuse the same representative workload, quality/evaluation lineage, traces, and release identity so an optimization cannot win by changing the task.

For caching and streamed delivery, continue with the [Delivery Mechanisms evidence contract](delivery-mechanisms/). Reuse the same latency, cost, quality, and observability baselines so these mechanisms have to earn their complexity.

For post-release change detection, continue with the [Drift Monitoring evidence contract](drift-monitoring/). Drift alerts must be correlated with evaluation and release evidence before they become mitigation decisions.

For the final Production AI synthesis, continue with the [Production Synthesis evidence contract](production-synthesis/). Architecture and MLOps/LLMOps must simplify and operate the system already built; they must not become a reason to add infrastructure without a measured need.

For action authorization and sensitive-data flow, continue with the [Security Boundaries evidence contract](security-boundaries/). The model is treated as potentially mistaken or manipulated; permissions and confidentiality must still hold.

For risk decisions and personal-data processing, continue with the [Governance and Privacy evidence contract](governance-and-privacy/). Deployment decisions, deletion tests, and escalations must cite the evaluation, release, and security evidence already built.

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

## Lexical baseline

Use the [Search and Retrieval](../../curriculum/07-ai-engineering/search-retrieval/) route and build the simplest useful retrieval baseline.

A keyword or lexical search is preferred over starting with RAG.

**Artifacts:**

- product brief;
- small versioned query set;
- baseline retrieval results;
- failure notes.

**Decision:** what failure justifies adding semantic retrieval?

## Embeddings and vector retrieval

Use the [Embeddings for AI Applications](../../curriculum/07-ai-engineering/embeddings/) route and add embedding-based retrieval.

Do not remove the lexical baseline.

Compare them on the same query set.

**Measure:**

- retrieval relevance;
- obvious miss categories;
- latency;
- indexing/update cost where useful.

**Evidence:** identify query types where each method wins or fails.

## Chunking quality

Use the [Chunking](../../curriculum/07-ai-engineering/chunking/) route.

Change chunk boundaries only because the Round 1 failure analysis or corpus structure gives you a reason to test them.

**Experiment:**

- compare at least three sensible strategies;
- keep the corpus/query/evaluation contract fixed;
- measure retrieval quality plus index/context cost;
- inspect query slices and concrete boundary failures.

**Decision:** choose a strategy for this corpus, not a universal chunk size.

## Hybrid retrieval and reranking

Use the [Reranking](../../curriculum/07-ai-engineering/reranking/) route when candidate ordering remains a measured problem.

Add hybrid retrieval or reranking only when the prior failure analysis supports it.

**Experiment:**

- baseline vs vector vs hybrid/reranked;
- inspect false positives and false negatives;
- record the quality/latency trade-off.

## Answer generation / RAG

Only after retrieval is measurable, add answer generation.

Require source attribution.

Separate evaluation into:

1. retrieval quality;
2. answer quality given retrieved context;
3. end-to-end behavior.

This prevents generation quality from hiding retrieval failures.

## RAG evaluation

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

## Data lifecycle

Make the corpus change.

Support at least:

- add;
- update;
- delete;
- freshness verification.

If the chosen scenario has permissions, add ACL-aware retrieval and test that unauthorized content cannot be returned.

**Failure exercise:** intentionally create a stale or incorrectly indexed document and diagnose it.

## Context engineering

Use the [Context Engineering](../../curriculum/07-ai-engineering/context-engineering/) route.

Inventory what actually reaches the model and compare context policies before adding new autonomy.

**Experiment:**

- minimal high-signal context;
- broader/noisier context;
- dynamically selected or compacted context;
- stale/distractor failure case.

**Decision:** record what is deliberately kept, excluded, loaded just in time, or compacted.

## Tool use or agent workflow

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

## Structured response contract

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

## Abstention and trust policy

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

## Durable execution state

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

## Cross-session memory

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

## Adaptive planning

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

## Verification loop

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

## Long-running runtime

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

## Orchestration

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

## Multi-agent decision

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

## MCP interoperability

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

## Model gateway boundary

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

## Observability and diagnostic replay

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

## Latency engineering

Use the [Latency Engineering](../../curriculum/09-production-ai/latency/) route and the [Performance & Economics evidence contract](performance-economics/).

Measure the existing Knowledge Assistant path before optimizing it.

**Evidence:**

- product/user latency objective;
- representative workload;
- p50/p95/p99 or comparable latency distribution;
- critical-path trace;
- component-latency breakdown;
- success/error latency treatment;
- TTFC only when streaming applies;
- measured bottleneck hypothesis;
- before/after optimization;
- quality and error comparison;
- load/tail observation;
- one optimization kept;
- one optimization rejected or reverted.

**Decision:** keep only the change that improves the declared latency objective without violating quality, error, or tail-latency constraints.

## Cost engineering

Use the [Cost Engineering](../../curriculum/09-production-ai/cost/) route and continue in the same [Performance & Economics evidence contract](performance-economics/).

Optimize the cost of useful behavior rather than raw provider spend.

**Evidence:**

- cost boundary;
- allocation dimensions;
- direct/variable/shared cost inventory;
- technical unit metric;
- product/useful-outcome unit metric;
- baseline total and unit cost;
- provider/model/request/token or usage breakdown where available;
- retry/tool/agent amplification treatment;
- abnormal-spend guardrail;
- before/after optimization;
- quality/latency/cost-per-successful-outcome comparison;
- one cost optimization kept;
- one nominally cheaper configuration rejected.

**Decision:** keep the configuration with better unit economics under the quality, latency, and reliability contract rather than the lowest nominal price.

## Caching engineering

Use the [AI Caching](../../curriculum/09-production-ai/caching/) route and the [Delivery Mechanisms evidence contract](delivery-mechanisms/).

Add only one cache whose reuse pattern and stale-data tolerance are justified by the measured latency/cost problem.

**Evidence:**

- cache decision and boundary;
- cacheability and authorization scope;
- key dimensions;
- TTL/refresh/eviction/invalidation policy;
- version-aware invalidation;
- hit/miss/cached-token measurements;
- warm/cold/no-cache comparison;
- cache-unavailable test;
- stale-data test;
- concurrent-miss or thundering-herd test where applicable;
- cross-tenant or authorization-scope test;
- quality/latency/cost comparison;
- one cache idea rejected or removed.

**Decision:** keep the cache only when measured value exceeds freshness, correctness, security, and operational risk.

## Streaming delivery

Use the [Streaming](../../curriculum/09-production-ai/streaming/) route and continue in the same [Delivery Mechanisms evidence contract](delivery-mechanisms/).

Stream only the path where earlier partial output provides real user value.

**Evidence:**

- typed stream event contract;
- TTFC and full-completion baseline;
- non-streaming comparison;
- partial/complete state handling;
- client-cancel propagation;
- disconnect/reconnect test;
- duplicate/resume/restart policy;
- slow-consumer/backpressure test;
- mid-stream failure test;
- partial structured/tool-data handling where applicable;
- moderation/validation policy for partial output;
- one streaming path rejected.

**Decision:** keep streaming only when TTFC/user-experience benefit justifies the protocol, failure, safety, and cancellation complexity.

## Versioned release candidate

Use the [Model Prompt and Retrieval Versioning](../../curriculum/09-production-ai/versioning/) route and the [Release Lifecycle evidence contract](release-lifecycle/).

Treat the deployed Knowledge Assistant as a set of behavior-defining artifacts, not one application image.

**Evidence:**

- artifact inventory;
- release-manifest contract;
- current known-good manifest;
- candidate manifest;
- manifest diff;
- concrete model and prompt/template identities;
- inference/runtime configuration identity;
- retrieval data snapshot and index-build identity;
- tool, gateway, policy, application, and feature-config identity where applicable;
- trace-to-manifest linkage;
- evaluation-to-manifest linkage;
- mutable-alias resolution test;
- unresolved latest-style reference rejection or resolution;
- restore of one known-good manifest.

**Decision:** keep only identity fields that make evaluation, incident diagnosis, replay, and rollback more precise; avoid redundant version metadata that does not change behavior.

## Progressive release and rollback

Use the [AI Release Engineering](../../curriculum/09-production-ai/release-engineering/) route and continue in the same [Release Lifecycle evidence contract](release-lifecycle/).

Release a concrete candidate manifest, not a moving alias.

**Evidence:**

- frozen/versioned pre-release evaluation reference;
- explicit blocking quality and operational gates;
- rollout strategy and bounded exposure;
- success, failure, and inconclusive analysis states;
- live AI-quality signals separated from service-health signals;
- one pre-release block;
- one live abort;
- one rollback to an explicit known-good manifest;
- post-rollback artifact and behavior verification;
- release decision record;
- production failure converted into a durable regression case;
- decision on whether progressive delivery complexity was justified.

**Decision:** promote, pause, abort, roll back, or simplify the rollout process from evidence rather than deployment completion alone.

## Drift monitoring

Use the [Drift Monitoring and Response](../../curriculum/09-production-ai/drift/) route and the [Drift Monitoring evidence contract](drift-monitoring/).

Monitor the released Knowledge Assistant for meaningful change without treating every distribution shift as a quality incident.

**Evidence:**

- monitored population/signal contract;
- version-aware reference/current windows;
- seasonality/sample-size rationale;
- threshold/backtest record;
- input/query and output/response signals where useful;
- segmented monitor;
- one harmless drift case;
- one quality regression with little obvious drift;
- data-quality failure classified separately;
- drift-to-quality/latency/cost/release correlation;
- investigation and response playbook;
- one production slice added to durable evaluation/regression evidence;
- one noisy monitor removed or rejected.

**Decision:** alert and act only when the drift signal is actionable under the quality/product contract; otherwise investigate, recalibrate, or remove it.

## Architecture synthesis

Use the [AI Production Architecture](../../curriculum/09-production-ai/architecture/) route and the [Production Synthesis evidence contract](production-synthesis/).

Review the whole Knowledge Assistant as one production system.

**Evidence:**

- architecture drivers;
- context/topology diagram;
- request/data/feedback/control flows;
- component state/lifetime/owner/change-cadence map;
- trust and external-dependency boundaries;
- dependency/failure/degradation matrix;
- scaling/capacity rationale;
- two viable topology alternatives;
- one mechanism or component deliberately removed/omitted;
- provider/component replacement walkthrough;
- evolution triggers for future complexity.

**Decision:** choose the smallest topology that satisfies the declared product and operational constraints.

## Operating lifecycle synthesis

Use the [MLOps and LLMOps](../../curriculum/09-production-ai/mlops-llmops/) route and continue in the same [Production Synthesis evidence contract](production-synthesis/).

Map the full operating loop around the selected architecture.

**Evidence:**

- lifecycle map from hypothesis through production feedback;
- artifact systems of record;
- experiment/release/trace/incident lineage;
- CI checks mapped to change surfaces;
- CD/release gates;
- explicit decision on whether training/tuning/CT applies;
- event and operator triggers;
- automated/manual/approval boundaries;
- environment/IaC reproducibility;
- ownership map;
- one end-to-end change through the loop;
- one production failure converted into durable regression evidence;
- one automation/platform component removed or consolidated;
- production-readiness review.

**Decision:** automate only the transitions that reduce risk, lead time, or toil without weakening evidence or required human judgment.

## Authentication and authorization boundary

Use [Authentication and Authorization](../../curriculum/10-security-governance/auth/) and the [Security Boundaries evidence contract](security-boundaries/).

Build identity and resource authorization before relying on agent-level controls.

**Evidence:**

- trusted issuer / principal mapping;
- token or assertion validation contract;
- access-token resource/scope restriction;
- deny-by-default authorization policy;
- object/resource-level negative tests;
- session timeout / reauthentication / logout / revocation behavior;
- service versus user identity separation;
- credential/logging policy;
- one privilege change observed by a subsequent request.

**Decision:** authenticated identity is only input to authorization; every protected request still requires an explicit resource decision.

## Multi-tenant isolation

Use [Multi-Tenant Isolation](../../curriculum/10-security-governance/multi-tenant/) and continue in the same [Security Boundaries evidence contract](security-boundaries/).

Run the Knowledge Assistant with at least two synthetic tenants.

**Evidence:**

- tenant-context contract;
- multi-tenant user/context-switch behavior;
- API/resource tenant enforcement;
- retrieval/vector isolation;
- cache/state/memory namespace isolation;
- background-job/retry tenant propagation;
- admin/support cross-tenant policy;
- pool/silo/bridge decision;
- noisy-neighbor control where relevant;
- tenant offboarding/deletion test;
- cross-tenant negative-test matrix.

**Decision:** tenant context must survive every shared layer; login and role checks alone do not prove isolation.

## Tool permission boundary

Use the [Tool Permissions](../../curriculum/10-security-governance/tool-permissions/) route and the [Security Boundaries evidence contract](security-boundaries/).

Reduce the tool surface before testing prompt injection.

**Evidence:**

- capability inventory;
- least-functionality tool design;
- user/service identity mapping;
- tool/action/resource permission matrix;
- downstream complete-mediation point;
- token audience/passthrough negative test;
- progressive scope/step-up policy;
- high-impact approval policy;
- cross-user/tenant negative tests;
- permission revocation test;
- one unnecessary capability or permission removed.

**Decision:** the model may propose an action, but deterministic downstream policy decides whether that action exists and is authorized.

## Data exfiltration boundary

Use the [Data Exfiltration](../../curriculum/10-security-governance/data-exfiltration/) route and continue in the same [Security Boundaries evidence contract](security-boundaries/).

Map protected data before testing how an attacker might move it.

**Evidence:**

- sensitive-data classification;
- source-to-sink data-flow map;
- retrieval/tool authorization before model context;
- context-minimization decision;
- credential/secret separation;
- tenant-safe cache/retrieval test;
- allowed/approval-required/forbidden sink policy;
- telemetry/log/replay redaction evidence;
- alternate-channel exfiltration tests;
- synthetic/canary protected values;
- durable security regression case.

**Decision:** sensitive data may reach only the sources, transformations, stores, and sinks explicitly allowed by application policy.

## Sandboxed execution

Use [Sandboxing](../../curriculum/10-security-governance/sandboxing/) and continue in the same [Security Boundaries evidence contract](security-boundaries/).

Add one intentionally untrusted execution task only after its runtime boundary is explicit.

**Evidence:**

- sandbox threat model;
- filesystem mounts and write paths;
- network egress policy;
- non-root / no-escalation / capability policy;
- credential exclusion;
- CPU / memory / PID / storage / wall-time limits;
- sandbox lifetime and cleanup;
- filesystem escape/traversal test;
- forbidden network test;
- privilege escalation test;
- resource-exhaustion test;
- cross-run / cross-tenant persistence test;
- measured sandbox overhead.

**Decision:** an allowed execution tool runs inside the smallest filesystem, network, privilege, resource, and lifetime envelope that can complete the task.

## Supply-chain and data integrity

Use [AI Supply Chain and Data Security](../../curriculum/10-security-governance/supply-chain-data/) and continue in the same [Security Boundaries evidence contract](security-boundaries/).

Inventory every external artifact that can change production behavior and prove how it is admitted.

**Evidence:**

- AI/ML supply-chain inventory or BOM;
- immutable artifact/version identities;
- supplier/source and provenance records;
- hash/signature/provenance checks where available;
- artifact admission/quarantine policy;
- retrieval/data origin and transformation lineage;
- unsafe artifact loading policy;
- tampered-artifact negative test;
- poisoning/backdoor test;
- downstream impact analysis for one compromised dependency;
- quarantine/revoke/rebuild/rollback response;
- one stale dependency removed.

**Decision:** no external model/data/runtime artifact becomes trusted production behavior merely because it has a familiar name or repository origin.

## Guardrail engineering

Use [Guardrails](../../curriculum/10-security-governance/guardrails/) and continue in the same [Security Boundaries evidence contract](security-boundaries/).

Place checks on the boundary where a violation can still be prevented.

**Evidence:**

- guardrail threat/policy contract;
- input/output/tool placement map;
- one deterministic guardrail;
- one probabilistic guardrail where semantic classification is actually needed;
- labeled positive/negative/adversarial evaluation set;
- false-positive/false-negative measurements;
- blocking/parallel timing decision;
- side-effect-before-trip negative test;
- timeout/fail-open/fail-closed test;
- downstream context-aware validation;
- policy/model/schema/threshold release identity;
- one redundant or low-value guardrail removed.

**Decision:** keep a guardrail only when its placement, timing, error trade-off, and failure behavior materially reduce risk beyond the deterministic controls already present.

## Integrated security attack path

Reuse [Prompt Injection and Trust Boundaries](../../curriculum/10-security-governance/prompt-injection/) together with the other ready security routes.

Inject adversarial retrieved or tool content and treat model output as compromised.

At minimum prove:

- identity/session tampering is rejected;
- tenant context cannot be forged;
- the model cannot call an unexposed capability;
- the model cannot broaden user/tenant resource scope;
- high-impact actions cannot bypass approval;
- protected data cannot enter context without authorization;
- sensitive data cannot reach an unapproved external sink;
- sandboxed code cannot reach host/other-tenant files or forbidden network;
- untrusted model/data/runtime artifacts cannot silently enter production;
- guardrail placement cannot be bypassed through intermediate tool/handoff boundaries;
- logs, traces, cache, and streaming paths do not become alternate leak channels.

**Decision:** the security boundary passes only when deterministic controls remain correct even when malicious content successfully influences model behavior and probabilistic guardrails miss a case.

## AI risk governance

Use [AI Governance and Risk Management](../../curriculum/10-security-governance/safety-governance/) and the [Governance and Privacy evidence contract](governance-and-privacy/).

Turn the evidence already collected into an explicit risk decision.

**Evidence:**

- system/use boundary with excluded uses;
- affected-party map with one beneficial outcome and one potential harm;
- risk taxonomy and tolerance criteria written before scoring;
- versioned risk register with an evidence source for each high-priority risk;
- one foreseeable-misuse case;
- owner for each material risk and control;
- prevent/detect/mitigate/recover control mapping;
- residual-risk assessment and who accepted it;
- one materially uncertain risk and how it is tracked;
- obligation/applicability matrix separating internal policy from external obligations;
- one legal/compliance escalation;
- deployment decision: ship, ship with conditions, hold, restrict, or reject;
- post-release review triggers.

**Decision:** the system ships only under a recorded decision that names its evidence, owners, residual risk, and the triggers that reopen it.

## Privacy and data governance

Use [AI Privacy and Data Governance](../../curriculum/10-security-governance/privacy-legal/) and continue in the same [Governance and Privacy evidence contract](governance-and-privacy/).

Inventory the personal-data processing the system actually performs and make its lifecycle work.

**Evidence:**

- data-processing inventory verified against the running system;
- data-flow diagram;
- personal/sensitive/inferred-data classification;
- purpose and minimization decision per processing activity, with one collection removed;
- storage locations and processor/provider records, including model-provider data-use settings;
- logging/observability content policy;
- retention and deletion policy with its basis;
- one correction path through derived stores;
- one end-to-end deletion test across every relevant store;
- privacy-risk assessment kept separate from security threats;
- one anonymity/de-identification claim supported or rejected with evidence;
- impact-assessment trigger decision;
- one privacy/legal escalation;
- utility check after privacy controls;
- material privacy risks added to the AI risk register.

**Decision:** keep only the processing the purpose needs, and treat a deletion or anonymity claim as true only when a test or evidence shows it.

## Incident and feedback loop

Inject or analyze one failure:

- stale index;
- provider timeout;
- retrieval regression;
- malformed document;
- tool failure;
- prompt-injection attempt;
- cross-tenant access attempt;
- sandbox policy violation;
- poisoned/tampered artifact;
- guardrail false negative;
- deletion that leaves data in a derived store;
- product or data-processing change made without governance or privacy review.

Produce:

1. detection evidence;
2. user impact;
3. diagnosis;
4. mitigation;
5. durable regression test;
6. follow-up metric or alert;
7. governance and privacy change review with updated register and inventory versions.

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
