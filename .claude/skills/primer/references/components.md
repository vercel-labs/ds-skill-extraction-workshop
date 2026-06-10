# Components — primer

- package: `@primer/react`
- version: `38.26.0`
- types source: `node_modules/@primer/react/lib-esm/` (after install)
- prop signatures below are validated against the package via `tsc --noEmit` (Phase 2 probe.tsx)

## PageLayout

### Public imports

```tsx
import { PageLayout } from "@primer/react";
```

### When to use

Use as the app frame for any page that needs a header / content / sidebar pane / footer composition. Reach for `PageLayout` when the page has structural chrome above and around the main content; do not use it for narrow content-led pages (use a vertical `<Stack>` capped at `maxWidth` instead — see `references/examples/home.md`).

### Key props and variants

- `containerWidth`: `"full" | "medium" | "large" | "xlarge"` — caps the inner content width. `"large"` is the default for app-shell pages (`references/examples/dashboard.md`); use `"medium"` for form-led pages and `"full"` for content that must reach the viewport edge.
- Compound children (validated against `@primer/react@38.26.0` via probe.tsx):
  - `<PageLayout.Header>` — top region; renders above `Content` and `Pane`.
  - `<PageLayout.Content>` — main column.
  - `<PageLayout.Pane position="start" width="medium">` — sidebar. `position`: `"start" | "end"`. `width`: `"small" | "medium" | "large"`.

### Accessibility

`PageLayout` renders semantic regions. The `Pane` is a `<section>` with `aria-label`; pass `aria-label` explicitly when the pane carries navigation (e.g. `<PageLayout.Pane aria-label="Settings navigation">`).

### Composition examples

See `references/examples/dashboard.md` (Header + Content), `references/examples/settings.md` (Header + Pane + Content).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/PageLayout/`
- Reference project usage: `vercel-labs/primer-nextjs-template/app/dashboard/page.tsx`, `app/settings/page.tsx`

### Best Practices

- Default `containerWidth` to `"large"` for app-shell pages; `"medium"` for form pages; `"full"` only when content must reach the viewport edge.
- Compose with `<PageHeader>` inside `<PageLayout.Header>` — `PageLayout.Header` is structural; `PageHeader` provides the title/description/actions slots.
- Pane width is `small | medium | large`, never a pixel value. Pixel widths break responsive collapse.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<PageLayout.Pane width={240}>` | `<PageLayout.Pane width="medium">` | Pixel widths bypass Primer's responsive collapse; named tokens swap to a stacked layout on narrow viewports. |
| `<PageLayout.Content><PageHeader>...</PageHeader>...</PageLayout.Content>` | `<PageLayout.Header><PageHeader>...</PageHeader></PageLayout.Header><PageLayout.Content>...</PageLayout.Content>` | `PageHeader` belongs in the `Header` region; placing it inside `Content` defeats the structural layout. |

### Things to never invent

- No `containerWidth="auto"` — the valid set is `full | medium | large | xlarge`.
- No `<PageLayout.Footer>` unless verified — the probe.tsx file did not validate a `Footer` accessor; treat any `Footer` claim as `[VERIFY]` until grepped.

---

## Stack

### Public imports

```tsx
import { Stack } from "@primer/react";
```

### When to use

Use `<Stack>` as the layout primitive whenever you would otherwise reach for flexbox. It standardizes direction, gap, alignment, and justification through named tokens so spacing stays mode-consistent and responsive-aware. Avoid hand-rolled `display: flex` divs in Primer apps — `<Stack>` is the canonical primitive.

### Key props and variants

Validated via probe.tsx:

- `direction`: `"vertical" | "horizontal"`.
- `gap`: `"none" | "condensed" | "normal" | "spacious"` — named tokens, not pixel values.
- `align`: `"start" | "center" | "end" | "baseline" | "stretch"` — cross-axis alignment.
- `justify`: `"start" | "center" | "end" | "space-between" | "space-around" | "space-evenly"` — main-axis distribution.
- `wrap`: `"wrap" | "nowrap"`.

### Accessibility

`<Stack>` renders a `<div>`. It carries no implicit semantics; if the stack represents a list or navigation, wrap it in `<ul>` / `<nav>` and apply ARIA to the wrapper.

### Composition examples

See `references/examples/home.md` (nested vertical + horizontal Stack), `references/examples/dashboard.md` (gap=`"spacious"` for page chrome).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/Stack/`
- Reference project usage: every page in `vercel-labs/primer-nextjs-template/app/`

### Best Practices

- Use `gap="spacious"` for page chrome (between PageHeader and content), `gap="normal"` for section groups, `gap="condensed"` for icon-plus-text rows, `gap="none"` for tightly stacked title + caption.
- Nest freely: outer `<Stack direction="horizontal" align="center">` for icon-plus-text rows, inner `<Stack direction="vertical" gap="none">` for stacked title + caption.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Stack gap={16}>` | `<Stack gap="normal">` | Numeric `gap` is silently ignored; only named tokens (`condensed | normal | spacious | none`) resolve. |
| `<div style={{ display: "flex", gap: 8 }}>` | `<Stack direction="horizontal" gap="condensed">` | Hand-rolled flex bypasses Primer's responsive + theme-aware spacing tokens. |

### Things to never invent

- No `gap="xs"`, `gap="xl"`, or any size-shaped value — the valid set is `none | condensed | normal | spacious`.
- No `direction="row" / "column"` — those are CSS flex values, not Primer's API. Use `horizontal | vertical`.

---

## PageHeader

### Public imports

```tsx
import { PageHeader } from "@primer/react";
```

### When to use

Use at the top of any page that needs a title, optional description, and optional actions row. Belongs inside `<PageLayout.Header>` for app-shell pages, or directly inside a content `<Stack>` for narrow content-led pages.

### Key props and variants

Compound children validated via probe.tsx:

- `<PageHeader.TitleArea>` — wraps the title (and optional leading visual).
- `<PageHeader.Title>` — the page title text; renders as an `<h1>` by default.
- `<PageHeader.Description>` — secondary descriptive text below the title.
- `<PageHeader.Actions>` — right-aligned action row (typically holds `<Button>` elements).

`PageHeader` itself accepts no `variant` or `size` prop — its appearance is fixed; vary the layout through which compound children you include.

### Accessibility

`<PageHeader.Title>` renders an `<h1>` by default. Do not nest a second `<h1>` inside the page — see `references/foundations/typography.md` `token/semantic-heading-order`.

### Composition examples

See `references/examples/home.md` (TitleArea + Description, no Actions), `references/examples/repos.md` (TitleArea + Actions for a transactional list page).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/PageHeader/`

### Best Practices

- Include `<PageHeader.Description>` only when the page benefits from secondary context; omit on transactional pages where the title is self-evident.
- Place `<PageHeader.Actions>` for transactional pages (forms, list pages with "Create" buttons); omit for informational/content pages.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<PageHeader><h1>title</h1></PageHeader>` | `<PageHeader><PageHeader.TitleArea><PageHeader.Title>title</PageHeader.Title></PageHeader.TitleArea></PageHeader>` | The compound children carry the styling and a11y wiring; a bare `<h1>` bypasses them. |
| `<PageHeader><PageHeader.Actions>...</PageHeader.Actions><PageHeader.TitleArea>...</PageHeader.TitleArea></PageHeader>` | TitleArea first, then Description, then Actions | The render order is fixed; reordering the children does not swap the visual layout but does break the reading order. |

### Things to never invent

- No `<PageHeader.Subtitle>` — the secondary text slot is `Description`.
- No `size` or `variant` prop on `<PageHeader>` itself.

---

## Heading

### Public imports

```tsx
import { Heading } from "@primer/react";
```

### When to use

Use for any semantic heading (`h1` through `h6`). Pair `as` (semantic tag) with `variant` (visual scale) independently — semantic order is set by the document, not the design scale.

### Key props and variants

Validated via probe.tsx:

- `as`: `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"`.
- `variant`: `"small" | "medium" | "large"` — visual scale; independent of `as`.

### Accessibility

Match `as` to the document's semantic heading hierarchy. The page's `<h1>` is `<PageHeader.Title>` (which renders an `h1`); subsequent headings inside the content are `as="h2"` and deeper. Do not skip levels — see `references/foundations/typography.md` `token/semantic-heading-order`.

### Composition examples

See `references/examples/home.md` (`<Heading as="h2" variant="small">` for card row titles).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/Heading/`

### Best Practices

- Set `as` based on the document's outline, not the visual size.
- The Heading variant→scale mapping (`small | medium | large` → which `--text-*-size` token) is documented thinly on the foundation page; the variants work at consumption time but the precise scale-pairing is `[VERIFY]` — see `references/foundations/typography.md`.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Heading variant="h1">title</Heading>` | `<Heading as="h1" variant="large">title</Heading>` | `variant` is a visual scale (`small | medium | large`), not a semantic tag. |
| `<Heading style={{ fontSize: 24 }}>title</Heading>` | `<Heading variant="medium">title</Heading>` | Inline `fontSize` bypasses Primer's responsive type scale; tokens swap at the responsive-typography breakpoint, raw px does not. |

### Things to never invent

- No `variant="xs"`, `variant="xl"`, or numeric variant — the valid set is `small | medium | large`.

---

## Text

### Public imports

```tsx
import { Text } from "@primer/react";
```

### When to use

Use for any inline typographic primitive (body text, captions, inline emphasis). Prefer `<Text>` over raw `<span>` whenever you need to control size or weight via Primer's tokens.

### Key props and variants

Validated via probe.tsx:

- `size`: `"small" | "medium" | "large"`.
- `weight`: `"light" | "normal" | "medium" | "semibold" | "bold"`.

`<Text>` does NOT carry a `muted` variant. For muted secondary text, set `style={{ color: "var(--fgColor-muted)" }}` inline — see `references/examples/home.md`.

### Accessibility

`<Text>` renders a `<span>`. No implicit semantics; if the text represents a label, status, or other semantic role, use the appropriate Primer component (`<Label>` for status badges, `<FormControl.Caption>` for input help, etc.).

### Composition examples

See `references/examples/home.md` (caption rendering with `style={{ color: "var(--fgColor-muted)" }}`).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/Text/`

### Best Practices

- For muted secondary text, set color inline via `style={{ color: "var(--fgColor-muted)" }}`. Do not invent a `muted` prop.
- Use `weight="semibold"` for emphasized inline text; reserve `weight="bold"` for headings (and prefer `<Heading>` there).

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Text muted>secondary</Text>` | `<Text style={{ color: "var(--fgColor-muted)" }}>secondary</Text>` | `<Text>` has no `muted` prop; the inline style with the muted foreground token is the canonical pattern. |
| `<Text size="xs">tiny</Text>` | `<Text size="small">tiny</Text>` | Valid sizes are `small | medium | large`. |

### Things to never invent

- No `muted`, `subdued`, or `dimmed` prop.
- No `size="xs" / "xl"` — the valid set is `small | medium | large`.

---

## Button

### Public imports

```tsx
import { Button } from "@primer/react";
```

### When to use

Use for any actionable trigger — form submission, navigation actions, destructive operations, inline command triggers. Match the `variant` to the action's semantic role.

### Key props and variants

Validated via probe.tsx:

- `variant`: `"default" | "primary" | "danger" | "invisible"` (and `"outline"` is also exported; the probe validated `primary`, `danger`, and `invisible` directly).
- `leadingVisual`: a React component or render function for an icon shown before the label. Pass an Octicon directly: `leadingVisual={PlusIcon}`.

### Accessibility

`<Button>` renders a native `<button>`. Do not pass `aria-label` when the button has visible text — duplicate labeling fails axe and degrades screen-reader output. Do pass `aria-label` for icon-only buttons.

### Composition examples

See `references/examples/repos.md`, `references/examples/new.md` (form submit buttons), `references/examples/dashboard.md`.

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/Button/`

### Best Practices

- Pair `variant="danger"` with text painted by `var(--fgColor-onEmphasis)` — the danger surface is `--bgColor-danger-emphasis`; semantic `--fgColor-danger` on that surface reads as red-on-red. See `references/foundations/colors.md` `token/role-semantic-foreground`.
- Use `variant="invisible"` for tertiary actions (cancel, dismiss); reserve `variant="primary"` for the single most important action on the page.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Button>` with raw hex inline styling | `<Button variant="primary">` | `variant` selects the token-paired surface + foreground; raw styling breaks dark mode. |
| `<Button aria-label="Save">Save</Button>` | `<Button>Save</Button>` | Duplicate labeling — the visible text IS the accessible name. |
| `<Button leadingVisual={<PlusIcon />}>` | `<Button leadingVisual={PlusIcon}>` | `leadingVisual` accepts the component reference, not the rendered element. |

### Things to never invent

- No `size="xs"` — the probe.tsx file did not validate a `size` prop on `<Button>`; treat any size claim as `[VERIFY]` until grepped.
- No `loading` prop verified inline — if a loading state is needed, mark `[VERIFY]` and grep the types file before shipping a rule about it.

---

## FormControl

### Public imports

```tsx
import { FormControl } from "@primer/react";
```

### When to use

Wrap any input that needs an accessible label, caption, or validation message. Pairs an input + label + caption + validation block under one consistent ARIA wiring. Use it instead of hand-rolling `<label>` + `<input>` + error markup.

### Key props and variants

Validated via probe.tsx:

- `required`: boolean — marks the field as required (renders an asterisk on the label and sets `aria-required`).
- Compound children:
  - `<FormControl.Label>` — the label text. Required for a11y; do not omit.
  - `<FormControl.Caption>` — secondary help text below the input.
  - `<FormControl.Validation variant="error">` — error or success message. `variant`: `"error" | "warning" | "success"`.

### Accessibility

`FormControl` wires `htmlFor` ↔ `id`, `aria-describedby` for the caption, and `aria-errormessage` for the validation block automatically. Bypassing it loses these associations.

### Composition examples

See `references/examples/new.md` (FormControl rows with TextInput, Caption, Validation).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/FormControl/`

### Best Practices

- Always include `<FormControl.Label>`; the visual label is also the accessible name.
- Use `<FormControl.Caption>` for static help text; `<FormControl.Validation>` for dynamic state.
- Pass `required` on `<FormControl>`, not on the nested `<TextInput>` — the wrapper handles both the visual marker and the ARIA wiring.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<TextInput aria-label="email" />` | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput /></FormControl>` | Bare inputs lose label association and the `aria-describedby` wiring for captions. |
| `<FormControl><TextInput required /></FormControl>` | `<FormControl required><TextInput /></FormControl>` | `required` on the wrapper drives both the visual asterisk and the ARIA attribute; placing it on the inner input duplicates state. |

### Things to never invent

- No `<FormControl.Hint>` — the help-text slot is `Caption`.
- No `variant` prop on `<FormControl>` itself.

---

## Label

### Public imports

```tsx
import { Label } from "@primer/react";
```

### When to use

Use for inline metadata badges: status indicators, tags, role markers. Do not use for form labels (that is `<FormControl.Label>`) or for button-like clickable affordances.

### Key props and variants

Validated via probe.tsx:

- `variant`: `"default" | "accent" | "success" | "attention" | "danger" | "severe" | "done" | "sponsors" | "primary" | "secondary"`. The probe validated `accent`, `success`, `attention`, and `danger`; the others are exported by the package but not exercised in the reference project.

### Accessibility

`<Label>` renders an inline element with the variant's surface + foreground tokens paired correctly (semantic role tokens, not on-emphasis pairs — labels live on default surfaces).

### Composition examples

See `references/examples/repos.md` (status labels in list rows).

### Source references

- Implementation: `node_modules/@primer/react/lib-esm/Label/`

### Best Practices

- Match `variant` to semantic role: `accent` for highlighted metadata, `success` for completed states, `attention` for warnings, `danger` for failures.
- Keep label text short — labels are inline badges, not paragraphs.

### Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Label variant="red">error</Label>` | `<Label variant="danger">error</Label>` | Color-named variants don't exist; semantic-role variants do. |
| `<Label><Button>action</Button></Label>` | `<Button variant="invisible">action</Button>` | `<Label>` is for inline metadata; nesting interactive children breaks both semantics and styling. |

### Things to never invent

- No `size` prop verified — `<Label>` ships at a fixed size; treat any size claim as `[VERIFY]`.
- No `variant="warning"` — the warning-shaped variant is `attention`.
