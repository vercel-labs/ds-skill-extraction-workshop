---
title: Label
description: Small metadata badge with a 10-value color variant scale; metadata only — never a lifecycle capsule
---

## Public imports

```tsx
import { Label } from '@primer/react'
```

## When to use

Pick `Label` for METADATA — topic tags, language indicators, "private" / "fork" / "template" annotations, severity tags, contributor types. For PR/issue **lifecycle** state (open/merged/closed), use [StateLabel](./state-label.md) — NEVER build a lifecycle capsule out of `Label`. The d.ts contract enforces the distinction: Label's `variant` covers severity/topic colors; StateLabel's required `status` is keyed to the lifecycle octicon map.

## Key props

- `variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'sponsors'` — color scheme; default `'default'`. `node_modules/@primer/react/dist/Label/Label.d.ts:4,8` `node_modules/@primer/react/dist/Label/Label.js:37`
- `size?: 'small' | 'large'` — default `'small'`. `node_modules/@primer/react/dist/Label/Label.d.ts:9` `node_modules/@primer/react/dist/Label/Label.js:36`
- Polymorphic on `<span>` (forward ref). `node_modules/@primer/react/dist/Label/Label.d.ts:10`

## Accessibility

- Label has no built-in role — it's a visual badge. If a label conveys state that ISN'T obvious from text, pair with an SR-only annotation.

## Best Practices

- **Lifecycle states (open, merged, closed, draft) belong on [StateLabel](./state-label.md), not Label.** Never build a lifecycle capsule out of `Label` — StateLabel's required `status` is keyed to the lifecycle octicon map (issueOpened, pullMerged, issueClosed, …); Label has no equivalent semantic guarantee. `dist/StateLabel/StateLabel.d.ts:2-21` + `packages/react/src/StateLabel/StateLabel.tsx:71` (upstream).
- The 10-value `variant` scale covers metadata-flavored color schemes (`accent` for topics, `success` for "ready", `attention` for "needs review", `danger` for "blocked", `done` for completed, `sponsors` for sponsor badges). `node_modules/@primer/react/dist/Label/Label.d.ts:8`
- There is no `variant="open"` or `variant="closed"` on Label. The lifecycle vocabulary lives on StateLabel. `node_modules/@primer/react/dist/Label/Label.d.ts:8`
- `size` accepts `'small' | 'large'` only — there is NO `'medium'`. `node_modules/@primer/react/dist/Label/Label.d.ts:9`

## Composition examples

```tsx
import { Label } from '@primer/react'

export function TopicChips({ topics }: { topics: string[] }) {
  return (
    <>
      {topics.map((topic) => (
        <Label key={topic} variant="accent">
          {topic}
        </Label>
      ))}
    </>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Label/Label.d.ts:1-11` — `LabelProps`, `LabelColorOptions`, `LabelSizeKeys`
- Upstream: `primer/react@main:packages/react/src/Label/Label.tsx`

## Common mistakes

- `<Label variant="open">PR #42</Label>` — `'open'` is not a Label variant. Use [StateLabel](./state-label.md) `status="issueOpened"` (or `pullOpened`) for lifecycle state.
- `<Label variant="merged">main → feature</Label>` — `'merged'` is not a Label variant. Use [StateLabel](./state-label.md) `status="pullMerged"`.
- `<Label size="medium">` — not a union member; values are `'small' | 'large'`.

## Things to never invent

- Props not listed under "Key props".
- Variant values outside the 10-member union.
- A `size="medium"` — does not exist.
- A `'lifecycle'` or `'state'` variant — that semantics lives on StateLabel.
