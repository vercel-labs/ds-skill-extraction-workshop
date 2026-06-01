---
name: ds
description: Project design system — thin Primer wrapper, restrictive on a11y.
---

# ds — design system

`ds` is a thin wrapper around Primer: if Primer ships it, `ds` exposes it. The wrappers exist because Primer's defaults are wrong for our a11y bar, so each wrapper tightens what Primer ships loose. `inactive` vs `disabled` is the canonical example.

## Headline rule

Use `disabled={isLoading}` on submit buttons, not the `inactive` prop. `inactive` is a non-interactive *visual* state and screen readers will still announce the button as actionable.

`inactive` exists for a legitimate case: a button you want users to see and tab to but not trigger yet — feature-gated UI, or a Deploy button waiting on a permission grant. Submit-during-request is the opposite case — you want the click blocked AND the button skipped by Tab AND announced as unavailable, but `inactive` only blocks the click. axe passes, the screenshot diff is empty, and a keyboard user can still hit Enter and submit the form twice.

## Where the rest of the floor lives

Per-component rules live alongside the components: `ds/components/Button.docs.tsx`, `ds/components/FormControl.docs.tsx`. `DESIGN.md` is the floor, not the ceiling.