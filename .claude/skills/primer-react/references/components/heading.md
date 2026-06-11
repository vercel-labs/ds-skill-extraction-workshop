---
title: Heading
description: Semantic heading that renders h2 by default; visual size is decoupled from the semantic level via variant.
---

# Heading

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Heading } from '@primer/react'`

## When to use

Use Heading for every page and section title. The semantic level (`as`) and the visual size (`variant`) are independent — keep heading levels semantic (h1 page → h2 sections) and tune the size with `variant`. For non-heading emphasized text use [Text](./text.md) with `weight`.

## Key props

- `as` — `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`; the rendered element defaults to `'h2'` (node_modules/@primer/react/dist/Heading/Heading.d.ts:3,5; default at dist/Heading/Heading.js:9 `as: Component = 'h2'`)
- `variant` — `'large' | 'medium' | 'small'` visual scale, independent of `as` (Heading.d.ts:6)

## Best Practices

- Keep levels semantic: one `as="h1"` per page, `as="h2"` for sections — lifted from the settings exemplar (`references/examples/settings.md`).
- Use `variant` to size, not a different heading level — `as` is for document structure (Heading.d.ts:5-6).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx:

```tsx
import { Heading } from "@primer/react";

<Heading as="h1" variant="large">Settings</Heading>
// section below it:
<Heading as="h2" variant="medium">Public profile</Heading>
```

## Source references

- `node_modules/@primer/react/dist/Heading/Heading.d.ts` — published prop types
- `node_modules/@primer/react/dist/Heading/Heading.js:9` — `as` default (`'h2'`)
- `primer/react` @ main: `packages/react/src/Heading/Heading.docs.json` + `Heading.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Heading as="div">` | `<Heading as="h3">` | `as` is constrained to `h1`-`h6` (Heading.d.ts:3) |
| `<Heading>` assuming h1 | `<Heading as="h1">` for the page title | the default element is `h2` (Heading.js:9) |
| `<Heading as="h4">` to make a section title smaller | `<Heading as="h2" variant="small">` | level is semantic; size is `variant` (Heading.d.ts:5-6) |

## Things to never invent

- Props not listed under "Key props".
- `as` values outside `h1`-`h6` — Heading never renders a `div` or `span`.
- `variant` values outside `'large' | 'medium' | 'small'`.
- Sibling components not present in the in-scope set.
