# AI Assistance Policy

AI is a learning and maintenance assistant for this repository. It is not an authority that defines the curriculum.

The detailed learning contract lives in [LEARNING_MODEL.md](LEARNING_MODEL.md). Agent implementation rules live in [AGENTS.md](AGENTS.md).

## AI may

- extract topics, learning outcomes, assignments, and prerequisites from reviewed sources;
- map verified source material to existing catalog competencies;
- explain approved source material to a learner;
- run diagnostics and Socratic questioning from reviewed competency criteria;
- create constrained practice variants;
- inject bugs or failure scenarios;
- review code, reasoning, and artifacts against explicit rubrics;
- help schedule delayed retrieval;
- summarize learner evidence;
- draft RFCs and resource proposals.

## AI must not

- add hidden or ad-hoc competency IDs;
- promote curriculum coverage to ready without evidence;
- invent source coverage or source locators;
- treat its generated explanation as an authoritative source;
- mark a competency complete because a learner read or watched material;
- infer mastery from confidence alone;
- use an opaque model judgment as the sole evidence for a high-stakes subjective assessment;
- silently change prerequisites, target depth, or exit evidence.

## Canonical change path

For substantive curriculum changes:

```text
source evidence
→ catalog/RFC proposal
→ review
→ coverage
→ complete learning route
→ ready
```

AI can help at every step, but it does not bypass review or the repository validators.
