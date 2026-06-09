import { Avatar as PrimerAvatar } from "@primer/react";
import type { ComponentProps } from "react";

/** DS-scoped avatar. Thin re-export — import from `@/ds/components/Avatar`. */
export const Avatar = PrimerAvatar;

export type AvatarProps = ComponentProps<typeof PrimerAvatar>;
