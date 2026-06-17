# Wiring (extracted)

## Root entry file (verbatim) — app/layout.tsx

```tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Companion CSS file (verbatim) — app/globals.css

```css
@import "@example/tokens/dist/css/functional/color/surface.css";
@import "@example/tokens/dist/css/functional/color/accent.css";
```

## Notes

Fixture: exercises check-token-coverage.sh scratch-mode PASS path. The consumed
`--surface-default` token is defined in two files (surface.css and accent.css);
both are imported, so coverage holds via either definer.
