# Research: Agent Harness for the Web Atlas

- Status: Research note (input to the harness RFC, not a decision)
- Created: 2026-09-22
- Scope: `site/AGENTS.md`, `site/DESIGN.md`, `.claude/skills/atlas-ui-review/`, lint/test/hook enforcement
- Method: every claim below was read from the linked page on 2026-09-22. Items not confirmed are in [Unverified](#unverified).

## Summary: 10 rules for this repo

1. **`AGENTS.md` stays the one canonical instruction file**; tool-specific files only import or point to it ([agents.md](https://agents.md/), [Claude memory](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)).
2. **The root `AGENTS.md` must name `site/AGENTS.md` explicitly.** Codex never reads files below its working directory, so a session started at the repo root will not see the nested file ([Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md)).
3. **Adding any `CLAUDE.md` switches off Claude Code's direct `AGENTS.md` reading for that tree**, so every `AGENTS.md` needs a sibling `CLAUDE.md` containing `@AGENTS.md` ([memory](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md)).
4. **Budget size.** Codex caps combined instructions at 32 KiB; Claude recommends under 200 lines per file; Cursor and skills under 500 lines; Copilot says no more than 2 pages.
5. **Write only what the agent cannot discover**: commands it can't guess, non-default conventions, gotchas, reasons. Leave out layout, dependency lists and standard practice ([best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claudemd)).
6. **Prose is advisory. Rules that must always hold go in lint, tests, CI or hooks** ([best practices](https://code.claude.com/docs/en/best-practices#set-up-hooks), [memory](https://code.claude.com/docs/en/memory#claudemd-vs-auto-memory)).
7. **Every agent doc names a check the agent can run** that returns pass/fail, including screenshots for UI ([best practices](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)).
8. **Skills use progressive disclosure**: a precise description, a `SKILL.md` body under 500 lines, reference files one level deep, and scripts for the deterministic parts ([skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
9. **Write evaluations before writing the skill or doc**, then iterate by watching a fresh agent use it ([skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#build-evaluations-first)).
10. **Treat agent docs like code**: review them in PRs, give each an owner, prune regularly, and revisit after model releases ([large codebases](https://code.claude.com/docs/en/large-codebases#layer-claudemd-files-by-directory)).

## Cross-tool compatibility

| Tool | Instruction files | Nesting / precedence | Size limit | Skills location | Source |
|---|---|---|---|---|---|
| AGENTS.md format | `AGENTS.md` | Closest file to the edited file wins; user prompt overrides everything | None stated | n/a | [agents.md](https://agents.md/) |
| Claude Code | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`; `AGENTS.md` only if no `CLAUDE.md` in cwd or above (v2.1.277+) | Ancestors load at launch; subdirectory files load when Claude reads a file there; `@path` imports, max 4 hops | Target <200 lines per file | `.claude/skills/`, including nested `<subdir>/.claude/skills/` | [memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills) |
| Codex | `AGENTS.override.md` > `AGENTS.md` > configured fallbacks, one per directory | Concatenated from repo root down to cwd; closer files appear later; **nothing below cwd is read** | `project_doc_max_bytes` default 32 KiB combined | `.agents/skills` from cwd up to repo root | [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Codex skills](https://learn.chatgpt.com/docs/build-skills) |
| Cursor | `.cursor/rules/*.mdc`, `AGENTS.md` (nested supported) | More specific directory takes precedence | Rules <500 lines | `.agents/skills`, `.cursor/skills`; compat: `.claude/skills`, `.codex/skills` | [rules](https://cursor.com/docs/context/rules), [skills](https://cursor.com/docs/context/skills) |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` (`applyTo`), `AGENTS.md`, or root `CLAUDE.md`/`GEMINI.md` | Nearest `AGENTS.md` takes precedence; PR review reads the head branch | "no longer than 2 pages" | `.github/skills`, `.claude/skills`, `.agents/skills` | [repo instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), [support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support), [skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |

The only skill directory read by Claude Code, Cursor and Copilot is `.claude/skills`. Codex reads only `.agents/skills`, and Claude Code's skills page lists no `.agents/` location. Its memory page also says Claude does not read "anything under a `.agents/` directory" as instructions.

## Findings by source

**agents.md** ([site](https://agents.md/), [repo](https://github.com/agentsmd/agents.md), MIT)
- The site describes the file as "a README for agents". Plain Markdown with no required fields. Suggested sections: overview, build/test commands, code style, testing, security, PR guidelines.
- "Closest AGENTS.md to the edited file wins; explicit user chat prompts override everything."
- Agents "will attempt to execute relevant programmatic checks" listed in the file. Listing commands therefore changes behaviour.

**Claude Code memory** ([memory](https://code.claude.com/docs/en/memory))
- CLAUDE.md is "context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook."
- Size: "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." Imports do not save context, because imported files "still load… at launch".
- Consistency: "if two rules contradict each other, Claude may pick one arbitrarily."
- AGENTS.md rules are quoted in rule 3 above. A `CLAUDE.md` that *tells Claude in words* to read `AGENTS.md` means "Claude sees AGENTS.md only if it decides to open the file". Use an `@AGENTS.md` import instead. The import "never makes Claude read AGENTS.md twice".
- Direct AGENTS.md reading is unavailable on Bedrock or other third-party providers, with telemetry disabled, or in the first session after an upgrade. Symlinking `CLAUDE.md` breaks Windows clones.
- `.claude/rules/*.md` with `paths:` frontmatter load only when matching files are read.
- `/doctor` proposes trims: it "cuts content Claude can derive from the codebase… and keeps pitfalls, rationale, and conventions that differ from tool defaults."

**Claude Code best practices** ([docs](https://code.claude.com/docs/en/best-practices); the former engineering blog URL redirects here)
- Exclude what code reveals, standard conventions, detailed API docs, "information that changes frequently", and file-by-file descriptions.
- Test for each line: "Would removing this cause Claude to make mistakes?" Also: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!"
- Emphasis: add "IMPORTANT" "to that line alone. If you emphasize many lines, none of them stands out."
- "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic."
- Verification: "Give Claude a check it can run: tests, a build, a screenshot to compare." A Stop hook can gate the end of a turn. Claude Code overrides it after 8 consecutive blocks. A fresh subagent reviewer avoids self-grading.

**Large codebases** ([docs](https://code.claude.com/docs/en/large-codebases))
- Use two levels: a root file for repo-wide rules and a per-subsystem file for that stack. "Each directory's owner typically maintains its file."
- Keeping files current: review in PRs, "revisit after major model releases", and optionally a Stop hook that proposes updates.

**Skills** ([Claude Code skills](https://code.claude.com/docs/en/skills), [authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Agent Skills spec](https://agentskills.io/specification), [engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills))
- Three levels: metadata is always loaded, the body loads on invocation, other files load as needed. The standard was published as an open standard on 2025-12-18.
- `name` is at most 64 characters, lowercase letters/digits/hyphens, and must match the directory (spec). `description` is at most 1,024 characters (spec). Claude Code truncates `description` + `when_to_use` at 1,536 characters.
- Portable fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. `paths`, `disable-model-invocation`, `context` and similar are Claude Code only.
- `disable-model-invocation: true` removes the description from context. The skill then runs only when a person invokes it.
- Write descriptions "in third person", covering what the skill does and when to use it. The body stays under 500 lines, "references one level deep", with a table of contents for reference files over 100 lines.
- Use "Prefer scripts for deterministic operations" and the "validator → fix errors → repeat" pattern. Make the intent explicit: say whether to run a script or read it.
- Build evaluations first (three scenarios, measure a baseline without the skill). Test with every model you plan to use. Use the Claude A/B iteration loop.

**Context engineering** ([post](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))
- Aim for "the smallest possible set of high-signal tokens". Recall degrades as the context grows.
- Write at the "right altitude": neither brittle hard-coded logic nor vague guidance. Use "diverse, canonical examples", not "a laundry list of edge cases".

**Prompting best practices** ([docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices))
- "Tell Claude what to do instead of what not to do" (stated for output formatting). Explaining the reason behind an instruction improves targeting.
- For current models, "dial back any aggressive language". Replace "CRITICAL: You MUST…" with "Use this tool when…".

**DESIGN.md** ([google-labs-code/design.md](https://github.com/google-labs-code/design.md), Apache-2.0, **alpha**)
- Format: YAML front matter with tokens (colors, typography, spacing, radii, components), then a Markdown body with ordered sections: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
- The CLI provides `lint`, `diff`, and `export` (Tailwind or W3C DTCG).

## Recommendations for this repo

### File layout

```text
AGENTS.md              # existing; add one pointer line for site/ work
CLAUDE.md              # "@AGENTS.md" (+ Claude-only notes, if any)
site/AGENTS.md         # Astro+React, i18n, Worker: commands, gotchas, checks
site/CLAUDE.md         # "@AGENTS.md"
site/DESIGN.md         # design rules; tokens are the single source
.claude/skills/atlas-ui-review/
  SKILL.md
  scripts/capture.mjs  # deterministic screenshots
.claude/settings.json  # hooks
```

- **Root pointer.** Add one line to `AGENTS.md`: "Work under `site/` (web app, Worker): read `site/AGENTS.md` first." This line is required for Codex sessions started at the root (rule 2). It also helps any tool that loads the nested file only after a read.
- **CLAUDE.md pairs.** Add `CLAUDE.md` containing `@AGENTS.md` at the root and in `site/`. The import is deterministic and works where direct AGENTS.md reading is unavailable. Once the root `CLAUDE.md` exists, `site/AGENTS.md` is no longer read directly, so `site/CLAUDE.md` is required, not optional. Use an import rather than a symlink, for Windows clones and editability.
- **Split by scope.** The curriculum rules stay at the root. `site/AGENTS.md` holds only site facts: the `pnpm`/`wrangler` commands the agent can't infer, the i18n rule (the stale-translation marker, never machine translation), the COOP/COEP header requirement for Pyodide, the rule that `atlas.json` is generated (`scripts/build_site_data.py --write`, never hand-edited), and the checks to run.
- **Budget.** The root file is 8.5 KB (230 lines), already above Claude's 200-line target. Keep `site/AGENTS.md` under ~120 lines and the combined chain under 32 KiB. Enforce this with a check (below).
- **DESIGN.md.** Put it at `site/DESIGN.md` and reference it from `site/AGENTS.md` with a trigger line: "Before changing UI under `site/src/`, read `site/DESIGN.md`; after, run the `atlas-ui-review` skill or `make site-ui`." Do not `@import` it, because an import loads it into every Claude session, including curriculum work, and only in Claude. Consider the google-labs format for machine-readable tokens. It is alpha, so pin the CLI version or generate tokens yourself. The tokens should generate the CSS variables, or a test should compare them, so the prose cannot drift from the code.

### `atlas-ui-review` skill

- Keep the skill **model-invoked**: agents should run it after UI changes without being asked. Suggested description: "Reviews rendered pages of the web atlas against site/DESIGN.md using screenshots. Use after changing components, styles, layout, or i18n strings under site/." Use third person, lead with keywords, and stay well under 1,024 characters.
- `name: atlas-ui-review` matches the directory. Use only portable fields plus an optional `paths: site/**`, which other tools ignore.
- Body steps: build → serve → `node scripts/capture.mjs` (routes × en/vi × light/dark × 375/1280 widths) → compare each screenshot against the DESIGN.md sections → report findings with file paths and severity → re-capture after fixes. The completion criterion is that every capture has been reviewed and each finding has been fixed or listed.
- Point to `site/DESIGN.md` and do not copy its rules (one source of truth).
- **Evaluations first**: three seeded-defect pages (contrast failure, Vietnamese overflow, token misuse), with a baseline run without the skill.
- For Codex: `.claude/skills` is read by Claude Code, Cursor, and Copilot. For Codex, add `.agents/skills/atlas-ui-review` as a symlink only after confirming that Codex follows it (unverified). Otherwise document `make site-ui` in `site/AGENTS.md` so every tool can run the same check.

### Enforce vs. write

| Mechanism | Rules |
|---|---|
| CI (`make check` + `validate.yml`), all tools | `atlas.json` freshness (exists); typecheck; ESLint; Stylelint rules against raw hex/px outside tokens; i18n key parity en↔vi; accessibility checks (e.g. axe) on built pages; `_headers` contains COOP/COEP; agent-doc checks below |
| Agent-doc check script | each `AGENTS.md` has a sibling `CLAUDE.md` that imports it; every `make`/`pnpm` command in backticks exists in `Makefile`/`package.json`; relative links resolve; byte/line budgets; skill `name` = directory and description ≤1,024 characters |
| Claude hooks (`.claude/settings.json`), fast feedback only | `PostToolUse` on `Edit\|Write` under `site/`: run prettier/eslint on the file; `PreToolUse`: block writes to `site/src/data/atlas.json` (exit 2 with the reason on stderr). Keep any Stop hook short and have it check `stop_hook_active` |
| Prose | why a rule exists, design intent, trade-offs, when to run the skill, gotchas no config reveals |

Hooks work only in Claude Code, so CI is the gate that applies to every tool. Hooks only shorten the feedback loop.

### Keeping docs current

- Add CODEOWNERS entries for `AGENTS.md`, `site/AGENTS.md`, `site/DESIGN.md`, and `.claude/`. Agents may propose changes; the repository owner approves them.
- Add a PR template checkbox: "Changed a command, token, or convention → updated the agent doc in this PR."
- Put the agent-doc check in `make check` so a renamed script fails CI.
- Prune each quarter and after major model releases: delete lines the model already follows by default (`/doctor` can propose these for Claude).

## Local `writing-for-agents` guide vs primary sources

**Agrees**
- Context load, pruning no-ops, and "the environment is a source of truth": matches "Would removing this cause Claude to make mistakes?", the include/exclude table, `/doctor`, and "Claude is already very smart".
- Progressive disclosure and descriptions acting as triggers: matches the skills docs and the engineering post.
- A user-invoked skill costs no context: `disable-model-invocation: true` removes the description from context.
- Single source of truth: the sources warn that contradictory rules get picked arbitrarily and ask for consistent terminology.
- Pointer wording decides whether the agent reaches the material: supported by "Claude sees AGENTS.md only if it decides to open the file".
- Positive phrasing over negation: supported, although the source states it for formatting and the guide generalises it.
- Sediment and pruning: matches "prune regularly" and "revisit after major model releases".

**Diverges or incomplete**
- The guide says to fix a weak word with a stronger one ("relentless"). Anthropic says to dial back aggressive language for current models and to emphasise one line only. Stronger words should be tested, not assumed to help.
- For must-have material the guide says: sharpen the pointer, then inline. Primary sources offer a deterministic third option, `@import` or a path-scoped rule, that the guide does not mention.
- The guide is prose-only. Primary sources say instructions are advisory and that rules which must always hold belong in hooks or CI.
- Missing from the guide: evaluations first with a baseline, testing across models, one-level-deep references, a table of contents for reference files over 100 lines, third-person descriptions, name/description limits, and Claude Code's truncation of descriptions when many skills are loaded.
- "Model-invoked skills stay loaded at all times" is true in principle. In Claude Code, descriptions can be cut when the skill budget is exceeded.

## Unverified

- Whether Codex follows a symlinked `.agents/skills` directory.
- The Cursor rules page claims nested AGENTS.md precedence and "under 500 lines"; I have only the summarised fetch, not verbatim text. The page does not mention whether `.cursorrules` or `CLAUDE.md` are read.
- The context of Copilot's "2 pages" limit (which surface it applies to); the support matrix lists no size limits.
- Who governs agents.md: the repo names no steward.
- Whether a Codex AGENTS.md can import other files the way `@path` works in Claude.
- The DESIGN.md spec details beyond the README summary, such as the exact lint rules and whether tokens are required.
