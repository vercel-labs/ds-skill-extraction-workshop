# Anti-patterns — primer-react

Cross-cutting traps that fire across multiple components. Per-component traps live in `references/components.md` under each component's `Common mistakes`.

| Bad | Good | Why |
|-----|------|-----|
| `color: #1f2328; background: #fff` | `color: var(--fgColor-default); background: var(--bgColor-default)` | raw hex bypasses Primer theming; tokens re-resolve in dark mode |
| `padding: 24px; border-radius: 12px` | `padding: var(--base-size-24); border-radius: var(--borderRadius-large)` | rem-based size/radius tokens scale and stay consistent across surfaces |
| `<TextInput />` with no wrapper | `<FormControl><FormControl.Label>…</FormControl.Label><TextInput /></FormControl>` | a bare input has no associated label and fails a11y |
| `import { Button } from '@primer/react/lib-esm/Button'` | `import { Button } from '@primer/react'` | internal deep paths are not public API and break on upgrade |
| `import { Blankslate } from '@primer/react'` | `import { Blankslate } from '@primer/react/experimental'` | experimental components ship only from the `/experimental` entrypoint |
| hand-rolled `<svg>` inside a Button | `leadingVisual={PlusIcon}` from `@primer/octicons-react` | octicons carry the a11y + sizing contract; raw SVG does not |
| manual spinner swapped into Button `children` | `<Button loading loadingAnnouncement="Saving…">` | `loading` coordinates disabled state + assistive-tech announcement |
| `<div style={{ display: 'flex', gap: 16 }}>` | `<Stack direction="horizontal" gap="condensed">` | raw flex/px gap skips the spacing-token scale |
