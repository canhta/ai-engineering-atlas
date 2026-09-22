# RFC: Content model for the web atlas

- Status: Accepted (repository owner request, 2026-09-22)
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Extends: [web atlas RFC](0000-interactive-web-atlas.md)

## Problem

The site is coupled to the current shape of the curriculum:

- `scripts/build_site_data.py` hard-codes domain labels and copies competency fields as-is;
- `site/src/lib/atlas.ts` types every `competency.yaml` field;
- the route page names each field and section (`why`, `diagnostic`, `learning_route.mental_model`, …);
- competency types and section titles are site i18n keys;
- labs are linked by matching an artifact path prefix.

Adding a field, a section, or a content type requires site code changes. The site cannot be reused for another collection (labs, projects, paths) or another repository.

## Proposal

Split the pipeline at a versioned **content model** (`site/src/data/atlas.json`, `version: 2`):

```text
repository content ──(content adapter + presentation config)──▶ content model v2 ──(generic renderer)──▶ site
curriculum/*.yaml         scripts/build_site_data.py              schemas/site-data.schema.json        site/src
                          curriculum/presentation.yaml
```

- The **content side** owns what exists and how it maps to blocks: `curriculum/presentation.yaml` plus the adapter.
- The **site** knows only the content model: collections, items, blocks, vocabularies, relations. No curriculum field name appears in `site/src`.
- A new field in `competency.yaml` becomes visible by adding one block entry to `presentation.yaml`. A field that is neither mapped nor ignored still renders through a generic `data` block, and the build reports it, so content never disappears silently.

### Content model v2

```yaml
version: 2
site:        { title: L10n, tagline: L10n, repository: url }
locales:     [en, vi]
vocabularies:                   # every enumerated value the UI labels
  <name>:
    <value>: { label: L10n, order: int, description?: L10n }
collections:
  - id: competencies
    label: L10n
    group_by: domain            # a field whose values come from a vocabulary
    facets: [status, level]     # fields offered as filters; each names a vocabulary
    list_fields: [status, level]
    page_when: { field: status, in: [seeded, ready] }   # items that get a page
    progress: { tracks: true, target_field: target_states }
items:
  <collection id>:
    - id: ai.tool-calling
      title: L10n
      fields: { domain: ai-engineering, status: ready, level: L3, ... }   # scalar or list values only
      page:                     # present only when page_when matches
        source_path: curriculum/07-ai-engineering/tool-calling
        blocks: [Block, ...]
relations:
  - { type: prerequisite, from: ai.evaluation, to: ai.tool-calling }
  - { type: practice, from: ai.tool-calling, to: lab:evaluation-harness }
  - { type: member, from: project:knowledge-assistant, to: ai.tool-calling }
resources:
  <id>: { title, url, type?, author? }
```

`L10n` is `{ en: string, vi?: string }`. Curriculum text carries only `en` until a reviewed translation exists; the renderer falls back to `en` and marks the passage `lang="en"`.

Item references across collections use `<collection-prefix>:<id>` (`lab:`, `project:`, `path:`); competency ids stay bare.

### Blocks

Every block has `type`, `id` (stable anchor), and `title: L10n`. The renderer keeps one component per type; unknown types render as `data`.

| type | payload | interactive behaviour |
|---|---|---|
| `text` | `body: L10n` | none |
| `list` | `items: L10n[]`, `ordered: bool` | none |
| `prerequisites` | `items: [{ ref, bridge?: { diagnostic?: L10n, resource, locator?: L10n, purpose?: L10n } }]` | links to referenced items that have pages |
| `diagnostic` | `tasks: L10n[]`, `pass_condition: L10n` | answer, compare, record diagnostic evidence |
| `sources` | `rows: [{ resource, locator: L10n, purpose: L10n }]` | per-row personal "opened" mark |
| `practice` | `groups: [{ label: L10n, items: [{ text: L10n, ref?: string, path?: string }] }]` | links to labs and repository paths |
| `data` | `value: any JSON` | generic fallback, rendered as nested lists |

`resource` is a key in `resources` or an absolute URL.

### Presentation config

`curriculum/presentation.yaml` (content side) declares, per collection, where items come from and which blocks their pages have:

```yaml
version: 1
site: { title: {en: AI Engineering Atlas}, tagline: {en: …, vi: …} }
vocabularies:
  domain:  { from: curriculum/manifest.yaml }      # titles added to manifest domains (en/vi)
  level:   { from: curriculum/manifest.yaml#levels }
  status:  { values: { ready: {label: {en: ready, vi: sẵn sàng}}, coverage: {…} } }
  competency_type: { values: { … } }
collections:
  competencies:
    items_from: curriculum/catalog.yaml#competencies
    page_from: "{route}/competency.yaml"
    fields: [domain, status, target_level, competency_types, target_states]
    blocks:
      - { field: why, type: text, title: {en: Why, vi: Vì sao} }
      - { field: prerequisites, type: prerequisites, support: prerequisite_support, title: … }
      - { field: outcomes, type: list, title: … }
      - { field: diagnostic, type: diagnostic, title: … }
      - { field: learning_route.mental_model, type: sources, title: … }
      - { field: learning_route, type: practice, groups: [guided_practice, independent_practice], title: … }
      - { field: experiments, type: list, title: … }
      - { field: exit_evidence, type: list, title: … }
      - { field: transfer.task, type: text, title: … }
    ignore: [id, title, domain, status, curriculum_evidence, resources, metadata, project_spines, review]
```

Block order on the page is the order in this file. `ignore` lists fields deliberately not rendered.

### Checks

- `scripts/build_site_data.py --check` fails on a stale model, an unknown block type, a reference that does not resolve, or a missing vocabulary value; it **warns** (lists) fields that are neither mapped nor ignored.
- `schemas/site-data.schema.json` v2 validates the model.
- A site test renders every block type from a fixture, including `data` with unknown shapes.

## Consequences

- Section titles move from `site/src/i18n` to `presentation.yaml`; site i18n keeps interface chrome only.
- Labs, projects, and paths become collections the site can list and page without new site code.
- Another repository can reuse the site by producing a v2 model.
