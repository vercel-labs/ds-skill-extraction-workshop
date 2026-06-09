import { Label as PrimerLabel } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped label pill. Thin re-export — import from `@/ds/components/Label`. */
export const Label = PrimerLabel;

export type LabelProps = ComponentProps<typeof PrimerLabel>;
