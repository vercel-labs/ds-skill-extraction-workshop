---
name: produced-skill
description: Test fixture — produced-skill mode, Setup section has no JSX wrapper or CSS-root snippet (prose only). WIRING_NOT_SYNTHESIZED is a no-op and must PASS.
---

## Setup

Install the package with the usual package-manager command. No provider wrapping required at the application root; the components are tree-shakeable and self-contained.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| button asks | references/components/button.md | per-component file |

In scope: tokens, assets, component descriptions, component APIs.
