---
name: produced-skill
description: Test fixture — produced skill declares Tooltip on the slate but ships no contract section for it. SLATE_COVERAGE must FAIL naming Tooltip.
---

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| button asks | references/components/button.md | per-component file |

## Component slate

- `Button` — primary action trigger (covered)
- `Tooltip` — hover hint surface (deliberately uncovered — no per-file, no single-file section)

In scope: tokens, assets, component descriptions, component APIs.
