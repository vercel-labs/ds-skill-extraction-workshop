---
title: TextInput
description: Single-line text input with leading/trailing visual slots, loading indicator, validation styling, and character limit.
---

# TextInput

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { TextInput } from '@primer/react'`

## When to use

Use TextInput for single-line text entry. For multi-line entry use [Textarea](./textarea.md); for a fixed option list use [Select](./select.md). Always wrap in [FormControl](./form-control.md) for label association.

## Key props

- `leadingVisual` / `trailingVisual` — visual inside the input before/after the typing area; accepts a component reference or node (node_modules/@primer/react/dist/TextInput/TextInput.d.ts:22,26)
- `trailingAction` — a button element after the typing area (TextInput.d.ts:30); `TextInput.Action` is the shipped subcomponent for it (TextInput.d.ts:40-46)
- `loading` — show a loading indicator (TextInput.d.ts:9)
- `loaderPosition` — `'auto' | 'leading' | 'trailing'`; `'auto'` (default) renders at the end unless a `leadingVisual` is passed (TextInput.d.ts:10-16)
- `loaderText` — screen-reader text for the loading state (TextInput.d.ts:18)
- `characterLimit` — renders a character counter below the input; exceeding it applies validation styling (TextInput.d.ts:31-35)
- `block` / `contrast` / `monospace` / `size` / `validationStatus` — wrapper styling passthrough (TextInput.d.ts:36, via dist/internal/components/TextInputWrapper.d.ts:5-14)
- `validationStatus` — `'error' | 'success'` only (dist/utils/types/FormValidationStatus.d.ts:1)
- `icon` — DEPRECATED; use `leadingVisual`/`trailingVisual` instead (TextInput.d.ts:6-7)

## Best Practices

- Never render a TextInput outside a [FormControl](./form-control.md) — label association breaks; `FormControl.Label` provides it (references/examples/new.md pattern; dist/FormControl/FormControl.d.ts:10-12).
- Use `block` for form-width inputs inside a form card — lifted from the new exemplar (`references/examples/new.md`).
- Never use the deprecated `icon` prop — `leadingVisual`/`trailingVisual` replaced it (TextInput.d.ts:6-7).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { FormControl, TextInput } from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";

<FormControl required>
  <FormControl.Label>Repository name</FormControl.Label>
  <TextInput block placeholder="awesome-project" leadingVisual={RepoIcon} />
  <FormControl.Caption>
    Great repository names are short and memorable.
  </FormControl.Caption>
</FormControl>
```

## Source references

- `node_modules/@primer/react/dist/TextInput/TextInput.d.ts` — published prop types
- `node_modules/@primer/react/dist/internal/components/TextInputWrapper.d.ts` — `block`/`contrast`/`monospace`/`validationStatus` source
- `primer/react` @ main: `packages/react/src/TextInput/TextInput.docs.json` + `TextInput.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `validationStatus="warning"` | `validationStatus="error"` or `"success"` | `FormValidationStatus` is a two-value union (FormValidationStatus.d.ts:1) |
| bare `<label>` + `<TextInput />` siblings | `<FormControl><FormControl.Label>...</FormControl.Label><TextInput /></FormControl>` | FormControl wires the `id`/`htmlFor` association (FormControl.d.ts:10-12) |
| `icon={SearchIcon}` | `leadingVisual={SearchIcon}` | `icon` is deprecated (TextInput.d.ts:6-7) |

## Things to never invent

- Props not listed under "Key props".
- `validationStatus` values outside `'error' | 'success'` — there is no `warning`.
- `loaderPosition` values outside `'auto' | 'leading' | 'trailing'`.
- Sibling components not present in the in-scope set.
