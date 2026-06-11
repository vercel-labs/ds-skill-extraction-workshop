---
title: Label
description: Small metadata badge with a ten-value color variant enum; for metadata only, never lifecycle state.
---

# Label

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Label } from '@primer/react'`

## When to use

Use Label for METADATA — visibility (`Public`/`Private`), category tags, time-range chips. For issue/PR LIFECYCLE states (open, merged, closed, draft) use [StateLabel](./state-label.md) — its required `status` is keyed to the lifecycle octicon map, and building a lifecycle capsule out of Label drops the state icon and the lifecycle color semantics (primer/react @ main: packages/react/src/StateLabel/StateLabel.tsx:71). For numeric counts use [CounterLabel](./counter-label.md).

## Key props

- `variant` — `'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'sponsors'` (node_modules/@primer/react/dist/Label/Label.d.ts:4,8)
- `size` — `'small' | 'large'` (Label.d.ts:6,9)

## Best Practices

- StateLabel for open/merged/closed lifecycle states, Label for metadata — never build a lifecycle capsule out of Label (StateLabel.tsx:71; see [StateLabel](./state-label.md)).
- Map data to variants through a typed record (`Record<Visibility, LabelProps["variant"]>`) rather than inline conditionals — lifted from the repos exemplar (`references/examples/repos.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx:

```tsx
import { Label, type LabelProps } from "@primer/react";

const VISIBILITY_VARIANT: Record<Visibility, LabelProps["variant"]> = {
  Public: "success",
  Private: "attention",
};

<Label variant={VISIBILITY_VARIANT[row.visibility]}>{row.visibility}</Label>
```

## Source references

- `node_modules/@primer/react/dist/Label/Label.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Label/Label.docs.json` + `Label.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Label variant="open">` | `<StateLabel status="issueOpened">Open</StateLabel>` | lifecycle is StateLabel's job; `open` is not a Label variant (Label.d.ts:8) |
| `<Label variant="green">` | `<Label variant="success">` | variants are semantic names, not colors (Label.d.ts:8) |
| `<Label size="medium">` | `<Label size="small">` or `"large"` | size enum is two values (Label.d.ts:9) |

## Things to never invent

- Props not listed under "Key props".
- `variant` values outside the ten-value enum — there is no `open`, `merged`, `info`, or raw color name.
- `size` values outside `'small' | 'large'`.
- Sibling components not present in the in-scope set.
