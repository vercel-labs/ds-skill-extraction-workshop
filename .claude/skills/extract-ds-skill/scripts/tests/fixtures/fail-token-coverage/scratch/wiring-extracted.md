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
@import "@example/tokens/dist/css/functional/color/border.css";
```

## Notes

Fixture: exercises check-token-coverage.sh scratch-mode FAIL path. The exemplar
consumes `--surface-default`, which is defined in surface.css/accent.css but
NOT imported (only border.css — defining a different var — is imported).
