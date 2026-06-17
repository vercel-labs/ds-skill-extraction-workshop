# Foundation: Octicons

Source URL: https://primer.style/octicons/ (fetched 2026-06-12, HTTP 200)

## What this covers

- GitHub's Octicons icon catalog — the size-bucket system and the name-size naming convention the React package's exports follow.

Rules extracted: 2

### asset/octicon-size-buckets

Octicons ship in five size buckets — 12px, 16px, 24px, 48px, 96px — as distinct catalog sections, not one icon scaled arbitrarily. 16px and 24px are the large general-purpose sets; 12px is a small utility set (alerts, chevrons, x, check-circle-fill, no-entry-fill); 48px and 96px are special-purpose (copilot only). Pick the bucket matching the rendered size instead of scaling a 16px glyph to 32px.

**When it bites:** scaling a 16px-optimized glyph to large sizes renders soft strokes and uneven optical weight; requesting a 12px variant of an icon that only ships 16/24 silently falls back or fails.

| Bad | Good | Why |
|---|---|---|
| `<SearchIcon size={32} />` assuming a 32px master exists | use the shipped bucket (`size={24}`) or accept the upscale knowingly | buckets are hand-hinted per size; arbitrary sizes interpolate |

Source: https://primer.style/octicons/ (size-section headings "12px", "16px", "24px", "48px", "96px" resolve in fetched page)

### asset/octicon-name-size-suffix

Octicon identities follow a `name-size` pattern (`chevron-down-12`, `mark-github-16`, `copilot-96`), with style variants encoded in the name itself (`-fill`, `-slash`); the React package flattens this to PascalCase exports that select size via the `size` prop instead of per-size components. [VERIFY: anchor did not resolve in fetched page — the Octicons catalog has no dedicated naming-convention heading; the `name-size` pattern is observable across the icon listing URLs (e.g. `/octicons/icon/chevron-down-12/`) but is not documented as an explicit rule]

**When it bites:** guessing export names from the catalog slugs (`ChevronDown12Icon`) misses — the React export is `ChevronDownIcon` + `size={12}`.

| Bad | Good | Why |
|---|---|---|
| `import { MarkGithub16 } from "@primer/octicons-react"` | `import { MarkGithubIcon } from "@primer/octicons-react"` + `size={16}` | the React package exports one PascalCase `<Name>Icon` symbol per glyph; size is a prop |

All 12 octicon exports consumed in the exemplars grep-resolve in `node_modules/@primer/octicons-react/dist/icons.d.ts` @19.28.0 (GearIcon, GraphIcon, PlusIcon, RepoIcon, SearchIcon, IssueOpenedIcon, GitPullRequestIcon, StarIcon, BellIcon, CreditCardIcon, KeyIcon, PersonIcon).

Source: https://primer.style/octicons/

### asset/closed-prop-surface

Octicon components expose a prop surface NARROWER than `React.SVGProps` — `IconProps` is exactly `aria-label` / `className` / `fill` / `size` / `verticalAlign` (`node_modules/@primer/octicons-react/dist/icons.d.ts:6-12`). There is NO `style` passthrough: the natural consumer move `<SearchIcon style={{ color: ... }} />` fails typecheck (mechanically verified — `NEGATIVE:SearchIcon.style` probe PASS against `@primer/octicons-react@19.28.0`).

**When it bites:** coloring an icon to match a status (muted metadata, danger glyph) by passing `style` — the prop is rejected at typecheck, and nothing in the catalog prose warns about it.

**Colored-glyph recipe:** wrap the icon in a parent element that sets `color`; the SVG inherits via `fill="currentColor"`:

```tsx
<span style={{ color: 'var(--fgColor-muted)' }}>
  <SearchIcon size={16} />
</span>
```

| Bad | Good | Why |
|---|---|---|
| `<SearchIcon style={{ color: 'var(--fgColor-muted)' }} />` | `<span style={{ color: 'var(--fgColor-muted)' }}><SearchIcon /></span>` | `IconProps` is a closed surface — `style` fails typecheck; the SVG inherits the parent's `color` via `fill="currentColor"` |

Never pass `style` to an octicon — the prop interface is closed; it fails typecheck. `fill` is the sanctioned color prop when inheritance won't do — pass a token-derived value, never a hex literal (`fill="var(--fgColor-muted)"`).

Source: `node_modules/@primer/octicons-react/dist/icons.d.ts:6-12`
