---
title: PageHeader
description: Compound app-shell header. Slot placement is the headline trap — visuals go INSIDE TitleArea, chrome goes OUTSIDE.
---

## Public imports

```ts
import { PageHeader } from "@/ds/components/PageHeader";
```

Compound subcomponents accessed as `PageHeader.<Slot>` — no separate imports.

## When to use

Use `PageHeader` for any full-width page chrome that needs a title, optional breadcrumbs / parent links, optional primary actions, and optional underline-nav tabs. For a section-internal heading inside a card or panel, prefer plain semantic `<h2>` / `<h3>` — `PageHeader` is page-level chrome and brings layout grid the section heading does not need.

## Key props

The component itself takes only `children`. The behavioural surface lives in the compound subcomponents:

- `PageHeader.ContextArea` — breadcrumbs / parent links above the title row. (PageHeader.d.ts:34)
- `PageHeader.TitleArea` — the inline cluster around the title text. (PageHeader.d.ts:37)
- `PageHeader.LeadingVisual` — icon / avatar BEFORE the title text. Lives INSIDE `TitleArea`. (PageHeader.d.ts:41)
- `PageHeader.Title` — the title text node. Lives INSIDE `TitleArea`. (PageHeader.d.ts:42)
- `PageHeader.TrailingVisual` — badge / metadata AFTER the title text. Lives INSIDE `TitleArea`. (PageHeader.d.ts:43)
- `PageHeader.Actions` — primary action buttons. Lives OUTSIDE `TitleArea`. (PageHeader.d.ts:45)
- `PageHeader.TrailingAction` — single trailing button (overflow, "More"). Lives OUTSIDE `TitleArea`. (PageHeader.d.ts:44)
- `PageHeader.Navigation` — underline-nav tabs (e.g. Code / Issues / PRs). Lives OUTSIDE `TitleArea`. (PageHeader.d.ts:47)

## Best Practices

### When to use

- Use for page-level chrome (repo header, settings page header, issues page header). For section-internal headings inside a card, use plain semantic `<h2>` / `<h3>` instead.

### Behavior

- `LeadingVisual` and `TrailingVisual` go INSIDE `<PageHeader.TitleArea>`. Every other slot — `ContextArea`, `Actions`, `TrailingAction`, `Navigation` — goes OUTSIDE `TitleArea`, as a direct child of `<PageHeader>`. (ds/DESIGN.md:12, ds/components/PageHeader.docs.tsx:5)
- TypeScript does NOT enforce the nesting. The wrong shape renders — visuals float free of the title, actions collapse into the title row, the layout grid silently breaks. (ds/components/PageHeader.docs.tsx:18)
- The component renders nothing structurally beyond what subcomponents emit. There is no "auto-layout" prop; placement IS the contract.

### Accessibility

- `PageHeader.Title` renders an `<h1>` by default. Do NOT place a `PageHeader` inside another `<h1>` context, and do NOT render a second `<h1>` on the same screen.
- `PageHeader.Navigation` renders semantic nav landmarks — do not wrap in an additional `<nav>` element.

## Composition examples

```tsx
import { PageHeader } from "@/ds/components/PageHeader";

export function RepoHeader() {
  return (
    <PageHeader>
      <PageHeader.ContextArea>
        <a href="/acme">acme</a> /
      </PageHeader.ContextArea>
      <PageHeader.TitleArea>
        <PageHeader.LeadingVisual>
          <span aria-hidden="true">R</span>
        </PageHeader.LeadingVisual>
        <PageHeader.Title>my-repo</PageHeader.Title>
        <PageHeader.TrailingVisual>
          <span aria-hidden="true">Public</span>
        </PageHeader.TrailingVisual>
      </PageHeader.TitleArea>
      <PageHeader.Actions>
        <button type="button">New issue</button>
      </PageHeader.Actions>
      <PageHeader.TrailingAction>
        <button type="button" aria-label="More options">⋯</button>
      </PageHeader.TrailingAction>
      <PageHeader.Navigation>
        <nav aria-label="Repository">
          <a href="#" aria-current="page">Issues</a>
        </nav>
      </PageHeader.Navigation>
    </PageHeader>
  );
}
```

## Source references

- `ds/components/PageHeader.tsx:25` — wrapper (re-export of `@primer/react` `PageHeader`).
- `ds/components/PageHeader.docs.tsx` — slot placement rule + runnable example.
- `ds/DESIGN.md:12` — project headline floor for slot composition.
- `node_modules/@primer/react/dist/PageHeader/PageHeader.d.ts:34-47` — compound subcomponent type signatures.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| `<PageHeader.TitleArea><PageHeader.Title>...</PageHeader.Title><PageHeader.Actions>...</PageHeader.Actions></PageHeader.TitleArea>` | `<PageHeader.TitleArea><PageHeader.Title>...</PageHeader.Title></PageHeader.TitleArea><PageHeader.Actions>...</PageHeader.Actions>` | `Actions` is chrome-level, not part of the title cluster. Inside `TitleArea` it collapses into the title row and breaks the grid. |
| `<PageHeader.LeadingVisual />` as a direct child of `<PageHeader>` | `<PageHeader.TitleArea><PageHeader.LeadingVisual />...</PageHeader.TitleArea>` | Visuals exist to flank the title text. Outside `TitleArea` they float free, with no anchor. |
| Wrapping `<PageHeader.Navigation>` in another `<nav>` | Let `PageHeader.Navigation` render its own landmark | Double nav landmarks confuse SR users. The component already emits the right semantics. |

## Things to never invent

- `PageHeader.Subtitle`, `PageHeader.Header`, `PageHeader.Body` — none exist.
- `<PageHeader layout="...">` or any prop on the root `PageHeader` other than `children`. Placement IS the layout API.
- Wrapping `Actions` in `TitleArea` because "they belong with the title". They don't.
