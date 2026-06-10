# Foundation: icons

## What this covers

- Octicons inventory and size variants shipped by `@primer/octicons-react`. **The substantive usage/accessibility/sizing rules for this page were NOT extractable from the listing index** and the linked sub-pages (Design specs, Usage, Code) require separate fetches. The rules surfaced below are limited to what the index page confirms.

Source URL fetched: https://primer.style/foundations/icons (the path `/product/getting-started/foundations/icons` from Phase 1 redirects here).

### token/octicon-size-inventory

Octicons ships icons in five size variants — 12px, 16px, 24px, 48px, 96px. The 16px and 24px sets carry the bulk of icons; the 12px set is intentionally limited (~9 icons: alerts, chevrons, check-circle-fill, x, no-entry-fill) for dense contexts only; the 48px and 96px sizes are restricted to Copilot-branded surfaces.

**When it bites:** Passing `size={12}` on an icon that does not ship a 12px variant produces an upscaled 16px glyph at the wrong stroke weight; the icon reads as muddy.

| Bad | Good | Why |
|---|---|---|
| `<HeartIcon size={12} />` (no 12px variant) | `<HeartIcon size={16} />` | Only the ~9 enumerated icons ship a 12px set; everything else is 16/24+. |
| `<RepoIcon size={48} />` on a product surface | `<RepoIcon size={16} />` or `<RepoIcon size={24} />` | 48px and 96px sets are Copilot-branding-only per the index. |

Source: https://primer.style/foundations/icons#octicon-nav-items-navigation

### token/octicon-fill-variants

Icons that ship outline + filled variants (e.g., `BellIcon` + `BellFillIcon`, `HeartIcon` + `HeartFillIcon`, `BookmarkIcon` + `BookmarkFillIcon`) form a toggled-state pair — outline for the default/inactive state, fill for the active/toggled state. Mixing the two within a single toggle row breaks the read.

**When it bites:** A "favorite" toggle that flips between `<StarIcon />` (correct) and `<HeartFillIcon />` (mismatched icon entirely) reads as two unrelated controls instead of one stateful toggle.

| Bad | Good | Why |
|---|---|---|
| Toggle between `<HeartIcon />` and `<StarFillIcon />` | Toggle between `<HeartIcon />` and `<HeartFillIcon />` | The outline/fill pair is a designed pair; swapping the family breaks the toggle metaphor. |

Source: https://primer.style/foundations/icons#octicon-nav-items-navigation

[VERIFY: Sizing-decision rules (when 16 vs 24), color/token pairing (`currentColor` vs `--fgColor-*`), accessibility rules (`aria-label` vs `aria-hidden`), and icon-only-vs-icon+text patterns were NOT extractable from the fetched index page. The substantive rules live behind `/octicons/design-guidelines`, `/octicons/usage-guidelines`, and `/octicons/code` — a follow-up Phase 2 iteration should fetch those subpages or the produced skill should mark these rules deferred.]
