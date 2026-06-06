---
title: ActionMenu
description: Trigger-anchored popover. Controlled `open` + `onOpenChange` are a required pair. Wraps an [ActionList](./action-list.md) for items.
---

## Public imports

```ts
import { ActionMenu } from "@/ds/components/ActionMenu";
import { ActionList } from "@/ds/components/ActionList";
```

Compound subcomponents: `ActionMenu.Button`, `ActionMenu.Anchor`, `ActionMenu.Overlay`.

## When to use

Use `ActionMenu` for trigger-anchored action popovers — kebab menus on a table row, "More" overflow on a header, contextual actions on a card. For selectable navigation use `ActionList` directly without the menu trigger. For multi-step picker UIs use [SelectPanel](./select-panel.md).

## Key props

- `open?: boolean` — controlled visibility. If passed, `onOpenChange` MUST also be wired. (ds/components/ActionMenu.tsx:14-15, ActionMenu.docs.tsx:3-8)
- `onOpenChange?: (open: boolean) => void` — required pair to controlled `open`. (ds/components/ActionMenu.docs.tsx:3-8)
- `anchorRef?: RefObject<HTMLElement>` — for advanced trigger composition. Usually unnecessary because `ActionMenu.Button` / `ActionMenu.Anchor` handle ref wiring.
- `ActionMenu.Button` — default trigger. Renders a styled button with built-in ARIA wiring. (ds/components/ActionMenu.docs.tsx:16-19)
- `ActionMenu.Anchor` — wraps a custom trigger element (icon-only button, a submenu trigger inside another `ActionList`). Use only when `ActionMenu.Button` does not fit. (ds/components/ActionMenu.docs.tsx:16-19)
- `ActionMenu.Overlay` — the popover container. Children are typically a single `<ActionList>`. Accepts `width: "auto" | "small" | "medium" | "large" | "xlarge" | "xxlarge"`.

## Best Practices

### When to use

- Use for trigger-anchored action popovers. For an always-visible list of actions, use `ActionList` directly. For filterable picker UIs use [SelectPanel](./select-panel.md).

### Behavior

- Controlled-state pairing: if `open` is passed, `onOpenChange` MUST also be wired. Passing `open` without `onOpenChange` leaves the menu unable to close (the user clicks outside and nothing happens); passing `onOpenChange` without `open` falls back to uncontrolled and the handler never fires. The types do NOT enforce the pairing. (ds/components/ActionMenu.docs.tsx:3-8)
- For trigger composition prefer `ActionMenu.Button` (default, styled, ARIA wired). Reach for `ActionMenu.Anchor` only when the trigger must be a custom element. (ds/components/ActionMenu.docs.tsx:16-19)
- `ActionMenu.Overlay` takes an [ActionList](./action-list.md) as its child for the items. Destructive items use `<ActionList.Item variant="danger">` — never a custom red className. (ds/components/ActionMenu.docs.tsx:10-15)

### Accessibility

- The announced role for menu items is `menuitem`. Do NOT override to `menuitemcheckbox` unless the item is actually a toggle. (ds/components/ActionMenu.docs.tsx:13-15)
- `ActionMenu.Button` and `ActionMenu.Anchor` wire `aria-haspopup` and `aria-expanded` automatically — do not duplicate these attrs on the trigger.

## Composition examples

```tsx
import { useState } from "react";
import { ActionMenu } from "@/ds/components/ActionMenu";
import { ActionList } from "@/ds/components/ActionList";

export function RowActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionMenu open={open} onOpenChange={setOpen}>
      <ActionMenu.Button>Open menu</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          <ActionList.Item onSelect={() => setOpen(false)}>Pin</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Lock</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Transfer</ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item
            variant="danger"
            onSelect={() => setOpen(false)}
          >
            Delete
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
```

## Source references

- `ds/components/ActionMenu.tsx:17` — wrapper (re-export of `@primer/react` `ActionMenu`).
- `ds/components/ActionMenu.docs.tsx:3-19` — controlled-pairing, composition, and trigger-choice rules.
- `node_modules/@primer/react/dist/ActionMenu/ActionMenu.d.ts` — type definitions for `Button`, `Anchor`, `Overlay`.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| `<ActionMenu open={open}>` with no `onOpenChange` | Always pair: `<ActionMenu open={open} onOpenChange={setOpen}>` | The menu opens but cannot close. User clicks outside; nothing happens because nothing sets `open` back to `false`. |
| `<ActionMenu.Anchor>` wrapping a default `<button>Open</button>` | `<ActionMenu.Button>Open</ActionMenu.Button>` | `Anchor` is for custom triggers. The default button is styled and ARIA-wired. |
| `<ActionList.Item className="text-red-600">Delete</ActionList.Item>` | `<ActionList.Item variant="danger">Delete</ActionList.Item>` | className paints red but skips destructive role wiring. The variant carries the semantics. |
| `<ActionMenu.Overlay>` with raw `<button>` children instead of `<ActionList>` | Always wrap items in `<ActionList>` inside `<ActionMenu.Overlay>` | Without `ActionList`, items lose roving-tabindex keyboard nav and `menuitem` role. |

## Things to never invent

- `<ActionMenu trigger="...">` — there is no `trigger` prop. The trigger is a child: `ActionMenu.Button` or `ActionMenu.Anchor`.
- `ActionMenu.Item` — items live in [ActionList](./action-list.md), not on the menu itself.
- `placement` / `side` props beyond the typed surface — confirm in the d.ts before wiring.
