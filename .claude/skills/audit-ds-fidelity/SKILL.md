---
name: audit-ds-fidelity
description: Audit generated UI code against a produced design-system skill and emit a deterministic fidelity scorecard (2D rule-by-file table plus greppable PASS/FAIL footer). Use when the user asks to audit, score, or evaluate a run's fidelity to the DS skill, to compare skill-loaded vs unaided generations, or mentions "fidelity scorecard", "DS audit", or "rule attachment".
---

# Audit DS Fidelity

Score one generated run against the rules a produced DS skill states. Run it once per generation; two reports compare row-for-row because the rubric and output format are deterministic.

## Inputs

1. **Produced skill path** — e.g. `.claude/skills/primer-react/`. The rulebook. Required.
2. **Run directory or diff** — the generated files to audit (e.g. `app/` + `components/`). Required.
3. Never accept rules from any other source. If the user supplies extra rules, report them separately, outside the scorecard.

## Process

### Step 1 — Build the rubric BEFORE reading any generated code

Derive rows from the produced skill only. The rubric is a **fixed set of ~12 grouped category rows** — never one row per component or per bullet (see [REFERENCE.md](REFERENCE.md) for the row catalog and how skill content maps into it):

1. **Shell rows** (one each): painted shell, mode/theme pairing, provider wraps content.
2. **Token row**: no raw values.
3. **Component category rows** (one each, each aggregating ALL components in the run): legal variants/sizes, required props (aria-labels etc.), form wiring (control/label association), icon mechanics, routing preferences (prefer-X-over-Y), layout idiom (system layout component over ad-hoc divs).
4. Two skill-independent rows, always last: `audit/imports-resolve`, `audit/typecheck-clean`.

A category row passes only if every instance in the run passes; one violation anywhere fails the whole row (cite it). A category the skill never legislates, or with no instances in the run, scores `–`. The rubric must be identical for any run audited against the same skill.

### Step 2 — Score

- **Deterministic tier first**: run `scripts/audit-static.sh <run-dir>` (raw hex/px/rgb values, unresolved `@import`/`import` paths, leftover `[VERIFY]` markers). Then run the project's typecheck (`pnpm typecheck` or `npx tsc --noEmit`).
- **Judgment tier**: structural rules the script can't see — provider wraps children, mode attributes paired with theme imports, painted shell, component routing preferences, required-prop presence at call sites.
- Cell values: `✅` pass · `⚠️` safe-direction deviation (stricter than required, equivalent-or-better substitution) · `❌` fail · `–` not applicable.
- **Every `⚠️` and `❌` cell must cite `file:line` evidence.** A failure you cannot cite is not a finding — re-check or mark the row `–` with a note.

### Step 3 — Emit the report

**One compact markdown table is the deliverable** — rows = the ~12 category slugs (rubric order), columns = audited file groups (≤3, e.g. `shell` / `components/*`) + `Verdict` + `Evidence`. Keep Evidence to one clause (`file:line` + a few words); detail beyond that is omitted, not appended. No rubric-construction notes, no per-rule prose blocks. After the table come the greppable footer, then a summary of **at most 3 sentences**:

```
RUBRIC_SOURCE=<skill path>
RULES=<n> PASS=<n> WARN=<n> FAIL=<n> NA=<n>
<slug>=PASS|WARN|FAIL|NA   (one line per rule, rubric order)
FIDELITY_RESULT=PASS|FAIL
```

`FIDELITY_RESULT=PASS` requires zero `FAIL` rows. `WARN` never fails the audit.

The report preamble must state: "Rubric derived from `<skill>` only; the audited run may not have had access to it." This keeps unaided-run audits honest — scoring against unseen rules is the experiment, and the report says so.

Full report template and worked example: [REFERENCE.md](REFERENCE.md).

## Hard rules

- Rubric from the produced skill only — never from the audited code, memory of the DS, or upstream docs.
- The table stays ~12 rows: grouped category rows, never one row per component or per skill bullet. Per-instance detail lives only in Evidence cells.
- Conditional rows score `–` when the component is absent, never `✅` (no free passes for avoidance).
- `⚠️` is first-class: stricter-than-required or equivalent substitutions are not failures.
- Cite `file:line` in every non-`✅` cell.
- Spec/prompt fidelity is out of scope — this skill measures attachment to DS rules only.
- Do not edit the audited run or the produced skill. Read-only; the report is the sole output.
