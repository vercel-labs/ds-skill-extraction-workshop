# AGENTS — primer-react

Any agent touching this skill reads `SKILL.md` first, then loads the per-domain files in `references/` per the routing table. SKILL.md is the router; the references carry the manual.

## Letter to future agents

- The 15 slate components each have a full contract file under `references/components/`. Components outside the slate (ActionMenu, Dialog, PageHeader, DataTable, ...) have NO contract here — verify their props against `node_modules/@primer/react/dist/<Component>/` before using them, and prefer proposing a slate expansion over generating from memory.
- The published types are the truth. Every prop claim in this skill cites `dist/**/*.d.ts` lines verified at extraction time (`@primer/react@38.26.0`). If your installed version differs, re-verify before trusting a citation.
- The Setup section in SKILL.md is verbatim from `vercel-labs/primer-nextjs-template` — both the root layout and the full `app/globals.css`. Copy it whole; partial copies are the #1 source of "dark mode renders light values" bugs (see `references/anti-patterns.md`, Shell wiring).
- Shell parity is re-checked after ANY edit to the consumer's root layout / providers / globals.css — see SKILL.md `## Final checks`.

## Common agent failure modes

- Inventing enum values that "every DS has": Button `variant="secondary"`, Flash `variant="info"`, TextInput `validationStatus="warning"`, Stack `gap="large"`, StateLabel `status="merged"`. None exist — each component file's "Things to never invent" section lists the traps.
- Building lifecycle capsules out of `Label` instead of `StateLabel`, or branch chips out of `<code>` instead of `BranchName as="span"`.
- Painting components with tokens while leaving the body/shell unpainted, or setting mode attributes without the matching theme imports — the three `shell/*` rows in `references/anti-patterns.md`.
- Importing from `@primer/react/dist/...` internals instead of the barrel or the public `@primer/react/experimental` entrypoint.
- Leaving `[VERIFY]` markers unresolved in generated output — surface them in the closing summary instead.
