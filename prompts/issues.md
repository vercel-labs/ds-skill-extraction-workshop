---
role: user
phase: 2
---

Build a GitHub-style issues page for a repository. For this task, edit page.tsx on the root of the app folder.

Use ONLY the components in `ds/components/`:

- `PageHeader` (page chrome)
- `Banner` (one status message)
- `DataTable` (issues list)
- `SelectPanel` (filter)
- `ActionMenu` (row-level actions)
- `ActionList` (inside `ActionMenu.Overlay`)

Requirements:

- The page header shows the repo name as the title, a parent-link breadcrumb back to the org, one primary "New issue" action, and an underline-nav row with tabs for Code / Issues / Pull requests / Actions. Issues is the active tab.
- One banner near the top announcing a security advisory the user must act on.
- A sortable table of at least 5 issues with columns: title (row header), status, author, comments count, updated (relative time). Sort by updated, descending.
- One `SelectPanel` above the table for filtering by label, with multi-select enabled and at least 4 labels (bug, enhancement, docs, good-first-issue).
- Each row ends with a kebab `ActionMenu` offering: Pin, Lock, Transfer, Delete (Delete is destructive).

Wire the whole thing as a single `app/issues.tsx`. Use mock data inline. Do not introduce new dependencies. Follow whatever rules the `extract-ds-skill` output put in `extracted-skill/`.
