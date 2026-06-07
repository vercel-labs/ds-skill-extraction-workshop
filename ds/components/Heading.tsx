import { Heading as PrimerHeading } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped heading. Thin re-export — import from `@/ds/components/Heading`. */
export const Heading = PrimerHeading;

export type HeadingProps = ComponentProps<typeof PrimerHeading>;
