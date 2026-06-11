---
title: StateLabel
description: Lifecycle state capsule; required status is keyed to the lifecycle octicon map — for open/merged/closed states, never metadata.
---

# StateLabel

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { StateLabel } from '@primer/react'`

## When to use

Use StateLabel for issue/PR LIFECYCLE states — the Open→Merged→Closed capsule. Its required `status` is keyed to the lifecycle octicon map, so each state ships the right octicon and color together (primer/react @ main: packages/react/src/StateLabel/StateLabel.tsx:71). For METADATA (visibility, categories, tags) use [Label](./label.md) — never build a lifecycle capsule out of Label, and never fake a lifecycle state with Label's `variant` enum.

## Key props

- `status` — REQUIRED; keyed to the octicon map: `'issueOpened' | 'pullOpened' | 'issueClosed' | 'issueClosedNotPlanned' | 'pullClosed' | 'pullMerged' | 'draft' | 'issueDraft' | 'pullQueued' | 'unavailable' | 'alertOpened' | 'alertFixed' | 'alertDismissed' | 'alertClosed' | 'open' | 'closed' | 'archived'` (node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts:2-20,25)
- `size` — `'small' | 'medium'` (StateLabel.d.ts:22)
- `variant` — DEPRECATED: "use size property with value 'small' or 'medium' instead" (StateLabel.d.ts:23-24)
- children — the visible state text, e.g. `Open`, `Merged` (StateLabel.d.ts:21)

## Best Practices

- StateLabel for open/merged/closed lifecycle states, [Label](./label.md) for metadata — the `status` enum carries the octicon + color pairing that Label cannot reproduce (StateLabel.tsx:71).
- The merged state is `status="pullMerged"`, not `"merged"` — the map's generic entries are only `open`, `closed`, and `archived`; PR/issue states are prefixed (StateLabel.d.ts:2-20).
- The generic `open`/`closed` statuses render NO octicon (their map values are `null`) — prefer the specific `issueOpened`/`pullOpened`/... statuses when the entity kind is known (StateLabel.d.ts:17-18).
- Use `size`, never the deprecated `variant` (StateLabel.d.ts:23-24).

## Composition examples

Lifted from primer/react @ main: packages/react/src/StateLabel/StateLabel.stories.tsx (Default story), plus the merged form verified against the published types:

```tsx
import { StateLabel } from "@primer/react";

<StateLabel status="issueOpened">Open</StateLabel>
<StateLabel status="pullMerged">Merged</StateLabel>
```

## Source references

- `node_modules/@primer/react/dist/StateLabel/StateLabel.d.ts` — published prop types + the full octicon map
- `primer/react` @ main: `packages/react/src/StateLabel/StateLabel.tsx:71` — status/octicon keying
- `primer/react` @ main: `packages/react/src/StateLabel/StateLabel.docs.json` + `StateLabel.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<StateLabel status="merged">` | `<StateLabel status="pullMerged">` | `merged` is not in the status map (StateLabel.d.ts:2-20) |
| `<Label variant="done">Merged</Label>` | `<StateLabel status="pullMerged">Merged</StateLabel>` | lifecycle capsules are StateLabel's contract; Label drops the octicon + state color (StateLabel.tsx:71) |
| `<StateLabel>` without `status` | always pass `status` | `status` is required, not optional (StateLabel.d.ts:25) |
| `variant="small"` | `size="small"` | `variant` is deprecated (StateLabel.d.ts:23-24) |

## Things to never invent

- Props not listed under "Key props".
- `status` values outside the seventeen-key octicon map — there is no `merged`, `openedIssue`, or free-text status.
- `size` values outside `'small' | 'medium'`.
- Sibling components not present in the in-scope set.
