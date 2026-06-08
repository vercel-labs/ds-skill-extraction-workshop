# Example: Dashboard

Lifted from `primer-shaped-template/app/dashboard/page.tsx` (next-app).

## Required imports

- `@primer/react`: Box

## Composition (verbatim)

```tsx
import { Box } from '@primer/react';

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
