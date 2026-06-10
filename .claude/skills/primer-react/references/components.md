# Components — primer-react

- package: `@primer/react`
- version: `38.26.0`

All prop names and value unions below were typechecked against the published types (`@primer/react/dist/**/*.d.ts`) via a prop-level probe during extraction — 22 props verified, 0 hallucinations. Citations are package-relative paths into `@primer/react/dist/`.

## PageLayout

### Public imports

`import { PageLayout } from '@primer/react'` — subcomponents: `PageLayout.Header`, `PageLayout.Content`, `PageLayout.Pane`, `PageLayout.Footer`.

### When to use

The page-shell scaffold: header / pane / content / footer regions with responsive behavior built in. Use it as the outermost layout of any full page. For stacking elements *inside* a region, use [Stack](#stack) — PageLayout owns regions, not gaps between arbitrary children.

### Key props

- `containerWidth` — `'full' | 'medium' | 'large' | 'xlarge'`, caps the content width (`dist/PageLayout/PageLayout.d.ts:12`)
- `PageLayout.Pane position` — `'start' | 'end'` (responsive value allowed), which side the pane renders on (`dist/PageLayout/PageLayout.d.ts:176`)
- `PageLayout.Pane width` — `PaneWidth | CustomWidthOptions` (e.g. `"medium"`), pane sizing (`dist/PageLayout/PageLayout.d.ts:180`)

### Best Practices

- Put the page `<PageHeader>` (or page `<Heading as="h1">`) inside `PageLayout.Header`, never loose above the PageLayout — the region carries the layout's spacing contract (exemplars `references/examples/settings.md`, `references/examples/dashboard.md`).
- Use `containerWidth="large"` for list/settings/dashboard pages — the shape every lifted exemplar uses.

### Composition examples

```tsx
import { PageLayout, Heading } from "@primer/react";

<PageLayout containerWidth="large">
  <PageLayout.Header>
    <Heading as="h1" variant="large">Settings</Heading>
  </PageLayout.Header>
  <PageLayout.Pane position="start" width="medium">{/* nav */}</PageLayout.Pane>
  <PageLayout.Content>{/* page body */}</PageLayout.Content>
</PageLayout>
```

Lifted from `vercel-labs/primer-nextjs-template/app/settings/page.tsx` (see `references/examples/settings.md`).

### Source references

- `@primer/react/dist/PageLayout/PageLayout.d.ts` — types
- `references/examples/settings.md`, `references/examples/dashboard.md` — real compositions

### Common mistakes

- Rendering nav or sidebar content as a plain sibling `<div>` instead of `PageLayout.Pane position="start"` — the responsive pane collapse is lost.

### Things to never invent

- Props not listed under "Key props" or in `dist/PageLayout/PageLayout.d.ts`.
- A `containerWidth` value outside `'full' | 'medium' | 'large' | 'xlarge'`.

## PageHeader

### Public imports

`import { PageHeader } from '@primer/react'` — subcomponents: `PageHeader.TitleArea`, `PageHeader.Title`, `PageHeader.Description`, `PageHeader.Actions`.

### When to use

The canonical page-top component: title row, one-line description, and a right-aligned actions slot. Use inside [PageLayout](#pagelayout)'s `PageLayout.Header` region. Not for section headings inside the page body — use [Heading](#heading) there.

### Key props

- Composition is via subcomponents rather than props: `PageHeader.TitleArea > PageHeader.Title` (the h1), `PageHeader.Description`, `PageHeader.Actions` (`dist/PageHeader/PageHeader.d.ts:37-46`). All four subcomponent symbols typechecked against the published types.

### Best Practices

- The title always nests as `PageHeader.TitleArea > PageHeader.Title`; `PageHeader.Description` and `PageHeader.Actions` are siblings of `TitleArea`, not children of it (exemplars `references/examples/home.md`, `references/examples/repos.md`).

### Composition examples

```tsx
import { PageHeader, Button } from "@primer/react";
import { PlusIcon } from "@primer/octicons-react";

<PageHeader>
  <PageHeader.TitleArea>
    <PageHeader.Title>Repositories</PageHeader.Title>
  </PageHeader.TitleArea>
  <PageHeader.Description>All repositories you can access.</PageHeader.Description>
  <PageHeader.Actions>
    <Button variant="primary" leadingVisual={PlusIcon}>New</Button>
  </PageHeader.Actions>
</PageHeader>
```

Lifted from `vercel-labs/primer-nextjs-template/app/page.tsx` (see `references/examples/home.md`).

### Source references

- `@primer/react/dist/PageHeader/PageHeader.d.ts` — types
- `references/examples/home.md`, `references/examples/repos.md` — real compositions

### Common mistakes

- Placing action buttons as loose siblings after the title instead of inside `PageHeader.Actions` — the right-alignment and responsive wrap are lost.

### Things to never invent

- Subcomponents not exported in `dist/PageHeader/PageHeader.d.ts` (e.g. there is no `PageHeader.Subtitle`).

## Stack

### Public imports

`import { Stack } from '@primer/react'`

### When to use

The flex layout primitive for spacing same-direction siblings — Primer's preferred Box-replacement. Use it for vertical page sections and horizontal icon-beside-text rows. Not for page regions — use [PageLayout](#pagelayout).

### Key props

- `direction` — `'horizontal' | 'vertical'` (responsive value allowed) (`dist/Stack/Stack.d.ts:30`)
- `gap` — `'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'` (`dist/Stack/Stack.d.ts:25`, scale at `:5`)
- `align` — cross-axis alignment, e.g. `"start"`, `"center"` (`dist/Stack/Stack.d.ts:35`)
- `wrap` — `"wrap"` / `"nowrap"` (`dist/Stack/Stack.d.ts:40`)
- `justify` — main-axis distribution, e.g. `"end"`, `"space-between"` (`dist/Stack/Stack.d.ts:45`)

### Best Practices

- Use the named `gap` scale, never margins between children — `spacious` between page sections, `normal` within a section, `condensed` for icon-beside-text rows (exemplars `references/examples/home.md`, `references/examples/settings.md`).
- Right-aligned action rows are `<Stack direction="horizontal" justify="end">` — not floated or auto-margined buttons (`references/examples/settings.md`).

### Composition examples

```tsx
import { Stack, Heading, Text } from "@primer/react";

<Stack direction="vertical" gap="spacious">
  <Stack direction="vertical" gap="condensed">
    <Heading as="h2" variant="medium">Public profile</Heading>
    <Text style={{ color: "var(--fgColor-muted)" }}>Shown on your profile.</Text>
  </Stack>
</Stack>
```

Lifted from `vercel-labs/primer-nextjs-template/app/settings/page.tsx` (see `references/examples/settings.md`).

### Source references

- `@primer/react/dist/Stack/Stack.d.ts` — types
- `references/examples/home.md`, `references/examples/settings.md` — real compositions

### Common mistakes

- Writing `gap: 13px` (or any raw px) on a flex div instead of `Stack gap="normal"` — off-grid spacing breaks vertical rhythm (`token/ad-hoc-spacing` in `references/anti-patterns.md`).

### Things to never invent

- `gap` values outside the six-step scale in `dist/Stack/Stack.d.ts:5`.
- A `spacing` or `space` prop — the prop is `gap`.

## Heading

### Public imports

`import { Heading } from '@primer/react'`

### When to use

Semantic page and section headings (`h1`–`h6`) styled with Primer type tokens. For non-heading emphasized text, use [Text](#text) with `weight`.

### Key props

- `as` — `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`, the rendered element (`dist/Heading/Heading.d.ts:5`, levels at `:3`)
- `variant` — `'large' | 'medium' | 'small'`, the visual size, independent of `as` (`dist/Heading/Heading.d.ts:6`)

### Best Practices

- Set `as` by document outline and `variant` by visual weight — the two are independent, so a card title can be `as="h2" variant="small"` without breaking heading order (see `token/semantic-heading-order` in `references/foundations/typography.md`).

### Composition examples

```tsx
import { Heading } from "@primer/react";

<Heading as="h2" variant="medium">Preferences</Heading>
```

Lifted from `vercel-labs/primer-nextjs-template/app/settings/page.tsx` (see `references/examples/settings.md`).

### Source references

- `@primer/react/dist/Heading/Heading.d.ts` — types

### Common mistakes

- Picking the heading level for its size (e.g. `as="h4"` because it "looks right") — use `variant` for size and keep `as` in document-outline order.

### Things to never invent

- A `size` prop — the visual-size prop is `variant`.
- `variant` values outside `'large' | 'medium' | 'small'`.

## Text

### Public imports

`import { Text } from '@primer/react'`

### When to use

Inline text primitive with token-driven `size`/`weight`. Use for body copy, captions, and secondary descriptions. Not for headings — use [Heading](#heading).

### Key props

- `size` — `'large' | 'medium' | 'small'` (`dist/Text/Text.d.ts:4`)
- `weight` — `'light' | 'normal' | 'medium' | 'semibold'` (`dist/Text/Text.d.ts:5`)

### Best Practices

- Muted/secondary color is not a prop — paint it with the token via `style={{ color: "var(--fgColor-muted)" }}` (exemplar `references/examples/home.md`).

### Composition examples

```tsx
import { Text } from "@primer/react";

<Text size="small" style={{ color: "var(--fgColor-muted)" }}>
  Used when creating new repositories.
</Text>
```

Lifted from `vercel-labs/primer-nextjs-template/app/page.tsx` (see `references/examples/home.md`).

### Source references

- `@primer/react/dist/Text/Text.d.ts` — types
- `references/examples/home.md` — real composition

### Common mistakes

- Inventing a `color` or `muted` prop on Text — color comes from CSS tokens via `style`, not from a prop.

### Things to never invent

- `size`/`weight` values outside the unions in `dist/Text/Text.d.ts:4-5`.

## Button

### Public imports

`import { Button } from '@primer/react'`

### When to use

The action trigger. `variant="primary"` for the single main action on a surface, `"default"` for secondary actions, `"danger"` for destructive ones, `"invisible"` for low-emphasis inline actions. For navigation styled as a link, prefer the `Link` component over `variant="link"`.

### Key props

- `variant` — `'default' | 'primary' | 'invisible' | 'danger' | 'link'` (`dist/Button/types.d.ts:18`, union at `:4`)
- `size` — `'small' | 'medium' | 'large'` (`dist/Button/types.d.ts:22`, union at `:5`)
- `block` — `boolean`, full-width button (`dist/Button/types.d.ts:31`)
- `leadingVisual` — icon component before the label, e.g. `leadingVisual={PlusIcon}` (`dist/Button/types.d.ts:58`)
- `trailingVisual` — icon component after the label (`dist/Button/types.d.ts:62`)

### Best Practices

- Pass octicon components to `leadingVisual`/`trailingVisual` (e.g. `leadingVisual={PlusIcon}`), do not nest `<PlusIcon />` inside `children` — the slot handles sizing and spacing (probe-verified against `dist/Button/types.d.ts:58-62`; exemplar `references/examples/repos.md`).
- One `variant="primary"` per visual surface; section-level save actions sit in a right-aligned Stack row (exemplar `references/examples/settings.md`).

### Composition examples

```tsx
import { Button } from "@primer/react";
import { PlusIcon } from "@primer/octicons-react";

<Button variant="primary" size="medium" leadingVisual={PlusIcon}>
  New repository
</Button>
```

Lifted from the probe composition verified against `vercel-labs/primer-nextjs-template` (see `references/examples/repos.md`).

### Source references

- `@primer/react/dist/Button/types.d.ts` — types

### Common mistakes

- Styling a Button's background with a raw hex instead of leaving the `variant` to paint it — hex bypasses theming (`token/hex-literal` in `references/anti-patterns.md`).

### Things to never invent

- `variant` values outside `dist/Button/types.d.ts:4` (there is no `"secondary"`; the secondary look is `"default"`).
- A `loading` icon nested in `children` — use the visual slots.

## FormControl

### Public imports

`import { FormControl } from '@primer/react'` — subcomponents: `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`.

### When to use

The label/caption/validation wrapper for every form input ([TextInput](#textinput), `Select`, `Textarea`, `Checkbox`). A bare input outside FormControl loses label association and a11y wiring.

### Key props

- `required` — `boolean`, marks the field required and propagates to the input (`dist/FormControl/FormControl.d.ts:16`)

### Best Practices

- Never render a `TextInput` (or `Select`/`Textarea`/`Checkbox`) outside a `FormControl` — FormControl generates the input `id` via `useId`, wires `FormControl.Label` to it, and sets `aria-describedby` to the caption; bare inputs lose all three (`dist/FormControl/FormControl.js:55-94`).

### Composition examples

```tsx
import { FormControl, TextInput } from "@primer/react";

<FormControl required>
  <FormControl.Label>Name</FormControl.Label>
  <TextInput block placeholder="awesome-project" />
  <FormControl.Caption>Short and memorable.</FormControl.Caption>
</FormControl>
```

Lifted from `vercel-labs/primer-nextjs-template/app/new/page.tsx` (see `references/examples/new.md`).

### Source references

- `@primer/react/dist/FormControl/FormControl.d.ts` — types
- `@primer/react/dist/FormControl/FormControl.js:55-94` — id/label/caption wiring

### Common mistakes

- Adding a manual `<label htmlFor>` next to a FormControl-wrapped input — FormControl already associates `FormControl.Label`; the duplicate label double-announces.

### Things to never invent

- An `error` prop — validation renders via the `FormControl.Validation` subcomponent.

## TextInput

### Public imports

`import { TextInput } from '@primer/react'`

### When to use

Single-line text entry. Always rendered inside a [FormControl](#formcontrol) for label association. For multi-line input use `Textarea` (also FormControl-wrapped).

### Key props

- `block` — `boolean`, full-width input (`dist/internal/components/TextInputWrapper.d.ts:5`, picked up via `dist/TextInput/TextInput.d.ts:36`)
- `placeholder` — standard input placeholder (inherited `React.InputHTMLAttributes`; probe-verified)
- `leadingVisual` — icon/element inside the input's leading edge, e.g. `leadingVisual={RepoIcon}` (`dist/TextInput/TextInput.d.ts:22`)
- `defaultValue` — uncontrolled prefill (inherited `React.InputHTMLAttributes`; probe-verified)

### Best Practices

- Use `block` + `defaultValue` for uncontrolled, prefilled settings forms (exemplar `references/examples/settings.md`).
- Validation state goes through `validationStatus` (`dist/internal/components/TextInputWrapper.d.ts:11`) paired with `FormControl.Validation`, not through ad-hoc border colors.

### Composition examples

```tsx
import { FormControl, TextInput } from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";

<FormControl>
  <FormControl.Label>Repository name</FormControl.Label>
  <TextInput block leadingVisual={RepoIcon} placeholder="awesome-project" />
</FormControl>
```

Lifted from `vercel-labs/primer-nextjs-template/app/new/page.tsx` (see `references/examples/new.md`).

### Source references

- `@primer/react/dist/TextInput/TextInput.d.ts` — types
- `@primer/react/dist/internal/components/TextInputWrapper.d.ts` — `block`/`validationStatus` source

### Common mistakes

- Rendering a TextInput outside FormControl — label association breaks (same trap as documented under [FormControl](#formcontrol); duplicated here because the trap fires from both files).

### Things to never invent

- An `icon` prop — the slots are `leadingVisual`/`trailingVisual`.
- A `size="xs"` variant — TextInput sizing comes from the wrapper's `size` union only.
