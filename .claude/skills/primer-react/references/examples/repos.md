# Example: Repos

Lifted from `vercel-labs/primer-nextjs-template/app/repos/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, Label, PageHeader, PageLayout, RelativeTime, SelectPanel, Stack, Text, type LabelProps, type SelectPanelItemInput
- `@primer/react/experimental`: DataTable, Table
- `@primer/octicons-react`: PlusIcon, RepoIcon, StarIcon
- Other: react (useState)

## Composition (verbatim)

```tsx
"use client";

// List-page exemplar. Shape: PageLayout > PageHeader (title + Actions slot)
// over a filter row over a DataTable. DataTable + Table.Container come from
// the experimental entrypoint; everything else is on root. Mock data lives
// inline so the lift surfaces composition, not a data layer.

import { useState } from "react";
import {
  Button,
  Label,
  PageHeader,
  PageLayout,
  RelativeTime,
  SelectPanel,
  Stack,
  Text,
  type LabelProps,
  type SelectPanelItemInput,
} from "@primer/react";
import {
  DataTable,
  Table,
} from "@primer/react/experimental";
import {
  PlusIcon,
  RepoIcon,
  StarIcon,
} from "@primer/octicons-react";

type Visibility = "Public" | "Private";

type Repo = {
  id: number;
  name: string;
  stars: number;
  updatedAt: string;
  visibility: Visibility;
};

const ROWS: Repo[] = [
  { id: 1, name: "primer-nextjs-template", stars: 142, updatedAt: "2026-05-30T10:12:00Z", visibility: "Public" },
  { id: 2, name: "extract-ds-skill", stars: 86, updatedAt: "2026-06-04T14:22:00Z", visibility: "Public" },
  { id: 3, name: "workshop-internal-notes", stars: 4, updatedAt: "2026-05-18T09:01:00Z", visibility: "Private" },
  { id: 4, name: "ship-2025-companion", stars: 211, updatedAt: "2026-06-06T16:48:00Z", visibility: "Public" },
  { id: 5, name: "dryrun-scratchpad", stars: 0, updatedAt: "2026-03-11T08:30:00Z", visibility: "Private" },
];

const VISIBILITY_VARIANT: Record<Visibility, LabelProps["variant"]> = {
  Public: "success",
  Private: "attention",
};

const FILTER_ITEMS: SelectPanelItemInput[] = [
  { text: "All repositories", id: "all" },
  { text: "Public", id: "public" },
  { text: "Private", id: "private" },
];

export default function ReposPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SelectPanelItemInput | undefined>(FILTER_ITEMS[0]);
  const [filterQuery, setFilterQuery] = useState("");

  return (
    <PageLayout containerWidth="large">
      <PageLayout.Header>
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title>Repositories</PageHeader.Title>
          </PageHeader.TitleArea>
          <PageHeader.Description>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              Public and private repositories owned by this account.
            </Text>
          </PageHeader.Description>
          <PageHeader.Actions>
            <Button variant="primary" leadingVisual={PlusIcon}>
              New repository
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </PageLayout.Header>

      <PageLayout.Content>
        <Stack direction="vertical" gap="normal">
          <Stack direction="horizontal" gap="condensed" align="center">
            <SelectPanel
              renderAnchor={(anchorProps) => (
                <Button {...anchorProps}>
                  {selectedFilter?.text ?? "Filter"}
                </Button>
              )}
              placeholderText="Filter repositories"
              open={filterOpen}
              onOpenChange={setFilterOpen}
              items={FILTER_ITEMS}
              selected={selectedFilter}
              onSelectedChange={setSelectedFilter}
              onFilterChange={setFilterQuery}
              filterValue={filterQuery}
              title="Filter by visibility"
            />
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Showing {ROWS.length} repositories
            </Text>
          </Stack>

          <Table.Container>
            <Table.Title as="h2" id="repos-table-title">
              Repositories
            </Table.Title>
            <Table.Subtitle as="p" id="repos-table-subtitle">
              Sortable by name, stars, or last update.
            </Table.Subtitle>
            <DataTable
              aria-labelledby="repos-table-title"
              aria-describedby="repos-table-subtitle"
              data={ROWS}
              columns={[
                {
                  header: "Name",
                  field: "name",
                  rowHeader: true,
                  sortBy: "alphanumeric",
                  renderCell: (row) => (
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <RepoIcon size={16} />
                      <Text weight="semibold">{row.name}</Text>
                    </Stack>
                  ),
                },
                {
                  header: "Stars",
                  field: "stars",
                  sortBy: "basic",
                  align: "end",
                  renderCell: (row) => (
                    <Stack direction="horizontal" gap="condensed" align="center" justify="end">
                      <StarIcon size={14} />
                      <Text>{row.stars}</Text>
                    </Stack>
                  ),
                },
                {
                  header: "Updated",
                  field: "updatedAt",
                  sortBy: "datetime",
                  renderCell: (row) => <RelativeTime date={new Date(row.updatedAt)} />,
                },
                {
                  header: "Visibility",
                  field: "visibility",
                  renderCell: (row) => (
                    <Label variant={VISIBILITY_VARIANT[row.visibility]}>
                      {row.visibility}
                    </Label>
                  ),
                },
              ]}
              initialSortColumn="stars"
              initialSortDirection="DESC"
            />
          </Table.Container>
        </Stack>
      </PageLayout.Content>
    </PageLayout>
  );
}
```

## What to copy

- `DataTable` and `Table` import from `@primer/react/experimental`; the rest stays on the root entrypoint — mixing the two import paths in one file is the expected shape.
- List-page chrome: `PageLayout.Header > PageHeader` with `TitleArea`, `Description`, and an `Actions` slot carrying the primary CTA (`Button variant="primary" leadingVisual={PlusIcon}`).
- Filter row is a horizontal Stack: a `SelectPanel` whose `renderAnchor` renders a plain `Button` spread with `anchorProps`, beside a muted result count; SelectPanel is fully controlled (`open`/`onOpenChange`, `selected`/`onSelectedChange`, `filterValue`/`onFilterChange`).
- Accessible table shell: `Table.Container > Table.Title (id) + Table.Subtitle (id) + DataTable aria-labelledby/aria-describedby` pointing at those ids.
- Columns are data-driven objects: `rowHeader: true` on the name column, `sortBy` per column (`alphanumeric` | `basic` | `datetime`), `align: "end"` for numeric columns, `renderCell` for composed cells (icon + Text in a Stack, `RelativeTime date={new Date(...)}`, status `Label`).
- Status mapping is a typed lookup from domain value to `LabelProps["variant"]` (`Public → success`, `Private → attention`) instead of inline conditionals.
