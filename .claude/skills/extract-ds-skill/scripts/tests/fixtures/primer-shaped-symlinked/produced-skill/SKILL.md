---
name: primer-shaped-symlinked-fixture
description: Test fixture — produced-skill mode, ds-pkg passed as a SYMLINK (pnpm shape). Regression guard for the BSD grep -r vs -R bug — definer lookup must follow symlinks given as the directory argument.
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
