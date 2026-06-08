# Foundation: Color usage

## What this covers

- Functional color tokens: surface/foreground/border pairing, mode-awareness, contrast minimums, and semantic role mapping for Primer's `bgColor-*` / `fgColor-*` / `borderColor-*` families.

Source page: https://primer.style/product/getting-started/foundations/color-usage

### token/emphasis-on-emphasis-pairing

Emphasis backgrounds (`bgColor-{role}-emphasis`) MUST carry the `fgColor-onEmphasis` foreground for text and icons; the default `fgColor-default` is tuned for muted/default surfaces and fails contrast on an emphasis fill.

**When it bites:** primary/danger button or filled badge renders dark default text on a saturated emphasis background — low contrast, fails axe.

| Bad | Good | Why |
|---|---|---|
| `fgColor-default` on `bgColor-accent-emphasis` | `fgColor-onEmphasis` on `bgColor-accent-emphasis` | default foreground is tuned for muted/default surfaces; on an emphasis fill it drops below the contrast minimum |

Source: https://primer.style/product/getting-started/foundations/color-usage#emphasis

### token/neutral-scale-mode-inversion

The neutral scale inverts between modes — the light scale starts at white, the dark scale starts at black — so the SAME functional token (`bgColor-default`, `fgColor-default`) resolves to opposite ends per mode. Never hardcode a hex for either mode; read the functional token and let the mode attribute resolve it.

**When it bites:** a hardcoded light-mode hex renders as dark-on-dark (invisible) once the user switches to dark mode.

| Bad | Good | Why |
|---|---|---|
| `background: #ffffff` | `background: var(--bgColor-default)` | base tokens "don't respect color modes and should never be used directly"; only functional tokens auto-switch |

Source: https://primer.style/product/getting-started/foundations/color-usage#design-token-categories

### token/border-contrast-minimum

Interactive control borders need neutral **step 8** minimum against `bgColor-muted`; lighter steps (used as separators on `bgColor-default`) disappear against muted surfaces. Primer's high-contrast goal is 7:1 for most text and interactive elements.

**When it bites:** an input or button border drawn with a separator-weight token vanishes against a muted card surface; the control reads as borderless.

| Bad | Good | Why |
|---|---|---|
| separator-weight border on `bgColor-muted` | `borderColor-default` (≥ step 8) on `bgColor-muted` | step 8 is the documented minimum contrast for interactive control borders against muted backgrounds |

Source: https://primer.style/product/getting-started/foundations/color-usage#adjusting-contrast

### token/semantic-foreground-surface

Semantic foregrounds (`fgColor-accent`, `fgColor-success`, `fgColor-attention`, `fgColor-danger`, `fgColor-open`, `fgColor-closed`, `fgColor-done`, `fgColor-sponsors`) are tuned for contrast against **muted and default** backgrounds only. On an emphasis surface use `fgColor-onEmphasis` instead.

**When it bites:** `fgColor-danger` placed on `bgColor-danger-emphasis` washes out — the role foreground was never tuned for the emphasis fill.

| Bad | Good | Why |
|---|---|---|
| `fgColor-danger` on `bgColor-danger-emphasis` | `fgColor-onEmphasis` on `bgColor-danger-emphasis` | `fgColor-{role}` provides contrast against muted/default surfaces; emphasis surfaces require the on-emphasis foreground |

Source: https://primer.style/product/getting-started/foundations/color-usage#semantic-foreground

### Role → usage map (reference)

Cited verbatim from `#color-roles` — the role names that key the `bgColor-{role}-*` / `fgColor-{role}` families:

- `accent` — links, selected/active/focus states, neutral information
- `success` — primary buttons, positive messaging, successful states
- `attention` — warning states, active processes (queued PRs, tests in progress)
- `danger` — danger buttons and error states
- `open` / `closed` / `done` — task/PR/workflow lifecycle states
- `sponsors` — GitHub Sponsors text and icons

Source: https://primer.style/product/getting-started/foundations/color-usage#color-roles

## Out-of-scope rules surfaced (routed to a sibling copy/brand skill)

- Marketing vs product palette guidance and brand-voice color prose ("our blues feel…") — tone, not token contract.
