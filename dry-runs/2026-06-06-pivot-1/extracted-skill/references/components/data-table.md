---
title: DataTable
description: Sortable, density-toggled table. Exactly ONE rowHeader column required; data must be pre-sorted to match initialSortDirection.
---

## Public imports

```ts
import { DataTable } from "@/ds/components/DataTable";
```

For column typing only (type-only — no value):

```ts
import type { Column, createColumnHelper } from "@primer/react/experimental";
```

The DS wrapper itself re-exports `DataTableProps` for callers that need it.

## When to use

Use `DataTable` for any sortable, multi-row list of records where each row has a clear row-header column (a title, a name, an ID the user reads first). For unsorted long-form content prefer plain semantic `<ul>` / `<table>`; `DataTable` brings sort-column ARIA wiring you would have to re-implement.

`DataTable` is shipped from `@primer/react/experimental` — its API is more volatile than the stable surface. Pin the Primer version (`38.26.0` in `package.json`) before treating prop signatures as durable.

## Key props

- `data: Row[]` — the row array. MUST be pre-sorted to match `initialSortDirection`. (ds/components/DataTable.tsx:15-17, DataTable.docs.tsx:9-12)
- `columns: Column<Row>[]` — column definitions. Each column has `header`, `field`, and optional `rowHeader`, `sortBy`. (column.d.ts)
- `columns[i].rowHeader: true` — exactly ONE column must set this. Marks the cell the SR announces as the row's "name". (column.d.ts, DataTable.docs.tsx:4-7)
- `columns[i].sortBy: true` — makes the column header clickable for sort. (column.d.ts)
- `initialSortColumn: string` — names the field shown as initially sorted. Does NOT trigger a sort on mount. (DataTable.d.ts)
- `initialSortDirection: "ASC" | "DESC"` — the arrow direction on the initial-sort column header. Cosmetic only — pre-sort `data` to match. (DataTable.d.ts)
- `aria-labelledby: string` — IDREF for the heading that names this table. (DataTable.d.ts)

## Best Practices

### When to use

- Use for sortable record tables (issues lists, deploy history, members). For static `<dl>`-style key/value blocks or single-row metadata, use plain HTML.

### Behavior

- `data` must be pre-sorted to match `initialSortColumn` / `initialSortDirection`. `DataTable` does NOT sort on mount; it only re-sorts when the user clicks a sortable column header. (ds/components/DataTable.docs.tsx:9-12)
- Sort the array hand or server-side before passing it in. If `data` and `initialSortDirection` disagree, the rendered table silently disagrees with its own header arrow.

### Accessibility

- Exactly ONE column must set `rowHeader: true`. Zero loses the row-name announcement; more than one fights itself. Title is the conventional pick. (ds/components/DataTable.docs.tsx:4-7)
- Wire `aria-labelledby` to the IDREF of the heading that names the table on the page (typically the section heading sitting above it).

## Composition examples

```tsx
import { DataTable } from "@/ds/components/DataTable";

type Issue = {
  id: number;
  title: string;
  status: "open" | "closed";
  updated: string; // ISO date string, pre-sorted DESC
};

const issues: Issue[] = [
  { id: 1, title: "Migrate to React 19",       status: "open",   updated: "2026-06-05" },
  { id: 2, title: "Audit a11y violations",     status: "open",   updated: "2026-06-04" },
  { id: 3, title: "Replace deprecated icon",   status: "closed", updated: "2026-06-02" },
];

export function IssuesTable() {
  return (
    <>
      <h2 id="issues-heading">Issues</h2>
      <DataTable
        aria-labelledby="issues-heading"
        data={issues}
        columns={[
          { header: "Title",   field: "title",   rowHeader: true },
          { header: "Status",  field: "status" },
          { header: "Updated", field: "updated", sortBy: true },
        ]}
        initialSortColumn="updated"
        initialSortDirection="DESC"
      />
    </>
  );
}
```

## Source references

- `ds/components/DataTable.tsx:19` — wrapper (re-export of `@primer/react/experimental` `DataTable`).
- `ds/components/DataTable.docs.tsx` — rowHeader + pre-sort rules with runnable example.
- `node_modules/@primer/react/dist/DataTable/DataTable.d.ts` — root component type.
- `node_modules/@primer/react/dist/DataTable/column.d.ts` — `rowHeader`, `sortBy`, `field` definitions.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| Setting `initialSortColumn="updated"` + `initialSortDirection="DESC"` with `data` in `ASC` order | Pre-sort `data` DESC by `updated` before passing it in | DataTable does not sort on mount. The arrow says DESC; the rows render ASC; the user sees a silently broken table. |
| Two columns with `rowHeader: true` | Exactly one column (typically the title) | SR reads two competing row names per row. Confusing and inconsistent. |
| Omitting `aria-labelledby` and relying on the table's column headers alone | Render a real heading above the table and point `aria-labelledby` at its `id` | SR users need a name for the whole table, not just the columns. |
| Importing `DataTable` from `@primer/react` (stable) | Import from `@/ds/components/DataTable` (which goes through `@primer/react/experimental`) | The stable surface does not export `DataTable`. The wrapper exists so callers do not need to remember the subpath. |

## Things to never invent

- `<DataTable density="...">` — there is no density prop on the wrapper surface this skill covers. Use the column shape Primer ships.
- `onSort` / `onSortChange` callbacks beyond what the typed surface declares — confirm in `DataTable.d.ts` before wiring.
- Row click handlers — `DataTable` is for display, not row activation. Compose an `ActionMenu` per row for row-level actions.
