---
title: Text
description: Inline text primitive (span by default) with a closed size/weight scale; secondary prose pairs small size with the muted token.
---

# Text

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Text } from '@primer/react'`

## When to use

Use Text for inline prose, descriptions, and metadata lines. It renders a `span` by default and is polymorphic via `as` (node_modules/@primer/react/dist/Text/Text.d.ts:3). For headings use [Heading](./heading.md).

## Key props

- `size` — `'large' | 'medium' | 'small'` (Text.d.ts:4)
- `weight` — `'light' | 'normal' | 'medium' | 'semibold'` (Text.d.ts:5)
- `as` — polymorphic element override; default `'span'` (Text.d.ts:3)

## Best Practices

- Secondary prose drops to `size="small"` with `style={{ color: "var(--fgColor-muted)" }}` — the muted-foreground token, never a raw hex (lifted from `references/examples/home.md`).
- Build text hierarchy with `weight` + the muted token, not font-size jumps — three-line list bodies use semibold title over muted body/meta (lifted from `references/examples/dashboard.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/home (app/page.tsx):

```tsx
import { Text } from "@primer/react";

<Text size="small" style={{ color: "var(--fgColor-muted)" }}>
  {route.description}
</Text>
```

## Source references

- `node_modules/@primer/react/dist/Text/Text.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Text/Text.docs.json` + `Text.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Text size="xlarge">` | `<Text size="large">` | size enum is `large \| medium \| small` (Text.d.ts:4) |
| `<Text weight="bold">` | `<Text weight="semibold">` | weight enum tops out at `semibold` (Text.d.ts:5) |
| `style={{ color: "#57606a" }}` | `style={{ color: "var(--fgColor-muted)" }}` | hex bypasses theming (references/foundations/primitives.md token/css-variable-consumption) |

## Things to never invent

- Props not listed under "Key props".
- `size` values outside `'large' | 'medium' | 'small'` — there is no `xlarge` or `xs`.
- `weight` values outside `'light' | 'normal' | 'medium' | 'semibold'` — there is no `bold`.
- Sibling components not present in the in-scope set.
