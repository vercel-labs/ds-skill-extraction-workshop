/**
 * Banner — documentary example.
 *
 * Variant semantics rule: `variant` is semantic, not cosmetic. Pick by what
 * the user must do, not by which colour the design calls for.
 *
 *   - `critical` — blocking failure the user must resolve before continuing
 *                  (payment failed; deploy blocked; data loss imminent).
 *   - `warning`  — important but non-blocking (deadline approaching; an
 *                  upcoming policy change; deprecated config still works).
 *   - `info`     — neutral information (a feature is rolling out; a sync
 *                  finished).
 *   - `success`  — a user-initiated action completed.
 *   - `upsell`   — promote an opt-in (Pro plan; beta program).
 *
 * The trap: models reach for `critical` whenever the design looks red, even
 * when the message is non-blocking. `critical` maps to an `alert`-style
 * landmark and stronger announcement urgency — it is not a colour swap.
 */
import { Banner } from "./Banner";

export function BannerExample() {
  return (
    <Banner
      variant="warning"
      title="Two-factor authentication required next month"
      description="Set it up before July 1 to keep your account active."
    />
  );
}
