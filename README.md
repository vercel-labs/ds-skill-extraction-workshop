# DS Skill Extraction Workshop — Starter

A hands-on workshop starter for extracting a "design-system literacy" skill
from a real component library and using it to drive a multi-phase Claude
Code session.

## 60-second brief

You will spend three phases inside Claude Code:

1. **Phase 1 — Discovery.** Run the `extract-ds-skill` meta-skill against
   `ds/`. The agent reads the wrappers and `DESIGN.md`, surfaces a
   discovery summary, and pauses at a gate with `[VERIFY]` markers. You
   confirm or correct, then the agent writes the extracted skill into
   `.claude/skills/ds/` (created at runtime by the meta-skill).
2. **Phase 2 — Generation.** Use the prompt in `prompts/issues.md` to
   ask Claude Code to build a GitHub-style issues page using the
   components in `ds/`. The agent writes `app/issues.tsx`.
3. **Phase 3 — Audit.** Use the prompt in `prompts/audit.md` to audit
   `app/issues.tsx` against the extracted skill. The agent surfaces a
   PASS/FAIL per rule with `file:line` citations. Look for the headline
   `PageHeader` slot-composition violation.

You leave with the extracted skill artefact, the generated form, and a
PASS/FAIL audit — all reproducible on your own design system after the
workshop.

## IP disclaimer

> Primer is GitHub's open-source design system used here for educational
> purposes; this workshop is not affiliated with GitHub.

## Setup

You need:

- **Node.js 20+** — `node --version` should print `v20.x` or higher.
- **pnpm 10+** — install with `npm install -g pnpm` if you do not have it.
- **Claude Code** — install from <https://claude.com/claude-code>. Verify
  with `claude --version`.
- **An Anthropic API key** — set `ANTHROPIC_API_KEY` in your shell, or
  follow Claude Code's first-run flow.

Setup steps (mirror the companion site's Setup page):

```bash
# 1. Clone the starter
git clone https://github.com/vercel-labs/ds-skill-extraction-workshop.git
cd ds-skill-extraction-workshop

# 2. Install dependencies
pnpm install

# 3. Verify Claude Code is available inside the project
claude --version

# 4. Launch Claude Code
claude
```

If `pnpm install` finishes without errors and `claude --version` prints a
version string, you are ready for Block 5.

## Running

**Launch flags.** Pin model + effort at shell; both override `settings.json`:

```bash
claude --model claude-opus-4-6 --effort medium
```

Effort: `low|medium|high|xhigh|max`. Mid-session: `/model <id>`, `/effort <level>`.

**Fast mode.** No launch flag. `/fast` mid-session, or `"fastMode": true` in `.claude/settings.json`. Opus-only (4.6/4.7/4.8) — faster output, no model downgrade.

**Resume between phases.** Phase 1 + 2 hard-stop at close. Resume in a fresh session — keyword names the *next* phase, path points at the prior handoff:

```
/extract-ds-skill validate: .extract-ds-skill-scratch/handoffs/phase-1.md
/extract-ds-skill persist:  .extract-ds-skill-scratch/handoffs/phase-2.md
```

`validate:` → Phase 2. `persist:` → Phase 3. No parameter = Phase 1 from scratch (no auto-pickup). Override hard-stop with `continue inline` to stay in one session.

## What ships in this repo

- `ds/` — the design system wrappers and `DESIGN.md` (populated in Slice
  2 by the workshop author).
- `app/` — empty until Phase 2 generates `app/issues.tsx`.
- `.claude/skills/ds/` — created by Phase 1 when the meta-skill persists the extracted skill.
- `prompts/` — the Phase 2 and Phase 3 prompt fixtures (added in Slices 3
  and 4).
- `.claude/skills/extract-ds-skill/` — the pre-installed meta-skill that
  powers Phase 1.

## Workshop links

- **Companion site:** the workshop companion site with Overview,
  Hands-On, Reference, Resources, and Cultivate pages —
  source at <https://github.com/vercel-labs/ship-2026-companion-site>
  (the deployed URL will be added once the companion ships).
- **Meta-skill:** the `extract-ds-skill` skill that powers Phase 1 lives
  at [`.claude/skills/extract-ds-skill/`](./.claude/skills/extract-ds-skill/)
  inside this repo. After the workshop it will be published standalone
  for reuse.

## License

MIT — see [LICENSE](./LICENSE).
