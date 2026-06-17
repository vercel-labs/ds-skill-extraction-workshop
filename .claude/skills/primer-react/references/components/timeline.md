---
title: Timeline
description: Vertical activity feed — compound component pairing a colored lifecycle Badge with Body/Break rows along a connecting rail
---

## Public imports

```tsx
import { Timeline } from '@primer/react'
```

`Timeline` is a compound component. The sub-components are accessed as static properties: `Timeline.Item`, `Timeline.Badge`, `Timeline.Body`, `Timeline.Break` (also `Timeline.Avatar` and `Timeline.Actions`). `node_modules/@primer/react/dist/Timeline/Timeline.d.ts:39-61`

## When to use

Pick `Timeline` for a vertical feed of chronological events along a connecting rail (commit history, issue/PR activity, audit log). Each event is a `Timeline.Item` carrying a colored `Timeline.Badge` on the rail plus a `Timeline.Body` of text. For a single lifecycle pill outside a feed (a PR/issue state capsule), use [StateLabel](./state-label.md) instead — `Timeline.Badge` carries lifecycle color but is positioned on the rail and is not a standalone capsule. For a non-numeric metadata badge, use [Label](./label.md); for a count, use [CounterLabel](./counter-label.md).

## Key props

### `Timeline`

- `clipSidebar?: boolean | 'start' | 'end' | 'both'` — trims the connecting rail at the first item (`'start'`), last item (`'end'`), or both (`true` / `'both'`). `dist/Timeline/Timeline.d.ts:3`
- `className?: string`. `dist/Timeline/Timeline.d.ts:4`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>` (renders a `<div>`). `dist/Timeline/Timeline.d.ts:6`

### `Timeline.Item`

- `condensed?: boolean` — tighter vertical rhythm for dense feeds; shrinks the badge and reduces padding. `dist/Timeline/Timeline.d.ts:8`
- `className?: string`. `dist/Timeline/Timeline.d.ts:9`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>` (renders a `<div>`). `dist/Timeline/Timeline.d.ts:15`
- Note: the `TimelineItemsProps` type alias is **DEPRECATED** — use `TimelineItemProps`. `dist/Timeline/Timeline.d.ts:11-15`

### `Timeline.Badge`

- `variant?: TimelineBadgeVariant` — the color variant of the badge; carries lifecycle color. Union: `'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'open' | 'closed' | 'sponsors'`. `dist/Timeline/Timeline.d.ts:16,20-21`
- `children?: React.ReactNode` — put an octicon here (the badge is a circular rail node sized for a single glyph). `dist/Timeline/Timeline.d.ts:18`
- `className?: string`. `dist/Timeline/Timeline.d.ts:19`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>` (renders a `<div>`). `dist/Timeline/Timeline.d.ts:22`
- Each `variant` maps to a Primer `bgColor-<variant>-emphasis` semantic token; foreground flips to `fgColor-onEmphasis` when any `variant` is set. With no `variant`, the badge is neutral (`timelineBadge-bgColor` / `fgColor-muted`). `dist/Timeline/Timeline-0c88f21b.css` (`[data-variant=...]` rules)

### `Timeline.Body`

- `className?: string`. `dist/Timeline/Timeline.d.ts:25`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>` (renders a `<div>`). `dist/Timeline/Timeline.d.ts:26`

### `Timeline.Break`

- `className?: string` — a visual break in the rail between groups of items (no other props). `dist/Timeline/Timeline.d.ts:29`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>` (renders a `<div>`). `dist/Timeline/Timeline.d.ts:30`

## Accessibility

- `Timeline` ships no `aria-*` attributes of its own (none in `dist/Timeline/Timeline.js`), so announced meaning comes entirely from the adjacent `Timeline.Body` text, which SRs read as ordinary inline content. Treat the `Timeline.Badge` octicon as decorative (give it `aria-hidden`) and write a meaningful `Timeline.Body`.
- Badge color alone never conveys lifecycle state — pair every colored `variant` with descriptive `Timeline.Body` text so the state is announced, not just shown.

## Best Practices

- Set `variant` from a Primer semantic lifecycle token; never hardcode a hex — each variant resolves to `bgColor-<variant>-emphasis`. `dist/Timeline/Timeline.d.ts:16` + `dist/Timeline/Timeline-0c88f21b.css`
- `variant` accepts only the nine union members (`'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'open' | 'closed' | 'sponsors'`) — there is no `'neutral'` / `'default'`; omit `variant` for the neutral badge. `dist/Timeline/Timeline.d.ts:16`
- Put octicons INSIDE `Timeline.Badge` (its `children`), not next to it — the badge is the circular rail node sized to hold one glyph. See the [octicons foundation](../foundations/octicons.md). `dist/Timeline/Timeline.d.ts:18`
- For a standalone PR/issue lifecycle capsule, reach for [StateLabel](./state-label.md), not a bare `Timeline.Badge` — the badge is positioned on the rail and only renders meaningfully inside a `Timeline.Item`.
- Apply `condensed` on `Timeline.Item` (not on `Timeline`) for dense feeds — it is an item-level prop. `dist/Timeline/Timeline.d.ts:8`
- Color via Primer semantic tokens only — never pass a literal color through `className`/`style`.

## Composition examples

```tsx
import { Timeline } from '@primer/react'
import { GitCommitIcon, GitMergeIcon } from '@primer/octicons-react'

export function PullRequestFeed() {
  return (
    <Timeline clipSidebar>
      <Timeline.Item>
        <Timeline.Badge>
          <GitCommitIcon aria-hidden />
        </Timeline.Badge>
        <Timeline.Body>Pushed 3 commits</Timeline.Body>
      </Timeline.Item>

      <Timeline.Break />

      <Timeline.Item>
        <Timeline.Badge variant="done">
          <GitMergeIcon aria-hidden />
        </Timeline.Badge>
        <Timeline.Body>Merged pull request into main</Timeline.Body>
      </Timeline.Item>
    </Timeline>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Timeline/Timeline.d.ts:1-62` — `TimelineProps`, `TimelineItemProps`, `TimelineBadgeVariant`, `TimelineBadgeProps`, `TimelineBodyProps`, `TimelineBreakProps`, and the compound default export
- `node_modules/@primer/react/dist/Timeline/Timeline.js` — implementation (`data-variant` / `data-condensed` / `data-clip-sidebar` attributes)
- `node_modules/@primer/react/dist/Timeline/Timeline-0c88f21b.css` — variant → `bgColor-<variant>-emphasis` token mapping
- Upstream: `primer/react@main:packages/react/src/Timeline/Timeline.tsx`

## Common mistakes

- `<Timeline.Badge variant="neutral">` — not a union member; omit `variant` for the neutral badge.
- `<Timeline.Badge variant="default">` — not a union member; the nine values are `'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'open' | 'closed' | 'sponsors'`.
- Placing an octicon as a sibling of `Timeline.Badge` instead of inside it — the glyph belongs in the badge's `children`.
- `<Timeline condensed>` — `condensed` is a `Timeline.Item` prop, not a `Timeline` prop.
- Hardcoding a hex on the badge instead of using a `variant` — the color must come from the semantic token the variant resolves to.

## Things to never invent

- Props not listed under "Key props" (e.g. `Timeline.Badge` has no `size`, `color`, or `icon` prop — the octicon goes in `children`).
- `variant` values outside the nine-member union.
- A `condensed` prop on `Timeline` or `Timeline.Badge` — it exists only on `Timeline.Item`.
- A `Timeline.Badge` standalone outside a `Timeline.Item` — use [StateLabel](./state-label.md) for a freestanding lifecycle pill.
