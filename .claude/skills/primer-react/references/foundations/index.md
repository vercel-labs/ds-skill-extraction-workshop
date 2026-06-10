# Foundations

Foundation pages extracted from the DS docs site. One file per accepted+crawled URL; see references/foundation-extraction.md for the per-URL iteration contract.

- [colors](./colors.md) — How Primer's functional color tokens pair, invert across light/dark mode, and meet contrast minimums — use functional tokens (`bgColor-*`, `fgColor-*`, `borderColor-*`), never base scale tokens (`color-scale-*`) directly.
- [icons](./icons.md) — Octicons are decorative by default and require explicit ARIA wiring to become contentful; the `size` prop is named (`small`/`medium`/`large`), not raw pixels.
- [spacing-layout](./spacing-layout.md) — Named breakpoints (`--breakpoint-*`) and their pixel values, page width caps, and the content/pane padding scale that keep pages responsive and consistent.
- [responsive](./responsive.md) — Minimum touch-target sizing, the supported viewport floor, and the user-preference media features a Primer UI must honor.
- [typography](./typography.md) — Use typography weight/size tokens (`--text-*-weight`, `--text-*-size-*`) instead of raw numeric values, and keep semantic heading order intact when styling native text elements.
