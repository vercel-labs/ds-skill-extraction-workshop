# DS Skill Extraction Workshop — Starter

Starter repo for the SHIP London 2026 workshop *Transform your design system into agent skills.*

In 40 minutes you'll load a pre-extracted design-system skill, generate a high-fidelity Primer React UI with it, and check what came out. The companion site walks the same path with screenshots and timing: **<https://ds-skills.vercel.app>**.

## What you'll do

1. **Setup** — clone, install, launch Claude Code.
2. **Generate** — load the `primer-react` skill, run `prompts/pr-merged-switch-dark-mode.md`, ~13 minutes hands-off.
3. **Check your output** — read the agent's self-report, then do the eyes pass on the running app.

The `primer-react` skill ships **pre-extracted** in `.claude/skills/`. You don't build it during the workshop; you use it. The meta-skill that built it (`extract-ds-skill`) also ships — for taking home, not for running on stage. See [Advanced](#advanced--extract-your-own-skill) below.

## IP disclaimer

> Primer is GitHub's open-source design system used here for educational purposes; this workshop is not affiliated with GitHub.

## Prerequisites

- **Node.js 20+** — `node --version` should print `v20.x` or higher.
- **pnpm 10+** — install with `npm install -g pnpm` if you do not have it.
- **Claude Code** — install per the [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code/quickstart). Verify with `claude --version`.
- **Anthropic API key** — export `ANTHROPIC_API_KEY` in your shell, or let `claude` prompt you on first run.

## Setup

Work on `main`. Don't push — your clone is disposable.

```bash
# 1. Clone (you can fork first if you prefer)
git clone https://github.com/vercel-labs/ds-skill-extraction-workshop.git
cd ds-skill-extraction-workshop

# 2. Install — warms node_modules so generation doesn't stall
pnpm install

# 3. Confirm the skill is on disk
ls .claude/skills/        # → primer-react/  extract-ds-skill/

# 4. Verify the prompt file is in place
head -5 prompts/pr-merged-switch-dark-mode.md

# 5. Launch Claude Code, hands-off
claude --dangerously-skip-permissions
```

`--dangerously-skip-permissions` sounds scary but it's safe here: your clone is disposable, the prompt forbids commit/stage/push, and the task is a benign UI build. So the agent can run the whole thing without you babysitting it.

You're ready to generate when `claude` is running in your terminal and the skill directories are listed under `.claude/skills/`.

## Generate

In the open `claude` session, paste the one prompt:

```
/primer-react implement prompts/pr-merged-switch-dark-mode.md
```

Then eyes up — let it churn. About 13 minutes. No interventions, no follow-ups. The agent reads the prompt, loads the skill's references, builds the sequence, and checks it in both color modes before it finishes.

When the run lands, the agent starts the dev server itself. If it didn't, run `pnpm dev` in another terminal and open the printed URL.

## Check your output

The agent prints a self-report at the end of the run:

- **Citations** — every component it used, traced to source. Prop claims cite the installed package's type files (`node_modules/@primer/react/.../<Component>.d.ts:<line>`); composition lifts cite the reference project.
- **Unverified facts** — anything it could not back up ships as a literal `[VERIFY]` marker. Zero markers is the goal; a short list is honest; a missing list is a red flag.
- **Shell parity** — the page background paints from the design system's token, the `ThemeProvider` wraps the app correctly, and both color modes were checked.

Then do the eyes pass on the running app:

1. **Lock holds.** Tab to the merge button while checks are still running. It must not be actionable.
2. **Color-mode flip.** The whole page recolors — page background included, not just the card.
3. **Motion.** Checks land with a beat, the capsule flips Open → Merged. `prefers-reduced-motion` is honoured.
4. **Hierarchy reads at a glance** — title, capsule, counts, checks, merge box.
5. **Both flips happen.** Light↔dark AND Open→Merged. You should see both, not one.

A deeper deterministic check is available via `pnpm audit:craft` (verifies types, exports, and a headless render of the page).

## What ships in this repo

- `prompts/pr-merged-switch-dark-mode.md` — the workshop prompt.
- `.claude/skills/primer-react/` — pre-extracted design-system skill for Primer React.
- `.claude/skills/extract-ds-skill/` — the meta-skill that built it. Run this after the workshop on your own DS.
- `app/`, `components/` — where generation lands.
- `scripts/audit-craft.mjs` — the deterministic auditor; `pnpm audit:craft` runs it.

## Workshop links

- **Companion site:** <https://ds-skills.vercel.app>
- **Companion site source:** <https://github.com/vercel-labs/ship-2026-companion-site>

## Advanced — extract your own skill

After the workshop, point the meta-skill at your own design system. Pass the foundation docs URL(s) and the reference-project GitHub URL as free text — no labeled keywords:

```
/extract-ds-skill <foundation-root-url> <reference-project-github-url>
```

The skill crawls foundation docs depth-1, auto-detects the reference project's framework, and resolves the DS package from its `package.json`. Pass root URLs only; do not enumerate sub-pages or local `node_modules` paths.

The extraction runs in three labelled phases with a single human gate. Phase 1 and Phase 2 hard-stop at close so the context window stays clean — resume in a fresh `claude` session. The keyword names the *next* phase; the path points at the prior handoff:

```
/extract-ds-skill validate: .extract-ds-skill-scratch/handoffs/phase-1.md
/extract-ds-skill persist:  .extract-ds-skill-scratch/handoffs/phase-2.md
```

`validate:` → Phase 2. `persist:` → Phase 3. No parameter = Phase 1 from scratch.

**Launch flags.** Pin model + effort at shell; both override `settings.json`:

```bash
claude --model claude-opus-4-6 --effort medium
```

Effort: `low|medium|high|xhigh|max`. Mid-session: `/model <id>`, `/effort <level>`. `/fast` mid-session enables fast mode (Opus only — faster output, no model downgrade).

## License

MIT — see [LICENSE](./LICENSE).
