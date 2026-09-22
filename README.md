# AI Engineering Atlas

A structured roadmap for software engineers learning modern AI engineering.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Contents

- [Summary](#summary)
- [Who this is for](#who-this-is-for)
- [How to use it](#how-to-use-it)
- [Curriculum](#curriculum)
- [Learning units](#learning-units)
- [Repository structure](#repository-structure)
- [Contributing](#contributing)

## Summary

AI Engineering Atlas organizes the knowledge and practice needed to build, evaluate, and operate AI systems.

The curriculum covers software and systems fundamentals, data, machine learning, deep learning, language models, retrieval, evaluation, agents, production AI, security, multimodal systems, and advanced specializations.

It is designed for non-linear study. If you already know a topic, assess it and move on. If you find a gap, use the linked material and complete the practice needed to close it.

## Who this is for

This roadmap is primarily for software engineers moving deeper into AI engineering.

It can also be used by ML engineers, data engineers, platform engineers, and applied AI developers who want to review areas outside their current specialty.

A working knowledge of programming is assumed. Prior AI experience is useful but not required for every section.

## How to use it

For each topic:

1. Check the prerequisites.
2. Try the diagnostic before studying.
3. Skip or review the topic if you already meet the exit criteria.
4. Use the primary learning resource for the missing concepts.
5. Add a visual explanation where the mechanism is easier to understand graphically.
6. Implement or experiment with the concept.
7. Move on when you can explain it, apply it, and diagnose common failures.

The roadmap is intentionally broad. It is not expected that every learner studies every section to the same depth.

## Curriculum

| Area | Topics |
| --- | --- |
| Software Engineering | Programming, testing, architecture, operating systems, networking, databases |
| Systems | Distributed systems, reliability, performance, cloud, observability |
| Data Engineering | Data modeling, pipelines, batch and streaming systems, quality, lineage |
| ML Foundations | Probability, statistics, classical machine learning, experimentation |
| Deep Learning | Neural networks, optimization, backpropagation, representation learning |
| LLM Foundations | Tokenization, transformers, attention, inference, context |
| AI Engineering | Model selection, prompting, retrieval, context engineering, evaluation, adaptation |
| Agents | Tool use, workflows, state, memory, orchestration, MCP |
| Production AI | Serving, gateways, tracing, reliability, latency, cost, release practices |
| Security & Governance | Prompt injection, permissions, privacy, supply-chain risk, governance |
| Multimodal | Vision, audio, voice, document AI, multimodal interaction |
| Specializations | LLM systems, post-training, reasoning, search, AI platforms |

The detailed curriculum and topic pages will be added progressively as resources, labs, and assessments are reviewed.

## Learning units

A topic can include:

- prerequisites
- learning outcomes
- a short diagnostic
- primary learning material
- visual material
- implementation or lab work
- experiments
- an exit test

The usual study loop is:

```text
Diagnose → Learn → Implement → Visualize → Experiment → Explain → Exit test
```

Resources are kept separate from the competency itself so that books, courses, papers, or repositories can be replaced without changing the learning objective.

## Repository structure

The repository is being organized around the following directories:

```text
curriculum/      topic and competency definitions
resources/       books, courses, papers, repositories, and visual references
assessments/     diagnostics and exit tests
labs/            focused implementation exercises
experiments/     comparisons, ablations, and measurements
projects/        larger end-to-end work
visuals/         diagrams and interactive learning material
rfcs/            proposals for substantial curriculum changes
schemas/         machine-readable curriculum and resource schemas
scripts/         validation and maintenance tools
```

Rules for AI agents working on the repository are in [AGENTS.md](AGENTS.md).

## Contributing

The project is still being assembled. Contributions should keep curriculum topics separate from the resources used to teach them, and substantial curriculum changes should include supporting evidence.

Contribution guidelines and issue templates will be added as the curriculum structure is filled in.

## Acknowledgements

The repository structure and learning workflow draw on patterns used by [OSSU Computer Science](https://github.com/ossu/computer-science), [Microsoft learning repositories](https://github.com/microsoft/generative-ai-for-beginners), [Made With ML](https://github.com/GokuMohandas/Made-With-ML), [roadmap.sh](https://roadmap.sh/), and [LLM Course](https://github.com/mlabonne/llm-course).

## License

MIT
