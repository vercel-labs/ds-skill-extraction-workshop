---
title: IconButton
description: Icon-only button where `aria-label` is the accessible name AND the tooltip text
---

## Public imports

```tsx
import { IconButton } from '@primer/react'
```

## When to use

Pick `IconButton` for icon-only triggers (close, more, share, settings). For buttons with visible text (with or without a leading icon), use [Button](./button.md) — its `leadingVisual` / `trailingVisual` slots cover the iconified-text case. IconButton is the right tier when there is no visible label.

## Key props

- `icon: ElementType` — REQUIRED. The icon component (e.g. `XIcon` from `@primer/octicons-react`). `node_modules/@primer/react/dist/Button/types.d.ts:73`
- `aria-label: string` — REQUIRED (or `aria-labelledby`). Doubles as the tooltip text unless `unsafeDisableTooltip`. `dist/Button/types.d.ts:7-14`
- `unsafeDisableTooltip?: boolean` — opts out of the auto-tooltip; do NOT use unless you ship a custom tooltip wrapper. `dist/Button/types.d.ts:73`
- `description?: string` — additional context BEYOND the `aria-label` (read after the label by SR). `dist/Button/types.d.ts:74`
- `tooltipDirection?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'` — compass directions only. `dist/Button/types.d.ts:75`
- `keybindingHint?: string | string[]` — keyboard-shortcut hint shown in the tooltip. `dist/Button/types.d.ts:78`
- `keyshortcuts?: string` — **DEPRECATED**, use `keybindingHint`. `dist/Button/types.d.ts:76-77`
- `variant?` / `size?` / `loading?` / `inactive?` / `disabled?` — inherited from `ButtonBaseProps` (with `aria-label`/`aria-labelledby` re-required at this layer). `dist/Button/types.d.ts:72-79`

## Accessibility

- `aria-label` (or `aria-labelledby`) is REQUIRED at the type level — the type union enforces one of the two. `dist/Button/types.d.ts:7-14`
- The `aria-label` text doubles as the visible tooltip text — write a real, human label, not a placeholder. Setting `unsafeDisableTooltip` removes the visible affordance and is rarely the right call. `dist/Button/types.d.ts:73`
- Use `description` for additional context beyond the label (e.g. label "Delete repository", description "This action cannot be undone"). The SR announces label THEN description. `dist/Button/types.d.ts:74`
- `keybindingHint` (not the deprecated `keyshortcuts`) renders the shortcut in the tooltip. `dist/Button/types.d.ts:76-78`

## Best Practices

- Always pass `aria-label` (or `aria-labelledby`) — the d.ts requires it. `dist/Button/types.d.ts:7-14`
- The `aria-label` IS the accessible name AND the tooltip text — do not duplicate it as `description`. `description` carries information the label does not. `dist/Button/types.d.ts:74`
- Pass the icon as the `icon` prop, not as `children` — IconButton omits `children` semantics (it is icon-only). `dist/Button/types.d.ts:73`
- Use `keybindingHint`, not the deprecated `keyshortcuts`. `dist/Button/types.d.ts:76-78`
- `tooltipDirection` accepts COMPASS directions only — `'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'`, NOT `'top' | 'right' | 'bottom' | 'left'`. `dist/Button/types.d.ts:75`

## Composition examples

```tsx
import { IconButton } from '@primer/react'
import { XIcon } from '@primer/octicons-react'

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <IconButton
      icon={XIcon}
      aria-label="Close dialog"
      variant="invisible"
      onClick={onClose}
    />
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Button/types.d.ts:72-79` — `IconButtonProps`
- `node_modules/@primer/react/dist/Button/IconButton.d.ts` — `PolymorphicForwardRefComponent<"button" | "a", IconButtonProps>`
- Upstream: `primer/react@main:packages/react/src/Button/IconButton.tsx:14,19,40`

## Common mistakes

- `<IconButton icon={XIcon} description="Close">` (no `aria-label`) — the type union requires one of `aria-label` or `aria-labelledby`.
- `<IconButton icon={XIcon} aria-label="Close" description="Close">` — duplicate text; SR reads "Close, Close". Drop `description` or replace it with extra context.
- `<IconButton tooltipDirection="top">` — `tooltipDirection` is compass-only; use `'n'`.
- `<IconButton keyshortcuts="Cmd+K">` — deprecated; use `keybindingHint="Cmd+K"`.

## Things to never invent

- Props not listed under "Key props".
- `tooltipDirection` values outside the 8 compass points.
- A `children` slot — IconButton is icon-only by construction.
- A `label` prop — the accessible name is `aria-label`.
