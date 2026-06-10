# Example: Repos

Lifted from `vercel-labs/primer-nextjs-template/app/repos/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, Label, PageHeader, PageLayout, RelativeTime, SelectPanel, Stack, Text, type LabelProps, type SelectPanelItemInput
- `@primer/react/experimental`: DataTable, Table
- `@primer/octicons-react`: PlusIcon, RepoIcon, StarIcon
- Other: `react` (useState)

## Composition (verbatim)

```tsx
"use client";

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

- List page shape is `PageLayout > PageLayout.Header (PageHeader) > PageLayout.Content`; the page-level primary action lives in `PageHeader.Actions`, not floating above the table.
- `PageHeader` uses the `Actions` slot for the right-aligned primary `Button` (`variant="primary" leadingVisual={PlusIcon}`) — the header owns the action placement.
- The table is wrapped in `Table.Container` with `Table.Title` + `Table.Subtitle`, and `DataTable` is wired for a11y via `aria-labelledby` / `aria-describedby` pointing at those title/subtitle `id`s.
- `DataTable` columns are objects with `header`/`field`/`sortBy`; rich cells use `renderCell` returning a `Stack` of octicon + `Text`. `rowHeader: true` marks the primary column.
- Status is a `Label` whose `variant` is mapped from data through a `Record<…, LabelProps["variant"]>` — derive the variant, don't hardcode it per row.
- Filtering uses `SelectPanel` with a `renderAnchor` returning a `Button`; its open/selected/filter state is controlled via `useState`.
- `DataTable`, `Table` come from `@primer/react/experimental`; everything else is root.
