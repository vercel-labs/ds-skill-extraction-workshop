import { Checkbox as PrimerCheckbox } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped checkbox.
 *
 * Thin wrapper over Primer's `Checkbox`. Public API only — do not deep-import
 * from `@primer/react`. The wrapper exists so the workshop's design system has
 * a single named export per component for the meta-skill to discover.
 */
export type CheckboxProps = ComponentProps<typeof PrimerCheckbox>;

export function Checkbox(props: CheckboxProps) {
  return <PrimerCheckbox {...props} />;
}
