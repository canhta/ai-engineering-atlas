# Learning Paths

Paths are role-oriented views over the same competency graph.

They are not separate curricula and they do not override competency prerequisites.

Start with the [Applied AI Engineer path](https://ai-eng.canhta.com/en/paths/applied-ai-engineer/) ([source](applied-ai-engineer.yaml)).

A learner should still run the [baseline scan](../assessments/baseline.md) and skip competencies already demonstrated.

## Format

Each path is one `paths/<id>.yaml` file ([schema](../schemas/path.schema.json), [RFC 0020](../rfcs/0020-structured-learning-paths.md)): an audience, a target profile, ordered stages of catalog competency IDs with short guidance, and a completion standard. A path selects, orders, and marks competencies (required or optional, a target level where the role states one); teaching text, sources, and evidence stay in each competency's contract.

`make check` fails when an entry is not a catalog ID, appears twice, or comes before one of its declared prerequisites without listing that prerequisite under `assumes` or an `order_exceptions` entry with a reason, and when a path asks for a higher level than the route defines. It reports how many required steps have no route yet.
