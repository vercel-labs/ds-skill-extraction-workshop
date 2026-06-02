# AGENTS — ds

Any agent touching this skill reads SKILL.md first, then references/components.md, then references/anti-patterns.md.

## Letter to future agents

The `ds` design system is a thin Primer wrapper. The wrappers exist for one reason: Primer's defaults are wrong for the project's a11y bar. The headline manifestation is the `disabled` vs `inactive` distinction (ds/DESIGN.md:12). If you remember nothing else, remember that submit buttons in-flight use `disabled={isLoading}`. `inactive` exists for a legitimate but different case (feature-gated UI, permission-pending Deploy buttons) — it is not a synonym for `disabled`.

There is a known contradiction inside the source: `ds/components/Button.tsx:12-13` JSDoc says "prefer `inactive` over `disabled`". This is a DS-team-side documentation bug — DESIGN.md is the canonical rule. Do not propagate the JSDoc advice; flag it `[VERIFY]` if you cite it.

## Common agent failure modes

- **Using `inactive` for a loading submit button.** The JSDoc on Button.tsx encourages it; DESIGN.md forbids it. DESIGN.md wins. Screen readers still announce `inactive` buttons as actionable.
- **Bare `TextInput` outside `FormControl`.** Loses label association, fails axe. Always wrap.
- **Passing `aria-label` to a Button that renders visible text.** Accessible name drifts silently.
- **Deep-importing from `@primer/react/lib-esm/...`.** Defeats the wrapper. Always import from `@/ds/components/<Name>`.
- **Treating `ds/tokens.json` as the token source.** It is an intentional stub. Runtime tokens come from `@primer/primitives`.
