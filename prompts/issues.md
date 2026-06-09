---
role: user
phase: 2
---

This UI must be built with Primer React (`@primer/react`).

Build a GitHub-style issues page for a repository. For this task, edit page.tsx on the root of the app folder.

## Page anatomy

- **Page header**: repo name as the title, a parent-link breadcrumb back to the org, one primary "New issue" action, and an underline nav row with tabs for Code / Issues / Pull requests / Actions. Issues is the active tab.
- **Banner** near the top announcing a security advisory the user must act on.
- **Label filter** above the table: multi-select, with at least 4 options (bug, enhancement, docs, good-first-issue).
- **Issues table**: at least 5 rows with columns: title (row header), status, author, comments count, updated (relative time). Sortable; default sort by updated descending.
- **Row action menu**: a kebab on each row offering Pin, Lock, Transfer, Delete. Delete is destructive.

## Constraints

Wire the whole thing as a single `app/issues.tsx`. Use mock data inline. Do not introduce new dependencies. Follow whatever rules `extract-ds-skill` put in `.claude/skills/ds/`.
