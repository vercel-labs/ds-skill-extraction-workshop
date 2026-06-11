---
name: extract-ds-skill
description: Extract a Claude Code design-system skill from a real DS source. Use when the user wants to turn a design system (component library, token set, asset package) into an installable skill at .claude/skills/<slug>/ in their project. Triggers: 'make a skill from <DS>', 'extract a DS skill', 'turn mantine/geist/material/<DS> into a skill'. Scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting - route copy rules to a separate copy skill, do not extract them here. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient for any phase past initial discovery framing.
---

## Mission (what a DS skill IS)

A design-system skill is an adapter that teaches an agent how to build high-fidelity UI with a specific design system. It is not a copy of the design-system documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

This skill BUILDS such a skill from a real DS source. The output is the skill; this file is the recipe.

## Scope (locked)

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

This scope block is quoted by downstream rules (Quick Triage step 1, Agent Stance bullet 3, Anti-fabrication "Do not" list, `references/component-extraction.md` Shape 3). Do not paraphrase or trim it when re-citing.

The skill runs in three labeled phases. The single human gate sits at the boundary between Phase 2 and Phase 3. Phase 1 closes with a confirmation prompt; Phase 2 closes with an approval prompt; Phase 3 writes to disk. Phase 1 and Phase 2 close with a hard stop (write handoff → cutoff message → EXIT); the user resumes in a FRESH Claude Code session via an explicit `validate:` / `persist:` resume parameter so the context window is cleared between phases.

## Resume from a prior phase

The skill recognizes two resume keywords parsed from the user's invocation. They are the only opt-in resume mechanism — there is NO file-existence auto-detection. A leftover handoff in `.extract-ds-skill-scratch/handoffs/` from a different DS extraction does NOT hijack a new run; the user resumes explicitly by naming the path.

- `validate: <path-to-phase-1.md>` → skip Phase 1, read the handoff at the named path, enter Phase 2 directly.
- `persist: <path-to-phase-2.md>` → skip Phase 2, read the handoff, enter Phase 3 directly.

In both cases the path is mandatory. Invocations like `/extract-ds-skill validate:` (no path) abort with a clear error naming the missing argument.

Resume entry procedure (run when either keyword is detected):

1. Read the handoff file at the named path. If the file does not exist or is unreadable, abort with a clear error pointing at the path. NEVER silently fall back to Phase 1 from scratch — a silent fallback hides the fact that resume failed and produces "the user thinks they resumed; the agent runs from zero".
2. Validate the handoff's shape minimally — the doc names a slug, a scratch directory path, and the phase it was written from. If the shape is invalid (e.g. the file is truncated, or names a phase that does not match the keyword's expected phase), abort with a clear error naming the offending file and the mismatch.
3. Compare the handoff filename's dryrun-label prefix (if any) against the resuming session's cwd. If the handoff was written under one `dryrun-NN` worktree and the resuming session is in a different `dryrun-MM` worktree (or in no worktree), emit a one-line WARNING naming both numbers and continue. This is observability, not enforcement — the user may have intentionally moved a handoff across worktrees for debugging.
4. Render a one-line resume summary back to the user. Format: `Resuming from phase-N handoff — slug=<X>, scratch=<path>, <phase-specific-detail>` (the per-phase detail is specified in `references/discovery.md` for phase-1 → Phase 2 resumes and `references/validate.md` for phase-2 → Phase 3 resumes).
5. Enter the named phase directly. Do NOT render the prior phase's summary; do NOT re-ask the user for confirmations they already gave.

If neither resume keyword is present in the invocation, run Phase 1 from scratch as today.

## Handoff filename labeling

Handoff filenames are prefixed with the dryrun version of the worktree they were written from, so cross-worktree mistakes are visible and parallel dryrun trials stay disambiguated even when they share a scratch location. The prefix is derived from the current working directory at handoff-write time.

Derivation rules:

1. Read cwd at the moment of handoff write.
2. Match cwd against the regex `(.*/)?.claude/worktrees/dryrun-(\d+)(/|$)`.
3. **If matched:** write to `.extract-ds-skill-scratch/handoffs/dryrun-<NN>-phase-<N>.md` (capture group 2 supplies the `<NN>`).
4. **If not matched** (running from the repo root, or from a worktree with non-`dryrun-NN` naming): write to `.extract-ds-skill-scratch/handoffs/phase-<N>.md` (no prefix). The cutoff message mentions that no dryrun label was applied, so the user can rename manually if they intended one.
5. The dryrun number is captured as plain digits — leading zeros are preserved if present in the worktree path (`dryrun-05` → `dryrun-05-phase-1.md`, not `dryrun-5-phase-1.md`).

The label is observability, not enforcement — it makes cross-worktree mistakes visible (via the warning in resume entry step 3 above) but does NOT block them.

## Phase 1: Discovery summary

Inspect the sources the user pointed at, classify each by role (design-system code, asset package, product/example app, internal AGENTS/CLAUDE files, docs site, docs:foundation, Storybook, Figma), auto-discover component exports, and render a compact discovery summary inline (not a file). Hard ceiling 30 lines, target 20-28. Load `references/discovery.md` for the budget rules, the source-role taxonomy, the auto-discover-and-prune flow, and the worked example.

The discovery summary covers: proposed skill name and target path, DS one-liner, components in scope (one line each, of the form "Components found (N), proposing (M)"), tokens detected (one summary line), assets detected (one summary line), foundation docs block if any (N URLs accepted or rejected per-URL, tagged `[docs:foundation]`, with each accepted root's depth-1 crawl tree shown abbreviated; omitted entirely if the user did not provide any foundation URL), 1-3 headline rule candidates with `file:line` cites, sources used (one line each, tagged `[code]` / `[docs]` / `[docs:foundation]` / `[storybook]` / `[private-blocker]`), and any open questions that would actually stop Phase 2. End with a single short sentence asking the user to confirm or adjust. Then stop and wait. If the user just says "go" without answering anything, pick defensible defaults and proceed.

Inspect-but-do-not-enumerate is the rule. Read enough to know what each source contains (package exports, top-level folders, docs index, example apps); do not list every component, token, or icon yet. The full enumeration happens in Phase 2, against the pruned set the user confirms.

### Worked example — Phase 1 summary against a public-DS-shaped target (illustrative)

The block below uses a public-DS-shaped target to ground the shape. The skill makes no assumption that the user's DS is the one in the example; the same summary contract applies to whichever DS the user passes. Substitute real cites for the DS you are extracting. The example shows the upstream-package case (large N, small demand-driven M). When the target includes a local wrapper surface, the components block instead defaults to proposing the full local surface (M = N) — see the local-surface worked example in `references/discovery.md`.

```
Proposed skill: `mantine` -> .claude/skills/mantine/
DS: Mantine - React component library with 100+ customizable components and accessible defaults.

Components found (147), proposing (4):
- TextInput - single-line text entry with label, description, and error slots
- Button - filled/outline/subtle action trigger with loading state and left/right section slots
- Checkbox - controlled boolean input, accepts label and description inline
- InputWrapper - wraps an input + label + description + error; pairs with custom inputs that need a11y labeling

Tokens detected: ~150 across color (theme colors 0-9 + functional), space (xs/sm/md/lg/xl), type (h1-h6 + functional).
Assets detected: 0 icons in this package (@tabler/icons-react ships separately, out of scope for v1).

Foundation docs:
- accepted: https://mantine.dev/styles/colors/ [docs:foundation] — crawled, found 4 sub-pages: dark-mode, functional, primary, theme-object
- accepted: https://ui.shadcn.com/docs/theming [docs:foundation] — crawled, found 3 sub-pages: dark-mode, css-variables, conventions

Headline rule candidates:
- "Use `loading` prop on Button for loading states, not a custom spinner inside `children` - the loading prop handles disabled coordination and ARIA announcements" (Button.tsx:88)
- "Wrap custom inputs in `<InputWrapper>`; bare inputs without a wrapper lose label association and fail axe" (InputWrapper.tsx:31)
- "Do not pass `aria-label` to a Button that already renders visible text" (Button.tsx:204)

Sources used:
- mantinedev/mantine @ v7.x [code, joint-read]
- mantine.dev/core/button [docs]
- mantine.dev/styles/colors/ [docs:foundation] (+4 crawled)
- ui.shadcn.com/docs/theming [docs:foundation] (+3 crawled)

Out-of-scope rules surfaced (route to sibling copy skill): "button labels are Title Case", "placeholder text is action-oriented".

No blockers. Confirm or adjust? (Reply "go" to accept defaults and begin extraction.)
```

### Phase 1 close (handoff emission, mandatory)

After the user confirms (with "go" or adjustments), run `mkdir -p .extract-ds-skill-scratch/handoffs/` and write the phase-1 handoff from the template in `references/discovery.md` (`## Handoff document — phase-1.md template`). Resolve the handoff filename per the "Handoff filename labeling" section above: under a `.claude/worktrees/dryrun-NN/` cwd write `.extract-ds-skill-scratch/handoffs/dryrun-NN-phase-1.md`, otherwise write `.extract-ds-skill-scratch/handoffs/phase-1.md`. The doc captures ONLY the decisions surfaced in the discovery summary — slug, ref project + entry, proposing set (as approved by the user), DS package versions + paths, accepted foundation URLs, the three headline rules verbatim with their `file:line` cites. Do NOT include the discovery exploration, the raw npm/curl/grep outputs, or the per-component deliberation — those are recoverable from the codebase and the meta-skill itself.

After the handoff is written, **print the cutoff message and EXIT**. Do NOT enter Phase 2 inline. The cutoff message uses the resolved labeled filename verbatim in both the "Handoff written to" line and the resume command:

```
Phase 1 complete. Handoff written to
.extract-ds-skill-scratch/handoffs/<resolved-filename>.

To enter Phase 2 (validation), start a FRESH Claude Code session in
this same directory and run:

    /extract-ds-skill validate: .extract-ds-skill-scratch/handoffs/<resolved-filename>

Starting fresh clears the context window so Phase 2's heavier work
(reference-project CSS lifting, WebFetch over foundation URLs, token
grep-resolves, exemplar lifts) has room to breathe. The handoff
captures your decisions so the new session won't re-ask anything.

If you'd rather continue in THIS session despite the context cost,
reply "continue inline" and I'll enter Phase 2 here. Default is the
fresh-session pickup.
```

When the handoff was written without a dryrun-label (cwd did not match `.claude/worktrees/dryrun-NN/`), append a one-line note to the cutoff message: `No dryrun label was applied (cwd is not under .claude/worktrees/dryrun-NN/). Rename the handoff manually if you intended a label.`

The "continue inline" override is the only allowed inline transition out of Phase 1. The default is EXIT; the override is opt-in. Per `references/anti-patterns.md` `state/inline-phase-transition`, writing the handoff and then entering Phase 2 inline (without the override) defeats the cutoff and wastes the handoff.

## Phase 2: Validate the extraction in a scratch workspace

Triggered only after explicit user confirmation from Phase 1. Goal: prove the extraction grounds in real source before any file is written to `.claude/skills/<slug>/`. Everything in this phase lives in `.extract-ds-skill-scratch/` (local, gitignored). Nothing is written to `.claude/skills/<slug>/` yet - iteration is cheap and partial state never lands in the user's project.

Load `references/validate.md` for the deterministic typecheck + grep-resolves protocol. The validation runs `scripts/validate.sh` against the scratch workspace. It typechecks the extracted component contracts against the DS package's published types, greps every cited token name against the source token file, greps every cited icon/asset name against the asset package, and counts `[VERIFY]` markers.

Before running `scripts/validate.sh`, emit the claims file: every positive prop/enum claim, every negative ("never accepts") claim, and every cited local path the extraction makes goes into `.extract-ds-skill-scratch/claims.txt` per the Claims file contract in `references/validate.md`. The script consumes that file to generate the prop-shape probe — positive claims become typed assignments, negative claims become `@ts-expect-error` lines, `PATH:` claims run `test -e` — so the probe checks declared claims, not prose. URL-shaped cites are verified fetchable (HTTP 200) at extract time and are not re-checked by the script.

If any `[docs:foundation]` URLs are in scope from Phase 1, run the foundation-docs extraction step in addition. Load `references/foundation-extraction.md`, then **iterate** over the union of accepted root URLs and crawled sub-pages from Phase 1 (one WebFetch per URL, never re-fetch). For each URL, classify candidate rules into the five shapes (token-pairing, mode-aware, contrast-minimum, semantic-role, fallback-element), grep-resolve every cited CSS variable against the installed token package (`node_modules/<ds-package>/dist/css/`), mark unresolved cites `[VERIFY]`, and stash the per-URL output to `.extract-ds-skill-scratch/foundations/<slug>.md` (slug per the persist map in `references/persist.md`). One bad URL logs `[VERIFY: WebFetch failed for <url>]` as the file body and the loop continues — failure on a single page does not abort the run. No foundation file lands in `.claude/skills/<slug>/` until Phase 3. Skip this paragraph entirely when no foundation URL is in scope; the baseline typecheck + grep-resolves contract is the full Phase 2. Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md` when one is in scope, or from the verbatim docs setup snippet otherwise.

If an `[example:project]` source is in scope from Phase 1, run the reference-project extraction step in addition. Load `references/reference-project.md` for the framework auto-detection, the five-step extraction recipe (provider, CSS imports, root-element attrs, bonus composition, **recursive companion-CSS lift**), and the scratch output contract. Step 5 of the recipe lifts the verbatim full contents of every CSS file the entry file imports (depth 3, within `app/`/`src/`) — not just the import lines — so the produced `SKILL.md` Setup section ships paste-ready wiring instead of prose summaries. After the lift completes, run `bash scripts/check-token-coverage.sh <ds-pkg-root> .extract-ds-skill-scratch/` as a Phase 2 hard gate: the script collects every `var(--X)` consumed in the produced code-block surfaces, locates each token's defining CSS file in the DS package, and asserts the file appears as an `@import` line in one of the lifted Companion CSS blocks. A FAIL exit blocks the wait-for-approval gate; the per-var `MISSING: ...` report surfaces verbatim to the user, who either accepts the gap or loops back to discovery. PASS / NOOP (Tailwind-style apps) proceeds.

The proof point surfaced before the gate is a single line of the form: "N props verified against source, M tokens grep-resolved, K assets grep-resolved, F foundation-rules extracted (X cited, Y `[VERIFY]`), 0 hallucinations" alongside any open `[VERIFY]` markers as a numbered tally. Omit the `F foundation-rules` segment when no `[docs:foundation]` URL was in scope. When a reference project IS in scope, append the wiring line (`Wiring extracted from <ref>@<entry> (<framework>, N lines, K CSS files lifted, M tokens consumed, M covered)`) and the `TOKEN_COVERAGE=PASS|NOOP|FAIL` tally line immediately after — see `references/validate.md` for the full proof-point format. If the tally is non-zero, the agent describes each unresolved marker and asks whether to drop the rule, escalate to a second-pass source read, or accept it as a known limitation.

After the proof-point line is emitted (and any `[VERIFY]` tally is surfaced), BEFORE waiting for approval, write the phase-2 handoff from the template in `references/validate.md` (`## Handoff document — phase-2.md template`). Resolve the filename per the "Handoff filename labeling" section above: under a `.claude/worktrees/dryrun-NN/` cwd write `.extract-ds-skill-scratch/handoffs/dryrun-NN-phase-2.md`, otherwise write `.extract-ds-skill-scratch/handoffs/phase-2.md`. The doc embeds the proof-point line verbatim, lists the scratch artefacts Phase 3 will materialize (`wiring-extracted.md`, `examples/*.md`, `foundations/*.md`, `tokens-extracted.md`, and `shell-invariants.md` when Phase 2 lifted wiring per the Shell-invariant extraction step in `references/validate.md`), records the token-coverage tally, and notes each `[VERIFY]` marker with its user-acceptance status. Do NOT duplicate the lifted CSS or the extracted prose — those live on disk in scratch and the handoff references them by path. Re-write the handoff after each validate iteration (the proof-point and `[VERIFY]` tally drift between iterations).

Iterate in `.extract-ds-skill-scratch/` until the user is satisfied. Re-run `scripts/validate.sh` after each iteration. Do not touch `.claude/skills/<slug>/` during iteration. Wait for explicit user approval, then proceed to the Phase 2 close cutoff below.

### Phase 2 close (handoff emission, mandatory)

After the user approves the proof-point (the phase-2 handoff has already been written and re-written across iterations per the paragraph above), **print the cutoff message and EXIT**. Do NOT enter Phase 3 inline. The cutoff message uses the resolved labeled filename verbatim in both the "Handoff written to" line and the resume command:

```
Phase 2 complete. Handoff written to
.extract-ds-skill-scratch/handoffs/<resolved-filename>.

To enter Phase 3 (persist), start a FRESH Claude Code session in
this same directory and run:

    /extract-ds-skill persist: .extract-ds-skill-scratch/handoffs/<resolved-filename>

Starting fresh clears the context window so Phase 3's slug-collision
check, scaffolder write, and post-emit check-skill-docs.sh run have
room to breathe. The handoff captures the proof-point and your
[VERIFY] decisions so the new session won't re-validate or re-ask.

If you'd rather continue in THIS session despite the context cost,
reply "continue inline" and I'll enter Phase 3 here. Default is the
fresh-session pickup.
```

When the handoff was written without a dryrun-label, append the same note as in Phase 1 close (`No dryrun label was applied (cwd is not under .claude/worktrees/dryrun-NN/). Rename the handoff manually if you intended a label.`).

The "continue inline" override is the only allowed inline transition out of Phase 2. The default is EXIT. Per `references/anti-patterns.md` `state/inline-phase-transition`, writing the handoff and then entering Phase 3 inline (without the override) defeats the cutoff.

### Worked example — Phase 2 proof-point line (illustrative)

The block below uses a public-DS-shaped target to ground the shape. The skill makes no assumption that the user's DS is the one in the example; the same proof-point contract applies to whichever DS the user passes.

```
Validation complete.
- 14 props verified against source (Button: 6, TextInput: 4, Checkbox: 2, InputWrapper: 2)
- 47 tokens grep-resolved (color: 28, space: 12, type: 7)
- 0 assets in scope this run
- 6 foundation-rules extracted (5 cited, 1 [VERIFY])
- Wiring extracted from <owner>/<reference-project>@app/layout.tsx (next-app, 28 lines, 1 CSS file lifted, 12 tokens consumed, 12 covered)
- TOKEN_COVERAGE=PASS
- 0 hallucinations
- 3 open [VERIFY] markers:
  1. Button.md:42 - loading-state prop name not confirmed in types file
  2. InputWrapper.md:18 - validation slot signature absent from public types; inferred from docs
  3. tokens.md:74 - `--mantine-color-blue-6` cited by foundation URL but no grep-resolve in @mantine/core@7.x

Approve to persist? (Reply "go" to write to .claude/skills/mantine/.)
```

## Phase 3: Persist the skill

Triggered only after the user confirms the validation looks good. This is the first write to `.claude/skills/<slug>/` in this conversation. Once you start writing here, files go live immediately. No staging, no draft frontmatter, no commit step. Partial state during a crash is acceptable.

Load `references/persist.md` for the slug-collision check (must run FIRST, before any write), the file layout, the per-component-file contract, and the closing message. The scaffolder writes `SKILL.md`, `AGENTS.md`, `references/components/*.md`, `references/tokens.md`, `references/assets.md`, and optionally `references/patterns.md` - omit any folder that would be empty.

If the user later asks for changes, edit the files in-place (they are already live under `.claude/skills/<slug>/`). Re-run `scripts/check-skill-docs.sh` after any edit that touches the routing table, the rule-slug registry, or the file layout.

The persist target is `.claude/skills/<slug>/` in the attendee's project (per-project, not per-user). Attendees commit the skill alongside the starter; the skill ships with the repo, not the dotfiles. This makes the skill portable across machines, reviewable in PRs, and rollback-able with `git`.

## Source-role taxonomy

Every source the user points at falls into one of ten roles. The taxonomy lives in `references/discovery.md`; this is the SKILL.md summary for fast classification during Phase 1.

- **Design-system code** (`[code]`) - the package source, types file, and component implementations. Highest authority. Joint-read with docs; wins on conflict.
- **Asset package** (`[code]`) - icons, logos, illustrations shipped as a separate package (e.g. heroicons, geist-icons). Treat exports as the inventory; do not invent names.
- **Product/example app** (`[code]`) - a real consumer of the DS. The single best source for wiring (provider mount, font setup, globals CSS, install scripts). Copy wiring verbatim from here when available.
- **Reference project** (`[example:project]`) - a real consumer app the user supplies as a URL or local path at Phase 1 input time, explicitly tagged for **wiring extraction**. Phase 2 auto-detects the framework (Vite / Next.js App / Next.js Pages / CRA), reads the root entry file, and lifts the provider mount + CSS imports + root-element attributes verbatim per `references/reference-project.md`. Opt-in. When omitted and a `[docs:foundation]` URL is in scope, the Setup section falls back to the verbatim docs setup snippet.
- **Internal AGENTS/CLAUDE files** (`[code]`) - guidance the DS team has already written for agents. Inherit liberally; cite by `file:line`.
- **Docs site** (`[docs]`) - prose-and-example documentation. Useful for the "when to use" and "common mistakes" sections; lower authority than types on prop signatures. Cited, not extracted.
- **Docs:foundation** (`[docs:foundation]`) - prose foundations pages on the DS docs site that are EXTRACTED into `token/*` rules, not just cited. **N URLs per call**, opt-in; each accepted root is crawled depth-1 within its path prefix per `references/discovery.md` (Crawl rules). Phase 2 iterates the union of accepted+crawled URLs via WebFetch, extracts five prose rule shapes per `references/foundation-extraction.md` (token-pairing, mode-aware, contrast-minimum, semantic-role, fallback-element), and materializes them one file per source URL under `references/foundations/<slug>.md` (slug per the persist map). Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md`, or from the verbatim docs setup snippet as a fallback.
- **Storybook** (`[storybook]`) - canonical variant examples. Useful for composition examples; not always authoritative on prop names if the stories lag the package.
- **Figma** (`[figma]`) - design-time source. Use for tokens and visual rules; never for prop names or API contracts.
- **Private/inaccessible** (`[private-blocker]`) - soft blocker. Log, proceed, may become available later.

## Six rule shapes (extraction recognition)

During extraction, every rule the agent surfaces falls into one of six shapes. The full taxonomy with examples lives in `references/component-extraction.md`; this is the SKILL.md summary so the agent can route quickly.

1. **Component-selection** - "use X for Y; do not use X for Z". Extract.
2. **Prop-usage** - "set `disabled` not `inactive` on loading buttons". Extract.
3. **Naming-copy** - "button labels are Title Case", "placeholder is action-oriented". **ROUTE OUT.** Mention in discovery summary as a candidate for a sibling copy skill; do not extract here.
4. **Accessibility** - "wrap inputs in FormControl for label association". Extract.
5. **Default-state** - "buttons render `medium` size unless explicitly sized". Extract.
6. **Cross-skill-back-reference** - "for icon usage, see icons skill". Defer until a sibling skill exists; mark `[VERIFY]` and proceed.

## Quick Triage

Five-step priority scan. Run in order. Stop at the first step that fires a hard rule.

1. **Is the request in scope (tokens/assets/components/APIs) or copy?** If copy (tone, voice, marketing language, casing rules, placeholder phrasing, error-message wording, microcopy style) → say so and stop. Suggest a sibling copy skill (`extract-copy-skill` or equivalent); do not extract copy here. The full scope guardrail is quoted in the Scope section above - apply it verbatim.
2. **Is the DS source accessible?** If the user pointed at a private repo, paywalled package, or unreachable docs site, treat it as a soft blocker - record it in the discovery summary tagged `[private-blocker]`, do not pretend you read it. Inputs that may become available later are not hard blockers; inputs you fabricated from memory are.
3. **Does a skill with this slug already exist at `.claude/skills/<slug>/`?** If yes, ASK before overwriting. Never silently suffix `-2`, `-new`, or a date. The user picks: overwrite, choose a different slug, or abort.
4. **Is the auto-discovered component set the right scope?** Print "Components found (N), proposing (M)" in Phase 1 and let the user prune. For a local DS wrapper surface (`ds/components/*.tsx`-shaped), the default is ALL wrappers found (M = N); for upstream-package exports not wrapped locally, the default is demand-driven (wiring/exemplar pull only). The user trims by name. Never type a hand-picked component list off a slide - the discovery scan is the source of truth, the prune is the human edit.
5. **Are sources joint-readable (code + docs)?** If both are present, joint-read them and resolve conflicts in favor of code. If only docs are present, mark every extracted prop with `[VERIFY]` until a consumer app or types file lands. If only code is present, extract from the types and the source; docs-derived rules are deferred.

## Agent Stance

- The DS source is the canonical truth. Generated rules cite source by `file:line`; uncited rules get `[VERIFY]` or get dropped. A rule with no source citation is a hallucination waiting to surface in someone else's PR.
- Joint-read code and docs - code wins on conflict. A docs page that claims a prop the types file does not export is a docs bug, not a feature. Log the divergence in the discovery summary so the DS team can fix it.
- Scope discipline is load-bearing. If a rule is about copy, voice, or marketing tone, route it out (mention in the discovery summary as a candidate for a sibling copy skill) - do not extract it. The scope guardrail block is quoted verbatim by Quick Triage step 1 and by `references/component-extraction.md` Shape 3.
- Auto-discover then prune. Scan the package's public exports, list everything in Phase 1, let the user trim. Workshop credibility depends on this: rehearsed theatre is detectable; an auto-discovered list pruned live is not.
- Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory.

## When to Load References

Progressive disclosure is the contract. Load each reference file only at the gate it serves.

| When you are... | Load references | Internal pass |
|---|---|---|
| Framing Phase 1, classifying sources, rendering the discovery summary | `references/discovery.md` | Source-role taxonomy, auto-discover-and-prune, budget rules |
| Running Phase 2 validation in `.extract-ds-skill-scratch/` | `references/validate.md` | Typecheck + grep-resolves protocol, `[VERIFY]` tally, wait-gate |
| About to write the first file under `.claude/skills/<slug>/` in Phase 3 | `references/persist.md` + `references/skill-template.md` | Slug-collision check, file layout, SKILL.md contract |
| After closing message, considering the optional `dry-runs/` snapshot prompt | `references/persist.md` (`## Optional: dry-run snapshot`) | Conditional on `dry-runs/` existing at project root; prompt shape, copy + RUBRIC stub |
| Extracting a single component into `references/components/<name>.md` | `references/component-extraction.md` | 8-section component-file checklist, six rule shapes, Shape 3 routing |
| Extracting rules from each `[docs:foundation]` URL (root or crawled sub-page) into `references/foundations/<page>.md` plus the produced SKILL.md Setup section | `references/foundation-extraction.md` | Per-URL iteration contract, six foundation rule shapes, per-rule subsection skeleton, CSS-variable grep-resolve, Setup-injection contract |
| Lifting wiring from an `[example:project]` reference project into `.extract-ds-skill-scratch/wiring-extracted.md`, AND lifting composition exemplars from the same reference project into `.extract-ds-skill-scratch/examples/<basename>.md` | `references/reference-project.md` | Framework auto-detection (Vite / Next.js App / Next.js Pages / CRA), 5-step lift recipe (provider + CSS imports + root-attrs + bonus composition + **recursive companion-CSS file lift, depth 3, verbatim contents**), framework-adaptation note, fallback-to-docs path, AND composition exemplar extraction (two globs — `app/**/page.tsx` and `components/showcase/*.tsx` — one scratch file per match, per-file "What to copy" pattern bullets). The companion-CSS lift is what makes the produced Setup section paste-ready; `scripts/check-token-coverage.sh` is the Phase 2 hard gate that asserts the lifted `@import` set covers every `var(--X)` consumed by produced exemplars. |
| Writing a `Bad \| Good \| Why` block, or any cross-cutting anti-pattern | `references/anti-patterns.md` | Column grammar, code-fence rule, cross-component duplication |
| Asked "why did you inherit X from Y?" by a maintainer | `references/inheritance.md` | Source-by-source inherit / do-not-inherit ledger |
| Hitting a known gap (Hallmark progressive-disclosure tiers, stamp pattern, refresh verb) | `references/coverage-gaps.md` | ~150-200 instruction-budget caveat, deferred work |
| Performing a reflexive audit during or after extraction | none - the rules below ARE the rubric. No separate `audit/` verb in v1; reflexive audit only |

Do NOT pre-load reference files before their gate triggers - progressive disclosure is the contract.

## Workflow Gates

**STOP.** Reading SKILL.md alone is insufficient. The reference files are not optional appendices; they are the operating contract. SKILL.md frames the phases and the rules; the references carry the operational detail. Skipping a required load means the agent fabricates the contract instead of following it.

Required loads (non-negotiable):

- Before writing `SKILL.md` for the new skill, load `references/skill-template.md`. SKILL.md is the load-bearing file of the skill the agent is producing; the contract for what goes in it (frontmatter shape, mission sentence, routing table layout, hard rules, final checks) is too long to fit here.
- Before writing each `references/components/<name>.md`, load `references/component-extraction.md`. The 8-section checklist (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent), the six rule shapes, and the Shape 3 routing rule live there. Load once per component; the file is short on purpose.
- Before any write to `.claude/skills/<slug>/`, load `references/persist.md`. The slug-collision check (run FIRST, before any write), the file layout, and the closing-message contract live there.
- After scaffold completes, run `scripts/check-skill-docs.sh`. This is the post-emit consistency check; its output IS the audit result. Do not declare the skill saved before this script exits 0.

## Anti-fabrication rules

**Do:**

- Verify component props, token names, icon names, and asset names from source. The source is the types file, the published component, the token export, or the asset manifest - not the docs site alone.
- Mark unverifiable facts [VERIFY]. Report blockers instead of guessing. A `[VERIFY]` marker is cheap; a fabricated rule that lands in a starter is expensive.
- Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory.
- Treat private/inaccessible sources as inputs that may become available later, not hard blockers. Tag them `[private-blocker]` in the discovery summary and proceed with what is accessible.
- Joint-read code and docs; resolve conflicts in favor of code. Log the divergence so the DS team sees it.
- Prefer public package APIs and exports over internal source paths. The skill teaches consumers; consumers cannot import from internal paths.

**Do not:**

- Invent props, variants, icons, assets, tokens, or setup steps. If the types file does not export it, it does not exist.
- Silently overwrite an existing slug. Before writing anything, check whether a skill with that slug already exists. If it does, ASK the user whether to overwrite or pick a different slug - do not silently suffix.
- Pre-load reference files before their gate triggers. Progressive disclosure is load-bearing; eager loading inflates context and degrades rule-following.
- Extract copy, voice, naming, or casing rules into this DS skill. Recognize them during extraction (Shape 3) and route them to a sibling copy skill via the discovery summary.
- Leave empty placeholders or guidance that encourages guessing. Empty placeholders read as "fill this in later" and never get filled.
- Encourage raw CSS values when tokens exist. A skill that opens the door to raw hex codes loses the design-system contract on the first prompt.
- Include examples that do not compile against public APIs. Every example file in `references/components/*.md` must be runnable against the published package.
- Put the full design system manual in SKILL.md. SKILL.md routes; references carry the manual.
- Invent example files. If the reference project ships zero composition exemplars (no `app/**/page.tsx`, no `components/showcase/*.tsx`), the produced skill ships zero example files. Empty `references/examples/` is the correct empty state — never fabricate a composition exemplar to fill the directory.
- Summarize companion CSS files as prose in the produced Setup section, or cross-ref `references/foundations/<page>.md` for "the verbatim CSS". The CSS files surfaced by step 5 of the reference-project extraction recipe ship verbatim into `### Companion CSS — <path>` subheadings in SKILL.md Setup. Foundation files document rules, not wiring. Registered as `wiring/css-prose-summary` in `references/anti-patterns.md` Layer C; enforced by `scripts/check-token-coverage.sh` (Phase 2 hard gate) and `scripts/check-skill-docs.sh` check #11 `TOKEN_COVERAGE` (Phase 3 post-emit, opt-in via `--ds-package-root`).

## Reflexive audit (the skill IS the rubric)

Three layered mechanisms operate during and after extraction. There is no separate `audit/` verb in v1. The rules listed in this file and the reference files ARE the rubric. The agent audits itself by re-reading the rules at gate boundaries and by running a deterministic script after persist.

**(A) PRE-EMIT structural re-read.** Just before invoking `scripts/scaffold.sh`, re-read this "Reflexive audit" section and `references/component-extraction.md`, then paste a tick-list back into the message as visible chain-of-thought:

1. Every component file has all 8 required sections (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent). Missing sections are not allowed; "no special rules" is the explicit empty-state for components that genuinely have nothing extra to say.
2. Every extracted rule is cited to a source `file:line`. Uncited rules carry `[VERIFY]` or are dropped. Citations point at the canonical source - prefer the types file or the component source over a docs page.
3. Every rule is in scope (tokens/assets/components/APIs). Any copy/voice/casing rule surfaced during extraction is recorded in the discovery summary as a candidate for a sibling copy skill, not extracted here. The scope guardrail block is quoted by this rule.
4. Every routing-table row in the new SKILL.md resolves to a file the scaffolder is about to write. Phantom rows (rows pointing at files the scaffolder will not produce) are the most common consistency bug; the pre-emit tick is the cheapest place to catch them.
5. Every rule slug in the new SKILL.md follows the registry pattern (`component/<name>-<rule>`, `token/<name>-<rule>`, `asset/<name>-<rule>`). Hyphenated, namespaced, one slug per concept.
6. Every `references/examples/<name>.md` file lifts from a real file in the reference project (an `app/**/page.tsx` or a `components/showcase/*.tsx`), and the routing table contains one row per example file plus the index row. If the reference project ships zero exemplars, `references/examples/` is omitted and the routing table carries no example rows — the empty state is a real state, not an omission to backfill.

If any tick fails, fix in `.extract-ds-skill-scratch/` and re-run the tick-list before calling `scripts/scaffold.sh`. This is a visible chain-of-thought step, not a hidden one. The agent pastes the tick-list back into the message so a human reviewing the transcript can verify the audit ran.

**(B) IN-FLIGHT `[VERIFY]` markers.** Any rule the agent cannot fully ground in source gets a literal `[VERIFY]` marker inline at the point of extraction. Keep a running tally. The tally surfaces in the Phase 2 proof-point line ("N props verified, K open [VERIFY] markers") and again in the closing message after Phase 3. A `[VERIFY]` marker is not a defect; an undecided `[VERIFY]` at the end of Phase 3 is. Resolve each one by reading more source, downgrading the rule, or dropping it.

**(C) POST-EMIT `scripts/check-skill-docs.sh`.** Runs against the written skill after Phase 3 writes complete. The script asserts: every routing-table row in the new SKILL.md resolves to a real file under `.claude/skills/<slug>/`; every rule slug in the registry resolves to a citation in a reference file; every `[VERIFY]` marker is grep-counted and surfaced; every component file ships all 8 required sections. The script's stdout IS the audit result. Exit code 0 means consistency passed; non-zero means at least one assertion failed and the closing message must list the failures.

No separate `audit/checklist.md`, no `rubric.md`. The rules ARE the rubric. A future audit verb is deferred (see `references/coverage-gaps.md`); v1 ships the reflexive loop only.

## Final checks

After `scripts/check-skill-docs.sh` exits 0, print the closing message. The closing message has three parts: a one-line confirmation, 2-3 example prompts, and the `[VERIFY]` tally.

First line: ``Skill saved at `.claude/skills/<slug>/`.``

Then the closing-message rule applies verbatim: "Tell the user the skill is saved, then show 2-3 example prompts to try. Make them screen- or product-level ('a settings page', 'a pricing section'), not component shopping lists." The prompts are how the user proves the skill works end-to-end without further coaching. Pick prompts that exercise multiple components and at least one composition pattern.

Example shape (substitute the real DS name, the real slug, and realistic product-level prompts for the DS in scope):

> **Skill saved as `<slug>`.**
>
> Try it:
> - "Build a login page styled with <name>"
> - "Create a billing settings screen with a plan picker and invoice history"
> - "Draft a pricing section using <name> components"

Then list every `[VERIFY]` marker as a numbered list with the file path and a one-line summary of what could not be grounded. The tally is non-optional even when the count is zero - "0 open [VERIFY] markers" is the success state worth surfacing:

```
[VERIFY] markers (N):
1. references/components/button.md:42 — loading-state prop name not confirmed in types file
2. references/tokens.md:18 — motion scale absent from package; inferred from docs site only
```

If any `check-skill-docs.sh` assertion failed, list the failures verbatim from the script's stdout and stop. Do not declare success. Do not print the example prompts. The skill on disk is partial; the user decides whether to fix in place (files are already live under `.claude/skills/<slug>/`) or roll back manually with `git`. The agent does not auto-rollback; the per-project persist target makes rollback the user's call, not the skill's.

After the closing message lands, run the **optional snapshot step** (next section). After that step resolves (yes or no), the conversation is done. Further user requests for changes are handled by editing the live files in place and re-running `scripts/check-skill-docs.sh` after each edit that touches the routing table, the rule-slug registry, or the file layout.

## Optional: snapshot to `dry-runs/`

If a `dry-runs/` directory exists at the project root, after the closing message ask the user whether to snapshot this run into `dry-runs/<YYYY-MM-DD>-<label>/`. If `dry-runs/` does not exist, skip this step silently — the convention is project-specific and absent in most consumer repos.

The prompt has exactly one question and offers a default label. Worked example:

> A `dry-runs/` directory exists in this project. Snapshot this run to `dry-runs/<YYYY-MM-DD>-<label>/`?
> Default label: `<slug>-<short-tag>` (e.g. `ds-pivot-1`, `acme-ui-baseline`).
> Reply with a label, "yes" to accept the default, or "no" to skip.

If the user accepts, copy `.claude/skills/<slug>/` to `dry-runs/<date>-<label>/extracted-skill/`, write a `README.md` mirroring the existing baseline shape (one paragraph of context, "What's here" list, "Diff against earlier runs" snippet, "Known limitations" list), and write a stub `RUBRIC.md` by copying the body of `dry-runs/TEMPLATE.md` and pre-filling the fields the agent run itself produced (components, validation proof point, `check-skill-docs.sh` exit code, `[VERIFY]` tally). Leave the operator-observable fields (timings, UX confusion, Phase 4/5) blank.

Detail and mechanics in `references/persist.md` (`## Optional: dry-run snapshot`). Do NOT pre-load that section — load it on this step's gate only.

If the user replies "no" (or anything other than a label/yes), skip silently. This is a single-question gate, not a multi-step interaction; if the user is unsure, the snapshot can be created manually after the fact with `cp -R .claude/skills/<slug>/ dry-runs/<date>-<label>/extracted-skill/`.

## Phase 3 close (handoff emission, mandatory)

After the closing message lands and the optional snapshot step resolves (yes or no), write the phase-3 handoff from the template in `references/persist.md` (`## Handoff document — phase-3.md template`). Resolve the filename per the "Handoff filename labeling" section above: under a `.claude/worktrees/dryrun-NN/` cwd write `.extract-ds-skill-scratch/handoffs/dryrun-NN-phase-3.md`, otherwise write `.extract-ds-skill-scratch/handoffs/phase-3.md`. Distinct from Phase 1/2 handoffs: Phase 3 has no next phase to resume into — this doc is a snapshot for sibling agents (demo runners, integration follow-ups, post-extraction reviewers) to act on. There is no cutoff and no EXIT — the session ending here is natural (the work is done), not enforced by an invariant.

The doc captures: the produced skill's absolute path, the `check-skill-docs.sh` tally, any remaining `[VERIFY]` markers from the closing message, and suggested follow-up actions for the sibling agent (typecheck the consumer app, render a demo, run integration tests against the produced skill). The pickup prompt is `Read .extract-ds-skill-scratch/handoffs/<resolved-filename>` — no `/extract-ds-skill` skill to re-enter, just a brief.

Tell the user once, using the resolved labeled filename verbatim: `Phase 3 handoff written to .extract-ds-skill-scratch/handoffs/<resolved-filename> — sibling agents (demo runner, integration tests) can pick up from there.`

## Slug-naming heuristics

The slug is the directory name under `.claude/skills/`. It is also the trigger word the user types when invoking the skill. Pick it carefully.

- Kebab-case, short. `mantine`, `geist`, `acme-ui`. Not `AcmeUI`, not `acme_ui`, not `our-internal-design-system-v2-final`.
- Match the package name when possible. If the DS publishes as `<scope>/<pkg>` (e.g. `<scope>/react`), the slug is `<scope>-react`; if it publishes as a bare name (e.g. `geist`), the slug matches the bare name.
- If the package name collides with a generic word (`ui`, `components`, `design`), prefix with the org or product (`acme-ui`, `vercel-design`).
- If the user has multiple sibling skills (DS + copy + a11y), the slug should disambiguate: `acme-ui` for the DS skill, `acme-copy` for the sibling.
- Slug collisions are a hard ASK. Never silently suffix `-2`, `-new`, `-v2`, or a date.

## The single human gate (clarification)

The skill has exactly one human gate. It sits between Phase 2 and Phase 3. Phase 1 closes with a confirmation prompt, but that prompt is cheap - the worst case is the user types "go" and the agent regenerates the discovery summary. The Phase 2 / Phase 3 boundary is different: once Phase 3 begins, files land in `.claude/skills/<slug>/` and the act is durable.

The reason the gate is here and not elsewhere:

- Phase 1 has nothing to gate. Discovery is read-only inspection.
- Phase 2 produces a deterministic proof point ("N props verified, 0 hallucinations"). The user reviews this proof point against their own knowledge of the DS, then approves or sends the agent back to iterate.
- Phase 3 writes to disk. Once it starts, there is no rollback inside the skill - the user rolls back with `git` if needed.

Single gate is a v0-inherited contract. It keeps the human in the loop where the cost of being wrong is high, and out of the loop where the cost of being wrong is cheap. Do not add a second gate "for safety"; redundant gates train the user to rubber-stamp them.

## Common agent failure modes

Notes for the next agent that runs this skill. Failure modes observed during dry-runs and design review:

- **Pre-loading references.** The agent reads `references/persist.md` during Phase 1 "to be safe". This inflates context, degrades rule-following downstream, and signals confusion about progressive disclosure. Load on gate, never before.
- **Extracting copy rules.** A button-label casing rule shows up in the source; the agent extracts it into `references/components/button.md` because the source says it. Wrong. Route it out via the discovery summary. The scope guardrail is load-bearing.
- **Skipping the slug-collision check.** The agent assumes the slug is fresh and writes. If a skill at that slug already exists, the user loses their previous work. The collision check is the FIRST step of Phase 3, not an afterthought.
- **Hand-picking components instead of auto-discovering.** The agent reads the docs nav, types 6 component names, and proceeds. Wrong. Scan exports, propose all, let the user prune. The "N found, M proposing" line is the contract; the audience will notice if it is missing.
- **Declaring success before `check-skill-docs.sh` exits 0.** The agent finishes scaffolding, prints the closing message, and the user discovers later that a routing-table row points at a missing file. Run the check first; only then close.
- **Silent `[VERIFY]` markers.** The agent leaves `[VERIFY]` markers in the files but does not surface them in the closing message. The markers exist to be resolved; surface every one, by file and line.
- **Treating docs as authoritative over types.** The agent reads the docs site, sees a prop called `loading`, extracts a rule. The types file does not export `loading`; the prop is `isLoading`. Joint-read, prefer code on conflict.
- **Inventing a prop because "every button has one".** The DS does not ship a `size="xs"` variant; the agent extracts a rule about it because most DSs do. If the types file does not export it, it does not exist.
- **Re-loading SKILL.md mid-extraction.** SKILL.md is the orchestrator; it does not change between phases. Re-loading it wastes context. Load references on gate; trust the SKILL.md you already have.
- **Skipping the pre-emit tick-list.** The agent generates the component files and goes straight to `scripts/scaffold.sh`. The pre-emit re-read is the cheapest place to catch phantom routing-table rows, missing sections, and uncited rules. Skip it and the post-emit script catches more failures, but later and louder.

## Inheritance summary (where the rules come from)

This skill inherits from four sources. The full ledger lives in `references/inheritance.md`; this is the SKILL.md summary for orientation.

- **v0 DS-onboarding flow** (`onboarding-instructions.ts`) - the three-phase contract, the single human gate, the discovery-summary budget rules, the adapter-not-docs mission sentence, the slug-collision ASK rule, the anti-fabrication Do/Don't list, the closing-message contract. Phrasings marked verbatim above are character-for-character from this source.
- **vercel/front product-copywriting skill** - the structural shape only: YAML frontmatter as dispatch contract, the "When to Load References" routing-table layout, the `**STOP.**` block grammar, per-domain reference-file granularity, Quick Triage layout, Agent Stance layout. None of the copywriting content is inherited; the scope guardrail explicitly routes copy out.
- **Geist `<BestPractices>` .mdx pattern** - per-component file with frontmatter, `When to use / Behavior / Content / Accessibility` subsection vocabulary, six rule shapes, `Bad | Good | Why` columnar anti-pattern grammar, cross-component rule duplication, universal-coverage rule.
- **Hallmark (Together AI)** - progressive-disclosure load map, pre-emit self-check discipline as reflexive audit. Stamp pattern dropped from v1 (logged in `references/coverage-gaps.md` as deferred).

## Out of scope for v1

To prevent feature creep mid-extraction, the following are explicitly out of scope. They live in `references/coverage-gaps.md` as deferred work.

- Audit verb (`audit-ds-skill` or similar). The reflexive audit IS the rubric in v1; a standalone audit verb is deferred until a re-extract verb needs it.
- Refresh verb (`refresh-ds-skill`). When the DS upgrades, re-run the extract verb against the new version. A purpose-built refresh that diffs old vs new is deferred.
- Stamp pattern (Hallmark-style machine-readable per-file claims). Git blame is provenance; `check-skill-docs.sh` does not need stamps as a falsifiability check.
- Visual probe in `validate.sh`. v1 ships deterministic typecheck + grep-resolves only. A visual probe (boot a preview, screenshot, diff) is deferred.
- Cross-skill composition beyond the routing-table third column. v1 ships single-skill workflows; sibling-skill orchestration is deferred.
- Tier-stratified progressive disclosure (Hallmark's 7-tier load map). v1 ships 1-tier (load-on-gate). Noted as MEDIUM-at-scale, LOW at workshop scope.

## Why this design (notes for future maintainers)

Six architectural choices were locked on 2026-05-31. Recording them here so the next maintainer does not relitigate them by accident.

- **Per-project persist target.** The skill writes to `.claude/skills/<slug>/` in the attendee's repo, not `~/.claude/skills/<slug>/` in their user directory. Per-project makes the skill committable, reviewable in PRs, and portable across machines. Per-user would have made the workshop demo non-reproducible across attendee laptops.
- **Deterministic validation (typecheck + grep-resolves), no visual probe.** Catches what the model cannot catch about its own output. The proof point is "N props verified, 0 hallucinations" - a number the user can audit at a glance. A visual probe would catch render bugs the typecheck misses, but at the cost of time, flakiness, and a runtime dependency. Deferred to coverage-gaps.md.
- **Skill files only (no runnable starter).** The hands-on deliverable is the skill files. A separate starter repo (built in Task #9) provides the runnable Next app the freshly extracted skill is exercised against. Splitting deliverables keeps the meta-skill's surface small and the demo's surface bounded.
- **Auto-discover + prune component scope.** The meta-skill scans the package's public exports and proposes the full set; the user prunes. Hand-picking would have been faster on stage but would have read as rehearsed theatre. The "Components found (38), proposing (4)" line is the workshop-credibility primitive.
- **Headline rules discovered independently.** The meta-skill does not hard-code DS-specific rules (e.g. "use `disabled` not `inactive`" for one DS, "use `loading` prop not custom spinner" for another). If dry-runs show the extraction misses the rule, the prompts in this file are tuned until it lands. Hard-coding is detectable; the audience can smell it.
- **No Hallmark stamp pattern.** The v0 onboarding flow does not stamp. The product-copywriting skill does not stamp (git blame is provenance). `check-skill-docs.sh` does not need stamps as a falsifiability check. Adding a stamp because Hallmark does would be cargo-cult. Deferred to `references/coverage-gaps.md` for a future re-extract verb that genuinely needs source provenance.

## Operating envelope (what good output looks like)

A successful run produces:

- A single skill directory at `.claude/skills/<slug>/` containing `SKILL.md`, `AGENTS.md`, `references/components/*.md`, `references/tokens.md`, `references/assets.md`, and optionally `references/patterns.md`.
- A SKILL.md for the produced skill (not this file) that frames the DS as canonical, names setup and import rules, lists routing rules pointing at `references/`, and ends with hard rules and final checks. Short, operational, authoritative.
- Every component file with all 8 sections (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent), every rule cited to `file:line` or marked `[VERIFY]`.
- A `check-skill-docs.sh` exit code 0.
- A closing message that confirms the save path, offers 2-3 product-level example prompts, and lists every open `[VERIFY]` marker.

A failed run produces: a `check-skill-docs.sh` exit code non-zero, a list of failures verbatim from the script, and no example prompts. The skill on disk is partial; the user decides whether to fix in place or `git reset`. The agent does not auto-rollback.

The agent's job is to land in the successful-run state. The reflexive audit, the validation gate, the slug-collision ASK, and the post-emit consistency check are the four mechanisms that get it there. Trust the contract. Do not improvise around it.

