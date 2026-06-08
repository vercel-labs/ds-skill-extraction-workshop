# Anti-patterns

## Layer B — Cross-cutting Bad/Good/Why columnar table

| Bad | Good | Why |
|---|---|---|
| `@import "tailwindcss";` alone in `globals.css` | `@import "tailwindcss";` + `body { background-color: var(--ds-surface-default); color: var(--ds-text-default); }` | Token-painted components float on the browser-default surface because nothing paints the shell — `shell/unpainted-body`. |
