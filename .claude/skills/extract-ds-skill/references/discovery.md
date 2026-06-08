# Phase 1: Discovery

Deep guidance for the discovery phase. Read before producing the discovery summary.

## Source-role classification

Every source the user provides resolves to one of ten roles. Tag each one before inspecting.

- **design-system code** — the package that ships components, tokens, primitives. Authoritative for APIs, prop shapes, default behavior. Joint-read with docs; code wins on conflict.
- **asset package** — icons, logos, fonts shipped as a separate module. Authoritative for asset names, sizes, sprite layout. Often versioned independently from the component package.
- **product-or-example app** — a real consumer of the design system, named by URL or path at discovery time but inspected only shallowly here. Authoritative for idiomatic composition. Used as a candidate `[example:project]` (see below) when wiring extraction is in scope.
- **`[example:project]`** — a real consumer app the user supplies as a URL or local path at Phase 1 input time, explicitly tagged for **wiring extraction**. Authoritative for provider mount, globals CSS, font setup, and root-element HTML attributes. Phase 2 walks the framework auto-detection order (Vite `src/main.{jsx,tsx}` → Next.js App Router `app/layout.{tsx,jsx}` → Next.js Pages Router `pages/_app.{tsx,jsx}` → CRA `src/index.{jsx,tsx}`) and lifts the topmost provider + direct CSS imports + root-element attributes verbatim into the scratch file. See `references/reference-project.md` for the recipe, output contract, framework-adaptation note, and fallback rules. The skill carries no default reference project — the user chooses one because the choice signals which framework, which version, and which idioms the produced wiring should reflect.
- **internal AGENTS/CLAUDE files** — instructions the DS team already wrote for agents. Treat as prior art. May contain rules to inherit, may contain rules that contradict current source — flag and verify.
- **docs site** — narrative explanations, prose around examples. Authoritative for intent and headline rules. Pairs with code via joint-read. Cited, not extracted.
- **docs:foundation** — prose foundations pages on the DS docs site that get EXTRACTED into `token/*` rules, not just cited. Distinct from generic `docs` in that the prose contracts (token-pairing, mode-aware behavior, contrast minimums, semantic-role rules, fallback-element styling) land as per-rule subsections inside `references/foundations/<page>.md` — one file per accepted+crawled URL. **N URLs per call** (opt-in; omit entirely if the user did not point at any foundations page). Each accepted root URL is **crawled depth-1 within its path prefix** so the user names roots, not every sub-page. Tagged `[docs:foundation]` in the sources block, with one accepted-or-rejected line per input URL. See `references/foundation-extraction.md` for the five rule shapes, the per-rule subsection skeleton, and the per-URL iteration contract. Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md` when one is in scope, or from the verbatim docs setup snippet as a fallback per `references/skill-template.md`.
- **Storybook** — variant catalog with live examples. Authoritative for which combinations are sanctioned. Useful to spot props that exist in code but never appear in any story (likely deprecated).
- **Figma** — design intent, naming, visual specs. Authoritative for token names and component taxonomy when the codebase trails the design.
- **private / inaccessible** — soft blocker. Log, proceed, may become available later.

## Shallow inspection rules

Shallow means: enough to summarize, not enough to extract. Deep enumeration is Phase 3.

- **code packages** — read `package.json` (exports field, peer deps, version), read top-level `src/` or `packages/*/src/` folder listing. Do not open every component file.
- **asset packages** — read manifest (`icons.json`, sprite index, font weights list). Count, do not enumerate.
- **docs sites** — read the index/sidebar to learn the component taxonomy. Skim one or two component pages to confirm the doc shape. Do not read every page.
- **example apps** — locate the provider mount, the globals import, the font setup. Note them. Do not audit every screen.
- **Storybook** — read the story tree (component → variants). Count variants per component. Do not open every story.
- **Figma** — list pages and frames at the top level. Do not crawl every component variant.

### Auto-discover + prune flow

Workshop credibility depends on this. If the attendee types four component names off a slide, the demo is rehearsed theatre. Instead:

1. Scan package exports (`package.json` `exports` field, `index.ts` re-exports, or equivalent).
2. Surface the total in the discovery summary as `Components found (N), proposing (M)` with the proposed subset bulleted.
3. Let the user prune or extend by name in their confirm reply.

Default proposal: pick the four most-imported components from any sibling example app, or fall back to the four with the most prop surface area. Show the count regardless so the gap is visible.

## Private / inaccessible handling

Soft blocker. Log the source with `[private-blocker]` in the sources line. Proceed with Phase 2 using whatever is accessible. Do not stop discovery to negotiate access — the user can grant it later and re-run, or accept the gap. The discovery summary mentions a blocker only if it would actually stop Phase 2 (e.g. the only accessible source is the private one).

## Discovery summary budget

Verbatim from the v0 onboarding instructions:

> "One line per source is the budget. No tables, no per-source field breakdowns."
> "Only mention blockers or open questions if they would actually stop Phase 2."
> "If the user just says 'go' without answering anything, pick defensible defaults and proceed."
> "End with a single short sentence asking the user to confirm or adjust. Then stop and wait."

Hard ceiling: 30 lines. Target: 20-28 lines. The user should read it in 60 seconds.

## Required fields in the discovery summary

Render inline, not as a file. Every summary contains:

- Skill name + slug, proposed as `.claude/skills/<slug>/` in the attendee's repo
- DS identity in one line — `<name> - <one-sentence description>`
- Components found (N), proposing (M) — bulleted, one line each (auto-discover output)
- Tokens detected — one line summary (count + families, e.g. color/space/type/motion)
- Assets detected — one line summary (omit entirely if none)
- Foundation docs — one block tagged `[docs:foundation]`. Every URL the user passed gets its own line, accepted or rejected. Never silently drop a URL; either it lands in the accepted block with its crawl tree, or it lands in the rejected block with a one-phrase reason. Omit the block entirely if the user did not provide any foundation URL. Format:

  ```
  Foundation docs:
  - accepted: <url-1> — crawled, found <N> sub-pages: <slug-a>, <slug-b>, ...
  - accepted: <url-2> — crawled, found <M> sub-pages: <slug-c>, <slug-d>, ...
  - rejected: <url-3> — <reason: unreachable | non-HTML | off-domain | depth-cap hit>
  ```

  Each accepted root is crawled depth-1 within its path prefix per the **Crawl rules** subsection below. The discovered tree surfaces here so the user can prune before Phase 2 proceeds.
- Reference project — one line, tagged `[example:project]`, with the URL or local path, the auto-detected framework (`vite` / `next-app` / `next-pages` / `cra`), and the resolved root entry file (e.g. `<reference-project-url-or-path>` @ `<root-entry-file>` (`<framework>`)). Omit this line entirely if the user did not provide a reference project. See `references/reference-project.md` for the recipe Phase 2 will run against it.
- Headline rule candidates (1-3) with `file:line` cites
- Sources used — one line per input, tagged `[code]` / `[docs]` / `[docs:foundation]` / `[example:project]` / `[storybook]` / `[private-blocker]`
- Open questions or blockers — only if they would stop Phase 2
- Soft nudge — when `[example:project]` is missing AND a `[docs:foundation]` URL is in scope, surface a one-line informational nudge inside the discovery summary (not a blocker): *"No reference project provided; Phase 2 will fall back to the foundation-docs setup snippet. Strongly recommend a reference project for cleaner wiring extraction — see `references/reference-project.md`."* Omit when no foundation URL is in scope OR when a reference project IS provided.
- Closing sentence asking the user to confirm or adjust

Budget note: the foundation block adds one accepted-or-rejected line per input URL plus one short crawl-tree segment per accepted root. Cap the per-root sub-page enumeration in the summary at 6 visible slugs followed by `+N more` so the 30-line ceiling holds even with 3 accepted roots × 12 crawled children each. The worst case (3 roots, each at the depth-1 cap, plus reference project, soft nudge, out-of-scope routing) still lands inside the 30-line target — the user reads the abbreviated tree here and the full enumeration lands in the Phase 2 proof-point line.

### Crawl rules (depth-1, per accepted root)

The agent runs this loop against every URL in the accepted block — never against the rejected block. This is agent work via `WebFetch`, not a separate script.

1. **Fetch the root.** Run `WebFetch <accepted-root>` once. Parse `<a href>` tags from the returned markdown. Treat unreachable / non-HTML / off-domain responses as a hard reject at parse-time — surface the URL in the rejected block with the reason, do not crawl.
2. **Filter by path prefix.** Keep only links whose URL begins with the same path prefix as the root. For root `<scheme>://<host>/foundations`, keep `<scheme>://<host>/foundations/<anything>`; drop `<scheme>://<host>/components/...`, drop external hostnames, drop `mailto:` / `#anchor-only` / `javascript:` schemes.
3. **Deduplicate.** Drop the root URL itself and any URL already in the accepted set (from another root's crawl, or a sibling root the user passed explicitly).
4. **Cap at 12 sub-pages per root.** If more than 12 survive the dedup, keep the first 12 in document order and emit a single `log()` line: `crawl truncated for <root>: kept 12 of <N>, dropped <list-of-dropped-slugs>`. Never silently truncate — the log line is the contract.
5. **No recursion.** Depth-1 only. If a sub-page surfaces a useful grandchild, the user adds that grandchild's parent as another root in a follow-up invocation.
6. **No cross-hostname follow.** If a sub-page link points at a different host than the root, drop it silently — cross-domain crawl is out of scope.

The agent assembles the per-root sub-page list into the accepted line of the Foundation docs block (abbreviated to 6 + `+N more` per the budget note), then proceeds to the rest of the discovery summary. Phase 2 will iterate the full `accepted_roots ∪ crawled_sub_pages` set without re-fetching the roots — see `references/foundation-extraction.md`.

### Scope routing during discovery

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## Worked example — extraction against a public-DS-shaped target (illustrative)

The block below uses a public Mantine setup to ground the shape. The skill makes no assumption that the user's DS is Mantine; the same summary contract applies to whichever DS the user passes (shadcn, Material, Geist, Chakra, Radix, an internal DS, etc.). Substitute real cites for the DS you are extracting.

<!-- example reference — verify against live extraction in dry-run -->

```
Proposed skill: `mantine` -> .claude/skills/mantine/

DS: Mantine - React component library with 100+ customizable components and accessible defaults.

Components found (147), proposing (4):
- TextInput - single-line text entry with label, description, and error slots
- Button - filled/outline/subtle action trigger with loading state and left/right section slots
- Checkbox - controlled boolean input, accepts label and description inline
- InputWrapper - wraps an input + label + description + error; pairs with custom inputs that need a11y labeling

Tokens detected: ~150 across color (theme colors 0-9 + functional), space (xs/sm/md/lg/xl), type (h1-h6 + functional). Skipping motion - Mantine uses transition tokens but no motion scale.
Assets detected: 0 icons in this package (@tabler/icons-react is the recommended pair, out of scope for v1).

Headline rule candidates:
- "Use `loading` prop on Button for loading states, not a custom spinner inside `children` - the loading prop handles disabled coordination and ARIA announcements" (Button.tsx:88, docs page)
- "Wrap custom inputs in `<InputWrapper>`; bare inputs without a wrapper lose label association and fail axe" (InputWrapper.tsx:31)
- "Do not pass `aria-label` to a Button that already renders visible text" (Button.tsx:204 prop comment)

Sources used:
- github.com/mantinedev/mantine @ v7.x [code, joint-read]
- mantine.dev/core/button [docs]
- CHANGELOG.md [code]

No blockers. Storybook is public but not cloned - will fall back to docs site for variant examples.

Confirm or adjust? (Reply "go" to accept defaults and begin extraction.)
```

### Worked example — same extraction with multiple foundation URLs + crawl (illustrative)

Same illustrative target, with the user passing two foundation root URLs + one URL the agent must reject. Only the diff from the baseline example is shown. The Foundation docs block reports one line per input URL, with the depth-1 crawl tree abbreviated per the budget note.

```
Foundation docs:
- accepted: https://mantine.dev/styles/colors/ [docs:foundation] — crawled, found 4 sub-pages: dark-mode, functional, primary, theme-object
- accepted: https://ui.shadcn.com/docs/theming [docs:foundation] — crawled, found 3 sub-pages: dark-mode, css-variables, conventions
- rejected: https://figma.com/file/abc/Mantine-Tokens [docs:foundation] — off-domain / non-HTML (Figma file, not a docs page)

Sources used:
- github.com/mantinedev/mantine @ v7.x [code, joint-read]
- mantine.dev/core/button [docs]
- mantine.dev/styles/colors/ [docs:foundation] (+4 crawled)
- ui.shadcn.com/docs/theming [docs:foundation] (+3 crawled)
- CHANGELOG.md [code]
```

Each accepted URL becomes its own file in the produced skill at `references/foundations/<slug>.md` (slug via the persist map — e.g. `colors`, `dark-mode`, `theming`, `css-variables`). The rejected URL is named and reasoned, never silently dropped. Phase 2 iterates the full accepted+crawled set per `references/foundation-extraction.md`. If no foundation URL is provided, the Foundation docs block is omitted entirely and Phase 2 behaves exactly as the baseline example above.

### Worked example — same extraction with a reference project added (illustrative)

Same illustrative target, with the user passing a reference project URL as an additional source. Only the diff from the baseline example is shown.

```
Reference project: https://github.com/mantinedev/next-app-template [example:project] (next-app — app/layout.tsx)

Sources used:
- github.com/mantinedev/mantine @ v7.x [code, joint-read]
- mantine.dev/core/button [docs]
- github.com/mantinedev/next-app-template [example:project]
- CHANGELOG.md [code]
```

The reference-project line is its own bullet in the proposed summary AND its own line in the sources block. Phase 2 will read the auto-detected root entry file and lift the wiring per `references/reference-project.md`; if no project is provided, both lines are omitted and Phase 2 falls back to the foundation-docs setup snippet (or empties the Setup section entirely if no foundation URL is in scope either). When a reference project is supplied AND a foundation URL is in scope, the soft-nudge line is omitted because the reference project IS the cleaner source.

## Handoff document — phase-1.md template

Phase 1 closes by writing `.extract-ds-skill-scratch/handoffs/phase-1.md`. The doc is the irrecoverable-state snapshot for a future session that resumes after a context-window blow-out or `/exit`. Apply the `/handoff` skill discipline: capture only what is NOT recoverable from the codebase, the meta-skill, or `AGENTS.md`. Reference everything else by path.

**Include (decisions surfaced in the discovery summary, as the user accepted them):**

- Slug and target path
- Reference project URL + entry file + framework
- Proposing set, final (the M from `Components found (N), proposing (M)` after the user pruned/extended)
- DS package names, versions, and `node_modules/` paths (resolved during inspection)
- Foundation URLs accepted, with the depth-1 crawl tree per accepted root
- The 1-3 headline rule candidates VERBATIM with their `file:line` cites
- cwd convention reminder ("if this resumed session is not in `.claude/worktrees/dryrun-NN/`, the dry-run worktree where the handoff was written, ask the user where to land outputs")
- Pickup prompt skeleton (one line: `/extract-ds-skill — resume from .extract-ds-skill-scratch/handoffs/phase-1.md`)

**Do NOT include:**

- The full discovery exploration (npm view, curl, grep outputs, file listings)
- Per-component deliberation about why a component was or was not proposed
- Raw inspection notes for sources the user has not yet seen
- The meta-skill's Phase 2 procedure (it lives in `references/validate.md` + `references/reference-project.md` + `references/foundation-extraction.md` and is loaded fresh by the resuming session)
- Anti-pattern rules, scope guardrails, or other meta-skill content (in `SKILL.md`, `references/anti-patterns.md`)
- The dry-run worktree convention prose (in `AGENTS.md`)

**Template shape:**

```markdown
# Phase 1 handoff — <slug>

_Written by /extract-ds-skill at <ISO date>. Read by the next session to skip discovery and enter Phase 2 directly._

## Decisions (irrecoverable from codebase)

- **Slug**: `<slug>` → `.claude/skills/<slug>/`
- **Reference project**: `<repo-url>` (`<framework>`, entry `<entry-file-path>`)
- **Proposing set** (<M> components, as approved):
  - <Component1>, <Component2>, …
- **DS packages**:
  - `<pkg-1>@<version>` (path: `<resolved-node_modules-path>`)
  - `<pkg-2>@<version>` (path: `<resolved-node_modules-path>`)
- **Foundation docs** (<K> accepted):
  - `<root-url-1>` [docs:foundation] — crawled, accepted sub-pages: <slug>, <slug>, …
  - `<root-url-2>` [docs:foundation] — crawled, accepted sub-pages: <slug>, <slug>, …
- **Headline rules** (verbatim):
  1. "<rule-1>" (`<file>:<line>`)
  2. "<rule-2>" (`<file>:<line>`)
  3. "<rule-3>" (`<file>:<line>`)

## Resume context

- cwd convention: resume in the same worktree where this handoff was written (`<absolute-worktree-path>`). If a new session opens in a different worktree, ask the user where to land outputs before proceeding.
- Phase 2 entry: load `references/validate.md` + `references/reference-project.md` + (if foundation URLs accepted) `references/foundation-extraction.md`. Write to `.extract-ds-skill-scratch/` only. Run `scripts/check-token-coverage.sh` as the hard gate. Wait for approval before Phase 3.

## Pickup prompt (paste into the new session)

```
/extract-ds-skill — resume from .extract-ds-skill-scratch/handoffs/phase-1.md
```
```

The template's role is to bound the doc's shape, not its DS-specific contents. Fill the angle-bracketed placeholders from the discovery summary the user just confirmed; leave nothing as `<…>` in the written file.
