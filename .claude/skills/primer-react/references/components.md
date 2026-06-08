# Components — primer-react

- package: `@primer/react`
- version: `38.26.0`
- prop source-of-truth: `@primer/react/generated/components.json` (published prop manifest) + `dist/index.d.ts`

Six components in the proposing set. Each section ships all 8 contract subsections. Prop citations point at the generated manifest entry for the component.

---

## Button

### Public imports

`import { Button } from '@primer/react'`

### When to use

Use `Button` for any click/submit action trigger. Pass `variant="primary"` for the single primary action on a surface, `variant="danger"` for destructive actions, and `variant="invisible"` for low-emphasis/tertiary actions. For a navigational target that looks like a button, render it as a link with `as="a"` + `href`; do not wrap an anchor in a `Button`.

### Key props

- `variant` — `'default' | 'primary' | 'danger' | 'invisible'`; default `'default'`. (`generated/components.json` → Button)
- `size` — `'small' | 'medium' | 'large'`; default `'medium'`. (`generated/components.json` → Button)
- `leadingVisual` / `trailingVisual` — `React.ElementType` icon slots; pass an octicon component (e.g. `PlusIcon`), not an inline SVG. (`generated/components.json` → Button)
- `loading` — `boolean`; renders a spinner and disables the button while busy. (`generated/components.json` → Button)
- `loadingAnnouncement` — `string`; the text announced to assistive tech while `loading`. (`generated/components.json` → Button)
- `block` — `boolean`; full-width button. (`generated/components.json` → Button)
- `count` — `number`; trailing counter (used with `Button` as a counting control). (`generated/components.json` → Button)
- `inactive` — `boolean`; visually-muted non-interactive state (distinct from `disabled`). (`generated/components.json` → Button)

### Best Practices

- Use the `loading` prop for busy state, not a manually-swapped spinner in `children` — `loading` coordinates the disabled state and the `loadingAnnouncement` for assistive tech. (`generated/components.json` → Button.loading)
- Use `leadingVisual` / `trailingVisual` for icons rather than placing an icon element directly in `children`; the slot handles spacing and alignment. (`generated/components.json` → Button.leadingVisual)
- Exactly one `variant="primary"` per surface — primary is the single headline action. (foundations/colors.md `token/emphasis-on-emphasis-pairing`)
- `inactive` is not `disabled`: use `inactive` for a button that is temporarily non-interactive but still focusable/explainable; use `disabled` to fully remove it from interaction. (`generated/components.json` → Button.inactive)

### Composition examples

```tsx
import { Button } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'

<Button variant="primary" leadingVisual={PlusIcon}>
  New repository
</Button>
```

### Source references

- `@primer/react/generated/components.json` → `Button` — prop manifest
- `@primer/react/dist/index.d.ts` — exported type

### Common mistakes

- Putting a raw `<svg>` or icon element in `children` instead of using the `leadingVisual` slot.
- Using `disabled` when the button should stay focusable and explained — reach for `inactive`.

### Things to never invent

- `variant` values beyond `default | primary | danger | invisible`.
- `size` values beyond `small | medium | large`.
- A `color` / `colorScheme` prop — color comes from the variant + tokens, not a prop.

---

## FormControl

### Public imports

`import { FormControl } from '@primer/react'`

### When to use

`FormControl` is the accessibility backbone for every form field. Wrap each input (`TextInput`, `Select`, checkbox, etc.) in a `FormControl` with a `FormControl.Label` child so the label is programmatically associated. Use `FormControl.Caption` for helper text and `FormControl.Validation` for error/success messaging.

### Key props

- `disabled` — `boolean`; default `false`; disables the wrapped field. (`generated/components.json` → FormControl)
- `required` — `boolean`; default `false`; marks the field required and annotates the label. (`generated/components.json` → FormControl)
- `id` — `string`; default a generated string; the id wired to the input + label association. (`generated/components.json` → FormControl)
- `layout` — `'vertical' | 'horizontal'`; default `vertical`. (`generated/components.json` → FormControl)
- Compound members: `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`, `FormControl.LeadingVisual`. (`generated/components.json` → FormControl.subcomponents)

### Best Practices

#### When to use

- Wrap every form field in `FormControl` + `FormControl.Label`; bare inputs lose label association and fail a11y. (`generated/components.json` → FormControl.subcomponents `FormControl.Label`)
- Use `FormControl.Caption` for persistent helper text and `FormControl.Validation` for state-dependent error/success text — do not merge the two into the label.

#### Accessibility

- Let `FormControl` generate and wire the `id` rather than hand-rolling `htmlFor` / `aria-labelledby`; the auto-association is the whole point of the component. (`generated/components.json` → FormControl.id)
- Set `required` on `FormControl`, not just an asterisk in label copy, so the requirement is announced.

### Composition examples

```tsx
import { FormControl, TextInput } from '@primer/react'

<FormControl required>
  <FormControl.Label>Repository name</FormControl.Label>
  <TextInput block />
  <FormControl.Caption>Lowercase letters, numbers, and hyphens.</FormControl.Caption>
</FormControl>
```

### Source references

- `@primer/react/generated/components.json` → `FormControl` (+ subcomponents) — prop manifest
- `@primer/react/dist/index.d.ts` — exported type

### Common mistakes

- Rendering a `TextInput` or `Select` without a wrapping `FormControl` — the field has no associated label.
- Putting helper text in a sibling `<p>` instead of `FormControl.Caption`, breaking the description association.

### Things to never invent

- Compound members beyond `Label`, `Caption`, `Validation`, `LeadingVisual`.
- A `label` string prop — the label is the `FormControl.Label` child, not a prop.

---

## TextInput

### Public imports

`import { TextInput } from '@primer/react'`

### When to use

Use `TextInput` for single-line text entry inside a `FormControl`. For native dropdown selection use `Select`; for multi-line text use the DS textarea. Reach for `block` to fill the field width inside a form column.

### Key props

- `block` — `boolean`; default `false`; full-width input. (`generated/components.json` → TextInput)
- `size` — `'small' | 'medium' | 'large'`. (`generated/components.json` → TextInput)
- `leadingVisual` / `trailingVisual` — `string | React.ComponentType`; icon or short text affixes. (`generated/components.json` → TextInput)
- `validationStatus` — `'error' | 'success'`. (`generated/components.json` → TextInput)
- `loading` / `loaderPosition` (`'auto' | 'leading' | 'trailing'`) / `loaderText` (default `Loading`) — async/validation loading affordance. (`generated/components.json` → TextInput)
- `monospace` — `boolean`; default `false`. (`generated/components.json` → TextInput)
- `contrast` — `boolean`; default `false`; higher-contrast field background. (`generated/components.json` → TextInput)

### Best Practices

#### When to use

- Always render `TextInput` inside a `FormControl`; do not rely on the bare `aria-label` prop as a substitute for a visible `FormControl.Label`. (`generated/components.json` → TextInput.aria-label)

#### Behavior

- Drive error/success styling with `validationStatus`, not a custom `className` or inline border color. (`generated/components.json` → TextInput.validationStatus)
- Use `block` to fill the column width rather than a fixed `width` style. (`generated/components.json` → TextInput.block)

### Composition examples

```tsx
import { FormControl, TextInput } from '@primer/react'
import { SearchIcon } from '@primer/octicons-react'

<FormControl>
  <FormControl.Label>Search</FormControl.Label>
  <TextInput block leadingVisual={SearchIcon} validationStatus="error" />
</FormControl>
```

### Source references

- `@primer/react/generated/components.json` → `TextInput` — prop manifest
- `@primer/react/dist/index.d.ts` — exported type

### Common mistakes

- Coloring an invalid field by hand instead of setting `validationStatus="error"`.
- Using `aria-label` to replace a visible label rather than wrapping in `FormControl`.

### Things to never invent

- `validationStatus` values beyond `error | success`.
- A `variant` prop — `TextInput` has no variants, only `size`/`contrast`/`monospace`.

---

## Select

### Public imports

`import { Select } from '@primer/react'`

### When to use

Use `Select` for short, fixed native dropdown lists. Render options as `Select.Option` children. For long, filterable lists or rich option rows, the native `Select` is the wrong choice — reach for the DS's overlay-based selection components (outside this proposing set).

### Key props

- `block` — `boolean`; default `false`; full-width. (`generated/components.json` → Select)
- `contrast` — `boolean`; default `false`. (`generated/components.json` → Select)
- `placeholder` — `string`; the disabled prompt option. (`generated/components.json` → Select)
- `size` — `'small' | 'medium' | 'large'`. (`generated/components.json` → Select)
- `validationStatus` — `'error' | 'success'`. (`generated/components.json` → Select)
- Compound member: `Select.Option`. (`generated/components.json` → Select.subcomponents)

### Best Practices

- Wrap `Select` in a `FormControl` with `FormControl.Label` for label association — same a11y contract as `TextInput`. (`generated/components.json` → FormControl.subcomponents `FormControl.Label`)
- Use the `placeholder` prop for the prompt option rather than a hand-written empty `Select.Option`. (`generated/components.json` → Select.placeholder)

### Composition examples

```tsx
import { FormControl, Select } from '@primer/react'

<FormControl>
  <FormControl.Label>Visibility</FormControl.Label>
  <Select placeholder="Choose visibility">
    <Select.Option value="public">Public</Select.Option>
    <Select.Option value="private">Private</Select.Option>
  </Select>
</FormControl>
```

### Source references

- `@primer/react/generated/components.json` → `Select` (+ `Select.Option`) — prop manifest
- `@primer/react/dist/index.d.ts` — exported type

### Common mistakes

- Using `Select` for a long, searchable list where filtering helps — the native control offers no filtering.
- Rendering a bare `Select` without a `FormControl` label.

### Things to never invent

- Compound members beyond `Select.Option`.
- `validationStatus` values beyond `error | success`.

---

## PageLayout

### Public imports

`import { PageLayout } from '@primer/react'`

### When to use

Use `PageLayout` for full-page region composition: `PageLayout.Header`, `PageLayout.Content`, `PageLayout.Pane`, `PageLayout.Footer`. Put the page title chrome in `PageLayout.Header` (not a raw heading inside `Content`), and a sidebar in `PageLayout.Pane`.

### Key props

- `containerWidth` — `'full' | 'medium' | 'large' | 'xlarge'`; default `'xlarge'`. (`generated/components.json` → PageLayout)
- `padding` — `'none' | 'condensed' | 'normal'`; default `'normal'`. (`generated/components.json` → PageLayout)
- `columnGap` / `rowGap` — `'none' | 'condensed' | 'normal'`; default `'normal'`. (`generated/components.json` → PageLayout)
- Compound members: `PageLayout.Header`, `PageLayout.Content`, `PageLayout.Pane`, `PageLayout.Footer` (also `PageLayout.Sidebar`). (`generated/components.json` → PageLayout.subcomponents)

### Best Practices

#### When to use

- Use `PageLayout.Header` for the page title region; do not put a raw `<h1>`-style heading directly in `PageLayout.Content`. (examples/dashboard.md)
- Render the sidebar with `PageLayout.Pane position="start" width="medium"` before `PageLayout.Content` for a standard settings/nav layout. (examples/settings.md)

#### Behavior

- Control width with `containerWidth` rather than a wrapping fixed-width `div`. (`generated/components.json` → PageLayout.containerWidth)

### Composition examples

```tsx
import { PageLayout } from '@primer/react'

<PageLayout containerWidth="large">
  <PageLayout.Header>{/* PageHeader title */}</PageLayout.Header>
  <PageLayout.Pane position="start" width="medium">{/* nav */}</PageLayout.Pane>
  <PageLayout.Content>{/* body */}</PageLayout.Content>
</PageLayout>
```

### Source references

- `@primer/react/generated/components.json` → `PageLayout` (+ subcomponents) — prop manifest
- `@primer/react/dist/index.d.ts` — exported type
- `references/examples/settings.md`, `references/examples/dashboard.md` — lifted exemplars

### Common mistakes

- Wrapping `PageLayout` in a fixed-width container instead of setting `containerWidth`.
- Placing the page heading in `Content` rather than `Header`.

### Things to never invent

- `containerWidth` values beyond `full | medium | large | xlarge`.
- Region members beyond `Header | Content | Pane | Footer | Sidebar`.

---

## Stack

### Public imports

`import { Stack } from '@primer/react'`

### When to use

Use `Stack` as the flex layout primitive for arranging siblings with a token-scaled gap. Reach for it instead of hand-written `display: flex` + raw `gap` values. Use `Stack.Item` for per-child layout overrides.

### Key props

- `direction` — `'horizontal' | 'vertical'` (or a `ResponsiveValue`); default vertical-leaning per usage. (`generated/components.json` → Stack)
- `gap` — `'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'`. (`generated/components.json` → Stack)
- `align` — `'stretch' | 'start' | 'center' | 'end' | 'baseline'`. (`generated/components.json` → Stack)
- `justify` — `'start' | 'center' | 'end' | 'space-between' | 'space-evenly'`. (`generated/components.json` → Stack)
- `wrap` — `'wrap' | 'nowrap'`. (`generated/components.json` → Stack)
- `padding` / `paddingBlock` / `paddingInline` — same named scale as `gap`. (`generated/components.json` → Stack)
- Compound member: `Stack.Item`. (`generated/components.json` → Stack.subcomponents)

### Best Practices

- Use the named `gap` scale (`condensed` / `normal` / `spacious`), never a raw px gap — the scale maps to spacing tokens. (`generated/components.json` → Stack.gap)
- Use `Stack` for layout structure; do not reintroduce a parallel `display:flex` wrapper around it. (`generated/components.json` → Stack.direction)

### Composition examples

```tsx
import { Stack } from '@primer/react'

<Stack direction="vertical" gap="spacious">
  <Stack.Item>{/* header */}</Stack.Item>
  <Stack.Item>{/* body */}</Stack.Item>
</Stack>
```

### Source references

- `@primer/react/generated/components.json` → `Stack` (+ `Stack.Item`) — prop manifest
- `@primer/react/dist/index.d.ts` — exported type

### Common mistakes

- Passing a raw px value where a named `gap`/`padding` scale token belongs.
- Nesting a manual flex `div` to do what `Stack` props already express.

### Things to never invent

- `gap` / `padding` values outside the named scale (`none | tight | condensed | cozy | normal | spacious`).
- Compound members beyond `Stack.Item`.
