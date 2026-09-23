# RFC: Dated Curriculum Changes

- Status: Draft
- Author: Canh Ta
- Created: 2026-09-24
- Numbering: 0020 was the next free curriculum number when drafted. Two other RFCs (structured paths, project milestones) were being drafted at the same time and may need the same number; renumber on merge if so.

## Problem

The web atlas reports coverage: 115 catalog competencies, 41 ready routes, 74 mapped. It cannot say when any of those 41 routes became ready, what changed last week, or what a curriculum release contained. The site's backlog (`site/TODO.md`, "What changed `/{lang}/changelog/`") asks for a page listing routes promoted to ready and labs added, per release. roadmap.sh uses a page like this to show that a roadmap is actively maintained. Here it also has an honesty job: a coverage number with no dates cannot show whether 41 routes arrived gradually under review or all at once.

Today there is no record the site can read:

- `curriculum/catalog.yaml` stores the current `status` of each competency and nothing about when it changed.
- `CHANGELOG.md` has one prose line listing promotions under "Unreleased". It names 23 routes. The catalog has 41 ready. None of the 11 Production AI routes appear, and of the 8 ready Security & Governance routes only Prompt Injection does. A hand-written prose list has already drifted from the catalog, and `make check` cannot detect that.
- Curriculum RFCs 0002–0009 record the outcome in an "Implementation outcome" section ("Approved and implemented on 2026-09-22"). RFCs 0010–0018 have no outcome section. 0013–0018 were added in the same commit that shipped their routes. RFC 0001 is a retrospective review of routes promoted before any RFC existed. So RFC dates are available for some routes and missing for others.
- The repository has no git tags. `curriculum/manifest.yaml` says `version: 0.1.0`, and `CHANGELOG.md` lists "0.1.0 — 2026-09-22" as the initial structure. Every promotion is still "Unreleased".

This RFC proposes one dated, validated record of curriculum changes. The web atlas renders it, and `make check` keeps it consistent with the catalog.

## Evidence

### What git history can recover today

I replayed every commit that touched `curriculum/catalog.yaml` (22 commits), parsed the YAML at each one, and recorded the first commit where each competency's `status` became `ready`. I then checked the result against the RFC texts and the route folders.

Findings:

1. **All 41 ready routes have a first-ready commit, and each became ready once.** None was demoted and re-promoted. Replaying with `--first-parent` gives the same commits. The 11 merge commits in history are `origin/main` merges, and `origin/main` has the same hashes, so no promotion commit has been squashed or rebased so far.
2. **Parsing works where text search would fail.** `8dfe16b` (tooling: ruff, eslint, prettier) rewrote the catalog into flow style (287 insertions, 116 deletions) without changing any status. A parser is not affected by that. A `git log -S "status: ready"` search would pick up the rewrite as a change.
3. **Two routes were promoted before the catalog existed.** `llm.self-attention` and `ai.evaluation` became ready in their own `competency.yaml` files (`7e8ec10` and `fd80d56`, both "feat: promote golden competencies to ready routes", 2026-09-22 09:16 +07). The catalog was created five minutes later in `6af1ef4` (09:21), already marking them ready. Catalog history alone dates them to the catalog's creation, not to their promotion. Same day, wrong event.
4. **Five routes were promoted without an RFC.** Besides the two golden examples, `55cdff8` ("content: promote model agent and security routes") promoted `ai.model-selection`, `agents.deterministic-vs-agentic`, and `security.prompt-injection`. No RFC mentions that promotion. RFC 0001 reviews `954cff8` retrospectively and covers only `ai.product-framing`, `retrieval.search`, and `ai.embeddings`.
5. **Author, committer, and timezone differ across commits.**
   - `424f570` ("curriculum: promote current-spec MCP route") was authored by `github-actions[bot]` with a UTC timestamp (`14:34:07Z`). Every other promotion has a `+07:00` timestamp.
   - `c2b8b32` (the web atlas RFC) has author date 12:57 and committer date 13:12, which is a rebase.
   - The security routes were promoted at 23:54 +07 and 07:51 +07. A route promoted a few hours earlier in local time would fall on a different UTC day.
6. **Commit messages cannot be used to find the change or its RFC.** Promotion commits start with `feat:`, `content:`, `curriculum: promote`, `curriculum: ship`, or `curriculum: complete`. `939a3b4` ("todo: screens to add from the roadmap.sh teardown…") also edits `rfcs/0009-model-context-protocol.md`. The RFC link has to come from which RFC file changed in the same commit, and that fails for the retrospective RFC 0001.
7. **"Lab added" has no single date in history.**
   - The five lab directories were created on 2026-09-22 at 09:13–09:35: `8612869`, `6d01785`, `ef4e543`, `3064954`, `1b93b82`.
   - Browser-runnable versions came hours later: `842684c` 15:47, `9daf4a1` 17:14, `82f4314` 17:42. Each of those added `lab.yaml`.
   - Which of the two events counts as "lab added" is an editorial decision. Git history cannot make it.
8. **CI checks out one commit.** `.github/workflows/ci.yml` and `cd.yml` use `actions/checkout@v7` without `fetch-depth`, so the build sees a single commit. A build that derives dates from history would give every route the same date in CI and the correct dates locally.

### Existing conventions

- `docs/VERSIONING.md` counts promoting coverage to ready and adding a lab as MINOR changes. Its release checklist says "CHANGELOG entries describe learner-facing changes", which assumes such a record exists.
- `curriculum/STATUS.md` shows the pattern this repository uses for derived documents: rendered from one source by `scripts/render_status.py` and checked for drift by `make check`.
- `AGENTS.md`: "Each doc, schema, content model, page, component, and lab exists in one version", and maturity must be stated truthfully.

## Options

### (a) Hand-maintained change log, validated against the catalog

One data file lists dated change events: promoted, demoted, added, removed, lab added. Each event has a date, catalog or lab IDs, and an RFC reference. The validator replays the events and requires the result to match the current catalog.

- Records every kind of event the page needs, including events that leave nothing in the catalog. `agents.fundamentals` was removed in `bf4fa80` under RFC 0008.
- Records labs, which are not catalog items.
- Releases are a field on the event, so "per release" grouping needs nothing extra.
- The author writes the date in the same pull request that flips the status, and a reviewer checks it. It does not depend on git history, clone depth, or timezone.
- Cost: one more file to update when promoting. The validator makes it impossible to forget, because a status flip with no matching event fails `make check`.

### (b) `promoted` date and RFC fields on catalog items

Add `promoted: 2026-09-22` and `rfc: "0002"` to each ready item in `catalog.yaml`. The validator requires both on ready items.

- Simplest to validate. The date sits next to the status it describes.
- It stores only the current state. A removed competency has no item to carry the date. A demotion or re-promotion overwrites the old date. Labs would need a matching field in `lab.yaml`. Release grouping would need a third field. Change history would end up split across the catalog and every lab folder.
- It cannot answer "what changed between 0.1.0 and 0.2.0?" once anything is demoted or removed.

### (c) Derive dates from git history at build time

`build_site_data.py` replays history, as the investigation above did, and writes the dates into `atlas.json`.

- No new file to maintain, and it works on the current history (all 41 routes dated).
- Failure modes, all observed or directly implied by this repository:
  - Shallow CI checkout (finding 8) silently produces wrong dates unless both workflows set `fetch-depth: 0`.
  - `atlas.json` is committed and checked with `--check`, so its contents would depend on the depth of the local clone.
  - It records when a commit was made, not when a promotion was approved or published. Rebases (`c2b8b32`) and bot commits in UTC (`424f570`) move dates.
  - Status that lived outside the catalog before `6af1ef4` gives the wrong event (finding 3).
  - It cannot link a change to its RFC reliably (finding 6) or decide what a lab addition is (finding 7).
  - Any history rewrite (squash merges from pull requests, filter-repo, a fresh import) destroys the record.
- A fact that disappears when the checkout changes is not something the site should present as authoritative.

### (d) GitHub Releases

Write release notes on GitHub and have the site fetch them.

- No tags or releases exist yet, so there is nothing to fetch.
- Release notes live outside the repository. They are not reviewed in pull requests, not checked by `make check`, and not bilingual. The build would need network access and possibly a token.
- It groups by release but gives no per-route date, and the site needs both.
- It is a good place to publish releases. It should not be where the change data is stored.

## Proposal

Adopt **(a)**. Include the guarantee from (b) in its validator: every ready item must have a promotion record. Use (c) once, offline, to backfill. Generate (d) and the curriculum section of `CHANGELOG.md` from the record.

Why (a):

- It is the only option that can represent every event the "What changed" page lists: promotions, labs, removals, releases.
- It keeps the date independent of how the repository was cloned.
- It turns the promotion rule into a check: the catalog cannot say ready unless a dated, RFC-linked record says when and under which decision.

This applies the catalog-first rule to time: the catalog is canonical for IDs and current status, and the change log is canonical for when and why they changed.

### Data shape

A new file, `curriculum/changelog.yaml`. Events are listed oldest first, and new events are appended at the end.

```yaml
version: 1
releases:
  - { version: 0.1.0, date: 2026-09-22 }
changes:
  - date: 2026-09-22
    kind: promoted
    competencies: [retrieval.chunking, retrieval.reranking, retrieval.rag-evaluation]
    rfc: "0002"
    evidence: 2886e3a # optional: the commit that flipped the status (backfill only)
  - date: 2026-09-22
    kind: removed
    competencies: [agents.fundamentals]
    rfc: "0008"
    evidence: bf4fa80
  - date: 2026-09-22
    kind: lab-added
    labs: [self-attention, evaluation-harness]
  - date: 2026-09-22
    kind: promoted
    competencies: [ai.model-selection, agents.deterministic-vs-agentic, security.prompt-injection]
    pre_rfc: true
    note: Promoted before the RFC process existed; no RFC reviews this promotion.
    evidence: 55cdff8
```

`kind` values: `promoted` (coverage → ready), `demoted` (ready → coverage), `added` (new coverage item), `removed` (item removed from the catalog), `lab-added`, `lab-removed`. `release` is optional and names a version from `releases`. An event without it is unreleased.

### Schema sketch

`schemas/changelog.schema.json`, validated by `scripts/validate_schemas.py` like the other schemas:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Engineering Atlas curriculum change log",
  "type": "object",
  "required": ["version", "releases", "changes"],
  "additionalProperties": false,
  "properties": {
    "version": { "const": 1 },
    "releases": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["version", "date"],
        "additionalProperties": false,
        "properties": {
          "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
          "date": { "type": "string", "format": "date" }
        }
      }
    },
    "changes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["date", "kind"],
        "additionalProperties": false,
        "properties": {
          "date": { "type": "string", "format": "date" },
          "kind": { "enum": ["promoted", "demoted", "added", "removed", "lab-added", "lab-removed"] },
          "competencies": { "type": "array", "minItems": 1, "items": { "type": "string", "pattern": "^[a-z0-9.-]+$" } },
          "labs": { "type": "array", "minItems": 1, "items": { "type": "string", "pattern": "^[a-z0-9-]+$" } },
          "rfc": { "type": "string", "pattern": "^\\d{4}$" },
          "pre_rfc": { "const": true },
          "release": { "type": "string" },
          "note": { "type": "string" },
          "evidence": { "type": "string", "pattern": "^[0-9a-f]{7,40}$" }
        },
        "allOf": [
          {
            "if": { "properties": { "kind": { "enum": ["lab-added", "lab-removed"] } } },
            "then": { "required": ["labs"] },
            "else": {
              "required": ["competencies"],
              "oneOf": [{ "required": ["rfc"] }, { "required": ["pre_rfc", "note"] }]
            }
          }
        ]
      }
    }
  }
}
```

Dates are calendar days. The date is the day the change lands on `main`, written by the author and checked by the reviewer, not taken from a commit timestamp. The file records days only. Times would be precision it cannot back up.

### Validation rules (`scripts/validate_repo.py`, run by `make check`)

1. **References exist.**
   - Competency IDs in `promoted`, `demoted`, and `added` events exist in `catalog.yaml`.
   - IDs in `removed` events do not exist in `catalog.yaml`.
   - Labs in `lab-added` events exist as `labs/<id>/`, and labs in `lab-removed` events do not.
2. **Replay matches the catalog.** Apply the events in order. For each competency, the last event that changes its status decides the expected status: `promoted` means ready, and `demoted` or `added` means coverage. A competency with no event is coverage (the audited baseline from `6af1ef4`). Rules that follow from this:
   - Every ready catalog item has a `promoted` event with no later `demoted`.
   - A status flip in the catalog without a matching event fails, and so does an event without the catalog change.
3. **RFCs exist and were decided.** `rfc: "NNNN"` resolves to exactly one `rfcs/NNNN-*.md` in the curriculum series (0001 and up). For `promoted`, `demoted`, `added`, and `removed`, that RFC's `Status:` line is `Accepted`. A Draft RFC cannot back a promotion.
4. **`pre_rfc` is closed.** `pre_rfc: true` is allowed only on events dated on or before 2026-09-22, the day RFC 0001 was written. It requires a `note`. New events cannot use it.
5. **Order and releases.**
   - Events are in non-decreasing date order.
   - `releases` versions strictly increase, and their dates do not decrease.
   - An event's `release` names a listed version whose date is on or after the event's date.
   - The latest release equals `version` in `curriculum/manifest.yaml`.
6. **One version.** The curriculum-change part of `CHANGELOG.md` (the promotion line under "Unreleased" today) becomes a generated block between markers. It is rendered from `changelog.yaml` the same way `render_status.py` renders `STATUS.md`, and `make check` fails if it is stale. The hand-written prose list is deleted. Tooling and documentation entries stay hand-written in `CHANGELOG.md`.

Git history is not consulted by `make check`. `evidence` hashes are for reviewers. The validator only checks their format, so shallow clones behave the same as full ones.

### One-time backfill

Backfill is a single pull request that adds `curriculum/changelog.yaml` with the events below. The dates come from the replay in "Evidence" and are cross-checked against the RFCs. All dates are 2026-09-22 or 2026-09-23, in both `+07:00` and UTC, so the timezone ambiguity in finding 5 does not change any day. Every backfilled event is unreleased, which matches `CHANGELOG.md`, where all promotions sit under "Unreleased". The one release is `0.1.0` (2026-09-22), as listed in `CHANGELOG.md` and `manifest.yaml`, with no events assigned to it.

Evidence grades:

- **RFC + git**: the RFC's "Implementation outcome" names the route and a date, and the catalog commit agrees.
- **git, RFC accepted**: the RFC is Accepted but records no outcome date. The date comes from the catalog commit only.
- **git, no RFC**: promoted before the RFC process. The date is from git, and the event is recorded with `pre_rfc: true`.

| Competency                        | Date       | Status-flip commit          | RFC  | Evidence grade    | Notes                                                                                                             |
| --------------------------------- | ---------- | --------------------------- | ---- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `llm.self-attention`              | 2026-09-22 | `7e8ec10` (competency.yaml) | none | git, no RFC       | Catalog replay says `6af1ef4` (catalog creation); the actual promotion is 5 minutes earlier, in `competency.yaml` |
| `ai.evaluation`                   | 2026-09-22 | `fd80d56` (competency.yaml) | none | git, no RFC       | Same as above                                                                                                     |
| `ai.model-selection`              | 2026-09-22 | `55cdff8`                   | none | git, no RFC       | No RFC mentions this promotion                                                                                    |
| `agents.deterministic-vs-agentic` | 2026-09-22 | `55cdff8`                   | none | git, no RFC       | Same                                                                                                              |
| `security.prompt-injection`       | 2026-09-22 | `55cdff8`                   | none | git, no RFC       | Same; RFC 0003 discusses its prerequisites, not its promotion                                                     |
| `ai.product-framing`              | 2026-09-22 | `954cff8`                   | 0001 | RFC + git         | RFC 0001 is a retrospective review: promoted 10:30, approved later that day (`fd0da4e`)                           |
| `retrieval.search`                | 2026-09-22 | `954cff8`                   | 0001 | RFC + git         | Same                                                                                                              |
| `ai.embeddings`                   | 2026-09-22 | `954cff8`                   | 0001 | RFC + git         | Same                                                                                                              |
| `retrieval.chunking`              | 2026-09-22 | `2886e3a`                   | 0002 | RFC + git         |                                                                                                                   |
| `retrieval.reranking`             | 2026-09-22 | `2886e3a`                   | 0002 | RFC + git         |                                                                                                                   |
| `retrieval.rag-evaluation`        | 2026-09-22 | `2886e3a`                   | 0002 | RFC + git         |                                                                                                                   |
| `ai.context-engineering`          | 2026-09-22 | `0b55e1a`                   | 0003 | RFC + git         |                                                                                                                   |
| `ai.tool-calling`                 | 2026-09-22 | `0b55e1a`                   | 0003 | RFC + git         |                                                                                                                   |
| `ai.structured-outputs`           | 2026-09-22 | `a590927`                   | 0004 | RFC + git         |                                                                                                                   |
| `ai.uncertainty-abstention-trust` | 2026-09-22 | `a590927`                   | 0004 | RFC + git         |                                                                                                                   |
| `agents.state`                    | 2026-09-22 | `67a40b5`                   | 0005 | RFC + git         |                                                                                                                   |
| `agents.memory`                   | 2026-09-22 | `67a40b5`                   | 0005 | RFC + git         |                                                                                                                   |
| `agents.planning`                 | 2026-09-22 | `1b70709`                   | 0006 | RFC + git         |                                                                                                                   |
| `agents.verification`             | 2026-09-22 | `1b70709`                   | 0006 | RFC + git         |                                                                                                                   |
| `agents.long-running`             | 2026-09-22 | `090db43`                   | 0007 | RFC + git         |                                                                                                                   |
| `agents.orchestration`            | 2026-09-22 | `090db43`                   | 0007 | RFC + git         |                                                                                                                   |
| `agents.multi-agent`              | 2026-09-22 | `1e126c7`                   | 0008 | RFC + git         |                                                                                                                   |
| `agents.mcp`                      | 2026-09-22 | `424f570`                   | 0009 | RFC + git         | Authored by `github-actions[bot]`, UTC timestamp (21:34 +07)                                                      |
| `production.model-gateway`        | 2026-09-22 | `22e04ba`                   | 0010 | git, RFC accepted | RFC has no outcome section                                                                                        |
| `production.observability`        | 2026-09-22 | `22e04ba`                   | 0010 | git, RFC accepted | Same                                                                                                              |
| `production.versioning`           | 2026-09-22 | `2b4659f`                   | 0011 | git, RFC accepted | Same                                                                                                              |
| `production.release-engineering`  | 2026-09-22 | `2b4659f`                   | 0011 | git, RFC accepted | Same                                                                                                              |
| `production.cost`                 | 2026-09-22 | `0bad0a4`                   | 0012 | git, RFC accepted | Same                                                                                                              |
| `production.latency`              | 2026-09-22 | `0bad0a4`                   | 0012 | git, RFC accepted | Same                                                                                                              |
| `production.caching`              | 2026-09-22 | `4ace729`                   | 0013 | git, RFC accepted | RFC added in the same commit that shipped the routes                                                              |
| `production.streaming`            | 2026-09-22 | `4ace729`                   | 0013 | git, RFC accepted | Same                                                                                                              |
| `production.drift`                | 2026-09-22 | `811f3ee`                   | 0014 | git, RFC accepted | Same                                                                                                              |
| `production.architecture`         | 2026-09-22 | `e4d86e5`                   | 0015 | git, RFC accepted | Same                                                                                                              |
| `production.mlops-llmops`         | 2026-09-22 | `e4d86e5`                   | 0015 | git, RFC accepted | Same                                                                                                              |
| `security.tool-permissions`       | 2026-09-22 | `14f92ed`                   | 0016 | git, RFC accepted | Same; prerequisite cycle fixed in `283ab47` two minutes later                                                     |
| `security.data-exfiltration`      | 2026-09-22 | `14f92ed`                   | 0016 | git, RFC accepted | Same                                                                                                              |
| `security.auth`                   | 2026-09-23 | `dd699ea`                   | 0017 | git, RFC accepted | RFC added in the same commit; 07:51 +07 is 00:51 UTC, same day either way                                         |
| `security.multi-tenant`           | 2026-09-23 | `dd699ea`                   | 0017 | git, RFC accepted | Same                                                                                                              |
| `security.sandboxing`             | 2026-09-23 | `dd699ea`                   | 0017 | git, RFC accepted | Same                                                                                                              |
| `security.guardrails`             | 2026-09-23 | `6914ab1`                   | 0018 | git, RFC accepted | RFC added in the same commit                                                                                      |
| `security.supply-chain-data`      | 2026-09-23 | `6914ab1`                   | 0018 | git, RFC accepted | Same                                                                                                              |

**Could not date:** none at day precision. Every ready route has a single status-flip commit.

**Flagged:**

- The five `pre_rfc` routes have a date but no decision record. The backfill should say that rather than attach a later RFC that did not review them.
- For `llm.self-attention` and `ai.evaluation`, the catalog replay points to the wrong commit. The date above comes from `competency.yaml` history.
- For the 15 routes graded "git, RFC accepted", the date is when the commit was made, not a recorded approval date. This is weaker evidence than the RFC + git rows.
- None of the dates says when the change was first deployed. Git does not record push or deploy times, and deploys are manual (`cd.yml`).

Other backfilled events:

| Event                                    | Date       | Evidence                                       | RFC  |
| ---------------------------------------- | ---------- | ---------------------------------------------- | ---- |
| `removed: agents.fundamentals`           | 2026-09-22 | `bf4fa80`                                      | 0008 |
| `lab-added: self-attention`              | 2026-09-22 | `8612869` (browser runner `82f4314`, same day) | none |
| `lab-added: evaluation-harness`          | 2026-09-22 | `6d01785` (browser runner `842684c`, same day) | none |
| `lab-added: model-selection`             | 2026-09-22 | `ef4e543` (rubric form `9daf4a1`, same day)    | none |
| `lab-added: agentic-design`              | 2026-09-22 | `3064954` (rubric form `9daf4a1`, same day)    | none |
| `lab-added: prompt-injection-boundaries` | 2026-09-22 | `1b93b82` (browser runner `842684c`, same day) | none |

Lab events carry no RFC: labs are practice packaging for a route, not catalog changes. The backfill does not add `added` events for the 74 coverage items created in `6af1ef4`. They are the audited baseline the replay starts from.

### What the site renders

- **`/{lang}/changelog/`**:
  - Events grouped by release, with "Unreleased" first, then by date, newest first.
  - Each event names its kind, the competency titles (linked to their route pages, or plain text for removed and mapped items), the labs (linked), and the RFC (linked to the file on GitHub).
  - A short header states the current counts from the catalog and the date of the most recent change.
  - Events recorded with `pre_rfc` show their note. The page does not hide that five routes predate review.
- **Route pages**: a single line such as "Ready since 2026-09-22 · RFC 0002". Pre-RFC routes show "Ready since 2026-09-22 · before the RFC process".
- **Content model**:
  - `build_site_data.py` reads `changelog.yaml` into a `changes` list in `atlas.json`, and `schemas/site-data.schema.json` is extended in place.
  - `curriculum/presentation.yaml` gets a `change_kind` vocabulary with `en` and `vi` labels. Vietnamese labels follow `docs/VIETNAMESE_STYLE.md` and are listed for owner review.
  - `note` text is English-only at first. The build keeps it as is, and it shows as English on the `vi` page until a `vi` field is added through the same review.

No per-release page, feed, or GitHub Release publishing is proposed now. A release can later copy its section from the generated `CHANGELOG.md` block into GitHub Releases.

## Alternatives considered

- **(b) catalog fields alone.** Rejected as the record because it keeps only current state and cannot hold removals, demotions, or labs. Its guarantee ("ready implies a dated promotion") is kept as validation rule 2.
- **(c) git-derived dates at build time.** Rejected as the source because the result depends on clone depth, rebases, and commit authorship, and because it cannot link RFCs or decide what counts as a lab. Kept as the backfill method, and as an optional reviewer script that compares `evidence` hashes against history. Such a script would not be part of `make check`.
- **(d) GitHub Releases.** Rejected as the source: nothing to fetch yet, not reviewed, not validated, not bilingual. It remains a place to publish releases.
- **Record changes only in `CHANGELOG.md` prose.** This is today's approach. It has already missed 18 of 41 promotions, and `make check` cannot parse it.
- **Add an "Implementation outcome" date to every RFC and read dates from RFCs.** This uses documents written for reviewers as a data source. Several RFCs (0013–0018) were accepted in the commit that shipped them, so their dates add nothing that git doesn't already have, and pre-RFC routes would still have no record.

## Impact

- **Affected competencies:** none change status, level, prerequisites, or outcomes. All 41 ready routes get a promotion record, and `agents.fundamentals` gets a removal record.
- **New files:** `curriculum/changelog.yaml` and `schemas/changelog.schema.json`.
- **Changed tooling:**
  - `scripts/validate_repo.py` (rules 1–5), `scripts/validate_schemas.py` (new schema), `scripts/build_site_data.py` (`changes` in `atlas.json`), and a renderer for the generated `CHANGELOG.md` block (rule 6), either in `render_status.py` or next to it.
  - `schemas/site-data.schema.json` and `curriculum/presentation.yaml` are extended in place.
- **Changed docs:**
  - `CONTRIBUTING.md` ("Promoting coverage to a ready route" gains "append a `promoted` event").
  - `docs/VERSIONING.md` (the release checklist points to the change log, and cutting a release adds it to `releases` and sets `release` on the unreleased events).
  - `AGENTS.md` "Before committing" (a promotion includes its change event).
  - `CHANGELOG.md` (the prose promotion line is replaced by the generated block).
- **Site:** a new `/{lang}/changelog/` page and a line on route pages. This closes the `site/TODO.md` item.
- **Workflow cost:** one appended event per promotion, lab, or removal, in the same pull request. `make check` fails if it is missing.
- **Migration:** none for learner progress. Progress references competency IDs, which do not change.

## Review checklist

- [ ] The change log is the only record of curriculum change dates. `CHANGELOG.md`'s curriculum block is generated from it, and no prose copy remains.
- [ ] Every ready catalog item has a `promoted` event with no later `demoted`, and `make check` enforces it.
- [ ] Every event references existing catalog IDs or lab directories, and removed IDs are absent from the catalog.
- [ ] Every non-lab event references an Accepted curriculum RFC, or is a closed `pre_rfc` event with a note.
- [ ] `make check` does not read git history, so its result does not depend on clone depth.
- [ ] Backfilled dates match the table above, and the five pre-RFC routes are labelled as such rather than attached to a later RFC.
- [ ] The two golden routes are dated from `competency.yaml` history, not from catalog creation.
- [ ] The site shows only what the file records: no invented release notes, no dates beyond day precision, and no "reviewed" claim for pre-RFC routes.
- [ ] Decide what counts as a lab addition: the lab directory (proposed here) or the browser runner.
- [ ] Decide whether the 0.1.0 release, which has no git tag, stays in `releases` as `CHANGELOG.md` states it, or is tagged first.
- [ ] Reviewer explicitly approves or requests changes before implementation.
