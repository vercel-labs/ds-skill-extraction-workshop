---
title: IconButton
description: Icon-only button; requires an aria-label because there is no visible text.
---

## Public imports

`import { IconButton } from "@/ds/components/IconButton"` (project wrapper) — equivalent to `import { IconButton } from "@primer/react"`.

## When to use

Use `IconButton` for a compact action with no room for a text label — a row kebab, a close affordance, a toolbar action. When the action has visible text, use [Button](./button.md) with a `leadingVisual` instead. For icon accessibility rules (decorative vs contentful), see [icons foundation](../foundations/icons.md).

## Key props

- `icon` — the octicon **component** to render, e.g. `icon={SearchIcon}`. (`ds/components/IconButton.docs.tsx:5`)
- `aria-label` — required; the accessible name for the control. (`ds/components/IconButton.docs.tsx:4`)
- `variant` — `'default' | 'primary' | 'danger' | 'invisible'`. (`@primer/react@38.26.0` IconButton types; used at `ds/components/IconButton.docs.tsx:11`)

## Best Practices

- Always set `aria-label` — there is no visible text for assistive tech to announce, so without it the control reads only as "button". (`ds/components/IconButton.docs.tsx:4`) `component/iconbutton-requires-aria-label`
- Pass the icon **component** to `icon` (`icon={SearchIcon}`), never JSX (`icon={<SearchIcon />}`). (`ds/components/IconButton.docs.tsx:5`) `component/icon-prop-not-jsx`

## Composition examples

```tsx
import { IconButton } from "@/ds/components/IconButton";
import { SearchIcon } from "@primer/octicons-react";

export function SearchAction() {
  return <IconButton icon={SearchIcon} aria-label="Search" variant="default" />;
}
```

## Source references

- `ds/components/IconButton.tsx:10` — wrapper re-export
- `ds/components/IconButton.docs.tsx:1-11` — annotated rules (aria-label required, icon-as-component)
- `@primer/react@38.26.0` — `IconButton` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Omitting `aria-label` because the icon "looks obvious" → screen readers announce only "button".
- Passing `icon={<SearchIcon />}` → pass the component reference `icon={SearchIcon}`.

## Things to never invent

- A text-label prop — `IconButton` is icon-only; if you need text, use `Button`.
- Variants beyond `default | primary | danger | invisible`.
