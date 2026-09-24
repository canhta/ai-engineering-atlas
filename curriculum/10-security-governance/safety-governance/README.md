# AI Governance and Risk Management

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [NIST AI Risk Management Framework 1.0 — AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) | Section 5 "AI RMF Core" and subsections 5.1 "Govern", 5.2 "Map", 5.3 "Measure", 5.4 "Manage", including the category and subcategory tables of each function. AI RMF 1.0 is being revised (notice on the page, checked 2026-09-24): record the version you applied. | Build the operating model: governance is cross-cutting, Map establishes context and impacts, Measure produces evidence, Manage allocates treatment and decides whether deployment proceeds, and all four repeat across the lifecycle. |
| [NIST AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/) | Playbook landing page introduction ("The Playbook is neither a checklist nor set of steps to be followed in its entirety"; "Playbook suggestions are voluntary"), then "Explore the Playbook" entries for GOVERN 1.3, GOVERN 2.1, MAP 1.1, MAP 5.1, MEASURE 3.2, and MANAGE 1.3 | Use suggested actions for risk tolerance, ownership, context, impact likelihood/magnitude, hard-to-measure risks, and risk response as options selected by context, not as a compliance checklist. |
| [NIST AI 600-1 — AI RMF: Generative Artificial Intelligence Profile](https://doi.org/10.6028/NIST.AI.600-1) | Section 2 "Overview of Risks Unique to or Exacerbated by GAI" (risk dimensions and the twelve risk categories, especially 2.2 Confabulation, 2.4 Data Privacy, 2.7 Human-AI Configuration, 2.12 Value Chain and Component Integration); Section 3 "Suggested Actions to Manage GAI Risks" introduction and tables for GOVERN 1.3, MAP 1.1, MAP 5.1, MEASURE 3.2, MANAGE 1.3; Appendix A.1.4 "Pre-Deployment Testing" and A.1.8 "Incident Disclosure" | Apply the AI RMF functions to generative AI risks, and see that not every suggested action applies to every actor or system. |
| [EU AI Act — Regulation (EU) 2024/1689, consolidated text (EU jurisdiction)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727) | Consolidated text of 27.07.2026 (as amended by Regulation (EU) 2026/1744): Article 4 "AI literacy", Article 9 "Risk management system", Article 13 "Transparency and provision of information to deployers", Article 26 "Obligations of deployers of high-risk AI systems", Article 27 "Fundamental rights impact assessment for high-risk AI systems", and Article 113 "Entry into force and application" for the dates each part applies | Jurisdiction-specific example (EU): read how one binding regulation defines a lifecycle risk-management system and deployer duties, then record which facts (role, risk classification, application date) decide whether it applies. Do not generalize EU high-risk obligations to all AI products or jurisdictions. |
<!-- learning-sources:end -->

## Why this matters

A system can pass its evaluations, security tests, and release gates while nobody has decided which harms matter, who owns them, how much residual risk is acceptable, or what would reopen the decision. This route turns product context, evaluation evidence, affected-party impact, foreseeable misuse, and risk tolerance into a recorded deployment decision with owners, controls, and review triggers.

Legal obligations are one input. You map where they may apply and escalate interpretation to the people qualified to make it. You are not expected to act as legal counsel.

## Prerequisites

- [AI Product and Problem Framing](../../07-ai-engineering/product-framing/) — intended user, use, and context.
- [AI Evaluation and Experimentation](../../07-ai-engineering/evaluation/) — the measured evidence a risk decision cites.
- [AI Release Engineering](../../09-production-ai/release-engineering/) — ship, hold, and rollback mechanics.

## 1. Diagnostic first

Before studying the sources:

- name the affected parties and one foreseeable misuse for a Knowledge Assistant feature;
- separate hazard, risk, control, and residual risk in one concrete example;
- explain what "94% accurate, so low risk" leaves undecided;
- state which facts decide whether a jurisdiction-specific obligation applies, and who interprets it;
- write the deployment decision for a material risk that has no owner and no measurement.

If the answers are principles without owners, evidence, or a decision, keep learning.

## 2. Mental model

Use the Learning sources table above.

```text
Govern  → policy, accountability, risk tolerance, legal/regulatory awareness (cross-cutting)
Map     → intended use, affected parties, context, benefits, harms, foreseeable misuse
Measure → evidence for identified risks and control effectiveness
Manage  → prioritize, treat, monitor, communicate, decide whether deployment proceeds
```

Keep these distinctions explicit:

```text
hazard         → what could cause harm
risk           → likelihood × impact of that harm in this context
control        → prevent / detect / mitigate / recover mechanism with an owner
residual risk  → what remains after controls, accepted by a named person
internal policy        → a choice the organization makes
external obligation    → a jurisdiction-specific requirement, mapped with its assumptions
legal interpretation   → specialist review, never model-generated certainty
```

The NIST Playbook's own guidance is that its suggestions are voluntary and not a checklist. Choose actions by context, and record the ones you chose not to apply.

**Version notes (checked 2026-09-24):** NIST states that AI RMF 1.0 is being revised, so record the version you applied. The EU AI Act was amended by Regulation (EU) 2026/1744. Use the consolidated text and check Article 113 for the date each part applies. The EU AI Act is a jurisdiction-specific example: it does not define AI governance for every product or country.

## 3. Guided practice

Fill one Knowledge Assistant risk register row end to end: hazard, affected party, likelihood and impact rationale, evidence source, owner, controls, residual risk, review trigger. Compare it with the NIST subcategories you used.

## 4. Independent practice

Use the [Governance and Privacy evidence contract](../../../projects/knowledge-assistant/governance-and-privacy/).

Build the risk register, applicability matrix, escalation record, and deployment decision for the Knowledge Assistant, then apply one incident or product change and publish a new register version.

## 5. Failure work

- a risk scored "high" or "low" with no tolerance criteria or evidence;
- a material risk with no owner;
- a risk dropped because it cannot be measured well;
- a principles statement presented as a governance decision;
- EU high-risk obligations assumed to apply everywhere, or assumed not to apply without checking role and classification;
- a legal question answered by the engineer or a model instead of escalated;
- a product change shipped without re-reviewing the affected register rows.

## 6. Exit evidence

You are at **demonstrated** when another engineer can open the governance package and find: the system/use boundary, affected parties, tolerance criteria, a versioned register with evidence and owners, control mapping, residual risk, one materially uncertain risk, an applicability matrix with one escalation, a deployment decision with conditions and review triggers, and one register update caused by an incident or change.

## 7. Transfer

Apply the method to a system with a different risk profile, such as a refund-issuing support agent or a hiring screening assistant, in a second jurisdiction or sector. State which Knowledge Assistant conclusions no longer hold.

## 8. Applied evidence

Applied evidence is a real deployment decision on a system you operate, with owners, residual risk, and review triggers that were later exercised by an incident, a change, or a scheduled review.
