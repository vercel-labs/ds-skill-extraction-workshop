---
name: primer-shaped-complete-fixture
description: Test fixture — produced-skill mode, Companion CSS @imports cover every consumed var(--X).
---

## Setup

Install:

```bash
npm install @primer/primitives
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
@import "@primer/primitives/dist/css/functional/size/radius.css";
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user reviews exemplars | references/examples/index.md | one entry per composition exemplar |
