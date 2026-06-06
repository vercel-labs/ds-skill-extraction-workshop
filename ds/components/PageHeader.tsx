import { PageHeader as PrimerPageHeader } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped page header.
 *
 * Thin re-export of Primer's compound `PageHeader`. Public API only — do not
 * deep-import from `@primer/react`. The compound subcomponents are preserved:
 *
 *   <PageHeader>
 *     <PageHeader.ContextArea>...</PageHeader.ContextArea>
 *     <PageHeader.TitleArea>
 *       <PageHeader.LeadingVisual>...</PageHeader.LeadingVisual>
 *       <PageHeader.Title>...</PageHeader.Title>
 *       <PageHeader.TrailingVisual>...</PageHeader.TrailingVisual>
 *     </PageHeader.TitleArea>
 *     <PageHeader.Actions>...</PageHeader.Actions>
 *     <PageHeader.TrailingAction>...</PageHeader.TrailingAction>
 *     <PageHeader.Navigation>...</PageHeader.Navigation>
 *   </PageHeader>
 *
 * Slot placement rules live in `ds/DESIGN.md` (headline) and
 * `PageHeader.docs.tsx`.
 */
export const PageHeader = PrimerPageHeader;

export type PageHeaderProps = ComponentProps<typeof PrimerPageHeader>;
