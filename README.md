# AI Engineering Atlas

A structured roadmap for software engineers learning modern AI engineering.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Start here:** [Learning model](LEARNING_MODEL.md) · [Curriculum](curriculum/) · [Learning method](LEARNING_METHOD.md) · [Contributing](CONTRIBUTING.md)

## Summary

AI Engineering Atlas organizes the capabilities needed to build, evaluate, and operate AI systems.

It is designed for learners who already have uneven experience across software engineering, machine learning, and modern AI. The first step is therefore diagnosis rather than starting every topic from the beginning.

The curriculum covers software and systems fundamentals, data, ML and deep learning, language models, retrieval, evaluation, agents, production AI, security, multimodal systems, and advanced specializations.

## How learning works

The roadmap tracks evidence of capability rather than content completion.

~~~text
Baseline scan
→ find a gap
→ learn the missing mental model
→ practice
→ experiment or debug
→ demonstrate
→ transfer
→ revisit later
→ apply in a larger system
~~~

A learner can skip instruction when they already have evidence for the required capability.

Read [LEARNING_MODEL.md](LEARNING_MODEL.md) for the full lifecycle, mastery states, sourcing rules, project spines, and AI tutor contract.

## Who this is for

The primary audience is software engineers moving deeper into AI engineering.

It can also be used by ML engineers, data engineers, platform engineers, and applied AI developers who want to identify gaps outside their current specialty.

A working knowledge of programming is assumed.

## Curriculum

| Area | Topics |
| --- | --- |
| [Software Engineering](curriculum/01-software-engineering/) | Programming, testing, architecture, operating systems, networking, databases |
| [Systems](curriculum/02-systems/) | Distributed systems, reliability, performance, cloud, observability |
| [Data Engineering](curriculum/03-data-engineering/) | Data modeling, pipelines, batch and streaming systems, quality, lineage |
| [ML Foundations](curriculum/04-ml-foundations/) | Probability, statistics, classical machine learning, experimentation |
| [Deep Learning](curriculum/05-deep-learning/) | Neural networks, optimization, backpropagation, representation learning |
| [LLM Foundations](curriculum/06-llm-foundations/) | Tokenization, transformers, attention, inference, context |
| [AI Engineering](curriculum/07-ai-engineering/) | Model selection, prompting, retrieval, context engineering, evaluation, adaptation |
| [Agents](curriculum/08-agents/) | Tool use, workflows, state, memory, orchestration, MCP |
| [Production AI](curriculum/09-production-ai/) | Serving, gateways, tracing, reliability, latency, cost, release practices |
| [Security & Governance](curriculum/10-security-governance/) | Prompt injection, permissions, privacy, supply-chain risk, governance |
| [Multimodal](curriculum/11-multimodal/) | Vision, audio, voice, document AI, multimodal interaction |
| [Specializations](curriculum/12-specializations/) | LLM systems, post-training, reasoning, search, AI platforms |

Browse the [curriculum index](curriculum/) for domain pages and seeded competencies.

## Learning routes

A mature competency should eventually provide:

- a diagnostic;
- the engineering context for why it matters;
- a precise route through primary source material;
- visual material when useful;
- guided and independent practice;
- experiments or failure work when appropriate;
- exit evidence;
- transfer or project integration when the skill requires it;
- delayed retrieval for important knowledge.

The repository should point learners through strong existing material rather than replace it with AI-generated lessons.

## Project spines

Important competencies will be revisited in three evolving contexts:

- **Foundation spine** — model internals, from numerical operations toward a small transformer;
- **AI system spine** — search, retrieval, RAG, evaluation, tools, agents, and multimodal input;
- **Production spine** — APIs, gateways, tracing, eval gates, security, deployment, incidents, and feedback loops.

See [LEARNING_MODEL.md](LEARNING_MODEL.md#project-spines).

## Repository structure

~~~text
curriculum/      competency definitions and learning routes
resources/       curated source registry
assessments/     diagnostics, exit and transfer tasks
labs/            focused implementation practice
experiments/     comparison, measurement and failure work
projects/        project-spine artifacts
visuals/         useful diagrams and interactive learning material
rfcs/            substantial curriculum proposals
schemas/         machine-readable contracts
scripts/         validation and maintenance tools
~~~

Curriculum conventions are documented in [CURRICULUM.md](CURRICULUM.md). AI-agent rules are in [AGENTS.md](AGENTS.md).

## Contributing

Contributions are welcome for curriculum corrections, source mappings, assessments, labs, visual material, projects, and repository tooling.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Acknowledgements

The learning design draws on patterns from [OSSU Computer Science](https://github.com/ossu/computer-science), [Microsoft learning repositories](https://github.com/microsoft/generative-ai-for-beginners), [Made With ML](https://github.com/GokuMohandas/Made-With-ML), [roadmap.sh](https://roadmap.sh/), and research referenced in [LEARNING_MODEL.md](LEARNING_MODEL.md).

## License

[MIT](LICENSE)
