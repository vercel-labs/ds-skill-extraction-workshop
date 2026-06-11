---
name: produced-skill
description: Test fixture — produced-skill mode, ships 3 foundation files plus an index. FOUNDATIONS_INDEX must PASS.
---

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| button asks | references/components/button.md | per-component file |
| user reviews available foundation pages | references/foundations/index.md | one entry per accepted+crawled foundation URL |
| colors: pairing + dark mode + contrast | references/foundations/colors.md | foundation rules from docs |
| typography: type scale + line height | references/foundations/typography.md | foundation rules from docs |
| spacing-layout: spacing scale + gap words | references/foundations/spacing-layout.md | foundation rules from docs |

In scope: tokens, assets, component descriptions, component APIs.
