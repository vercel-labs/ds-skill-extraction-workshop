---
name: produced-skill
description: Test fixture — produced skill declares a 3-component slate; every declared component resolves to a contract section. SLATE_COVERAGE must PASS.
---

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| button asks | references/components/button.md | per-component file |
| form wiring | references/components/form-control.md | per-component file |
| layout stacking | references/components.md | single-file section |

## Component slate

- `Button` — primary action trigger (per-file resolution)
- `FormControl` — labeled input wrapper (exercises kebab-casing)
- `Stack` — single-axis layout primitive (single-file `## Stack` resolution)

In scope: tokens, assets, component descriptions, component APIs.
