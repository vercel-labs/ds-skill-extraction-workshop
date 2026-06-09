---
role: user
phase: 2
---

This UI must be built with Primer React (`@primer/react`).

Build a GitHub-style "Create a new repository" screen from the attached design. Edit `app/page.tsx` and add nested showcase components under `components/showcase/` (mirror `Downloads/import-design-system`).

## File structure

- `app/page.tsx` — `"use client"`. Stacks two showcase sections, each with a medium section heading and a muted subtitle: "Components" and "Composition".
- `components/showcase/component-showcase.tsx` — the **Components** block.
- `components/showcase/create-repo-card.tsx` — the **Composition** card.

## Components section

A horizontal row of buttons demonstrating the full action palette:

- A primary "New repository" with a plus icon.
- A default "Clone" with a download icon.
- A destructive "Delete" with a trash icon.
- A ghost "Cancel".
- An icon-only "Star" heart button.

A second row of feedback and metadata:

- Five status pills covering label semantics — `enhancement`, `approved`, `needs review`, `bug`, `resolved`. Pick the visual treatment that matches each meaning.
- A branch indicator: a branch icon next to muted text "main".
- Two counter badges: one neutral "12", one accented "3".

## Composition section

A card surface containing a header, an info callout, three form fields, a checkbox, and a footer action row.

**Header:** a small GitHub mark icon beside a vertical stack with a repo icon, the title "Create a new repository", and a muted subtitle ("A repository contains all project files, including the revision history.").

**Info callout:** a default-tone informational message — "You are creating this repository in your personal account."

**Form fields** (each properly labelled, with help text where noted):

- **Repository name** (required) — single-line input with a leading repo icon, placeholder `awesome-project`, and a caption: "Great repository names are short and memorable."
- **Description** (optional) — multi-line textarea, 3 rows, vertically resizable, placeholder "Optional description".
- **Visibility** — select with Public and Private options.
- **Initialize with README** — checkbox, checked by default, with a caption beneath: "This is where you can write a long description for your project."

**Footer:** a right-aligned row with a ghost Cancel button followed by a primary Create repository button.

The card uses the design system's surface tokens for background, border, radius, and shadow. Do not hand-pick colours or px values.

## Behaviour and constraints

- Both showcase files are `"use client"`.
- Use mock/default values inline — no API calls, no new dependencies.
- All form inputs must be accessibly labelled. Icon-only controls must have accessible names.
- Muted secondary text uses the design system's muted-foreground token, not a hex.
- Follow whatever rules `extract-ds-skill` put in `.claude/skills/ds/` (or `extracted-skill/` in dry-run snapshots).

## Out of scope

- Foundation showcases (color palette, type scale) from the broader starter page.
- Real GitHub API integration, org/account switching, repository name availability checks.
- Marketing copy beyond the strings named above.
