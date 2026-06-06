# AGENTS.md — `extract-ds-skill`

## What this is

The meta-skill at this path is an extractor that builds Claude Code design-system skills from real DS sources (component library code, token sets, asset packages, docs sites, Storybook). It scans the source, classifies what it finds, validates a scratch extraction against the live code, and persists a per-project skill at `.claude/skills/<slug>/` in the attendee's repo. In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## Load order

1. `SKILL.md` — required in full before any phase action. The routing table lives there.
2. `references/discovery.md` — load when entering Phase 1 (source classification + discovery-summary budget).
3. `references/validate.md` — load when entering Phase 2 (scratch workspace, typecheck + grep-resolves contract).
4. `references/persist.md` — load when entering Phase 3 (slug-collision check, write path, closing-message contract).
5. `references/skill-template.md` — load when emitting the skill's own `SKILL.md` (contract for the file the meta-skill WRITES).
6. `references/component-extraction.md` — load when emitting `references/components/*.md` (per-component file heuristics + six rule shapes).
7. `references/anti-patterns.md` — load when extracting Bad/Good/Why pairs or inline anti-pattern callouts.
8. `references/inheritance.md` — load only when a maintainer asks why a pattern is or is not in the skill.
9. `references/coverage-gaps.md` — load when surfacing the self-aware backlog in the closing message.

## Harnesses

- `scripts/inspect.sh` — Phase 1 source classifier; walks the input path and tags each artifact as `code | asset-package | app | AGENTS-CLAUDE | docs | storybook | figma | private-blocker`.
- `scripts/validate.sh` — Phase 2 deterministic typecheck + grep-resolves against the scratch workspace; surfaces "N props verified against source, M hallucinations" before the persist gate.
- `scripts/scaffold.sh` — Phase 3 writer; runs the slug-collision check FIRST and exits 75 (ASK) on conflict, never silently suffixes.
- `scripts/check-skill-docs.sh` — Phase 3 post-emit consistency check; every routing-table row resolves to a real file, every rule slug resolves, every `[VERIFY]` marker is grep-counted and surfaced in the closing message.

## Requirements (cross-platform)

These scripts are POSIX shell harnesses: they need bash plus a Unix userland (`grep`, `sed`, `awk`, `find`, `git`, `node`, etc.). They are written to run on bash 3.2+ (macOS default), so no version upgrade is needed anywhere.

- macOS / Linux — runs as-is.
- Windows — run under Git Bash (ships with Git for Windows) or WSL. Native `cmd`/PowerShell will not work; there is no Unix userland and the `#!/usr/bin/env bash` shebang is ignored. There is no separate PowerShell port by design — one bash version is the contract.
- Line endings — repo-root `.gitattributes` pins `*.sh` to `eol=lf`. Do not commit CRLF shell scripts; bash rejects them with `bad interpreter: /usr/bin/env bash^M`.

## Common Agent Failure Modes

- "I extracted the Phase 1 discovery summary inline but skipped the joint-read of code — every rule landed `[VERIFY]`. Joint-read code AND docs in Phase 1; code wins on conflict."
- "I emitted rules without `[VERIFY]` markers and the user couldn't tell which were grounded. Mark every unverified rule `[VERIFY]`."
- "I re-asked the user the same discovery questions twice. If they said 'go', pick defensible defaults per `references/discovery.md` and proceed."
- "I extracted a copy rule (Title Case the label) into the DS skill. Recognize Shape 3 (naming/copy) during extraction and route it out — do not extract."
- "I silently overwrote an existing skill slug. `scaffold.sh` exit-75 means ASK the user — never suffix-rename silently."
- "I declared success without surfacing the `[VERIFY]` markers in the closing message. The user needs to know what still needs human eyes."
