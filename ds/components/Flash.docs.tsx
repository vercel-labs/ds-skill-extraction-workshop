/**
 * Flash — documentary example.
 *
 * Use `Flash` for a simple inline note inside a form or card
 * (`variant="default"` for neutral account context). Reach for experimental
 * `Banner` only when you need title + description + dismiss actions — this
 * workshop's create-repository card uses `Flash`, not `Banner`.
 */
import { Flash } from "./Flash";

export function FlashExample() {
  return (
    <Flash variant="default">
      You are creating this repository in your personal account.
    </Flash>
  );
}
