---
name: produced-skill
description: Test fixture — produced SKILL.md ships a complete Setup (root-entry-file + Companion CSS) but Hard rules has zero lines matching shell vocabulary AND a token shape. SHELL_INVARIANTS must FAIL with the count assertion message naming the three pre-seeded slugs.
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
| button asks | references/components/button.md | per-component file |

## Hard rules

- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.
- Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.

## Final checks

After generating UI: cite each component used to its source file; list any `[VERIFY]` markers; name the screen-level prompt built.

In scope: tokens, assets, component descriptions, component APIs.
