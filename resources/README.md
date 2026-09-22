# Resources

Resources are external material used by learning routes. They are not the curriculum itself.

## Source roles

A competency may use different sources for different jobs.

| Role | Question it answers |
| --- | --- |
| curriculum evidence | Why does this capability belong in the roadmap? |
| teaching | What source builds the mental model well? |
| visual | What makes the mechanism easier to inspect? |
| practice | Where can the learner perform the skill? |
| assessment | What can help verify the outcome? |
| production reference | What shows real operational constraints or failure modes? |
| benchmark | What external curriculum/repository is used to audit coverage or design? |

The global YAML files identify sources. **Exact chapter/lecture/assignment locators belong in the competency's learning route**, because the useful portion differs by competency.

## Selection process

Before promoting a resource into a learning route:

1. verify the source and canonical URL;
2. inspect the table of contents, syllabus, assignment, or documentation;
3. identify the exact learning outcome it supports;
4. compare it with the current primary route;
5. record the exact locator;
6. check availability and freshness where the topic changes quickly;
7. keep complementary sources only when they add a different learning function.

Prefer one strong primary route over a long resource list.

## Granularity

Avoid:

```text
Read Stanford CS336.
Read AI Engineering.
Watch 3Blue1Brown.
```

Prefer:

```text
Source: Build a Large Language Model (From Scratch)
Locator: Chapter 3, sections 3.3-3.5
Purpose: simple → trainable → causal self-attention
```

A learner should know exactly where to begin and why that source is there.

## Registry files

- [books.yaml](books.yaml)
- [courses.yaml](courses.yaml)
- [docs.yaml](docs.yaml)
- [papers.yaml](papers.yaml)
- [repos.yaml](repos.yaml)
- [roadmaps.yaml](roadmaps.yaml)
- [visuals.yaml](visuals.yaml)
- [jobs.yaml](jobs.yaml)
