---
role: user
phase: 2
---

This UI must be built with Primer React (`@primer/react`).

Build a GitHub-style "Draft a new release" composer. Edit `app/page.tsx` and add the composition under `components/showcase/release-composer.tsx` (`"use client"` on both).

## Page anatomy

A large page title "Draft a new release" with a muted subtitle ("Releases package software, release notes, and binary files for other people to use."), above a card surface containing the composer.

## Composer card

**Status strip** at the top of the card: an attention-tone callout — "This release will be published as a pre-release. It will not be marked as the latest release."

**Tag row**: a horizontal pair —

- **Tag** (required) — single-line input with a leading tag icon, placeholder `v2.1.0`, caption "Choose an existing tag or create a new one on publish."
- **Target branch** — select with options `main`, `release/2.x`, `canary`.

Next to the pair, a compact metadata cluster: a neutral counter badge "14" beside muted text "previous releases", and a status pill reading `pre-release` with an attention treatment.

**Release details**:

- **Release title** (required) — single-line input, placeholder "v2.1.0 — Quality of life".
- **Release notes** — multi-line textarea, 8 rows, vertically resizable, placeholder "Describe what changed…", with a caption: "Markdown is supported. Drag in screenshots or binaries to attach them."

**Attached assets**: a vertical list of two mock asset rows. Each row: a file icon, the filename in regular text, the file size in muted small text, an accented counter badge with the download count, and an icon-only destructive remove control (trash) with an accessible name. Above the list, a small section heading "Assets" with a neutral counter badge showing "2".

**Publish options** (each properly labelled):

- **Set as a pre-release** — checkbox, checked by default, caption "This release is identified as non-production ready."
- **Set as the latest release** — checkbox, unchecked, caption "Shown on the repository home page."
- **Create a discussion for this release** — checkbox, unchecked.

**Footer**: a right-aligned row — a ghost "Save draft", a default "Preview", then a primary "Publish release". To the far left of the same row, muted small text "Saved 2 minutes ago" beside a check icon.

## Behaviour and constraints

- Use mock/default values inline — no API calls, no new dependencies.
- All form inputs accessibly labelled; icon-only controls have accessible names.
- The card uses the design system's surface tokens for background, border, radius, and shadow. Muted text uses the muted-foreground token. No hand-picked hex or px values.
- Follow whatever rules `extract-ds-skill` put in `.claude/skills/ds/` (or `extracted-skill/` in dry-run snapshots).

## Out of scope

- Real tag lookup, markdown rendering, file upload handling.
- Generating releases or any GitHub API integration.
