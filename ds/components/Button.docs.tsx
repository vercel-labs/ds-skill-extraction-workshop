/**
 * Button — documentary example.
 *
 * A11y rule: Do not pass `aria-label` to a Button that already renders visible
 * text. Screen readers will announce the aria-label, overriding the visible
 * label, and the button's accessible name will silently drift from its
 * visual label.
 */
import { Button } from "./Button";

export function ButtonExample() {
  return <Button variant="primary">Save changes</Button>;
}
