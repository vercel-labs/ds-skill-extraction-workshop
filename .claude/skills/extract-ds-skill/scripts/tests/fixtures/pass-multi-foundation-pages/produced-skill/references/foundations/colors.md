# Colors

## What this covers

- Pairing rules for foreground/background tokens and dark-mode behavior of the color scale.

### token/emphasis-foreground-pairing

Pair the emphasis background token with its `on-emphasis` foreground token; mixing the default foreground onto an emphasis background fails 3:1 contrast in dark mode.

**When it bites:** any surface that uses an emphasis background without the matching foreground reads as washed-out in dark mode.

| Bad | Good | Why |
|---|---|---|
| `bg=emphasis fg=default` | `bg=emphasis fg=on-emphasis` | default fg is tuned for body surface, not emphasis surface |

Source: https://example-ds.test/foundations/colors#pairing
