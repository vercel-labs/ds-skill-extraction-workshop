# Components — primer-react

- package: `@primer/react`
- version: `38.26.0`

Source of truth for props is the package types under `node_modules/@primer/react/dist/<Component>/`. Each section ships the 8-section contract: public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent. Slugs cited here resolve in `../references/anti-patterns.md`.

---

## Button

### Public imports

`import { Button, IconButton } from "@primer/react"`

### When to use

Use `Button` for any text action trigger — submit, cancel, primary page action. For an action represented by an icon alone (no visible text label), use `IconButton`, which requires an accessible name. Do not paint a plain `<button>` by hand; `Button` carries the variant tokens and focus treatment.

### Key props

- `variant` — one of `'default' | 'primary' | 'invisible' | 'danger' | 'link'`; defaults to `'default'`. (Button/types.d.ts:4, Button/types.d.ts:18)
- `leadingVisual` — an icon component reference rendered before the label (`leadingVisual={PlusIcon}`). (Button/types.d.ts:58)
- `trailingVisual` — an icon component reference rendered after the label. (Button/types.d.ts:62)
- `IconButton` requires `aria-label` (or `aria-labelledby`) — enforced by the type. (Button/types.d.ts:71, Button/types.d.ts:7)

### Accessibility

- An `IconButton` is a contentful icon control and MUST carry an accessible name; `IconButtonProps` requires `aria-label` / `aria-labelledby`. (Button/types.d.ts:71)
- Do not add `aria-label` to a `Button` that already renders visible text — screen readers would announce both. (Button/types.d.ts:7)

### Composition examples

```tsx
import { Button } from "@primer/react";
import { PlusIcon } from "@primer/octicons-react";

<Button variant="primary" leadingVisual={PlusIcon}>
  New repository
</Button>;
```

### Source references

- `node_modules/@primer/react/dist/Button/types.d.ts:4` — `VariantType` union
- `node_modules/@primer/react/dist/Button/types.d.ts:58` — `leadingVisual` / `trailingVisual`
- `node_modules/@primer/react/dist/Button/types.d.ts:71` — `IconButtonProps`

### Best Practices

- Never pass a `variant` outside `'default' | 'primary' | 'invisible' | 'danger' | 'link'` — the type rejects it (`component/button-variant-enum`). (Button/types.d.ts:4)
- Pass an icon as a component reference to `leadingVisual` / `trailingVisual` (`leadingVisual={PlusIcon}`), not an inline `<PlusIcon />` element (`component/button-visual-component-ref`). (Button/types.d.ts:58)
- Never render an icon-only `IconButton` without `aria-label` — axe fails and the control announces as unnamed (`component/iconbutton-requires-aria-label`). (Button/types.d.ts:71)

### Common mistakes

- Inventing `size="xs"` or `variant="secondary"`: neither exists; the variant union is fixed at five values.

### Things to never invent

- Variants other than the five in the `VariantType` union.
- A `loading` prop — it is not on the public Button type; verify against the types file before using one.

---

## TextInput

### Public imports

`import { TextInput } from "@primer/react"`

### When to use

Use `TextInput` for single-line text entry. Always render it inside a `FormControl` so the label, caption, and validation are associated — not as a bare input with a sibling `<label>`. For multi-line entry use `Textarea`.

### Key props

- `block` — stretches the input to fill its container row. (TextInput/TextInput.d.ts:36)
- `leadingVisual` — a visual rendered inside the input before the typing area (icon component reference). (TextInput/TextInput.d.ts:22)
- `trailingVisual` — a visual rendered inside the input after the typing area. (TextInput/TextInput.d.ts:26)
- `validationStatus`, `disabled`, `size` — passthrough styling props. (TextInput/TextInput.d.ts:36)

### Accessibility

- Label association comes from wrapping the input in `FormControl` with a `FormControl.Label`; a bare `TextInput` with no associated label fails axe. (FormControl/FormControl.d.ts:28)

### Composition examples

```tsx
import { FormControl, TextInput } from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";

<FormControl required>
  <FormControl.Label>Repository name</FormControl.Label>
  <TextInput block placeholder="awesome-project" leadingVisual={RepoIcon} />
  <FormControl.Caption>Short and memorable is best.</FormControl.Caption>
</FormControl>;
```

### Source references

- `node_modules/@primer/react/dist/TextInput/TextInput.d.ts:22` — `leadingVisual`
- `node_modules/@primer/react/dist/TextInput/TextInput.d.ts:36` — `block` / `disabled` / `validationStatus` passthrough

### Best Practices

- Never render a `TextInput` outside a `FormControl` — label association breaks and axe fails (`component/textinput-requires-formcontrol`). (FormControl/FormControl.d.ts:28)
- Pass `leadingVisual` an icon component reference (`leadingVisual={RepoIcon}`), not an inline element (`component/textinput-visual-component-ref`). (TextInput/TextInput.d.ts:22)

### Common mistakes

- Setting `required` on the `TextInput` instead of on the wrapping `FormControl`.

### Things to never invent

- Props not in `TextInputProps` — confirm against the types file before using one.

---

## FormControl

### Public imports

`import { FormControl } from "@primer/react"`

### When to use

Use `FormControl` to wrap every form field — input, textarea, select, checkbox, radio — so its label, caption, and validation message are associated for accessibility. It is the a11y backbone of every form row.

### Key props

- `required` — set on the `FormControl`, not the inner input; marks the field required for the owning form. (FormControl/FormControl.d.ts:16)
- `disabled` — disables the control. (FormControl/FormControl.d.ts:8)
- Slots: `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`. (FormControl/FormControl.d.ts:28, FormControl/FormControl.d.ts:27, FormControl/FormControl.d.ts:36)

### Accessibility

- `FormControl` wires the label/caption/validation `id`s to the input automatically — this is the association contract. Do not hand-roll `htmlFor`/`id` pairing inside it. (FormControl/FormControl.d.ts:28)

### Composition examples

```tsx
import { Checkbox, FormControl } from "@primer/react";

<FormControl>
  <Checkbox defaultChecked />
  <FormControl.Label>Add a README file</FormControl.Label>
  <FormControl.Caption>Write a long description for your project.</FormControl.Caption>
</FormControl>;
```

### Source references

- `node_modules/@primer/react/dist/FormControl/FormControl.d.ts:16` — `required`
- `node_modules/@primer/react/dist/FormControl/FormControl.d.ts:28` — `Label` slot

### Best Practices

- Set `required` on the `FormControl`, never on the inner input — the wrapper owns the association (`component/formcontrol-required-on-wrapper`). (FormControl/FormControl.d.ts:16)
- In a checkbox/radio row, render `<Checkbox />` as the FIRST child of `FormControl`, before `FormControl.Label` — that ordering produces the horizontal layout (`component/formcontrol-checkbox-first-child`). (FormControl/FormControl.d.ts:28)

### Common mistakes

- Placing `FormControl.Label` before the `<Checkbox />` in a checkbox row, which breaks the horizontal layout.

### Things to never invent

- Slot names beyond `Label`, `Caption`, `Validation`, `LeadingVisual`.

---

## PageHeader

### Public imports

`import { PageHeader } from "@primer/react"`

### When to use

Use `PageHeader` for the title region of a page or pane — a title, an optional description, and optional actions. Pair it with `PageLayout.Header` for full-page screens. Do not hand-build a title bar with raw headings when the page has actions.

### Key props

- `PageHeader.TitleArea` — wraps the title; takes a `variant` (`'subtitle' | 'medium' | 'large'`). (PageHeader/PageHeader.d.ts:37, PageHeader/PageHeader.d.ts:22)
- `PageHeader.Title` — the heading text. (PageHeader/PageHeader.d.ts:42)
- `PageHeader.Description` — supporting text under the title. (PageHeader/PageHeader.d.ts:46)
- `PageHeader.Actions` — the trailing action slot (e.g. a primary Button). (PageHeader/PageHeader.d.ts:45)

### Accessibility

- `PageHeader.Title` renders the page heading; keep the document heading order correct (one `<h1>`-level title per page). No special ARIA props are required on the slots.

### Composition examples

```tsx
import { Button, PageHeader } from "@primer/react";
import { PlusIcon } from "@primer/octicons-react";

<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.Title>Repositories</PageHeader.Title>
  </PageHeader.TitleArea>
  <PageHeader.Description>Public and private repositories.</PageHeader.Description>
  <PageHeader.Actions>
    <Button variant="primary" leadingVisual={PlusIcon}>New repository</Button>
  </PageHeader.Actions>
</PageHeader>;
```

### Source references

- `node_modules/@primer/react/dist/PageHeader/PageHeader.d.ts:37` — `TitleArea`
- `node_modules/@primer/react/dist/PageHeader/PageHeader.d.ts:45` — `Actions`

### Best Practices

- Place the page action in `PageHeader.Actions`, not floated above the content (`component/pageheader-slots`). (PageHeader/PageHeader.d.ts:45)
- Use the documented slot order: `TitleArea` (with `Title`) → `Description` → `Actions`. (PageHeader/PageHeader.d.ts:37)

### Common mistakes

- Putting a bare `<h1>` outside `PageHeader.Title` when the page header already provides the title slot.

### Things to never invent

- Slot names beyond `TitleArea`, `Title`, `Description`, `Actions`, `ContextArea`, `Navigation`, `LeadingVisual`, `TrailingVisual` — confirm against the types before using one.
