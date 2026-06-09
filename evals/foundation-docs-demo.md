# Foundation-docs demo — before / after

Recorded 2026-06-07. Demonstrates the `[docs:foundation]` URL parameter added to `extract-ds-skill`. Same generation prompt, same DS, two different extracted skills — the only delta is whether the meta-skill received a foundation URL during Phase 1 discovery.

This file is the cultivation-loop artifact for the workshop wrap: a concrete instance of the extraction skill growing in response to a gap observed in its own generated output. Cite from Block 6 / synthesis as "this is how the skill self-improves."

## Setup

- **DS in scope:** GitHub Primer React (the workshop's reference DS).
- **Wrapper set:** `ActionMenu`, `Banner`, `DataTable`, `PageHeader`, `SelectPanel`, `ActionList` — the same six wrappers the workshop ships.
- **Generation prompt:** `prompts/issues.md` (the issues-page prompt the workshop attendees run after extraction).
- **Foundation URL (After only):** `https://primer.style/product/getting-started/foundations/color-usage/`.
- **Browser color scheme:** OS set to dark, so the app's `data-color-mode="dark"` path is exercised.

Both runs use the same prompt, the same wrapper set, the same model, and the same browser. The only variable is the URL passed to `extract-ds-skill` in Phase 1.

## Before — extract WITHOUT `--docs-url`

### Phase 1 (discovery summary, abbreviated)

```
Proposed skill: `ds` -> .claude/skills/ds/
Components found (6), proposing (6): ActionMenu, Banner, DataTable, PageHeader, SelectPanel, ActionList
Tokens detected: ~180 across color, space, type. Surfacing as [VERIFY] stubs.
Assets detected: 0 in package.

Sources used:
- ds/components/*.tsx [code, joint-read]
- primer.style/react [docs]
```

No `[docs:foundation]` line. Phase 2 runs the baseline typecheck + grep-resolves protocol only.

### Phase 2 proof point

```
- 18 props verified across 6 components
- 0 tokens grep-resolved (tokens stubbed as [VERIFY])
- 0 assets in scope
- 0 hallucinations
```

No foundation-rule line. The token extraction is the existing `[VERIFY]` stub posture.

### Generated `references/tokens.md`

Three `[VERIFY]` stubs (color / space / type) plus the existing "When to extract" prose. No `### token/<slug>` subsections. No wiring contract. The foundation knowledge the docs page contains never reaches the produced skill.

### Generation of `app/issues.tsx`

`prompts/issues.md` against the no-URL skill produces a page that imports the dark Primer stylesheet and sets `data-color-mode="dark"` on `<html>`, but `app/globals.css` only carries `@import "tailwindcss"`. Result: dark-theme tokens resolve correctly on Primer wrappers, but the browser default white surface sits underneath the root. The page renders dark text on a white surface; headers and table cells read as washed-out; the issues page reproduces the screen-surface bug from the 2026-06-06 post-mortem.

This is the gap. The agent cited every Primer wrapper's docs rule correctly — `PageHeader.ContextArea` slot composition, `DataTable` row-header convention, `SelectPanel` cancel-snapshot — and still emitted an unusable page because the screen-surface contract lives in prose foundations docs the meta-skill never read.

## After — extract WITH `--docs-url https://primer.style/product/getting-started/foundations/color-usage/`

### Phase 1 (discovery summary, abbreviated)

```
Proposed skill: `ds` -> .claude/skills/ds/
Components found (6), proposing (6): ActionMenu, Banner, DataTable, PageHeader, SelectPanel, ActionList
Tokens detected: ~180 across color, space, type. Surfacing as [VERIFY] stubs.
Foundation docs: https://primer.style/product/getting-started/foundations/color-usage/ [docs:foundation] (color usage + dark-mode wiring + semantic-foreground roles)
Assets detected: 0 in package.

Sources used:
- ds/components/*.tsx [code, joint-read]
- primer.style/react [docs]
- primer.style/product/getting-started/foundations/color-usage/ [docs:foundation]
```

One extra line in the proposed summary; one extra line in the sources block. Discovery budget holds.

### Phase 2 proof point

```
- 18 props verified across 6 components
- 4 tokens grep-resolved (the four cited foundation tokens: --bgColor-default,
  --bgColor-muted, --bgColor-emphasis, --fgColor-onEmphasis)
- 0 assets in scope
- 6 foundation-rules extracted (5 cited, 1 [VERIFY])
- 0 hallucinations
```

The `6 foundation-rules extracted` line is the new contract. The single `[VERIFY]` flags `--fgColor-onMuted` cited by the docs page but absent from `@primer/primitives@11.9.0` on disk — the meta-skill surfaces the gap instead of silently emitting the rule.

### Generated `references/tokens.md`

Six `### token/<slug>` subsections, each following the per-rule skeleton from `references/foundation-extraction.md`:

- `### token/screen-surface-dark-theme` — Shape 5 (wiring-contract). The root `:root { color-scheme: dark; }` + `html, body { background-color: var(--bgColor-default); color: var(--fgColor-default) }` block. This rule is what the post-mortem hand-fixed; the After run extracts it automatically.
- `### token/emphasis-foreground-pairing` — Shape 1 (token-pairing). `--bgColor-emphasis` requires `--fgColor-onEmphasis` for foreground content.
- `### token/dark-mode-wiring` — Shape 2 (mode-aware). `data-color-mode="dark"` attribute + the dark-theme CSS import. Names both halves as one rule.
- `### token/border-contrast-minimum` — Shape 3 (contrast-minimum). Borders use neutral step 7-8 against `--bgColor-muted`; step 5-6 (default-surface contract) disappears against muted surfaces.
- `### token/accent-foreground-surface` — Shape 4 (semantic-role). `--fgColor-accent` valid on `--bgColor-default` / `--bgColor-muted`; falls back to `--fgColor-onEmphasis` on emphasis surfaces.
- `### token/native-table-fallback` — Shape 6 (fallback-element). Native `<table>` without the DataTable wrapper: `border-collapse: collapse`, cell `border-color: var(--borderColor-default)`, `<th>` `background-color: var(--bgColor-muted)`.

Each subsection carries the one-sentence rule, the `When it bites:` line, the optional wiring code fence (Shapes 2 and 5), the `Bad | Good | Why` row, and the source citation `(https://primer.style/product/getting-started/foundations/color-usage/#<anchor>)`.

### Produced SKILL.md Setup section

The Shape 5 wiring rule (`token/screen-surface-dark-theme`) ALSO lands in the produced skill's `Setup` section under a `### Foundation wiring` subheading. The agent reading `SKILL.md` at load time sees the wiring contract before it touches any component file. The same rule lives in `references/tokens.md` for reflexive-audit citation — both writes are required (see `references/foundation-extraction.md`).

### Generation of `app/issues.tsx`

`prompts/issues.md` against the with-URL skill produces an `app/issues.tsx` that lifts the `Foundation wiring` block into `app/globals.css` and emits the same Primer wrapper composition as the Before run. Result: the dark theme paints all the way to the root surface. Headers, table cells, banners, and the action menu all render against `var(--bgColor-default)`; contrast holds; the page is usable on first try.

The agent's closing block cites at least one `token/*` slug — `token/screen-surface-dark-theme` — that was not present in the Before run's skill, confirming the foundation extraction reached the generation step.

## Diff at a glance

| | Before (no URL) | After (with URL) |
|---|---|---|
| Phase 1 sources block | 2 lines | 3 lines (adds `[docs:foundation]`) |
| Phase 2 proof point | 4 metric lines | 5 metric lines (adds `foundation-rules extracted`) |
| `references/tokens.md` content | 3 `[VERIFY]` family stubs | 3 stubs + 6 `### token/<slug>` subsections |
| Produced SKILL.md Setup | App-copied wiring only | App-copied wiring + `### Foundation wiring` block |
| `app/issues.tsx` first-render | Dark text on white surface (bug reproduces) | Dark surface end-to-end (bug fixed) |
| Hand-fix needed after generation | Yes — author writes `token/screen-surface-dark-theme` manually | No — the rule comes out of the extraction |

## Cultivation framing for the workshop wrap

This is the cultivation loop in one frame. The Before run is the gap; the After run is the response. The skill grew in response to a failure mode observed in its own generated output, and the growth is durable — it lands as a rule in `references/foundation-extraction.md` and a subsection shape in the generated `tokens.md`, available the next time anyone extracts from a Primer-shaped DS.

The same loop is how Vercel's product-copywriting skill matures against PR review comments, and how the way we do things at Vercel evolves into installable knowledge. The mechanism transfers: observe gap → add rule → next regenerate inherits the rule.

Cite this file from Block 6 of the workshop as concrete evidence of the third frame (Cultivation) operating in the meta-skill itself, not just in the produced skills.

## Reproducing the demo

End-to-end smoke run, all paths from `/Users/diegodemiguel/Development/Work/ShipWorkshop/ds-skill-extraction-workshop/`:

1. **Baseline (no URL)** — invoke `extract-ds-skill` on `ds/components/*` without a URL. Confirm Phase 1 omits the foundation line, Phase 2 omits the `foundation-rules extracted` line, the generated `references/tokens.md` matches the existing `[VERIFY]`-stub shape, and `scripts/check-skill-docs.sh` exits 0 with `FOUNDATION_RULES=0`.

2. **With URL** — invoke `extract-ds-skill` on the same set with `https://primer.style/product/getting-started/foundations/color-usage/`. Confirm Phase 1 carries one `[docs:foundation]` line, Phase 2 reports `F > 0` with a cited / `[VERIFY]` split, the generated `references/tokens.md` carries at least the six `### token/<slug>` subsections above, the produced `SKILL.md` Setup has a `### Foundation wiring` block, and `scripts/check-skill-docs.sh` exits 0 with `FOUNDATION_RULES > 0`.

3. **Generation comparison** — run `prompts/issues.md` against both generated skills (use two fresh worktrees to avoid cross-contamination). Confirm the no-URL skill regenerates the dark-text-on-white bug and the with-URL skill produces a readable dark-mode page on first try.

4. **Regression** — run `extract-ds-skill` on any other DS without providing a URL. Confirm no behavior change vs the pre-2026-06-07 baseline; the opt-in parameter must not perturb the no-URL path.
