# Learner Progress

Progress is stored as **state transitions backed by inspectable evidence**, not as a list of completed pages.

The repository provides templates so learners can track their own state in a fork or outside the repository.

## Files

- [profile.example.yaml](profile.example.yaml) — target role, constraints, and chosen depth;
- [progress.example.yaml](progress.example.yaml) — competency state history and evidence;
- [../schemas/progress.schema.json](../schemas/progress.schema.json) — machine-readable shape.

## State model

```text
unassessed
→ gap
→ learning
→ demonstrated
→ transferred
→ retained
→ applied
```

A learner can move backward. A failed delayed-retrieval check may move a competency from retained back to demonstrated or learning.

## Why history matters

A single field such as `state: retained` is too easy to turn into a checkbox.

For each competency, keep:

- `current_state`;
- `target_state`;
- evidence items with stable IDs;
- `state_history` entries that reference the evidence used for the transition;
- next action;
- delayed-review date when relevant.

This lets a learner or future AI tutor answer:

- Why is this competency marked demonstrated?
- Was the work independent or heavily guided?
- Which artifact supports transfer?
- When was retention last checked?
- Did the learner regress and relearn the skill?

## Evidence fields

Each evidence item records:

- **kind** — implementation, explanation, diagnostic, experiment, decision, incident, etc.;
- **supports_state** — the state this artifact can justify;
- **recorded_at** — when it was produced;
- **uri** — optional artifact path/URL;
- **independence** — independent, minimal hints, guided, reference open, or unknown;
- **review_method** — self, peer, automated, AI-assisted, or combined;
- **note** — what the artifact actually shows.

AI review is metadata about the review process. It does not make weak evidence strong.

## Transition rule

A state transition should reference the evidence that justifies it.

For demonstrated or stronger states, the evidence should satisfy the competency's own exit/transfer/review/applied contract.

A state should not be promoted because:

- content was completed;
- confidence increased;
- an AI tutor said "correct" without an inspectable artifact/rubric;
- time was spent.

## Fork workflow

In your fork:

```bash
cp progress/profile.example.yaml progress/profile.yaml
cp progress/progress.example.yaml progress/progress.yaml
```

Keep these private if they contain information you do not want to publish.

The core curriculum never depends on a specific learner's progress file.
