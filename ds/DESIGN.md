---
name: ds
description: Project design system — thin Primer wrapper, restrictive on a11y and slot composition.
---

# ds — design system

`ds` is a thin wrapper around Primer: if Primer ships it, `ds` exposes it. The wrappers exist because Primer's defaults are loose on slot composition and variant semantics, so each wrapper tightens what Primer ships loose. The `PageHeader` slot-composition rule below is the canonical example.

## Headline rule

`PageHeader` is composed of slots. Two of those slots — `LeadingVisual` and `TrailingVisual` — go INSIDE `PageHeader.TitleArea`. Every other slot — `ContextArea`, `Actions`, `TrailingAction`, `Navigation` — goes OUTSIDE `TitleArea`, as a direct child of `PageHeader`.

```tsx
<PageHeader>
  <PageHeader.ContextArea>...</PageHeader.ContextArea>    {/* outside */}
  <PageHeader.TitleArea>
    <PageHeader.LeadingVisual>...</PageHeader.LeadingVisual> {/* inside */}
    <PageHeader.Title>...</PageHeader.Title>                  {/* inside */}
    <PageHeader.TrailingVisual>...</PageHeader.TrailingVisual>{/* inside */}
  </PageHeader.TitleArea>
  <PageHeader.Actions>...</PageHeader.Actions>            {/* outside */}
  <PageHeader.TrailingAction>...</PageHeader.TrailingAction>{/* outside */}
  <PageHeader.Navigation>...</PageHeader.Navigation>      {/* outside */}
</PageHeader>
```

TypeScript does not enforce the nesting. The wrong shape renders — visuals float free of the title; actions collapse into the title row — and the layout grid silently breaks. Models commonly drop `Actions` inside `TitleArea` because the words "header" and "title" feel synonymous; they are not. `TitleArea` is the inline cluster around the title text. Everything chrome-level lives one level up.

## Where the rest of the floor lives

Per-component rules live alongside the components in `ds/components/<Name>.docs.tsx`. `DESIGN.md` is the floor, not the ceiling. The active set:

- `ds/components/DataTable.docs.tsx` — exactly one `rowHeader: true` column; pre-sort `data` to match `initialSortDirection`.
- `ds/components/PageHeader.docs.tsx` — the headline above, with a runnable example.
- `ds/components/SelectPanel.docs.tsx` — multi-select: snapshot `selected` on open, restore in `onCancel`.
- `ds/components/Banner.docs.tsx` — `variant` is semantic, not cosmetic; `critical` is for blocking failures only.
- `ds/components/ActionMenu.docs.tsx` — `open` + `onOpenChange` must be paired; destructive items use `<ActionList.Item variant="danger">`.

`ActionList` is a primitive used inside `ActionMenu.Overlay`; its wrapper lives at `ds/components/ActionList.tsx` and its rule lives inside `ActionMenu.docs.tsx`.
