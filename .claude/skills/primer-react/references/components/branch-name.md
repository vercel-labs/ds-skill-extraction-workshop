---
title: BranchName
description: Branch chip — renders an `<a>` by default; pass `as="span"` for non-link chips
---

## Public imports

```tsx
import { BranchName } from '@primer/react'
```

## When to use

Pick `BranchName` to display a git branch name (in a PR row, in a merge-readiness panel, in a commit timeline). By default it renders an **`<a>`** — pass `as="span"` when the chip is not a link. For PR/issue lifecycle state pills, use [StateLabel](./state-label.md). For metadata badges, use [Label](./label.md).

## Key props

- `as?: ElementType` — polymorphic; **default `'a'`** (renders an anchor by default). `node_modules/@primer/react/dist/BranchName/BranchName.d.ts:3` (`PolymorphicProps<As, 'a', ...>`).
- `className?: string`. `dist/BranchName/BranchName.d.ts:4`
- Native passthrough: props for the chosen `as` element. When `as="a"` (default), `href`/`target`/`rel`/etc. are accepted via `React.ComponentPropsWithRef<...>`. `dist/BranchName/BranchName.d.ts:5-11`

## Accessibility

- Default `as='a'` carries link semantics — pass `href` to make the link real. If the surrounding row is already a link, pass `as="span"` to avoid nested-link semantics.
- The text content of BranchName is the accessible name — write the real branch name, not a placeholder.

## Best Practices

- **BranchName renders `<a>` by default.** The polymorphic default is `'a'` (`PolymorphicProps<As, 'a', ...>`). For non-link chips, pass `as="span"`. `dist/BranchName/BranchName.d.ts:3` + upstream `packages/react/src/BranchName/BranchName.tsx:16`.
- For a non-link chip inside an already-linked card or row, ALWAYS use `as="span"` — nesting an anchor inside another anchor is invalid HTML and breaks keyboard navigation. `dist/BranchName/BranchName.d.ts:3`
- BranchName carries no `status` / `variant` axis — it is a thin chip with a fixed visual treatment. The styling axes for a non-default look go through `className` and `style`. `dist/BranchName/BranchName.d.ts:4`

## Composition examples

```tsx
import { BranchName } from '@primer/react'

export function MergeReadinessRow({ source, target, sourceHref }: {
  source: string
  target: string
  sourceHref?: string
}) {
  return (
    <>
      <BranchName href={sourceHref}>{source}</BranchName>
      {' → '}
      <BranchName as="span">{target}</BranchName>
    </>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/BranchName/BranchName.d.ts:1-13` — `BranchNameProps`
- Upstream: `primer/react@main:packages/react/src/BranchName/BranchName.tsx:16` — `as: Component = 'a'` default

## Common mistakes

- `<BranchName><span>main</span></BranchName>` rendered inside a card whose outer `<a>` already linked to the PR — the default `<a>` from BranchName produces nested anchors. Use `as="span"`.
- Assuming BranchName has a `status` or `variant` prop — it does not; the chip styling is fixed.

## Things to never invent

- Props not listed under "Key props".
- A `status` or `variant` prop — BranchName has none.
- A non-`a` default — `as` defaults to `'a'`; override explicitly with `as="span"` for non-link chips.
