# Harvest log — merge-readiness-panel (dryrun-16, iteration 1)

Date: 2026-06-12
Prompt: `prompts/merge-readiness-panel.md`
Skill: `.claude/skills/primer-react/` (regenerated WS2 Run #2, merged in commit b5a82ce)
Files built:
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `components/showcase/merge-readiness-panel.tsx`

## `@primer/react` imports used

| Import | Slate? | Where |
|---|---|---|
| `BaseStyles` | ❌ not in slate | `app/layout.tsx` (verbatim from skill Setup) |
| `ThemeProvider` | ❌ not in slate | `app/layout.tsx` (verbatim from skill Setup) |
| `BranchName` | ✅ | `app/page.tsx`, panel (Delete-branch caption) |
| `Button` | ✅ | panel (Details, Resolve conflicts, CLI instructions, Cancel, Merge) |
| `Checkbox` | ✅ | panel (Delete branch after merge) |
| `CounterLabel` | ✅ | panel (approved-of-N counter) |
| `Flash` | ✅ | panel (Zone 3 blocker, variant="danger") |
| `FormControl` | ✅ | panel (merge method, commit headline, description, delete-branch) |
| `Heading` | ✅ | `app/page.tsx` (PR title), panel zone headings |
| `IconButton` | ✅ | panel (Checks options kebab) |
| `Label` | ✅ | panel (Reviews "2 outstanding" attention metadata) |
| `Select` | ✅ | panel (Merge method) |
| `Stack` | ✅ | layout, both files |
| `StateLabel` | ✅ | `app/page.tsx` (`status="pullOpened"`) |
| `Text` | ✅ | both files |
| `TextInput` | ✅ | panel (Commit headline) |
| `Textarea` | ✅ | panel (Extended description) |

## `@primer/octicons-react` imports used

All octicons resolve against `node_modules/@primer/octicons-react@19.28.0/dist/icons.d.ts`:

`AlertFillIcon`, `CheckCircleFillIcon`, `ChevronRightIcon`, `CommentIcon`, `DotFillIcon`, `GitMergeIcon`, `KebabHorizontalIcon`, `SkipIcon`, `StopIcon`, `XCircleFillIcon`.

(The skill's slate covers component exports from `@primer/react`; octicons aren't in scope of the slate flag.)

## Flagged for slate consideration

- **`BaseStyles`** — only used inside `app/layout.tsx` (skill Setup wiring). Probably correct as Setup-only — never composed by a screen author. **Recommendation: keep out of slate.**
- **`ThemeProvider`** — same as above. Setup-only. **Recommendation: keep out of slate.**

No other off-slate `@primer/react` imports were needed for this composition. The 15-component slate covered every page-level decision (lifecycle pill, branch chip, banner, form, layout, count, metadata).

## Surprises during build (worth feeding back into the skill)

1. **Octicon `style` is not in `IconProps`.** Tried `<XCircleFillIcon style={{ color: 'var(--fgColor-danger)' }} />` to color the glyph — TS rejects it (`IconProps` is `{ 'aria-label'?, className?, fill?, size?, verticalAlign? }`). Worked around with a small `<IconSwatch>` wrapper that puts `color` on a parent `<span>` so the SVG inherits via `currentColor`. The skill's component MDs don't mention this — it's an octicon contract, not a primer-react one, but new generators will hit it. Consider a note in `references/foundations/octicons.md` or a recipe under `references/design-craft.md` for "colored status glyphs".
2. **`<Flash>` is a visual container only**, no `role` by default — fine here because the blocker section has a visible "Merging is unavailable" caption tied to the merge button via `aria-describedby`. Worth keeping a recipe for "Flash that announces" (wrap in `role="alert"` / `aria-live`) somewhere visible — the current skill notes this in `flash.md` only.
3. **`FormControl layout="horizontal"`** for the Checkbox row worked as documented — `<Checkbox />` first, then `<FormControl.Label>`, then `<FormControl.Caption>` with embedded `<BranchName as="span">`. The order-sensitive child slot wasn't obvious from the d.ts alone; the skill's example covered it.
4. **`Button` has no `secondary` variant** — used `variant="default"` for the "Resolve conflicts" action and `variant="invisible"` for CLI / Cancel, consistent with the skill's button.md rules.
5. **No `<PageHeader>` in the slate** — built the PR header by hand from `Stack + Heading + Text + StateLabel + BranchName`. That's the right answer for a 15-component slate, but Primer ships `<PageHeader>` upstream; worth a note that header composition is "Stack out of slate primitives" rather than a missing component.
6. **`Button variant="primary"` + `disabled` does not visually read as disabled in dark mode.** Screenshot review of the produced UI shows the disabled "Merge pull request" button rendered as a fully-saturated success-green surface — the HTML `disabled` attribute IS applied (keyboard/SR contract holds — focus skips, SR announces unavailable), but the surface does not de-emphasize. The skill's `button.md` covers the `disabled` vs `inactive` a11y trade-off but does not warn that `primary + disabled` keeps the active palette. Candidate skill change: **add a composition rule** to `button.md` ("when disabled state must be visually obvious, prefer `variant="default" disabled` over `variant="primary" disabled`") OR an anti-pattern entry under `references/anti-patterns.md` for `button/primary-disabled-reads-active`. Also worth verifying upstream — this may be a Primer styling bug, not a usage error.
7. **Primer `<Select>` may not honor `defaultValue`.** Passed `defaultValue="squash"` on the merge-method select; rendered output shows "Rebase and merge" selected. Caption ("All commits combined into one with the headline below") now contradicts the visible value. The skill's `select.md` example uses controlled `value` + `onChange`, but doesn't call out that `defaultValue` may not propagate to the underlying native `<select>`. Candidate skill change: add a "controlled-only initial value" note (or a `<Select.Option selected>` recipe) to `select.md`'s Best Practices.

## Contract verification

| Contract bullet | How it's satisfied |
|---|---|
| Blocker makes merge **genuinely** unavailable | **PARTIAL.** `<Button disabled={blockerPresent} aria-describedby="merge-blocker-reason">` — the HTML `disabled` attribute IS applied: keyboard tab order skips the button, and SR announces it as unavailable (chose `disabled` over `inactive` deliberately for this reason). **BUT** screenshot review shows the disabled surface still rendered as a fully-saturated success-green primary button — the "not just look unavailable" half of the contract clause is NOT cleanly met. See Surprise #6 — likely a `primary + disabled` styling gap in Primer (or in the skill's guidance). |
| Light + dark from system preference | `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` + both `light.css` AND `dark.css` imported in `globals.css`; page surface paints via `body { background-color: var(--bgColor-default) }` + `<BaseStyles style={{backgroundColor: 'var(--bgColor-default)'}}>` |
| No hand-picked colors / px | Status colors come from `--fgColor-success / -danger / -attention / -muted`; spacing comes from `<Stack gap>` named scale; radii from `--borderRadius-large / -medium`; container max-width is the only literal (1012) |
| Icon-only controls have accessible names | `<IconButton aria-label="Check options">`; status glyphs use `<IconSwatch role="img" aria-label="…">`; decorative octicons (`AlertFillIcon`, `GitMergeIcon`, `ChevronRightIcon`, `StopIcon`) use `aria-hidden` |
| Every input has a real label | `FormControl.Label` on merge method / commit headline / description / delete-branch — no bare `<label>` |
| Invented data | `@lena-petrov`, `@amir-haddad`, `@sora-mendez`, `@jules-ito`, `@rin-andersen`; repo `platform/token-manifest` → `main`; checks `stratus-ci`, `argo-snapshot`, `compliance-bot`; no `octocat` / `mona` / `hubot` |
| Static composition, no timers / API / new deps | No `useEffect`, no `useState`, no `setTimeout`, no fetch; only existing `@primer/*` deps |
| Dev server checked | `pnpm dev` → ready in 268ms; `GET /` → 200 in 1.9s; primitives CSS contains `--bgColor-default`, `data-color-mode`, and `prefers-color-scheme` selectors → both modes resolved. Visual review of dark-mode screenshot performed: all four zones land, semantic colors flip correctly, no unpainted shell, no hydration warnings in `dev.log`. |
| Working tree dirty | Files written but NOT committed or staged — verified via the user's working rules |

## Skill-feedback findings (summary)

Three actionable findings for the next skill regeneration pass, in priority order:

1. **Octicons reject `style`** (Surprise #1) — `IconProps = { aria-label?, className?, fill?, size?, verticalAlign? }`. The natural attempt `<XCircleFillIcon style={{ color: 'var(--fgColor-danger)' }} />` fails typecheck. Required workaround: `<span style={{ color }}><Icon /></span>` so the SVG inherits via `currentColor`. **Add to** `references/foundations/octicons.md` as a "colored status glyph" recipe.
2. **`Button variant="primary" + disabled` does not visually de-emphasize** (Surprise #6) — confirmed by dark-mode screenshot. Partially breaks the merge-readiness-panel "genuinely unavailable" contract. **Add to** `references/components/button.md` Best Practices or `references/anti-patterns.md` (`button/primary-disabled-reads-active`).
3. **`Select` does not honor `defaultValue`** (Surprise #7) — visible select value did not match the passed `defaultValue`. **Add to** `references/components/select.md` Best Practices ("prefer controlled `value` + `onChange`; `defaultValue` may not propagate").

## Snapshot

Copied verbatim into `dry-runs/2026-06-12-wow-i1/merge-readiness-panel/`:
- `app-page.tsx`
- `merge-readiness-panel.tsx`
