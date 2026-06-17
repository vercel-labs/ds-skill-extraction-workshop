---
title: StateLabel
description: PR/issue lifecycle pill — required `status` keyed to the lifecycle octicon map; never substitute Label
---

## Public imports

```tsx
import { StateLabel } from '@primer/react'
```

## When to use

Pick `StateLabel` for PR/issue **lifecycle** state — open, closed, merged, draft, archived, alert states. The required `status` prop is keyed to a fixed lifecycle octicon map, so the rendered icon and color are guaranteed to match the lifecycle semantic. For METADATA badges (topic tags, severity, "private" / "fork" annotations), use [Label](./label.md). NEVER build a lifecycle capsule out of `Label` — Primer's semantic distinction is: StateLabel for lifecycle, Label for metadata.

## Key props

- `status: keyof typeof octiconMap` — REQUIRED. The lifecycle key picks the icon and color. Members: `'issueOpened' | 'pullOpened' | 'issueClosed' | 'issueClosedNotPlanned' | 'pullClosed' | 'pullMerged' | 'draft' | 'issueDraft' | 'pullQueued' | 'unavailable' | 'alertOpened' | 'alertFixed' | 'alertDismissed' | 'alertClosed' | 'open' | 'closed' | 'archived'`. `node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts:2-21,25`
- `size?: 'small' | 'medium'` — no prop default; falls back to `'medium'` unless `variant` is the (deprecated) `'small'`. `node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts:22` `node_modules/@primer/react/dist/StateLabel/StateLabel.js:80`
- `variant?: 'normal' | 'small'` — **DEPRECATED**, use `size`. `dist/StateLabel/StateLabel.d.ts:23-24`
- Native passthrough: `React.HTMLAttributes<HTMLSpanElement>`. `dist/StateLabel/StateLabel.d.ts:21`

## Accessibility

- The status icon is decorative; the surrounding text (children) carries the meaning. SRs read the text node, so write a meaningful child string (e.g. `<StateLabel status="pullMerged">Merged</StateLabel>`).

## Best Practices

- **StateLabel is for lifecycle states (PRs, issues, alerts).** Use [Label](./label.md) for METADATA (topic tags, severity, contributor types). Never build a lifecycle capsule from Label — the d.ts contract for StateLabel guarantees the lifecycle-octicon pairing; Label has no such guarantee. `dist/StateLabel/StateLabel.d.ts:2-21` + upstream `packages/react/src/StateLabel/StateLabel.tsx:71`.
- `status` is REQUIRED — the type makes it non-optional. `dist/StateLabel/StateLabel.d.ts:25`
- Use `size`, NOT the deprecated `variant`. `dist/StateLabel/StateLabel.d.ts:23-24`
- The status union is the literal `keyof typeof octiconMap` from the source — do NOT pass `'merged'` (the merged-PR key is `'pullMerged'`). `dist/StateLabel/StateLabel.d.ts:2-21`
- `size` accepts `'small' | 'medium'` only — there is NO `'large'`. `node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts:22`

## Composition examples

```tsx
import { StateLabel } from '@primer/react'

export function PullRequestState({ state }: {
  state: 'open' | 'merged' | 'closed' | 'draft'
}) {
  const status = (
    {
      open: 'pullOpened',
      merged: 'pullMerged',
      closed: 'pullClosed',
      draft: 'draft',
    } as const
  )[state]
  const label =
    state === 'merged' ? 'Merged' : state.charAt(0).toUpperCase() + state.slice(1)
  return <StateLabel status={status}>{label}</StateLabel>
}
```

## Source references

- `node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts:1-34` — `StateLabelProps`, `octiconMap`
- Upstream: `primer/react@main:packages/react/src/StateLabel/StateLabel.tsx:71` — `octiconMap` and the lifecycle-status contract

## Common mistakes

- `<StateLabel status="merged">` — not a `keyof typeof octiconMap`. Use `status="pullMerged"`.
- `<Label variant="success">Merged</Label>` — wrong tier; lifecycle states belong on StateLabel.
- `<StateLabel variant="small">` — deprecated; use `size="small"`.
- `<StateLabel size="large">` — not a union member; values are `'small' | 'medium'`.

## Things to never invent

- Props not listed under "Key props".
- `status` values outside `keyof typeof octiconMap`.
- A `size="large"` — does not exist.
- Building a lifecycle pill from `Label` — the lifecycle/metadata distinction is load-bearing.
