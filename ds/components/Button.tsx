import { Button as PrimerButton } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped button.
 *
 * Thin re-export of Primer's `Button`. See `Button.docs.tsx` for the
 * `disabled` vs `inactive` headline rule and the no-redundant-`aria-label`
 * rule.
 */
export const Button = PrimerButton;

export type ButtonProps = ComponentProps<typeof PrimerButton>;
