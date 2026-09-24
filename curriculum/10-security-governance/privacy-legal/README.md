# AI Privacy and Data Governance

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [NIST Privacy Framework Version 1.0 (NIST CSWP 01162020)](https://doi.org/10.6028/NIST.CSWP.01162020) | Version 1.0 (January 16, 2020): Section 1.0 subsection "Privacy Risk Management" with 1.2.1 "Cybersecurity and Privacy Risk Management" (Figure 2) and 1.2.2 "Privacy Risk Assessment"; Section 2.0 "Privacy Framework Basics" subsection "Core" (Figure 4); Appendix A "Privacy Framework Core" categories Inventory and Mapping (ID.IM-P), Risk Assessment (ID.RA-P), Data Processing Ecosystem Risk Management (ID.DE-P), Governance Policies, Processes, and Procedures (GV.PO-P), Data Processing Management (CT.DM-P), and Disassociated Processing (CT.DP-P). Version 1.1 is an initial public draft as of 2026-09-24: record which version you applied. | Build the privacy model: privacy risk comes from problematic data actions across the whole processing lifecycle, overlaps with but is not the same as cybersecurity risk, and is managed through inventory, risk assessment, governance, data-processing control, communication, and protection. |
| [GDPR — Regulation (EU) 2016/679 (EU/EEA jurisdiction)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) | Article 5 "Principles relating to processing of personal data", Article 17 "Right to erasure ('right to be forgotten')", Article 25 "Data protection by design and by default", and Article 35 "Data protection impact assessment" | Jurisdiction-specific example (EU/EEA): see how one binding regulation turns purpose limitation, minimization, storage limitation, erasure, privacy by design, and impact assessment into obligations, then map product behavior to them and escalate interpretation. Do not treat GDPR as a universal rule or invent legal bases or retention periods. |
| [EDPB Opinion 28/2024 on certain data protection aspects related to the processing of personal data in the context of AI models](https://www.edpb.europa.eu/documents/opinion-of-the-board-art-64/opinion-282024-on-certain-data-protection-aspects-related-to_en) | Section 3.2 "On the circumstances under which AI models could be considered anonymous and the related demonstration" (3.2.1 and 3.2.2, including 3.2.2.4 "Documentation"); skim Sections 3.3 on legitimate interest and 3.4 on unlawfully processed development data for what they leave to case-by-case assessment | Jurisdiction-specific example (EU/EEA supervisory guidance): see why a model trained on personal data is not anonymous by default, what evidence an anonymity claim needs, and why the assessment is case by case. |
<!-- learning-sources:end -->

## Why this matters

An AI feature processes personal data in prompts, retrieved documents, model-provider calls, logs and traces, caches, vector stores, memories, analytics, feedback queues, and evaluation sets, not only in its main database. Privacy problems can arise from that processing without any breach. This route teaches you to inventory the processing, decide purpose and minimization, make retention, correction, and deletion work across derived stores, and treat anonymity as a claim that needs evidence.

The output is an evidence package that privacy, legal, and compliance reviewers can check. You are not expected to act as legal counsel.

## Prerequisites

- [AI Product and Problem Framing](../../07-ai-engineering/product-framing/) — the purpose that each processing activity must serve.
- [Data Exfiltration](../data-exfiltration/) — source-to-sink reasoning and sensitive-data flow controls.

## 1. Diagnostic first

Before studying the sources:

- list every place a question and its retrieved documents can persist in a RAG assistant with tracing, caching, and memory;
- give one privacy problem that occurs in a fully secure system with no breach;
- say what evidence would support or refute "the fine-tuned model is anonymous because we deleted the training rows";
- name the derived stores a deletion request must reach and how you would prove it did;
- write a minimization decision for a proposed new analytics field.

If the answer is "we encrypt it" or "we don't store PII", keep learning.

## 2. Mental model

Use the Learning sources table above.

```text
security risk  → unauthorized access, loss of confidentiality/integrity/availability
privacy risk   → problems for individuals caused by data processing, authorized or not

inventory      → what is processed, where, by whom, for what purpose
minimize       → do not collect or keep what the purpose does not need
retain/delete  → a stated basis, propagated to every derived store, and tested
de-identified  → identifiers removed or replaced; re-identification may remain possible
anonymous      → a claim that needs evidence and may be judged case by case
```

The NIST Privacy Framework functions are Identify-P, Govern-P, Control-P, Communicate-P, and Protect-P. Use its categories as risk and outcome areas, not as a list to implement item by item.

**Version and jurisdiction notes (checked 2026-09-24):** NIST Privacy Framework 1.0 is the final version; 1.1 is an initial public draft. GDPR and EDPB Opinion 28/2024 are EU/EEA sources used as jurisdiction-specific examples. EUR-Lex lists pending Commission proposals to amend GDPR, so check the current text before relying on an article. Record jurisdiction, version, and applicability assumptions, and escalate interpretation.

## 3. Guided practice

Trace one Knowledge Assistant question end to end and write the inventory rows it creates, then mark one row you would stop collecting and why.

## 4. Independent practice

Use the [Governance and Privacy evidence contract](../../../projects/knowledge-assistant/governance-and-privacy/).

Build the processing inventory, privacy-risk assessment, and retention/deletion record, run an end-to-end deletion test, escalate one privacy/legal question, and add material privacy risks to the AI risk register.

## 5. Failure work

- data persists in a cache, trace, memory, or evaluation set after "deletion";
- a correction reaches the primary store but not the vector index or cached answers;
- a model provider retains or trains on data contrary to the recorded configuration;
- pseudonymized traces can be re-identified by combining fields;
- the assistant infers personal attributes the product has no purpose to produce;
- a new reuse of conversation data starts without a privacy review;
- a minimization change silently breaks a required feature or diagnostic.

## 6. Exit evidence

You are at **demonstrated** when another engineer can open the privacy package and find: a verified inventory and data-flow diagram, classification, purposes and minimization decisions, processor records, retention/deletion/correction policies with a passing end-to-end deletion test, a logging content policy, a privacy-risk assessment separate from security threats, an anonymity claim supported or rejected, an impact-assessment trigger decision, an applicability matrix with one escalation, and a utility check.

## 7. Transfer

Apply the method to a different AI feature, such as a call-recording voice assistant or a support agent with long-term memory, in a second jurisdiction. State which Knowledge Assistant decisions no longer hold.

## 8. Applied evidence

Applied evidence is a real deletion or correction request served across every store of a system you operate, with the inventory, provider records, and review triggers kept current through later changes.
