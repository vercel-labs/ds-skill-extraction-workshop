# AGENTS — ds

Any agent touching this skill reads `SKILL.md` first, then the per-domain files named in its routing table.

## Letter to future agents

`ds` is a thin wrapper, not a parallel design system. Every `ds` component is a 1:1 re-export of its Primer counterpart with the same prop surface. The wrappers exist so:

- Consumers have one stable import path (`@/ds/components/<Name>`) when Primer renames or restructures.
- Future a11y tightening lands inside the wrapper, not at every call site.

Today, no wrapper overrides any Primer prop. That means: every prop the underlying Primer component accepts, `ds`'s wrapper also accepts. The rules in `references/components.md` are about which subset to reach for and which traps to avoid — not about new API.

The floor doc is `ds/DESIGN.md`. Read it before this file when in doubt about intent. When you find a rule in `ds/components/<X>.tsx` JSDoc that contradicts DESIGN.md or `<X>.docs.tsx`, trust DESIGN.md and the `.docs.tsx`. The wrapper JSDoc on `Button.tsx:12-13` is a known counter-example.

## Common agent failure modes

- **Trusting `Button.tsx` JSDoc over DESIGN.md.** The JSDoc says "prefer `inactive` over `disabled`"; DESIGN.md and `Button.docs.tsx` say the opposite for submit-during-request. DESIGN.md wins. The `inactive` prop has a legitimate use (gated UI), but not for "the request is in flight".
- **Bare `<TextInput>` or `<Checkbox>` outside a `<FormControl>`.** Strips the label-input association, fails axe. The rule is in both `TextInput`'s section and `FormControl`'s section of `references/components.md` — duplication is intentional.
- **Adding `aria-label` to a `<Button>` that already renders text children.** Screen readers announce the `aria-label` and the visible text drifts out of sync. Cite: `ds/components/Button.docs.tsx:1-7`.
- **Forgetting `variant` on `<FormControl.Validation>`.** It's a required prop (`'error' | 'success'`), not optional. The component will not typecheck without it.
- **Using deprecated `icon` on `<TextInput>`.** The types file marks it `@deprecated` in favor of `leadingVisual` / `trailingVisual` (`@primer/react/dist/TextInput/TextInput.d.ts:7-8`).
- **Raw hex or px values in generated CSS.** The primitives CSS file's top comment is the rule: "Never use raw values (hex/px). Use semantic tokens ONLY." (`@primer/primitives/dist/css/functional/themes/light.css:3`).
- **Deep-importing from `@primer/react`.** The `ds/components/*.tsx` JSDoc explicitly forbids it. Use the `@/ds/components/<Name>` wrapper as the public API.
