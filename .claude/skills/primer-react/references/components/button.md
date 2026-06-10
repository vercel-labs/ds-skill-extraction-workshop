---
title: Button
description: Text action trigger with filled/danger/invisible variants and leading/trailing icon slots.
---

## Public imports

`import { Button } from "@/ds/components/Button"` (project wrapper) — equivalent to `import { Button } from "@primer/react"`.

## When to use

Use `Button` for any action with a visible text label: form submits, primary page actions, cancel/secondary actions. For an action with no visible text (icon only), use [IconButton](./iconbutton.md) instead — it requires an `aria-label`. For a same-styled navigation that changes the URL, prefer a `Link` (from `@primer/react`).

## Key props

- `variant` — `'default' | 'primary' | 'danger' | 'invisible'`. `primary` for the one main action, `invisible` for low-emphasis (e.g. Cancel), `danger` for destructive. (`@primer/react@38.26.0` Button types; used at `references/examples/new.md`)
- `leadingVisual` / `trailingVisual` — an octicon **component** rendered before/after the label, e.g. `leadingVisual={PlusIcon}`. (used at `references/examples/repos.md`)
- `disabled` — boolean; disables the button and removes it from the tab order. (`ds/components/Button.docs.tsx:8`)
- `type` — `'button' | 'submit' | 'reset'`; set `type="submit"` for form submits. (`ds/components/Button.docs.tsx:20`)
- `size` — `'small' | 'medium' | 'large'`; default `medium`. (`@primer/react@38.26.0` Button types)

## Best Practices

- Never use `inactive` to express a loading/busy submit state — use `disabled={isSubmitting}`. `inactive` is visual-only; screen readers still announce the button as actionable and keyboard users can still activate it. (`ds/components/Button.docs.tsx:8`) `component/button-inactive-vs-disabled`
- Never pass `aria-label` to a `Button` that already renders visible text — the `aria-label` overrides the visible label and the accessible name silently drifts from the visual one. (`ds/components/Button.docs.tsx:4`) `component/button-no-aria-label-with-text`
- Pass the icon **component** to `leadingVisual` / `trailingVisual` (`leadingVisual={PlusIcon}`), never JSX (`leadingVisual={<PlusIcon />}`). (`ds/components/Button.docs.tsx:13`) `component/icon-prop-not-jsx`

## Composition examples

```tsx
import { Button } from "@/ds/components/Button";
import { PlusIcon } from "@primer/octicons-react";

export function CreateRepoButton() {
  return (
    <Button type="submit" variant="primary" leadingVisual={PlusIcon}>
      Create repository
    </Button>
  );
}
```

## Source references

- `ds/components/Button.tsx:11` — wrapper re-export
- `ds/components/Button.docs.tsx:1-24` — annotated rules (disabled/inactive, aria-label, icon-as-component)
- `@primer/react@38.26.0` — `Button` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Putting a spinner inside `children` and toggling `inactive` for loading → use `disabled` so focus and ARIA stay correct.
- Wrapping an octicon in JSX for `leadingVisual` → pass the component reference.

## Things to never invent

- Variants beyond `default | primary | danger | invisible`.
- A `loading` prop — Primer's `Button` has no `loading` prop; coordinate busy state with `disabled`.
- Props not listed under Key props or present in the `@primer/react` Button types.
