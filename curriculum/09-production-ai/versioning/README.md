# Model Prompt and Retrieval Versioning

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [MLflow — Model Registry](https://mlflow.org/docs/latest/model-registry/) | Sections "Why Model Registry?" and "Concepts", especially Model Version, Model Alias, and Tags | Distinguish specific model-version identity from mutable deployment indirection and lifecycle metadata. |
| [MLflow — Model Registry Workflows](https://mlflow.org/docs/latest/ml/model-registry/workflow/) | Sections "Fetching an MLflow Model from the Model Registry", "Model version tags", and "Model version aliases" | See how a mutable alias can move independently of production code and why release evidence must preserve the resolved concrete model version. |
| [MLflow Prompt Registry — Manage Prompt Lifecycles](https://mlflow.org/docs/latest/genai/prompt-registry/manage-prompt-lifecycles-with-aliases/) | Sections "Commit-based Versioning", "Compare Prompt Versions", and "Aliases" | Study immutable prompt revisions, mutable environment aliases, prompt diffs, and rollback without assuming the alias itself is a release identity. |
| [MLflow Prompt Registry — Use Prompts in Apps](https://mlflow.org/docs/latest/genai/prompt-registry/use-prompts-in-apps/) | Sections "Loading Prompts from the Registry" and "Linking Prompts to Logged Models for Full Lineage" | Connect the exact prompt version used at runtime to model/application lineage rather than preserving only a mutable prompt alias. |
| [DVC — Command Reference](https://dvc.org/doc/command-reference/) | Section "Typical DVC workflow" | Inspect one implementation pattern for versioning data and pipeline dependencies so retrieval state can identify the corpus and build configuration that produced an index. |
| [Pro Git — Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) | Sections "Git Objects", "Tree Objects", and "Commit Objects" | Build a compact content-addressed snapshot mental model for a release manifest that references multiple behavior-defining artifacts. |
<!-- learning-sources:end -->

## Why this matters

A production AI system is not one version number.

The same application code can behave differently because a model alias moved, inference settings changed, a prompt alias moved, an index was rebuilt from different data, a tool schema changed, or a policy/config flag changed.

Versioning gives the whole behavior-defining artifact set a concrete release identity.

## 1. Diagnostic first

Before studying the sources, explain:

- which artifacts can change behavior without an application-code change;
- why a mutable production or latest alias is not enough incident evidence;
- how two retrieval indexes with the same logical name can still represent different system states;
- what a rollback must identify beyond the previous container image.

If the answer is only "store the Git commit," keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
immutable artifact version
→ identifies one concrete artifact

mutable alias
→ points to whichever concrete version is assigned now

release manifest
→ identifies the complete behavior-defining artifact set

deployment status
→ says where an artifact is exposed, not what it is
```

Do not assume a prompt version freezes inference settings or that an index name identifies its underlying data/build state.

## 3. Independent practice

Use the [Release Lifecycle evidence contract](../../../projects/knowledge-assistant/release-lifecycle/).

Create current and candidate manifests, preserve alias resolution, link traces and evaluation to the manifest, reject unresolved latest-style references, and restore the previous manifest.

## 4. Failure work

Deliberately create:

- a prompt alias that moves after an old release was recorded;
- an inference-config-only change;
- a retrieval rebuild under the same logical index name;
- a tool or policy change;
- an unresolved latest-style candidate reference.

The release identity should expose every one of these changes.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect current and candidate manifests, reproduce the manifest diff, follow trace/evaluation links to the correct release, resolve mutable aliases to concrete versions, and restore a complete known-good behavior set.

A list of environment names is not sufficient.

## 6. Transfer

Redesign the manifest for a system where the model is stable but data, tools, or policy changes independently.

## 7. Applied evidence

Applied evidence is release identity that makes a real incident, replay, or rollback more precise—and deliberately omits redundant version fields that do not improve reproducibility or control.
