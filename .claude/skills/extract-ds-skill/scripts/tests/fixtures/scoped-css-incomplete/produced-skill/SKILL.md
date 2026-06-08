---
name: scoped-css-incomplete-fixture
description: Test fixture — produced-skill mode, Companion CSS @imports DO NOT cover --borderRadius-large.
---

## Setup

Install:

```bash
npm install @example/tokens
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
@import "@example/tokens/dist/css/base/size/size.css";
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user reviews exemplars | references/examples/index.md | one entry per composition exemplar |
