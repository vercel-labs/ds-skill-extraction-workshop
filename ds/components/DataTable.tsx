import { DataTable as PrimerDataTable } from "@primer/react/experimental";

/**
 * DS-scoped data table.
 *
 * Thin re-export of Primer's `DataTable`. Public API only — do not deep-import
 * from `@primer/react`. The wrapper exists so the workshop's design system
 * has a single named export per component for the meta-skill to discover.
 *
 * `DataTable` is generic over the row type; consumers pass `data: Row[]` and
 * `columns: Column<Row>[]`. For column typing, import `Column` and
 * `createColumnHelper` from `@primer/react/experimental` directly — they are
 * type-only helpers and not part of the DS surface.
 *
 * Sort note: `data` must be pre-sorted to match `initialSortColumn` /
 * `initialSortDirection`. DataTable does not sort on mount — it only re-sorts
 * when a sortable column header is clicked. See `DataTable.docs.tsx`.
 */
export const DataTable = PrimerDataTable;

export type { DataTableProps } from "@primer/react/experimental";
