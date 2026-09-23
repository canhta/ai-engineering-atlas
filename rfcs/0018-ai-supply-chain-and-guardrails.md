# RFC 0018 — AI Supply Chain and Guardrails

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-23
- Reviewed: 2026-09-23
- Review decision: Approved by repository owner through continued implementation approval

## Summary

Promote two existing Security & Governance coverage nodes:

- `security.supply-chain-data` — AI Supply Chain and Data Security;
- `security.guardrails` — Guardrails.

No catalog node is added or removed.

## Why these belong together

The previous security routes established deterministic identity, tenant, permission, confidentiality, and runtime boundaries.

This batch adds two controls that operate across those boundaries:

- supply-chain integrity determines which code/model/data artifacts are allowed to become system behavior;
- guardrails validate untrusted inputs/outputs/tool calls at the point where policy violations can still be prevented.

Neither is allowed to replace the stronger deterministic controls already present.

## Supply-chain boundary

This route owns:

- AI artifact inventory;
- immutable artifact identity;
- supplier/source and provenance records;
- integrity/signature/hash verification;
- artifact admission/quarantine;
- data origin/transformation lineage;
- model/data poisoning tests;
- dependency/BOM impact analysis;
- revocation/rebuild/rollback after compromise.

A checksum or signature proves identity/integrity claims, not that an artifact is safe.

## Guardrail boundary

This route owns:

- guardrail objective and placement;
- deterministic versus probabilistic checks;
- input/output/tool boundaries;
- blocking versus parallel timing;
- downstream output validation;
- false-positive/false-negative calibration;
- timeout/failure behavior;
- policy versioning and telemetry;
- bypass tests and simplification.

A guardrail does not replace authorization, tenant isolation, tool permission, approval, sandboxing, or prompt-injection threat boundaries.

## Evidence reviewed

### OWASP LLM03:2025 — Supply Chain

Relevant sections:

- Common Examples of Risks;
- Prevention and Mitigation Strategies.

The source covers vulnerable dependencies/models/adapters, weak model provenance, supplier risk, BOM inventory, hashes/signatures, auditing, patching, and targeted evaluation.

### OWASP LLM04:2025 — Data and Model Poisoning

Relevant sections:

- Common Examples of Vulnerability;
- Prevention and Mitigation Strategies.

The source emphasizes data origin/transformation, unverified data, sandboxing, version control, adversarial testing, and model/retrieval integrity.

### CycloneDX — AI/ML-BOM

Relevant sections:

- Introduction to AI/ML-BOM;
- Highlights;
- model and dataset transparency/provenance.

### SLSA 1.2 — Provenance

Relevant section:

- Provenance;
- build provenance and source provenance.

### OWASP LLM05:2025 — Improper Output Handling

Relevant sections:

- Common Examples of Vulnerability;
- Prevention and Mitigation Strategies.

The source treats model output as untrusted downstream input and calls for context-aware validation/encoding rather than direct execution or interpretation.

### OpenAI Agents SDK — Guardrails

Relevant sections:

- Workflow boundaries;
- Input guardrails;
- Execution modes;
- Output guardrails;
- Tool guardrails;
- Tripwires.

This is used as a concrete runtime example of placement and timing. The curriculum remains framework-independent.

## Knowledge Assistant integration

Extend:

`projects/knowledge-assistant/security-boundaries/`

Insert before the integrated attack path:

1. `supply-chain-and-data-integrity`;
2. `guardrail-engineering`.

## Promotion gate

- [x] existing catalog IDs are reused;
- [x] promoted prerequisites are already ready;
- [x] inventory covers model/data/runtime artifacts, not only Python packages;
- [x] immutable identity is distinguished from provenance and trust;
- [x] model/data poisoning has targeted failure tests;
- [x] unsafe artifact loading is quarantined/sandboxed or avoided;
- [x] compromised dependencies can be traced to deployed releases;
- [x] guardrail placement maps to actual workflow boundaries;
- [x] deterministic checks are preferred for exact properties;
- [x] probabilistic checks have measured false-positive/false-negative behavior;
- [x] side-effect timing is explicit;
- [x] guardrail timeout/failure behavior is tested;
- [x] guardrails do not replace authorization/permissions/sandboxing;
- [x] at least one unnecessary dependency and one low-value guardrail are removed;
- [x] learner-facing source locators are explicit;
- [x] repository validators must pass before completion.

## Impact

After implementation:

- Security & Governance becomes **10 / 8 ready**;
- repository counts become **115 catalog / 41 ready / 74 coverage**.

Only AI Safety and Governance plus Privacy Governance Legal and Responsible AI remain as Security & Governance synthesis nodes.
