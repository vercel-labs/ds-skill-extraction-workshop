---
title: Flash
description: Inline message banner for neutral/success/warning/danger context inside a form or card.
---

## Public imports

`import { Flash } from "@/ds/components/Flash"` (project wrapper) — equivalent to `import { Flash } from "@primer/react"`.

## When to use

Use `Flash` for a simple inline note inside a form or card — e.g. "You are creating this repository in your personal account." Reach for the experimental `Banner` only when you genuinely need a title + description + dismiss actions; for account-context callouts in this project, use `Flash`, not `Banner`.

## Key props

- `variant` — `'default' | 'success' | 'warning' | 'danger'`; `default` for neutral context. (`ds/components/Flash.docs.tsx:13`)

## Best Practices

- Do not substitute the experimental `Banner` for a simple inline message — `Banner` is reserved for title + description + dismiss surfaces; `Flash` is the right choice for an inline account-context note here. (`ds/components/Flash.docs.tsx:5`) `component/flash-not-banner`

## Composition examples

```tsx
import { Flash } from "@/ds/components/Flash";

export function AccountContextNote() {
  return (
    <Flash variant="default">
      You are creating this repository in your personal account.
    </Flash>
  );
}
```

## Source references

- `ds/components/Flash.tsx:11` — wrapper re-export
- `ds/components/Flash.docs.tsx:1-17` — annotated Flash-not-Banner rule
- `@primer/react@38.26.0` — `Flash` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Reaching for experimental `Banner` for a one-line note → use `Flash variant="default"`.

## Things to never invent

- Variants beyond `default | success | warning | danger`.
- A `dismissible` / title API on `Flash` — that is `Banner` territory.
