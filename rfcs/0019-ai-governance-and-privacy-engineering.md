# RFC 0019 — AI Governance and Privacy Engineering Slice

- Status: Accepted (owner approval, 2026-09-24)
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-23
- Reviewed: 2026-09-24
- Review decision: Approved by the repository owner on 2026-09-24, including both learner-facing title changes

## Problem

The Security & Governance domain is now 8 / 10 ready.

Two coverage nodes remain:

- `security.safety-governance` — AI Safety and Governance
- `security.privacy-legal` — Privacy Governance Legal and Responsible AI

Both titles are too broad to become useful learner routes as written.

They currently mix several different concerns:

```text
"safety / governance"
→ risk identification
→ deployment decision
→ accountability
→ policy
→ monitoring
→ impact assessment

"privacy / legal / responsible AI"
→ privacy engineering
→ data lifecycle
→ rights / retention / deletion
→ legal applicability
→ compliance
→ fairness / responsible AI
```

The repository should not preserve vague umbrella topics by writing equally vague lessons.

This RFC proposes keeping the stable IDs while narrowing the learner-facing capabilities to:

- `security.safety-governance` → **AI Governance and Risk Management**
- `security.privacy-legal` → **AI Privacy and Data Governance**

"Legal compliance" remains part of the evidence contract through jurisdiction/applicability mapping and escalation. It is not treated as a universal engineering rule or as legal advice.

"Responsible AI" becomes an outcome of explicit risk, impact, privacy, evaluation, oversight, and accountability work rather than a standalone slogan.

## Evidence

### NIST AI Risk Management Framework 1.0

https://airc.nist.gov/airmf-resources/airmf/5-sec-core/

Verified sections:

- **5 AI RMF Core**
- **5.1 Govern**
- **5.2 Map**
- **5.3 Measure**
- **5.4 Manage**

The framework organizes AI risk management around four functions:

```text
Govern
→ establish policy, accountability, risk tolerance, and legal/regulatory awareness

Map
→ understand intended use, affected actors, context, benefits, harms, and foreseeable misuse

Measure
→ evaluate identified risks and control effectiveness with appropriate evidence

Manage
→ prioritize, treat, monitor, communicate, and decide whether deployment should proceed
```

The framework explicitly treats governance as cross-cutting and risk management as continuous across the AI lifecycle.

The route should use this as an operating model, not as a checklist to complete mechanically.

The NIST site currently notes that AI RMF 1.0 is being revised. The route should therefore version the framework used and avoid presenting its current categories as permanently frozen.

### NIST Generative AI Profile — NIST AI 600-1

https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

The Generative AI Profile applies the AI RMF functions to risks that are novel to or amplified by generative AI.

Its curriculum value is the connection between:

- context-specific risk identification;
- risk tolerance;
- lifecycle controls;
- evaluation;
- governance;
- deployment/use decisions.

It should be used as GenAI-specific evidence, not as a requirement to implement every suggested action.

### NIST AI RMF Playbook

https://airc.nist.gov/airmf-resources/playbook/

Verified guidance:

- playbook actions map to Govern / Map / Measure / Manage;
- suggestions are voluntary;
- the playbook is not a required ordered checklist;
- organizations select actions based on their context, risks, and needs.

This is important to prevent "governance" from becoming compliance theater.

### EU AI Act — Regulation (EU) 2024/1689

https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689

Relevant provisions include:

- **Article 4 — AI literacy**
- **Article 9 — Risk management system**
- **Article 13 — Transparency and information to deployers**
- **Article 26 — Obligations of deployers of high-risk AI systems**
- **Article 27 — Fundamental rights impact assessment for certain high-risk deployments**

Article 9 describes risk management as a continuous iterative lifecycle process covering known and reasonably foreseeable risks, foreseeable misuse, post-market evidence, and targeted risk treatment.

The regulation is used here as a concrete example of jurisdiction-specific obligations.

The route must not generalize EU high-risk-system obligations to all products, geographies, or use cases.

### NIST Privacy Framework

https://www.nist.gov/privacy-framework/getting-started-0

Verified sections:

- **Overview and Privacy Risk Management Approach**
- **Framework Structure**
- **Using the Framework**

The source distinguishes privacy risk from cybersecurity risk.

Privacy problems can arise from ordinary data processing even when no security breach occurs.

Its five functions are:

- Identify-P;
- Govern-P;
- Control-P;
- Communicate-P;
- Protect-P.

The Privacy Framework connects privacy engineering to the full data-processing lifecycle and to risks experienced by individuals.

This gives the curriculum a stronger privacy model than "secure the PII."

### NIST Privacy Framework Core

https://www.nist.gov/privacy-framework

Relevant Core areas include:

- inventory and mapping of data processing;
- privacy risk assessment;
- data-processing ecosystem risk management;
- governance policy;
- data-processing management;
- data minimization and disassociated processing;
- communication;
- protection.

The learner should use these as risk/outcome categories, not blindly implement every subcategory.

### GDPR — Regulation (EU) 2016/679

https://eur-lex.europa.eu/eli/reg/2016/679/ojv

Relevant examples include:

- **Article 5** — lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity/confidentiality, accountability;
- **Article 25** — data protection by design and by default;
- **Article 35** — data protection impact assessment.

The curriculum use is narrow:

- engineers should be able to map product/data behavior to identified legal/privacy obligations;
- they should know when specialist privacy/legal review is required;
- they should not invent legal bases or universal retention periods.

### EDPB Opinion 28/2024 — AI models and personal data

https://www.edpb.europa.eu/documents/opinion-of-the-board-art-64/opinion-282024-on-certain-data-protection-aspects-related-to_en

Verified scope includes:

- when/how an AI model may be considered anonymous;
- legitimate interest as a possible legal basis for model development/deployment;
- consequences of unlawfully processed personal data used during model development.

The EDPB emphasizes case-by-case assessment.

A model must not be labeled "anonymous" simply because raw training rows are no longer directly visible.

The route should therefore require evidence for anonymization/privacy claims rather than accepting architecture labels.

## Proposal

Rename and promote the two remaining Security & Governance nodes as concrete L3 capabilities.

### Stable IDs remain unchanged

```text
security.safety-governance
title: AI Governance and Risk Management

security.privacy-legal
title: AI Privacy and Data Governance
```

The IDs remain stable to avoid unnecessary graph churn.

## 1. `security.safety-governance`

**Proposed learner-facing title:** AI Governance and Risk Management

**Proposed level:** L3

**Competency types:**

- design-judgment
- system-operation
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.product-framing`
- `ai.evaluation`
- `production.release-engineering`

These prerequisites provide:

- intended user/use/context;
- measurable system evidence;
- explicit ship / hold / rollback decision mechanics.

### Boundary with adjacent competencies

This route should **not** absorb:

- `ai.product-framing` — product value and intended use;
- `ai.evaluation` — quality measurement;
- `security.guardrails` — runtime boundary checks;
- `production.release-engineering` — release mechanics;
- `security.privacy-legal` — privacy data-processing lifecycle;
- generic corporate GRC;
- jurisdiction-specific legal advice.

The capability is:

> turn product context, evaluation evidence, affected-party impact, foreseeable misuse, and organizational risk tolerance into explicit AI risk decisions, ownership, treatment, and deployment conditions.

### Observable outcomes

The learner should be able to:

- define the AI system boundary and intended/use-excluded context;
- identify affected users, non-users, operators, and external parties;
- maintain a versioned AI risk register;
- distinguish hazard, risk, impact, likelihood, uncertainty, and control;
- identify known and reasonably foreseeable misuse;
- map risks to evidence rather than severity adjectives alone;
- define risk tolerance and escalation thresholds;
- assign accountable owners for material risks and controls;
- map each material risk to prevent / detect / mitigate / recover controls;
- identify residual risk after controls;
- document risks that cannot currently be measured well;
- define monitoring/review triggers;
- perform a concrete deployment decision from evidence;
- record accepted, mitigated, transferred, deferred, and rejected risks;
- distinguish product-policy choices from jurisdiction-specific legal obligations;
- maintain an applicability matrix for external obligations/standards;
- require specialist legal/compliance review when applicability or interpretation is uncertain;
- update the risk record after an incident, product change, or new evidence.

### Required evidence

Apply the route to the Knowledge Assistant.

Evidence must include:

- system/use boundary;
- affected-party map;
- risk taxonomy;
- versioned risk register;
- at least one beneficial outcome and one potential harm;
- one foreseeable-misuse case;
- evidence source for each high-priority risk;
- risk tolerance / severity criteria;
- control mapping;
- owner for each material risk;
- residual-risk assessment;
- one risk that remains materially uncertain;
- one jurisdiction/standard applicability matrix;
- one explicit legal/compliance escalation;
- one release decision:
  - ship;
  - ship with conditions;
  - hold;
  - restrict;
  - reject;
- post-release review trigger;
- one incident/change that causes the register to be updated.

A slide containing "responsible AI principles" without a concrete risk decision is not sufficient evidence.

## 2. `security.privacy-legal`

**Proposed learner-facing title:** AI Privacy and Data Governance

**Proposed level:** L3

**Competency types:**

- engineering-skill
- design-judgment
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.product-framing`
- `security.data-exfiltration`

`security.data-exfiltration` provides source-to-sink reasoning and sensitive-data flow controls.

A broad Data Engineering prerequisite is intentionally avoided.

The privacy route teaches the data-processing inventory and lifecycle needed for privacy decisions directly.

### Boundary with adjacent competencies

This route should **not** become:

- generic application security;
- `security.data-exfiltration`;
- `security.multi-tenant`;
- legal advice;
- a GDPR memorization course;
- a universal retention checklist;
- vague "responsible AI" principles.

The capability is:

> identify and control privacy risks created by AI data processing across collection, storage, retrieval, model/provider use, logging, memory, training/feedback, disclosure, retention, correction, and deletion.

### Observable outcomes

The learner should be able to:

- create a data-processing inventory for an AI feature;
- identify personal/sensitive data and derived/inferred data;
- identify data subjects and affected groups;
- record source, purpose, destination, storage, access, retention, and deletion behavior;
- distinguish privacy risk from cybersecurity risk;
- define purpose limitation and minimization decisions;
- reject data collection that is not necessary for the intended purpose;
- define retention and deletion behavior from product need and applicable obligations rather than arbitrary defaults;
- explain how model providers, logs, vector stores, memories, analytics, and human-review queues change the data-processing ecosystem;
- distinguish de-identification, pseudonymization, and stronger anonymity claims;
- treat model anonymity as an evidence claim rather than an assumption;
- identify where model outputs may reveal or infer personal information;
- define correction/deletion propagation across derived stores where the product requires it;
- test one deletion/forgetting flow end-to-end;
- map relevant data-subject/individual-control obligations to product behavior;
- identify when an impact assessment or specialist privacy/legal review is required;
- maintain a jurisdiction/applicability record without inventing legal interpretations;
- document vendor/third-party privacy responsibilities;
- measure whether privacy controls break required product behavior.

### Required evidence

Extend the Knowledge Assistant with a privacy/data-governance package.

Evidence must include:

- data-processing inventory;
- data flow / source-to-sink diagram;
- personal/sensitive/inferred-data classification;
- stated purpose for each material processing activity;
- minimization decision;
- storage locations and external processors/providers;
- retention policy;
- deletion/forgetting policy;
- one correction/update path;
- one full deletion test across relevant stores;
- logging/observability content policy;
- model/provider data-use configuration record where applicable;
- one privacy-risk assessment;
- one de-identification/anonymity claim and supporting evidence or explicit rejection of the claim;
- one data-processing change that requires a new review;
- jurisdiction/applicability matrix;
- one DPIA/impact-assessment trigger or reason it is not required;
- one legal/privacy escalation record;
- evidence that privacy controls preserve enough product utility.

A statement that "we do not store PII" without a verified processing inventory is not sufficient evidence.

## Legal / regulatory boundary

This repository is global technical curriculum.

Therefore the route must separate:

```text
engineering fact
→ what data/process/system actually does

applicability fact
→ which jurisdiction, role, sector, data type, and use case may trigger an obligation

legal interpretation
→ specialist/legal authority when needed
```

Learners should be able to build an evidence package that counsel/privacy/compliance teams can review.

They are not expected to act as legal counsel.

Regulatory examples must record:

- jurisdiction;
- source;
- version/date;
- applicability assumption;
- unresolved interpretation;
- reviewer/escalation owner.

## Relationship between the two routes

The two routes integrate but do not collapse.

```text
AI Governance and Risk Management
→ which AI risks matter, who owns them, what controls/tolerance apply,
  and whether deployment proceeds

AI Privacy and Data Governance
→ what data processing occurs, what privacy risks it creates,
  and how lifecycle/individual-control obligations are engineered
```

Privacy risks should appear in the broader AI risk register when material.

The privacy route still keeps its own detailed processing/lifecycle evidence.

## Knowledge Assistant integration

If approved, add:

`projects/knowledge-assistant/governance-and-privacy/`

Proposed progression:

```text
existing production + security system
→ define intended use and affected parties
→ build risk register
→ map evidence and controls
→ make deployment decision
→ inventory personal/sensitive data processing
→ minimize / retain / delete deliberately
→ test correction/deletion
→ map jurisdiction-specific applicability
→ privacy/legal escalation
→ incident/change review
→ update risk and privacy decisions
```

Proposed artifacts:

- AI risk register;
- governance decision record;
- obligation/applicability matrix;
- affected-party/impact record;
- control ownership matrix;
- data-processing inventory;
- privacy data-flow diagram;
- privacy risk assessment;
- retention/deletion record;
- deletion verification;
- third-party/provider record;
- privacy/legal escalation record;
- post-incident/change review.

## Promotion gate

Neither route should move from `coverage` to `ready` until the items below hold. All 22 were met on 2026-09-24; see [Review outcome](#review-outcome).

- [x] 1. this RFC is reviewed;
- [x] 2. the two learner-facing title changes are explicitly approved;
- [x] 3. exact source locators are rechecked during route authoring;
- [x] 4. NIST AI RMF / GenAI and Privacy Framework sources are registered after approval;
- [x] 5. jurisdiction-specific legal sources are labeled as such rather than generalized;
- [x] 6. NIST AI RMF 1.0 revision status is represented honestly;
- [x] 7. the Knowledge Assistant governance-and-privacy evidence package is inspectable;
- [x] 8. Governance evidence includes a real deployment decision and residual risk;
- [x] 9. Governance evidence includes risk ownership and review triggers;
- [x] 10. Governance distinguishes internal policy from external legal obligations;
- [x] 11. Privacy evidence includes a verified data-processing inventory;
- [x] 12. Privacy evidence includes minimization, retention, correction, and deletion;
- [x] 13. Privacy includes one end-to-end deletion/forgetting test;
- [x] 14. anonymity/de-identification claims require evidence;
- [x] 15. jurisdiction/applicability assumptions are explicit;
- [x] 16. uncertain legal interpretation routes to an appropriate reviewer rather than model-generated certainty;
- [x] 17. prerequisite-cycle validation passes;
- [x] 18. learner-facing source blocks are generated;
- [x] 19. `curriculum/STATUS.md` is regenerated;
- [x] 20. `site/src/data/atlas.json` is generated only through `scripts/build_site_data.py --write`;
- [x] 21. `make check` and `make site-check` pass;
- [x] 22. review outcome is recorded before promotion.

## Alternatives considered

### Keep the original titles and teach everything

Rejected.

"AI Safety and Governance" and "Privacy Governance Legal and Responsible AI" are umbrella labels, not precise competency contracts.

### Remove both nodes

Rejected.

The underlying capabilities are real and are not fully represented by the existing technical security routes.

### Add separate legal-compliance competencies for each jurisdiction

Rejected for the core Applied AI Engineer path.

Jurisdiction-specific law changes quickly and depends on role, sector, geography, and use case. The transferable engineering skill is applicability mapping, evidence preparation, control implementation, and correct escalation.

### Make the EU AI Act the governance framework

Rejected.

The Act is an important legal example for applicable systems in the EU, not the universal definition of AI governance.

### Use only NIST AI RMF

Rejected.

NIST provides a useful cross-sector risk-management structure but does not replace binding jurisdiction-specific obligations.

### Treat security controls as privacy compliance

Rejected.

NIST Privacy Framework explicitly distinguishes privacy risk from cybersecurity risk. Privacy harms can arise from legitimate, secure processing.

### Treat de-identification as anonymity

Rejected.

Anonymity is an evidence claim whose standard may depend on jurisdiction and context. AI models can retain or expose information in non-obvious ways.

### Teach "Responsible AI principles"

Rejected as exit evidence.

Principles can inform risk criteria, but demonstrated capability requires decisions, ownership, controls, lifecycle evidence, and review.

## Impact

If approved and fully implemented:

- `security.safety-governance`
  - stable ID retained;
  - title changes to **AI Governance and Risk Management**;
  - moves from `coverage` to `ready`;
- `security.privacy-legal`
  - stable ID retained;
  - title changes to **AI Privacy and Data Governance**;
  - moves from `coverage` to `ready`;
- no catalog node is added or removed;
- repository counts become:
  - **115** catalog competencies;
  - **43** ready routes;
  - **72** coverage-only competencies;
- Security & Governance becomes **10 / 10 ready**.

### Proposed sources after approval

Governance:

- NIST AI RMF Core;
- NIST AI RMF Playbook;
- NIST Generative AI Profile;
- EU AI Act official text as a jurisdiction-specific example.

Privacy:

- NIST Privacy Framework / Core;
- GDPR official text as a jurisdiction-specific example;
- EDPB Opinion 28/2024 on AI models and personal data.

### Project integration

Add a Knowledge Assistant `governance-and-privacy/` package and integrate governance/privacy decisions into the existing release, incident, data, security, and feedback lineage.

## Review checklist

- [x] Stable IDs remain appropriate.
- [x] New titles describe assessable capabilities better than the existing umbrella labels.
- [x] Governance and Privacy remain distinct.
- [x] Governance target depth L3 is appropriate.
- [x] Privacy target depth L3 is appropriate.
- [x] Governance requires a risk register, owners, evidence, controls, residual risk, and a deployment decision.
- [x] Governance distinguishes policy from jurisdiction-specific legal obligations.
- [x] Privacy distinguishes privacy risk from cybersecurity risk.
- [x] Privacy requires a data-processing inventory rather than a PII-only checklist.
- [x] Privacy requires minimization, retention, correction, deletion, and a deletion test.
- [x] Anonymity claims require evidence.
- [x] Legal applicability is recorded with jurisdiction/version/context.
- [x] Uncertain legal interpretation is escalated rather than invented.
- [x] Current NIST AI RMF revision status is represented honestly.
- [x] Knowledge Assistant integration extends existing evidence lineage.
- [x] Reviewer explicitly approves or requests changes before implementation.

## Review outcome

Recorded 2026-09-24, before promotion.

- **Decision:** approved by the repository owner, including the titles **AI Governance and Risk Management** (`security.safety-governance`) and **AI Privacy and Data Governance** (`security.privacy-legal`). Stable IDs unchanged; no catalog node added or removed.
- **Result:** both routes promoted to `ready`. Counts: 115 catalog, 43 ready, 72 coverage. Security & Governance is 10 / 10 ready.
- **Prerequisites:** `ai.product-framing`, `ai.evaluation`, `production.release-engineering`, and `security.data-exfiltration` are all ready, so no prerequisite bridge is needed. `validate_repo.py` passes the prerequisite checks.
- **Project integration:** `projects/knowledge-assistant/governance-and-privacy/` with eight templates (risk register, applicability matrix, escalation record, governance decision, data-processing inventory, privacy-risk assessment, retention/deletion record, change review). New Knowledge Assistant milestones: 38 `ai-risk-governance` and 39 `privacy-and-data-governance`. The incident-and-feedback loop becomes milestone 40 and now ends in a governance and privacy change review.

### Source recheck (2026-09-24)

Every locator was checked against the live source before it was committed.

| Resource ID                       | Source                                          | Locators verified                                                                                                                                                          | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `standard.nist-ai-rmf-core`       | NIST AI RMF 1.0, AI RMF Core page               | Sections 5, 5.1–5.4; Tables 1–4                                                                                                                                            | The page states that AI RMF 1.0 is being updated and a revised version is in progress. The route tells learners to record the version applied.                                                                                                                                                                                                                                                                                                                                  |
| `guide.nist-ai-rmf-playbook`      | NIST AI RMF Playbook                            | Landing-page statements that the Playbook is not a checklist and that suggestions are voluntary; entries GOVERN 1.3, GOVERN 2.1, MAP 1.1, MAP 5.1, MEASURE 3.2, MANAGE 1.3 | As described in this RFC.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `standard.nist-ai-600-1`          | NIST AI 600-1 (July 26, 2024)                   | Section 2 and 2.2, 2.4, 2.7, 2.12; Section 3 introduction and GOVERN 1.3, MAP 1.1, MAP 5.1, MEASURE 3.2, MANAGE 1.3 tables; Appendix A.1.4, A.1.8                          | Section 3 states that not every suggested action applies to every AI actor.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `standard.eu-ai-act`              | EU AI Act, consolidated text of 27.07.2026      | Articles 4, 9, 13, 26, 27, 113                                                                                                                                             | **Differs from this RFC's evidence.** Regulation (EU) 2026/1744 amended the Act. It changed Article 4 (AI literacy is now a duty to take measures that support it, with no guaranteed level) and Article 113 (Chapter III Sections 1–3 apply from 2 December 2027 for Annex III high-risk systems and 2 August 2028 for Annex I systems). The route cites the consolidated text and Article 113, and the resource note asks reviewers to check for newer consolidated versions. |
| `standard.nist-privacy-framework` | NIST Privacy Framework 1.0 (January 16, 2020)   | 1.2.1, 1.2.2 and Figure 2; section 2.0 subsection "Core"; Appendix A categories ID.IM-P, ID.RA-P, ID.DE-P, GV.PO-P, CT.DM-P, CT.DP-P                                       | Version 1.1 is only an initial public draft. The route cites 1.0 and names the draft. The resource points to the 1.0 document (DOI) because the locators are in it; the getting-started and landing pages from this RFC were used to confirm the version status.                                                                                                                                                                                                                |
| `standard.gdpr`                   | GDPR, Regulation (EU) 2016/679                  | Articles 5, 17, 25, 35                                                                                                                                                     | No consolidated amendment. EUR-Lex lists amendment proposals 52025PC0501 and 52025PC0837, which are recorded in the resource note. Article 17 (right to erasure) was added to the RFC's list because the route requires a deletion test.                                                                                                                                                                                                                                        |
| `guide.edpb-opinion-28-2024`      | EDPB Opinion 28/2024 (adopted 18 December 2024) | Section 3.2 (3.2.1, 3.2.2, 3.2.2.4); Sections 3.3, 3.4                                                                                                                     | The Opinion says model anonymity is assessed case by case.                                                                                                                                                                                                                                                                                                                                                                                                                      |

Jurisdiction-specific sources (EU AI Act, GDPR, EDPB) are labeled with their jurisdiction in the resource titles, notes, and route locators. Each route requires an applicability matrix and an escalation record, and does not teach these sources as universal rules.
