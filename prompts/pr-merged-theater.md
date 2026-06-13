---
role: user
phase: 2
audience: stage
---

This UI must be built with Primer React (`@primer/react`).

This is the **encore** of the merged-PR theater: the same satisfying flip from waiting to **Merged**, but staged on a panel as dense and alive as a real GitHub pull request — labels, counts, an editable merge box, and motion you can feel.

Edit `app/page.tsx` and put the composition in `components/showcase/pr-merged-theater.tsx` (`"use client"` on both).

## The experience

The screen shows a pull request the way GitHub shows one on a busy Tuesday: a title and number, the branches involved, and a state capsule that says **Open**. Directly beneath the title, the metadata a maintainer actually scans — a couple of topic labels and a row of running counts (commits, checks, files changed). Below that, the merge box: reviews, a wall of CI checks, and the merge controls.

When the page loads, the checks are still running. Over roughly six seconds they resolve one by one — most pass, the last ones go green — and the room should *watch the dominoes fall*: each check lands with a small, visible beat, a progress indicator advances, and the live counts tick up as they go. The moment everything is green, the panel rewards the wait: a quiet "ready" cue appears, and the merge box opens up into its full, editable form. While checks are still running, merging is genuinely unavailable — a keyboard user cannot trigger it, and a screen reader does not announce it as actionable.

The full merge box is the centerpiece. It should feel like the real thing: a way to choose the **merge method** (a merge commit, squash, or rebase), an editable **commit headline** and **extended description**, and the option to **delete the branch after merge**. The primary action reflects the chosen method.

Then the user clicks merge — and the page does what GitHub does. The capsule flips from green **Open** to purple **Merged** with a beat of motion. The merge box collapses into a quiet confirmation, and what happens next honors the branch choice: if the branch was set to delete, it reports the branch as removed and offers to restore it; otherwise it offers to delete it.

Make the whole sequence feel inevitable — dominoes, not fireworks. The drama comes from state, color, density, and timing, not from invented effects. No confetti. GitHub's own restraint is the ceiling; richness is how you push past the first version, not noise.

## Reach for the whole system

The point of this encore is breadth: a real merge box leans on far more of the design system than a status line does. Use the system's metadata badges for the topic labels, its count badges for the running totals, its lifecycle capsule for Open/Merged, its banner for the "ready" cue, its picker for the merge method, and its form controls — single-line field, multi-line field, checkbox, all properly labelled — for the editable commit box. Let the design system tell you which component fits each job; that is what it is for. Do not hand-roll a control the system already ships.

## The contract

- Simulate the check progression client-side with timers. No APIs, no new dependencies.
- Motion is part of the wow, but it must be tasteful and accessible: honor `prefers-reduced-motion`, and never animate something into a state a screen reader would misreport.
- Light and dark mode must both render correctly from the system preference — including the page background, not just the card.
- No hand-picked colors, pixel values, durations, or easings. Success, failure, attention, the merged state, and every transition come from the design system's semantic and motion options.
- Every icon-only control has an accessible name. Every input has a real label. The merge-method picker is labelled; the commit fields are labelled; the delete-branch toggle is labelled.
- Invented data only: fictional usernames, repos, branches, labels, and check names. Do not use GitHub's mascot names.

## Working rules

- Follow the rules of the extracted design-system skill installed under `.claude/skills/` (when present).
- Run the dev server and leave it running for review; a human watches the full sequence — checks resolving, the box opening, the flip to merged — in both color modes. Build the UI; do not drive the browser, write test scripts, or reach for Playwright to check it yourself. When you finish, give a short note of what you built and flag what still needs human eyes: the motion, the flip, and both color modes.
- Do not commit or stage anything — leave the working tree dirty for review.
