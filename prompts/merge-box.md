---
role: user
phase: 2
---

This UI must be built with Primer React (`@primer/react`).

Build a GitHub-style pull-request **merge box** — the panel at the bottom of a PR conversation that summarises checks, reviews, and conflicts and lets the user merge. Edit `app/page.tsx` and add the composition under `components/showcase/merge-box.tsx` (`"use client"` on both).

## Page anatomy

A medium page title "Merge pull request #482" with a muted subtitle showing the branch pair: "diego wants to merge 3 commits into `main` from `feat/skill-extraction`". Beside the title, a status pill reading `Open` with a success treatment, and a neutral counter badge "3" beside muted text "commits".

## Merge box card

A card surface stacked into four zones, separated by muted top borders.

**Zone 1 — Reviews**: small section heading "Reviews", then two reviewer rows. Each row: a check icon, the reviewer handle in regular text, muted small text "approved these changes", and a status pill (`code owner` accent on the first row, `maintainer` done-tone on the second). A right-aligned icon-only control to re-request review (sync icon) with an accessible name.

**Zone 2 — Checks**: small section heading "Checks" with an accented counter badge "5". Three check rows: CI build (passing — success copy), typecheck (passing), and "skill-audit" (failing — danger copy with muted detail text "2 token violations"). Each failing row gets a right-aligned ghost "Details" action.

**Zone 3 — Conflict callout**: a danger-tone callout — "This branch has conflicts that must be resolved. Resolve conflicts in `references/components.md` before merging." Followed by a danger-tone "Resolve conflicts" action.

**Zone 4 — Merge controls**:

- **Merge method** — select with options "Create a merge commit", "Squash and merge", "Rebase and merge".
- **Commit headline** (required) — single-line input prefilled "feat: extract skill from ds/ (#482)".
- **Extended description** — multi-line textarea, 4 rows, vertically resizable, placeholder "Optional extended description…".
- **Delete branch after merge** — checkbox, checked by default, caption "The `feat/skill-extraction` branch will be deleted once merged."

**Footer**: a right-aligned row — a ghost "Cancel", then a primary "Merge pull request" that is visually present but disabled while the conflict callout is shown.

## Behaviour and constraints

- Use mock/default values inline — no API calls, no new dependencies. Static composition; no real merge logic.
- All form inputs accessibly labelled; icon-only controls have accessible names.
- Success/danger/attention meanings come from the design system's semantic options — never from hand-picked colours. Surface, border, radius, shadow, and muted text use tokens, not hex/px.
- Follow whatever rules `extract-ds-skill` put in `.claude/skills/ds/` (or `extracted-skill/` in dry-run snapshots).

## Out of scope

- Real check/CI data, diff or conversation views, auto-merge, merge queues.
