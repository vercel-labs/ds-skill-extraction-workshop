# Components — ds

- package: `@primer/react`
- version: `38.26.0`

Every `ds` component is a 1:1 wrapper around its Primer counterpart. The prop surface listed under "Key props" below comes from the published types in `node_modules/@primer/react/dist/<Component>/`. Anything not listed here is either out of scope for this skill or unverified — do not invent.

The cross-component rule "wrap `<TextInput>` and `<Checkbox>` in `<FormControl>`" is repeated in each of the three relevant component sections. The duplication is intentional: an agent loading only one section must see the rule that affects it.

---

## Button

### Public imports

```tsx
import { Button } from "@/ds/components/Button";
```

The wrapper is at `ds/components/Button.tsx:17-19`. Do not deep-import from `@primer/react`.

### When to use

Any trigger that performs an action — submit a form, open a dialog, save changes, deploy. For navigation that changes URL, prefer an `<a>` (or your framework's `<Link>`) — Button is a `<button>` element under the hood. Use sibling component [FormControl](#formcontrol) when a Button conceptually controls input validity (rare; usually the Button just submits the form).

### Key props

- `variant` — `'default' | 'primary' | 'invisible' | 'danger' | 'link'`. Default `'default'`. (`@primer/react/dist/Button/types.d.ts:4`)
- `size` — `'small' | 'medium' | 'large'`. Default `'medium'`. (`@primer/react/dist/Button/types.d.ts:5`)
- `disabled` — boolean. Click blocked, button skipped by Tab, announced as unavailable. (`@primer/react/dist/Button/types.d.ts:21`)
- `inactive` — boolean. Click blocked **but** focus and tab order preserved; screen readers still announce the button as actionable. (`@primer/react/dist/Button/types.d.ts:37`)
- `loading` — boolean. Primer renders a built-in busy indicator. (`@primer/react/dist/Button/types.d.ts:31`)
- `loadingAnnouncement` — string. The text screen readers announce when `loading` is true. (`@primer/react/dist/Button/types.d.ts:35`)

### Best Practices

- For a submit button while a request is in flight, pass `disabled={isLoading}`, not `inactive`. `inactive` only blocks the click — the button stays in the tab order and screen readers still announce it as actionable, so a keyboard user can hit Enter and submit twice. (`ds/DESIGN.md:12-14`)
- Reach for `inactive` only when you want the button visible and tab-reachable but not triggerable yet — feature-gated UI, or a Deploy button waiting on a permission grant. Submit-during-request is the opposite case. (`ds/DESIGN.md:14`)
- Do not pass `aria-label` to a Button that already renders visible text children. The screen reader announces the `aria-label` and overrides the visible text, so the accessible name silently drifts from the visual label. (`ds/components/Button.docs.tsx:1-7`)
- Pick `variant="danger"` for destructive actions (delete, remove, revoke). Pick `variant="primary"` for the single most important action on the screen — at most one per surface. (`@primer/react/dist/Button/types.d.ts:4`)

### Composition

```tsx
import { Button } from "@/ds/components/Button";

export function SaveAction({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button variant="primary" type="submit" disabled={isSubmitting}>
      Save changes
    </Button>
  );
}
```

Source-of-truth for the documentary example: `ds/components/Button.docs.tsx:11-13`.

### Source references

- `ds/components/Button.tsx` — wrapper.
- `ds/components/Button.docs.tsx` — documentary example with the `aria-label` rule.
- `ds/DESIGN.md` — headline rule.
- `@primer/react/dist/Button/types.d.ts` — prop surface.
- `@primer/react/dist/Button/Button.d.ts` — `ButtonComponent` declaration.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Button inactive={isSubmitting} type="submit">Save</Button>` | `<Button disabled={isSubmitting} type="submit">Save</Button>` | `inactive` keeps the button in tab order and announces as actionable; a keyboard user can submit the form twice. (rule slug: `component/button-disabled-not-inactive`; `ds/DESIGN.md:12-14`) |
| `<Button aria-label="Save changes">Save changes</Button>` | `<Button>Save changes</Button>` | Duplicate accessible name; if the labels drift, the announced name silently overrides the visible one. (rule slug: `component/button-no-redundant-aria-label`; `ds/components/Button.docs.tsx:1-7`) |
| Trusting the JSDoc on `ds/components/Button.tsx:12-13` ("prefer `inactive` over `disabled`") | Trust `ds/DESIGN.md:12-14` and `Button.docs.tsx` | The wrapper JSDoc contradicts DESIGN.md. DESIGN.md is the canonical floor; the JSDoc is a known counter-example. |

### Things to never invent

- A `variant` outside the verified union `'default' | 'primary' | 'invisible' | 'danger' | 'link'`. There is no `'secondary'`, `'ghost'`, or `'outline'`.
- A `size` outside `'small' | 'medium' | 'large'`. There is no `'xs'` or `'xl'`.
- A `kind` prop. Primer uses `variant`.
- A `loading` *spinner* you render yourself; use the built-in `loading` prop and pair it with `loadingAnnouncement` if needed.

---

## TextInput

### Public imports

```tsx
import { TextInput } from "@/ds/components/TextInput";
```

The wrapper is at `ds/components/TextInput.tsx:13-15`.

### When to use

Single-line text entry — email, name, search query, URL. For longer-form text, reach for a `<textarea>` (not currently re-exported through `ds`). For boolean choices, use sibling component [Checkbox](#checkbox). Every `<TextInput>` lives inside a [FormControl](#formcontrol) — see Best Practices.

### Key props

- `loading` — boolean. Renders an inline loading indicator. (`@primer/react/dist/TextInput/TextInput.d.ts:9`)
- `leadingVisual` — element or node placed inside the input, before the typing area. (`@primer/react/dist/TextInput/TextInput.d.ts:19`)
- `trailingVisual` — element or node placed inside the input, after the typing area. (`@primer/react/dist/TextInput/TextInput.d.ts:25`)
- `validationStatus` — `'error' | 'success'` from `FormValidationStatus`. Affects ARIA wiring when the input lives inside a `<FormControl>`. (`@primer/react/dist/TextInput/TextInput.d.ts` non-passthrough props + `FormValidationStatus.d.ts`)
- Standard HTML input attributes (`name`, `value`, `defaultValue`, `onChange`, `placeholder`, `type`, `disabled`, etc.) are passed through.

### Best Practices

- Wrap every `<TextInput>` in a `<FormControl>` and pair it with a `<FormControl.Label>`. A bare `<TextInput>` loses the label association and fails axe. (`ds/components/FormControl.docs.tsx:4-5`)
- Use `leadingVisual` / `trailingVisual` for in-input icons, not the deprecated `icon` prop. (`@primer/react/dist/TextInput/TextInput.d.ts:7-8`)
- For validation messaging, render a `<FormControl.Validation variant="error">` alongside the input rather than ad-hoc error text. The Validation slot wires the input's ARIA describedby for free.

### Composition

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";

export function EmailField({ error }: { error?: string }) {
  return (
    <FormControl>
      <FormControl.Label>Email</FormControl.Label>
      <TextInput name="email" type="email" />
      <FormControl.Caption>We never share your email.</FormControl.Caption>
      {error ? <FormControl.Validation variant="error">{error}</FormControl.Validation> : null}
    </FormControl>
  );
}
```

Documentary example source: `ds/components/FormControl.docs.tsx:11-17`.

### Source references

- `ds/components/TextInput.tsx` — wrapper.
- `ds/components/FormControl.docs.tsx` — composition example with the wrap-in-FormControl rule.
- `@primer/react/dist/TextInput/TextInput.d.ts` — prop surface, including the `@deprecated` marker on `icon`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<TextInput name="email" />` (bare, no FormControl) | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput name="email" /></FormControl>` | Bare input has no programmatic label; fails axe and screen readers cannot announce a name. (rule slug: `component/form-control-wrap-inputs`; `ds/components/FormControl.docs.tsx:4-5`) |
| `<TextInput icon={SearchIcon} />` | `<TextInput leadingVisual={SearchIcon} />` | `icon` is `@deprecated` per the published types; use `leadingVisual` / `trailingVisual`. (rule slug: `component/text-input-icon-deprecated`; `@primer/react/dist/TextInput/TextInput.d.ts:7-8`) |

### Things to never invent

- A `helperText` prop. Hints go in `<FormControl.Caption>`.
- An `errorText` prop. Errors go in `<FormControl.Validation variant="error">`.
- A `<TextInput>` outside a `<FormControl>`.

---

## Checkbox

### Public imports

```tsx
import { Checkbox } from "@/ds/components/Checkbox";
```

The wrapper is at `ds/components/Checkbox.tsx:13-15`.

### When to use

A single boolean choice the user toggles — subscribe, agree-to-terms, enable a feature. For a list of mutually exclusive options, reach for a Radio (not currently re-exported). For multi-select from a list, use one `<Checkbox>` per item, each in its own `<FormControl>`. Every `<Checkbox>` lives inside a [FormControl](#formcontrol) — see Best Practices.

### Key props

- `disabled` — boolean. (`@primer/react/dist/Checkbox/Checkbox.d.ts:12`)
- `indeterminate` — boolean. Applies the indeterminate visual (the dash). Useful for a "select-all" parent above a list of child checkboxes. (`@primer/react/dist/Checkbox/Checkbox.d.ts:8`)
- `required` — boolean. (`@primer/react/dist/Checkbox/Checkbox.d.ts:16`)
- `validationStatus` — `'error' | 'success'`. **Important:** per the types JSDoc, this only informs ARIA attributes — individual checkboxes do not have validation styles. (`@primer/react/dist/Checkbox/Checkbox.d.ts:23-26`)
- `value` — string. The form-submission value when checked. (`@primer/react/dist/Checkbox/Checkbox.d.ts:32-33`)
- Standard input attributes (`name`, `defaultChecked`, `checked`, `onChange`) are passed through.

### Best Practices

- Wrap every `<Checkbox>` in a `<FormControl>` and pair it with a `<FormControl.Label>`. A bare `<Checkbox>` loses the label association and fails axe. (`ds/components/FormControl.docs.tsx:4-5`)
- Use `<FormControl layout="horizontal">` when the checkbox sits with its label inline — the FormControl docs note horizontal is the layout for checkbox/radio inputs. (`@primer/react/dist/FormControl/FormControl.d.ts:18-19`)
- Setting `validationStatus="error"` on a Checkbox alone changes nothing visual — surface the error with `<FormControl.Validation variant="error">` adjacent. (`@primer/react/dist/Checkbox/Checkbox.d.ts:23-26`)

### Composition

```tsx
import { Checkbox } from "@/ds/components/Checkbox";
import { FormControl } from "@/ds/components/FormControl";

export function SubscribeField() {
  return (
    <FormControl layout="horizontal">
      <FormControl.Label>Subscribe to updates</FormControl.Label>
      <Checkbox name="subscribe" defaultChecked />
    </FormControl>
  );
}
```

### Source references

- `ds/components/Checkbox.tsx` — wrapper.
- `@primer/react/dist/Checkbox/Checkbox.d.ts` — prop surface and the validationStatus JSDoc caveat.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Checkbox name="agree" />` (bare, no FormControl) | `<FormControl><FormControl.Label>I agree</FormControl.Label><Checkbox name="agree" /></FormControl>` | Bare checkbox has no programmatic label; fails axe. (rule slug: `component/form-control-wrap-inputs`; `ds/components/FormControl.docs.tsx:4-5`) |
| `<Checkbox validationStatus="error" />` alone, expecting red styling | `<FormControl><Checkbox validationStatus="error" /><FormControl.Validation variant="error">Required</FormControl.Validation></FormControl>` | `validationStatus` only sets ARIA attributes on Checkbox; render `<FormControl.Validation>` for the visible message. (`@primer/react/dist/Checkbox/Checkbox.d.ts:23-26`) |

### Things to never invent

- A `label` prop on Checkbox. Use `<FormControl.Label>`.
- A `helperText` prop. Use `<FormControl.Caption>`.
- A "switch" or "toggle" variant. Switch is a separate component (not currently re-exported through `ds`).

---

## FormControl

### Public imports

```tsx
import { FormControl } from "@/ds/components/FormControl";
```

The wrapper is at `ds/components/FormControl.tsx:20-22`. It re-exports Primer's compound `FormControl`, preserving the subcomponents `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`, `FormControl.LeadingVisual`.

### When to use

Always, when rendering a [TextInput](#textinput) or a [Checkbox](#checkbox) (or any other input). `<FormControl>` provides the label-input association, the caption (helper text), and the validation slot. Bare inputs are an anti-pattern (`ds/components/FormControl.docs.tsx:4-5`).

### Key props

`<FormControl>`:

- `id` — string. Used to associate label, validation text, caption text. (`@primer/react/dist/FormControl/FormControl.d.ts:7-8`)
- `required` — boolean. Marks the field as required for form submission. (`@primer/react/dist/FormControl/FormControl.d.ts:11-12`)
- `disabled` — boolean. Disables the wrapped input. (`@primer/react/dist/FormControl/FormControl.d.ts:4-5`)
- `layout` — `'horizontal' | 'vertical'`. Default `'vertical'`; use `'horizontal'` for checkbox and radio inputs. (`@primer/react/dist/FormControl/FormControl.d.ts:15-19`)

`<FormControl.Label>`:

- `htmlFor` — string. Usually inferred from the FormControl's `id`. (`@primer/react/dist/FormControl/FormControlLabel.d.ts`)
- Children are the label text.

`<FormControl.Validation>`:

- `variant` — `'error' | 'success'`. **REQUIRED** (not optional). (`@primer/react/dist/FormControl/_FormControlValidation.d.ts:6`, `FormValidationStatus.d.ts`)
- Children are the validation message.

`<FormControl.Caption>`: children are the helper text. No required props.

### Best Practices

- Wrap every input (`<TextInput>`, `<Checkbox>`, etc.) in a `<FormControl>`. Bare inputs lose label association and fail axe. (`ds/components/FormControl.docs.tsx:4-5`)
- Always render a `<FormControl.Label>` as the first child. The label is what associates the input to its accessible name.
- Pass `variant` to every `<FormControl.Validation>` — it is a required prop. The type system will reject `<FormControl.Validation>Invalid</FormControl.Validation>` without it. (`@primer/react/dist/FormControl/_FormControlValidation.d.ts:6`)
- Use `layout="horizontal"` for checkbox/radio inputs; leave the default `'vertical'` for text inputs. (`@primer/react/dist/FormControl/FormControl.d.ts:15-19`)

### Composition

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";

export function EmailField({ error }: { error?: string }) {
  return (
    <FormControl>
      <FormControl.Label>Email</FormControl.Label>
      <TextInput name="email" type="email" />
      <FormControl.Caption>We never share your email.</FormControl.Caption>
      {error ? <FormControl.Validation variant="error">{error}</FormControl.Validation> : null}
    </FormControl>
  );
}
```

Documentary source: `ds/components/FormControl.docs.tsx:11-17`.

### Source references

- `ds/components/FormControl.tsx` — wrapper.
- `ds/components/FormControl.docs.tsx` — composition floor.
- `@primer/react/dist/FormControl/FormControl.d.ts` — `FormControlProps` and the subcomponent map.
- `@primer/react/dist/FormControl/_FormControlValidation.d.ts` — `variant` required.
- `@primer/react/dist/FormControl/FormControlLabel.d.ts` — `htmlFor`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<TextInput name="email" />` (no FormControl) | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput name="email" /></FormControl>` | Bare input loses label association; fails axe. (rule slug: `component/form-control-wrap-inputs`; `ds/components/FormControl.docs.tsx:4-5`) |
| `<FormControl.Validation>Invalid email</FormControl.Validation>` | `<FormControl.Validation variant="error">Invalid email</FormControl.Validation>` | `variant` is required; types reject the bare form. (rule slug: `component/form-control-validation-required-variant`; `@primer/react/dist/FormControl/_FormControlValidation.d.ts:6`) |
| `<label htmlFor="email">Email</label>` next to a `<TextInput id="email" />` | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput /></FormControl>` | Manually wiring `htmlFor` bypasses Primer's id/aria-describedby plumbing; FormControl handles it. |

### Things to never invent

- A `<FormControl.Label htmlFor>` value that does not match the FormControl's `id`. Let FormControl do the wiring.
- A `<FormControl.Validation>` without `variant`. The prop is required.
- A `<FormControl.Hint>` or `<FormControl.Helper>`. The helper-text slot is `<FormControl.Caption>`.
- A `layout` value other than `'horizontal' | 'vertical'`.
