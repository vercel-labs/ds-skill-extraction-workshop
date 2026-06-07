# components — `ds`

One section per component. The local `ds/components/<Name>.tsx` wrapper re-exports from `@primer/react` (or `@primer/react/experimental` for `DataTable`); the underlying types in `node_modules/@primer/react/dist/index.d.ts` (and `experimental/index.d.ts`) are the source of truth for prop shapes and subcomponents.

---

## Banner

### Public imports

```tsx
import { Banner } from "@/ds/components/Banner";
```

### When to use

Page- or section-level message that interrupts the reading flow to tell the user something has changed or is wrong. Pick by *what the user must do*, not by which color the design calls for — `variant` is semantic, not cosmetic.

### Key props

- `variant` — `'critical' | 'warning' | 'info' | 'success' | 'upsell'`. Definitive semantics in `ds/components/Banner.docs.tsx:6-15`.
- `title` — required string; the announced label.
- `description` — optional string; the supporting line.
- Compound subcomponents: `Banner.Title`, `Banner.Description`, `Banner.PrimaryAction`, `Banner.SecondaryAction` (`ds/components/Banner.tsx:8`). Preserved verbatim from Primer.

### Best Practices

- Use `variant="critical"` only for blocking failures the user must resolve before continuing (payment failed; deploy blocked). `critical` maps to an `alert`-style landmark with stronger announcement urgency — it is not a color swap (`ds/components/Banner.docs.tsx:7-8, 16-18`).
- Use `variant="warning"` for important-but-non-blocking — deadlines, deprecations, policy changes (`ds/components/Banner.docs.tsx:9-10`).
- Use `variant="info"` for neutral information (a feature rolled out, a sync finished) (`ds/components/Banner.docs.tsx:11-12`).
- Use `variant="success"` only for user-initiated actions that completed (`ds/components/Banner.docs.tsx:13`).
- Use `variant="upsell"` to promote an opt-in (Pro plan, beta program) (`ds/components/Banner.docs.tsx:14`).

### Composition example

```tsx
<Banner
  variant="warning"
  title="Two-factor authentication required next month"
  description="Set it up before July 1 to keep your account active."
/>
```

Lifted from `ds/components/Banner.docs.tsx:22-29`.

### Source references

- `ds/components/Banner.tsx` — wrapper (named export + type alias).
- `ds/components/Banner.docs.tsx` — variant-semantics rule.
- `node_modules/@primer/react/dist/index.d.ts` — `Banner` type and `BannerProps`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Banner variant="critical" title="Heads up: deadline next week" />` | `<Banner variant="warning" title="Heads up: deadline next week" />` | `critical` is for blocking failures only — not for "any red-looking message." |
| `<Banner variant="success" title="Payment received" />` (in a server-driven notification feed) | `<Banner variant="info" title="Payment received" />` | `success` is for *user-initiated* actions; passive notifications use `info`. |

### Things to never invent

- Variant values other than the five listed (`critical`, `warning`, `info`, `success`, `upsell`). Anything else is fabrication.
- Props not on Primer's `Banner` type. The wrapper aliases `BannerProps = ComponentProps<typeof PrimerBanner>` — it adds nothing.
- "Dismissible" props or close-button props beyond those Primer ships natively.

---

## ActionMenu

### Public imports

```tsx
import { ActionMenu } from "@/ds/components/ActionMenu";
```

### When to use

A dropdown menu of actions triggered by a button (or a custom anchor element). Items inside the overlay come from `ActionList`. For a select-one-from-many picker, reach for `SelectPanel` instead — `ActionMenu` does not manage selection state.

### Key props

- `open` and `onOpenChange` — controlled-state pair. If you pass `open`, you MUST pass `onOpenChange` (`ds/components/ActionMenu.docs.tsx:4-8`, `ds/components/ActionMenu.tsx:14-15`).
- Compound subcomponents: `ActionMenu.Button` (default trigger), `ActionMenu.Anchor` (custom trigger wrapper), `ActionMenu.Overlay` (popover container, accepts `width`), `ActionMenu.Divider` (`ds/components/ActionMenu.tsx:8`).

### Best Practices

- Pair `ActionMenu.Overlay` with `ActionList` as its child — that is the canonical composition (`ds/components/ActionMenu.docs.tsx:11-12`, `ds/components/ActionList.tsx:11-13`).
- Use `ActionMenu.Button` as the trigger by default; reach for `ActionMenu.Anchor` only when the trigger must be a custom element (icon-only button, submenu) (`ds/components/ActionMenu.docs.tsx:16-19`).
- Destructive items use `<ActionList.Item variant="danger">` — never a custom red className (`ds/components/ActionMenu.docs.tsx:13-15`).
- Pass `width="medium"` (or `small` / `large`) on `ActionMenu.Overlay` to size the dropdown; the default tracks the trigger width.
- Do not override the announced role from `menuitem` to `menuitemcheckbox` unless the item is genuinely a toggle (`ds/components/ActionMenu.docs.tsx:14-15`).

### Composition example

```tsx
import { useState } from "react";
import { ActionList } from "@/ds/components/ActionList";
import { ActionMenu } from "@/ds/components/ActionMenu";

function RepoActions() {
  const [open, setOpen] = useState(false);
  return (
    <ActionMenu open={open} onOpenChange={setOpen}>
      <ActionMenu.Button>Open menu</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          <ActionList.Item onSelect={() => setOpen(false)}>Pin</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Lock</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Transfer</ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item variant="danger" onSelect={() => setOpen(false)}>
            Delete
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
```

Lifted from `ds/components/ActionMenu.docs.tsx:25-44`.

### Source references

- `ds/components/ActionMenu.tsx` — wrapper.
- `ds/components/ActionMenu.docs.tsx` — controlled-state rule, composition rule, trigger rule.
- `ds/components/ActionList.tsx` — sibling primitive used inside `ActionMenu.Overlay`.
- `node_modules/@primer/react/dist/index.d.ts` — `ActionMenu` type and subcomponent shape.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<ActionMenu open={open}>...</ActionMenu>` (no `onOpenChange`) | `<ActionMenu open={open} onOpenChange={setOpen}>...</ActionMenu>` | Types do not enforce the pairing; without the handler the menu cannot close. |
| Wrapping a destructive `ActionList.Item` in a custom red className | `<ActionList.Item variant="danger">` | The `danger` variant is the DS contract — bypasses break theming and a11y. |
| Reaching for `ActionMenu.Anchor` for a plain text trigger | `ActionMenu.Button` | `Anchor` is for custom-element wrappers; `Button` is the default. |

### Things to never invent

- Subcomponents other than `Button`, `Anchor`, `Overlay`, `Divider`. Items go inside `ActionList`, not `ActionMenu`.
- Props on the menu beyond what Primer's `ActionMenu` type ships (the wrapper aliases the type and adds nothing).
- Custom positioning props on `ActionMenu.Overlay` outside what Primer documents.

---

## ActionList

### Public imports

```tsx
import { ActionList } from "@/ds/components/ActionList";
```

### When to use

Used INSIDE `<ActionMenu.Overlay>` to render menu items, or as a standalone list of selectable items (single- or multi-select) when not driven by a dropdown trigger. For a filterable picker, use `SelectPanel`; for a dropdown of actions, use `ActionMenu` around it.

### Key props

- Compound subcomponents preserved from Primer: `ActionList.Item`, `ActionList.Group`, `ActionList.Divider`, `ActionList.LeadingVisual`, `ActionList.TrailingVisual`, `ActionList.Description`, `ActionList.Heading`, `ActionList.LinkItem`, `ActionList.TrailingAction` (`ds/components/ActionList.tsx:8-11`).
- `ActionList.Item` accepts `variant?: 'default' | 'danger'`, `onSelect`, and the children patterns above. Destructive items use `variant="danger"` (`ds/components/ActionList.tsx:13-14`).
- `ActionList.Heading` accepts `as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`.
- `ActionList.LinkItem` accepts `href` and renders as `<a>` semantics.

### Best Practices

- Treat `ActionList` as the inner content of `ActionMenu.Overlay`; the standalone use is rarer (`ds/components/ActionList.tsx:11-13`).
- Use `<ActionList.Item variant="danger">` for destructive actions; never reach for a custom red className (`ds/components/ActionList.tsx:13-14`).
- Group related items with `<ActionList.Group>` and a leading `<ActionList.Heading>` so screen readers announce the group label.
- Use `<ActionList.LeadingVisual>` / `<ActionList.TrailingVisual>` for icons; do not stuff icons into the item's text node.

### Composition example

```tsx
import { ActionList } from "@/ds/components/ActionList";

function FilterList() {
  return (
    <ActionList>
      <ActionList.Heading as="h3">Filters</ActionList.Heading>
      <ActionList.Group>
        <ActionList.Item>Open</ActionList.Item>
        <ActionList.Item>Closed</ActionList.Item>
        <ActionList.LinkItem href="/help/filters">Learn more</ActionList.LinkItem>
      </ActionList.Group>
      <ActionList.Divider />
      <ActionList.Item variant="danger">Clear all filters</ActionList.Item>
    </ActionList>
  );
}
```

### Source references

- `ds/components/ActionList.tsx` — wrapper.
- `ds/components/ActionMenu.docs.tsx` — composition rule (ActionList inside ActionMenu.Overlay).
- `node_modules/@primer/react/dist/index.d.ts` — `ActionList` type and subcomponent shape.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<div className="text-red-500">Delete</div>` inside `<ActionList>` | `<ActionList.Item variant="danger">Delete</ActionList.Item>` | The variant carries semantics, theming, and focus styling — a custom div does not. |
| Stuffing an icon and the label into the `Item`'s text node | `<ActionList.LeadingVisual>...</ActionList.LeadingVisual>` + label as child | The visual slots handle spacing, alignment, and a11y. |

### Things to never invent

- Subcomponents not in the list above.
- Variants other than `default` and `danger` on `ActionList.Item`.
- Props on `ActionList.Heading` other than `as`.

---

## DataTable

### Public imports

```tsx
import { DataTable } from "@/ds/components/DataTable";
```

### When to use

A row/column table where each row is a record and the headers may be sortable. The `DataTable` import comes from `@primer/react/experimental` (the wrapper preserves the subpath) — `ds/components/DataTable.tsx:1`. For non-tabular lists, use `ActionList`.

### Key props

- `data` — `Row[]`. Must be PRE-SORTED to match `initialSortColumn` / `initialSortDirection`; `DataTable` does not sort on mount (`ds/components/DataTable.docs.tsx:8-12`, `ds/components/DataTable.tsx:14-17`).
- `columns` — `Column<Row>[]`. Each column: `{ header: string, field: keyof Row, rowHeader?: boolean, sortBy?: boolean }`.
- `aria-labelledby` — id of the heading element that labels the table.
- `initialSortColumn` and `initialSortDirection` — initial sort state (one of `'ASC' | 'DESC'`).
- Type-only helpers (`Column`, `createColumnHelper`) come from `@primer/react/experimental` directly — they are not part of the DS surface (`ds/components/DataTable.tsx:11-13`).

### Best Practices

- Exactly ONE column sets `rowHeader: true`. Zero loses the screen-reader row-name announcement; more than one fights itself. Title is the conventional pick (`ds/components/DataTable.docs.tsx:4-7`).
- Pre-sort `data` to match `initialSortColumn` / `initialSortDirection` — `DataTable` re-sorts only when the user clicks a sortable column header (`ds/components/DataTable.docs.tsx:8-12`, `ds/components/DataTable.tsx:14-17`).
- Mark only the columns that are sortable with `sortBy: true`; the others stay static.
- Pair the `aria-labelledby` value with the actual heading id rendered above the table.

### Composition example

```tsx
import { DataTable } from "@/ds/components/DataTable";

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

function IssuesTable() {
  return (
    <>
      <h2 id="issues-heading">Open issues</h2>
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
    </>
  );
}
```

Lifted from `ds/components/DataTable.docs.tsx:29-42`.

### Source references

- `ds/components/DataTable.tsx` — wrapper (imports from `@primer/react/experimental`).
- `ds/components/DataTable.docs.tsx` — rowHeader rule, sort rule.
- `node_modules/@primer/react/experimental/index.d.ts` — `DataTable` type, `Column`, `createColumnHelper`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `data={issues}` unsorted, with `initialSortColumn="updated"` | Pre-sort `issues` by `updated` before passing in | `DataTable` does not sort on mount; an unsorted `data` ships in whatever order it was assembled. |
| Two columns marked `rowHeader: true` | Exactly one column (typically Title) | Multiple row headers fight for the screen-reader's row-name announcement. |
| `import { DataTable } from "@primer/react";` | `import { DataTable } from "@/ds/components/DataTable";` | `DataTable` lives in `@primer/react/experimental` — the wrapper preserves the subpath and the agent should go through the wrapper. |

### Things to never invent

- Column fields beyond `header`, `field`, `rowHeader`, `sortBy`, and the typed `renderCell` Primer ships.
- A built-in pagination / virtualization prop on `DataTable` (those are application-level concerns in this DS).
- `initialSortDirection` values other than `'ASC' | 'DESC'`.

---

## PageHeader

### Public imports

```tsx
import { PageHeader } from "@/ds/components/PageHeader";
```

### When to use

Top-of-page composition: title, leading visual (avatar / repo icon), supporting context (breadcrumbs), and primary actions. Use one `PageHeader` per page; do not nest.

### Key props

- Compound subcomponents (`ds/components/PageHeader.tsx:8-21`):
  - INSIDE `<PageHeader.TitleArea>` — `PageHeader.LeadingVisual`, `PageHeader.Title`, `PageHeader.TrailingVisual`.
  - DIRECT children of `<PageHeader>` (outside `TitleArea`) — `PageHeader.ContextArea`, `PageHeader.Actions`, `PageHeader.TrailingAction`, `PageHeader.Navigation`.

### Best Practices

- Slot composition is load-bearing — TypeScript does not enforce the nesting, but the wrong shape breaks the layout grid (visuals float free of the title, actions collapse into it) (`ds/components/PageHeader.docs.tsx:4-20`).
- `LeadingVisual` / `Title` / `TrailingVisual` ALWAYS go inside `<PageHeader.TitleArea>`, never as direct children of `<PageHeader>`.
- `Actions` / `ContextArea` / `TrailingAction` / `Navigation` ALWAYS go as direct children of `<PageHeader>`, never inside `<PageHeader.TitleArea>` (the headline trap: models put `Actions` inside `TitleArea` because "they belong with the title" — they do not, per `ds/components/PageHeader.docs.tsx:20-21`).
- `ContextArea` is for breadcrumbs and parent links (`ds/components/PageHeader.docs.tsx:12`).
- `Navigation` is for underline-nav tabs that scope to the page (`ds/components/PageHeader.docs.tsx:15`).

### Composition example

```tsx
import { PageHeader } from "@/ds/components/PageHeader";

function RepoPageHeader() {
  return (
    <PageHeader>
      <PageHeader.TitleArea>
        <PageHeader.LeadingVisual>
          <span aria-hidden="true">R</span>
        </PageHeader.LeadingVisual>
        <PageHeader.Title>my-repo</PageHeader.Title>
      </PageHeader.TitleArea>
      <PageHeader.Actions>
        <button type="button">New issue</button>
      </PageHeader.Actions>
    </PageHeader>
  );
}
```

Lifted from `ds/components/PageHeader.docs.tsx:24-37`.

### Source references

- `ds/components/PageHeader.tsx` — wrapper.
- `ds/components/PageHeader.docs.tsx` — slot composition rule.
- `node_modules/@primer/react/dist/index.d.ts` — `PageHeader` type and subcomponent shape.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<PageHeader.TitleArea><PageHeader.Title>X</PageHeader.Title><PageHeader.Actions>...</PageHeader.Actions></PageHeader.TitleArea>` | Move `Actions` OUT of `TitleArea`, directly under `<PageHeader>` | `Actions` is not a TitleArea slot; nesting it there breaks the layout grid. |
| `<PageHeader><PageHeader.LeadingVisual>R</PageHeader.LeadingVisual><PageHeader.Title>X</PageHeader.Title></PageHeader>` | Wrap `LeadingVisual` + `Title` in `<PageHeader.TitleArea>` | Visuals are TitleArea-only; outside it they float free of the title. |

### Things to never invent

- Subcomponents not listed above. The wrapper preserves Primer's compound shape exactly.
- Props on `<PageHeader>` itself beyond what Primer's type ships (the wrapper aliases the type and adds nothing).

---

## SelectPanel

### Public imports

```tsx
import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";
```

### When to use

A filterable picker for selecting one or many items from a list — typical use: label picker, assignee picker, reviewer picker. For a non-filterable dropdown of actions, use `ActionMenu`. The wrapper preserves Primer's `SelectPanelProps` and re-exports `SelectPanelItemInput` as `ItemInput` (`ds/components/SelectPanel.tsx:20-23`).

### Key props

- `title` — header label inside the panel.
- `renderAnchor` — render-prop that returns the trigger element. Receives `{ children, ...anchorProps }` and must spread `anchorProps` onto a button-like element so Primer can wire keyboard focus and ARIA.
- `placeholder` — placeholder for the empty state.
- `open` and `onOpenChange` — controlled-state pair (required by the type).
- `items` — `ItemInput[]`. Filter against `filterValue` in your handler.
- `selected` — `ItemInput | undefined` for single-select; `ItemInput[]` for multi-select (`ds/components/SelectPanel.tsx:11-13`).
- `onSelectedChange` — selection handler matching the shape of `selected`.
- `filterValue` and `onFilterChange` — controlled filter input.
- `onCancel` — required for `variant="modal"`; supply it in the default `variant="anchored"` to enable the snapshot-restore pattern (`ds/components/SelectPanel.docs.tsx:11-14`).

### Best Practices

- Single vs multi-select is determined by the shape of `selected` / `onSelectedChange` (`ItemInput` vs `ItemInput[]`), not by a separate prop (`ds/components/SelectPanel.tsx:11-13`).
- For multi-select, snapshot `selected` when the panel opens and restore that snapshot in `onCancel` — without this, mid-flight toggles persist after Cancel (`ds/components/SelectPanel.docs.tsx:4-7`, `ds/components/SelectPanel.tsx:14-15`).
- Single-select panels typically commit on selection and have no Cancel affordance; the snapshot pattern matters only for multi-select (`ds/components/SelectPanel.docs.tsx:8-10`).
- Filter the `items` array against `filterValue` in your own handler; `SelectPanel` does not filter for you.

### Composition example

```tsx
import { useRef, useState } from "react";
import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";

const LABELS: ItemInput[] = [
  { id: 1, text: "bug" },
  { id: 2, text: "enhancement" },
  { id: 3, text: "docs" },
  { id: 4, text: "good-first-issue" },
];

function LabelPicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemInput[]>([]);
  const [filter, setFilter] = useState("");
  const snapshotRef = useRef<ItemInput[]>([]);

  return (
    <SelectPanel
      title="Filter by label"
      renderAnchor={({ children, ...anchorProps }) => (
        <button type="button" {...anchorProps}>
          {children ?? "Labels"}
        </button>
      )}
      placeholder="Select labels"
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) snapshotRef.current = selected;
        setOpen(nextOpen);
      }}
      items={LABELS.filter((item) =>
        (item as { text?: string }).text?.toLowerCase().includes(filter.toLowerCase()),
      )}
      selected={selected}
      onSelectedChange={setSelected}
      filterValue={filter}
      onFilterChange={setFilter}
      onCancel={() => {
        setSelected(snapshotRef.current);
        setOpen(false);
      }}
    />
  );
}
```

Lifted from `ds/components/SelectPanel.docs.tsx:26-58`.

### Source references

- `ds/components/SelectPanel.tsx` — wrapper.
- `ds/components/SelectPanel.docs.tsx` — snapshot-restore rule, single-vs-multi rule.
- `node_modules/@primer/react/dist/index.d.ts` — `SelectPanel` type, `SelectPanelItemInput` (re-exported as `ItemInput`), `SelectPanelProps`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| Multi-select `<SelectPanel ... />` with no `onCancel` | Wire `onCancel` to restore the open-time snapshot of `selected` | Without it, mid-flight toggles persist after the user presses Cancel — exactly what "Cancel" implies should not happen. |
| `renderAnchor={() => <button>Labels</button>}` (no `anchorProps` spread) | Spread `anchorProps` onto the button: `({ children, ...anchorProps }) => <button {...anchorProps}>{children ?? "Labels"}</button>` | Without the spread, Primer cannot wire keyboard focus or ARIA to the trigger. |
| Passing all items, expecting `SelectPanel` to filter | Filter `items` against `filterValue` in your own handler before passing | `SelectPanel` does not filter for you. |

### Things to never invent

- A separate `multi` or `mode` prop. Single vs multi is determined by the shape of `selected`.
- A built-in async-search prop. Filtering is the consumer's responsibility.
- Subcomponents other than the Primer-shipped `SecondaryActionButton`, `SecondaryActionLink`, `Message`.
