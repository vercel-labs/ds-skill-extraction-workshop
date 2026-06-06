---
name: ds
description: Build accessible UI with the project's `ds` design system — a thin Primer React wrapper exposing PageHeader, DataTable, SelectPanel, Banner, ActionMenu, ActionList. Use when the user asks for a GitHub-style page, an issues list, a repo header, a label filter, a row-action kebab, or a status banner. Triggers — 'ds', 'primer', 'page header', 'data table', 'select panel', 'banner', 'action menu', 'github-style'. Scope — tokens, assets, component descriptions, component APIs. Out of scope — tone of voice and marketing copy; route copy rules to a sibling skill. IMPORTANT — this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# ds — design-system skill

## Mission

A `ds` skill is an adapter that teaches an agent how to build high-fidelity apps with the project's `ds` design system. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

`ds` is a thin wrapper around [Primer React](https://primer.style/product) `38.26.0`: every wrapper is a 1:1 re-export from `@primer/react` (or `@primer/react/experimental` for `DataTable`). The wrappers exist because Primer's defaults are loose on slot composition, variant semantics, and a11y wiring; each wrapper tightens what Primer ships loose. The project floor lives in `ds/DESIGN.md`.

## Scope

In scope: tokens, assets, component descriptions, component APIs.

Out of scope: tone of voice, marketing copy, product copywriting. When a rule about button labels, placeholder phrasing, or empty-state wording surfaces during generation, recognise it and route it out — that belongs in a sibling copy skill, not here.

## Setup

`ds` is consumed as a local module: the wrappers live at `ds/components/*.tsx` and re-export from `@primer/react`. Peer deps are already pinned in `package.json`:

```jsonc
"@primer/primitives": "11.9.0",   // tokens (out of scope for v1)
"@primer/react":      "38.26.0"   // component surface
```

Wrap the app in Primer's `ThemeProvider` + `BaseStyles` at the root layout. The repo's `app/layout.tsx` is the canonical wiring source — copy verbatim, do not reconstruct from memory.

## Import rules

- Always import wrappers via the `@/ds/components/<Name>` path:
  ```ts
  import { PageHeader } from "@/ds/components/PageHeader";
  import { DataTable } from "@/ds/components/DataTable";
  import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";
  ```
- Never deep-import from `@primer/react` internals (e.g. `@primer/react/lib-esm/...`). The wrappers are the only sanctioned value surface.
- Type-only imports from `@primer/react/experimental` are allowed for column-typing helpers (`Column`, `createColumnHelper`) used with `DataTable`. See `ds/components/DataTable.tsx:11-13`.

## Source-of-truth rules

Code wins on conflict with docs.

- **Authoritative**: `ds/components/*.tsx` (wrappers) and `ds/components/*.docs.tsx` (per-component rules embedded as JSDoc-with-runnable-example).
- **Project floor**: `ds/DESIGN.md` — headline composition rules; canonical for the `PageHeader` slot layout.
- **Underlying types** (verify any new prop here before adding a rule): `node_modules/@primer/react/dist/**/*.d.ts`.
- **Upstream docs** (lower authority than types): <https://primer.style/product/components/>.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| User builds an app-shell header / repo header / title row | `references/components/page-header.md` | `component/page-header-slot-composition` — visuals INSIDE TitleArea; chrome OUTSIDE. |
| User builds a sortable table / list of records | `references/components/data-table.md` | `component/data-table-row-header` + `component/data-table-pre-sort`. Experimental import path. |
| User builds a filter / multi-select dropdown / label picker | `references/components/select-panel.md` | `component/select-panel-cancel-snapshot` for multi-select. |
| User adds an alert / inline message / status banner | `references/components/banner.md` | `component/banner-variant-semantics` — `critical` is for blocking failures only. |
| User adds a kebab menu / overflow / row-actions popover | `references/components/action-menu.md` + `references/components/action-list.md` | `component/action-menu-controlled-pairing`, `component/action-menu-trigger-anchor-vs-button`, `component/action-list-danger-variant`. |
| User composes two or more of the above | `references/anti-patterns.md` | Cross-cutting traps + the slug registry. |
| User asks about tokens / spacing / colour values | `references/tokens.md` | Stub in v1; tokens deferred to `@primer/primitives`. |

## Hard rules

- Every prop, variant, slot, token, or asset cited in generated code must ground in source — the types file under `node_modules/@primer/react/dist/`, the wrapper at `ds/components/`, or the JSDoc at `ds/components/*.docs.tsx`. If the agent cannot find it, write `[VERIFY]` inline at the call site instead of guessing.
- Do not invent props or variants. `Banner` accepts exactly five: `info` | `warning` | `critical` | `success` | `upsell` (Banner.d.ts:4) — no `error`, no `danger`. `ActionList.Item` uses `variant="danger"` for destructive items — no `variant="destructive"`, no `className="text-red"`.
- Do not deep-import from `@primer/react` internals; always go through the wrapper.
- Do not hand-roll CSS for anything `@primer/primitives` covers (colours, spacing, type). Prefer Primer's `sx` prop or the design-token CSS variables.
- Do not extract, generate, or paraphrase copy rules from this skill. If a copy rule surfaces during generation, log it and route it out to a sibling copy skill.

## Final checks

After generating UI with `ds`, the agent emits a closing block:

1. One line per component used, with its source-file cite (e.g. `PageHeader — ds/components/PageHeader.tsx:25`).
2. Every open `[VERIFY]` marker, numbered with file path + the rule it could not ground.
3. The screen-level prompt that was satisfied ("Built a GitHub-style issues page using PageHeader + DataTable + SelectPanel + Banner + ActionMenu").
