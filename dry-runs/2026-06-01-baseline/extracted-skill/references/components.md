# Components — ds

- package: `ds` (in-repo at `ds/components/`)
- version: pinned to `@primer/react@38.26.0` via `package.json:15`

The `ds` package re-exports four components from `@primer/react`. Every wrapper's prop type is `ComponentProps<typeof PrimerX>` — so the prop surface IS Primer's, and any rule about Primer props applies to `ds` unchanged.

---

## Button

### Public imports

```tsx
import { Button } from "@/ds/components/Button";
```

### When to use

Any clickable action trigger: submits, primary calls-to-action, secondary actions. For a submit button on a form that is currently in-flight, see the headline rule in **Best Practices** below.

### Key props

- `disabled` — boolean. Disables the click handler AND removes the button from the Tab order AND announces the button as unavailable to assistive tech. Use for "this action is temporarily unavailable" states, including in-flight submit (ds/DESIGN.md:12).
- `inactive` — boolean. Disables the click handler ONLY. The button remains focusable and screen readers still announce it as actionable. Use for legitimate "see-but-do-not-trigger-yet" cases: feature-gated UI, a Deploy button awaiting a permission grant (ds/DESIGN.md:14).
- `variant` — `"primary" | "danger" | "invisible" | "default"` (inherited from Primer's `ButtonProps`). Default `"default"`. The example at `ds/components/Button.docs.tsx:12` uses `variant="primary"`.
- `type` — standard HTML button type (`"button" | "submit" | "reset"`). Inherited from React's `ButtonHTMLAttributes`.

### Best Practices

- Use `disabled={isLoading}` on submit buttons, NOT `inactive={isLoading}`. `inactive` is a non-interactive *visual* state and screen readers still announce the button as actionable; a keyboard user can still hit Enter and double-submit the form. (ds/DESIGN.md:12) Rule slug: `component/button-disabled-not-inactive`.
- Use `inactive` ONLY for the feature-gated / permission-pending case: a button you want users to see and tab to but not trigger yet, where the lack of interaction is intentional and the user will eventually unlock it. (ds/DESIGN.md:14) Rule slug: `component/button-inactive-for-permission-gated-only`.
- Do NOT pass `aria-label` to a `Button` that already renders visible text. Screen readers will announce the `aria-label`, overriding the visible label, and the button's accessible name will silently drift from its visual label. (ds/components/Button.docs.tsx:2-7) Rule slug: `component/button-no-redundant-aria-label`.

### Composition examples

```tsx
// Submit button on a sign-in form, in-flight handling per headline rule.
import { Button } from "@/ds/components/Button";

export function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" variant="primary" disabled={isLoading}>
      Sign in
    </Button>
  );
}
```

### Source references

- `ds/components/Button.tsx` — wrapper implementation
- `ds/components/Button.docs.tsx:2-7` — `aria-label` a11y rule (JSDoc)
- `ds/DESIGN.md:12-14` — `disabled` vs `inactive` headline rule
- `[VERIFY]` `ds/components/Button.tsx:12-13` — JSDoc on this file contradicts DESIGN.md (says "prefer `inactive` over `disabled`"). DESIGN.md wins. DS-team-side documentation bug.

### Common mistakes

- **Bad:** `<Button inactive={isLoading}>Sign in</Button>` — keyboard user hits Enter, form submits twice.
- **Good:** `<Button disabled={isLoading}>Sign in</Button>` — button is removed from Tab order and announced as unavailable.
- **Why:** `inactive` is a visual state only; `disabled` is the semantic+visual state for "temporarily unavailable" (ds/DESIGN.md:12).

### Things to never invent

- Props not in `ComponentProps<typeof PrimerButton>` (e.g. `loading`, `isLoading`, `busy` — they do not exist on this surface). If you want a loading state, derive it in your own component state and pass `disabled={isLoading}`.
- `variant` values other than `"primary" | "danger" | "invisible" | "default"`.

---

## TextInput

### Public imports

```tsx
import { TextInput } from "@/ds/components/TextInput";
```

### When to use

Any single-line text entry: email, password, search, name, etc. Always wrap in `<FormControl>` — see Best Practices.

### Key props

- `name` — string. Standard HTML name attribute, inherited from React's `InputHTMLAttributes`. Used for form submission.
- `type` — string (`"text" | "email" | "password" | ...`). Standard HTML input type. Default `"text"`.
- `required`, `placeholder`, `value`, `onChange`, etc. — all standard `InputHTMLAttributes`, passed through.

### Best Practices

- Wrap every `TextInput` in [`<FormControl>`](#formcontrol). Bare inputs lose the label association and fail axe. (ds/components/FormControl.docs.tsx:4-5) Rule slug: `component/formcontrol-wrap-inputs`.

### Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";

export function EmailField() {
  return (
    <FormControl>
      <FormControl.Label>Email</FormControl.Label>
      <TextInput name="email" type="email" required />
    </FormControl>
  );
}
```

### Source references

- `ds/components/TextInput.tsx` — wrapper implementation
- `ds/components/FormControl.docs.tsx:4-5` — wrapping rule

### Common mistakes

- **Bad:** `<TextInput name="email" />` rendered without a wrapping `<FormControl>` and label.
- **Good:** `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput name="email" /></FormControl>`.
- **Why:** screen readers cannot associate the input with a label, axe fails.

### Things to never invent

- Custom prop names like `label` directly on `TextInput`. The label lives on `<FormControl.Label>`.

---

## Checkbox

### Public imports

```tsx
import { Checkbox } from "@/ds/components/Checkbox";
```

### When to use

Any controlled boolean input. Always wrap in `<FormControl>` — see Best Practices.

### Key props

- `name` — string. Standard HTML name attribute.
- `checked`, `defaultChecked`, `onChange` — all standard `InputHTMLAttributes`, passed through.

### Best Practices

- Wrap every `Checkbox` in [`<FormControl>`](#formcontrol). Bare inputs lose the label association and fail axe. (ds/components/FormControl.docs.tsx:4-5) Rule slug: `component/formcontrol-wrap-inputs`.

### Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { Checkbox } from "@/ds/components/Checkbox";

export function RememberMe() {
  return (
    <FormControl>
      <FormControl.Label>Remember me</FormControl.Label>
      <Checkbox name="remember" />
    </FormControl>
  );
}
```

### Source references

- `ds/components/Checkbox.tsx` — wrapper implementation
- `ds/components/FormControl.docs.tsx:4-5` — wrapping rule

### Common mistakes

- **Bad:** `<Checkbox name="remember" />` with no wrapping label.
- **Good:** wrapped in `<FormControl>` with `<FormControl.Label>`.
- **Why:** same as `TextInput` — label association required for axe and screen readers.

### Things to never invent

- A `label` string prop directly on `Checkbox`. Use `<FormControl.Label>`.

---

## FormControl

### Public imports

```tsx
import { FormControl } from "@/ds/components/FormControl";
```

### When to use

Wrap any `TextInput` or `Checkbox`. Provides label/caption/validation slots via compound subcomponents.

### Key props

- Compound subcomponents (preserved from Primer's re-export):
  - `FormControl.Label` — the label that associates with the wrapped input.
  - `FormControl.Caption` — helper text below the label.
  - `FormControl.Validation` — validation message; `variant="error" | "success" | "warning"`.

(ds/components/FormControl.tsx:13-18)

### Best Practices

- Every interactive input (`TextInput`, `Checkbox`) lives inside one of these. Bare inputs lose the label association and fail axe. (ds/components/FormControl.docs.tsx:4-5) Rule slug: `component/formcontrol-wrap-inputs`.

### Composition examples

```tsx
// From ds/components/FormControl.tsx:13-18 (JSDoc) — verbatim shape.
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";

export function EmailFieldWithCaption() {
  return (
    <FormControl>
      <FormControl.Label>Email</FormControl.Label>
      <TextInput name="email" />
      <FormControl.Caption>We never share your email.</FormControl.Caption>
      <FormControl.Validation variant="error">Invalid email</FormControl.Validation>
    </FormControl>
  );
}
```

### Source references

- `ds/components/FormControl.tsx:13-18` — compound-subcomponent JSDoc
- `ds/components/FormControl.docs.tsx:4-5` — composition floor rule

### Common mistakes

- **Bad:** `<label htmlFor="email">Email</label><TextInput id="email" />` — manual label association, easy to drift.
- **Good:** `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput name="email" /></FormControl>` — compound, idiomatic.
- **Why:** `FormControl` wires the `htmlFor`/`id` correctly and exposes the validation slot.

### Things to never invent

- Subcomponents not in `{Label, Caption, Validation}`. (No `FormControl.Help`, no `FormControl.Hint`.)
- A `validationVariant` prop directly on `FormControl`. The variant lives on `<FormControl.Validation>`.
