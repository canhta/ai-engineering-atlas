# AI tutor: provider, budgets, SSO, decision-lab data

Research for the four Phase 2 owner decisions listed in `site/TODO.md` ("Owner decisions still open") and in the Open questions of `rfcs/0000-interactive-web-atlas.md`. All web sources were read on **2026-09-24**. The recommendations at the end are for the owner to decide. None of them is a decision.

Constraints taken from the repo, and assumed throughout:

- The tutor uses scoped actions after an attempt, not open chat. The Worker builds the prompt from the route contract. The browser sends only the action, route ID, and learner input (RFC "AI support").
- There is a per-user budget that refills over time and is shown in the UI, plus a global cap. Both are enforced by the Worker (RFC).
- D1 stores user records and usage counters only. Learner answers pass through to the provider and are not stored, except messages the learner reports as wrong (RFC, `site/AGENTS.md`).
- Model IDs are config behind a provider interface. A small model handles hints and a stronger model handles evidence review (RFC).
- AI output never changes learner state. The evidence reviewer gives feedback only, and decision-lab evidence is `review_method: self` (RFC role table, `docs/LEARNING_MODEL.md` "AI tutor contract").

## 1. What comparable tutors do: budgets and guardrails

| System                               | Per-user budget                                                                                                                                                                                                                                            | Model (as published)                                                                                                                                                                    | Guardrails relevant here                                                                                                                                                                                                                                                                   | Source                                                                                                                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CS50.ai / Duck** (Harvard)         | "each student starts with **10 hearts** and regains **one heart every three minutes**. Each interaction ... consumes a heart". Stated purposes: cutting cost ("we are charged for each GPT-4 request") and pedagogy (precise questions, reflective breaks) | GPT-4 hosted on Azure (2024); GPT-4o on Azure (2025 paper)                                                                                                                              | PII removed before the prompt; system prompt tells the duck to guide, not solve; RAG over lecture captions (ada-002 embeddings); a prompt-injection "guard" that runs a second GPT-4 call on suspicious input and ends the session; staff can endorse, amend, or delete Duck answers on Ed | [SIGCSE 2024 paper, §4.4, §4.6](https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf)                                                                                                                                                                                                          |
| CS50.ai at scale                     | Same mechanism. "approximately 211,000 students had used the duck, which has processed 10 million queries at an average cost of **$1.50 per student per year**" (by Nov 2024)                                                                              | GPT-4o on Azure. Moving from GPT-4 to GPT-4o raised the share of responses containing code blocks from 20% to 25% (a pedagogical regression that their eval process was built to catch) | TF pairwise model comparisons plus model-graded evals, run before model changes                                                                                                                                                                                                            | [SIGCSE TS 2025 paper, §1, §2](https://cs.harvard.edu/malan/publications/fp0627-liu.pdf)                                                                                                                                                                                                             |
| **Codecademy** AI Learning Assistant | Free (Basic): "**5 prompts per day** ... resets 24 hours after the first prompt was used". Plus/Pro: unlimited                                                                                                                                             | GPT-4o (per Codecademy blog title; not re-verified)                                                                                                                                     | Hints-first design (cited in RFC)                                                                                                                                                                                                                                                          | [Help Center article](https://help.codecademy.com/hc/en-us/articles/25381511803035-AI-Assistance-for-free-learners) (read via the Zendesk API)                                                                                                                                                       |
| **Boot.dev Boots**                   | No published message cap. Each use has a cost: "requires an offering of Baked Salmon or he will reduce the amount of XP ... by 50%, not as much as viewing the solution"                                                                                   | Not stated on the page                                                                                                                                                                  | Socratic; "pre-prompted with every lesson's explanation, challenge, and solution"                                                                                                                                                                                                          | [Boots wiki](https://www.boot.dev/blog/wiki/boots/)                                                                                                                                                                                                                                                  |
| **Khanmigo**                         | $4/month or $44/year for learners, free for teachers. No cap on the pricing page; Khan's blog markets "unlimited tutoring for $4/month"                                                                                                                    | GPT-4 per Khan's blog ("Harnessing GPT-4 ..."). Current model mix is not stated on primary pages                                                                                        | Moderation that emails a linked adult when triggered; chat history visible to parent/teacher; appeal/feedback features                                                                                                                                                                     | [Pricing](https://www.khanmigo.ai/pricing), [Safety features](https://support.khanacademy.org/hc/en-us/articles/14394814244365-What-safety-features-does-Khanmigo-have), [Khan blog](https://blog.khanacademy.org/harnessing-ai-so-that-all-students-benefit-a-nonprofit-approach-for-equal-access/) |
| **roadmap.sh** AI tutor              | Free: "**20 AI chats, one-time**", 2 AI courses, 5 AI course lessons, no chat history. Pro: $10/month (billed yearly), "Unlimited AI chats", "Fair usage policy applies"                                                                                   | Not stated                                                                                                                                                                              | Generates courses and plans (this repo rejects that; AGENTS.md "must not generate full lesson content")                                                                                                                                                                                    | [roadmap.sh/premium](https://roadmap.sh/premium)                                                                                                                                                                                                                                                     |
| **GitHub Copilot Free**              | "limited to **2000 completions and 50 chat requests** (including Copilot Edits)" per month. No AI Credits pool on Free. Pro is $10/month with $15 in AI credits                                                                                            | Multi-model                                                                                                                                                                             | Not a tutor; included for budget scale                                                                                                                                                                                                                                                     | [Copilot plans](https://github.com/features/copilot/plans), [Docs](https://docs.github.com/en/copilot/concepts/billing/individual-plans)                                                                                                                                                             |
| **DataCamp** DataLab AI Assistant    | Free: "**15 lifetime requests**". Premium: unlimited                                                                                                                                                                                                       | "OpenAI-powered"                                                                                                                                                                        | Code-assistant, not tutor                                                                                                                                                                                                                                                                  | [DataLab docs](https://datalab-docs.datacamp.com/work/ai-assistant)                                                                                                                                                                                                                                  |
| Stack Overflow AI Assist             | Free with unspecified "usage or access limits" (from a search summary; the page itself was not read). No number found                                                                                                                                      | Not stated                                                                                                                                                                              | Answers grounded in SO content                                                                                                                                                                                                                                                             | [SO blog, 2025-12-02](https://stackoverflow.blog/2025/12/02/introducing-stack-overflow-ai-assist-a-tool-for-the-modern-developer/)                                                                                                                                                                   |
| UF Edugator (research)               | 9-day study, one lab. Total LLM cost US$53                                                                                                                                                                                                                 | OpenAI 4o                                                                                                                                                                               | Optional guardrails with a "See Solution" bypass. Students who disabled guardrails did so mainly to get help solving                                                                                                                                                                       | [Kapoor et al., arXiv 2504.11146](https://arxiv.org/pdf/2504.11146)                                                                                                                                                                                                                                  |

What the table shows:

- Free tiers that publish numbers fall between **5 prompts/day** (Codecademy) and **50 chats/month** (Copilot), or a small lifetime allowance (roadmap.sh 20, DataCamp 15). Paid tiers are "unlimited" under fair use.
- CS50 is the only non-commercial, course-scoped tutor with published numbers. It uses a **refilling bucket** (10 max, +1 per 3 min), which caps bursts rather than daily volume. Its measured spend was **$1.50 per student per year** on GPT-4/4o.
- Visible cost per use is common: CS50 hearts, Boots' XP penalty, Codecademy's daily count. The RFC already adopts this and rejects XP penalties.

## 2. Provider prices (standard tier, USD per million tokens, read 2026-09-24)

| Provider  | Model ID                    | Role fit   | Input                             | Cached input   | Output            | Notes                                                                                                                                                                  |
| --------- | --------------------------- | ---------- | --------------------------------- | -------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic | `claude-haiku-4-5-20251001` | small/fast | $1.00                             | $0.10          | $5.00             | Active. Retirement "not sooner than **October 15, 2026**"; Anthropic gives at least 60 days' notice. Knowledge cutoff Feb 2025. 200K context. Older tokenizer          |
| Anthropic | `claude-sonnet-5`           | mid        | $2.00                             | $0.20          | $10.00            | Launch price made standard ("increase to $3/$15 ... will not occur"). Retirement not sooner than 2027-06-30. Newer tokenizer (about 30% more tokens for the same text) |
| Anthropic | `claude-opus-5-5`           | strong     | $4.00                             | $0.20          | $20.00            | Retirement not sooner than 2027-09-22. Newer tokenizer                                                                                                                 |
| OpenAI    | `gpt-6-luna`                | small/fast | $0.10                             | $0.01          | $0.50             | Short-context standard                                                                                                                                                 |
| OpenAI    | `gpt-6-sol`                 | mid        | $2.00                             | $0.20          | $10.00            |                                                                                                                                                                        |
| OpenAI    | `gpt-6-astra`               | strong     | $10.00                            | $1.00          | $50.00            |                                                                                                                                                                        |
| Google    | `gemini-3.8-flash`          | small/mid  | $0.75 → **$1.50 from 2027-01-01** | $0.075 → $0.15 | $3.75 → **$7.50** | Stable. Promotional price through 2026-12-31                                                                                                                           |
| Google    | `gemini-3.5-flash-lite`     | small      | $0.30                             | $0.03          | $2.50             | Stable                                                                                                                                                                 |
| Google    | `gemini-3.1-pro-preview`    | strong     | $2.00 (≤200k)                     | $0.20          | $12.00            | Preview only; no newer Pro listed                                                                                                                                      |

Sources: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Anthropic models overview](https://platform.claude.com/docs/en/about-claude/models/overview), [Anthropic deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations), [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) (page "Last updated 2026-09-23 UTC").

Operational facts that bear on the choice:

- **Anthropic spend caps.** Monthly caps come with the tier: Start $500, Build $1,000, Scale $200,000. The org can set its own lower spend limit, and per-workspace spend limits are available. At the limit, requests fail with a clear error ([rate limits](https://platform.claude.com/docs/en/api/rate-limits)). This gives a provider-side backstop behind the Worker's global cap. OpenAI documents project "Spend limits" in its docs navigation; that page was not read in detail.
- **Data retention.** Anthropic API: "we automatically delete inputs and outputs on our backend within 30 days", with exceptions for Usage Policy enforcement and law ([privacy center](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)). Retained data is "never used for model training without your express permission" ([API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)). Gemini: **free tier content is "used to improve our products"**; paid tier content is not ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)). The Gemini free tier is therefore incompatible with the privacy page's promise.
- **Prompt caching.** On all three providers, cached input costs about 10% of base input (5% on Opus 5.5). The per-route contract and system prompt form a stable, cacheable prefix. Anthropic's 5-minute cache pays off after one read, but only if the same route is hit again within 5 minutes, which is unlikely at low traffic.

## 3. Cost model

Per-interaction token assumptions. These are estimates, not measurements; replace them with real `usage` numbers from the first eval run.

| Interaction                                                                                                 | Cacheable prefix (system + role rules + route contract excerpt) | Fresh input (learner answer or code + test output + short history) | Output                        | Share of traffic |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------- | ---------------- |
| Hint / follow-up (lab coach, source guide, diagnostic interviewer)                                          | 4,000                                                           | 2,000                                                              | 500                           | 80%              |
| Evidence review (decision-lab write-up or transfer answer against the rubric, criterion quoted per comment) | 5,000                                                           | 4,000                                                              | 1,200 (includes any thinking) | 20%              |

For Sonnet 5 and Opus 5.5, token counts are multiplied by 1.3 to account for the newer tokenizer (Anthropic: "approximately 30% more tokens for the same text"). Tokenizer differences between OpenAI, Google, and Anthropic's older tokenizer are ignored.

### Cost per interaction (USD)

| Model                         | Hint, uncached | Hint, prefix cached | Review, uncached | Review, prefix cached |
| ----------------------------- | -------------- | ------------------- | ---------------- | --------------------- |
| claude-haiku-4-5-20251001     | 0.0085         | 0.0049              | 0.0150           | 0.0105                |
| claude-sonnet-5               | 0.0221         | 0.0127              | 0.0390           | 0.0273                |
| claude-opus-5-5               | 0.0442         | 0.0244              | 0.0780           | 0.0533                |
| gpt-6-luna                    | 0.0008         | 0.0005              | 0.0015           | 0.0010                |
| gpt-6-sol                     | 0.0170         | 0.0098              | 0.0300           | 0.0210                |
| gemini-3.8-flash (2026 promo) | 0.0064         | 0.0037              | 0.0112           | 0.0079                |
| gemini-3.8-flash (from 2027)  | 0.0127         | 0.0073              | 0.0225           | 0.0158                |
| gemini-3.5-flash-lite         | 0.0031         | 0.0020              | 0.0057           | 0.0043                |
| gemini-3.1-pro-preview        | 0.0180         | 0.0108              | 0.0324           | 0.0234                |

### Monthly cost, uncached (worst case), 80/20 hint/review mix

MAL = monthly active learners who use the tutor. N = questions per MAL per month. CS50's lifetime average was about 47 queries per student (10M / 211k), so N = 20 is a realistic month and N = 60 a heavy one.

| Configuration (hint model + review model)  | $ per question | 100 × 20 | 100 × 60 | 1,000 × 20 | 1,000 × 60 | 10,000 × 20 | 10,000 × 60 |
| ------------------------------------------ | -------------- | -------- | -------- | ---------- | ---------- | ----------- | ----------- |
| **A.** Haiku 4.5 + Sonnet 5                | 0.0146         | $29      | $88      | $292       | $876       | $2,920      | $8,760      |
| B. Sonnet 5 + Sonnet 5                     | 0.0255         | $51      | $153     | $510       | $1,529     | $5,096      | $15,288     |
| C. Haiku 4.5 + Opus 5.5                    | 0.0224         | $45      | $134     | $448       | $1,344     | $4,480      | $13,440     |
| D. gpt-6-luna + gpt-6-sol                  | 0.0067         | $13      | $40      | $134       | $401       | $1,336      | $4,008      |
| E. gemini-3.8-flash both (2026)            | 0.0074         | $15      | $44      | $147       | $441       | $1,470      | $4,410      |
| E'. gemini-3.8-flash both (2027)           | 0.0147         | $29      | $88      | $294       | $882       | $2,940      | $8,820      |
| F. gemini-3.5-flash-lite + 3.1-pro-preview | 0.0089         | $18      | $54      | $178       | $535       | $1,784      | $5,352      |

Prefix caching cuts roughly 30–40% when hit rates are high, so the uncached figures are a ceiling. Cloudflare Worker and D1 costs are not included.

What a global cap buys under configuration A ($0.0146 per question):

| Global monthly cap | Questions | MAL at 20 questions |
| ------------------ | --------- | ------------------- |
| $25                | ~1,700    | ~85                 |
| $50                | ~3,400    | ~170                |
| $100               | ~6,800    | ~340                |
| $300               | ~20,500   | ~1,000              |

Worst case for a single user who spends a 20-unit daily budget every day for a month: about $5.10 (all hints on Haiku) to $7.80 (all reviews on Sonnet 5, at 3 units each). The per-user budget limits abuse by one account. Only the global cap limits total spend.

## 4. Recommendations for the owner to decide

### 4.1 Provider and model IDs

**Recommendation:** Anthropic as the configured provider. Default config:

- hints: `claude-haiku-4-5-20251001`
- evidence review: `claude-sonnet-5`
- no Opus

Before committing, run the RFC's tutor eval set once against `gpt-6-luna` and `gemini-3.8-flash` as well. If a cheaper model passes the same thresholds (answer give-away rate before an attempt, rubric-citation check, "never emits code that passes the lab tests"), record that result and let the owner reconsider.

- **Reasons:**
  - It matches the repo's default and the provider-interface design.
  - Per-question cost is small at the expected scale ($29/month for 100 MAL × 20 questions).
  - The org and workspace spend limits give a hard provider-side backstop behind the Worker cap.
  - 30-day retention and no training by default match the privacy page's promise.
  - Haiku and Sonnet cover the RFC's small/strong split without Opus prices ($0.078 per review).
- **Trade-offs:**
  - OpenAI `gpt-6-luna` is about 10× cheaper than Haiku for hints, and OpenAI configuration D costs about half of A overall. The price gap is real, but in absolute terms it amounts to tens of dollars at the expected scale. Guardrail quality (the give-away rate) matters more than price, and only the eval can settle it.
  - Haiku 4.5 has a Feb 2025 knowledge cutoff and a "not sooner than 2026-10-15" retirement floor. It can be deprecated with 60 days' notice, so keep the model ID in config and have Sonnet 5 at low effort as the tested fallback. Using Sonnet 5 for everything (configuration B) costs about 1.75× A.
  - Gemini 3.8 Flash doubles in price on 2027-01-01, and its free tier trains on content, so the free tier is off the table.

### 4.2 Budget numbers

**Recommendation:**

- **Per user:** a CS50-style refilling bucket of **10 units, +1 unit every 30 minutes, with a hard ceiling of 20 units per UTC day**. A hint or follow-up costs 1 unit; an evidence review costs 3 units, which roughly matches its 2.7× cost. Show the bucket in the UI with the reason: precise questions and cost.
- **Global:** a Worker-enforced cap of **$50/month** to start, with the provider console spend limit set slightly above it (for example $60) as the backstop. At 80% of the global cap, halve the refill rate. At 100%, disable AI actions with a message; the rest of the site keeps working.
- Raise the cap in steps ($100, then $300) when measured MAL justifies it.
- **Reasons:**
  - 20 per day sits between Codecademy's free 5/day and CS50's effectively unlimited daily refill.
  - Attempt-first, scoped actions produce fewer calls than open chat, so 20 per day should rarely bind a genuine learner.
  - $50 covers about 170 learners at a realistic 20 questions per month.
  - The per-user ceiling limits one account to about $5–8 per month.
- **Trade-offs:**
  - A strict global cap means late-month users can find AI off. The alternative, an uncapped bill, conflicts with the RFC's "caps spend on the project key".
  - A stricter per-user limit (for example 5 per day) protects the budget but pushes heavy learners to unconstrained tools, the failure mode noted for Khanmigo and in the Edugator study.
  - The numbers rest on estimated token counts. Re-derive them from real `usage` fields after the first month.

### 4.3 SSO beyond GitHub and Google

**Recommendation:** Keep GitHub and Google only for Phase 2. Add no Microsoft, Apple, Facebook, or email magic link now. Revisit only if sign-in drop-off data or learner requests show a real gap.

- **Reasons:**
  - The audience is AI engineers: GitHub covers developers, and Google covers almost everyone else.
  - Each extra provider adds an OAuth app, secrets, callback tests, privacy-page text in two languages, and account-linking questions.
  - One person with several providers gets several budgets, which multiplies per-user spend unless accounts are linked by verified email.
  - Microsoft specifically: user consent to multitenant apps is often restricted by work tenants, and publisher verification requires a verified Microsoft AI Cloud Partner Program account ([Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity-platform/publisher-verification-overview)). That is real overhead for a small open project.
  - Email magic links need an email-sending service and more abuse controls.
- **Trade-off:** Learners without GitHub or Google accounts, or whose employers block these sign-ins, cannot use the AI tutor. Everything else on the site still works without an account.

### 4.4 Should decision-lab answers leave the browser before verified evidence exists?

**Recommendation:** No storage and no sharing through the site before Phase 3. The one exception is transient pass-through to the model provider when the learner explicitly clicks "review against rubric". Label that button with where the text goes and the provider's retention (for example "sent to Anthropic, deleted within 30 days, not stored by this site"). Learners who want peer review can export `progress.yaml` and share it themselves.

- **Reasons:**
  - It keeps the RFC's storage rule: D1 holds users and counters only.
  - The evidence reviewer is feedback only, and decision-lab evidence stays `review_method: self`, so nothing gained by uploading would count as evidence yet.
  - Peer review needs a reviewer identity, a rubric workflow, and moderation and deletion paths, none of which exist before Phase 3.
  - Sharing unreviewed write-ups publicly could present unverified work as endorsed.
- **Trade-offs:**
  - No peer feedback or cohort motivation in Phase 2.
  - Each AI review still sends the write-up to a third party for up to 30 days, which the privacy page must state plainly.
  - If the owner wants early peer review, the lowest-risk route is a learner-initiated GitHub issue or discussion built from the export: public, learner-owned, no site storage.

## Unverified

- **CS50 current hearts values.** The 10 hearts, +1 per 3 minutes figures come from the 2024 paper. No current CS50 page confirming today's values was found (the CS50 docs page for CS50.ai does not mention hearts).
- **Khanmigo daily interaction limit.** A search snippet claimed Khan limits daily interaction; no primary Khan page with a number was found. Khanmigo's current model mix beyond "GPT-4" was also not confirmed on a primary page.
- **Codecademy model (GPT-4o).** Taken from a Codecademy blog URL/title; not re-read.
- **Boot.dev model.** Not stated on the Boots page. A summarizer's "GPT-4o" claim was checked against the page text and found absent.
- **Stack Overflow AI Assist.** No numeric limits published.
- **Token assumptions** (4–5k prefix, 2–4k fresh input, 500–1,200 output, 80/20 mix) are estimates. Real counts depend on route contract size, lab code length, Vietnamese text (which may tokenize to more tokens than English), and thinking effort. The 1.3× factor for Anthropic's newer tokenizer is Anthropic's approximation. Cross-provider tokenizer differences are ignored.
- **Tutor quality by model**, including Vietnamese quality and answer give-away rates, is unmeasured. The model choice should follow the RFC's eval set, not price.
- **Google OAuth.** Whether sign-in-only scopes (openid, email, profile) need brand verification to show the app name and logo was not confirmed from the Google pages read.
- **OpenAI project spend limits and API data retention** were not read from primary pages in this pass.
- **Cloudflare Workers/D1 plan limits and costs** were not included.
