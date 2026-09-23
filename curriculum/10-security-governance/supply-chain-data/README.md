# AI Supply Chain and Data Security

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [OWASP LLM03:2025 Supply Chain](https://genai.owasp.org/llmrisk/llm032025-supply-chain/) | Sections "Common Examples of Risks" and "Prevention and Mitigation Strategies", especially weak provenance, vulnerable models/adapters, BOM inventory, hashes/signing, supplier vetting, and patching | Expand software supply-chain thinking to AI models, adapters, datasets, model providers, and development/deployment platforms. |
| [OWASP LLM04:2025 Data and Model Poisoning](https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/) | Sections "Common Examples of Vulnerability" and "Prevention and Mitigation Strategies", especially data origins/transformations, unverified data, sandboxing, version control, and robustness testing | Treat model, fine-tuning, embedding, and retrieval-data manipulation as integrity attacks that require lineage, controlled ingestion, and adversarial tests. |
| [CycloneDX — Machine Learning Bill of Materials (AI/ML-BOM)](https://cyclonedx.org/capabilities/mlbom/) | Sections "Introduction to AI/ML-BOM", "Highlights", and the model/dataset transparency guidance | Use an AI/ML BOM as a concrete inventory pattern for models, datasets, configuration, dependencies, provenance, and security/risk review. |
| [SLSA 1.2 — Provenance](https://slsa.dev/spec/v1.2/provenance) | Section "Provenance" and the distinction between build provenance and source provenance | Ground provenance as verifiable information about where, when, and how an artifact was produced without confusing provenance with an assertion that the artifact is safe. |
<!-- learning-sources:end -->

## Why this matters

Modern AI behavior is assembled from code, hosted or downloaded models, adapters, prompts, data, indexes, tools, packages, containers, and suppliers. If you cannot name and verify those inputs, you cannot reliably explain or revoke the production behavior they create.

## 1. Diagnostic first

Before studying the sources:

- inventory every external artifact that can change one Knowledge Assistant release;
- separate hash/signature evidence from provenance and trust;
- define what happens before an untrusted model/data/package reaches production;
- trace one poisoned data snapshot into derived indexes and releases;
- identify every deployment affected when one upstream component is declared compromised.

If the answer is only “scan it” or “add a classifier,” keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these distinctions explicit:

```text
identity
→ exactly which artifact/version is this?

integrity
→ are these the expected bytes?

provenance
→ where/how did this artifact come into existence?

trust/admission
→ do we allow this artifact into our system?

safety/quality
→ does it behave acceptably for our product?

lineage
→ what downstream artifacts/releases were derived from it?
```

A signed malicious artifact is still malicious.

## 3. Independent practice

Use the [Security Boundaries evidence contract](../../../projects/knowledge-assistant/security-boundaries/).

Build the Knowledge Assistant AI/ML supply-chain inventory, add admission checks, and exercise both artifact tampering and targeted data poisoning.

## 4. Failure work

- mutable name points to changed bytes;
- unsafe serialized model/package artifact;
- poisoned retrieval corpus;
- targeted backdoor missed by aggregate metrics;
- missing provenance with intact hash;
- compromised supplier requiring impact analysis and rebuild.

## 5. Exit evidence

You are at **demonstrated** when another engineer can identify every critical upstream artifact, verify its identity/provenance/admission evidence, replay tampering/poisoning tests, and trace a compromise through derived artifacts to deployed releases and recovery.

## 6. Transfer

Move the controls to a self-hosted/fine-tuned system with open weights, adapters, GPU containers, external datasets, and a different build chain.

## 7. Applied evidence

Applied evidence is a production admission and inventory system that can prevent or rapidly bound compromise of an AI model/data/software dependency.
