---
name: produced-skill
description: Test fixture — produced-skill mode, Setup section cites a reference-project file path. WIRING_NOT_SYNTHESIZED must PASS.
---

## Setup

Source: `acme-app` @ `src/app/layout.tsx`

```tsx
import { ThemeProvider } from 'acme-react'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| button asks | references/components/button.md | per-component file |

## Hard rules

- `<ThemeProvider>` MUST wrap children, not render as a sibling. Provider context only reaches descendants, so any token-derived `var(--<surface-default>)` resolution depends on the wrap.

In scope: tokens, assets, component descriptions, component APIs.
