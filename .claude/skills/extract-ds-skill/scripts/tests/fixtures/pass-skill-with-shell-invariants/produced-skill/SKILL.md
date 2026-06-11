---
name: produced-skill
description: Test fixture — produced-skill ships ≥1 Hard Rule referencing body/root/provider + a surface token AND the cited shell/<slug> resolves to a Layer B row in produced anti-patterns.md. SHELL_INVARIANTS must PASS.
---

## Setup

Source: `<reference-project>` @ `src/app/layout.tsx`

```tsx
import { ThemeProvider, BaseSurface } from 'ds-react'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| button asks | references/components/button.md | per-component file |

## Hard rules

- The body/root MUST paint with `var(--ds-surface-default)` via either the `<BaseSurface style>` prop OR `body { background-color: var(--ds-surface-default); color: var(--ds-text-default); }` in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- `<ThemeProvider>` MUST wrap children, not render as a sibling — provider context only reaches descendants, see `shell/provider-missing-content-wrap`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.

## Final checks

After generating UI: cite each component used to its source file; list any `[VERIFY]` markers; name the screen-level prompt built; AND confirm shell parity: the page/root surface paints with `var(--ds-surface-default)`; the provider wraps children, not siblings.

In scope: tokens, assets, component descriptions, component APIs.
