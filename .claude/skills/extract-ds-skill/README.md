# extract-ds-skill

A Claude Code meta-skill that extracts a project-specific design-system
skill from a real DS source (component code, tokens, docs). The full mechanics live in
[`SKILL.md`](./SKILL.md); this README exists so anyone landing on a
standalone copy of the meta-skill can hop one click to the rest of the
workshop materials.

## Workshop links

The starter repo and companion site that ship this meta-skill carry the
hands-on materials. Their canonical URLs change between workshop runs
and are listed inside the illustrative block below.

### Worked example — workshop deployment links (illustrative)

The repositories below were the canonical pair for the inaugural workshop
run, both hosted on the workshop's git host. Subsequent runs may re-host
either side; treat the block as a snapshot, not as a contract this README
enforces.

- **Starter repo** (this repo — the meta-skill is pre-installed under
  `.claude/skills/extract-ds-skill/`):
  `vercel-labs/ds-skill-extraction-workshop`
- **Companion site** (Overview, Hands-On, Reference, Resources, and
  Cultivate pages for the workshop):
  `vercel-labs/ship-2026-companion-site`

## How to use

From the starter repo root:

```bash
claude /extract-ds-skill ./ds
```

Phase 1 surfaces a discovery summary; Phase 2 generates a sign-in form
against the extracted skill; Phase 3 audits the generated code against
the headline rule. See the companion site's Hands-On page for the full
flow.
