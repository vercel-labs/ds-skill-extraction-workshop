# Spacing & layout

## What this covers

- Spacing-scale words (`condensed`, `normal`, `spacious`) for `gap` and `padding` props.

### token/spacing-scale-words

Use the scale words for `gap` and `padding` props, not numeric px values. `gap="normal"` resolves to the spacing-3 token; passing `gap="16px"` skips theming and breaks dark-mode density.

**When it bites:** any layout that hardcodes px values loses the DS spacing contract on the first theme switch.

| Bad | Good | Why |
|---|---|---|
| `gap="16px"` | `gap="normal"` | scale words travel with the theme; raw px does not |

Source: https://example-ds.test/foundations/spacing#scale
