# AGENTS.md

Guidance for AI agents and coding assistants working in this repository.

## Core principle

Do not invent the structure, wording, metadata, or presentation style of this repository from scratch when established open-source learning repositories already provide strong patterns.

Before changing public-facing content, study relevant reference repositories and reuse proven conventions where appropriate.

## Reference repositories

Use these as primary design references:

- OSSU Computer Science — curriculum governance, navigation, prerequisite-oriented curriculum structure
- Microsoft learning repositories — lesson packaging, getting started sections, lesson indexes, contributor ergonomics
- Made With ML — practical progression from notebook to code, testing, deployment, and production
- roadmap.sh — roadmap navigation, progress-oriented learning UX, topic discoverability
- mlabonne/llm-course — concise resource tables and section-level discoverability

Other high-quality repositories may be used when they demonstrate a clearer pattern for the specific problem.

## Public-facing writing rules

For README files, curriculum pages, contribution docs, landing pages, and repository metadata:

1. Prefer wording patterns observed in respected open-source repositories over newly invented marketing language.
2. Lead with what the repository contains, who it is for, and how to use it.
3. Keep introductions short.
4. Prefer concrete nouns and verbs over slogans.
5. Avoid unnecessary manifesto language.
6. Avoid repeated phrases such as:
   - "source of truth"
   - "evidence-backed"
   - "executable curriculum"
   - "not X, but Y"
   unless they are necessary to explain a real design constraint.
7. Do not fill README files with generic AI-generated claims or promotional copy.
8. Avoid excessive bold text, emojis, decorative callouts, or long blockquotes.
9. Prefer tables, indexes, concise lists, and links when they improve navigation.
10. Put detailed policies in dedicated files rather than overloading the root README.

## README structure

Before editing the root README, compare the layout against the reference repositories.

A typical order should be:

1. Project title
2. One short description
3. Optional badges only when they represent real repository state
4. What this repository contains
5. Who it is for / prerequisites
6. How to use the roadmap
7. Curriculum or roadmap index
8. Learning method / progress model
9. Repository structure only if useful to contributors
10. Contributing
11. License

Do not include every internal design decision in the README.

Governance belongs in files such as:

- `CURRICULUM.md`
- `CONTRIBUTING.md`
- `AI_POLICY.md`
- `rfcs/`

## Metadata rules

Repository metadata should be concise and descriptive.

For repository descriptions, topics, section titles, badges, issue templates, and navigation:

- benchmark comparable repositories first;
- use common terminology users are likely to search for;
- do not invent unusual labels when an established term exists;
- do not add badges without a working workflow, package, license, release, or deployment behind them;
- do not add claims such as "best", "complete", "ultimate", or "production-ready" without objective support.

## Layout rules

Prefer layouts that are easy to scan on GitHub.

Good patterns:

- short sections;
- curriculum tables;
- domain indexes;
- relative links;
- one clear navigation hierarchy;
- self-contained competency folders;
- separate resource registries;
- diagrams only when they communicate structure better than text.

Avoid:

- giant walls of text;
- duplicate navigation systems;
- deep folder trees without indexes;
- README sections that merely restate file names;
- decorative diagrams with no learning or navigation value.

## Curriculum content

AI must not infer required curriculum content solely from general model knowledge.

When adding or changing competencies:

1. Gather source material first.
2. Record the source.
3. Extract the relevant topic or learning objective.
4. Map it to the existing competency taxonomy.
5. Check for duplicates or overlap.
6. Propose the change.
7. Update curriculum only after the evidence is clear.

For substantial competency changes, prefer an RFC.

## Resource curation

Do not add a resource simply because it is popular.

For each resource, determine:

- what competency it covers;
- whether it is primary, visual, practice, or reference material;
- whether it duplicates an existing resource;
- whether it is current enough for the topic;
- whether the link is official or authoritative where possible.

## AI assistance

AI may:

- extract structure from sources;
- classify resources;
- summarize verified material;
- generate quiz questions from approved sources;
- review labs and code;
- propose visualizations;
- propose curriculum changes.

AI must not:

- silently invent competencies;
- fabricate source coverage;
- create authoritative learning objectives without evidence;
- rewrite the repository into generic marketing copy;
- replace observed repository conventions with stylistic preferences merely because they sound polished.

## Before committing public-facing changes

Check:

- Did I inspect comparable repositories first?
- Is this structure borrowed from a proven pattern where possible?
- Is the wording concrete and restrained?
- Did I remove AI-style filler?
- Are metadata claims verifiable?
- Is detailed policy placed outside the root README?
- Can a new visitor understand what to do within the first screen or two?

If the answer to any of these is no, revise before committing.
