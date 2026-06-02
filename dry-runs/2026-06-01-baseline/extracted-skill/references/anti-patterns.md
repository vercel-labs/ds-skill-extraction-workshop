# Anti-patterns — ds

Cross-cutting traps with `Bad | Good | Why` rows. Component-specific traps live in `references/components.md` next to the component they apply to; this file lists ONLY traps that span more than one component or are headline enough to warrant a single home.

| Bad | Good | Why |
|-----|------|-----|
| `<Button inactive={isLoading}>Sign in</Button>` | `<Button disabled={isLoading}>Sign in</Button>` | `inactive` is a non-interactive *visual* state; the button is still focusable and screen readers still announce it as actionable, so a keyboard user can hit Enter and double-submit. `disabled` removes it from the Tab order and announces it as unavailable. (ds/DESIGN.md:12) Rule slug: `component/button-disabled-not-inactive`. Companion rule slug: `component/button-inactive-for-permission-gated-only` (`inactive` is correct for see-but-do-not-trigger-yet UI). |
| `<TextInput name="email" />` rendered bare | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput name="email" /></FormControl>` | Bare inputs lose the label association and fail axe. (ds/components/FormControl.docs.tsx:4-5) Rule slug: `component/formcontrol-wrap-inputs`. |
| `<Button aria-label="Save changes">Save changes</Button>` | `<Button>Save changes</Button>` | Screen readers announce the `aria-label` and override the visible text; the accessible name silently drifts from the visual label. (ds/components/Button.docs.tsx:2-7) Rule slug: `component/button-no-redundant-aria-label`. |
| `import { Button } from "@primer/react/lib-esm/Button"` | `import { Button } from "@/ds/components/Button"` | Deep-importing bypasses the `ds` wrapper, which exists so the workshop's design system has a single named export per component for the meta-skill to discover. (ds/components/Button.tsx:8-10) |
