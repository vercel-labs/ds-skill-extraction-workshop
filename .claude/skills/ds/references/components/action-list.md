---
title: ActionList
description: Primitive list of selectable / actionable items. Inside [ActionMenu.Overlay](./action-menu.md) for menus; standalone for sidebars and pickers. Destructive items use `variant="danger"`.
---

## Public imports

```ts
import { ActionList } from "@/ds/components/ActionList";
```

Compound subcomponents: `ActionList.Item`, `ActionList.Group`, `ActionList.Divider`, `ActionList.LeadingVisual`, `ActionList.TrailingVisual`, `ActionList.Description`, `ActionList.Heading`, `ActionList.LinkItem`, `ActionList.TrailingAction`.

## When to use

Use `ActionList` for any vertical list of selectable or actionable rows: the items inside an [ActionMenu](./action-menu.md) overlay, a sidebar nav, a settings sub-page picker. For trigger-anchored popovers compose it INSIDE `ActionMenu.Overlay`. For filterable, multi-select pickers prefer [SelectPanel](./select-panel.md).

## Key props

- `ActionList.Item` — a clickable / selectable row. Accepts `variant: "default" | "danger"`. (ds/components/ActionList.tsx:13)
- `ActionList.Item` `variant="danger"` — destructive styling AND the destructive ARIA role. Use for delete / archive / revoke actions. (ds/components/ActionMenu.docs.tsx:10-15)
- `ActionList.Item` `onSelect: () => void` — fires on click / Enter / Space.
- `ActionList.Divider` — horizontal rule between groups.
- `ActionList.Group` — wraps related items; pairs with `ActionList.Heading` for an accessible group label.
- `ActionList.LeadingVisual` / `ActionList.TrailingVisual` — icon slots inside an item.
- `ActionList.LinkItem` — same as `Item` but renders an `<a>` for navigation.

## Best Practices

### When to use

- Inside [ActionMenu.Overlay](./action-menu.md) for menus.
- Standalone for sidebar navigation or settings sub-page pickers.
- For multi-select with filtering, use [SelectPanel](./select-panel.md) — `ActionList` does not own filter state.

### Behavior

- Destructive items use `<ActionList.Item variant="danger">` — never a custom red className. The variant carries the destructive role wiring; className does not. (ds/components/ActionList.tsx:13-15, ds/components/ActionMenu.docs.tsx:10-15)
- `onSelect` fires on click, Enter, and Space — the keyboard wiring is built in. Do NOT add an additional `onClick`.
- When used inside `ActionMenu.Overlay`, items announce as `menuitem`. Standalone (sidebar / picker), items announce as `option` or `button` depending on context.

### Accessibility

- The announced role is `menuitem` when nested in `ActionMenu.Overlay`. Do NOT override to `menuitemcheckbox` unless the item is actually a toggle. (ds/components/ActionMenu.docs.tsx:13-15)
- Pair `ActionList.Group` with `ActionList.Heading` so SR users hear the group name before the items.
- Use `ActionList.LinkItem` for navigation; do NOT put an `<a>` inside an `Item` (double-interaction surfaces confuse keyboard nav).

## Composition examples

Inside an `ActionMenu`:

```tsx
import { ActionMenu } from "@/ds/components/ActionMenu";
import { ActionList } from "@/ds/components/ActionList";

<ActionMenu>
  <ActionMenu.Button>Open menu</ActionMenu.Button>
  <ActionMenu.Overlay>
    <ActionList>
      <ActionList.Item>Pin</ActionList.Item>
      <ActionList.Item>Lock</ActionList.Item>
      <ActionList.Divider />
      <ActionList.Item variant="danger">Delete</ActionList.Item>
    </ActionList>
  </ActionMenu.Overlay>
</ActionMenu>
```

Standalone, with groups:

```tsx
<ActionList>
  <ActionList.Group>
    <ActionList.Heading as="h3">Account</ActionList.Heading>
    <ActionList.LinkItem href="/settings/profile">Profile</ActionList.LinkItem>
    <ActionList.LinkItem href="/settings/notifications">Notifications</ActionList.LinkItem>
  </ActionList.Group>
  <ActionList.Divider />
  <ActionList.Group>
    <ActionList.Heading as="h3">Danger zone</ActionList.Heading>
    <ActionList.Item variant="danger">Delete account</ActionList.Item>
  </ActionList.Group>
</ActionList>
```

## Source references

- `ds/components/ActionList.tsx:16` — wrapper (re-export of `@primer/react` `ActionList`).
- `ds/components/ActionList.tsx:11-15` — primitive role inside `ActionMenu.Overlay` + danger-variant note.
- `ds/components/ActionMenu.docs.tsx:10-15` — destructive-item composition rule.
- `node_modules/@primer/react/dist/ActionList/ActionList.d.ts` — type definitions for the compound subcomponents.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| `<ActionList.Item className="text-red-600">Delete</ActionList.Item>` | `<ActionList.Item variant="danger">Delete</ActionList.Item>` | className paints red; `variant="danger"` carries the destructive role + a11y semantics. |
| `<ActionList.Item><a href="/foo">Foo</a></ActionList.Item>` | `<ActionList.LinkItem href="/foo">Foo</ActionList.LinkItem>` | Nested anchor inside item creates two competing interaction surfaces and breaks keyboard nav. |
| `<ActionList.Item role="menuitemcheckbox">Toggle theme</ActionList.Item>` for a one-shot action | Default `role="menuitem"` (omit the prop) | `menuitemcheckbox` implies a toggle state SR users will look for. Reserve for actual toggles. |
| Raw `<button>` children in `ActionMenu.Overlay` instead of `<ActionList>` | Always wrap items in `<ActionList>` | Without `ActionList`, items lose roving-tabindex keyboard nav and the right ARIA roles. |

## Things to never invent

- `variant="destructive"` / `variant="critical"` / `variant="danger-subtle"` — exactly two variants on `ActionList.Item`: `default` and `danger`.
- `ActionList.Button` — there is no Button subcomponent on `ActionList`. Items act as buttons by default; `ActionList.LinkItem` for navigation.
- A `selected` prop on `ActionList` itself — selection state lives on `ActionList.Item` (`selected?: boolean`), or upstream when used with `SelectPanel`.
