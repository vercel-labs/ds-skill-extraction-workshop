---
title: RelativeTime
description: Auto-updating, localized timestamp — renders a `<relative-time>` custom element that formats a date relative to now ("3 hours ago") or as an absolute/duration string, refreshing on the client
---

## Public imports

```tsx
import { RelativeTime } from '@primer/react'
```

## When to use

Use `RelativeTime` to display a timestamp that should read relative to the present ("opened 3 days ago", "in 2 hours") or as a localized absolute date. It is a thin React wrapper around GitHub's `@github/relative-time-element` custom element — the wrapper forwards its props to the element, which does the formatting and self-updates in the browser. For a static, non-updating label or a count badge, use [Text](./text.md) or [CounterLabel](./counter-label.md) instead; RelativeTime exists specifically for time values that benefit from relative phrasing or client-side refresh.

## Key props

RelativeTime destructures `{ date, datetime, children, noTitle, ...props }` and spreads the rest onto the underlying `<relative-time>` element, so its prop surface is the element's public properties (`RelativeTimeProps = ComponentProps<typeof RelativeTimeComponent>`, where `RelativeTimeComponent` is a `ReactWebComponent<RelativeTimeElement, {}>`). `node_modules/@primer/react/dist/RelativeTime/RelativeTime.d.ts:3-5`

- `date?: Date | null` — the time value as a `Date` object. `dist/RelativeTime/RelativeTime.d.ts:4` (forwarded to the element's `date` property: `relative-time-element.d.ts:57-58`)
- `datetime?: string` — the time value as an ISO 8601 string; the standard way to pass a serializable timestamp. `dist/RelativeTime/RelativeTime.d.ts:4` (forwarded to the element's `datetime` property: `relative-time-element.d.ts:55-56`)
- `noTitle?: boolean` — when set, suppresses the auto-generated `title` attribute (the absolute-date tooltip the element otherwise adds). `dist/RelativeTime/RelativeTime.d.ts:4` (element property: `relative-time-element.d.ts:53-54`)
- `tense?: 'auto' | 'past' | 'future'` — force relative phrasing direction; `auto` picks past/future from the date. `relative-time-element.d.ts:45-46` (`Tense`: `relative-time-element.d.ts:10`)
- `format?: 'auto' | 'micro' | 'elapsed' | 'duration' | 'relative' | 'datetime'` — formatting mode. `auto`/`micro`/`elapsed` are the `DeprecatedFormat` members; `duration`/`relative`/`datetime` are the `ResolvedFormat` members. `relative-time-element.d.ts:49-50` (`Format` = `DeprecatedFormat | ResolvedFormat`: `relative-time-element.d.ts:6-8`)
- `formatStyle?: 'long' | 'short' | 'narrow'` — length of the formatted unit text. `relative-time-element.d.ts:51-52` (`FormatStyle`: `relative-time-element.d.ts:9`)
- `precision?: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'` — the smallest unit the formatter will resolve to. `relative-time-element.d.ts:47-48` (`Unit`: `duration.d.ts:2-3`)
- `threshold?: string` — duration string past which the element switches from relative to absolute display. `relative-time-element.d.ts:43-44`
- `prefix?: string` — text rendered before the formatted time (e.g. `"on"`). `relative-time-element.d.ts:41-42`
- `tense`, `format`, `precision`, `threshold`, `prefix` above are all forwarded via `...props`. `dist/RelativeTime/RelativeTime.d.ts:4`
- `Intl.DateTimeFormatOptions` part fields — the element implements `Intl.DateTimeFormatOptions`, exposing `weekday`, `year`, `month`, `day`, `hour`, `minute`, `second`, `timeZoneName` as individual props (each a string-literal union, e.g. `month?: 'numeric' | '2-digit' | 'short' | 'long' | 'narrow'`). `relative-time-element.d.ts:18`, `relative-time-element.d.ts:25-40`
- `children` — fallback content rendered inside the element (a server-rendered or no-JS textual timestamp). `dist/RelativeTime/RelativeTime.d.ts:4`

## Accessibility

- The element manages a `title` attribute carrying the absolute date so hovering reveals the exact timestamp; `noTitle` removes it. `relative-time-element.d.ts:53-54` Keep the title (do not set `noTitle`) when the relative phrasing alone would be ambiguous to a user who needs the precise time.
- Provide a `children` fallback (a plain formatted timestamp) so assistive tech and no-JS clients still read a time before the element upgrades. `dist/RelativeTime/RelativeTime.d.ts:4`

## Best Practices

- Pass the time value through `datetime` (ISO string) for serializable, SSR-safe markup, or `date` (a `Date`) when you already hold a Date object — do not invent a `value`/`time` prop. `dist/RelativeTime/RelativeTime.d.ts:4`, `relative-time-element.d.ts:55-58`
- The element formats and refreshes on the CLIENT — its `connectedCallback`/`update` run in the browser, and it self-updates as time passes. Render a `children` fallback so the first paint (server HTML, pre-hydration) shows a sensible timestamp instead of an empty element; the relative phrasing resolves once the custom element upgrades. `relative-time-element.d.ts:59-62`, `dist/RelativeTime/RelativeTime.d.ts:4`
- Use `tense` only to force a direction the date alone would not imply; leave it at the default `auto` otherwise. `relative-time-element.d.ts:45-46`
- Prefer the `ResolvedFormat` members (`relative`, `duration`, `datetime`) over the `DeprecatedFormat` members (`auto`, `micro`, `elapsed`) when choosing `format` explicitly. `relative-time-element.d.ts:6-8`
- `threshold` is a duration STRING (e.g. an ISO 8601 duration), not a number of milliseconds. `relative-time-element.d.ts:43-44`

## Composition examples

```tsx
import { RelativeTime } from '@primer/react'

export function CommitTime({ committedAt }: { committedAt: string }) {
  // `datetime` is the ISO string; the text node is the SSR / no-JS fallback,
  // replaced by the self-updating relative phrasing once the element upgrades.
  return (
    <RelativeTime datetime={committedAt} tense="past">
      {new Date(committedAt).toLocaleString()}
    </RelativeTime>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/RelativeTime/RelativeTime.d.ts:1-6` — `RelativeTime` wrapper and `RelativeTimeProps`
- `node_modules/@primer/react/dist/utils/types/ComponentProps.d.ts:8` — `ComponentProps<T>` (derives the prop surface from the wrapped element)
- `node_modules/.pnpm/node_modules/@github/relative-time-element/dist/relative-time-element.d.ts:6-62` — `RelativeTimeElement` properties (forwarded attrs), `Format`, `FormatStyle`, `Tense`
- `node_modules/.pnpm/node_modules/@github/relative-time-element/dist/duration.d.ts:2-3` — `Unit` (the `precision` union)
- Upstream: `primer/react@main:packages/react/src/RelativeTime/RelativeTime.tsx`; `github/relative-time-element@main:src/relative-time-element.ts`

## Common mistakes

- `<RelativeTime value={date} />` — there is no `value` prop; use `date` (a `Date`) or `datetime` (an ISO string). `dist/RelativeTime/RelativeTime.d.ts:4`
- `<RelativeTime threshold={86400000} />` — `threshold` is a duration STRING, not a millisecond number. `relative-time-element.d.ts:43-44`
- `<RelativeTime tense="present" />` — `tense` is `'auto' | 'past' | 'future'` only; there is no `'present'`. `relative-time-element.d.ts:10`
- Rendering with no `children` and expecting content before hydration — the element formats on the client; without a fallback the pre-upgrade paint is empty. `relative-time-element.d.ts:59-62`

## Things to never invent

- Props not listed under "Key props".
- `format`/`tense`/`formatStyle`/`precision` values outside the unions cited above (`Format`, `Tense`, `FormatStyle`, `Unit`).
- A `value`, `time`, `relative`, or `locale` prop — none are declared in the d.ts.
- A numeric `threshold` — the declared type is `string`.
