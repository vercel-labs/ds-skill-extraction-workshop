/**
 * DataTable — documentary example.
 *
 * A11y rule: exactly ONE column must set `rowHeader: true`. The row header is
 * the cell a screen reader announces as the row's "name" when reading the
 * other cells. Title is the conventional pick. Zero row headers loses the
 * announcement; more than one fights itself.
 *
 * Sort rule: when `initialSortColumn` and `initialSortDirection` are set,
 * `data` must already be sorted that way. `DataTable` does not sort on
 * mount — it only re-sorts when the user clicks a sortable column header.
 * Hand-sort the data or sort it server-side before passing it in.
 */
import { DataTable } from "./DataTable";

type Issue = {
  id: number;
  title: string;
  status: "open" | "closed";
  updated: string;
};

const issues: Issue[] = [
  { id: 1, title: "Migrate to React 19", status: "open", updated: "2026-06-05" },
  { id: 2, title: "Audit a11y violations", status: "open", updated: "2026-06-04" },
  { id: 3, title: "Replace deprecated icon prop", status: "closed", updated: "2026-06-02" },
];

export function DataTableExample() {
  return (
    <DataTable
      aria-labelledby="issues-heading"
      data={issues}
      columns={[
        { header: "Title", field: "title", rowHeader: true },
        { header: "Status", field: "status" },
        { header: "Updated", field: "updated", sortBy: true },
      ]}
      initialSortColumn="updated"
      initialSortDirection="DESC"
    />
  );
}
