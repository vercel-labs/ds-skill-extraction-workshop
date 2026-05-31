import { Button as PrimerButton } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped button.
 *
 * Thin wrapper over Primer's `Button`. Public API only — do not deep-import
 * from `@primer/react`. The wrapper exists so the workshop's design system has
 * a single named export per component for the meta-skill to discover.
 *
 * Note: prefer `inactive` over `disabled` for buttons that should remain
 * focusable and announce their unavailable state to assistive tech.
 * See `ds/DESIGN.md` for the rule.
 */
export type ButtonProps = ComponentProps<typeof PrimerButton>;

export function Button(props: ButtonProps) {
  return <PrimerButton {...props} />;
}
