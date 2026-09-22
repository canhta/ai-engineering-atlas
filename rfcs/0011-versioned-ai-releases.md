# RFC 0011 — Versioned AI Releases

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Summary

Promote the next two concrete Production AI capabilities after model gateway and observability:

- `production.versioning` — Model Prompt and Retrieval Versioning;
- `production.release-engineering` — AI Release Engineering.

Do not add new catalog nodes.

The dependency order should be:

```text
ai.evaluation
      │
      ├──────────────┐
      ▼              ▼
production.     production.
observability  versioning
      │              │
      └──────┬───────┘
             ▼
production.release-engineering
```

Versioning comes first because a release, rollback, trace, or replay is ambiguous when the system cannot identify the exact model, prompt, retrieval, tool, application, and policy state that produced behavior.

Release engineering then uses that immutable release identity plus evaluation and production signals to decide whether to expose, promote, abort, or roll back a change.

## Why this slice now

The first Production AI slice established:

- provider/gateway control;
- request correlation;
- privacy-safe traces and metrics;
- diagnostic replay based on provenance.

The Knowledge Assistant already has a generic release-gate milestone, and `ai.evaluation` already teaches the learner to define release criteria.

What remains undefined is the production capability between those two layers:

1. **What exact system state is the release candidate?**
2. **How is that candidate compared with the current production state?**
3. **How does a rollout expose risk gradually?**
4. **Which evidence promotes, pauses, aborts, or rolls back the change?**
5. **What exact prior state is restored during rollback?**

Without versioned release identity, "rollback the prompt", "use the old model", or "restore the previous index" can silently restore only part of the AI system.

Without release engineering, evaluation remains offline evidence rather than an operational decision process.

## Evidence reviewed

The sources below were rechecked on 2026-09-22.

They are proposed as evidence and teaching references, not as mandatory frameworks.

### MLflow Model Registry — model versions, aliases, and tags

Current documentation:

- <https://mlflow.org/docs/latest/model-registry/>
- <https://mlflow.org/docs/latest/ml/model-registry/workflow/>

Relevant sections:

- "Why Model Registry?";
- "Concepts";
- "Model Version";
- "Model Alias";
- "Tags";
- "Deploy and Organize Models with Aliases and Tags";
- "Migrating from Stages".

Key evidence:

- model versions give a specific identity;
- aliases such as `champion` are mutable named references to versions;
- aliases can be reassigned without changing serving code;
- version tags can record validation state;
- production workflows need lineage between the deployed version and the work that produced it.

Curriculum implication:

> a mutable deployment alias is useful for indirection, but incident, evaluation, release, and rollback evidence should record the resolved immutable version as well.

### MLflow Prompt Registry — immutable prompt versions and mutable aliases

Current documentation:

- <https://mlflow.org/docs/latest/genai/prompt-registry/>
- <https://mlflow.org/docs/latest/genai/prompt-registry/manage-prompt-lifecycles-with-aliases/>
- <https://mlflow.org/docs/latest/genai/prompt-registry/use-prompts-in-apps/>

Relevant sections:

- "Commit-based Versioning";
- "Compare Prompt Versions";
- "Aliases";
- "Loading Prompts from the Registry";
- "Linking Prompts to Logged Models for Full Lineage".

Key evidence:

- prompt versions are immutable;
- aliases such as `production` and `latest` are mutable;
- a specific prompt version can be loaded independently of an alias;
- prompt/model lineage supports reproducibility and impact analysis.

Important boundary:

MLflow also documents mutable model configuration attached to prompt versions.

Therefore this curriculum should **not** assume that "prompt version" automatically freezes every behavior-defining inference setting.

The release identity must pin or hash the actual configuration used.

### DVC — versioned data and reproducible pipeline state

Current documentation:

- <https://dvc.org/doc/command-reference/>

Relevant locator:

- "Typical DVC workflow".

Key evidence:

- data artifacts can be tracked through references stored with source control;
- a pipeline can declare dependencies and outputs;
- previous data/pipeline state can be restored or reproduced.

Curriculum implication:

Retrieval identity should not be only an index name such as `prod-index`.

A production release needs enough lineage to identify the corpus/data snapshot and index-building configuration that created the retrieval state.

DVC is one implementation example, not a required dependency.

### Git — content-addressed snapshots

Current reference:

- <https://git-scm.com/book/en/v2/Git-Internals-Git-Objects>

Relevant sections:

- "Git Objects";
- "Tree Objects";
- "Commit Objects".

Key evidence:

- content-addressed objects provide stable identity for content;
- trees identify a snapshot of multiple objects;
- commits reference a tree plus history metadata.

Curriculum implication:

A useful mental model for an AI release manifest is a snapshot that references the exact identities of multiple behavior-defining artifacts rather than a bag of mutable "latest" names.

The route does not require implementing Git internals.

### Google SRE Workbook — canarying releases

Current reference:

- <https://sre.google/workbook/canarying-releases/>

Relevant sections include:

- the chapter introduction and canary definition;
- "Minimizing Risk to SLOs and the Error Budget";
- canary population and duration considerations;
- analysis of canary versus control behavior.

Key evidence:

- a canary is a partial, time-limited deployment plus evaluation;
- limited exposure reduces release risk;
- a control population provides a comparison point;
- release evidence should be tied to service objectives rather than "the deploy completed".

### Argo Rollouts — progressive delivery and analysis

Current references:

- <https://argo-rollouts.readthedocs.io/en/stable/features/analysis/>
- <https://argo-rollouts.readthedocs.io/en/stable/features/rollback/>
- <https://argo-rollouts.readthedocs.io/en/stable/getting-started/>

Relevant sections:

- "Background Analysis";
- "Inline Analysis";
- "Failure Conditions and Failure Limit";
- "Rollback Windows";
- basic update, promotion, and abortion workflow.

Key evidence:

- analysis can run during rollout or block a rollout step;
- success can promote;
- failure can abort;
- inconclusive evidence should not be silently treated as success;
- a stable prior revision can be used for rollback;
- rollback mechanics and analysis policy are separate concerns.

Argo Rollouts is a concrete production reference, not the required release platform.

## Proposed capability 1 — `production.versioning`

### Title

Model Prompt and Retrieval Versioning

### Target

- level: **L3**
- competency types:
  - engineering skill;
  - system operation;
  - design judgment;
  - production competency.
- target states:
  - demonstrated;
  - transferred;
  - applied.

### Why this is one competency

An AI application's behavior is usually produced by a **set** of artifacts:

- application code;
- provider and requested model;
- resolved/actual model when the provider exposes it;
- inference parameters;
- prompt/template;
- response schema;
- retrieval corpus or data snapshot;
- embedding model;
- chunking/index build configuration;
- retrieval/reranking configuration;
- tool schemas and tool configuration;
- gateway route/policy;
- safety/policy configuration;
- feature/config flags.

Versioning only the model or only the prompt does not identify the production system.

The competency is therefore the ability to create and operate **release identity and lineage across behavior-defining AI artifacts**.

It is not a tutorial for one model or prompt registry.

### Boundary with adjacent competencies

`production.versioning` should **not** become:

- Git fundamentals;
- a model registry product tutorial;
- `ai.evaluation` — evaluation judges candidate behavior;
- `production.observability` — observability records execution evidence;
- `production.release-engineering` — release engineering decides how a candidate reaches users;
- `data.ai-data-engineering` — data engineering owns broader data lifecycle and pipelines;
- exact deterministic reproduction of a stochastic model response.

Versioning identifies the system state that evaluation, traces, replay, release, and rollback refer to.

### Prerequisites

Proposed prerequisites:

- `ai.evaluation`;
- `production.observability`.

No coverage-only prerequisite is required for the first version of this route.

### Observable outcomes

The learner should be able to:

- enumerate the artifacts that can materially change an AI system's behavior;
- distinguish immutable version identity from a mutable alias or environment label;
- resolve an alias such as `production` or `latest` to the concrete version used for a request or release;
- create one release manifest that pins the behavior-defining artifact set;
- record requested and actual model identity when the provider exposes both;
- pin or hash inference parameters rather than assuming a prompt version freezes them;
- identify prompt/template and response-schema versions;
- identify retrieval corpus/data snapshot, embedding model, chunking/index configuration, and retrieval/reranking configuration;
- identify tool schema/config and gateway policy versions when they participate in behavior;
- distinguish an artifact version from deployment status or validation status;
- compare two manifests and explain which behavior-defining inputs changed;
- define compatibility rules for artifacts that may evolve independently;
- connect traces, evaluation runs, incident records, and replay records to a release manifest;
- choose a known-good rollback manifest rather than reconstructing one from memory;
- avoid unresolved `latest` references in release and incident evidence;
- decide when a component does **not** need an independent version and can inherit identity from an existing immutable snapshot.

### Diagnostic

A learner should attempt these before studying:

1. Given a Knowledge Assistant release, list every artifact whose change could alter the final answer even if application code is unchanged.
2. Explain why recording `prompt=production` and `model=latest` is insufficient incident evidence.
3. Design a manifest that can distinguish an old retrieval index built from corpus A from a rebuilt index using the same logical index name.
4. Given a rollback request, state the minimum identity required to restore a known-good behavior set rather than only the previous container image.

Skip introductory material only if the learner can identify cross-artifact release state, distinguish immutable identity from mutable aliases, and produce a replay/rollback-safe manifest.

### Proposed learning route

Mental-model sources:

1. **MLflow Model Registry**
   - locator: "Concepts" entries for Model Version, Model Alias, and Tags;
   - purpose: distinguish immutable/specific model identity from mutable deployment indirection and lifecycle metadata.

2. **MLflow Prompt Registry — Manage Prompt Lifecycles**
   - locator: "Commit-based Versioning", "Compare Prompt Versions", and "Aliases";
   - purpose: study immutable prompt revisions, mutable environment aliases, diffing, A/B use, and rollback.

3. **MLflow Prompt Registry — Use Prompts in Apps**
   - locator: "Loading Prompts from the Registry" and "Linking Prompts to Logged Models for Full Lineage";
   - purpose: connect the resolved prompt version to the model/application lineage rather than recording only an alias.

4. **DVC Command Reference**
   - locator: "Typical DVC workflow";
   - purpose: inspect one pattern for tracking data/pipeline dependencies and restoring versioned data state.

5. **Git Internals — Git Objects**
   - locator: "Git Objects", "Tree Objects", and "Commit Objects";
   - purpose: build the snapshot/content-identity mental model used by the cross-artifact release manifest.

Guided practice:

- take one successful Knowledge Assistant trace and build the smallest release manifest that could explain and reconstruct its behavior-defining state.

Independent practice:

- extend the Knowledge Assistant with a versioned release manifest;
- create two candidate manifests where only one behavior-defining artifact changes;
- link evaluation and trace evidence to each manifest;
- roll the system backward using the prior manifest.

### Required experiments

- move a mutable prompt alias to a new prompt version while preserving the old release record and verify the old record still resolves to the old concrete version;
- change an inference parameter without changing prompt text and verify the release identity changes;
- rebuild retrieval state under the same logical index/environment name and verify the data/build identity distinguishes it;
- change one tool schema or policy config and verify the manifest diff exposes it;
- inject an unresolved `latest` reference into a candidate and make the release check fail;
- replay or diagnose one prior request using the manifest recorded on the trace;
- restore one known-good manifest and verify the system does not accidentally retain a newer prompt, retrieval, tool, or policy artifact.

### Required exit evidence

Evidence must include:

- artifact inventory;
- release-manifest schema;
- one current production manifest;
- one candidate manifest;
- manifest diff;
- concrete model identity;
- concrete prompt/template identity;
- inference/config identity;
- retrieval data/index build identity;
- tool/gateway/policy identity where applicable;
- trace-to-manifest linkage;
- evaluation-to-manifest linkage;
- one mutable-alias resolution test;
- one `latest` rejection or resolution test;
- one rollback to a known-good manifest;
- one decision documenting which state intentionally inherits an existing version instead of receiving a redundant new version.

### Transfer

Apply the manifest design to a different system in which the model is stable but the dataset, tool catalog, or policy layer changes independently.

The learner should be able to redesign the artifact graph instead of copying the Knowledge Assistant manifest field-for-field.

## Proposed capability 2 — `production.release-engineering`

### Title

AI Release Engineering

### Target

- level: **L3**
- competency types:
  - engineering skill;
  - system operation;
  - design judgment;
  - production competency.
- target states:
  - demonstrated;
  - transferred;
  - applied.

### Why this is one competency

AI release engineering combines:

- a versioned release candidate;
- pre-release evaluation;
- operational deployment;
- bounded user exposure;
- live evidence;
- promotion/abort rules;
- rollback or graceful degradation;
- post-release feedback.

This is distinct from general CI syntax and distinct from evaluation alone.

The learner must make a production change **reversible and evidence-gated**.

### Boundary with adjacent competencies

`production.release-engineering` should **not** become:

- a GitHub Actions tutorial;
- a Kubernetes or Argo Rollouts tutorial;
- `ai.evaluation` — offline or online evaluation defines quality evidence;
- `production.observability` — telemetry supplies live operational evidence;
- `production.versioning` — versioning defines the candidate and rollback identities;
- `production.model-gateway` — gateway routing may implement traffic allocation but is not the release process;
- `production.drift` — drift monitors longer-term behavior after deployment.

Release engineering turns versioned changes and evidence into controlled production decisions.

### Prerequisites

Proposed prerequisites:

- `ai.evaluation`;
- `production.observability`;
- `production.versioning`;
- `systems.cloud-infrastructure`.

`systems.cloud-infrastructure` is currently coverage-only and therefore requires a targeted prerequisite bridge.

Proposed bridge:

- diagnostic: explain rolling versus canary deployment, stable/current version identity, traffic exposure, abort, and rollback;
- source: Argo Rollouts "Basic Usage";
- locator: sections "Updating a Rollout", "Promoting a Rollout", and "Aborting a Rollout";
- purpose: patch the deployment-control vocabulary needed for progressive AI releases without requiring the entire cloud infrastructure curriculum.

### Observable outcomes

The learner should be able to:

- define a release candidate by immutable manifest identity;
- record the current known-good manifest before rollout;
- require a versioned evaluation set and explicit offline gates before production exposure;
- distinguish blocking quality gates from informational metrics;
- define operational latency/error/cost constraints separately from AI quality constraints;
- choose between direct rollout, rolling update, canary, shadow, or a no-release decision based on risk;
- define canary population, duration, and exposure limits;
- preserve a control/current population when the comparison requires one;
- account for stochastic variance and delayed outcomes before promotion;
- define success, failure, and inconclusive states;
- pause rather than promote when evidence is inconclusive;
- promote a candidate only when declared gates pass;
- abort or roll back when failure thresholds are crossed;
- roll back to an explicit known-good manifest;
- distinguish application rollback from provider fallback or graceful degradation;
- verify the rollback itself rather than treating the rollback command as success;
- convert production failures into evaluation/regression cases;
- record the release decision, evidence, and operator/automation action;
- decide when progressive rollout complexity is unnecessary for a low-risk reversible change.

### Diagnostic

Before study, the learner should:

1. turn an evaluation result into explicit release-blocking and non-blocking criteria;
2. design a canary for an AI change where answer quality is stochastic and latency can regress independently;
3. explain what should happen when infrastructure health is good but AI quality evidence is inconclusive;
4. describe exactly what state a rollback restores and how to verify the rollback completed.

Skip introductory material only if the learner can connect candidate identity, evaluation, bounded exposure, live telemetry, promotion/abort logic, and verified rollback into one release process.

### Proposed learning route

Mental-model sources:

1. **Google SRE Workbook — Canarying Releases**
   - locator: chapter introduction/canary definition and "Minimizing Risk to SLOs and the Error Budget";
   - purpose: model a canary as partial, time-limited exposure plus evaluation and connect exposure size to production risk.

2. **Argo Rollouts — Analysis & Progressive Delivery**
   - locator: "Background Analysis", "Inline Analysis", and "Failure Conditions and Failure Limit";
   - purpose: inspect concrete promotion, abort, failure, and inconclusive control semantics driven by measured signals.

3. **Argo Rollouts — Rollback Windows**
   - locator: "Rollback Windows";
   - purpose: distinguish normal progressive rollout from fast restoration of a known stable revision.

4. **Argo Rollouts — Basic Usage**
   - locator: "Updating a Rollout", "Promoting a Rollout", and "Aborting a Rollout";
   - purpose: provide the cloud/deployment prerequisite bridge and a concrete lifecycle without making Argo mandatory.

Existing internal prerequisite:

- `ai.evaluation` supplies versioned eval data, failure slices, repeated-run variance, and explicit release criteria;
- `production.observability` supplies correlated live signals;
- `production.versioning` supplies candidate/current/rollback identity.

### Guided practice

Given one Knowledge Assistant prompt + retrieval change:

- identify the candidate manifest;
- choose offline gates;
- choose production exposure;
- define live quality and operational signals;
- define success/failure/inconclusive thresholds;
- define rollback target and verification.

### Independent practice

Release one Knowledge Assistant candidate through the project evidence package.

The learner must:

- preserve the current manifest;
- run the frozen pre-release evaluation;
- expose the candidate to bounded traffic or a realistic rollout simulation;
- inject one operational regression and one AI-quality regression;
- exercise abort/rollback;
- verify restoration;
- convert the failure into a durable regression case.

### Required experiments

- fail the offline quality gate and prove no production exposure occurs;
- pass offline quality but inject a live latency/error regression and abort the rollout;
- inject an AI-quality regression while infrastructure health remains green and verify the release still blocks or rolls back;
- create an inconclusive signal and verify it does not silently promote;
- roll back to the explicit previous manifest and verify prompt/retrieval/tool/config state all match the target;
- compare progressive rollout with a direct deployment for a small reversible change and record when canary complexity is not justified;
- convert one rollout failure into the versioned evaluation set.

### Required exit evidence

Evidence must include:

- candidate release manifest;
- current known-good manifest;
- release plan;
- versioned evaluation set/reference;
- offline gate results;
- rollout strategy and exposure limits;
- success/failure/inconclusive criteria;
- live quality and operational signals;
- one canary/progressive rollout or realistic simulation;
- one failed release;
- one abort;
- one rollback to an explicit manifest;
- rollback verification;
- release decision record;
- one new regression case derived from release failure;
- one decision explaining whether progressive delivery complexity was justified.

A green deployment status without AI-quality evidence is not sufficient.

A high offline evaluation score without production failure/rollback work is not sufficient.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/release-lifecycle/`

This should extend the same system and evidence lineage.

Proposed progression:

```text
current production manifest
→ candidate manifest
→ manifest diff
→ frozen evaluation gate
→ release plan
→ bounded exposure
→ live analysis
→ promote / pause / abort
→ rollback drill
→ verified known-good state
→ production failure becomes regression case
```

Proposed artifacts:

- artifact inventory;
- release-manifest schema;
- current manifest;
- candidate manifest;
- manifest diff;
- alias-resolution test;
- evaluation gate record;
- release plan;
- live analysis record;
- failed-release record;
- rollback record;
- rollback verification;
- regression-case update;
- final release decision.

The current generic Knowledge Assistant `release-gate` milestone should become two explicit milestones:

1. `versioned-release-candidate`;
2. `progressive-release-and-rollback`.

Security failure work and incident feedback remain later milestones.

## Promotion gate

Neither competency should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. exact source locators are rechecked during route authoring;
3. official/current sources are registered only after approval;
4. `production.versioning` has no unresolved coverage-only prerequisite;
5. `production.release-engineering` has a targeted `systems.cloud-infrastructure` prerequisite bridge;
6. the Knowledge Assistant release-lifecycle package is inspectable;
7. a release manifest identifies the behavior-defining artifact set;
8. mutable aliases resolve to concrete versions in release/trace evidence;
9. unresolved `latest` references do not survive the release boundary;
10. retrieval identity includes enough data/build lineage to distinguish rebuilds;
11. inference/config identity is not silently assumed to be frozen by prompt identity;
12. trace and evaluation evidence link to a release manifest;
13. release engineering uses a versioned current and candidate manifest;
14. offline gates are explicit and frozen before result inspection;
15. live quality signals are not replaced by infrastructure health;
16. success, failure, and inconclusive rollout states are explicit;
17. at least one release is aborted;
18. rollback targets an explicit known-good manifest;
19. rollback is verified after execution;
20. at least one release failure becomes a durable regression case;
21. progressive delivery is rejected when its complexity is not justified;
22. prerequisite-cycle validation passes;
23. learner-facing source blocks are generated;
24. `curriculum/STATUS.md` and `site/src/data/atlas.json` are regenerated only through repository generators;
25. `make check` and `make site-check` pass;
26. review outcome is recorded before promotion.

## Alternatives considered

### Promote `production.mlops-llmops` next

Rejected.

It is still an umbrella label spanning versioning, deployment, observability, drift, cost, data pipelines, and release operations.

Concrete capabilities should be taught and evidenced first.

### Promote `production.architecture` next

Rejected.

The learner now has concrete provider/gateway and observability boundaries, but architecture is still better treated as a later synthesis capability.

### Version only the model

Rejected.

Prompt, retrieval, tools, policy, and configuration can alter behavior independently.

### Version only source code

Rejected.

External model identity, mutable prompt aliases, data/index state, and runtime configuration can change behavior without an application-code commit.

### Treat an alias as the release version

Rejected.

Aliases are intentionally mutable.

They are useful deployment pointers, but release, trace, incident, and rollback evidence must preserve the concrete resolved identity.

### Require one registry product

Rejected.

Model/prompt registries are implementation examples.

The transferable competency is release identity and lineage.

### Require canary for every change

Rejected.

Progressive delivery has operational cost.

A low-risk, immediately reversible change may justify a simpler rollout if the decision is explicit.

### Promote when infrastructure health is green

Rejected.

An AI system can return healthy HTTP responses while answer quality, grounding, tool behavior, latency, or cost regresses.

### Roll back only the application image

Rejected.

That can leave a newer prompt, retrieval index, tool contract, model alias, or policy configuration active.

### Treat inconclusive analysis as success

Rejected.

Insufficient evidence should pause or require an explicit operator decision rather than silently expand exposure.

## Impact

If approved and fully implemented:

- `production.versioning` moves from `coverage` to `ready`;
- `production.release-engineering` moves from `coverage` to `ready`;
- no catalog node is added or removed;
- repository counts become:
  - **115** catalog competencies;
  - **27** ready routes;
  - **88** coverage-only competencies;
- Production AI becomes **11 / 4 ready**.

### Proposed resources after approval

Register current sources such as:

- MLflow Model Registry;
- MLflow Model Registry workflows;
- MLflow Prompt Registry;
- MLflow Prompt Lifecycle / aliases;
- MLflow prompt-to-model lineage;
- DVC command reference;
- Pro Git — Git Objects;
- Google SRE Workbook — Canarying Releases;
- Argo Rollouts — Analysis & Progressive Delivery;
- Argo Rollouts — Rollback Windows;
- Argo Rollouts — Basic Usage.

These are evidence/examples, not required platforms.

## Review checklist

- [x] Versioning is defined across the AI behavior artifact set rather than only the model.
- [x] Immutable versions and mutable aliases are distinguished.
- [x] Prompt identity does not silently freeze mutable inference configuration.
- [x] Retrieval rebuild/data identity is represented.
- [x] Release manifests link to trace, evaluation, replay, and rollback evidence.
- [x] Release engineering depends on versioned candidate identity.
- [x] Offline AI quality gates and live operational gates remain distinct.
- [x] Live AI quality cannot be replaced by HTTP/service health alone.
- [x] Success, failure, and inconclusive rollout outcomes are explicit.
- [x] Progressive rollout is optional when simpler release mechanics are safer and sufficient.
- [x] Rollback targets and verifies a complete known-good release manifest.
- [x] Production failures feed durable regression evidence.
- [x] MLflow, DVC, Google SRE, and Argo are examples rather than mandatory frameworks.
- [x] `production.mlops-llmops` remains intentionally deferred.
- [x] Reviewer explicitly approves or requests changes before route implementation.
