"use client";

import { useRef, useState } from "react";
import { ActionList } from "@/ds/components/ActionList";
import { ActionMenu } from "@/ds/components/ActionMenu";
import { Banner } from "@/ds/components/Banner";
import { DataTable } from "@/ds/components/DataTable";
import { PageHeader } from "@/ds/components/PageHeader";
import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";

type IssueRow = {
  id: number;
  title: string;
  status: "open" | "closed";
  author: string;
  comments: number;
  updated: string;
  updatedAt: string;
};

// Pre-sorted by `updatedAt` DESC to match `initialSortDirection="DESC"` —
// DataTable does not sort on mount; see ds/components/DataTable.docs.tsx.
const ISSUES: IssueRow[] = [
  {
    id: 101,
    title: "Token rotation breaks CI after upgrade",
    status: "open",
    author: "alice",
    comments: 12,
    updated: "2 hours ago",
    updatedAt: "2026-06-06T08:00:00Z",
  },
  {
    id: 102,
    title: "Add dark-mode tokens to typography scale",
    status: "open",
    author: "bob",
    comments: 4,
    updated: "5 hours ago",
    updatedAt: "2026-06-06T05:00:00Z",
  },
  {
    id: 103,
    title: "Docs: missing example for SelectPanel multi-select",
    status: "open",
    author: "carol",
    comments: 0,
    updated: "yesterday",
    updatedAt: "2026-06-05T15:00:00Z",
  },
  {
    id: 104,
    title: "Banner variant=critical used for non-blocking copy",
    status: "open",
    author: "dan",
    comments: 7,
    updated: "2 days ago",
    updatedAt: "2026-06-04T11:00:00Z",
  },
  {
    id: 105,
    title: "Migrate icons to functional CSS tokens",
    status: "closed",
    author: "erin",
    comments: 9,
    updated: "4 days ago",
    updatedAt: "2026-06-02T09:00:00Z",
  },
  {
    id: 106,
    title: "Investigate flaky DataTable sort test",
    status: "closed",
    author: "frank",
    comments: 3,
    updated: "last week",
    updatedAt: "2026-05-30T13:00:00Z",
  },
];

const LABELS: ItemInput[] = [
  { id: 1, text: "bug" },
  { id: 2, text: "enhancement" },
  { id: 3, text: "docs" },
  { id: 4, text: "good-first-issue" },
];

function RowKebab({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <ActionMenu open={open} onOpenChange={setOpen}>
      <ActionMenu.Button aria-label={`Actions for ${title}`}>
        {"⋯"}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="small">
        <ActionList>
          <ActionList.Item onSelect={() => setOpen(false)}>Pin</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Lock</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>
            Transfer
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item
            variant="danger"
            onSelect={() => setOpen(false)}
          >
            Delete
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

export default function IssuesPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<ItemInput[]>([]);
  const [filter, setFilter] = useState("");
  const snapshotRef = useRef<ItemInput[]>([]);

  return (
    <main style={{ padding: 24 }}>
      <PageHeader>
        <PageHeader.ContextArea>
          <PageHeader.ParentLink href="/vercel-labs">
            vercel-labs
          </PageHeader.ParentLink>
        </PageHeader.ContextArea>
        <PageHeader.TitleArea>
          <PageHeader.LeadingVisual>
            <span aria-hidden="true">R</span>
          </PageHeader.LeadingVisual>
          <PageHeader.Title as="h1">
            ds-skill-extraction-workshop
          </PageHeader.Title>
        </PageHeader.TitleArea>
        <PageHeader.Actions>
          <button type="button">New issue</button>
        </PageHeader.Actions>
        <PageHeader.Navigation>
          <nav aria-label="Repository">
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                gap: 16,
                padding: 0,
                margin: 0,
              }}
            >
              <li>
                <a href="#code">Code</a>
              </li>
              <li>
                <a href="#issues" aria-current="page">
                  <strong>Issues</strong>
                </a>
              </li>
              <li>
                <a href="#pulls">Pull requests</a>
              </li>
              <li>
                <a href="#actions">Actions</a>
              </li>
            </ul>
          </nav>
        </PageHeader.Navigation>
      </PageHeader>

      <div style={{ marginTop: 16 }}>
        <Banner
          variant="warning"
          title="Security advisory: rotate compromised tokens before Friday"
          description="A dependency you use disclosed a credential leak. Review and rotate any tokens listed in the advisory."
        />
      </div>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <SelectPanel
          title="Filter by label"
          renderAnchor={({ children, ...anchorProps }) => (
            <button type="button" {...anchorProps}>
              {children ??
                `Labels${selectedLabels.length ? ` (${selectedLabels.length})` : ""}`}
            </button>
          )}
          placeholder="Filter labels"
          open={panelOpen}
          onOpenChange={(next) => {
            if (next) snapshotRef.current = selectedLabels;
            setPanelOpen(next);
          }}
          items={LABELS.filter((item) =>
            (item as { text?: string }).text
              ?.toLowerCase()
              .includes(filter.toLowerCase()),
          )}
          selected={selectedLabels}
          onSelectedChange={setSelectedLabels}
          filterValue={filter}
          onFilterChange={setFilter}
          onCancel={() => {
            setSelectedLabels(snapshotRef.current);
            setPanelOpen(false);
          }}
        />
      </div>

      <DataTable
        aria-labelledby="issues-heading"
        data={ISSUES}
        columns={[
          { header: "Title", field: "title", rowHeader: true, width: "grow" },
          { header: "Status", field: "status" },
          { header: "Author", field: "author" },
          { header: "Comments", field: "comments", align: "end" },
          {
            header: "Updated",
            field: "updatedAt",
            sortBy: true,
            renderCell: (row) => row.updated,
          },
          {
            header: "Actions",
            id: "actions",
            align: "end",
            renderCell: (row) => <RowKebab title={row.title} />,
          },
        ]}
        initialSortColumn="updatedAt"
        initialSortDirection="DESC"
      />
    </main>
  );
}
