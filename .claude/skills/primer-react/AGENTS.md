# AGENTS — primer-react

Any agent building UI in this project with Primer React reads `SKILL.md` first, then loads only the `references/` files named in the routing table. SKILL.md is the orchestrator; it routes, the references carry the detail.

## Letter to the next agent

This skill adapts the GitHub Primer React design system to this project. The project wraps 13 Primer components as thin re-exports at `@/ds/components/*` — those are the proposing set with full per-component files. Many more Primer components (PageHeader, PageLayout, NavList, Timeline, Link, RelativeTime, SelectPanel, and the experimental DataTable/Table/Blankslate) are NOT wrapped locally but ARE used in the composition exemplars under `references/examples/`; import those directly from `@primer/react` or `@primer/react/experimental`.

The single most important thing this skill protects is **shell parity**. Primer paints through functional tokens that re-resolve per color mode. If the root shell is not wired (body unpainted, theme CSS not imported, provider rendered as a sibling), token-painted components float on a white surface and the page reads broken in dark mode. The three `shell/*` Hard rules in SKILL.md exist for exactly this; re-confirm them after ANY edit to the root layout / providers / `globals.css`, not just on first setup.

## Common agent failure modes

- **Editing `layout.tsx` and dropping a theme import or the body paint.** The page still "looks wired." Re-ground the three shell rules from SKILL.md `## Hard rules`, not from how the file looked before your edit.
- **Hardcoding colors/spacing.** Primer exposes a token for every axis — use `var(--...)`. See `references/tokens.md` and `references/anti-patterns.md`.
- **Passing icons as JSX.** `leadingVisual`/`trailingVisual`/`icon` take the octicon **component** (`icon={SearchIcon}`), not `<SearchIcon />`.
- **Bare inputs.** Every `TextInput`/`Textarea`/`Select`/`Checkbox` goes inside a `FormControl` with `FormControl.Label`. Checkbox is the one that goes **before** the label.
- **Inventing props/variants.** If it is not in the `@primer/react` types or a component file's Key props, it does not exist — mark `[VERIFY]` instead of guessing.

## Maintenance

If the DS upgrades (`@primer/react` / `@primer/primitives` version bump), re-run `/extract-ds-skill` against the new version rather than hand-editing. After any manual edit to the routing table, the rule slugs, or the file layout, re-run `scripts/check-skill-docs.sh .claude/skills/primer-react --ds-package-root <path-to>/@primer/primitives` and confirm `CHECK_RESULT=PASS`.
