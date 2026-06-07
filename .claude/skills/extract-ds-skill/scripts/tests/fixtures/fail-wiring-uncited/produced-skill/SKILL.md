---
name: produced-skill
description: Test fixture — produced-skill mode, Setup section embeds a JSX wrapper with NO citation. WIRING_NOT_SYNTHESIZED must FAIL.
---

## Setup

Wrap the application root in the provider:

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
| button asks | references/components/button.md | per-component file |

In scope: tokens, assets, component descriptions, component APIs.
