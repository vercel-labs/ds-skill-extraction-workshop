import { Text as PrimerText } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped text. Thin re-export — import from `@/ds/components/Text`. */
export const Text = PrimerText;

export type TextProps = ComponentProps<typeof PrimerText>;
