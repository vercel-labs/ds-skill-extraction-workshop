# Phase 2 — Validate the extraction in a scratch workspace

Deep guidance for Phase 2. Triggered only after explicit user confirmation from Phase 1. Goal: prove the extraction is grounded in the real design system before anything lands in the user's project.

## Scratch workspace rule

Everything in this phase lives in `.extract-ds-skill-scratch/` in the current working directory. Nothing is written to `.claude/skills/<slug>/` yet — iteration is cheap and partial state never lands in the user's project.

Create the directory if it does not exist. Treat it as disposable. Do not add it to git history; suggest the user add `.extract-ds-skill-scratch/` to `.gitignore` if the repo tracks untracked files aggressively. Every artifact written during Phase 2 is throwaway scaffolding — the probe, any temporary tsconfig, grep output logs — none of it survives into Phase 3.

## Smoke-test contract

"Imports resolve + provider mounts + showcase paints" was the v0-runtime version of the proof. In standalone Claude Code there is no preview iframe, no `pnpm dev` boot, no overlay errors to surface. The contract translates to: every public API the meta-skill claims exists in the DS package must be reachable from a clean import, and every prop/value the meta-skill names must match what the package's types actually export.

Three validation modes, default = the first.

### Default — typecheck + grep-resolves (non-visual)

Write a minimal `probe.tsx` in `.extract-ds-skill-scratch/` that imports every surfaced public API from the DS package — every component named in the discovery summary, every token export, every asset helper. For each component, instantiate it with the props the extraction claims it accepts. Run `tsc --noEmit` against the probe with a minimal tsconfig that points at the user's DS package resolution.

Then grep the DS package's `exports` field (or its `index.d.ts`) for each named import. Every import must resolve to a real symbol in the package's public surface.

Exit 0 = pass. This catches "you said `Button` takes a `kind` prop, TypeScript says it doesn't" without asking the model to grade its own homework. The proof point surfaced to the user is concrete: `14 props verified against source, 0 hallucinations`. That is what `scripts/validate.sh` runs by default.

### Escalation — probe-page render

Only if the user has a local dev server running. Write a minimal page importing each surfaced component for the user to inspect visually. The user reports back whether it paints. Use this when the DS has runtime requirements typecheck cannot catch — provider mounting, CSS-in-JS hydration, font loading — and the user is set up to look.

### Last resort — skip visual

If neither dev server nor typecheck is feasible (no TS in the consumer project, no buildable resolution path, DS package is private and not installed locally), log `validation skipped` and require the user to explicitly approve before Phase 3 with extra weight. Surface every `[VERIFY]` marker uncollapsed. The user is accepting that grounding was not mechanically checked.

## Foundation-docs extraction step

Runs only when the Phase 1 discovery summary contains a source line tagged `[docs:foundation]`. Skip this entire section when no foundation URL is in scope — the baseline typecheck + grep-resolves contract above is the full Phase 2.

Sequence:

1. **WebFetch the foundation URL once.** Cache the returned prose for the duration of Phase 2. Do not re-fetch per rule.
2. **Load `references/foundation-extraction.md`.** This is the first time it loads in the run; progressive disclosure means it stays unloaded for no-URL extractions.
3. **Classify candidate rules by shape.** Walk the prose top-to-bottom, tag each candidate as one of the six foundation rule shapes (token-pairing, mode-aware, contrast-minimum, semantic-role, wiring-contract, fallback-element), and drop anything that does not fit (brand-voice prose, history paragraphs, out-of-scope copy).
4. **Grep-resolve every cited CSS variable.** For each extracted rule that names a CSS custom property, run `grep -r "<var-name>" node_modules/<ds-package>/dist/css/` (or the equivalent path for the DS in scope — Primer ships under `node_modules/@primer/primitives/dist/css/`). If the variable does not resolve, mark the rule `[VERIFY]` with the missing-grep reason inline. Do not silently drop the variable; the agent needs to see what the docs claim that the installed package does not yet ship.
5. **Resolve URL anchors.** If a citation uses `<url>#<section-anchor>`, the anchor must correspond to a heading in the fetched prose. If not, downgrade to the bare URL and mark `[VERIFY: anchor did not resolve in fetched page]`.
6. **Stash extracted rules in the scratch workspace.** Write them to `.extract-ds-skill-scratch/tokens-extracted.md` for inspection. Phase 3 will materialize them into `references/tokens.md` per the per-rule subsection skeleton.

The step writes to scratch only; no foundation rule lands in `.claude/skills/<slug>/` until Phase 3.

## Proof point (updated for foundation extraction)

The wait-gate proof point gains one line when a foundation URL is in scope. Without a URL, the proof point is unchanged from the SKILL.md worked example. With a URL, the line is added between the assets line and the hallucinations line:

```
Validation complete.
- 14 props verified against source (Button: 6, TextInput: 4, Checkbox: 2, FormControl: 2)
- 47 tokens grep-resolved (color: 28, space: 12, type: 7)
- 0 assets in scope this run
- 6 foundation-rules extracted (5 cited, 1 [VERIFY])
- 0 hallucinations
- 3 open [VERIFY] markers:
  1. Button.md:42 - loading-state prop name not confirmed in types file
  2. FormControl.md:18 - validation slot signature absent from public types; inferred from docs
  3. tokens.md:74 - `--fgColor-onMuted` cited by docs but no grep-resolve in @primer/primitives@11.9.0

Approve to persist? (Reply "go" to write to .claude/skills/primer-react/.)
```

The new line is mandatory when a `[docs:foundation]` source was in scope, even if the extraction produced zero rules (empty foundation runs surface as `0 foundation-rules extracted (0 cited, 0 [VERIFY]) — URL may be wrong source`, which is a Phase 1 re-open signal not a Phase 2 approval signal). Without a foundation URL, omit the line entirely.

## What the user is confirming

The user is confirming the EXTRACTION is sound, not the visuals.

If typecheck + grep pass with 0 hallucinations against N props, the user is approving the extraction's grounding — that the meta-skill named real components, real props, real tokens — not approving aesthetic quality. There is no "does it look right" judgment in the default mode, because the default mode does not render anything. Aesthetic critique belongs to whoever uses the persisted skill downstream, not to Phase 2.

If the user objects to the surface area (wrong components proposed, missing axis, wrong slug), that is a Phase 1 re-open, not a Phase 2 fix. Loop back to discovery, do not patch the extraction in place.

## Showcase-is-not-shipped rule

Smoke-test artifacts — `probe.tsx`, the scratch tsconfig, the scratch workspace itself — are NOT persisted into the skill. They exist only to validate. Phase 3 writes the skill from the meta-skill's internal model of what was extracted; it does not copy files out of `.extract-ds-skill-scratch/` into `.claude/skills/<slug>/`.

This mirrors the v0 distinction between the validating artifact and the shipping artifact:

- L46: "A blank page and a 404 look identical in the preview; the showcase is what proves imports resolve, the provider is mounted, and globals/fonts are wired."
- L118: "Mirror every file under `/CLEAN_CWD/` to `v0_memories/<team>/skills/<slug>/assets/starter/` using the `write` tool, file-by-file - except the showcase index page, which exists only to validate that the design system renders correctly and must not ship with the starter."

In v0 the showcase index page was excluded from the starter. Here the entire `.extract-ds-skill-scratch/` directory plays the same role — it validates, then it is discarded. The skill that ships contains references, not probes.

## Wait-for-approval gate

Wait for explicit user approval before Phase 3.

Present the validation result as a concise summary. Three buckets:

- **Passed** — APIs that resolved cleanly. One-line total: `Verified N props across M components against source. 0 hallucinations.`
- **Flagged** — anything the typecheck or grep step rejected. One line per flagged item with the file:line it came from and the reason it failed (`prop name not in exported types`, `import path resolves to internal subpath`, etc.).
- **`[VERIFY]` markers** — any rule or fact the agent could not fully ground in source. Count + the list. The user decides whether each one is acceptable, needs a manual citation, or should be dropped.

Close with a single question: "Approve to persist, or adjust?"

Do not proceed without an explicit affirmative. "Go", "ship it", "approved", or equivalent. Silence is not consent. A request to change something is a loop back to the relevant phase, not a green light.
