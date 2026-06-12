# Harvest log — pr-merged-theater (dryrun-16, wow-convergence iteration 2)

Date: 2026-06-12
Prompt: `prompts/pr-merged-theater.md`
Skill: `.claude/skills/primer-react/` — **updated**: post cite-verification (PR #52) + citation repair (PR #53). First PRD build against the repaired/gate-green skill.
Baseline: `dry-runs/2026-06-12-wow-i1/pr-merged-theater/` (built against the pre-update skill).

## Checklist results
- **tsc --noEmit: PASS (exit 0)** — every component/prop/variant valid against real `@primer/react` types.
- **Slate purity: PASS** — 7 `@primer/react` components, all in-slate, zero off-slate.
- **Octicons: PASS** — 6/6 real exports (CheckCircleIcon, CheckIcon, DotFillIcon, GitMergeIcon, KebabHorizontalIcon, TrashIcon).
- **`[VERIFY]` markers: 0.**
- **Hardcoded colors: 0** (the one `#4821` is the PR number in a `<Text>`, not a color).
- **Tokens: throughout** — fgColor-muted/success/done/attention/default, bgColor-default, base-size-*, borderColor-*, borderRadius-large.
- **Shell parity: PASS** — layout.tsx wires ThemeProvider + BaseStyles + `data-color-mode="auto"` + `suppressHydrationWarning`; globals.css imports BOTH light.css + dark.css and paints `var(--bgColor-default)`.

## `@primer/react` imports
| Import | Slate? | In iter-1 build? |
|---|---|---|
| BranchName | ✅ | ✅ |
| Button | ✅ | ✅ |
| Heading | ✅ | ✅ |
| IconButton | ✅ | ✅ |
| Stack | ✅ | ✅ |
| StateLabel | ✅ | ✅ |
| Text | ✅ | ✅ |
**Dropped vs iter-1:** CounterLabel, Label, FormControl, Select, TextInput, Textarea. No off-slate imports.

## Octicons
CheckCircleIcon, CheckIcon, DotFillIcon, GitMergeIcon, KebabHorizontalIcon, TrashIcon — all colored via a parent wrapper (no `style` prop on the icon).

## Convergence vs iter-1 (the point of the loop)
1. **Quality bar held** under the repaired skill — type-valid, slate-pure, fully tokenized, shell-parity clean. No regression introduced by the cite-verification + repair work.
2. **iter-1's recurring traps avoided:**
   - *Octicon `style` rejection* (hit in BOTH iter-1 runs) — iter-2 colors glyphs via a wrapper, never passing `style` to the icon. Trap sidestepped.
   - *`Stack align="end"` misaligns asymmetric FormControl pairs* (user-confirmed iter-1 finding) — N/A: iter-2 uses no FormControls.
3. **Much leaner:** 412 lines vs iter-1's 694. iter-2 reads the prompt as the *checks-running → merged theater* and drops iter-1's merge-controls form zone (Select merge-method + commit-headline TextInput + FormControls).
4. **Thin page.tsx:** all logic lives in the component; `app/page.tsx` is a 4-line wrapper (iter-1 lifted phase state into the page via `onPhaseChange`).

## Open questions / for human review
- **Scope:** is dropping the merge-controls form (Select/TextInput/FormControl) a cleaner read of the prompt, or a missing section? Needs a prompt-vs-output judgement.
- **Light-mode parity:** only dark-mode screenshots were captured this run. Wiring is correct (both themes imported, `data-color-mode="auto"`), but light render was not visually verified.
- **Visual contract details** (contrast, disabled-button palette, saturation): on-brand by eye, but not asserted from screenshots alone — confirm by human review.
