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

Derive rows from the produced skill only, in this fixed order (see [REFERENCE.md](REFERENCE.md) for extraction details):

1. `SKILL.md ## Hard rules` → one row each, keyed by anti-pattern slug.
2. `references/anti-patterns.md` rows → one row each (skip duplicates of 1).
3. Per-component contracts (legal variants, required props, icon-as-component, routing preferences like prefer-X-over-Y) → **conditional rows**: scored only when that component appears in the run, otherwise `–`.
4. Two skill-independent rows, always last: `audit/imports-resolve` and `audit/typecheck-clean`.

The rubric must be identical for any run audited against the same skill. Never add, drop, or reorder rows based on what the audited code contains.

### Step 2 — Score

- **Deterministic tier first**: run `scripts/audit-static.sh <run-dir>` (raw hex/px/rgb values, unresolved `@import`/`import` paths, leftover `[VERIFY]` markers). Then run the project's typecheck (`pnpm typecheck` or `npx tsc --noEmit`).
- **Judgment tier**: structural rules the script can't see — provider wraps children, mode attributes paired with theme imports, painted shell, component routing preferences, required-prop presence at call sites.
- Cell values: `✅` pass · `⚠️` safe-direction deviation (stricter than required, equivalent-or-better substitution) · `❌` fail · `–` not applicable.
- **Every `⚠️` and `❌` cell must cite `file:line` evidence.** A failure you cannot cite is not a finding — re-check or mark the row `–` with a note.

### Step 3 — Emit the report

One markdown table: rows = rule slugs (rubric order), columns = audited files + `Verdict` + `Evidence`. Then the greppable footer:

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
- Conditional rows score `–` when the component is absent, never `✅` (no free passes for avoidance).
- `⚠️` is first-class: stricter-than-required or equivalent substitutions are not failures.
- Cite `file:line` in every non-`✅` cell.
- Spec/prompt fidelity is out of scope — this skill measures attachment to DS rules only.
- Do not edit the audited run or the produced skill. Read-only; the report is the sole output.
