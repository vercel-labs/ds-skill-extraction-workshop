---
role: user
phase: 2
---

Build a GitHub-style "Create a new repository" screen from the attached design. For this task, edit `app/page.tsx` and add nested showcase components under `components/showcase/` (mirror `Downloads/import-design-system`).

Use ONLY the components in `ds/components/`:

**Layout & typography** (page chrome and section headings):

- `Stack` (vertical/horizontal layout, gap, padding, justify, align, wrap)
- `Heading` (section titles and card title)
- `Text` (muted subtitles and the branch "main" label)

**Buttons & actions** (`component-showcase.tsx`):

- `Button` (primary, default, danger, invisible variants; `leadingVisual` for icon buttons)
- `IconButton` (heart icon-only control — `aria-label` required)

**Feedback & metadata** (`component-showcase.tsx`):

- `Label` (status pills: `accent`, `success`, `attention`, `danger`, `done`)
- `CounterLabel` (plain + `scheme="primary"`)

**Form composition** (`create-repo-card.tsx`):

- `Avatar` (header avatar beside the title)
- `Flash` (account context callout — NOT `Banner`; use `variant="default"`)
- `FormControl` (wraps every field; `required` on repository name)
- `TextInput` (`block`, `leadingVisual={RepoIcon}`, placeholder `awesome-project`)
- `Textarea` (`block`, `rows={3}`, `resize="vertical"`)
- `Select` with `Select.Option` (Public / Private)
- `Checkbox` (`defaultChecked`; label follows the checkbox inside `FormControl`)
- `Button` (footer: invisible Cancel + primary Create repository)

**Icons** — import from `@primer/octicons-react` (not `ds/components/`):

- `PlusIcon`, `DownloadIcon`, `TrashIcon`, `GitBranchIcon`, `HeartIcon` (showcase)
- `RepoIcon` (repository name `leadingVisual` and card title)

File structure:

- `app/page.tsx` — `"use client"`; stacks the two showcase sections with section headings.
- `components/showcase/component-showcase.tsx` — the **Components** block.
- `components/showcase/create-repo-card.tsx` — the **Composition** card.

Requirements:

**`app/page.tsx`:**

- Import and render `<ComponentShowcase />` then `<CreateRepoCard />` inside a vertical `Stack` with `gap="spacious"`.
- Each section gets a medium `Heading` ("Components", "Composition") and a muted `Text` subtitle matching the reference copy.

**Components section** (`component-showcase.tsx`):

- **Buttons row:** `Button variant="primary" leadingVisual={PlusIcon}` ("New repository"), `Button variant="default" leadingVisual={DownloadIcon}` ("Clone"), `Button variant="danger" leadingVisual={TrashIcon}` ("Delete"), `Button variant="invisible"` ("Cancel"), `IconButton icon={HeartIcon} aria-label="Star" variant="default"`.
- **Labels & counters row:** five `Label` pills (`enhancement` → `variant="accent"`, `approved` → `success`, `needs review` → `attention`, `bug` → `danger`, `resolved` → `done`), then `GitBranchIcon` + `Text` "main", then `CounterLabel` "12" and `CounterLabel scheme="primary"` "3".
- Pass icon **components** to `leadingVisual` / `icon` — never JSX elements (`leadingVisual={PlusIcon}`, not `leadingVisual={<PlusIcon />}`).

**Composition section** (`create-repo-card.tsx`):

- Card surface: a token-styled `<div>` with `backgroundColor: var(--bgColor-default)`, `border: 1px solid var(--borderColor-default)`, `borderRadius: var(--borderRadius-large)`, `boxShadow: var(--shadow-resting-medium)` — not hand-tuned px colours.
- **Header:** horizontal `Stack` with `Avatar` (40px, octocat URL from reference) beside a vertical `Stack` containing `RepoIcon` + `Heading` "Create a new repository" and muted `Text` subtitle.
- **Info callout:** `<Flash variant="default">You are creating this repository in your personal account.</Flash>`.
- **Repository name:** `FormControl required` → `FormControl.Label`, `TextInput block leadingVisual={RepoIcon}`, `FormControl.Caption` help text.
- **Description:** `FormControl` → `Textarea block rows={3} placeholder="Optional description" resize="vertical"`.
- **Visibility:** `FormControl` → `Select` with Public and Private options.
- **README:** `FormControl` with `Checkbox defaultChecked` before `FormControl.Label`, plus `FormControl.Caption`.
- **Footer:** horizontal `Stack justify="end"` with invisible Cancel then primary Create repository.

**Behaviour and constraints:**

- Both showcase files are `"use client"`.
- Use mock/default field values inline — no API calls, no new dependencies beyond `@primer/octicons-react` (already a peer of `@primer/react`).
- Every interactive input (`TextInput`, `Textarea`, `Select`, `Checkbox`) MUST live inside `FormControl` per the extracted skill's a11y rules.
- Muted secondary text uses `color: "var(--fgColor-muted)"` — never a gray hex.
- Do not pass `aria-label` to any `Button` that already renders visible text. `IconButton` MUST have `aria-label`.
- Follow whatever rules the `extract-ds-skill` output put in `.claude/skills/ds/` (or `extracted-skill/` in dry-run snapshots).

**Out of scope for this prompt:**

- `ColorPalette`, `TypeScale`, or other foundation showcases from the full import-design-system starter page.
- Real GitHub API integration, org/account switching, or repository name availability checks.
- Marketing copy beyond the strings named above.

## `ds/components/` inventory (source of truth)

Phase 2 targets the create-repository surface, not the issues list. The wrapper set in `ds/components/` was replaced to match `Downloads/import-design-system` — only particles this screen needs.

**Removed** (issues-page set — no longer in `ds/components/`):

- `PageHeader`, `Banner`, `DataTable`, `SelectPanel`, `ActionMenu`, `ActionList`

**Added** (14 wrappers — thin re-exports from `@primer/react`):

| Wrapper | Role in this screen |
|---------|---------------------|
| `Stack`, `Heading`, `Text` | Page layout and section chrome |
| `Button`, `IconButton` | Showcase buttons + form footer |
| `Label`, `CounterLabel` | Showcase pills and counters |
| `Avatar` | Card header |
| `Flash` | Account context callout (not `Banner`) |
| `FormControl` | Wraps every field |
| `TextInput`, `Textarea`, `Select`, `Checkbox` | Form fields |

Each wrapper ships as `ds/components/<Name>.tsx`. Headline rules live in `*.docs.tsx` where applicable: `Button`, `IconButton`, `FormControl`, `Flash`.

**Not wrapped** (import directly):

- `@primer/octicons-react` — `PlusIcon`, `DownloadIcon`, `TrashIcon`, `GitBranchIcon`, `HeartIcon`, `RepoIcon`

Re-run `extract-ds-skill` against the updated `ds/components/` before Phase 2 so `.claude/skills/ds/` reflects the new inventory.
