---
name: produced-skill
description: Test fixture — produced SKILL.md sets a `data-*-color-scheme` attribute in the root-entry-file code block. Hard Rules cites `shell/mode-attribute-no-theme-import` to pair the attribute with a theme import, but no row appears in produced anti-patterns.md. Cross-check must FAIL.
---

## Setup

Source: `<reference-project>` @ `src/app/layout.tsx`

```tsx
import { ThemeProvider, BaseSurface } from 'ds-react'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-ds-color-scheme="dark">
      <body>
        <ThemeProvider>
          <BaseSurface style={{ backgroundColor: 'var(--ds-surface-default)' }}>
            {children}
          </BaseSurface>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Companion CSS — src/app/globals.css

```css
@import "ds-themes/light.css";

body {
  background-color: var(--ds-surface-default);
  color: var(--ds-text-default);
}
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| button asks | references/components/button.md | per-component file |

## Hard rules

- The body/root MUST paint with `var(--ds-surface-default)` via the `<BaseSurface style>` prop OR `body { background-color: ... }` in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- `<html data-ds-color-scheme="<mode>">` MUST be paired with the matching theme CSS import (`@import "ds-themes/<mode>.css";`). The attribute sets the resolution context; the import provides the values — see `shell/mode-attribute-no-theme-import`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.

## Final checks

After generating UI: cite each component used; confirm shell parity.

In scope: tokens, assets, component descriptions, component APIs.
