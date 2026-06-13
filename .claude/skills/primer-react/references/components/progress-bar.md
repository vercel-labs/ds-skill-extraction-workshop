---
title: ProgressBar
description: Horizontal progress indicator — single-fill or multi-segment via `ProgressBar.Item`, with `small`/`default`/`large` bar sizes
---

## Public imports

```tsx
import { ProgressBar } from '@primer/react'
```

`ProgressBar.Item` is the multi-segment child (exported as `Item`, attached to `ProgressBar` and given `displayName` `'ProgressBar.Item'`). `dist/ProgressBar/ProgressBar.d.ts:16`

## When to use

Use `ProgressBar` to show determinate completion of a single task (upload, install, quota fill). Pass a single `progress` value for the common one-fill case, or compose multiple `ProgressBar.Item` children when one bar represents several proportional categories (e.g. languages in a repo, storage by type). For a numeric count next to a label, use [CounterLabel](./counter-label.md), not a bar. For a lifecycle/status pill, use [StateLabel](./state-label.md). For an inline message surface, use [Flash](./flash.md).

## Key props

### `ProgressBar`

- `progress?: string | number` — fill percentage for the single-segment case (0–100). `dist/ProgressBar/ProgressBar.d.ts:4` (via `ProgressProp`, spread at `:23`)
- `bg?: string` — fill color as a Primer token path (e.g. `'success.emphasis'`, `'accent.emphasis'`), resolved to `var(--bgColor-<area>-<role>)`. Defaults to `'success.emphasis'`. `dist/ProgressBar/ProgressBar.d.ts:21` (default: `ProgressBar.js:188`)
- `barSize?: 'small' | 'default' | 'large'` — track height. Defaults to `'default'`. `dist/ProgressBar/ProgressBar.d.ts:9` (via `StyledProgressContainerProps`; default: `ProgressBar.js:189`)
- `inline?: boolean` — render the container inline (`data-progress-display="inline"`) rather than block. `dist/ProgressBar/ProgressBar.d.ts:8` (rendered: `ProgressBar.js:206`)
- `animated?: boolean` — forwarded to the auto-generated single `Item` as `data-animated` for a fill animation. Only applies in the single-segment (`progress`) path. `dist/ProgressBar/ProgressBar.d.ts:10` (forwarded: `ProgressBar.js:213`)
- `className?: string`. `dist/ProgressBar/ProgressBar.d.ts:22`
- Native passthrough: `HTMLAttributes<HTMLSpanElement>` (renders a `<span>`). `dist/ProgressBar/ProgressBar.d.ts:20`

### `ProgressBar.Item`

- `progress?: string | number` — this segment's share of the track (0–100). `dist/ProgressBar/ProgressBar.d.ts:15` (via `ProgressProp`)
- `bg?: string` — segment color as a Primer token path; defaults to `success.emphasis` when unset. `dist/ProgressBar/ProgressBar.d.ts:5` (resolution + fallback: `ProgressBar.js:89`)
- `aria-label?: string` — accessible name for the individual segment. `dist/ProgressBar/ProgressBar.d.ts:13`
- `className?: string`. `dist/ProgressBar/ProgressBar.d.ts:14`
- Native passthrough: `HTMLAttributes<HTMLSpanElement>` (renders a `<span role="progressbar">`). `dist/ProgressBar/ProgressBar.d.ts:12`

## Accessibility

- Each rendered segment is a `<span role="progressbar">` with `aria-valuemin={0}` and `aria-valuemax={100}` set automatically; `aria-valuenow` is derived from `progress` (`Math.round`, clamped to 0 when negative/undefined) unless you pass `aria-valuenow` explicitly. `ProgressBar.js:116-122` (Item: `ProgressBar.js:64-77`)
- Provide an `aria-label` (or `aria-valuetext`) so screen readers announce what the bar measures — the percentage alone is not self-describing. `aria-label`/`aria-valuetext` flow through to the segment. `dist/ProgressBar/ProgressBar.d.ts:13` (Item passthrough: `ProgressBar.js:118-121`)
- In the multi-segment case, label each `ProgressBar.Item` individually — the container does not synthesize a combined label.

## Best Practices

- Pass `progress` **or** `ProgressBar.Item` children, never both — the component throws `"You should pass `progress` or children, not both."` at render. `ProgressBar.js:190-192`
- Set `bg` to a Primer semantic token path (`'success.emphasis'`, `'accent.emphasis'`, `'danger.emphasis'`), never a hardcoded hex — the value is split on `.` and rebuilt as `var(--bgColor-<area>-<role>)`, so a raw color silently breaks the CSS-variable lookup. `ProgressBar.js:89`
- `barSize` accepts only `'small' | 'default' | 'large'` — no numeric/pixel sizes. `dist/ProgressBar/ProgressBar.d.ts:9`
- `animated` only animates the single-segment (`progress`) render path; it is forwarded as `data-animated` to the auto-generated `Item` and has no effect when you supply your own `ProgressBar.Item` children. `ProgressBar.js:213`
- Width comes from the `--progress-width` CSS variable derived from `progress` (`"0%"` when unset) — drive the bar through `progress`, not by styling width directly. `ProgressBar.js:88`

## Composition examples

Single-fill upload bar:

```tsx
import { ProgressBar } from '@primer/react'

export function UploadBar({ percent }: { percent: number }) {
  return <ProgressBar progress={percent} aria-label="Upload progress" />
}
```

Multi-segment breakdown (e.g. repo languages):

```tsx
import { ProgressBar } from '@primer/react'

export function LanguageBar() {
  return (
    <ProgressBar>
      <ProgressBar.Item progress={60} bg="success.emphasis" aria-label="TypeScript 60%" />
      <ProgressBar.Item progress={30} bg="accent.emphasis" aria-label="CSS 30%" />
      <ProgressBar.Item progress={10} bg="done.emphasis" aria-label="Shell 10%" />
    </ProgressBar>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/ProgressBar/ProgressBar.d.ts:1-28` — `ProgressBarProps`, `ProgressBarItemProps`, `ProgressProp`, `StyledProgressContainerProps`
- `node_modules/@primer/react/dist/ProgressBar/ProgressBar.js:188-192` — `bg`/`barSize` defaults and the both-props guard
- `node_modules/@primer/react/dist/ProgressBar/ProgressBar.js:64-122` — `Item` ARIA derivation and token-to-CSS-variable resolution
- Upstream: `primer/react@main:packages/react/src/ProgressBar/ProgressBar.tsx`

## Common mistakes

- `<ProgressBar progress={50}><ProgressBar.Item .../></ProgressBar>` — passing both `progress` and children throws at render; pick one shape.
- `<ProgressBar bg="#2da44e" />` — a hex value breaks the `var(--bgColor-...)` lookup; pass a token path like `bg="success.emphasis"`.
- `<ProgressBar barSize={8} />` — `barSize` is a `'small' | 'default' | 'large'` union, not a pixel value.
- Rendering a bar with no `aria-label`/`aria-valuetext` — the `progressbar` role has no accessible name.

## Things to never invent

- Props not listed under "Key props".
- `barSize` values outside `'small' | 'default' | 'large'`.
- A `variant` or `color` prop — color is set via the token-path `bg` only.
- A `max`/`min`/`value` prop — completion is driven by `progress` (0–100); `aria-valuemin`/`aria-valuemax` are fixed at 0/100 internally.
