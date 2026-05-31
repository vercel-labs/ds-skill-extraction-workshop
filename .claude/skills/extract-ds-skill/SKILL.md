---
name: extract-ds-skill
description: |
  [VERIFY] PLACEHOLDER — this file must be replaced byte-identically with the
  canonical meta-skill artefact before the repo is shipped to workshop
  attendees. The canonical artefact lives at
  `~/Documents/Obsidian/Ship Talk/.claude/skills/extract-ds-skill/` on
  Diego's authoring machine. See Slice 1 acceptance criteria in
  `docs/prd-workshop-delivery.md` (companion repo).

  Do NOT edit this placeholder in-place. Replace the entire
  `.claude/skills/extract-ds-skill/` directory with the canonical version
  prior to workshop dry-runs (Slice 13) and the public repo flip.
---

# extract-ds-skill — placeholder

This directory is a structural placeholder shipped by Slice 1 so the
starter scaffold is committable. The real meta-skill is authored
separately and copied in verbatim.

**Replacement steps (HITL):**

1. `cp -R "$HOME/Documents/Obsidian/Ship Talk/.claude/skills/extract-ds-skill/" .claude/skills/extract-ds-skill/`
2. `git status` — confirm only files under `.claude/skills/extract-ds-skill/` changed.
3. `git diff --stat` — sanity-check the file count matches the canonical artefact.
4. Commit with message `chore: install canonical extract-ds-skill meta-skill`.

Until the replacement lands, `/extract-ds-skill` will not function. This is
intentional: the placeholder is a tripwire for the missing artefact during
Slice 13 dry-runs.
