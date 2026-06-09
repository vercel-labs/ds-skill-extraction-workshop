# Typography

## What this covers

- Type-scale tokens (h1-h6 + body + caption) and the canonical line-height pairing.

### token/heading-line-height-pairing

Pair heading type tokens with the matching line-height token; using `lh-tight` on body text fails legibility minimums.

**When it bites:** paragraphs rendered with heading line-heights read as cramped at long-form word counts.

| Bad | Good | Why |
|---|---|---|
| `type=body lh=tight` | `type=body lh=relaxed` | body text needs 1.5+ line-height for legibility |

Source: https://example-ds.test/foundations/typography#scale
