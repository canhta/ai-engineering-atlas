# Path ordering research for RFC 0020 (Q1 to Q11)

Research date: 2026-09-24. Scope: the open questions in [rfcs/0020-structured-learning-paths.md](../../rfcs/0020-structured-learning-paths.md), checked against how comparable learning roadmaps order the same topics, and against this repo's contracts. Nothing here edits the catalog or the path.

## Sources consulted

| Key     | Source                                                                                                                                                                                                                                                                                          | What was checked                                                                                                                                                                                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RS-AIE  | roadmap.sh AI Engineer, https://roadmap.sh/ai-engineer                                                                                                                                                                                                                                          | Node order, read from the page's embedded roadmap data (279 nodes) and sorted by vertical position. The GitHub repo (`nilbuild/developer-roadmap`, redirected from `kamranahmedse/developer-roadmap`) holds only per-topic content files under `roadmaps/ai-engineer/content/`, with no ordering file. |
| RS-AGT  | roadmap.sh AI Agents, https://roadmap.sh/ai-agents                                                                                                                                                                                                                                              | Same method.                                                                                                                                                                                                                                                                                           |
| CH      | Chip Huyen, _AI Engineering_ (O'Reilly, 2025): ToC at https://github.com/chiphuyen/aie-book/blob/main/ToC.md, author's chapter summaries at https://github.com/chiphuyen/aie-book/blob/main/chapter-summaries.md                                                                                | Chapter and section order. The O'Reilly page returned 403.                                                                                                                                                                                                                                             |
| OSSU-CS | https://github.com/ossu/computer-science README                                                                                                                                                                                                                                                 | Stages, required and elective, prerequisites, math.                                                                                                                                                                                                                                                    |
| OSSU-DS | https://github.com/ossu/data-science README                                                                                                                                                                                                                                                     | Topic order.                                                                                                                                                                                                                                                                                           |
| MS-GAI  | Microsoft Generative AI for Beginners, https://github.com/microsoft/generative-ai-for-beginners README                                                                                                                                                                                          | Lesson order.                                                                                                                                                                                                                                                                                          |
| MWML    | Made With ML, https://madewithml.com/ and https://madewithml.com/courses/mlops/systems-design/                                                                                                                                                                                                  | Course and lesson order.                                                                                                                                                                                                                                                                               |
| DLAI    | DeepLearning.AI _Agentic AI_, https://www.deeplearning.ai/courses/agentic-ai/                                                                                                                                                                                                                   | Module order.                                                                                                                                                                                                                                                                                          |
| HF-AG   | Hugging Face Agents Course, https://huggingface.co/learn/agents-course/unit0/introduction and `/unit3/agentic-rag/introduction`                                                                                                                                                                 | Unit order.                                                                                                                                                                                                                                                                                            |
| OWASP   | OWASP Top 10 for LLM Applications 2025: https://genai.owasp.org/llm-top-10/, LLM01 https://genai.owasp.org/llmrisk/llm01-prompt-injection/, LLM06 https://genai.owasp.org/llmrisk/llm062025-excessive-agency/, LLM08 https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/ | Entries and mitigations.                                                                                                                                                                                                                                                                               |
| MCP     | MCP spec overview https://modelcontextprotocol.io/specification/latest (section "Security and Trust & Safety"); Security Best Practices https://modelcontextprotocol.io/specification/draft/basic/security_best_practices                                                                       | Where security and authorization sit relative to tool use.                                                                                                                                                                                                                                             |

### Observed orders (summary)

| Source  | Order relevant to the path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RS-AIE  | Introduction → How LLMs Work → Prompt Engineering → Context Engineering → Type of Models / Choosing the Right Model → Embeddings & Vector Databases → RAGs → AI Agents → Model Context Protocol (MCP) → AI Safety and Ethics (subtopics include "Prompt Injection Attacks", "Security and Privacy Concerns") → Evaluation & Observability ("LLM Observability", "LLM Evaluations", "Regression Testing") → Multimodal AI → Development Tools.                                                                                                                                                                                                                                                                                                                                                               |
| RS-AGT  | Pre-requisites (Basic Backend Development, Git and Terminal Usage, REST API Knowledge) → LLM basics (including "Understand the Basics of RAG") → Agent Loop → Prompt Engineering → Tool Definition → Model Context Protocol (MCP) → Agent Memory → Common Architectures → "Evaluation and Testing" (Metrics to Track, Unit Testing for Individual Tools, Integration Testing for Flows, Human in the Loop Evaluation) → Debugging and Monitoring → Prompt Injection / Jailbreaks → Tool sandboxing / Permissioning → Data Privacy + PII Redaction → Bias & Toxicity Guardrails → Safety + Red Team Testing.                                                                                                                                                                                                 |
| CH      | 1 Introduction → 2 Understanding Foundation Models → **3 Evaluation Methodology → 4 Evaluate AI Systems** (includes "Model Selection", p. 179) → 5 Prompt Engineering (ends with "Defensive Prompt Engineering": "Jailbreaking and Prompt Injection", "Defenses Against Prompt Attacks", pp. 235-248) → 6 RAG and Agents (RAG: Architecture, Retrieval Algorithms, Retrieval Optimization; Agents: Overview, Tools, Planning, "Agent Failure Modes and Evaluation", p. 298; Memory) → 7 Finetuning → 8 Dataset Engineering → 9 Inference Optimization → 10 AI Engineering Architecture and User Feedback (Enhance Context → Put in Guardrails → Add Model Router and Gateway → Reduce Latency with Caches → Add Agent Patterns → Monitoring and Observability → AI Pipeline Orchestration → User Feedback). |
| MS-GAI  | 1 Intro → 2 Exploring and comparing LLMs → 3 Using Generative AI Responsibly → 4-5 Prompting → 6-7 Text and chat apps → 8 Search apps / vector DBs → 9-10 → 11 Function Calling → 12 UX → **13 Securing Your Generative AI Applications** → 14 Application Lifecycle → **15 RAG and Vector Databases** → 16 Open Source Models → **17 AI Agents** → 18 Fine-Tuning → 19-21 model families. The README says "start wherever you like". No dedicated evaluation lesson.                                                                                                                                                                                                                                                                                                                                       |
| MWML    | Design (Setup, Product, Systems) → Data → Model (Training, Tracking, Tuning, Evaluation, Serving) → Developing → Utilities → Testing (Code, Data, Models) → Reproducibility → Production (Jobs & Services, CI/CD, Monitoring, Data engineering). Within "Systems design": Data → **Metrics → Evaluation → Modeling** → Inference → Feedback ("Once we have our metrics defined, we need to think about when and how we'll evaluate our model.").                                                                                                                                                                                                                                                                                                                                                            |
| DLAI    | 1 Introduction to Agentic Workflows → 2 Reflection → 3 Tool Use → **4 Practical Tips for Building Agentic AI (evals, error analysis)** → 5 Patterns for Highly Autonomous Agents (planning, multi-agent).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| HF-AG   | Unit 1 Agent Fundamentals → 2 Frameworks → 3 Use Case for Agentic RAG → 4 Final Assignment. Bonus Unit 2 "Agent Observability and Evaluation" is outside the main sequence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OSSU-CS | Intro CS → Core CS → Advanced CS → Final Project. "All coursework under Core CS is **required**, unless otherwise indicated"; Advanced CS is chosen "based on interest"; "We recommend working through courses (especially Core CS) in order from top to bottom"; every table has a Prerequisites column; "Core CS assumes the student has already taken high school math"; "A popular option is to take the math courses in parallel with the introductory courses".                                                                                                                                                                                                                                                                                                                                       |
| OSSU-DS | Intro DS → Intro CS → DSA → Databases → Calculus → Linear Algebra → Multivariable Calculus → Statistics & Probability → DS Tools & Methods → ML/Data Mining → Final project.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## Q1. Evaluation after the routes that require it

**Question.** Move `ai.evaluation` ahead of stages D and E, or keep phase order and add eight `order_exceptions`?

**What the sources show.**

- CH puts evaluation (ch. 3-4) before prompt engineering (ch. 5) and RAG and agents (ch. 6), and puts model selection inside the evaluation chapter (ch. 4, "Model Selection", p. 179). The author's ch. 4 summary: "Even though dedicated discussions on evaluation end here, evaluation will come up again and again... Chapter 6 explores on evaluating retrieval and agentic systems" (chapter-summaries.md).
- MWML defines metrics and evaluation before modeling in "Systems design".
- DLAI puts evals and error analysis (module 4) before planning and multi-agent patterns (module 5), though after basic tool use (module 3).
- Counter-evidence: RS-AIE puts "Evaluation & Observability" after agents, MCP, and safety; RS-AGT puts "Evaluation and Testing" after architectures; HF-AG makes evaluation a bonus unit. These are topic maps without prerequisites, and do not state evaluation as a prerequisite of anything.
- Repo: eight ready routes in D and E declare `ai.evaluation`; its own prerequisites (`ml.experimental-design`, `software.testing`) sit in stages B and A, so moving it forward creates no new violation. The Knowledge Assistant README says "problem and evaluation come before model complexity" and credits Made With ML for it (section "Evaluation contract").

**Recommended answer.** Move `ai.evaluation` into its own stage between C and D (or first entry of D). Keep the stage F guidance ("version evaluation data... make a release decision from evidence") with it. No `order_exceptions` needed. The prose line "Evaluation should appear before heavy agent or production complexity" still holds.

**Confidence.** High. The sources that place evaluation early are the ones that reason about dependencies (CH, MWML), and the repo contracts already require it.

## Q2. Security order and stage level

**Question.** Move prompt injection and auth before MCP? Does the stage level apply to every entry? Can an L2 route sit in an L3 stage?

**What the sources show.**

- CH covers prompt attacks and defenses at the end of ch. 5, before RAG and agents (ch. 6). The ch. 6 summary: "Tool use exposes agents to many security risks discussed in the Chapter 5."
- MS-GAI puts "Securing Your Generative AI Applications" (13) before RAG (15) and AI Agents (17).
- RS-AGT puts MCP (y≈1640) before "Prompt Injection / Jailbreaks" and "Tool sandboxing / Permissioning" (y≈3100). RS-AIE puts MCP before "AI Safety and Ethics". These are the counter-examples.
- OWASP LLM01 mitigation 4, "Enforce privilege control and least privilege access": "handle these functions in code rather than providing them to the model. Restrict the model's access privileges to the minimum necessary". LLM06 lists prompt injection as a trigger for excessive agency and requires "Complete mediation": "Implement authorization in downstream systems rather than relying on an LLM to decide if an action is allowed". So prompt-injection defense rests on permission and authorization controls. That matches the contract prerequisites `security.auth` and `security.tool-permissions`.
- MCP puts "Security and Trust & Safety" (User Consent and Control, Data Privacy, Tool Safety: "descriptions of tool behavior such as annotations should be considered untrusted") in the spec overview itself. The Security Best Practices page is written to be read "alongside the MCP Authorization specification". Security is part of the protocol boundary, not a later add-on.
- Repo: `agents.mcp` needs `security.prompt-injection`, which needs `security.auth`, `security.tool-permissions`, and `ai.tool-calling`. `security.tool-permissions` needs `ai.tool-calling` and `agents.deterministic-vs-agentic`. `security.auth` has no prerequisites. So the earliest valid spot is stage G, after `agents.deterministic-vs-agentic`. The Knowledge Assistant milestone order (MCP = 18, auth = 30, tool permissions = 32) does not follow the contracts either; that belongs in a separate issue, not this RFC.
- Levels: all production and security routes target L3 except `security.prompt-injection` (L2).

**Recommended answer.**

1. In stage G, after `agents.deterministic-vs-agentic` and where the prose says "tool schemas and permission boundaries", insert `security.auth` → `security.tool-permissions` → `security.prompt-injection`. `agents.mcp` stays later in G.
2. Drop `target_level: L3` from stage H. Every ready route left in H already targets L3 in its own contract, so the stage level adds nothing and would only produce rule-6 failures. If the owner wants the prose "Target L3" visible, keep it in `guidance` text.
3. No L2 route then sits under an L3 stage. If one ever does, use the entry-level `target_level` override instead of weakening rule 6.

**Confidence.** High for the order (contracts, CH, MS-GAI, OWASP agree; roadmap.sh disagrees but states no prerequisites). Medium for dropping the stage level, which is a style choice.

## Q3. Phase A mappings (catalog mapping, needs owner confirmation)

**Question.** Confirm `systems.distributed-systems` and `systems.databases-storage`; does `data.foundation` belong in stage A?

**What the sources show.** No competitor settles an internal ID mapping. RS-AGT lists only "Basic Backend Development", "Git and Terminal Usage", and "REST API Knowledge" as agent prerequisites. Repo text:

- [curriculum/02-systems/README.md](../../curriculum/02-systems/README.md) scope lists "distributed systems fundamentals" and "retries, timeouts, idempotency, and backpressure" as separate bullets. No catalog ID is titled for the second, so `systems.distributed-systems` is the closest title match.
- The baseline scan's Systems section asks for "timeout, retry, backoff, and idempotency as a system together" and "prevent one slow downstream service from exhausting the whole application". Those are distributed-systems failure topics.
- [curriculum/03-data-engineering/README.md](../../curriculum/03-data-engineering/README.md) scope includes "ingestion, update, deletion, and freshness" and "lineage and provenance". The baseline scan's Data Engineering section asks exactly that ("ingestion path for data that can be updated and deleted", "stale or malformed data", "lineage"). The prose phrase "storage and data lifecycle" covers two things.

**Recommended answer (needs owner confirmation).** Keep "retries, timeouts, idempotency, backpressure" → `systems.distributed-systems`. Split "storage and data lifecycle": "storage" → `systems.databases-storage`, "data lifecycle" → `data.foundation`. Add `data.foundation` to stage A, since the prose names data engineering in the baseline-scan list. All three are coverage entries (mapped), so they add no ordering constraints.

**Confidence.** Medium. Based on domain README and baseline-scan wording only.

## Q4. Phase B mappings (catalog mapping, needs owner confirmation)

**Question.** `ml.experimental-design` or `ml.classical-ml`; `dl.foundations` or `dl.backpropagation`; add `math.statistics`?

**What the sources show.**

- OSSU-DS teaches "Statistics & Probability" as one topic before ML. MWML puts metrics and evaluation design before modeling.
- Repo: `ai.evaluation` declares `ml.experimental-design` as a prerequisite and has a bridge for it, so that ID has to appear on the path (entry or `assumes`) anyway. The ML Foundations README scope lists "train/validation/test design" and "metrics and experimental design" as neighbouring bullets, separate from "supervised and unsupervised learning". The baseline scan's ML section asks for train/validation/test, overfitting, and "what evidence you need before claiming one is better". That is statistical comparison.
- The Deep Learning README lists "neural networks and computation graphs" and "gradient descent and backpropagation". The baseline scan's DL section asks "explain what backpropagation computes" and to trace an optimizer step. `dl.optimization` already covers the optimizer step.

**Recommended answer (needs owner confirmation).** "train/validation/test design" → `ml.experimental-design` (it is a declared prerequisite, and `ml.classical-ml` is broader than the phrase). Add `math.statistics` next to `math.probability` for "experimental uncertainty". "Neural network computation" → `dl.foundations`. Alternatively use `dl.backpropagation` if the owner wants the entry to match what the baseline scan tests. Do not add both unless the prose adds a topic.

**Confidence.** Medium for `ml.experimental-design` (prerequisite link). Low to medium for statistics and the DL choice (wording only).

## Q5. Retrieval steps without a matching ID (partly catalog mapping)

**Question.** Are "vector retrieval", "hybrid retrieval", and "RAG" covered by existing routes, or do they need catalog entries?

**What the sources show.**

- **Vector retrieval.** `ai.embeddings` outcomes include "Explain what an embedding-based retriever represents and how similarity produces a ranking" and comparison against the lexical baseline. Knowledge Assistant "Milestone 1 — embeddings and vector retrieval" uses the Embeddings route. `retrieval.vector-search` is titled "Vector Search Internals" (ANN internals), a specialization depth. CH treats embedding-based retrieval inside "Retrieval Algorithms" (p. 257).
- **Hybrid retrieval.** CH (author summary, Figure 7-3): "After simple retrieval (such as term-based retrieval), whether to experiment with more complex retrieval (such as hybrid search) or finetuning depends on each application and its failure modes." So hybrid search is a conditional step inside retrieval optimization, not a separate stage. Knowledge Assistant "Milestone 3 — hybrid retrieval and reranking" uses the Reranking route. `retrieval.reranking`'s transfer task names "lexical, dense, or hybrid retrieval". RS-AIE's "Implementing RAG" lists Chunking, Embedding, Vector Database, Retrieval Process, Generation, with no hybrid node.
- **RAG.** Every source has a basic RAG step before agents: CH "RAG" section before "Agents", MS-GAI lesson 15, RS-AIE "What are RAGs?" before "AI Agents", HF-AG unit 3 "Agentic RAG". In the repo, Knowledge Assistant "Milestone 4 — answer generation / RAG" names no route. `retrieval.rag-evaluation` covers separating retrieval from generation, and `ai.context-engineering`'s diagnostic uses "a RAG assistant". `retrieval.advanced-rag` is "Advanced RAG Patterns", not the basic step.

**Recommended answer.**

- "Vector retrieval": drop as a separate entry; it is inside `ai.embeddings`. Do not add `retrieval.vector-search` as required. Optionally list it `required: false` for search specialists. **Needs owner confirmation.**
- "Hybrid retrieval": drop as a separate entry; keep "hybrid as needed" in stage E `guidance` next to `retrieval.reranking`. **Needs owner confirmation.**
- "RAG": no existing ID matches the basic step. Keep it as a guidance line pointing at the Knowledge Assistant milestone, and log a possible catalog gap (basic RAG answer generation with attribution) for a separate catalog RFC. Do not map it to `retrieval.advanced-rag`. **Needs owner decision.**

**Confidence.** High that competitors treat hybrid as conditional and RAG as a universal named step. Medium on the mappings.

## Q6. Required or conditional

**Question.** Mark chunking, reranking, memory, multi-agent, and MCP as `required: false` with `when`, or keep them required?

**What the sources show.**

- OSSU-CS separates required (Core) from elective (Advanced, "based on interest"). Electives are chosen by interest, not by a runtime condition.
- CH presents hybrid search as dependent on "each application and its failure modes" (Fig. 7-3) but still teaches it. RS-AIE and RS-AGT show MCP, multi-agent, and memory as normal nodes; MS-GAI says "start wherever you like".
- Repo contracts: each of these routes has the decision itself as exit evidence. Memory: "Reject memory complexity when measured benefit does not justify cost" and "The final decision records whether memory is worth keeping". Chunking: "The chosen strategy and rejected alternatives are justified from measured evidence". Reranking: "The decision to keep, change, or remove reranking is justified from evidence". Multi-agent: "Remove or collapse the topology when specialization does not justify its overhead". MCP: "Compare direct integration with MCP and justify whether interoperability earns the adapter and versioning complexity". The path's completion standard asks for "evidence that unnecessary complexity was rejected as often as it was added".
- None of the five is a prerequisite of another route, so either choice passes validation.

**Recommended answer.** Keep all five required. Put the prose conditions in stage `guidance`. The competency is the measured decision, and "not needed, here is the evidence" is a valid demonstration. Reserve `required: false` / `when` for stage I and for any optional depth entries added under Q5.

**Confidence.** Medium to high. Based on the repo's own contracts; competitors give no counter-rule.

## Q7. Topics that map to several IDs (catalog mapping, needs owner confirmation)

**Question.** Which IDs cover "tool schemas and permission boundaries", "security boundaries", and "trajectory/tool-use evaluation"?

**What the sources show.**

- "Tool schemas": `ai.tool-calling` outcome "Define clear tool names, descriptions, schemas, parameter semantics, and result/error contracts" (stage D).
- "Permission boundaries": `security.tool-permissions` (OWASP LLM06 mitigations "Minimize extension permissions", "Execute extensions in user's context", "Require user approval", "Complete mediation" match its outcomes). RS-AGT has one node "Tool sandboxing / Permissioning", which splits across `security.tool-permissions` and `security.sandboxing`.
- "Security boundaries" (H): the target profile says "operate AI systems with traces, release gates, security boundaries". Knowledge Assistant "Milestone 37 — integrated security attack path" reuses prompt injection "together with the other ready security routes". OWASP maps to them: LLM02 Sensitive Information Disclosure → `security.data-exfiltration`, LLM08 ("In multi-tenant environments ... there's a risk of context leakage", "permission-aware vector and embedding stores") → `security.multi-tenant`, LLM03 Supply Chain / LLM04 Poisoning → `security.supply-chain-data`.
- "Trajectory/tool-use evaluation": CH puts "Agent Failure Modes and Evaluation" inside the Agents section. RS-AGT puts tool unit tests and flow integration tests under agent "Evaluation and Testing". Neither makes it a standalone competency. In the repo it is covered by `ai.evaluation`'s transfer task ("Redesign the evaluation for an agent workflow with tool calls, including trajectory or tool-use evidence") and `agents.verification` ("Separate trajectory from outcome"). The Knowledge Assistant evidence list includes `tool-use-evaluation`.

**Recommended answer (needs owner confirmation).** "Tool schemas and permission boundaries" → `ai.tool-calling` (already in D) plus `security.tool-permissions` (placed in G per Q2). "Security boundaries" → `security.data-exfiltration`, `security.multi-tenant`, `security.sandboxing`, `security.guardrails`, `security.supply-chain-data` (the same set Q9 adds). "Trajectory/tool-use evaluation" → no new ID; covered by `ai.evaluation` (transfer) and `agents.verification`, noted in stage G guidance.

**Confidence.** Medium to high for tool permissions and trajectory evaluation (explicit contract text). Medium for the "security boundaries" set.

## Q8. Topics with no catalog ID (catalog mapping, needs owner confirmation)

**Question.** Where do "graceful degradation" and "incident learning" belong?

**What the sources show.**

- Graceful degradation, repo: `production.architecture` outcomes "Map each external dependency to timeout, retry, fallback, queueing, degradation, or fail-fast behavior" and "Prevent one optional AI capability from taking down a useful degraded product path". Exit evidence: "At least one degraded user experience is deliberately designed and tested". Related: `production.release-engineering` ("Distinguish application rollback from provider fallback or graceful degradation") and `production.model-gateway` (fallback policy). CH ch. 10 treats guardrails, router/gateway, and caches as architecture steps.
- Incident learning, repo: Knowledge Assistant "Milestone 38 — incident and feedback loop" (detection, impact, diagnosis, mitigation, durable regression test, follow-up metric). `production.mlops-llmops`: "Preserve lineage between experiment evidence, release manifests, production traces, incidents, and regression cases"; "One drift/incident signal reaches a continue, inspect, improve, or rollback decision". `production.observability`: "An incident is diagnosed from traces and metrics". `data.feedback-loops` is coverage only. The Systems README scope lists "observability and incident response" under `systems.*`. CH ends with "User Feedback" in ch. 10.

**Recommended answer (needs owner confirmation).** "Graceful degradation" → `production.architecture` (explicit outcome and exit evidence). "Incident learning" → `production.mlops-llmops` (closest ready route, explicit incident lineage and decision), with `production.observability` for diagnosis. Optionally add `data.feedback-loops` as a coverage entry for the feedback half. No new ID.

**Confidence.** High for graceful degradation. Medium for incident learning.

## Q9. Ready routes the prose does not name

**Question.** Add the eleven Knowledge Assistant production and security routes to stage H?

**What the sources show.**

- CH ch. 10's architecture sequence includes guardrails, gateway, caches, monitoring, orchestration, and user feedback. RS-AGT's security block includes tool sandboxing/permissioning, PII redaction, and guardrails. OWASP 2025 lists supply chain (LLM03), sensitive information disclosure (LLM02), excessive agency (LLM06), and vector and embedding weaknesses with multi-tenant leakage (LLM08). These are baseline topics for the role, not specialisms.
- Repo: the prose target profile already names "traces, release gates, security boundaries, and feedback loops" and says "Use the production milestones in the Knowledge Assistant", which cover all eleven.

**Recommended answer.** Add all eleven. `security.tool-permissions` goes to stage G (Q2); the other ten go to H. An order that satisfies every declared prerequisite (checked against the `competency.yaml` files):

```text
G: … agents.deterministic-vs-agentic → security.auth → security.tool-permissions → security.prompt-injection
   → agents.state → … → agents.mcp
H: production.model-gateway → production.observability → production.latency → production.cost
   → production.caching → production.streaming → production.versioning → production.release-engineering
   → production.drift → production.architecture → production.mlops-llmops
   → security.data-exfiltration → security.multi-tenant → security.sandboxing
   → security.supply-chain-data → security.guardrails
```

Note: `production.streaming` requires `systems.networking`, which is not on the path. It has a bridge. Adding streaming adds `systems.networking` to Q10. `production.architecture` requires `agents.orchestration` (stage G), which is satisfied.

**Confidence.** High that competitors include these topics. The ordering is mechanical from the contracts.

## Q10. Prerequisites the path does not teach

**Question.** Put `math.dot-product`, `dl.softmax`, `systems.performance-engineering`, and `systems.cloud-infrastructure` in `assumes`, or add them as entries?

**What the sources show.**

- OSSU-CS: "Core CS assumes the student has already taken high school math" and suggests taking math "in parallel with the introductory courses". Assumed knowledge is stated, not taught inline.
- Repo: every one of these has a bridge (`prerequisite_support` with diagnostic and locator) in the dependent route. `math.dot-product` in `ai.embeddings` and `llm.self-attention`, `dl.softmax` in `llm.self-attention`, `systems.performance-engineering` in `production.latency`, `systems.cloud-infrastructure` in `production.release-engineering`, and `systems.networking` in `production.streaming`. This meets the AGENTS.md rule that coverage-only prerequisites of ready routes get a bridge.
- The baseline scan does **not** test dot products or softmax directly; its LLM section asks about attention as a mechanism. The Production AI section's "local prototype to a service you can release safely" loosely touches cloud infrastructure. So "the baseline scan covers it" is only partly true. The bridges do cover it.

**Recommended answer.** Put all four, plus `systems.networking` if Q9 is adopted, in `assumes`. The dependent routes' bridges are the diagnostic and patch. Say in the path's audience or stage A guidance that assumed items are diagnosed through the route bridges. Alternative: add `math.dot-product` and `dl.softmax` to stage B as coverage entries, because they are ML/DL mental models the phase names implicitly ("embeddings", "neural network computation"). **Owner choice.**

**Confidence.** Medium to high for `assumes` on the systems items. Medium for the math items.

## Q11. `llm.positional-information`

**Question.** Add it to stage C or leave it off?

**What the sources show.**

- RS-AIE's "How LLMs Work" subtopics are Tokens, Context, Sampling Parameters (Temperature, Top-K, Top-P, Repetition Penalties), and Context Window. It has no positional encoding node, and no attention or KV cache node either.
- The baseline scan's LLM section lists tokenization, embeddings, attention, autoregressive decoding, context-length cost, and KV cache, with no positional information. Phase C mirrors that list.
- The prose says "Use the project to inspect mechanisms, not to become an LLM researcher." `llm.training` and `llm.quantization` are also off the phase C list, so leaving domain items off is an existing pattern.

**Recommended answer.** Leave it off the required path. If the owner wants it visible, add it `required: false` in stage C with `when: debugging long-context or context-extension behavior`. **Needs owner confirmation**, because this is a scope choice more than an ordering fact.

**Confidence.** Medium.

---

## Unverified

- roadmap.sh order is inferred from node vertical positions in the page's embedded data (fetched 2026-09-24). roadmap.sh does not publish an explicit sequence, and the repo has no ordering file.
- CH hybrid-search placement is taken from the author's chapter summary (Figure 7-3 caption) and the ToC heading "Retrieval Optimization" (p. 268). Whether hybrid search and reranking sit in "Retrieval Algorithms" or "Retrieval Optimization" was not checked in the book text. Whether ch. 2 "Model Architecture" covers positional encoding was not checked.
- MWML, DLAI, HF-AG, MS-GAI, and OWASP contents were read through a fetch-and-summarise tool. Quoted headings came from that output and were not compared character by character against the page HTML.
- The MCP Security Best Practices page used is the `draft` revision. Its headings (Confused Deputy, Token Passthrough, SSRF, State Handle Hijacking, Local MCP Server Compromise, Scope Minimization, and others) cover authorization and deployment; prompt injection is not a heading there.
- No DeepLearning.AI RAG short course was checked for RAG→eval order. Only the _Agentic AI_ course was checked.
