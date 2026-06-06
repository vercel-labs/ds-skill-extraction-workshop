# Anti-patterns — ds

Cross-cutting traps that surface when composing `ds` components into screens, plus the canonical slug registry referenced from `SKILL.md`.

## Rule slug registry

Every rule the routing table cites by slug resolves here. Format: `component/<name>-<rule>` (kebab-case, single-concept).

| Slug | Component | One-line rule |
|---|---|---|
| `component/page-header-slot-composition` | PageHeader | `LeadingVisual` + `TrailingVisual` go INSIDE `TitleArea`; `ContextArea`, `Actions`, `TrailingAction`, `Navigation` go OUTSIDE. |
| `component/data-table-row-header` | DataTable | Exactly one column must set `rowHeader: true`. Zero loses the SR row-name; multiple fight each other. |
| `component/data-table-pre-sort` | DataTable | `data` must be pre-sorted to match `initialSortDirection`. The component does not sort on mount. |
| `component/select-panel-cancel-snapshot` | SelectPanel | Multi-select must snapshot `selected` in `onOpenChange(true)` and restore it in `onCancel`. |
| `component/banner-variant-semantics` | Banner | `variant` is semantic, not cosmetic. `critical` is for blocking failures only. |
| `component/action-menu-controlled-pairing` | ActionMenu | `open` + `onOpenChange` must be wired together. TypeScript does not enforce the pair. |
| `component/action-menu-trigger-anchor-vs-button` | ActionMenu | Prefer `ActionMenu.Button` (default trigger). Use `ActionMenu.Anchor` only for custom-element triggers. |
| `component/action-list-danger-variant` | ActionList | Destructive items use `<ActionList.Item variant="danger">`. Never a custom red className. |

## Cross-cutting compositions

These traps fire when two or more components are composed in the same screen.

### Issues-page composition

| Bad | Good | Why |
|-----|------|-----|
| `<PageHeader.Actions><Banner ... /></PageHeader.Actions>` (banner inside header chrome) | Render the `<Banner>` as a sibling below `<PageHeader>`, before the table section | `PageHeader.Actions` is for buttons. A Banner inside it collapses into the action row and loses the alert landmark. |
| `<DataTable>` with a row-level `<ActionMenu>` rendered eagerly for every row on mount | Render the kebab cell content lazily; the Overlay is portalled and stays unmounted until `open` flips | 50 Overlays on mount = 50 portal subtrees. Use the column's render fn so only the open menu pays the cost. |
| `<SelectPanel>` filter UI placed inside `<PageHeader>` | Render filter UI as a sibling above the table, below the header | The filter is content-region UI; the header is page chrome. Mixing them confuses the visual hierarchy and the SR landmark map. |

### Variant + semantic-role drift

| Bad | Good | Why |
|-----|------|-----|
| Mixed-meaning red: `<Banner variant="critical">` for a non-blocking deadline AND `<ActionList.Item variant="danger">` in the same row | Reserve `critical` for blocking failures; use `warning` for non-blocking deadlines; keep `danger` for destructive items | Two different "this is bad" signals on the same screen with different escalation levels confuses users. Match severity to action. |
| `<Banner variant="critical">` + `<ActionMenu>` with a "Try again" item as the only resolution | If the failure has a one-click recovery, prefer inline `<Banner.PrimaryAction>` — `<ActionMenu>` is for grouped actions, not single recovery affordances | A `critical` banner asserts immediate action; hiding the action one click deep in a menu defeats it. |

## What to do when a generated screen fires one of these

1. Identify the trap by its slug from the registry above.
2. Open the corresponding component file at `references/components/<name>.md` — every slug here cross-references a "Common mistakes" row there.
3. If the trap fires on a composition NOT listed above, add a row to "Cross-cutting compositions" with `Bad | Good | Why` — and note the components involved so the next extraction pass can decide whether to promote it into `references/patterns.md`.
