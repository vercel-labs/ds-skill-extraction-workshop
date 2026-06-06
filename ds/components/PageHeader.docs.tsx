/**
 * PageHeader — documentary example.
 *
 * Slot composition rule (the project's headline floor — see `ds/DESIGN.md`):
 *
 *   INSIDE `<PageHeader.TitleArea>`:
 *     - `PageHeader.LeadingVisual`
 *     - `PageHeader.Title`
 *     - `PageHeader.TrailingVisual`
 *
 *   OUTSIDE `<PageHeader.TitleArea>` (direct children of `<PageHeader>`):
 *     - `PageHeader.ContextArea`     (breadcrumbs, parent links)
 *     - `PageHeader.Actions`         (primary action buttons)
 *     - `PageHeader.TrailingAction`  (single trailing button, e.g. overflow)
 *     - `PageHeader.Navigation`      (underline-nav tabs)
 *
 * TypeScript does not enforce the nesting; the wrong shape renders but breaks
 * the layout grid (visuals float free of the title, actions collapse into
 * it). The trap: models commonly drop `Actions` inside `TitleArea` because
 * "they belong with the title".
 */
import { PageHeader } from "./PageHeader";

export function PageHeaderExample() {
  return (
    <PageHeader>
      <PageHeader.TitleArea>
        <PageHeader.LeadingVisual>
          <span aria-hidden="true">R</span>
        </PageHeader.LeadingVisual>
        <PageHeader.Title>my-repo</PageHeader.Title>
      </PageHeader.TitleArea>
      <PageHeader.Actions>
        <button type="button">New issue</button>
      </PageHeader.Actions>
    </PageHeader>
  );
}
