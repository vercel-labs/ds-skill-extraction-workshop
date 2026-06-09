import { Textarea as PrimerTextarea } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped multi-line input.
 *
 * Thin re-export of Primer's `Textarea`. Always wrap in `FormControl`.
 */
export const Textarea = PrimerTextarea;

export type TextareaProps = ComponentProps<typeof PrimerTextarea>;
