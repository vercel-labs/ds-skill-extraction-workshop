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

### Claims file contract — every claim becomes mechanically checkable

At extract time, every positive prop/enum claim, every negative ("never accepts") claim, and every cited local path that lands in produced prose MUST also be recorded as one line in `.extract-ds-skill-scratch/claims.txt`. `scripts/validate.sh` consumes that file to generate the prop-shape probe — the probe checks what the claims file declares, not what the prose says. A claim that never lands in the claims file is by definition unverified and must not appear in produced prose; zero positive prop/enum claims outside the claims file is the floor.

One claim per line; `#` comments and blank lines are skipped. Four line forms:

| Line form | Meaning | Mechanical check |
|---|---|---|
| `<Component>.<prop>=<value>` | positive: the prop accepts the value | typed assignment appended to the generated probe; `tsc` must accept it |
| `NEGATIVE:<Component>.<prop>=<value>` | negative: the prop rejects the value | `// @ts-expect-error` line in the probe; `tsc` must reject the assignment. If the value is actually valid (an upstream type widening), the directive goes unused → TS2578 fails the probe |
| `PATH:node_modules/<...>` | cited local path exists | `test -e` at validate time; a miss prints `PATH_MISS=<path>` and the run fails with `FAIL_REASON=path`. Only `node_modules/`-prefixed paths are accepted — anything else is a parse error |
| `URL:<https-url>` | cited URL is reachable | verified as fetchable (HTTP 200) AT EXTRACT TIME by the extracting agent; `validate.sh` counts it (`url-skipped`) and does NOT re-check |

Generated probe line shapes (component names illustrative):

```
Button.variant=primary                       →  export const __claim_1: React.ComponentProps<typeof Button>['variant'] = 'primary';
NEGATIVE:Stack.gap=xs                        →  // @ts-expect-error NEGATIVE claim: Stack.gap must reject xs
                                                export const __claim_2: React.ComponentProps<typeof Stack>['gap'] = 'xs';
PATH:node_modules/@acme/ui/dist/button.d.ts  →  test -e node_modules/@acme/ui/dist/button.d.ts
```

Values `true`/`false` and bare numbers are emitted unquoted; everything else becomes a string literal. A claimed component that is missing from the surfaced-APIs file is added to the probe's import line automatically, so a claim against a component the package does not export fails the probe instead of silently skipping.

`validate.sh` auto-detects `.extract-ds-skill-scratch/claims.txt`; pass `--claims <path>` to point at a different file. The summary emits `CLAIMS_CHECKED=positive:<n> negative:<n> path:<n> url-skipped:<n>` so the proof point can carry the tally verbatim.

### Escalation — probe-page render

Only if the user has a local dev server running. Write a minimal page importing each surfaced component for the user to inspect visually. The user reports back whether it paints. Use this when the DS has runtime requirements typecheck cannot catch — provider mounting, CSS-in-JS hydration, font loading — and the user is set up to look.

### Last resort — skip visual

If neither dev server nor typecheck is feasible (no TS in the consumer project, no buildable resolution path, DS package is private and not installed locally), log `validation skipped` and require the user to explicitly approve before Phase 3 with extra weight. Surface every `[VERIFY]` marker uncollapsed. The user is accepting that grounding was not mechanically checked.

## Reference-project extraction step

Runs only when the Phase 1 discovery summary contains a source line tagged `[example:project]`. Skip this entire section when no reference project is in scope — the produced `SKILL.md` Setup section falls back to the docs-snippet path (when a `[docs:foundation]` URL is in scope) or to an empty Setup section (when neither is in scope). See `references/skill-template.md` (Foundation-docs wiring fallback subsection) for the fallback contract.

Sequence:

1. **Resolve the root entry file via framework auto-detection.** Walk the order documented in `references/reference-project.md` (Vite `src/main.{jsx,tsx}` → Next.js App Router `app/layout.{tsx,jsx}` → Next.js Pages Router `pages/_app.{tsx,jsx}` → CRA `src/index.{jsx,tsx}`). First hit wins. If none resolve, mark the wiring `[VERIFY: reference project root entry not auto-detected — extracting from <best-guess-path>]` and continue with the best-guess file.
2. **Lift the wiring snippet verbatim.** Per the recipe in `references/reference-project.md` (Extraction recipe steps 1-5): topmost provider element, direct CSS imports, root-element HTML attributes (Next App Router lifts from `<html>` in the layout; Vite lifts from `index.html`), any bonus composition wrapped inside the provider, AND the verbatim full contents of every CSS file the entry file imports (recursive depth 3, scoped to the consumer-app source tree). Copy character-for-character; do not paraphrase, re-indent, or "tidy" import order.
3. **Grep-resolve any CSS variable named inside the wiring.** When the lifted snippet references a CSS custom property (e.g. `var(--bgColor-default)` inside a `<BaseStyles>` style prop), run `grep -r "<var-name>" node_modules/<ds-package>/dist/css/` symmetric to the foundation-extraction step. Unresolved variables get `[VERIFY: <var-name> did not grep-resolve in installed package]` inline.
4. **Stash extracted wiring in the scratch workspace.** Write to `.extract-ds-skill-scratch/wiring-extracted.md` per the output contract in `references/reference-project.md`. Phase 3 will materialize it into the produced `SKILL.md` Setup section.
5. **Token-coverage hard gate.** Run `bash .claude/skills/extract-ds-skill/scripts/check-token-coverage.sh <ds-pkg-root> .extract-ds-skill-scratch/` (where `<ds-pkg-root>` is the DS package's resolved path from Phase 1 discovery — typically `node_modules/<ds-token-package>/` for npm-installed token packages). The script collects every `var(--X)` consumed in the code-block surfaces of the scratch (Setup, composition exemplars, component composition examples), locates each token's defining CSS file under `<ds-pkg-root>/dist/css/`, and asserts that file appears as an `@import` line in one of the lifted Companion CSS blocks. Three outcomes:
   - **PASS** (`TOKEN_COVERAGE=PASS`, exit 0) — every consumed token resolves through a lifted `@import`. Proceed to the wait-for-approval gate.
   - **NOOP** (`TOKEN_COVERAGE=NOOP`, exit 0) — zero `var(--X)` consumed (Tailwind-style apps). Proceed.
   - **FAIL** (`TOKEN_COVERAGE=FAIL`, exit 1, per-var `MISSING: ...` rows on stdout) — the lifted `@import` set is incomplete. Block the wait-for-approval gate; surface the per-var report verbatim to the user. The user either accepts the gap (e.g. adds the missing `@import` lines to the scratch by hand and re-runs the gate) or loops back to discovery (e.g. picked the wrong reference project).

The step writes to scratch only; no wiring lands in `.claude/skills/<slug>/` until Phase 3. The token-coverage gate is re-asserted in Phase 3 post-emit by `scripts/check-skill-docs.sh` check #11 `TOKEN_COVERAGE` (gated on `--ds-package-root`), so a hand-edited or re-extracted skill gets the same protection.

## Foundation-docs extraction step

Runs only when the Phase 1 discovery summary contains a source line tagged `[docs:foundation]`. Skip this entire section when no foundation URL is in scope — the baseline typecheck + grep-resolves contract above is the full Phase 2.

Sequence:

1. **WebFetch the foundation URL once.** Cache the returned prose for the duration of Phase 2. Do not re-fetch per rule.
2. **Load `references/foundation-extraction.md`.** This is the first time it loads in the run; progressive disclosure means it stays unloaded for no-URL extractions.
3. **Classify candidate rules by shape.** Walk the prose top-to-bottom, tag each candidate as one of the five foundation rule shapes (token-pairing, mode-aware, contrast-minimum, semantic-role, fallback-element), and drop anything that does not fit (brand-voice prose, history paragraphs, out-of-scope copy, wiring snippets). Wiring is lifted via `references/reference-project.md`, not extracted from foundation prose.
4. **Grep-resolve every cited CSS variable.** For each extracted rule that names a CSS custom property, run `grep -r "<var-name>" node_modules/<ds-package>/dist/css/` (or the equivalent path for the DS in scope — substitute the actual package and resolution path the DS publishes). If the variable does not resolve, mark the rule `[VERIFY]` with the missing-grep reason inline. Do not silently drop the variable; the agent needs to see what the docs claim that the installed package does not yet ship.
5. **Resolve URL anchors.** If a citation uses `<docs-url>#<section-anchor>`, the anchor MUST correspond to a heading in the WebFetch'd prose. **Hard gate:** if it does not, the rule ships with the explicit marker `[VERIFY: anchor did not resolve in fetched page]` (downgraded to the bare URL). Soft notes ("anchor probably points here", "not sure about this section") are disallowed — either the anchor resolved or the rule carries the verbatim marker.
6. **Stash extracted rules in the scratch workspace.** Write them to `.extract-ds-skill-scratch/tokens-extracted.md` for inspection. Phase 3 will materialize them into `references/tokens.md` per the per-rule subsection skeleton.

The step writes to scratch only; no foundation rule lands in `.claude/skills/<slug>/` until Phase 3.

## Shell-invariant extraction step

Runs whenever Phase 2 has lifted ANY verbatim wiring into scratch — either through the Reference-project extraction step above (root-entry-file code block in `.extract-ds-skill-scratch/wiring-extracted.md`, plus its `## Companion CSS file (verbatim) — <path>` blocks), or through the Foundation-docs wiring fallback (a `### Foundation wiring` snippet lifted from a foundation page), or both. Skip this entire section when no wiring was lifted (no reference project AND no foundation wiring snippet); the produced skill's Setup section will be empty and `## Hard rules` carries only the universal `[VERIFY]` + do-not-invent contract.

The step is descriptive→prescriptive promotion: Setup ships the wiring as "here is how it is wired" prose adjacent to a code fence; this step extracts the **invariants the wiring establishes** so they fire at every emit, not only when the agent first wires a greenfield app. A downstream agent that already has the consumer-app shell in place never re-reads Setup — so any invariant that only lives in Setup prose is invisible at emit time.

Sequence:

1. **Enumerate wiring steps from scratch.** Walk the lifted material in `.extract-ds-skill-scratch/wiring-extracted.md` (root-entry-file snippet + every Companion CSS block + any Foundation wiring snippet). For each construct present in the lifted material, write a one-line step description in `.extract-ds-skill-scratch/shell-invariants.md`. Constructs to enumerate, when each is present:

   - **Provider mount** — the topmost provider element wrapping the page tree (e.g. `<XxxProvider>...</XxxProvider>` in the root entry file). Step phrasing: "The `<XxxProvider>` MUST wrap children, not render as a sibling."
   - **Content wrap inside the provider** — the base-surface component the provider's children render into (e.g. `<BaseSurface>{children}</BaseSurface>`). Step phrasing: "The base-surface wrap inside the provider MUST receive children."
   - **Body/root paint via `style` prop on the provider's base-surface component** — when the lifted snippet sets `style={{ backgroundColor: "var(--<surface-default>)" }}` (or equivalent) on the base-surface element. Step phrasing: "The base-surface element MUST paint with the DS's surface token via the `style` prop."
   - **Body/root paint via globals.css body rule** — when one of the Companion CSS files contains a `body { background-color: var(--<surface-default>); ... }` rule (or the equivalent `html, body { ... }`). Step phrasing: "`globals.css` MUST paint the body/root with the DS's surface token."
   - **Mode attribute on `<html>`** — when the lifted root-entry-file snippet sets `data-*-color-scheme`, `class="dark"`, or any other DS-named mode attribute on `<html>`. Step phrasing: "The mode attribute on `<html>` MUST be paired with the matching theme CSS import."
   - **Theme CSS imports matched to the mode attribute** — every theme file the DS ships per mode (light, dark, contrast) that the Companion CSS lifts as `@import "<ds-themes>/<mode>.css";`. Step phrasing: "The theme CSS imports MUST cover every mode the app declares via the mode attribute."
   - **Root font loading** — when the lifted snippet wires a font (e.g. `<NextFont>` className on `<html>`, or `@import` of a font CSS file) that the DS prescribes. Step phrasing: "The DS-prescribed root font MUST load on the root element."

   Omit any construct the lifted material does not contain. Inventing a step to fill a row is a fabrication; the produced skill ships only the invariants its real DS surfaces.

2. **Pair each step with its visual failure mode.** For each enumerated step, write the user-visible symptom that fires when the step is omitted from the downstream consumer app. Failure-mode phrasing is concrete ("page renders dark text on browser-default white", "card paints in DS surface but body is unpainted", "provider context never reaches descendants"), not abstract ("theming breaks").

   Worked failure-mode lines (illustrative — substitute the DS's actual surface token and mode-attribute name from Phase 1 discovery):

   - Provider mount as sibling instead of wrap → "Provider context never reaches descendants; every child renders with the DS default theme regardless of the configured one."
   - Body/root paint omitted → "Token-painted components float on the browser-default white surface; the page renders 'card painted, body unpainted' — the canonical mode-mismatch bug."
   - Mode attribute set without matching theme import → "The mode attribute sets the token-resolution context but the unimported theme file leaves functional tokens at their fallback values; the mode toggles but the values do not."
   - Theme import set without the mode attribute → "The theme file loads but the resolution context never switches; the DS default mode renders regardless of OS or user preference."
   - Root font omitted → "Components render in the browser-default font; type-scale tokens still resolve but the type system's measure/leading/x-height assumptions break."

3. **Promote each (step, failure-mode) pair to three sites.** Each pair lands in three places when Phase 3 materializes the scratch:

   1. **`## Hard rules` row in the produced SKILL.md** — per the contract extension in `references/skill-template.md` (Hard rules bullet). Each rule paraphrases the step + names the failure mode + cites the relevant `shell/<slug>` from `references/anti-patterns.md`. Example shape: `The body/root MUST paint with \`var(--<surface-default>)\` via either the \`<BaseSurface style>\` prop OR \`body { background-color: ... }\` in \`globals.css\`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see \`references/anti-patterns.md\` \`shell/unpainted-body\`.`
   2. **Layer B Bad/Good/Why row in the produced `references/anti-patterns.md`** — under the `shell/<slug>` namespace per Change B in `references/anti-patterns.md`. The DS-specific token name (e.g. `var(--mantine-color-body)`, `var(--ds-surface-default)`) fills the Good cell; the placeholder vocabulary in the pre-seeded template is replaced with the actual DS-discovered token.
   3. **`Final checks` self-check entry in the produced SKILL.md** — per the contract extension in `references/skill-template.md` (Final checks bullet). The agent confirms shell parity after generating UI: page/root paints with a surface token, mode attribute matches imported theme files, provider wraps children.

4. **Stash extracted shell invariants in the scratch workspace.** Write the enumeration to `.extract-ds-skill-scratch/shell-invariants.md` per the per-step skeleton (step, failure-mode, target Hard Rule slug). Phase 3 reads this file when materializing the produced SKILL.md `## Hard rules` section and the Layer B rows under `references/anti-patterns.md`.

   Output contract for `.extract-ds-skill-scratch/shell-invariants.md`:

   ```markdown
   # Shell invariants (Phase 2 → Phase 3 handoff)

   _Promoted from .extract-ds-skill-scratch/wiring-extracted.md. Phase 3 materializes each step into the produced SKILL.md \`## Hard rules\` section, a \`references/anti-patterns.md\` Layer B row under the \`shell/\` namespace, and a \`Final checks\` self-check entry._

   ## <slug> (e.g. shell/unpainted-body)

   - **Step:** <one-line step description, e.g. "The base-surface element MUST paint with the DS's surface token via the \`style\` prop.">
   - **Failure mode:** <user-visible symptom when step is omitted>
   - **Lifted from:** <wiring-extracted.md anchor: root-entry-file | Companion CSS — <path> | Foundation wiring>
   - **DS-specific token (fills Layer B Good cell):** `var(--<actual-discovered-token>)` (or `[VERIFY: token not grep-resolved]` if Phase 1 surfaced the construct but the token did not grep-resolve)

   ## <next slug>

   ...
   ```

The step writes to scratch only; no Hard Rule, Layer B row, or Final checks self-check lands in `.claude/skills/<slug>/` until Phase 3. The audit hook `scripts/check-skill-docs.sh` check `SHELL_INVARIANTS` (see `references/anti-patterns.md` Layer C `shell/<slug>` definitions and Change D) re-verifies post-emit that the produced SKILL.md ships at least one Hard Rule referencing the body/root/provider vocabulary AND a surface token — the post-emit floor for the contract this step establishes.

## Proof point (updated for foundation + reference-project extraction)

The wait-gate proof point gains one line when a foundation URL is in scope, and another line when a reference project is in scope. Without either, the proof point is unchanged from the SKILL.md worked example. With both, both lines are added between the assets line and the hallucinations line.

The reference-project line uses the format (placeholders):

```
Wiring extracted from <reference-project>@<root-entry-file> (<framework>, N lines, K CSS files lifted, M tokens consumed, M covered)
```

Where `<framework>` is one of `vite`, `next-app`, `next-pages`, `cra`, or `unknown` (when auto-detection failed). `N lines` is the lifted entry-file snippet length. `K CSS files lifted` is the count of `## Companion CSS file (verbatim) — <path>` blocks in the scratch (`0` for entry files with no `import './X.css'` lines). `M tokens consumed` is the count of distinct `var(--X)` names the token-coverage gate found in the produced code-block surfaces; `M covered` is the count whose defining file appears as an `@import` line in one of the lifted CSS blocks. PASS means `consumed == covered`; FAIL means `covered < consumed` and the gate refused to proceed.

The format follows the proof-point line with a tally line on the next line:

```
TOKEN_COVERAGE=PASS    (or TOKEN_COVERAGE=NOOP, or TOKEN_COVERAGE=FAIL with per-var MISSING rows above)
```

### Worked example — Phase 2 proof-point with foundation URL and reference project in scope (illustrative)

The block below uses a public-DS-shaped target to ground the shape. The skill makes no assumption that the user's DS is the one in the example; the same proof-point contract applies to whichever DS the user passes.

```
Validation complete.
- 14 props verified against source (Button: 6, TextInput: 4, Checkbox: 2, InputWrapper: 2)
- 47 tokens grep-resolved (color: 28, space: 12, type: 7)
- 0 assets in scope this run
- 6 foundation-rules extracted (5 cited, 1 [VERIFY])
- Wiring extracted from github.com/mantinedev/next-app-template@app/layout.tsx (next-app, 28 lines, 1 CSS file lifted, 12 tokens consumed, 12 covered)
- TOKEN_COVERAGE=PASS
- 0 hallucinations
- 3 open [VERIFY] markers:
  1. Button.md:42 - loading-state prop name not confirmed in types file
  2. InputWrapper.md:18 - validation slot signature absent from public types; inferred from docs
  3. tokens.md:74 - `--mantine-color-blue-6` cited by docs but no grep-resolve in @mantine/core@7.x

Approve to persist? (Reply "go" to write to .claude/skills/acme-ui/.)
```

The foundation line is mandatory when a `[docs:foundation]` source was in scope, even if the extraction produced zero rules (empty foundation runs surface as `0 foundation-rules extracted (0 cited, 0 [VERIFY]) — URL may be wrong source`, which is a Phase 1 re-open signal not a Phase 2 approval signal). Without a foundation URL, omit the line entirely.

The wiring line is mandatory when an `[example:project]` source was in scope. Omit when no reference project was supplied; the produced Setup section then falls back to the docs snippet (when a foundation URL is in scope) or is empty (when neither is in scope) per `references/reference-project.md`. When auto-detection failed, surface `framework=unknown` and the `[VERIFY]` marker from step 1 of the reference-project extraction step above. The `TOKEN_COVERAGE=...` tally line immediately follows the wiring line whenever the wiring line is present; it is omitted only when no reference project was in scope.

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

## Handoff document — phase-2.md template

Phase 2 closes by writing `.extract-ds-skill-scratch/handoffs/phase-2.md` BEFORE the approval gate. The doc is the irrecoverable-state snapshot for a future session that resumes after a context-window blow-out or `/exit`. Apply the `/handoff` skill discipline: capture only what is NOT recoverable from scratch artefacts on disk. Reference everything else by path.

**Include (Phase 2 state the next session needs to reach the approval gate without re-validating):**

- Proof-point line verbatim (the one emitted just before the gate)
- Token-coverage tally verbatim (`TOKEN_COVERAGE=PASS|NOOP|FAIL` + counts)
- Scratch file inventory — one-line pointers to each artefact Phase 3 will materialize:
  - `.extract-ds-skill-scratch/wiring-extracted.md` (size, last-modified)
  - `.extract-ds-skill-scratch/examples/*.md` (count, names)
  - `.extract-ds-skill-scratch/foundations/*.md` (count, names)
  - `.extract-ds-skill-scratch/tokens-extracted.md` (size, last-modified)
  - `.extract-ds-skill-scratch/shell-invariants.md` (size, last-modified — present only when Phase 2 lifted wiring; omit the bullet when absent)
- `[VERIFY]` marker list — each marker with file:line + the one-line reason, plus user-acceptance status (`pending`, `accepted as known limitation`, `flagged for redo`)
- Approval-pending flag (`status: awaiting-approval`)
- Pickup prompt skeleton (one line: `/extract-ds-skill — resume from .extract-ds-skill-scratch/handoffs/phase-2.md`)

**Do NOT include:**

- The lifted CSS bodies (they live in `wiring-extracted.md` on disk)
- The extracted component prose (lives in scratch `examples/*.md`)
- The extracted token/foundation rules (live in scratch `foundations/*.md` + `tokens-extracted.md`)
- The enumerated shell invariants (live in `shell-invariants.md` on disk; Phase 3 reads the per-slug blocks directly)
- The Phase 3 materialization procedure (lives in `references/persist.md`, loaded fresh by the resuming session)
- The token-coverage script details (live in `scripts/check-token-coverage.sh`, called fresh on any iteration)

**Template shape:**

```markdown
# Phase 2 handoff — <slug>

_Written by /extract-ds-skill at <ISO date> after validation iteration <N>. Status: awaiting-approval. Read by the next session to reach the Phase 2/3 gate without re-validating._

## Proof point (verbatim)

<verbatim proof-point line from the validation summary>

TOKEN_COVERAGE=<PASS|NOOP|FAIL> (consumed: <N>, covered: <M>)

## Scratch artefacts (Phase 3 will materialize from these)

- `.extract-ds-skill-scratch/wiring-extracted.md` — <byte-size>, modified <ISO date>
- `.extract-ds-skill-scratch/examples/` — <K> files: <name>, <name>, …
- `.extract-ds-skill-scratch/foundations/` — <F> files: <name>, <name>, …
- `.extract-ds-skill-scratch/tokens-extracted.md` — <byte-size>, modified <ISO date>
- `.extract-ds-skill-scratch/shell-invariants.md` — <byte-size>, modified <ISO date> (omit this bullet when no wiring was lifted in Phase 2)

## Open [VERIFY] markers

1. `<file>:<line>` — <one-line reason>. Status: <pending|accepted|flagged-redo>
2. `<file>:<line>` — <one-line reason>. Status: <pending|accepted|flagged-redo>
…

## Resume context

- cwd convention: resume in the same worktree where this handoff was written (`<absolute-worktree-path>`).
- Phase 3 entry: load `references/persist.md` + `references/skill-template.md`. Slug-collision check runs FIRST. Materialize the scratch artefacts to `.claude/skills/<slug>/` per the persist map. Run `scripts/check-skill-docs.sh` after writes. Then close with the closing-message contract.
- If the user has not yet approved the proof-point above, surface the proof-point and the open `[VERIFY]` markers verbatim and ask `Approve to persist, or adjust?` — this is the same gate the prior session was at.

## Pickup prompt (paste into the new session)

```
/extract-ds-skill persist: .extract-ds-skill-scratch/handoffs/<resolved-filename>
```
```

Re-write the handoff after each validate iteration — the proof-point and `[VERIFY]` tally drift between iterations, and a resumed session must see the LATEST state, not an earlier one. The `<resolved-filename>` in the pickup prompt is the labeled handoff filename per `SKILL.md` "Handoff filename labeling" (e.g. `dryrun-06-phase-2.md` under a `.claude/worktrees/dryrun-06/` cwd, or bare `phase-2.md` otherwise) — write the exact filename the handoff was saved as.

### Resume entry — phase-2 → Phase 3

When `/extract-ds-skill persist: <path>` is invoked, the skill performs the resume-entry procedure documented in `SKILL.md` "Resume from a prior phase" (read handoff, validate shape, cross-worktree label check, render summary, enter Phase 3). The one-line resume summary uses this exact format for phase-2 → Phase 3 resumes:

```
Resuming from phase-2 handoff — slug=<X>, scratch=<absolute-scratch-path>, <N> open [VERIFY] markers, TOKEN_COVERAGE=<PASS|NOOP|FAIL>
```

Substitute the values from the handoff's "Open [VERIFY] markers" section and the embedded `TOKEN_COVERAGE=...` line of the proof-point verbatim. After rendering the summary, if the handoff's status flag is `awaiting-approval`, surface the proof-point and the open `[VERIFY]` markers verbatim and ask `Approve to persist, or adjust?` — this is the same gate the prior session was at. On approval, enter Phase 3 directly (slug-collision check first, then scaffold per `references/persist.md`). If the handoff's status flag is already `approved` (the rare case where the prior session approved but exited before reaching Phase 3), enter Phase 3 directly without re-asking.
