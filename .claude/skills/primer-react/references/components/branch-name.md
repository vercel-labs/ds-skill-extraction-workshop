---
title: BranchName
description: Monospace branch chip that renders an anchor by default; pass as="span" for non-link chips.
---

# BranchName

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { BranchName } from '@primer/react'`

## When to use

Use BranchName for branch references (`main`, `feature/x`) in PR headers, merge panels, and commit rows. It is polymorphic over `'a'` — BranchName renders an `<a>` by default (`as: Component = 'a'`); pass `as="span"` for non-link chips (primer/react @ main: packages/react/src/BranchName/BranchName.tsx:17; node_modules/@primer/react/dist/BranchName/BranchName.d.ts:3). For lifecycle state capsules next to it use [StateLabel](./state-label.md).

## Key props

- `as` — polymorphic element; defaults to `'a'` (BranchName.d.ts:3 `PolymorphicProps<As, 'a', ...>`; BranchName.tsx:17). Verified: `as="span"` typechecks against the published types.
- `href` — native anchor passthrough when rendering the default `<a>` (BranchName.d.ts:6)
- `className` — styling escape hatch (BranchName.d.ts:4)

## Best Practices

- A BranchName that navigates nowhere is NOT a link — pass `as="span"`; a default `<a>` without `href` still reads as a link to assistive tech (BranchName.tsx:17).
- When the chip IS a link, keep the default element and pass `href` — do not wrap a `span`-mode BranchName in an extra anchor.

## Composition examples

Lifted from primer/react @ main: packages/react/src/BranchName/BranchName.stories.tsx (Default story), plus the non-link form verified against the published types:

```tsx
import { BranchName } from "@primer/react";

<BranchName href="#">branch_name</BranchName>
<BranchName as="span">main</BranchName>
```

## Source references

- `node_modules/@primer/react/dist/BranchName/BranchName.d.ts` — published prop types (polymorphic over `'a'`)
- `primer/react` @ main: `packages/react/src/BranchName/BranchName.tsx:17` — `as: Component = 'a'` default
- `primer/react` @ main: `packages/react/src/BranchName/BranchName.docs.json` (`as` default `"a"`) + `BranchName.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<BranchName>main</BranchName>` as a non-link chip | `<BranchName as="span">main</BranchName>` | the default render is an `<a>` (BranchName.tsx:17) |
| `<code>main</code>` hand-styled monospace chip | `<BranchName as="span">main</BranchName>` | the component carries the chip styling; hand-rolled chips drift off-token |

## Things to never invent

- Props not listed under "Key props".
- A `variant` or `color` prop — BranchName has none.
- Sibling components not present in the in-scope set.
