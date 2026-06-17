---
name: produced-skill
description: Test fixture — produced-skill has Setup with only a `### Foundation wiring` subheading (no reference project, no Companion CSS). Shell-invariant Hard Rules promoted from the foundation wiring lines. SHELL_INVARIANTS must PASS.
---

## Setup

```bash
npm install ds-react
```

### Foundation wiring

Dark-theme surface contract — required when the DS's color-scheme attribute is set on `<html>`. Source: https://example.com/ds-docs#dark-mode

```css
:root { color-scheme: dark; }
html, body {
  background-color: var(--ds-surface-default);
  color: var(--ds-text-default);
}
```

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| button asks | references/components/button.md | per-component file |

## Hard rules

- The body/root MUST paint with `var(--ds-surface-default)` via the `body { background-color: ... }` rule in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.

## Final checks

After generating UI: cite each component used; confirm shell parity — the page/root surface paints with `var(--ds-surface-default)`.

In scope: tokens, assets, component descriptions, component APIs.
