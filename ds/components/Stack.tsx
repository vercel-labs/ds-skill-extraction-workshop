import { Stack as PrimerStack } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped layout stack. Thin re-export — import from `@/ds/components/Stack`. */
export const Stack = PrimerStack;

export type StackProps = ComponentProps<typeof PrimerStack>;
