# Offline cargo — USB-stick contingency

This USB stick carries a self-contained snapshot of the DS Skill
Extraction Workshop so Block 5 can still run if venue Wi-Fi fails.

> **Important caveat — the Anthropic API still requires network
> connectivity.** This offline cargo covers the *path to the prompt*:
> the starter repo, its dependencies, and a static snapshot of the
> companion site. It does **not** cover the prompt itself — Claude Code
> still needs to reach the Anthropic API to respond. If the venue has
> no network at all, the workshop cannot run regardless of this
> contingency. Use this stick to recover from partial outages (Wi-Fi
> down but tethering possible, captive-portal failures, npm registry
> unreachable, etc.).

## What's on this stick

```
/                              ← USB root
├── README-OFFLINE.md          ← this file
├── ds-skill-extraction-workshop/
│   ├── .git/                  ← full git history; you can keep your copy
│   ├── node_modules/          ← warm install; skip `pnpm install`
│   ├── .claude/               ← pre-installed meta-skill
│   ├── ds/                    ← design-system content
│   ├── prompts/               ← Phase 2 + Phase 3 prompt fixtures
│   ├── app/                   ← initially empty; Phase 2 writes `app/issues.tsx`
│   │                            (Phase 1 creates `.claude/skills/ds/` at runtime)
│   └── package.json, README.md, ...
└── companion-site/            ← static HTML snapshot of the companion site
    └── index.html             ← open this in any browser
```

## What you need on your laptop before plugging in

- **Node.js 20+** — `node --version` should print `v20.x` or higher.
- **pnpm 10+** — `pnpm --version`. Install with `npm install -g pnpm`
  if missing.
- **Claude Code** — `claude --version`. Install from
  <https://claude.com/claude-code> if missing.
- **An Anthropic API key** — exported as `ANTHROPIC_API_KEY` or
  configured via Claude Code's first-run flow.

If any of these are missing and you're already offline, you cannot
proceed. The workshop facilitator may have spare offline installers on
a second stick; ask before troubleshooting.

## How to copy the project off the stick

You want the project to live on your laptop's filesystem, not on the
USB stick — running `pnpm`/`claude` against a removable drive is slow
and fragile.

### macOS / Linux

```bash
# 1. Plug the stick in. Find the mount point (commonly /Volumes/<NAME>
#    on macOS, /media/<user>/<NAME> on Linux).
ls /Volumes/                       # macOS
ls /media/$USER/                   # Linux

# 2. Copy the project to your home directory (or wherever you keep
#    code). Preserve symlinks and timestamps.
cp -R /Volumes/<STICK_NAME>/ds-skill-extraction-workshop ~/

# 3. Step into the copy and verify it's intact.
cd ~/ds-skill-extraction-workshop
ls -la .claude/skills/extract-ds-skill/   # should list SKILL.md
ls node_modules/.bin/next                  # should exist (warm install)
```

### Windows (PowerShell)

```powershell
# 1. Find the stick's drive letter (commonly D:, E:, F:).
Get-Volume

# 2. Copy the project to your user profile.
Copy-Item -Recurse "<DRIVE>:\ds-skill-extraction-workshop" "$HOME\ds-skill-extraction-workshop"

# 3. Step into the copy.
cd "$HOME\ds-skill-extraction-workshop"
```

## How to launch Claude Code

From inside the copied project directory:

```bash
# Skip `pnpm install` — node_modules/ is already warm on the stick.
# If you want to verify dependencies, run `pnpm install --offline`.

# Verify Claude Code can launch.
claude --version

# Launch the workshop session.
claude
```

If `claude` fails to start because of an API-key issue, the offline
cargo can't help — that's an Anthropic-side dependency. Follow Claude
Code's first-run flow once you have any network connectivity (even a
slow tether).

## Reading the companion site offline

The companion site provides the Overview, Hands-On, Reference,
Resources, and Cultivate pages for the workshop. A static HTML
snapshot ships in `companion-site/` on this stick.

```bash
# macOS — opens in your default browser.
open /Volumes/<STICK_NAME>/companion-site/index.html

# Linux.
xdg-open /media/$USER/<STICK_NAME>/companion-site/index.html

# Windows.
start "<DRIVE>:\companion-site\index.html"
```

The static snapshot has no server-side features and no live search,
but every page from the deployed companion site is reachable by
clicking through.

## What this stick does NOT do

- It does **not** bypass the Anthropic API's network requirement.
  Claude Code still needs to reach `api.anthropic.com` to respond.
- It does **not** provide an offline LLM. There is no local model
  fallback. If you cannot reach the API, you cannot run Phases 2
  and 3.
- It does **not** include a `git remote` you can push to. The `.git`
  directory ships with whatever remote was set at snapshot time; you
  can push your changes once you reconnect to the network.
- It does **not** update itself. If the upstream starter repo changes
  after this snapshot, your copy stays at the snapshot revision until
  you `git pull` on a network.

## Verifying the snapshot is current

Inside the copied project directory:

```bash
cat .git/refs/heads/main 2>/dev/null || cat .git/HEAD
```

Compare the resulting commit SHA against the latest commit on
<https://github.com/vercel-labs/ds-skill-extraction-workshop> when you
next have network access. If they match, you have the published
version. If they don't, `git pull` to bring your local copy up to
date.

## Troubleshooting

- **`pnpm` complains that `node_modules` is stale.** Run
  `pnpm install --offline` — pnpm's local cache plus the warm
  `node_modules/` on the stick should be enough to satisfy
  installation without hitting the registry.
- **`claude --version` fails.** Claude Code is not installed on your
  laptop. There is no offline installer on this stick; you'll need to
  install Claude Code from <https://claude.com/claude-code> when you
  reach a network.
- **`.claude/skills/extract-ds-skill/SKILL.md` says it's a
  placeholder.** Then this stick was prepared before the canonical
  meta-skill was installed. Flag this to the facilitator immediately —
  the workshop cannot run without the canonical meta-skill.

## Source

See Slice 14 acceptance criteria in starter issue #6.
