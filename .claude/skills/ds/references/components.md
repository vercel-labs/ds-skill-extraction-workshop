## Button

---
title: Button
description: Filled/outline/invisible/danger/link action trigger with loading state and visual slots.
---

### Public imports

```tsx
import { Button } from '@primer/react';
```

### When to use

Use `Button` for any clickable action — form submissions, navigations, toggles. For icon-only actions, use [IconButton](#iconbutton) instead. For non-interactive status messages, use [Flash](#flash).

### Key props

- `variant` — `'default' | 'primary' | 'invisible' | 'danger' | 'link'`. Default: `'default'`. (`dist/Button/types.d.ts:4`)
- `size` — `'small' | 'medium' | 'large'`. Default: `'medium'`. (`dist/Button/types.d.ts:5`)
- `disabled` — disables the button. Avoid disabling buttons when possible — disabled buttons are inaccessible to keyboard users. (`dist/Button/types.d.ts:27`)
- `loading` — shows a loading spinner and announces the busy state to assistive tech. (`dist/Button/types.d.ts:40`)
- `loadingAnnouncement` — custom screen-reader announcement while loading. (`dist/Button/types.d.ts:44`)
- `inactive` — visual-only inactive state. Does NOT disable the button for screen readers. (`dist/Button/types.d.ts:45`)
- `block` — allows the button to fill its container horizontally. (`dist/Button/types.d.ts:35`)
- `leadingVisual` — icon or element rendered before the button text. (`dist/Button/types.d.ts:60`)
- `trailingVisual` — icon or element rendered after the button text. (`dist/Button/types.d.ts:64`)
- `count` — numeric badge rendered after the trailing visual. (`dist/Button/types.d.ts:72`)
- `labelWrap` — allows the button label to wrap to multiple lines. (`dist/Button/types.d.ts:49`)

### Best Practices

#### When to use

- Use `variant="primary"` for the single most important action on the page. Do not use more than one primary button per view.
- Use `variant="danger"` only for destructive actions (delete, remove, revoke).
- Use `variant="invisible"` for low-emphasis actions in dense UI (toolbars, action lists).
- Use `variant="link"` when the action navigates — visually styled as a link but semantically a button.

#### Behavior

- Use `disabled={isSubmitting}` on submit buttons, NOT `inactive={isSubmitting}` — `inactive` is visual-only; screen readers still announce the button as actionable. (`dist/Button/types.d.ts:27,45`)
- Use `loading` instead of swapping in a custom spinner — the `loading` prop handles disabled coordination and ARIA announcements automatically. (`dist/Button/types.d.ts:40`)

#### Accessibility

- Do NOT pass `aria-label` to a `Button` that already renders visible text — screen readers announce both, creating a duplicate announcement. (`dist/Button/types.d.ts:8-12`)
- When using `leadingVisual` or `trailingVisual` with an icon, the icon is decorative — the button text is the accessible name. Do not add `aria-label` to the icon.

### Composition examples

```tsx
import { Button } from '@primer/react';
import { SearchIcon } from '@primer/octicons-react';

<Button variant="primary" size="medium" loading={isSubmitting} loadingAnnouncement="Saving changes">
  Save changes
</Button>

<Button variant="default" leadingVisual={SearchIcon} count={results.length}>
  Search
</Button>

<Button variant="danger" disabled={!canDelete}>
  Delete repository
</Button>
```

### Source references

- `node_modules/@primer/react/dist/Button/types.d.ts` — prop type definitions
- `node_modules/@primer/react/dist/Button/Button.d.ts` — component export
- `node_modules/@primer/react/dist/Button/index.d.ts` — barrel re-export

### Common mistakes

- Never use `inactive` when you mean `disabled` — `inactive` is visual-only and does not prevent interaction for keyboard or screen-reader users.
- Never add `aria-label` to a Button with visible text — it overrides the visible label for assistive tech.
- Never swap `children` to a spinner for loading — use the `loading` prop so focus and ARIA state are managed.

### Things to never invent

- Props not listed under Key props (e.g. `color`, `outline`, `ghost` do not exist).
- Variant values not in `'default' | 'primary' | 'invisible' | 'danger' | 'link'`.
- Size values not in `'small' | 'medium' | 'large'` (e.g. `'xs'`, `'xl'` do not exist).

---

## IconButton

---
title: IconButton
description: Icon-only button with built-in tooltip and required aria-label.
---

### Public imports

```tsx
import { IconButton } from '@primer/react';
```

### When to use

Use `IconButton` for icon-only actions (delete, search, settings). Every `IconButton` requires `aria-label` — the icon alone is not an accessible name. For buttons with visible text, use [Button](#button).

### Key props

- `icon` — required. The icon component to render (from `@primer/octicons-react`). (`dist/Button/types.d.ts:74`)
- `aria-label` — required. Accessible name for the button. (`dist/Button/types.d.ts:8`)
- `variant` — `'default' | 'primary' | 'invisible' | 'danger' | 'link'`. Inherits from `ButtonBaseProps`. (`dist/Button/types.d.ts:4`)
- `size` — `'small' | 'medium' | 'large'`. (`dist/Button/types.d.ts:5`)
- `description` — additional description shown in the tooltip. (`dist/Button/types.d.ts:76`)
- `tooltipDirection` — tooltip placement direction. (`dist/Button/types.d.ts:77`)
- `unsafeDisableTooltip` — disables the built-in tooltip. Use sparingly. (`dist/Button/types.d.ts:75`)
- `keybindingHint` — keyboard shortcut hint shown in the tooltip. (`dist/Button/types.d.ts:79`)

### Best Practices

- Always provide a descriptive `aria-label` — `"Delete"` alone is ambiguous; prefer `"Delete item"` or `"Delete <name>"`.
- Use `variant="danger"` for destructive icon actions (trash, close, remove).
- Use `description` to add context beyond the `aria-label` — it appears in the tooltip alongside the label.
- Use `keybindingHint` when a keyboard shortcut exists — it renders in the tooltip automatically.

#### Accessibility

- `aria-label` is required by the type system — the component will not compile without it.
- The built-in tooltip ensures sighted users see the action name on hover/focus. Do not disable it with `unsafeDisableTooltip` unless the action name is visible elsewhere in the UI.

### Composition examples

```tsx
import { IconButton } from '@primer/react';
import { TrashIcon, SearchIcon } from '@primer/octicons-react';

<IconButton icon={TrashIcon} aria-label="Delete item" variant="danger" size="small" />

<IconButton
  icon={SearchIcon}
  aria-label="Search"
  description="Open global search"
  keybindingHint="/"
  tooltipDirection="s"
/>
```

### Source references

- `node_modules/@primer/react/dist/Button/types.d.ts:73-80` — `IconButtonProps` type
- `node_modules/@primer/react/dist/Button/IconButton.d.ts` — component export

### Common mistakes

- Never render an `IconButton` without `aria-label` — it will not compile and is inaccessible.
- Never use a raw `<button>` with an SVG icon instead of `IconButton` — you lose the built-in tooltip, focus management, and ARIA handling.
- Never pass `children` to `IconButton` — it renders only the `icon` prop.

### Things to never invent

- Props not listed under Key props (e.g. `label`, `title`, `tooltip` do not exist as props).
- Icon names not exported by `@primer/octicons-react`.

---

## FormControl

---
title: FormControl
description: Accessible form field wrapper with label, caption, validation, and leading visual slots.
---

### Public imports

```tsx
import { FormControl } from '@primer/react';
```

Sub-components are accessed as compound members: `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`, `FormControl.LeadingVisual`.

### When to use

Use `FormControl` to wrap every interactive form input (`TextInput`, `Select`, `Textarea`, `Checkbox`, `Radio`). `FormControl` associates the label, caption, and validation message with the input for accessibility. Bare inputs without `FormControl` lose label association and fail axe audits.

### Key props

- `disabled` — disables the wrapped input. (`dist/FormControl/FormControl.d.ts:10`)
- `required` — marks the field as required for form submission. (`dist/FormControl/FormControl.d.ts:18`)
- `id` — unique identifier that associates `FormControl.Label` with the input via `htmlFor`. (`dist/FormControl/FormControl.d.ts:14`)
- `layout` — `'horizontal' | 'vertical'`. Default: `'vertical'`. Horizontal is used for checkbox and radio inputs. (`dist/FormControl/FormControl.d.ts:22`)

Sub-components:
- `FormControl.Label` — renders the input label. Accepts `htmlFor` for explicit association. (`dist/FormControl/FormControl.d.ts:28`)
- `FormControl.Caption` — helper text below the input.
- `FormControl.Validation` — validation message. Accepts `variant: 'error' | 'success' | 'warning'`.
- `FormControl.LeadingVisual` — icon or visual before the input.

### Best Practices

- Every interactive input MUST live inside a `FormControl` with `FormControl.Label` — bare inputs lose label association and fail axe. (`dist/FormControl/FormControl.d.ts:28`)
- Use `layout="horizontal"` only for checkbox and radio inputs — text inputs and selects use the default `'vertical'` layout.
- Always set `id` on `FormControl` so the label-input association is explicit via `htmlFor`.

#### Accessibility

- `FormControl.Label` renders a `<label>` element associated with the input via `htmlFor`/`id`. Without this association, the input has no accessible name.
- `FormControl.Validation` with `variant="error"` announces the error to screen readers via `aria-describedby`.

### Composition examples

```tsx
import { FormControl, TextInput } from '@primer/react';

<FormControl required id="email-input">
  <FormControl.Label htmlFor="email-input">Email address</FormControl.Label>
  <TextInput type="email" />
  <FormControl.Caption>We will never share your email.</FormControl.Caption>
  <FormControl.Validation variant="error">Please enter a valid email.</FormControl.Validation>
</FormControl>

<FormControl disabled>
  <FormControl.Label>Disabled field</FormControl.Label>
  <TextInput />
</FormControl>
```

### Source references

- `node_modules/@primer/react/dist/FormControl/FormControl.d.ts` — component and sub-component types
- `node_modules/@primer/react/dist/FormControl/FormControlCaption.d.ts` — Caption sub-component
- `node_modules/@primer/react/dist/FormControl/index.d.ts` — barrel re-export

### Common mistakes

- Never render a `TextInput`, `Select`, or `Textarea` outside a `FormControl` — the input loses its accessible label and fails automated a11y checks.
- Never omit `FormControl.Label` — a `FormControl` without a label provides no accessible name.
- Never use `layout="horizontal"` for text inputs — horizontal layout is designed for checkbox/radio alignment.

### Things to never invent

- Sub-components not listed (e.g. `FormControl.Error`, `FormControl.Help`, `FormControl.Hint` do not exist).
- Props not listed under Key props (e.g. `error`, `helperText`, `inputProps` do not exist).

---

## Flash

---
title: Flash
description: Inline status banner for info, warning, success, and danger messages.
---

### Public imports

```tsx
import { Flash } from '@primer/react';
```

### When to use

Use `Flash` for inline status messages — informational notices, warnings, success confirmations, and error alerts. Flash is not a toast or a modal; it renders inline in the document flow. For action triggers, use [Button](#button).

### Key props

- `variant` — `'default' | 'warning' | 'success' | 'danger'`. Default: `'default'`. (`dist/Flash/Flash.d.ts:5`)
- `full` — renders the flash at full width of its container. (`dist/Flash/Flash.d.ts:6`)

### Best Practices

- Use `variant="danger"` for errors that block the user's workflow.
- Use `variant="warning"` for cautionary messages that do not block.
- Use `variant="success"` for confirmations of completed actions.
- Use `full` when the flash spans the entire page width (e.g. at the top of a settings page).

#### Accessibility

- Flash has an implicit `role="alert"` for `danger` and `warning` variants — content changes are announced to screen readers automatically.

### Composition examples

```tsx
import { Flash } from '@primer/react';
import { AlertIcon } from '@primer/octicons-react';

<Flash variant="success">Repository created successfully.</Flash>

<Flash variant="danger" full>
  <AlertIcon /> Failed to save changes. Please try again.
</Flash>

<Flash variant="warning">
  This action cannot be undone.
</Flash>
```

### Source references

- `node_modules/@primer/react/dist/Flash/Flash.d.ts` — component type and props

### Common mistakes

- Never use `Flash` as a toast or notification — it is an inline element, not an overlay.
- Never omit `variant` when the intent is non-informational — the default variant is neutral and may not convey urgency.

### Things to never invent

- Variant values not in `'default' | 'warning' | 'success' | 'danger'` (e.g. `'info'`, `'error'` do not exist).
- Props not listed under Key props (e.g. `dismissible`, `onClose`, `icon` do not exist as Flash props).
