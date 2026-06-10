# AGENTS — primer-react

Any agent touching this skill reads `SKILL.md` first, then loads the `references/` files named in its routing table on demand. Do not pre-load every reference; the routing table is the dispatch contract.

## Letter to future agents

This skill was extracted from real source — `@primer/react@38.26.0` types, `@primer/primitives@11.9.0` CSS, `@primer/octicons-react@19.28.0` exports, the Primer foundations docs, and the `vercel-labs/primer-nextjs-template` consumer app. Every prop union in `references/components.md` was typechecked against the published `.d.ts` files; every token in `references/tokens.md` was grep-resolved against the primitives package. If a prop or token is not listed, check the types file before using it — do not assume Primer ships what other design systems ship.

## Common agent failure modes

- **Skipping the shell invariants when editing an existing layout.** The five `shell/*` Hard Rules in SKILL.md fire on every edit to `layout.tsx` / `globals.css`, not just greenfield wiring. Re-confirm them after any shell-touching change.
- **Importing `Blankslate`/`DataTable`/`Table` from the root.** They live at `@primer/react/experimental`; the root import fails to resolve.
- **Inventing a `secondary` Button variant or a `color` prop on Text.** Variants and color come from the verified unions and CSS tokens — see `references/components.md`.
- **Hardcoding the light-theme hex values listed in `references/tokens.md`.** Those are documentation of the light resolution; always emit `var(--token)`.
- **Treating docs as authoritative over types.** Known case: the typography foundations page names `--test-subtitle-weight`; the package ships `--text-subtitle-weight`. Package wins.
- **Leaving `[VERIFY]` markers unsurfaced.** Anything you cannot ground in source gets a literal `[VERIFY]` inline and a mention in your closing summary.
