---
role: user
phase: 2
audience: stage
---

This UI must be built with Primer React (`@primer/react`).

Recreate the most satisfying moment on GitHub: the seconds in which a pull request goes from waiting to **Merged**.

Edit `app/page.tsx` and put the composition in `components/showcase/pr-merged-theater.tsx` (`"use client"` on both).

## The experience

The screen shows a pull request: title, number, the branches involved, and a state capsule that says **Open**. Below it, the merge panel: reviews, a wall of CI checks, and the merge controls.

When the page loads, the checks are still running. Over roughly six seconds they resolve one by one — most pass, the last ones go green — and the moment everything is green, merging becomes possible. While checks are running, merging is genuinely unavailable: a keyboard user cannot trigger it, and a screen reader does not announce it as actionable.

Then the user clicks merge — and the page does what GitHub does. The capsule flips from green **Open** to purple **Merged**. The merge panel collapses into a quiet confirmation ("Pull request successfully merged and closed"), and the option to delete the branch appears.

Make the whole sequence feel inevitable, like watching dominoes fall. No confetti, no invented effects — GitHub's own restraint is the style. The drama comes from state, color, and timing.

You decide layout, density, copy, and which component fits each job. That is what the design system is for.

## The contract

- Simulate the check progression client-side with timers. No APIs, no new dependencies.
- Light and dark mode must both render correctly from the system preference — including the page background, not just the card.
- No hand-picked colors or pixel values. Success, failure, attention, and the merged state come from the design system's semantic options.
- Every icon-only control has an accessible name. Every input has a real label.
- Invented data only: fictional usernames, repos, branches, and check names. Do not use GitHub's mascot names.

## Working rules

- Follow the rules of the extracted design-system skill installed under `.claude/skills/` (when present).
- Run the dev server, watch the full sequence in both color modes, and fix what you see before you finish.
- Do not commit or stage anything — leave the working tree dirty for review.
