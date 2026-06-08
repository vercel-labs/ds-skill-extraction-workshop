## Tokens — @primer/primitives

Canonical source: `node_modules/@primer/primitives/dist/css/`. All tokens are CSS custom properties.

### Color tokens

Primer uses a semantic color system with `fgColor-*`, `bgColor-*`, and `borderColor-*` namespaces. Colors adapt automatically across light and dark themes via `data-color-mode` and `data-light-theme` / `data-dark-theme` attributes.

| Token | Resolved value (light) | Use when |
|---|---|---|
| `--fgColor-default` | `#1f2328` | Default text color |
| `--fgColor-muted` | `#59636e` | Secondary, de-emphasized text |
| `--fgColor-accent` | `#0969da` | Link text, interactive accent text |
| `--fgColor-success` | `#1a7f37` | Success state text |
| `--fgColor-attention` | `#9a6700` | Warning state text |
| `--fgColor-danger` | `#d1242f` | Error and destructive action text |
| `--bgColor-default` | `#ffffff` | Default page background |
| `--bgColor-muted` | `#f6f8fa` | Subtle, recessed background |
| `--bgColor-accent-emphasis` | `#0969da` | Strong accent background (selected, focused) |
| `--bgColor-success-emphasis` | `#1f883d` | Strong success background |
| `--bgColor-danger-emphasis` | `#cf222e` | Emphasized danger background |
| `--bgColor-attention-emphasis` | `#9a6700` | Strong warning background |
| `--borderColor-default` | `#d1d9e0` | Default border |
| `--borderColor-muted` | `#d8dee4` | Subtle border |

Source: `node_modules/@primer/primitives/dist/css/functional/themes/light.css`

### Spacing tokens

| Token | Value | Use when |
|---|---|---|
| `--space-xxs` | `0.125rem` (2px) | Ultra-compact: form field separators, tight visual divisions |
| `--space-xs` | `0.25rem` (4px) | Compact: small badges, tight internal spacing |
| `--space-sm` | `0.5rem` (8px) | Default spacing for most UI elements |
| `--space-md` | `0.75rem` (12px) | Relaxed: breathing room, comfortable container padding |
| `--space-lg` | `1rem` (16px) | Spacious: major layout divisions |
| `--space-xl` | `1.5rem` (24px) | Expansive: large sections, top-level structure separation |

Source: `node_modules/@primer/primitives/dist/css/functional/spacing/space.css`

### Typography tokens

| Token | Use when |
|---|---|
| `--text-body-shorthand-medium` | Default UI font. Body text. |
| `--text-body-shorthand-small` | Small body text: helper text, footnotes. |
| `--text-body-shorthand-large` | User-generated content, markdown rendering. |
| `--text-title-shorthand-small` | Same size as body-large with semibold weight. |
| `--text-title-shorthand-medium` | Default page title. 32px-equivalent line-height. |
| `--text-title-shorthand-large` | Page headings for user-created objects (issues, PRs). |
| `--text-subtitle-shorthand` | Page section headings, sub-headings. |
| `--text-display-shorthand` | Hero-style text for brand-to-product pages. |
| `--text-caption-shorthand` | Compact small font, 16px line-height. Single-line only. |
| `--fontStack-sansSerif` | Sans-serif stack: Mona Sans VF with system fallbacks. |
| `--fontStack-monospace` | Monospace stack: ui-monospace, SFMono-Regular, Menlo, Consolas. |

Source: `node_modules/@primer/primitives/dist/css/functional/typography/typography.css`

### Motion tokens

| Token | Value | Use when |
|---|---|---|
| `--motion-duration-micro` | `100ms` | Hover, focus ring, color shifts |
| `--motion-duration-short` | `200ms` | Expand/collapse, toggles, visibility changes |
| `--motion-duration-medium` | `300ms` | Modals, dropdowns entering viewport |
| `--motion-duration-long` | `500ms` | Complex multi-step animations. Use sparingly. |
| `--motion-transition-hover` | `100ms ease` | Hover state transitions on buttons and links |
| `--motion-transition-enter` | `300ms ease-out` | Elements entering viewport (modals, tooltips) |
| `--motion-transition-exit` | `200ms ease-in` | Elements exiting viewport (closing modals) |

Source: `node_modules/@primer/primitives/dist/css/functional/motion/motion.css`
