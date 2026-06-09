/**
 * Button — documentary example.
 *
 * A11y rule: do NOT pass `aria-label` to a `Button` that already renders
 * visible text. Screen readers announce the `aria-label` and override the
 * visible label; the accessible name silently drifts from the visual label.
 *
 * Loading rule: use `disabled={isSubmitting}` on submit buttons, NOT
 * `inactive={isSubmitting}`. `inactive` is a visual-only state — screen
 * readers still announce the button as actionable and keyboard users can
 * still activate it.
 *
 * Icon rule: pass the icon component to `leadingVisual` / `trailingVisual`
 * (`leadingVisual={PlusIcon}`), never JSX (`leadingVisual={<PlusIcon />}`).
 */
import { Button } from "./Button";

export function ButtonExample() {
  return (
    <Button type="submit" variant="primary">
      Create repository
    </Button>
  );
}
