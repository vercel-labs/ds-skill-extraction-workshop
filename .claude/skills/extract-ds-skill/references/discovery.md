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
- **docs:foundation** — a single prose foundations page on the DS docs site that gets EXTRACTED into `token/*` rules, not just cited. Distinct from generic `docs` in that its prose contracts (token-pairing, mode-aware behavior, contrast minimums, semantic-role rules, fallback-element styling) land as rule subsections in `references/tokens.md`. One URL per call (opt-in; omit entirely if the user did not point at a foundations page). Tagged `[docs:foundation]` in the sources line. See `references/foundation-extraction.md` for the five rule shapes and the per-rule subsection skeleton. Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md` when one is in scope, or from the verbatim docs setup snippet as a fallback per `references/skill-template.md`.
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
- Foundation docs URL — one line, tagged `[docs:foundation]`, with the URL and a one-phrase summary of the page's coverage (e.g. "color usage + dark mode wiring"). Omit this line entirely if the user did not provide a foundation URL. One URL per call — never crawl, never multi-URL.
- Reference project — one line, tagged `[example:project]`, with the URL or local path, the auto-detected framework (`vite` / `next-app` / `next-pages` / `cra`), and the resolved root entry file (e.g. `<reference-project-url-or-path>` @ `<root-entry-file>` (`<framework>`)). Omit this line entirely if the user did not provide a reference project. See `references/reference-project.md` for the recipe Phase 2 will run against it.
- Headline rule candidates (1-3) with `file:line` cites
- Sources used — one line per input, tagged `[code]` / `[docs]` / `[docs:foundation]` / `[example:project]` / `[storybook]` / `[private-blocker]`
- Open questions or blockers — only if they would stop Phase 2
- Soft nudge — when `[example:project]` is missing AND a `[docs:foundation]` URL is in scope, surface a one-line informational nudge inside the discovery summary (not a blocker): *"No reference project provided; Phase 2 will fall back to the foundation-docs setup snippet. Strongly recommend a reference project for cleaner wiring extraction — see `references/reference-project.md`."* Omit when no foundation URL is in scope OR when a reference project IS provided.
- Closing sentence asking the user to confirm or adjust

Budget note: the foundation URL adds at most one line to the sources block and one line to the proposed summary. The reference-project line adds at most one line to each. The 30-line ceiling holds even with all four optional lines present (foundation, reference project, soft nudge, out-of-scope routing) — the worst case lands at 28 lines, inside the target.

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

### Worked example — same extraction with a foundation URL added (illustrative)

Same illustrative target, with the user passing a foundation URL as an additional source. Only the diff from the example above is shown — the rest of the summary is unchanged.

```
Foundation docs: https://mantine.dev/styles/colors/ [docs:foundation] (color scales + dark-mode behavior + functional color tokens)

Sources used:
- github.com/mantinedev/mantine @ v7.x [code, joint-read]
- mantine.dev/core/button [docs]
- mantine.dev/styles/colors/ [docs:foundation]
- CHANGELOG.md [code]
```

The foundation line is its own bullet in the proposed summary AND its own line in the sources block. Phase 2 will WebFetch the URL and extract `token/*` rules per `references/foundation-extraction.md`; if no URL is provided, both lines are omitted entirely and Phase 2 behaves exactly as the baseline example above.

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
