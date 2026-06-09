# Anti-patterns

## Layer B — Cross-cutting Bad/Good/Why columnar table

| Bad | Good | Why |
|---|---|---|
| `@import "tailwindcss";` alone in `globals.css` | `@import "tailwindcss";` + `body { background-color: var(--ds-surface-default); color: var(--ds-text-default); }` | Token-painted components float on the browser-default surface because nothing paints the shell — `shell/unpainted-body`. |
| `<ThemeProvider />` rendered as a sibling of `{children}` | `<ThemeProvider><BaseSurface>{children}</BaseSurface></ThemeProvider>` | Provider context only reaches descendants, so a sibling provider gives every descendant the DS default theme regardless of the configured one — `shell/provider-missing-content-wrap`. |
