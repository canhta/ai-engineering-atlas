# AI Engineering Atlas

A gap-driven roadmap for software engineers learning modern AI engineering.

[![Validate curriculum](https://github.com/canhta/ai-engineering-atlas/actions/workflows/validate.yml/badge.svg)](https://github.com/canhta/ai-engineering-atlas/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**New here? Start with [START_HERE.md](START_HERE.md).**

## A note from the author

I'm a software engineer learning my way into AI Engineering, and this repo is where I organize and share that journey.

I'm learning in public, so the roadmap will keep evolving as I study, build, and find better ways to understand things. Hopefully it can be useful to other engineers making a similar transition too.

## What this repository does

AI Engineering Atlas maps the capabilities needed to build, evaluate, and operate AI systems.

It is designed for experienced engineers with uneven knowledge. You do not need to study every topic. You diagnose first, learn the smallest meaningful gap, produce evidence, and revisit important skills in larger systems.

```text
target
→ baseline
→ gap
→ precise learning route
→ practice
→ evidence
→ transfer / retention
→ project application
→ portfolio review
→ next gaps
```

## Use the Atlas

1. [Start here](START_HERE.md) — choose a target, run the baseline scan, create a learner record.
2. [Roadmap](ROADMAP.md) — browse the audited coverage map.
3. [Applied AI Engineer path](paths/applied-ai-engineer.md) — a reference path for the main audience.
4. [Curriculum](curriculum/) — enter domains and ready competency routes.
5. [Projects](projects/) — integrate skills in evolving reference systems.
6. [Progress](progress/) — record evidence instead of content completion.

## Current maturity

The repository separates **coverage** from **ready learning routes**.

The canonical [competency catalog](curriculum/catalog.yaml) maps the audited scope with stable IDs. Coverage nodes become ready only after they have diagnostics, verified source locators, practice, and evidence criteria.

See the generated [Curriculum Status](curriculum/STATUS.md) for the current counts and ready routes. CI checks that this status view matches the catalog.

Reference systems:

- [Tiny Transformer](projects/tiny-transformer/)
- [Knowledge Assistant](projects/knowledge-assistant/)

This maturity model is intentional: a topic is not presented as a finished lesson merely because it appears on the roadmap.

## Curriculum areas

| Area | Main concern |
| --- | --- |
| [Software Engineering](curriculum/01-software-engineering/) | programming, testing, architecture, delivery |
| [Systems](curriculum/02-systems/) | concurrency, networking, storage, distributed systems, cloud, observability |
| [Data Engineering](curriculum/03-data-engineering/) | pipelines, quality, lineage, lifecycle |
| [ML Foundations](curriculum/04-ml-foundations/) | math, statistics, classical ML, experimentation |
| [Deep Learning](curriculum/05-deep-learning/) | optimization, backpropagation, representations |
| [LLM Foundations](curriculum/06-llm-foundations/) | tokenization, transformers, attention, inference |
| [AI Engineering](curriculum/07-ai-engineering/) | model decisions, context, retrieval, evaluation, adaptation |
| [Agents](curriculum/08-agents/) | tools, state, planning, memory, MCP, evaluation |
| [Production AI](curriculum/09-production-ai/) | serving, gateways, tracing, releases, reliability, cost |
| [Security & Governance](curriculum/10-security-governance/) | trust boundaries, permissions, privacy, governance |
| [Multimodal](curriculum/11-multimodal/) | vision, voice, document and multimodal systems |
| [Specializations](curriculum/12-specializations/) | LLM systems, post-training, search, platforms |

## Learning design

The full contract is in [LEARNING_MODEL.md](LEARNING_MODEL.md).

Key rules:

- the unit of progress is demonstrated capability;
- prior knowledge changes the route;
- different capability types require different evidence;
- source material is curated to exact sections when possible;
- sources used by ready routes have review metadata;
- an immediate exit test is not the same as transfer or retention;
- important skills are revisited in evolving projects;
- periodic portfolio review consolidates evidence and selects the next gaps;
- AI may tutor and review, but it does not silently define the curriculum.

## For contributors

Read:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [AGENTS.md](AGENTS.md)
- [CURRICULUM.md](CURRICULUM.md)
- [VERSIONING.md](VERSIONING.md)
- [resources/REVIEW_POLICY.md](resources/REVIEW_POLICY.md)

Run `make check` before a pull request. Substantial curriculum changes should include evidence and use the RFC process.

## Acknowledgements

The learning design draws on patterns from [OSSU Computer Science](https://github.com/ossu/computer-science), [Microsoft learning repositories](https://github.com/microsoft/ML-For-Beginners), [Made With ML](https://github.com/GokuMohandas/Made-With-ML), [roadmap.sh](https://roadmap.sh/), and the learning research referenced in [LEARNING_MODEL.md](LEARNING_MODEL.md).

## License

[MIT](LICENSE)
