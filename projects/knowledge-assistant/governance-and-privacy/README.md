# Governance and Privacy Evidence Contract

Extend the same Knowledge Assistant. Do not start a new system or write a principles document.

Reuse the evidence already built: the product brief, evaluation records, release manifests and decisions, drift and incident records, and the security boundaries (tenant isolation, sensitive-data flow, guardrails). Governance and privacy decisions must cite that evidence.

```text
existing production + security system
→ intended use and affected parties
→ risk register, owners, controls
→ deployment decision
→ data-processing inventory
→ minimize / retain / correct / delete deliberately
→ deletion test
→ applicability matrix + escalation
→ incident or change review
→ updated risk and privacy decisions
```

Routes: [AI Governance and Risk Management](../../../curriculum/10-security-governance/safety-governance/) and [AI Privacy and Data Governance](../../../curriculum/10-security-governance/privacy-legal/).

## Legal boundary

Keep three kinds of statement apart:

```text
engineering fact      → what the system and its data processing actually do
applicability fact    → which jurisdiction, role, sector, data type, and use case may trigger an obligation
legal interpretation  → a qualified privacy, legal, or compliance reviewer
```

Build an evidence package a reviewer can check. Do not write legal conclusions yourself, and do not accept a model's legal conclusions as evidence.

## Stage 1 — risk register

Use [ai-risk-register.template.md](ai-risk-register.template.md).

Define the system and use boundary, affected parties, risk taxonomy, and tolerance criteria before scoring individual risks. Every material risk needs evidence, an owner, controls, and a residual-risk assessment.

## Stage 2 — obligations and escalation

Use [obligation-applicability-matrix.template.md](obligation-applicability-matrix.template.md) and [escalation-record.template.md](escalation-record.template.md).

Separate internal policy from external obligations. For each external source record jurisdiction, version/date, applicability assumption, unresolved interpretation, and escalation owner. Escalate at least one governance question and one privacy question.

## Stage 3 — deployment decision

Use [governance-decision.template.md](governance-decision.template.md).

Decide ship, ship with conditions, hold, restrict, or reject from a named register version. Record conditions, accepted residual risk, and review triggers.

## Stage 4 — data-processing inventory

Use [data-processing-inventory.template.md](data-processing-inventory.template.md).

Inventory every processing activity, including model-provider calls, logs and traces, caches, vector stores, memories, analytics, feedback, and evaluation reuse. Verify the inventory against the running system and configuration, not against the design document.

## Stage 5 — privacy risk

Use [privacy-risk-assessment.template.md](privacy-risk-assessment.template.md).

Name problematic data actions separately from security threats. Support or reject one anonymity or de-identification claim with evidence. Record the impact-assessment trigger decision. Add material privacy risks to the Stage 1 register.

## Stage 6 — retention, correction, and deletion

Use [retention-deletion-record.template.md](retention-deletion-record.template.md).

Use synthetic users. Run one deletion end to end across every relevant store and one correction through derived stores. Record where data persists after deletion and for how long.

## Stage 7 — change review

Use [change-review.template.md](change-review.template.md).

Apply one incident or product change, for example a new data source, reuse of conversations for evaluation, a provider setting change, or the incident from the incident-and-feedback milestone. Show which register rows, inventory rows, and applicability rows changed, and publish new versions.

## Exit condition

Another engineer should be able to open this package and find a deployment decision traceable to evidence, owners, and residual risk; a verified processing inventory; a deletion test they can rerun; and every legal interpretation routed to a named reviewer.

A list of responsible AI principles or a statement that "we do not store PII" is not sufficient evidence.
