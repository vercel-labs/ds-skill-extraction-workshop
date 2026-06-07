import { IconButton as PrimerIconButton } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped icon-only button.
 *
 * Thin re-export of Primer's `IconButton`. `aria-label` is required — see
 * `IconButton.docs.tsx`.
 */
export const IconButton = PrimerIconButton;

export type IconButtonProps = ComponentProps<typeof PrimerIconButton>;
