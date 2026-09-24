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
site:        { title: L10n, tagline: L10n, repository: url, specimen?: ref, links?: [{kind, url}] }   # kind: github|email|whatsapp|zalo|x|linkedin; specimen: the route Home previews
locales:     [en, vi]
vocabularies:                   # every enumerated value the UI labels
  <name>:
    <value>: { label: L10n, order: int, description?: L10n }
collections:
  - id: competencies
    label: L10n
    ref_prefix?: lab            # omitted for competencies; refs to other collections are <ref_prefix>:<id>
    fields:                     # every field items may carry, with its label and optional vocabulary
      domain: { label: L10n, vocabulary: domain }
      target_level: { label: L10n, vocabulary: level }
      ...
    group_by: domain            # a declared field whose values come from a vocabulary
    facets: [status, target_level]        # declared fields offered as filters
    page_when: { field: status, in: [seeded, ready] }   # items that get a page; omitted = every item with blocks
    progress: { tracks: true, target_field: target_states }
items:
  <collection id>:
    - id: ai.tool-calling
      title: L10n
      fields: { domain: ai-engineering, status: ready, target_level: L3, ... }   # scalar or list values only
      page:                     # present only when the item gets a page
        source_path: curriculum/07-ai-engineering/tool-calling
        blocks: [Block, ...]
relations:
  - { type: prerequisite, from: ai.evaluation, to: ai.tool-calling }
  - { type: practice, from: ai.tool-calling, to: lab:evaluation-harness }
  - { type: member, from: project:knowledge-assistant, to: ai.tool-calling }
resources:                      # only resources referenced by a block
  <id>: { title, url, type?, author? }
```

`L10n` is `{ en: string, vi?: string }`. Curriculum text carries only `en` until a reviewed translation exists; the renderer falls back to `en` and marks the passage `lang="en"`.

Item references use `<ref_prefix>:<id>` (`lab:`, `project:`, `path:`); competency ids stay bare. Items are listed in source order for `file#key` sources (the catalog) and by id otherwise; relations are sorted.

### Blocks

Every block has `type`, `id` (stable anchor), and `title: L10n`, and may have `step: true` when it is something the learner does (diagnostic, sources, practice, exit evidence, transfer); the flag is omitted otherwise and set per block in `presentation.yaml`. The renderer keeps one component per type; unknown types render as `data`.

| type            | payload                                                                                                                              | interactive behaviour                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`          | `body: L10n`, `format?: markdown`                                                                                                    | none; a Markdown body renders at build time with headings one level down, relative links resolved against the item's `source_path` (to the atlas page of the item at that path, else to the repository), and raw HTML escaped                            |
| `list`          | `items: L10n[]`, `ordered: bool`                                                                                                     | none                                                                                                                                                                                                                                                     |
| `prerequisites` | `items: [{ ref, bridge?: { diagnostic?: L10n, resource, locator?: L10n, purpose?: L10n } }]`                                         | links to referenced items that have pages                                                                                                                                                                                                                |
| `diagnostic`    | `tasks: L10n[]`, `pass_condition: L10n`                                                                                              | answer, compare, record diagnostic evidence                                                                                                                                                                                                              |
| `sources`       | `rows: [{ resource, locator: L10n, purpose: L10n }]`                                                                                 | per-row personal "opened" mark                                                                                                                                                                                                                           |
| `practice`      | `groups: [{ label: L10n, items: [{ text: L10n, ref?, path?, resource?, locator?: L10n }] }]`                                         | links to labs, repository paths, and resources                                                                                                                                                                                                           |
| `runner`        | `runtime: pyodide`, `editable`, `run`, `reference`, `files: { name: text }`, `packages?: string[]`                                   | edit `editable`, run `run` as `__main__` in the browser, show the result, reveal `reference` on a confirmed request, record evidence for the tracked items that point at this item                                                                       |
| `form`          | `fields: [{ id, label: L10n, type: text\|longtext\|choice\|table, help?: L10n, options?: L10n[], columns?: [{ id, label: L10n }] }]` | a decision lab's `browser: {runtime: form}` contract; the learner fills each field (a local draft), "Record evidence" once every field is non-empty (kind `decision`, `review_method: self`), "Export answers" downloads the filled template as Markdown |
| `data`          | `value: any JSON`                                                                                                                    | generic fallback, rendered as nested lists                                                                                                                                                                                                               |

A lab's `browser:` contract carries one runtime: `pyodide` (a `runner` block) or `form` (a `form` block, for the two decision labs). `presentation.yaml` declares both block specs against the same `browser` field; the adapter emits only the block whose `runtime` matches and skips the other, so the labs collection needs no per-lab special-casing.

`resource` is a key in `resources` or an absolute URL. A practice item's `ref` is set when its `path` lies inside an item's repository path (`labs/self-attention/` → `lab:self-attention`).

### Presentation config

`curriculum/presentation.yaml` (content side) declares vocabularies and, per collection, where items come from, their fields, relations, and page blocks. Abridged:

```yaml
version: 1
site: { title: L10n, tagline: L10n, repository: url, specimen: ref, links: [{kind, url}] }
locales: [en, vi]
vocabularies:
  domain: { from: "curriculum/manifest.yaml#domains", key: id, label: title }   # list: key and label fields
  level:                                                                         # mapping: value → English label
    from: "curriculum/manifest.yaml#levels"
    values: { L0: {label: {vi: nhận biết}}, … }      # per-value overrides merged onto `from`; labels merge per locale
  status: { values: { ready: {label: {en: ready, vi: sẵn sàng}}, coverage: {…} } }
  competency_type: { values: { … } }
  state: { values: { unassessed: {…}, gap: {…}, …, applied: {…} } }
collections:
  competencies:
    label: L10n
    items_from: "curriculum/catalog.yaml#competencies"   # file#key list, "dir/*/" directories, or a file glob
    id: id                                               # key holding the id (directory/file name otherwise)
    title: title                                         # key holding the title (README or Markdown H1 otherwise)
    page_from: "{route}/competency.yaml"                 # merged under the catalog entry; the catalog wins
    fields:
      domain: { label: L10n, vocabulary: domain }
      target_level: { label: L10n, vocabulary: level }
      …
    group_by: domain
    facets: [status, target_level]
    page_when: { field: status, in: [seeded, ready] }
    progress: { tracks: true, target_field: target_states }
    relations:
      - { type: prerequisite, field: prerequisites, direction: in }      # in: value → item; out: item → value
      - { type: practice, field: "learning_route.independent_practice[].artifact", direction: out, target: labs }
    blocks:
      - { id: why, field: why, type: text, title: L10n }
      - { id: prerequisites, field: prerequisites, type: prerequisites, support: prerequisite_support,
          bridge: {diagnostic: diagnostic, resource: source, locator: locator, purpose: purpose}, title: L10n }
      - { id: outcomes, field: outcomes, type: list, title: L10n }
      - { id: diagnostic, step: true, field: diagnostic, type: diagnostic, map: {tasks: tasks, pass_condition: pass_condition}, title: L10n }
      - { id: sources, step: true, field: learning_route.mental_model, type: sources, row: {resource: source, locator: locator, purpose: purpose}, title: L10n }
      - { id: visual, step: true, field: learning_route.visual, type: sources, row: {…}, title: L10n }
      - { id: practice, step: true, field: learning_route, type: practice,
          groups: [{field: guided_practice, label: L10n}, {field: independent_practice, label: L10n}],
          item: {text: task, path: artifact, resource: source, locator: locator}, title: L10n }
      - { id: experiments, field: experiments, type: list, title: L10n }
      - { id: exit-evidence, step: true, field: exit_evidence, type: list, title: L10n }
      - { id: transfer, step: true, field: transfer.task, type: text, title: L10n }
    ignore: [id, title, domain, status, curriculum_evidence, resources, metadata, project_spines, review]
  labs:     { label: L10n, ref_prefix: lab, items_from: "labs/*/", content_from: lab.yaml, fields: {path: …, files: …},
              blocks: [{id: brief, file: README.md, type: text, format: markdown, title: L10n},
                       {id: runner, step: true, field: browser, type: runner,
                        map: {runtime: runtime, editable: editable, run: run, reference: reference, files: files, packages: packages}, title: L10n},
                       {id: form, step: true, field: browser, type: form,
                        map: {runtime: runtime, fields: fields}, title: L10n}] }
  projects: { label: L10n, ref_prefix: project, items_from: "projects/*/project.yaml", title: title,
              relations: [{type: member, field: competencies, direction: out}], blocks: [purpose, milestones, evidence], … }
  paths:    { label: L10n, ref_prefix: path, items_from: "paths/*.md", exclude: [README.md], fields: {path: …} }
```

- Block order on the page is the order in this file. A block whose field is absent is skipped.
- `bridge`, `map`, `row`, and `item` map payload keys to content keys, so the adapter names no curriculum field.
- A relation value containing `/` is a repository path, resolved to the item whose path contains it; with `target`, only items of that collection count.
- Directory items get the derived fields `path` and `files`; file items get `path`. `content_from` names an optional YAML file inside each directory whose keys are the item's content (labs: `lab.yaml`).
- A block reads either a content `field` or a `file` inside a directory item (its text is the value). A `text` block with `format: markdown` drops the file's leading H1, which is the item title.
- A `runner` block's `files` holds the editable, run, and reference files plus the listed fixtures, read from the item's directory. A lab without a `browser:` contract has no runner block, so its page renders the README only. The page puts the runner beside the other blocks (the workbench layout in site/DESIGN.md → Labs).
- `ignore` lists fields deliberately not rendered.

### Checks

- `scripts/build_site_data.py --check` fails on a stale model, an unknown block type, a reference that does not resolve (prerequisite, relation, resource, practice path), a missing vocabulary value, or a schema violation.
- Unmapped-field detection walks nested paths (`a.b`, `a.b[].c`, `*` for any mapping key). Content not covered by an item field, a relation, a block's consumed keys, or `ignore` is **warned** about (listed, exit 0) and rendered as a `data` block at the end of the page, one per path.
- `schemas/site-data.schema.json` v2 validates the model.
- A site test renders every block type from a fixture, including `data` with unknown shapes.

## Consequences

- Section titles move from `site/src/i18n` to `presentation.yaml`; site i18n keeps interface chrome only.
- Labs, projects, and paths become collections the site can list and page without new site code.
- Another repository can reuse the site by producing a v2 model.
