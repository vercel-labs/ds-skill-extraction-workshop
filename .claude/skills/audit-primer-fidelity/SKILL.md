---
name: audit-primer-fidelity
description: Audit generated UI code against the Primer React design-system contract (tokens, dark mode, shell wiring, component pitfalls) and emit a deterministic fidelity scorecard (2D rule-by-file table plus greppable PASS/FAIL footer). Self-contained — the rubric is baked in, no other skill needs to be installed. Use when the user asks to audit, score, or evaluate a run's Primer fidelity, to compare skill-loaded vs unaided generations, or mentions "fidelity scorecard", "DS audit", or "rule attachment".
---

# Audit Primer Fidelity

Score one generated run against the Primer React design-system contract. The rubric is **baked into this skill** ([REFERENCE.md](REFERENCE.md)) — it never reads another skill or the `ds/` folder to build it. Run it once per generation; two reports compare row-for-row because the rubric and output format are deterministic.

## Inputs

1. **Run directory or diff** — the generated files to audit (e.g. `app/` + `components/`). Required.
2. Never accept extra rules into the scorecard. If the user supplies additional rules, report them separately, outside the table.

## Process

### Step 1 — Load the rubric BEFORE reading any generated code

The rubric is the **fixed 12-row catalog** in [REFERENCE.md](REFERENCE.md) — read it first. Never derive rows from the audited code, memory, or upstream docs. The rows:

1. **Shell rows**: `shell/painted-body`, `shell/mode-theme-pairing`, `shell/provider-wraps-content`.
2. **Token row**: `token/no-raw-values`.
3. **Component category rows** (each aggregating ALL components in the run): `component/legal-variants`, `component/required-props`, `component/form-wiring`, `component/icon-mechanics`, `component/routing-preferences`, `layout/system-idiom`.
4. Two mechanical rows, always last: `audit/imports-resolve`, `audit/typecheck-clean`.

A category row passes only if every instance in the run passes; one violation anywhere fails the whole row (cite it). A category with no instances in the run scores `–`. The rubric is identical for every run.

### Step 2 — Score

- **Deterministic tier first**: run `scripts/audit-static.sh <run-dir>` (raw hex/px/rgb values, unresolved `@import`/`import` paths, leftover `[VERIFY]` markers). Then run the project's typecheck (`pnpm typecheck` or `npx tsc --noEmit`).
- **Judgment tier**: structural rules the script can't see — provider wraps children, mode attributes paired with theme imports, painted shell, routing preferences, required-prop presence at call sites. Concrete check criteria per row: [REFERENCE.md](REFERENCE.md).
- Cell values: `✅` pass · `⚠️` safe-direction deviation (stricter than required, equivalent-or-better substitution) · `❌` fail · `–` not applicable.
- **Every `⚠️` and `❌` cell must cite `file:line` evidence.** A failure you cannot cite is not a finding — re-check or mark the row `–` with a note.

### Step 3 — Emit the report

**One compact markdown table is the deliverable** — rows = the 12 catalog slugs (rubric order), columns = audited file groups (≤3, e.g. `shell` / `components/*`) + `Verdict` + `Evidence`. Keep Evidence to one clause (`file:line` + a few words); detail beyond that is omitted, not appended. No rubric-construction notes, no per-rule prose blocks. After the table come the greppable footer, then a summary of **at most 3 sentences**:

```
RUBRIC=audit-primer-fidelity (baked-in)
RULES=<n> PASS=<n> WARN=<n> FAIL=<n> NA=<n>
<slug>=PASS|WARN|FAIL|NA   (one line per rule, rubric order)
FIDELITY_RESULT=PASS|FAIL
```

`FIDELITY_RESULT=PASS` requires zero `FAIL` rows. `WARN` never fails the audit.

The report preamble must state: "Rubric is this skill's baked-in Primer contract; the audited run may not have had access to any DS skill." This keeps unaided-run audits honest — scoring against unseen rules is the experiment, and the report says so.

Full report template and worked example: [REFERENCE.md](REFERENCE.md).

### Step 4 — Visual evidence (screenshot probe, opt-in)

When BOTH hold — (a) the audited run is reachable at a URL the operator supplies (an already-running preview; **never start a server to get one**), and (b) the DS has a public docs URL — capture side-by-side screenshot evidence for each component in scope:

```
bash .claude/skills/extract-ds-skill/scripts/probe-rendered.sh --screenshot \
  --component <Name> --url <ds-docs-example-url> --produced-url <produced-page-url> \
  --out-dir <audit-scratch>/screenshots
```

The probe writes `<slug>--docs.png` + `<slug>--produced.png` and emits one entry line per pair — component name, both PNG paths, both source URLs, tagged `[needs-human-review]`. Copy each `PROBE_SCREENSHOT=captured ...` line **verbatim** into a `## Visual evidence [needs-human-review]` block placed after the greppable footer, outside the table.

**Discipline — evidence, never verdict.** The screenshots are artifacts FOR the human reviewer; the audit never converts them into findings. Visual DS-contract claims (color saturation, disabled palette, contrast, dark-mode legibility) are NEVER asserted from screenshot inference alone. No screenshot entry feeds a rubric cell or `FIDELITY_RESULT`; no pixel diff becomes a pass/fail score (a diff image, if ever attached, is a third artifact for the human, never a graded verdict). Probe skips/failures (`PROBE_SKIPPED=...`, `PROBE_FAILED=...`) are logged in the block verbatim and the audit proceeds — visual evidence is additive, never a gate.

## Hard rules

- Rubric is the fixed catalog in REFERENCE.md only — never invent rows from the audited code, memory of other DSs, or upstream docs.
- The table stays 12 rows: grouped category rows, never one row per component or per rule bullet. Per-instance detail lives only in Evidence cells.
- Conditional rows score `–` when the component is absent, never `✅` (no free passes for avoidance).
- `⚠️` is first-class: stricter-than-required or equivalent substitutions are not failures.
- Cite `file:line` in every non-`✅` cell.
- Spec/prompt fidelity is out of scope — this skill measures attachment to the Primer contract only.
- Do not edit the audited run. Read-only; the report is the sole output (plus screenshot PNGs in the audit scratch dir when the probe runs).
- Screenshot-probe entries carry `[needs-human-review]` verbatim and never produce a visual claim, rubric cell, or `FIDELITY_RESULT` contribution — the human reviewer produces visual claims, never the audit.
