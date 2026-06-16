# Lesson extract — what a handoff document looks like

> Audience prop for **Lesson 0006** (Beat 3, SHIP London 2026-06-17). Trimmed replicas of the two files the `extract-ds-skill` meta-skill writes between phases. Sourced verbatim from `.extract-ds-skill-scratch/handoffs/` in the workshop repo after a real Primer-React run, with internal run-cross-references and ticket-routing noise stripped — what remains is the load-bearing content the next session reads.
>
> Show this when the spoken line lands: *"It writes a small handoff document — a few hundred lines, decisions only, no transcript — and it stops."*

---

## Phase 1 → Phase 2 handoff (`phase-1.md`, ~70 lines)

```markdown
# Phase 1 handoff — primer-react

_Written by /extract-ds-skill at 2026-06-12. Read by the next session to
skip discovery and enter Phase 2 directly._

## Decisions (irrecoverable from codebase)

- **Slug**: `primer-react` → `.claude/skills/primer-react/`
- **Reference project**: `https://github.com/vercel-labs/primer-nextjs-template`
  (`next-app`, entry `app/layout.tsx`)
- **Proposing set** (15 components, as approved):
  - Button, IconButton, TextInput, Textarea, Select, Checkbox, FormControl,
    Heading, Text, Stack, Label, CounterLabel, Flash, StateLabel, BranchName
- **DS packages**:
  - `@primer/react@38.26.0`
  - `@primer/primitives@11.9.0`
  - `@primer/octicons-react@19.28.0`
- **Foundation docs** (1 accepted, depth-1 crawled):
  - `https://primer.style/` — sub-pages: product [in-scope],
    product/primitives [in-scope], octicons [in-scope],
    accessibility [in-scope], brand [out-of-scope: sibling-brand-ds-skill],
    about [out-of-scope: no-ds-content]
- **Headline rules** (verbatim):
  1. "BranchName renders `<a>` by default; pass `as=\"span\"` for non-link
     chips" (`packages/react/src/BranchName/BranchName.tsx:18`)
  2. "StateLabel's required `status` is keyed to the lifecycle octicon map
     — StateLabel for open/merged/closed, Label for metadata"
     (`packages/react/src/StateLabel/StateLabel.tsx:17-23`)
  3. "IconButton's `aria-label` is the accessible name AND the tooltip text"
     (`packages/react/src/Button/IconButton.tsx:14,23,33-34`)

## Components proposed

- **Button** — action trigger; variant/size/loading/inactive,
  leadingVisual/trailingVisual slots, count
- **IconButton** — icon-only button; `aria-label` required, doubles as tooltip
- **TextInput** — single-line input; leading/trailingVisual, loading,
  validationStatus, monospace
- **Textarea** — multi-line input; resize, characterLimit, validationStatus
- **Select** — styled native select; block/contrast/placeholder/validationStatus
- **Checkbox** — controlled boolean input; indeterminate, validationStatus
- **FormControl** — input wrapper; Label/Caption/Validation/LeadingVisual
  subcomponents
- **Heading** — semantic heading; `as="h2"` default, variant scale
- **Text** — inline text primitive; size/weight/whiteSpace
- **Stack** — flex layout primitive; gap/direction/align/justify, Stack.Item
- **Label** — small metadata badge; variant/size
- **CounterLabel** — numeric count badge; scheme
- **Flash** — inline banner; variant default/success/warning/danger
- **StateLabel** — lifecycle state capsule; required `status` keyed to the
  lifecycle octicon map
- **BranchName** — branch chip; renders `<a>` by default

## Known exclusions

The proposing set is 15 of 78 components found. Excluded categories (the
slate is the deliberate focused demo surface; every excluded category is a
known coverage gap by design):

- **Navigation & overlay** (ActionBar, ActionList, ActionMenu, Dialog,
  NavList, Popover, SelectPanel, Tooltip, Overlay, Pagination, …): not on
  the demo slate; fold in via a follow-up extraction.
- **Data display & advanced layout** (Avatar*, Banner, DataTable, Timeline,
  PageHeader, PageLayout, SplitPageLayout, …): the `Box` system primitive
  and the layout shells overlap conceptually with Stack — keeping Stack as
  the only layout primitive in v1 sharpens the teaching contract.
- **Form composition extras** (ToggleSwitch, RadioGroup, Radio,
  CheckboxGroup, FormControlValidation): each requires a 3+ component
  composition lesson — included after the demo set converges.
- **Style infrastructure** (BaseStyles, ThemeProvider, useTheme, sx,
  ConfirmationDialog): lifted verbatim in the produced Setup section,
  not surfaced as authored components.
- **Deprecated or experimental**: excluded by policy.

Consumers should expect coverage gaps in these areas. If a reproduction
prompt requires excluded components, run a second extraction with an
expanded slate.

## Resume context

- Phase 2 entry: load `references/validate.md` +
  `references/reference-project.md` + `references/foundation-extraction.md`.
  Write to `.extract-ds-skill-scratch/` only. Run
  `scripts/check-token-coverage.sh` as the hard gate. Wait for approval
  before Phase 3.

## Pickup prompt (paste into the new session)

    /extract-ds-skill validate: .extract-ds-skill-scratch/handoffs/phase-1.md
```

---

## Phase 2 → Phase 3 handoff (`phase-2.md`, ~50 lines)

```markdown
# Phase 2 handoff — primer-react

_Written by /extract-ds-skill at 2026-06-12 after validation iteration 1.
Status: approved. Read by the next session to enter Phase 3 directly._

## Proof point (verbatim)

    Validation complete.
    - 91 props verified against source (Button: 6, IconButton: 3,
      TextInput: 9, Textarea: 6, Select: 6, Checkbox: 5, FormControl: 5,
      Heading: 7, Text: 5, Stack: 8, Label: 9, CounterLabel: 4, Flash: 6,
      StateLabel: 7, BranchName: 1, SearchIcon [octicons]: 4)
      — 87 positive + 4 octicons positive + 9 negative claims,
      0 typecheck errors across both validate.sh runs.
    - 12 tokens grep-resolved (color/surface: 5, surface-radius: 2,
      size: 3, shadow: 2)
    - 12 assets grep-resolved (12/12 octicons consumed in exemplars
      resolve in @primer/octicons-react@19.28.0)
    - 8 foundation-rules extracted (7 cited, 1 [VERIFY]) across 5 files
      (home, product, primitives, octicons, accessibility)
    - Wiring extracted from vercel-labs/primer-nextjs-template
      (next-app, 31 lines, 1 CSS file lifted, 12 tokens consumed,
      12 covered)
    - TOKEN_COVERAGE=PASS
    - 19 cited node_modules paths exist (test -e PASS)
    - 5 URLs verified HTTP 200 at extract time
    - CITATION_VERIFICATION=PASS
    - 0 hallucinations

TOKEN_COVERAGE=PASS (consumed: 12, covered: 12)

CITATION_VERIFICATION=PASS

## Scratch artefacts (Phase 3 will materialize from these)

- `.extract-ds-skill-scratch/wiring-extracted.md` — 4346 bytes
  (layout.tsx 31 lines + companion globals.css verbatim)
- `.extract-ds-skill-scratch/examples/` — 6 files: dashboard, empty, home,
  new, repos, settings (lifted from the reference project; ~33 KB total)
- `.extract-ds-skill-scratch/foundations/` — 5 files: primitives
  (5 `token/*` rules), octicons (3 `asset/*` rules + 1 pre-accepted
  [VERIFY]), accessibility / product / home (depth-1 caveat each)
- `.extract-ds-skill-scratch/tokens-extracted.md` — 4203 bytes
  (12-token ledger with per-token defining-file map)
- `.extract-ds-skill-scratch/shell-invariants.md` — 4062 bytes
  (6 invariants: provider-not-sibling, content-wrap-base-styles,
   unpainted-body, mode-attribute-without-theme-import,
   suppress-hydration-warning, fixed-viewport-height)

## Open [VERIFY] markers

1. `foundations/octicons.md` — `asset/octicon-name-size-suffix`: anchor did
   not resolve in fetched page (the Octicons catalog page has no dedicated
   naming-convention anchor; 12/12 exemplar-consumed octicon exports
   grep-resolve in `node_modules/@primer/octicons-react/dist/icons.d.ts`).
   **Status: accepted as known limitation.**

## Resume context

- Phase 3 entry: load `references/persist.md` + `references/skill-template.md`.
  Slug-collision check runs FIRST. Materialize the scratch artefacts to
  `.claude/skills/primer-react/` per the persist map. Run
  `scripts/check-skill-docs.sh` after writes. Then close with the
  closing-message contract.

## Pickup prompt (paste into the new session)

    /extract-ds-skill persist: .extract-ds-skill-scratch/handoffs/phase-2.md
```

---

## How to use this on stage

The audience needs to see THREE things, in this order:

1. **A document, not a transcript.** Scroll the Phase 1 replica end-to-end so they can see *"a few hundred lines, decisions only"* is literal. The `## Decisions (irrecoverable from codebase)` heading lands the point — these are facts the next session would lose if it tried to derive them from the codebase alone.
2. **The proof point.** Hold on the Phase 2 fenced block. *"91 props, 12 tokens, 12 assets, 0 hallucinations"* — that's what the gate's approval is signing off on.
3. **The pickup prompt.** Both handoffs end with the exact slash command the next session pastes in. That's the resume mechanism — explicit, no auto-detection.

## What was trimmed from the real handoffs

For honesty if anyone asks: the on-disk files at `.extract-ds-skill-scratch/handoffs/` carry an additional `## Run #5 specific context` section in both phases. That section is operational noise from the dryrun cycle (cite-line drifts vs prior runs, ticket-routing overrides, probe-skip path notes). It is real but not load-bearing for understanding what a handoff IS — the decisions, the proof point, and the pickup prompt are the substance.
