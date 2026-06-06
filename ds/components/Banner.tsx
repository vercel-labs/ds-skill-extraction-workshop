import { Banner as PrimerBanner } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped banner.
 *
 * Thin re-export of Primer's `Banner`. Public API only — do not deep-import
 * from `@primer/react`. The compound subcomponents (`Title`, `Description`,
 * `PrimaryAction`, `SecondaryAction`) are preserved.
 *
 * `variant` is semantic, not cosmetic. See `Banner.docs.tsx` for the rule:
 * `critical` is for blocking failures only; reach for `warning` or `info`
 * when the message is non-blocking, even if the design calls for red.
 */
export const Banner = PrimerBanner;

export type BannerProps = ComponentProps<typeof PrimerBanner>;
