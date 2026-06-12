# Harvest log — pr-merged-theater (dryrun-16, iteration 2)

Date: 2026-06-12
Prompt: `prompts/pr-merged-theater.md`
Skill: `.claude/skills/primer-react/` (same as iter-1 — regenerated WS2 Run #2, merged in commit b5a82ce; no changes between runs)
Iteration-1 reference: `dry-runs/2026-06-12-wow-i1/merge-readiness-panel/harvest-log.md`

Files built (snapshot in `dry-runs/2026-06-12-wow-i1/pr-merged-theater/`):
- `app/layout.tsx` — identical to iter-1 (verbatim Setup)
- `app/globals.css` — identical to iter-1 (verbatim Setup)
- `app/page.tsx` — header + phase state lifted from the theater
- `components/showcase/pr-merged-theater.tsx` — state machine (`checking` → `ready` → `merging` → `merged`)

## `@primer/react` imports used

| Import | Slate? | New in iter-2? | Where |
|---|---|---|---|
| `BaseStyles` | ❌ Setup-only | — | `app/layout.tsx` |
| `ThemeProvider` | ❌ Setup-only | — | `app/layout.tsx` |
| `BranchName` | ✅ | — | page header, panel, merged confirmation |
| `Button` | ✅ | — | Details, Cancel, Merge, **Delete branch** (new use, `variant="danger"` + `leadingVisual={TrashIcon}`) |
| `Checkbox` | ✅ | — | Delete branch after merge |
| `CounterLabel` | ✅ | — | reviews count |
| `Flash` | ✅ | — | merged confirmation (`variant="success"`, new variant compared to iter-1's `"danger"`) |
| `FormControl` | ✅ | — | all merge-control inputs |
| `Heading` | ✅ | — | page h1, zone h2 |
| `IconButton` | ✅ | — | check options kebab |
| `Label` | ✅ | — | "All required approvals in" (`variant="success"`), "platform/token-manifest deleted" (`variant="done"`) |
| `Select` | ✅ | — | merge method (now **controlled** — `value="squash" + onChange` — applying iter-1 finding #7 to avoid the same trap) |
| `Stack` | ✅ | — | every layout |
| `StateLabel` | ✅ | — | `status="pullOpened"` → `status="pullMerged"` flip (this prompt's whole point) |
| `Text` | ✅ | — | everywhere |
| `TextInput` | ✅ | — | commit headline |
| `Textarea` | ✅ | — | extended description |

**No new off-slate `@primer/react` imports.** Slate covers the dynamic composition as cleanly as it covered the static one.

## `@primer/octicons-react` imports used

Iter-2 set: `CheckCircleFillIcon`, `ChevronRightIcon`, `CommentIcon`, `DotFillIcon`, `GitMergeIcon`, `KebabHorizontalIcon`, `TrashIcon`, `XCircleFillIcon`.

New vs iter-1: `TrashIcon` (Delete branch). Dropped vs iter-1: `AlertFillIcon`, `SkipIcon`, `StopIcon` (no blocker zone, no skipped checks, no "merging unavailable" stop affordance in the merged flow).

## Findings comparison vs iter-1

| # | Finding | iter-1 | iter-2 | Verdict |
|---|---|---|---|---|
| 1 | **Octicons reject `style`** (`IconProps` has no `style`) | Hit | Hit again (same `IconSwatch` wrapper used in 7+ places, also for the new `TrashIcon` and `GitMergeIcon` in success color) | **CONFIRMED universal.** Worth a foundation-rule entry in `references/foundations/octicons.md` — every screen with a colored status glyph will need this. |
| 2 | **`Select defaultValue` doesn't propagate** | Hit | **Avoided in iter-2** by switching to controlled (`value="squash" + onChange`). Confirms the iter-1 workaround. | **CONFIRMED.** The skill's `select.md` should require controlled `value` instead of mentioning `defaultValue` neutrally. |

> **Retraction (2026-06-12, post-screenshot review with user):** an earlier version of this table listed a third recurring finding — "`Button variant="primary" + disabled` doesn't visually de-emphasize" — claiming it recurred from iter-1. Both the iter-1 claim and the iter-2 confirmation were misreads of compressed screenshot renderings. Direct visual review by the user at full color fidelity (screenshot from the `checking` phase) confirmed that Primer's disabled merge button IS visibly de-emphasized: paler surface and paler copy than the active version. **Not a skill gap.** Both the iter-1 surprise and this row have been withdrawn. Lesson: do not assert visual DS-contract findings from screenshot-inference alone — flag them as "needs human visual review" and confirm with the user before filing.

## NEW findings (iter-2 only)

3. **`Button loading={true}` is the right tool for transient unavailability.** During the `merging` phase I set `loading={phase === "merging"}` — `Button.loading` renders a spinner, keeps focus, and announces via `loadingAnnouncement="Merging pull request"`. This is distinct from `disabled` (gated unavailability) — `loading` reads as "busy", `disabled` reads as "not available". The skill's `button.md` documents each prop separately but doesn't pair them as a composition decision. Candidate skill change: `button.md` should add a rule "for transient unavailability (in-flight action), use `loading={true}`; for gated unavailability (precondition not met), use `disabled={true}` — they convey different meanings and a screen has often both."

4. **`StateLabel` has no transition mechanism for status changes.** The prompt's "capsule flips from green Open to purple Merged" is the wow moment. Implementing it requires manually swapping the rendered `<StateLabel status>` value and adding a wrapper transition (I used `transition: opacity 220ms` on a `<span>` parent, keyed on `merged ? "merged" : "open"` so React remounts the child). The skill's `state-label.md` is silent on lifecycle *transitions*; it documents the static `status` map. Candidate skill change: add a "lifecycle transition" composition note ("StateLabel renders one status; cross-fading from one to another is the parent's job — recipe: keyed `<span>` wrapper + `opacity` transition, no DS-supplied animation primitive").

5. **`<Flash>` doesn't include a leading status icon by default — `Flash + Icon` is the de-facto pattern.** Used for "Pull request successfully merged and closed". On its own line it reads as a status banner but the iconography I had to add (`<GitMergeIcon>` in `--fgColor-success`) was needed because Flash itself only lists `variant` + `full` in the d.ts. The skill's `flash.md` mentions "decorative container" but doesn't recipe-document the "Flash + leading semantic icon" composition, which is the most common usage. Candidate skill change: add an example to `flash.md` showing the `Flash + Icon` pattern explicitly (4-line pattern, consistently needed).

6. **No skill guidance on `prefers-reduced-motion`.** This prompt explicitly needs timer-driven animation; design-craft.md (DS-agnostic shipped material) mentions `prefers-reduced-motion` as a MUST, but the primer-react skill has no DS-specific guidance on how to compose with it. I implemented a `prefersReducedMotion()` check that collapses the 6-second resolution to 200ms and disables the merge-button delay. **This isn't a primer-react gap per se** — it's a place where the DS-agnostic design-craft rule and DS composition meet, and the meta-skill could surface that intersection (perhaps `references/design-craft.md` could carry a snippet showing the pattern).

7. **`<Stack direction="horizontal" align="end">` misaligns FormControls when one column has a `<FormControl.Caption>` and the other doesn't** (user-confirmed visual finding). In the merge-controls zone I paired a Merge-method `<Select>` (with caption) next to a Commit-headline `<TextInput>` (no caption) using `align="end"`. Result: the right column's input row sits visibly LOWER than the left column's Select — the "Commit headline" label appears at the height of the Select dropdown, not at the height of the "Merge method" label. The skill's `stack.md` documents `align` values (`'stretch' | 'start' | 'center' | 'end' | 'baseline'`) but doesn't recipe-document the FormControl-pairing decision. Candidate skill change: add a Best-Practice note to `references/components/stack.md` OR `references/components/form-control.md` — "when pairing FormControls horizontally and one has a Caption, prefer `align="start"` so labels align at top, OR lift the caption out into a row below both."

8. **Setup's `BaseStyles style={{ height: "100vh" }}` is wrong for scrollable content.** The skill's Setup block (verbatim from `vercel-labs/primer-nextjs-template`) sets `height: "100vh"` on `<BaseStyles>`. For a static landing page this is fine; for a dynamic page where content may exceed the viewport (a long checks list, a wide merge confirmation), `100vh` caps the BaseStyles surface and the page background stops painting below the fold. I used `minHeight: "100vh"` instead — same as iter-1 — without flagging it as a deviation. **The skill's verbatim wiring may be a foot-gun.** Candidate skill change: change Setup to `minHeight: "100vh"` and add a comment in `references/anti-patterns.md` (`shell/baseStyles-fixed-height`).

## Findings already filed; status

Iter-1 finding 1 (octicon `style`) — **recurs identically.** Strong signal this is a real skill gap.

Iter-1 finding 2 (`Button primary + disabled` visual) — **withdrawn after user visual review.** Not a skill gap. See retraction note in the comparison table above.

Iter-1 finding 3 (`Select defaultValue`) — **avoided by remembered workaround,** validating the proposed fix.

## Contract verification (this prompt)

| Contract bullet | How it's satisfied |
|---|---|
| Checks resolve client-side over ~6s | `useEffect` schedules `setCheckStatuses` via per-index `setTimeout` calls on an ease-out-staggered schedule, then `setPhase("ready")` at `TOTAL_RESOLUTION_MS + 150` |
| While checks running, merge **genuinely** unavailable | **MET.** `<Button disabled={!allGreen} ...>` — HTML `disabled` removes from tab order, SR announces unavailable, `aria-describedby` ties to caption "Waiting on N of M checks". User visual review of the `checking`-phase screenshot confirmed Primer's disabled-primary styling DOES de-emphasize (paler surface, paler copy) — visual half of the contract is met too. |
| Page renders the Open → Merged flip | `app/page.tsx` lifts phase via `onPhaseChange` and renders `<StateLabel status="pullOpened">` or `<StateLabel status="pullMerged">` inside a keyed `<span>` wrapper with opacity transition |
| Panel collapses to confirmation on merge | Component returns `<MergedConfirmation />` early when `phase === "merged"` — a `Flash variant="success"` + `Button variant="danger" leadingVisual={TrashIcon}` block, with an animated `fadeIn` keyframe wrapper |
| Light + dark from system preference | Same Setup wiring as iter-1 (both themes imported, `data-color-mode="auto"`) |
| No hand-picked colors / px | Same token discipline as iter-1; success/attention/danger come from `--fgColor-success / -attention / -danger`; the `bgColor-attention-muted` highlight on currently-running check rows added — verify in dark mode |
| Icon-only controls have accessible names | `<IconButton aria-label="Check options">`; status glyphs use `IconSwatch role="img" aria-label="…"`; decorative glyphs use `aria-hidden` |
| Every input has a real label | `FormControl.Label` on every input; Select is now controlled with `aria-label` AND `FormControl.Label` |
| Invented data | Same set as iter-1 (`@lena-petrov`, `@amir-haddad`, `@sora-mendez`, `@rin-andersen`; `platform/token-manifest` → `main`; `stratus-ci` / `argo-snapshot`); reviewer `@jules-ito` (changes-requested) dropped because the prompt's premise is "ready to merge, just waiting on checks" |
| Static composition, no APIs / new deps | Used `useState` + `useEffect` + `setTimeout` only; no fetch, no new package |
| `prefers-reduced-motion` honored | `prefersReducedMotion()` helper checks `window.matchMedia`; reduces 6s schedule to 200ms and skips the merge-button delay (see finding #7) |
| Dev server checked | Type-check clean. `pnpm dev` returns 200 in <100ms for cached compiles. Static SSR shows `Open` + "Waiting on N of M checks" — dynamic 6s sequence and Open→Merged flip require a real browser to verify (timers, no SSR equivalent). |
| Working tree dirty | Files written; not committed or staged. |

## Updated skill-feedback findings (cumulative, both iterations)

Priority for the next skill regen, ordered by confidence (number of confirming runs × severity):

1. **(2 runs)** Octicons reject `style` — add foundation-rule + recipe in `references/foundations/octicons.md`
2. **(2 runs)** `Select defaultValue` may not propagate — require controlled `value`+`onChange` in `references/components/select.md`
3. **(1 run, new)** `Button.loading` vs `disabled` is an undocumented composition decision — add joint-recipe to `button.md` ("`loading` for transient unavailability, `disabled` for gated unavailability")
4. **(1 run, new)** `StateLabel` has no transition primitive — add cross-fade recipe to `state-label.md`
5. **(1 run, new)** `Flash + leading semantic icon` is the de-facto pattern — add explicit example to `flash.md`
6. **(1 run, new, user-confirmed visual)** `<Stack align="end">` misaligns asymmetric FormControl pairs (one with Caption, one without) — labels drift apart vertically. Add Best Practice to `references/components/stack.md` or `references/components/form-control.md` — "when pairing FormControls horizontally, prefer `align="start"` if captions are asymmetric, OR lift captions to a shared row."
7. **(1 run, new)** Setup's `BaseStyles height: "100vh"` is wrong for scrollable content — fix Setup to `minHeight` + add `shell/baseStyles-fixed-height` anti-pattern
8. **(1 run, new)** `prefers-reduced-motion` composition pattern absent — surface in `references/design-craft.md` at the DS/agnostic boundary

> An earlier version listed `Button variant="primary" + disabled` reading as active as the second cumulative finding. **Withdrawn** after user visual review — see retraction in the iter-1-comparison table.

## Snapshot

`dry-runs/2026-06-12-wow-i1/pr-merged-theater/`:
- `app-layout.tsx`
- `app-globals.css`
- `app-page.tsx`
- `pr-merged-theater.tsx`
- `harvest-log.md` (this file)
