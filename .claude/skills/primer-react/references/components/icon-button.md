---
title: IconButton
description: Icon-only button; aria-label is required and doubles as the tooltip text unless unsafeDisableTooltip.
---

# IconButton

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { IconButton } from '@primer/react'`

## When to use

Use IconButton for icon-only actions (kebab menus, close, favorite). When the action has visible text, use [Button](./button.md) — optionally with `leadingVisual` for the icon. IconButton shares Button's base props (`variant`, `size`, `disabled`, `inactive`, `block`, `loading`) via `ButtonBaseProps`.

## Key props

- `icon` — REQUIRED; the octicon component reference, e.g. `icon={HeartIcon}` (node_modules/@primer/react/dist/Button/types.d.ts:72)
- `aria-label` or `aria-labelledby` — exactly one is REQUIRED; the union type forbids both and forbids neither (types.d.ts:7-13)
- `unsafeDisableTooltip` — suppresses the tooltip that the `aria-label` otherwise produces (types.d.ts:73)
- `description` — supplementary description text (types.d.ts:74)
- `tooltipDirection` — `'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'` (types.d.ts:75; direction enum per dist/TextInput/TextInput.d.ts:43)
- `keybindingHint` — `string | string[]` keyboard hint; `keyshortcuts` is deprecated in its favor (types.d.ts:76-78)
- `variant` / `size` / `disabled` / `inactive` / `loading` — inherited from `ButtonBaseProps` (types.d.ts:79)

## Best Practices

- IconButton's `aria-label` is the accessible name AND the tooltip text unless `unsafeDisableTooltip` (primer/react @ main: packages/react/src/Button/IconButton.tsx:14,40).
- Never render an IconButton without `aria-label`/`aria-labelledby` — the types make it a compile error, not a style choice (types.d.ts:7-13).
- Pass the icon as a component reference (`icon={HeartIcon}`), never a rendered element (`icon={<HeartIcon />}` is accepted by Button's looser `icon` type but the IconButton contract is `React.ElementType`, types.d.ts:72).

## Composition examples

Lifted from primer/react @ main: packages/react/src/Button/IconButton.stories.tsx (Default story):

```tsx
import { IconButton } from "@primer/react";
import { HeartIcon } from "@primer/octicons-react";

<IconButton icon={HeartIcon} aria-label="Favorite" />
```

## Source references

- `node_modules/@primer/react/dist/Button/types.d.ts` — `IconButtonProps` (lines 71-79)
- `node_modules/@primer/react/dist/Button/IconButton.d.ts` — export shape
- `primer/react` @ main: `packages/react/src/Button/IconButton.docs.json` + `IconButton.stories.tsx` (note: IconButton lives under `src/Button/`, not its own directory)

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<IconButton icon={XIcon} />` | `<IconButton icon={XIcon} aria-label="Close" />` | no accessible name; the a11y union requires `aria-label` or `aria-labelledby` (types.d.ts:7-13) |
| `<IconButton tooltipDirection="up" ...>` | `<IconButton tooltipDirection="n" ...>` | direction enum is compass points `n\|ne\|e\|se\|s\|sw\|w\|nw` |
| visible `<Tooltip>` wrapped around IconButton | rely on the built-in `aria-label` tooltip | the label already produces a tooltip; wrapping duplicates it (IconButton.tsx:14,40) |

## Things to never invent

- Props not listed under "Key props".
- `tooltipDirection` values outside the eight compass points.
- A both-`aria-label`-and-`aria-labelledby` combination — the union type forbids it.
- Sibling components not present in the in-scope set.
