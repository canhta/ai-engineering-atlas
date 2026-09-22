# Learner Progress

Progress is stored as evidence rather than a list of completed pages.

The repository provides templates so learners can track their own state in a fork or outside the repository.

## Files

- [profile.example.yaml](profile.example.yaml) — target role, constraints, and chosen depth;
- [progress.example.yaml](progress.example.yaml) — competency states and evidence;
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

A learner can move backward. For example, a failed delayed-retrieval check can move a competency from retained back to learning or demonstrated.

## What to record

Record:

- the competency ID;
- current state;
- date;
- evidence artifacts;
- what was done independently;
- hints or sources used;
- next action;
- review date where relevant.

Do not record only:

- hours watched;
- pages read;
- videos completed;
- confidence score.

Those may be useful context, but they do not prove capability.

## Fork workflow

In your fork, copy the examples:

```bash
cp progress/profile.example.yaml progress/profile.yaml
cp progress/progress.example.yaml progress/progress.yaml
```

You can keep these private instead if they contain information you do not want to publish.

The core curriculum never depends on a specific learner's progress file.
