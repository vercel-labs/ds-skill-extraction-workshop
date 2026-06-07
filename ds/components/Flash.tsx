import { Flash as PrimerFlash } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped inline message.
 *
 * Thin re-export of Primer's `Flash`. Use for simple inline notes inside a
 * form card. See `Flash.docs.tsx` — do not substitute experimental `Banner`
 * for account-context callouts in this workshop surface.
 */
export const Flash = PrimerFlash;

export type FlashProps = ComponentProps<typeof PrimerFlash>;
