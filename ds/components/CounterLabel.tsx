import { CounterLabel as PrimerCounterLabel } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped counter badge. Thin re-export — import from `@/ds/components/CounterLabel`. */
export const CounterLabel = PrimerCounterLabel;

export type CounterLabelProps = ComponentProps<typeof PrimerCounterLabel>;
