---
role: user
phase: 2
audience: stage
---

This UI must be built with Primer React (`@primer/react`).

This is the **encore** of the merged-PR theater: the same satisfying flip from waiting to **Merged**, but staged on a panel as dense and alive as a real GitHub pull request — labels, counts, an editable merge box, motion you can feel, and a color mode the reader can flip on demand.

Edit `app/page.tsx` and put the composition in `components/showcase/pr-merged-theater.tsx` (`"use client"` on both).

## The experience

The screen shows a pull request the way GitHub shows one on a busy Tuesday: a title and number, the branches involved, and a state capsule that says **Open**. Directly beneath the title, the metadata a maintainer actually scans — a couple of topic labels and a row of running counts (commits, checks, files changed). Below that, the merge box: reviews, a wall of CI checks, and the merge controls.

When the page loads, the checks are still running. Over roughly six seconds they resolve one by one — most pass, the last ones go green — and the room should *watch the dominoes fall*: each check lands with a small, visible beat, a progress indicator advances, and the live counts tick up as they go. The moment everything is green, the panel rewards the wait: a quiet "ready" cue appears, and the merge box opens up into its full, editable form. While checks are still running, merging is genuinely unavailable — a keyboard user cannot trigger it, and a screen reader does not announce it as actionable.

The full merge box is the centerpiece. It should feel like the real thing: a way to choose the **merge method** (a merge commit, squash, or rebase), an editable **commit headline** and **extended description**, and the option to **delete the branch after merge**. The primary action reflects the chosen method.

Then the user clicks merge — and the page does what GitHub does. The capsule flips from green **Open** to purple **Merged** with a beat of motion. The merge box collapses into a quiet confirmation, and what happens next honors the branch choice: if the branch was set to delete, it reports the branch as removed and offers to restore it; otherwise it offers to delete it.

Make the whole sequence feel inevitable — dominoes, not fireworks. The drama comes from state, color, density, and timing, not from invented effects. No confetti. GitHub's own restraint is the ceiling; richness is how you push past the first version, not noise.

The panel lives on a page that opens in whichever color mode the reader's system prefers, with a small, clearly-labelled control that flips between light and dark on demand. Flipping it recolors the entire surface — page background included, not just the card — and the whole panel (capsule, labels, the wall of checks, the merge box) stays correct and legible in both modes.

## Reach for the whole system

The point of this encore is breadth: a real merge box leans on far more of the design system than a status line does. Use the system's metadata badges for the topic labels, its count badges for the running totals, its lifecycle capsule for Open/Merged, its banner for the "ready" cue, its picker for the merge method, its form controls — single-line field, multi-line field, checkbox, all properly labelled — for the editable commit box, and its own control for switching color mode. Let the design system tell you which component fits each job; that is what it is for. Do not hand-roll a control the system already ships.

## The contract

- Simulate the check progression client-side with timers. No APIs, no new dependencies.
- Motion is part of the wow, but it must be tasteful and accessible: honor `prefers-reduced-motion`, and never animate something into a state a screen reader would misreport.
- The page opens in the reader's system color mode AND offers an in-UI toggle that overrides it. Both modes must render correctly — including the page background, not just the card.
- The toggle drives the design system's own color-mode mechanism, not a hand-rolled `class` or CSS swap. Every surface — page background, panel, and all semantic colors — recolors through the system's tokens.
- The color-mode control comes from the design system and carries a real accessible name, like every other icon-only control here.
- The toggle is automation-ready: it exposes a stable test handle (`data-testid`) AND a real accessible name, so an automated test can find and operate it deterministically. The active color mode is observable in the DOM — the resolved mode on the document root reflects the current choice — so a headless test can assert the flip instead of relying on a screenshot. (A hand-rolled CSS swap that never updates the system's resolved mode fails this.)
- No hand-picked colors, pixel values, durations, or easings. Success, failure, attention, the merged state, both color modes, and every transition come from the design system's semantic and motion options.
- Every icon-only control has an accessible name. Every input has a real label. The merge-method picker is labelled; the commit fields are labelled; the delete-branch toggle is labelled; the color-mode toggle is labelled.
- Invented data only: fictional usernames, repos, branches, labels, and check names. Do not use GitHub's mascot names.

## Working rules

- Follow the rules of the extracted design-system skill installed under `.claude/skills/` (when present).
- Run the dev server and watch the full sequence in both color modes — checks resolving, the box opening, the flip to merged. Then exercise the color-mode toggle in both directions and confirm the page background (not just the card) recolors each time and that the resolved mode on the document root changes with it. Fix what you see before you finish. Then report what you verified, how, and your confidence in each claim — keeping what you confirmed through the DOM, interactions, and the console separate from visual impressions, which still need a human to confirm.
- Do not commit or stage anything — leave the working tree dirty for review.
