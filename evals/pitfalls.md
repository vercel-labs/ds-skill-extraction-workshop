# Pitfalls — model failure catalogue for evals

Comprehensive list of failure modes a model can fall into when generating UI with the `ds/` component set. Each entry is eval-actionable: stable ID, paired bad/good code, and detection signals (regex / AST hint / heuristic) an eval harness can run against a generated `.tsx` file.

**Scope.** Five components: `PageHeader`, `DataTable`, `SelectPanel`, `Banner`, `ActionMenu` (+ `ActionList` as ActionMenu's required child). Pitfalls are derived from `ds/DESIGN.md`, the `*.docs.tsx` per-component rule files, and the Primer source documentation.

**Type-invisible flag.** Marked `yes` when TypeScript accepts the wrong shape with no error — the rule is prose-only and won't be caught by `tsc`. These are the highest-value eval cases.

**Source rule.** File the rule lives in. Evals can quote this when reporting a FAIL.

---

## Index

| ID | Component | Pitfall | Type-invisible |
|---|---|---|---|
| [PH-01](#ph-01) | PageHeader | `Actions` placed inside `TitleArea` | yes |
| [PH-02](#ph-02) | PageHeader | `LeadingVisual` / `TrailingVisual` placed outside `TitleArea` | yes |
| [PH-03](#ph-03) | PageHeader | `TrailingAction` used as a multi-button cluster | yes |
| [PH-04](#ph-04) | PageHeader | `ParentLink` added without `hidden` override (invisible on desktop) | yes |
| [PH-05](#ph-05) | PageHeader | `hasBorder` set but `Navigation` present (border silently suppressed) | yes |
| [PH-06](#ph-06) | PageHeader | `Title` defaulting to `h2` inside a page that already has an `h1`/`h2` | partial |
| [DT-01](#dt-01) | DataTable | Zero or multiple `rowHeader: true` columns | yes |
| [DT-02](#dt-02) | DataTable | `data` not pre-sorted to match `initialSortDirection` | yes |
| [DT-03](#dt-03) | DataTable | `aria-labelledby` omitted or mismatched with `Table.Title` id | partial |
| [DT-04](#dt-04) | DataTable | Action column header has no screen-reader text | yes |
| [DT-05](#dt-05) | DataTable | More than one inline row action (should be in ActionMenu) | yes |
| [DT-06](#dt-06) | DataTable | All columns left to default `grow` width (no `auto` for content-sized columns) | yes |
| [BN-01](#bn-01) | Banner | `variant="critical"` used for non-blocking message | yes |
| [BN-02](#bn-02) | Banner | `variant="critical"` made dismissible via `onDismiss` | yes |
| [BN-03](#bn-03) | Banner | `variant="success"` used for persistent / static content | yes |
| [BN-04](#bn-04) | Banner | Custom `icon` or `leadingVisual` on a non-info/non-upsell variant | no (API rejects) |
| [BN-05](#bn-05) | Banner | `title` omitted when `hideTitle` is set | no (API rejects) |
| [SP-01](#sp-01) | SelectPanel | Multi-select missing snapshot/restore on `onCancel` | yes |
| [SP-02](#sp-02) | SelectPanel | `groupMetadata` + `virtualized` (virtualized silently ignored) | yes |
| [SP-03](#sp-03) | SelectPanel | Empty-state `message` not distinguished between "no data" and "no filter matches" | yes |
| [SP-04](#sp-04) | SelectPanel | `footer` prop used (deprecated; use `secondaryAction`) | no (deprecation warning) |
| [SP-05](#sp-05) | SelectPanel | External anchor used without pairing `anchorRef` and `renderAnchor={null}` | partial |
| [SP-06](#sp-06) | SelectPanel | Trigger button shows selection but lacks a persistent label | yes |
| [AM-01](#am-01) | ActionMenu | `open` passed without `onOpenChange` (or vice versa) | yes |
| [AM-02](#am-02) | ActionMenu | Destructive item styled with a custom className instead of `variant="danger"` | yes |
| [AM-03](#am-03) | ActionMenu | Submenu trigger uses `ActionMenu.Button` instead of `ActionMenu.Anchor` | yes |
| [AM-04](#am-04) | ActionMenu | Non-toggle items given `role="menuitemcheckbox"` | yes |
| [AM-05](#am-05) | ActionMenu | All-inactive menu rendered instead of marking the trigger button inactive | yes |
| [XC-01](#xc-01) | cross-cutting | Reaching for `TextInputWithTokens` (deprecated in Primer) | partial |
| [XC-02](#xc-02) | cross-cutting | Deep-importing from `@primer/react` instead of via `ds/components/` | yes |

---

## PageHeader

### PH-01
**Title:** `Actions` placed inside `TitleArea`
**Component:** `PageHeader` · **Category:** slot composition · **Type-invisible:** yes · **Source rule:** `ds/DESIGN.md` (headline), `ds/components/PageHeader.docs.tsx`

**Symptom:**
```tsx
<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.Title>my-repo</PageHeader.Title>
    <PageHeader.Actions>
      <Button>New issue</Button>
    </PageHeader.Actions>
  </PageHeader.TitleArea>
</PageHeader>
```

**Correct shape:**
```tsx
<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.Title>my-repo</PageHeader.Title>
  </PageHeader.TitleArea>
  <PageHeader.Actions>
    <Button>New issue</Button>
  </PageHeader.Actions>
</PageHeader>
```

**Why:** `Actions` is page-chrome, not title-row content. Nesting it inside `TitleArea` breaks the layout grid (actions collapse next to the title text instead of right-aligning at the chrome level).

**Detection signals:**
- AST: any `<PageHeader.Actions>` whose ancestor chain contains `<PageHeader.TitleArea>`.
- Regex (heuristic): `<PageHeader\.TitleArea[^>]*>[\s\S]*?<PageHeader\.Actions`.

---

### PH-02
**Title:** `LeadingVisual` / `TrailingVisual` placed outside `TitleArea`
**Component:** `PageHeader` · **Category:** slot composition · **Type-invisible:** yes · **Source rule:** `ds/DESIGN.md` (headline), `ds/components/PageHeader.docs.tsx`

**Symptom:**
```tsx
<PageHeader>
  <PageHeader.LeadingVisual><RepoIcon /></PageHeader.LeadingVisual>
  <PageHeader.TitleArea>
    <PageHeader.Title>my-repo</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Correct shape:**
```tsx
<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.LeadingVisual><RepoIcon /></PageHeader.LeadingVisual>
    <PageHeader.Title>my-repo</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Why:** Visuals are inline with the title text. Hoisting them above `TitleArea` floats them free of the title and they no longer align with the heading baseline.

**Detection signals:**
- AST: any `<PageHeader.LeadingVisual>` or `<PageHeader.TrailingVisual>` that is a direct child of `<PageHeader>` (not nested in `<PageHeader.TitleArea>`).

---

### PH-03
**Title:** `TrailingAction` used as a multi-button cluster
**Component:** `PageHeader` · **Category:** slot composition · **Type-invisible:** yes · **Source rule:** `ds/components/PageHeader.docs.tsx`

**Symptom:**
```tsx
<PageHeader.TrailingAction>
  <Button>Edit</Button>
  <Button>Delete</Button>
  <Button>Share</Button>
</PageHeader.TrailingAction>
```

**Correct shape:**
```tsx
<PageHeader.Actions>
  <Button>Edit</Button>
  <Button>Delete</Button>
  <Button>Share</Button>
</PageHeader.Actions>
```

**Why:** `TrailingAction` is a single trailing icon button (typically an overflow menu trigger). For an action cluster, use `Actions`. They have different responsive defaults — `TrailingAction` hides on narrow viewports.

**Detection signals:**
- AST: `<PageHeader.TrailingAction>` with more than one element child.

---

### PH-04
**Title:** `ParentLink` added without `hidden` override
**Component:** `PageHeader` · **Category:** responsive defaults · **Type-invisible:** yes · **Source rule:** Primer PageHeader docs

**Symptom:**
```tsx
<PageHeader>
  <PageHeader.ContextArea>
    <PageHeader.ParentLink href="/org">org</PageHeader.ParentLink>
  </PageHeader.ContextArea>
  <PageHeader.TitleArea>
    <PageHeader.Title>my-repo</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Correct shape (explicit override if you want it on desktop):**
```tsx
<PageHeader>
  <PageHeader.ContextArea hidden={{ narrow: false, regular: false, wide: false }}>
    <PageHeader.ParentLink href="/org">org</PageHeader.ParentLink>
  </PageHeader.ContextArea>
  <PageHeader.TitleArea>
    <PageHeader.Title>my-repo</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Why:** `ContextArea`, `ParentLink`, `ContextBar`, and `ContextAreaActions` default to `hidden: { regular: true, wide: true }` — they only render on narrow viewports (the assumption is that wider viewports already show breadcrumbs elsewhere). Adding a `ParentLink` and "not seeing it" on desktop is the most common confusion.

**Detection signals:**
- AST: `<PageHeader.ParentLink>` (or `ContextBar`, `ContextAreaActions`) under a `<PageHeader.ContextArea>` that has no `hidden` prop override.

---

### PH-05
**Title:** `hasBorder` set but `Navigation` present
**Component:** `PageHeader` · **Category:** responsive defaults · **Type-invisible:** yes · **Source rule:** Primer PageHeader docs

**Symptom:**
```tsx
<PageHeader hasBorder>
  <PageHeader.TitleArea>...</PageHeader.TitleArea>
  <PageHeader.Navigation>
    <UnderlineNav>...</UnderlineNav>
  </PageHeader.Navigation>
</PageHeader>
```

**Why:** The border is suppressed automatically when a visible `Navigation` slot is present at the current breakpoint (the underline nav already provides the visual separator). Setting `hasBorder={true}` looks correct in code but the divider does not render.

**Detection signals:**
- AST: `<PageHeader hasBorder>` (or `hasBorder={true}`) with a `<PageHeader.Navigation>` child that has no `hidden` prop forcing it off.
- Eval can flag this as a *soft* finding — the rendered output is intentional, but the code reads misleadingly.

---

### PH-06
**Title:** `Title` defaulting to `h2` in a page with an existing heading
**Component:** `PageHeader` · **Category:** a11y · **Type-invisible:** partial (depends on outer page) · **Source rule:** Primer PageHeader docs

**Symptom:**
```tsx
// inside a SplitPageLayout that already renders <h1>
<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.Title>Settings</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Correct shape:**
```tsx
<PageHeader>
  <PageHeader.TitleArea variant="subtitle">
    <PageHeader.Title as="h3">Settings</PageHeader.Title>
  </PageHeader.TitleArea>
</PageHeader>
```

**Why:** `Title` defaults to `h2`. In a page where another `h2` already exists, the document outline breaks. The `subtitle` variant + an explicit `as` prop restores correct heading hierarchy.

**Detection signals:**
- Heuristic: presence of two `<PageHeader>` instances in the same file, or a `<PageHeader>` inside a `<SplitPageLayout>` without `variant="subtitle"`.

---

## DataTable

### DT-01
**Title:** Zero or multiple `rowHeader: true` columns
**Component:** `DataTable` · **Category:** a11y wiring · **Type-invisible:** yes · **Source rule:** `ds/components/DataTable.docs.tsx`

**Symptom (zero):**
```tsx
<DataTable
  data={issues}
  columns={[
    { header: "Title", field: "title" },
    { header: "Status", field: "status" },
    { header: "Updated", field: "updated" },
  ]}
/>
```

**Symptom (multiple):**
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },
  { header: "Status", field: "status", rowHeader: true },
]}
```

**Correct shape:**
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },
  { header: "Status", field: "status" },
  { header: "Updated", field: "updated" },
]}
```

**Why:** The row header is the cell a screen reader announces as the row's "name" while reading the other cells. Without one, every cell announces with no row context. With multiple, the announcement fights itself.

**Detection signals:**
- AST: count of `rowHeader: true` entries in the `columns` array prop on `<DataTable>`. Must be exactly 1.
- Regex (heuristic): count occurrences of `rowHeader:\s*true` between `columns={[` and the closing `]}`.

---

### DT-02
**Title:** `data` not pre-sorted to match `initialSortDirection`
**Component:** `DataTable` · **Category:** runtime correctness · **Type-invisible:** yes · **Source rule:** `ds/components/DataTable.docs.tsx`

**Symptom:**
```tsx
const issues = [
  { id: 1, updated: "2026-06-01" },
  { id: 2, updated: "2026-06-05" },
  { id: 3, updated: "2026-06-03" },
];
<DataTable
  data={issues}
  columns={[...]}
  initialSortColumn="updated"
  initialSortDirection="DESC"
/>
```

**Correct shape:** sort the array before passing:
```tsx
const issues = [
  { id: 2, updated: "2026-06-05" },
  { id: 3, updated: "2026-06-03" },
  { id: 1, updated: "2026-06-01" },
];
```

**Why:** `DataTable` does NOT sort on mount — `initialSortColumn` only sets which arrow is shown in the header. The rows render in the order they arrive. User clicks re-sort; initial render does not.

**Detection signals:**
- AST: presence of `initialSortColumn` + `initialSortDirection` on `<DataTable>`. Then verify the `data` array's order against the specified column + direction. If unsorted: FAIL.

---

### DT-03
**Title:** `aria-labelledby` omitted or mismatched with `Table.Title`
**Component:** `DataTable` · **Category:** a11y wiring · **Type-invisible:** partial · **Source rule:** Primer DataTable docs

**Symptom (omitted):**
```tsx
<Table.Container>
  <Table.Title id="issues-heading">Issues</Table.Title>
  <DataTable data={...} columns={[...]} />
</Table.Container>
```

**Symptom (mismatched):**
```tsx
<Table.Container>
  <Table.Title id="issues-heading">Issues</Table.Title>
  <DataTable aria-labelledby="issue-heading" data={...} columns={[...]} />
</Table.Container>
```

**Correct shape:**
```tsx
<Table.Container>
  <Table.Title id="issues-heading">Issues</Table.Title>
  <DataTable aria-labelledby="issues-heading" data={...} columns={[...]} />
</Table.Container>
```

**Why:** The wiring is manual. A missing or mismatched id leaves the table unlabeled for assistive tech. Primer's own examples have shipped with mismatches.

**Detection signals:**
- AST: for every `<DataTable aria-labelledby="X">`, check that some sibling `<Table.Title id="X">` exists with matching id.

---

### DT-04
**Title:** Action column header has no screen-reader text
**Component:** `DataTable` · **Category:** a11y wiring · **Type-invisible:** yes · **Source rule:** Primer DataTable docs

**Symptom:**
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },
  { header: "", id: "actions", renderCell: (row) => <ActionMenu ... /> },
]}
```

**Correct shape:**
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },
  {
    header: () => (
      <span style={{ clipPath: "inset(50%)", position: "absolute" }}>
        Actions
      </span>
    ),
    id: "actions",
    renderCell: (row) => <ActionMenu ... />,
  },
]}
```

**Why:** An empty header string renders an empty `<th>` — visually fine, but screen readers announce "blank" for every action cell. Visually-hidden but readable text fixes this.

**Detection signals:**
- AST: any column object with `header: ""` (empty string) or no `header` key, paired with a `renderCell` returning an interactive element (ActionMenu, Button, IconButton).

---

### DT-05
**Title:** More than one inline row action
**Component:** `DataTable` · **Category:** UX guideline · **Type-invisible:** yes · **Source rule:** Primer DataTable docs

**Symptom:**
```tsx
{
  id: "actions",
  renderCell: (row) => (
    <>
      <IconButton icon={EditIcon} aria-label="Edit" />
      <IconButton icon={DeleteIcon} aria-label="Delete" />
      <IconButton icon={ShareIcon} aria-label="Share" />
    </>
  ),
}
```

**Correct shape:** at most one inline action; collapse the rest into an `ActionMenu`:
```tsx
{
  id: "actions",
  renderCell: (row) => (
    <ActionMenu>
      <ActionMenu.Button>...</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Item>Edit</ActionList.Item>
          <ActionList.Item>Share</ActionList.Item>
          <ActionList.Item variant="danger">Delete</ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  ),
}
```

**Why:** Primer's explicit guidance: "Do not pull out more than 1 action." Multiple inline action buttons clutter the row and create scanning load.

**Detection signals:**
- AST: more than one interactive element (Button, IconButton, Link) returned from a single column's `renderCell` function.

---

### DT-06
**Title:** All columns left to default `grow` width
**Component:** `DataTable` · **Category:** layout · **Type-invisible:** yes · **Source rule:** Primer DataTable docs

**Symptom:**
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },
  { header: "Status", field: "status" },
  { header: "Author", field: "author" },
]}
```

**Correct shape:** content-sized columns get `width: "auto"`:
```tsx
columns={[
  { header: "Title", field: "title", rowHeader: true },         // grow (default)
  { header: "Status", field: "status", width: "auto" },
  { header: "Author", field: "author", width: "auto" },
]}
```

**Why:** Omitted `width` defaults to `grow` — every column expands to fill. A row of short status pills suddenly spans 200px each.

**Detection signals:**
- Heuristic: every column in the array omits the `width` key.

---

## Banner

### BN-01
**Title:** `variant="critical"` used for non-blocking message
**Component:** `Banner` · **Category:** semantic variant · **Type-invisible:** yes · **Source rule:** `ds/components/Banner.docs.tsx`

**Symptom:**
```tsx
<Banner variant="critical" title="New feature available">
  Try the redesigned dashboard.
</Banner>
```

**Correct shape:**
```tsx
<Banner variant="upsell" title="New feature available">
  Try the redesigned dashboard.
</Banner>
```

**Why:** `critical` maps to an `alert`-style landmark with stronger announcement urgency. It is reserved for blocking failures the user must resolve to continue (payment failed, deploy blocked, data loss imminent). Using it as a colour swap desensitises users to real critical messages.

**Detection signals:**
- Heuristic: `<Banner variant="critical">` where the `title` or `description` does NOT contain action-required keywords. Eval can use a positive-keyword list: `error|failed|cannot|blocked|required|action required|must|now|immediately`.
- Stronger signal: `<Banner variant="critical" onDismiss=...>` — see [BN-02](#bn-02).

---

### BN-02
**Title:** `variant="critical"` made dismissible
**Component:** `Banner` · **Category:** semantic variant · **Type-invisible:** yes · **Source rule:** `ds/components/Banner.docs.tsx`

**Symptom:**
```tsx
<Banner
  variant="critical"
  title="Payment failed"
  onDismiss={() => setVisible(false)}
/>
```

**Why:** If the user must act on the message, letting them dismiss it hides the problem. The API allows `onDismiss` on any variant, but combining it with `critical` defeats the variant's purpose.

**Detection signals:**
- AST: `<Banner variant="critical" ...>` that also has an `onDismiss` prop.

---

### BN-03
**Title:** `variant="success"` used for static / persistent content
**Component:** `Banner` · **Category:** semantic variant · **Type-invisible:** yes · **Source rule:** `ds/components/Banner.docs.tsx`

**Symptom:**
```tsx
// Static page chrome, no preceding user action
<Banner variant="success" title="All systems operational" />
```

**Correct shape:**
```tsx
<Banner variant="info" title="All systems operational" />
```

**Why:** `success` is for confirming a *user-initiated* action ("Settings saved", "Deploy complete"). Static system-status badges or persistent page chrome should be `info`.

**Detection signals:**
- Heuristic: `<Banner variant="success">` rendered unconditionally (no surrounding state check, no useEffect tied to an action).

---

### BN-04
**Title:** Custom `icon` or `leadingVisual` on a non-info/non-upsell variant
**Component:** `Banner` · **Category:** API constraint · **Type-invisible:** no (Primer API rejects at runtime in strict mode) · **Source rule:** Primer Banner docs

**Symptom:**
```tsx
<Banner variant="critical" icon={<CustomIcon />} title="Build failed" />
```

**Why:** `icon` and `leadingVisual` are only allowed when `variant` is `info` or `upsell`. Other variants enforce their semantic icon (the red ⛔, the yellow ⚠, the green ✓) so the visual matches the announced role.

**Detection signals:**
- AST: `<Banner>` with `icon` or `leadingVisual` AND `variant` set to one of `critical | warning | success`.

---

### BN-05
**Title:** `title` omitted when `hideTitle` is set
**Component:** `Banner` · **Category:** API constraint · **Type-invisible:** no (TypeScript catches; Primer requires title at all times) · **Source rule:** Primer Banner docs

**Symptom:**
```tsx
<Banner variant="info" hideTitle>
  A maintenance window starts at 02:00 UTC.
</Banner>
```

**Correct shape:**
```tsx
<Banner
  variant="info"
  hideTitle
  title="Scheduled maintenance"
>
  A maintenance window starts at 02:00 UTC.
</Banner>
```

**Why:** `title` is the banner's accessible name. `hideTitle` only hides it visually; it still has to exist for assistive tech.

**Detection signals:**
- AST: `<Banner hideTitle>` with no `title` prop.

---

## SelectPanel

### SP-01
**Title:** Multi-select missing snapshot/restore on `onCancel`
**Component:** `SelectPanel` · **Category:** controlled state · **Type-invisible:** yes · **Source rule:** `ds/components/SelectPanel.docs.tsx`

**Symptom:**
```tsx
const [selected, setSelected] = useState<ItemInput[]>([]);
const [open, setOpen] = useState(false);

<SelectPanel
  open={open}
  onOpenChange={setOpen}
  selected={selected}
  onSelectedChange={setSelected}
  onCancel={() => setOpen(false)}   // mid-flight toggles persist!
  // ...
/>
```

**Correct shape:**
```tsx
const snapshotRef = useRef<ItemInput[]>([]);
<SelectPanel
  open={open}
  onOpenChange={(nextOpen) => {
    if (nextOpen) snapshotRef.current = selected;
    setOpen(nextOpen);
  }}
  selected={selected}
  onSelectedChange={setSelected}
  onCancel={() => {
    setSelected(snapshotRef.current);
    setOpen(false);
  }}
  // ...
/>
```

**Why:** A user clicking "Cancel" expects their session's toggles to be discarded. Without the snapshot/restore pattern, the toggles persist, defeating the meaning of "Cancel".

**Detection signals:**
- AST: `<SelectPanel>` with `selected` typed as an array AND `onCancel` set, but `onOpenChange` does not capture a snapshot ref. Heuristic: search the surrounding function body for a `useRef<...>` storing pre-open selection.

---

### SP-02
**Title:** `groupMetadata` + `virtualized` (virtualized silently ignored)
**Component:** `SelectPanel` · **Category:** runtime correctness · **Type-invisible:** yes · **Source rule:** Primer SelectPanel docs

**Symptom:**
```tsx
<SelectPanel
  items={largeItems}
  groupMetadata={groups}
  virtualized
  // ...
/>
```

**Why:** `virtualized` is ignored whenever `groupMetadata` is present. Large grouped lists will not benefit from virtualization and may scroll poorly.

**Detection signals:**
- AST: `<SelectPanel>` with both `groupMetadata` and `virtualized` props set.

---

### SP-03
**Title:** Empty-state `message` not disambiguated between "no data" and "no filter matches"
**Component:** `SelectPanel` · **Category:** UX · **Type-invisible:** yes · **Source rule:** Primer SelectPanel docs

**Symptom:**
```tsx
<SelectPanel items={filteredItems} onFilterChange={setFilter} />
// Default message says "no items available" for both:
//  (a) the source list is empty, and
//  (b) the current filter has zero matches.
```

**Correct shape:**
```tsx
<SelectPanel
  items={filteredItems}
  onFilterChange={setFilter}
  message={
    filter.length === 0
      ? { variant: "empty", title: "No labels yet", body: "Create one to filter." }
      : { variant: "empty", title: "No matches", body: `Nothing matches "${filter}".` }
  }
/>
```

**Why:** "No items available" is the same string for both states. Users cannot tell whether the dataset is empty or their query is too narrow.

**Detection signals:**
- AST: `<SelectPanel>` with `onFilterChange` set but no `message` prop.

---

### SP-04
**Title:** `footer` prop used (deprecated)
**Component:** `SelectPanel` · **Category:** deprecation · **Type-invisible:** no (Primer prints a deprecation warning) · **Source rule:** Primer SelectPanel docs

**Symptom:**
```tsx
<SelectPanel footer={<Button>Add custom</Button>} />
```

**Correct shape:**
```tsx
<SelectPanel
  secondaryAction={
    <SelectPanel.SecondaryActionButton>Add custom</SelectPanel.SecondaryActionButton>
  }
/>
```

**Why:** `footer` was removed in favour of `secondaryAction` to provide built-in keyboard and a11y wiring. Models trained on older docs still emit it.

**Detection signals:**
- AST: `<SelectPanel>` with a `footer` prop.

---

### SP-05
**Title:** External anchor used without pairing `anchorRef` and `renderAnchor={null}`
**Component:** `SelectPanel` · **Category:** controlled trigger · **Type-invisible:** partial · **Source rule:** Primer SelectPanel docs

**Symptom:**
```tsx
const anchorRef = useRef<HTMLButtonElement>(null);
<>
  <button ref={anchorRef} onClick={() => setOpen(true)}>Filter</button>
  <SelectPanel anchorRef={anchorRef} open={open} ... />
</>
```

**Correct shape:**
```tsx
<>
  <button ref={anchorRef} onClick={() => setOpen(true)}>Filter</button>
  <SelectPanel
    anchorRef={anchorRef}
    renderAnchor={null}
    open={open}
    ...
  />
</>
```

**Why:** Without `renderAnchor={null}`, `SelectPanel` will also render its own default anchor — you'll have two triggers.

**Detection signals:**
- AST: `<SelectPanel>` with `anchorRef` set but no `renderAnchor={null}`.

---

### SP-06
**Title:** Trigger button shows selection but lacks a persistent label
**Component:** `SelectPanel` · **Category:** a11y · **Type-invisible:** yes · **Source rule:** Primer SelectPanel docs

**Symptom:**
```tsx
renderAnchor={({ children, ...anchorProps }) => (
  <button {...anchorProps}>{selected.map(s => s.text).join(", ") || "Select"}</button>
)}
```

**Correct shape:** add a persistent label, either visible or visually-hidden:
```tsx
renderAnchor={({ children, ...anchorProps }) => (
  <button {...anchorProps} aria-label="Filter by label">
    {selected.map(s => s.text).join(", ") || "Select labels"}
  </button>
)}
```

**Why:** When the trigger's text changes with selection, a screen reader user loses the field's purpose. The persistent label restores it.

**Detection signals:**
- Heuristic: `renderAnchor` whose returned `<button>` has its text content interpolated from `selected` and no `aria-label`.

---

## ActionMenu

### AM-01
**Title:** `open` passed without `onOpenChange` (or vice versa)
**Component:** `ActionMenu` · **Category:** controlled state · **Type-invisible:** yes · **Source rule:** `ds/components/ActionMenu.docs.tsx`

**Symptom (a):**
```tsx
<ActionMenu open={open}>
  <ActionMenu.Button>Menu</ActionMenu.Button>
  ...
</ActionMenu>
// menu opens but never closes — onOpenChange missing
```

**Symptom (b):**
```tsx
<ActionMenu onOpenChange={setOpen}>
  ...
</ActionMenu>
// onOpenChange never fires — open missing means uncontrolled
```

**Correct shape:**
```tsx
<ActionMenu open={open} onOpenChange={setOpen}>
  ...
</ActionMenu>
```

**Why:** The controlled state requires the pair. The type system permits each individually.

**Detection signals:**
- AST: `<ActionMenu>` with exactly one of `{open, onOpenChange}` set, not both.

---

### AM-02
**Title:** Destructive item styled with a custom className instead of `variant="danger"`
**Component:** `ActionMenu` (via `ActionList.Item`) · **Category:** semantic variant · **Type-invisible:** yes · **Source rule:** `ds/components/ActionMenu.docs.tsx`

**Symptom:**
```tsx
<ActionList.Item className="text-red-500" onSelect={onDelete}>
  Delete
</ActionList.Item>
```

**Correct shape:**
```tsx
<ActionList.Item variant="danger" onSelect={onDelete}>
  Delete
</ActionList.Item>
```

**Why:** `variant="danger"` does more than colour — it wires the hover and focus tokens, announces the action's severity to assistive tech, and ensures the design system can re-skin destructive actions globally.

**Detection signals:**
- AST: `<ActionList.Item>` with a `className` containing colour utility classes (`text-red`, `bg-red`, `danger`, `destructive`) AND no `variant="danger"`.
- Heuristic: `<ActionList.Item>` whose child text matches `^(Delete|Remove|Discard|Destroy|Drop|Reset)`.

---

### AM-03
**Title:** Submenu trigger uses `ActionMenu.Button` instead of `ActionMenu.Anchor`
**Component:** `ActionMenu` · **Category:** trigger composition · **Type-invisible:** yes · **Source rule:** `ds/components/ActionMenu.docs.tsx`, Primer ActionMenu docs

**Symptom:**
```tsx
<ActionList>
  <ActionList.Item>Pin</ActionList.Item>
  <ActionMenu>
    <ActionMenu.Button>More</ActionMenu.Button>
    <ActionMenu.Overlay>...</ActionMenu.Overlay>
  </ActionMenu>
</ActionList>
```

**Correct shape:**
```tsx
<ActionList>
  <ActionList.Item>Pin</ActionList.Item>
  <ActionMenu>
    <ActionMenu.Anchor>
      <ActionList.Item>More...</ActionList.Item>
    </ActionMenu.Anchor>
    <ActionMenu.Overlay>...</ActionMenu.Overlay>
  </ActionMenu>
</ActionList>
```

**Why:** `ActionMenu.Button` introduces a new button element inside the list, breaking the row's keyboard navigation. `ActionMenu.Anchor` wraps an existing `ActionList.Item` so the submenu anchors to the row.

**Detection signals:**
- AST: `<ActionMenu>` nested inside `<ActionList>` where the inner ActionMenu uses `<ActionMenu.Button>` rather than `<ActionMenu.Anchor>`.

---

### AM-04
**Title:** Non-toggle items given `role="menuitemcheckbox"`
**Component:** `ActionMenu` (via `ActionList.Item`) · **Category:** a11y · **Type-invisible:** yes · **Source rule:** `ds/components/ActionMenu.docs.tsx`

**Symptom:**
```tsx
<ActionList.Item role="menuitemcheckbox" onSelect={onTransfer}>
  Transfer
</ActionList.Item>
```

**Why:** `menuitemcheckbox` is for toggles (a checkable/uncheckable state). Plain actions should use the default `menuitem` role. Wrong role means screen readers announce a checkbox state that doesn't exist.

**Detection signals:**
- AST: `<ActionList.Item role="menuitemcheckbox">` with no `aria-checked` prop AND no boolean state in `onSelect`.

---

### AM-05
**Title:** All-inactive menu rendered instead of marking the trigger inactive
**Component:** `ActionMenu` · **Category:** UX · **Type-invisible:** yes · **Source rule:** Primer ActionMenu docs

**Symptom:**
```tsx
<ActionMenu>
  <ActionMenu.Button>Actions</ActionMenu.Button>
  <ActionMenu.Overlay>
    <ActionList>
      <ActionList.Item inactiveText="Sign in to enable">Edit</ActionList.Item>
      <ActionList.Item inactiveText="Sign in to enable">Delete</ActionList.Item>
      <ActionList.Item inactiveText="Sign in to enable">Share</ActionList.Item>
    </ActionList>
  </ActionMenu.Overlay>
</ActionMenu>
```

**Correct shape:**
```tsx
<ActionMenu>
  <ActionMenu.Button inactive inactiveText="Sign in to access actions">Actions</ActionMenu.Button>
  <ActionMenu.Overlay>...</ActionMenu.Overlay>
</ActionMenu>
```

**Why:** If every item in the menu is unavailable, the menu shouldn't open at all. Marking the trigger inactive surfaces the reason without the user having to open an empty list.

**Detection signals:**
- AST: `<ActionList>` inside `<ActionMenu.Overlay>` where every `<ActionList.Item>` child has an `inactiveText` prop (or the underlying disabled equivalent).

---

## Cross-cutting

### XC-01
**Title:** Reaching for `TextInputWithTokens` (deprecated in Primer)
**Component:** any (cross-component) · **Category:** deprecated API · **Type-invisible:** partial · **Source rule:** Primer TextInputWithTokens docs (slated for removal in the next major)

**Symptom:**
```tsx
import { TextInputWithTokens } from "@primer/react";
<TextInputWithTokens tokens={tags} onTokenRemove={removeTag} />
```

**Correct shape:** combine `Autocomplete` + `Token` directly, or use a multi-select `SelectPanel`:
```tsx
<SelectPanel
  selected={selectedTokens}
  onSelectedChange={setSelectedTokens}
  items={availableTokens}
  ...
/>
```

**Why:** `TextInputWithTokens` is deprecated by Primer and will be removed. The skill should refuse to emit it.

**Detection signals:**
- Regex: any import or JSX usage of `TextInputWithTokens`.

---

### XC-02
**Title:** Deep-importing from `@primer/react` instead of via `ds/components/`
**Component:** any · **Category:** architecture · **Type-invisible:** yes (the import works) · **Source rule:** every wrapper file's JSDoc (`Public API only — do not deep-import`)

**Symptom:**
```tsx
import { Banner } from "@primer/react";
```

**Correct shape:**
```tsx
import { Banner } from "@/ds/components/Banner";
```

**Why:** The wrappers exist to centralise rules (JSDoc, prop tightening, future custom logic). Bypassing them silently skips the design-system layer and any rule the wrapper encodes — including future tightenings.

**Detection signals:**
- Regex: `from\s+["']@primer/react["']` in any file under `app/` (or anywhere outside `ds/components/`).

---

## How to run these as evals

Each pitfall above is structured so an eval harness can:

1. **Locate the trigger.** Use the AST / regex hints in *Detection signals* to find the call site in a generated file (typically `app/issues.tsx` or whatever Phase 2 emits).
2. **Confirm the FAIL.** Walk the surrounding code for the missing/incorrect pattern.
3. **Quote the rule.** Use the *Source rule* link for the FAIL message so the report points back to the design system, not just the eval.

Minimum coverage for a Phase 3 audit should fire on at least: PH-01, PH-02, BN-01, DT-01, SP-01, AM-01, AM-02. These seven cover one pitfall per component (plus the Banner trap), and together demonstrate that the extracted skill caught traps in five distinct categories (slot composition, semantic variant, a11y wiring, controlled state, trigger composition).

A "money-shot FAIL" candidate for the Block 5 reveal — equivalent to the old `disabled={!isValid}` line — is either **PH-01** (visually obvious: actions render in the wrong place) or **BN-01** (visually obvious: red banner where yellow belongs). Both are type-invisible. Both demo cleanly in a screenshot.
