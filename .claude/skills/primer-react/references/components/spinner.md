---
title: Spinner
description: Indeterminate loading indicator — `small | medium | large` with a built-in screen-reader announcement and optional render delay
---

## Public imports

```tsx
import { Spinner } from '@primer/react'
```

## When to use

Pick `Spinner` for an indeterminate, page- or region-level loading state where no specific element owns the busy state. For a busy state scoped to a button (the action is in flight), use the [Button](./button.md) `loading` prop instead — it keeps the control focusable and announces busy itself; do not drop a sibling `Spinner` next to a button to fake a busy state. `Spinner` carries no progress value — it is purely indeterminate.

## Key props

- `size?: 'small' | 'medium' | 'large'` — sets width/height; the union is `keyof typeof sizeMap`. `dist/Spinner/Spinner.d.ts:3-7,10`
- `srText?: string | null` — text conveyed to assistive technologies. Set to `null` when the loading state is already announced by a text node elsewhere on the page, to avoid a duplicate announcement. `dist/Spinner/Spinner.d.ts:11-12`
- `'aria-label'?: string` — **DEPRECATED**, use `srText`. `dist/Spinner/Spinner.d.ts:13-14`
- `delay?: boolean | 'short' | 'long' | number` — whether and how long to delay rendering. `true` / `'long'` delay 1000ms, `'short'` delays 300ms, a number is custom milliseconds. `dist/Spinner/Spinner.d.ts:17-18`
- `className?: string`. `dist/Spinner/Spinner.d.ts:15`
- `style?: React.CSSProperties`. `dist/Spinner/Spinner.d.ts:16`
- Native passthrough: `HTMLDataAttributes` (`data-*` attributes only — NOT the full SVG prop surface). `dist/Spinner/Spinner.d.ts:2,19`

## Accessibility

- The default `size` is `'medium'` when `size` is omitted. `dist/Spinner/Spinner.js:53`
- The default `srText` is `'Loading'` when `srText` is omitted — so an unconfigured Spinner already announces "Loading" to screen readers. `dist/Spinner/Spinner.js:54`
- The rendered `<svg>` is always `aria-hidden`; the announcement is carried by a separate `VisuallyHidden` text node, not by an `aria-label` on the SVG. `dist/Spinner/Spinner.js:159,179-182`
- When `srText` is non-null AND no (deprecated) `aria-label` is passed, the SVG is linked to the hidden text via `aria-labelledby`. Passing `srText={null}` suppresses both the hidden node and the link — use it ONLY when another visible text node already announces the loading state. `dist/Spinner/Spinner.js:58,118,178-182`
- The component honors `prefers-reduced-motion`: the spin animation only runs when no-preference is matched. `dist/Spinner/Spinner.js:56,104-108`

## Best Practices

- Use `srText`, NOT the deprecated `aria-label`. `dist/Spinner/Spinner.d.ts:13-14`
- Set `srText={null}` only when the loading state is announced by a text node elsewhere — otherwise leave the default `'Loading'` so the state is announced. Do not pass `srText=""` to silence it; pass `null`. `dist/Spinner/Spinner.d.ts:11-12`
- `size` accepts `'small' | 'medium' | 'large'` only — no numeric size, no `'xlarge'`. `dist/Spinner/Spinner.d.ts:3-7`
- For a button busy state, use the [Button](./button.md) `loading` prop, not a sibling `Spinner` — the Button keeps focus and announces busy itself. Button's `loading` is button-scoped; `Spinner` is the standalone region-level indicator.
- Use `delay` to avoid a flash on fast loads — a Spinner that mounts and unmounts within a few hundred ms is visual noise; `delay` returns `null` until the timer fires. `dist/Spinner/Spinner.d.ts:17-18`, `dist/Spinner/Spinner.js:100-102`

## Composition examples

```tsx
import { Spinner } from '@primer/react'

// Region-level loading state with the default "Loading" announcement.
export function LoadingPanel({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (isLoading) {
    return <Spinner size="large" srText="Loading results" />
  }
  return <>{children}</>
}

// Spinner beside its own visible text — suppress the duplicate SR announcement.
export function InlineLoading() {
  return (
    <span>
      <Spinner size="small" srText={null} /> Loading…
    </span>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Spinner/Spinner.d.ts:1-25` — `SpinnerProps`
- `node_modules/@primer/react/dist/Spinner/Spinner.js:53-55` — defaults (`size='medium'`, `srText='Loading'`, `delay=false`)
- `node_modules/@primer/react/dist/Spinner/Spinner.js:58,118,159,178-182` — `aria-hidden` SVG + `VisuallyHidden`/`aria-labelledby` announcement
- Upstream: `primer/react@main:packages/react/src/Spinner/Spinner.tsx`

## Common mistakes

- `<Spinner aria-label="Loading" />` — deprecated; use `srText` instead.
- `<Spinner size={32} />` — `size` is `'small' | 'medium' | 'large'`, not a number.
- `<Spinner srText="" />` to silence the announcement — pass `srText={null}`, not an empty string.
- Dropping a `Spinner` next to a button for a busy state — use the [Button](./button.md) `loading` prop.
- `<Spinner style={{ color: 'red' }} onClick={...} />` expecting full SVG passthrough — only `data-*` (`HTMLDataAttributes`) and `className` / `style` are typed; arbitrary SVG/DOM props are not on `SpinnerProps`.

## Things to never invent

- Props not listed under "Key props".
- `size` values outside `'small' | 'medium' | 'large'` (no numeric size).
- A progress / determinate API — `Spinner` is indeterminate only; it has no `value` or `percent` prop.
- A `loading` or `disabled` prop — those are button-scoped; see [Button](./button.md).
