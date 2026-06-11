---
role: user
phase: 2
audience: attendee
---

This UI must be built with Primer React (`@primer/react`).

Recreate the GitHub **merge box** — the panel at the bottom of every pull request that tells you whether you can merge. Everyone in this room has stared at that panel waiting for checks to go green. Build that one.

Edit `app/page.tsx` and put the composition in `components/showcase/merge-readiness-panel.tsx` (`"use client"` on both).

## The experience

A GitHub engineer glancing at this page should not notice it is a recreation. It should feel like a busy repository on a Tuesday afternoon: a pull request with real reviewers, a wall of CI checks, and one problem blocking the merge.

Above the panel, a page header gives context: the PR title "Extract design tokens into a skill manifest", its number, who wants to merge what into where, and its current state (open).

The panel itself is one card with four zones:

1. **Reviews** — who approved, who was asked again. Show a mix of roles.
2. **Checks** — the CI wall. Make it feel like a real matrix, not a demo: most passing, at least one failing with a reason a developer would recognize. The counts should add up.
3. **The blocker** — this branch has conflicts that must be resolved. Make it impossible to miss, and give the user a way to act on it.
4. **Merge controls** — merge method, commit headline, extended description, the option to delete the branch after merge, and the merge action itself.

You decide layout, density, spacing, copy, and which component fits each job. That is what the design system is for.

## The contract

- While the blocker exists, merging must be **genuinely unavailable** — not just look unavailable. A keyboard user must not be able to trigger it, and a screen reader must not announce it as actionable.
- Light and dark mode must both render correctly from the system preference — including the page background, not just the card.
- No hand-picked colors or pixel values. Success, failure, attention, and danger meanings come from the design system's semantic options.
- Every icon-only control has an accessible name. Every input has a real label.
- Invented data only: fictional usernames, repos, branches, and check names. Do not use GitHub's mascot names.

## Working rules

- Static composition — no timers, no API calls, no new dependencies.
- Follow the rules of the extracted design-system skill installed under `.claude/skills/` (when present).
- Run the dev server and check your work in both color modes before you finish. Fix what you see.
- Do not commit or stage anything — leave the working tree dirty for review.
