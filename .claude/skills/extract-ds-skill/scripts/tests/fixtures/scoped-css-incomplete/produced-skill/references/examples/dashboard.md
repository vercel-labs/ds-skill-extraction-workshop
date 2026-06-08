# Example: Dashboard

Lifted from `example-app-template/app/dashboard/page.tsx` (next-app).

## Required imports

- `@example/react`: Box

## Composition (verbatim)

```tsx
import { Box } from '@example/react';

export default function Dashboard() {
  return (
    <Box sx={{ borderRadius: 'var(--borderRadius-large)', padding: 16 }}>
      Hello
    </Box>
  );
}
```

## What to copy

- Surface card uses the DS's `--borderRadius-large` token rather than a px literal.
