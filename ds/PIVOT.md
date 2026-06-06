# Component set pivot — forms → product-surface

**Date:** 2026-06-06
**Status:** Proposed. Existing form components remain in place until DESIGN.md, prompts, and meta-skill dry-runs are updated.

## What changes

The DS library stays GitHub Primer React (`@primer/react`, MIT). The curated subset changes.

**Out** (4 form components):

- `TextInput`
- `Button`
- `Checkbox`
- `FormControl`

**In** (5 product-surface components):

- `DataTable` — sorted, density-toggled tables
- `PageHeader` — full app-shell header with slots for title, breadcrumbs, actions, navigation
- `SelectPanel` — filterable, grouped, single/multi-select overlay
- `Banner` — 5 tonal variants (info / critical / warning / success / upsell)
- `ActionMenu` — trigger-anchored popover with actions and submenus

## Why

The workshop's Block 5 reveal needs visual punch in the moment the agent emits the generated artefact. A sign-in form is functionally complete but visually flat — the audience sees "a form," not "a thing." The product-surface 5 compose into a recognisable GitHub-style repo screen on first glance: header, table of issues, status banner, filter panel, row actions. The wow lands *before* the audit fires.

Secondary: this set is denser in **model traps**. The form set has one canonical trap (the headline rule). The new set covers five distinct trap categories the meta-skill can extract:

1. **Slot composition** (PageHeader: visuals go *inside* `TitleArea`; actions go *outside*)
2. **Semantic variants** (Banner: models reach for `critical` when `warning` is right — TypeScript accepts both)
3. **Accessibility wiring** (DataTable: exactly one `rowHeader: true` column required, `aria-labelledby` wired manually)
4. **Controlled-state coordination** (SelectPanel: snapshot `selected` on open, restore in `onCancel` for multi-select; ActionMenu: `open` + `onOpenChange` must be paired)
5. **Trigger composition** (ActionMenu: submenus need `ActionMenu.Anchor`, not `ActionMenu.Button`)

More rules to extract → richer audit output in Phase 3 → longer money-shot moment.

## What stays the same

- **DS library:** still `@primer/react` (MIT). Same install path, same `<ThemeProvider><BaseStyles>` wrap, same `@primer/primitives` peer dep.
- **Wrapper pattern:** each component is a thin re-export from `@primer/react` with a single named export.
- **Meta-skill behaviour:** `extract-ds-skill` inspects whatever lives in `ds/components/` and `ds/DESIGN.md`. It does not need code changes — only the source it reads changes.
- **IP posture:** identical. MIT, one disclaimer line, no Octocat artwork. `Banner` and `PageHeader` are not GitHub trademarks.

## What changes downstream

These need to be updated before the next dry-run:

1. **Replace component files.** Delete `Button.tsx`, `Checkbox.tsx`, `FormControl.tsx`, `TextInput.tsx`, `Button.docs.tsx`, `FormControl.docs.tsx`. Add `DataTable.tsx`, `PageHeader.tsx`, `SelectPanel.tsx`, `Banner.tsx`, `ActionMenu.tsx`. Mirror the existing wrapper shape.
2. **Rewrite `ds/DESIGN.md`.** The current floor covers form composition (FormControl wraps Label + Input + Validation) and the `inactive`-vs-`disabled` headline rule. New DESIGN.md needs: PageHeader slot composition rules, Banner variant semantics, DataTable a11y wiring, SelectPanel controlled-state pattern, ActionMenu trigger composition. Estimated rewrite: 3–4 hours.
3. **Update `prompts/sign-in.md`.** The current prompt is *"Build a sign-in form with email and password fields and a submit button. Use the components in ds/."* — no longer applicable. Rename to `prompts/build.md` (or `prompts/issues.md`) with the new prompt below.
4. **Update `prompts/audit.md`** if it references form-specific rules.
5. **Update `README.md`.** Phase 2 description currently says "build a sign-in form."
6. **Update `app/sign-in.expected.tsx`** fallback (if it exists yet) — becomes the issues-page fallback.

## Suggested Phase 2 prompt (for a model to run)

```
Build a GitHub-style issues page for a repository.

Use ONLY the components in ds/components/:
- PageHeader (page chrome)
- Banner (one status message)
- DataTable (issues list)
- SelectPanel (filter)
- ActionMenu (row-level actions)

Requirements:
- The page header shows the repo name as the title, a parent-link
  breadcrumb back to the org, one primary "New issue" action, and an
  underline-nav row with tabs for Code / Issues / Pull requests /
  Actions. Issues is the active tab.
- One banner near the top announcing a security advisory the user
  must act on.
- A sortable table of at least 5 issues with columns: title (row
  header), status, author, comments count, updated (relative time).
  Sort by updated, descending.
- One SelectPanel above the table for filtering by label, with multi-
  select enabled and at least 4 labels (bug, enhancement, docs,
  good-first-issue).
- Each row ends with a kebab ActionMenu offering: Pin, Lock, Transfer,
  Delete (Delete is destructive).

Wire the whole thing as a single `app/page.tsx`. Use mock data inline.
Do not introduce new dependencies. Follow the rules in `.claude/skills/ds/`.
Stay in the current worktree unless the user explicitly asks for a dry-run replay.
```

## Acceptance criteria (what Phase 3's audit should check)

The reflexive audit should walk each rule from the extracted skill against `app/page.tsx` and flag at least:

- **PageHeader slot placement** — `LeadingVisual`/`TrailingVisual` nested *inside* `TitleArea`; `Actions` and `TrailingAction` *outside*. Models commonly swap these.
- **Banner variant semantics** — the security advisory should be `critical` only if it blocks the user; otherwise `warning` or `info`. Models default to `critical` for anything red.
- **DataTable rowHeader requirement** — exactly one column should set `rowHeader: true`. Title is the conventional pick.
- **DataTable initial sort** — `data` should be pre-sorted to match `initialSortDirection`; the component does not sort on mount.
- **SelectPanel cancel semantics** — for multi-select, the parent must snapshot `selected` when the panel opens and restore in `onCancel`. Models often omit this.
- **ActionMenu destructive item** — Delete should use the destructive variant on its `ActionList.Item`; the menu must announce the role correctly (`menuitem`, not `menuitemcheckbox`).
- **ActionMenu controlled-state pairing** — if `open` is controlled, `onOpenChange` must also be wired.

A clean PASS on all of these means the agent honoured the extracted skill. A FAIL on any one becomes the headline moment for Block 5's reveal.

## Reference

Top-10 candidate list and full pitfall taxonomy preserved in the vault:
`05 Talk Outline/Workshop DS Component Pivot — Forms to Product Surface (2026-06-06).md`.

Component documentation:

- DataTable: <https://primer.style/product/components/data-table>
- PageHeader: <https://primer.style/product/components/page-header>
- SelectPanel: <https://primer.style/product/components/select-panel>
- Banner: <https://primer.style/product/components/banner>
- ActionMenu: <https://primer.style/product/components/action-menu>
