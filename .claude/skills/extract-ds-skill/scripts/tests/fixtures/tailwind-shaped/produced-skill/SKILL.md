---
name: tailwind-shaped-fixture
description: Test fixture — produced-skill mode, Tailwind-style consumer with no var(--X) consumption anywhere.
---

## Setup

Install:

```bash
npm install tailwindcss
```

Provider wiring (Next.js App Router):

```tsx
import './globals.css';
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

### Companion CSS — app/globals.css

```css
@import "tailwindcss";
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user reviews exemplars | references/examples/index.md | one entry per composition exemplar |
