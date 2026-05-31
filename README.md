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
   `extracted-skill/`.
2. **Phase 2 — Generation.** Use the prompt in `prompts/sign-in.md` to
   ask Claude Code to build a sign-in form using the components in `ds/`.
   The agent writes `app/sign-in.tsx`.
3. **Phase 3 — Audit.** Use the prompt in `prompts/audit.md` to audit
   `app/sign-in.tsx` against the extracted skill. The agent surfaces a
   PASS/FAIL per rule with `file:line` citations. Look for the headline
   `inactive` vs `disabled` violation.

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

## What ships in this repo

- `ds/` — the design system wrappers and `DESIGN.md` (populated in Slice
  2 by the workshop author).
- `app/` — empty until Phase 2 generates `app/sign-in.tsx`.
- `extracted-skill/` — empty until Phase 1 writes the extracted skill.
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
