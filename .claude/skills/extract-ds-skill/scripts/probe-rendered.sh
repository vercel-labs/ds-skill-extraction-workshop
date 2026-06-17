#!/usr/bin/env bash
# scripts/probe-rendered.sh — opt-in rendered-site probe. Four modes, one
# script (the probe family shares this entry point; no parallel pipelines):
#
#   DIFF MODE (default)       Phase 2 of the meta-skill. Renders the DS's
#                             public docs site headless (playwright +
#                             chromium) and diffs the COMPUTED CSS
#                             custom-property values against the DECLARED
#                             token values Phase 2 extracted from source.
#   SCREENSHOT MODE           The consuming audit skill. Captures side-by-side
#   (--screenshot)            PNG EVIDENCE of a produced component page vs the
#                             DS docs example, tagged [needs-human-review].
#                             Evidence only — the probe never grades it.
#   INVENTORY MODE            Phase 1 of the meta-skill. Enumerates the fonts
#   (--inventory)             and icons ACTUALLY LOADED by the rendered docs
#                             page and writes a compact JSON manifest. Ground
#                             truth for the discovery summary's `Assets
#                             detected:` line ("package exports 800 icons but
#                             the docs render 40"). Additive context, never a
#                             gate — a skip or failure leaves Phase 1 on its
#                             source-only path.
#   RECOVER MODE              Phase 2 FALLBACK for source-blocked DSes ONLY.
#   (--recover)               When token-class source extraction returned
#                             [private-blocker] (the DS ships only compiled
#                             CSS — no readable token source), renders the
#                             docs page and recovers what token values it can
#                             (color, font, spacing) into a manifest whose
#                             every row carries the [probe-derived]
#                             provenance tag in place of a file:line cite, so
#                             Phase 2 continues instead of stalling.
#                             SECOND-CLASS: probe-derived tokens never
#                             replace source-cited tokens; on conflict the
#                             source wins and the caller logs the conflict.
#                             Never widen this mode to DSes whose token
#                             source is readable — it is a fallback, not a
#                             default.
#
# ROLE — ANNOTATE, NEVER OVERRIDE. Source extraction stays authoritative.
# In diff mode every MISMATCH / UNRESOLVED row is emitted as a ready-made
# `[VERIFY: ...]` line for the same Phase 2 stream the rest of validation
# feeds. A mismatch is a finding, not a probe failure: the script exits 0 on
# a completed run regardless of verdicts.
#
# OPT-IN CONTRACT (enforced by the caller — Phase 2 of the meta-skill in diff
# and recover modes; the consuming audit skill in screenshot mode; Phase 1 of
# the meta-skill in inventory mode): run only when (a) the DS has a public
# docs URL accepted in Phase 1, and (b) the user has not opted out (opt-out
# phrase: "skip rendered probe"). Default for CI and tests is skip. Recover
# mode carries a THIRD precondition: token-class source extraction returned
# [private-blocker] — the mode never runs against a DS with readable token
# source.
#
# USAGE — diff mode
#   bash probe-rendered.sh --url <docs-url> --manifest <path> \
#       [--out <report-file>] [--timeout-ms <n=30000>]
#
# USAGE — screenshot mode (audit phase)
#   bash probe-rendered.sh --screenshot --component <Name> \
#       --url <docs-example-url> --produced-url <produced-page-url> \
#       --out-dir <dir> [--docs-selector <css>] [--produced-selector <css>] \
#       [--out <report-file>] [--timeout-ms <n=30000>]
#
# USAGE — inventory mode (Phase 1 discovery)
#   bash probe-rendered.sh --inventory --url <docs-url> --out-json <path> \
#       [--out <report-file>] [--timeout-ms <n=30000>]
#
# USAGE — recover mode (Phase 2 fallback, source-blocked DSes only)
#   bash probe-rendered.sh --recover --url <docs-url> --out-manifest <path> \
#       [--selector <css=html>] [--out <report-file>] [--timeout-ms <n=30000>]
#
# BROWSER PRECONDITION. playwright must be installed as a (dev)dependency of
# the consumer project — it is resolved from the CWD, so run the script from
# the project root. Browser binaries are NEVER installed by this script
# (network-heavy and wrong-platform inside a sandbox). Install on the HOST,
# once, with:
#
#     npx playwright install chromium
#
# Inside a sandbox without browser binaries the script detects the gap and
# degrades gracefully (exit 0) so the extraction run never burns on setup.
#
# SKIP / FAILURE CONTRACT (greppable, one line each; both modes):
#   PROBE_SKIPPED=no-docs-url            no --url given — the DS had no
#                                        accepted public docs URL (exit 0)
#   PROBE_SKIPPED=browsers-unavailable   node, playwright, or the chromium
#                                        binary is missing (exit 0)
#   MANIFEST_ERROR=<file>:<line> ...     malformed manifest row (exit 2,
#                                        diff mode)
#   PROBE_FAILED=navigation ...          a target page did not load (exit 1 —
#                                        the caller logs one line and
#                                        continues; never a blocker). In
#                                        screenshot mode the line carries
#                                        target=docs|produced.
#
# In inventory mode every skip/failure line above means Phase 1 renders the
# `Assets detected:` line from source-derived counts only, with a one-phrase
# skip note — the probe is additive context, never a discovery gate.
#
# In recover mode every skip/failure line above means Phase 2 proceeds with
# the [private-blocker] gap recorded as-is (the pre-fallback behavior, which
# stays correct as the default); no manifest is written on a failure.
#
# MANIFEST FORMAT (--manifest, diff mode) — one token per line,
# pipe-delimited:
#
#   <token-name> | <declared-value> | <source-cite file:line> [| <css-selector>]
#
# `#` comments and blank lines are skipped. <token-name> must be a CSS custom
# property (leading `--`). <css-selector> defaults to `html` (the element the
# computed value is read from). Values containing a literal `|` are not
# supported. Illustrative row:
#
#   --color-accent | #0070f3 | node_modules/@acme/ui/dist/css/light.css:12 | html
#
# OUTPUT — diff mode (stdout; duplicated to --out when given):
#   PROBE_DIFF token=<t> declared='<v>' computed='<v>' verdict=MATCH|MISMATCH|UNRESOLVED source=<file:line> url=<url> selector=<sel>
#   [VERIFY: rendered-probe ...]        one per MISMATCH / UNRESOLVED row
#   PROBE_RESULT=checked:<n> match:<n> mismatch:<n> unresolved:<n>
#
# OUTPUT — screenshot mode (stdout; duplicated to --out when given). Writes
# <out-dir>/<component-slug>--docs.png and
# <out-dir>/<component-slug>--produced.png, then emits ONE audit entry line
# naming both files and both sources:
#
#   PROBE_SCREENSHOT=captured component=<Name> docs-png=<path> produced-png=<path> docs-url=<url> produced-url=<url> [needs-human-review]
#
# SCREENSHOT DISCIPLINE — EVIDENCE, NEVER VERDICT. The probe never emits a
# visual claim: no pass/fail, no similarity score, no pixel-diff verdict.
# Visual DS-contract claims (color saturation, disabled palette, contrast,
# dark-mode legibility) are NEVER asserted from screenshot inference alone —
# the human reviewer produces the claims; the [needs-human-review] tag
# travels verbatim into the consuming audit's output. Selectors are
# optional; when given, the capture clips to the first match and falls back
# to a full-page capture (with a PROBE_SCREENSHOT_NOTE line) when the
# selector resolves nothing. The produced-page URL must already be serving —
# the probe never starts servers.
#
# OUTPUT — inventory mode (stdout; duplicated to --out when given). Writes
# the JSON manifest to --out-json (directories created as needed), then
# emits ONE summary line:
#
#   PROBE_INVENTORY=captured fonts=<n> icons=<n> json=<path> url=<url>
#
# Manifest shape (deterministic key order, sorted entries):
#
#   {
#     "url": "<docs-url>",
#     "fonts": ["<family>", ...],                 // FontFaceSet entries with
#                                                 // status "loaded" — webfonts
#                                                 // the page actually fetched
#     "icons": [{"id": "<identifier>", "kind": "sprite|labeled|class|file|hash", "count": <n>}, ...],
#     "counts": { "fonts": <n>, "icons": <n> }
#   }
#
# Icon identifiers are best-effort, in priority order: SVG sprite fragment
# (<use href="#name">), aria-label / data-testid, an icon-ish class token,
# the basename of an <img src="*.svg">, else a content hash of the inline
# markup (id "svg-<hex>", kind "hash"). The inventory reads ONE page load —
# heavily lazy-loaded catalogs undercount, which is why the discovery line
# tags these numbers [probe-derived] instead of treating them as the export
# surface. Counts, not enumeration: Phase 1 renders one summary line from
# this manifest, never the icon list itself.
#
# OUTPUT — recover mode (stdout; duplicated to --out when given). Writes the
# probe-derived token manifest to --out-manifest (directories created as
# needed; nothing is written on a navigation failure), then emits ONE
# summary line:
#
#   PROBE_RECOVER=captured tokens=<n> custom-props=<n> base=<n> manifest=<path> url=<url>
#
# Manifest rows are pipe-delimited like the diff-mode manifest, with the
# source-cite slot REPLACED by the [probe-derived] provenance tag — no
# file:line cite exists for a source-blocked DS, and the tag says so:
#
#   <token> | <computed-value> | [probe-derived] | <selector>
#
# Two row families, deterministic order (custom properties sorted by name,
# then the fixed-order --probe-* base rows):
#   - CSS custom properties the rendered page defines at --selector (default
#     html), filtered to the recoverable token classes: color, length, font.
#     Semantic names survive ONLY when the compiled CSS still ships custom
#     properties; everything outside the three classes is skipped and counted
#     in PROBE_RECOVER_NOTE=skipped-other:<n>.
#   - synthetic --probe-* base rows (body color/background/font-family, root
#     font-size, link color, heading font-family) — recovered VALUES with NO
#     semantic names. This loss is permanent for a source-blocked DS; the
#     produced skill documents it next to the recovered tokens.
# Cross-origin stylesheets cannot be read from the page; when any are
# skipped the run emits PROBE_RECOVER_NOTE=cross-origin-stylesheets-skipped:<n>.
# Values are computed CSS from ONE page load in ONE rendered mode — a floor,
# not the token surface.
#
# RECOVER DISCIPLINE — FALLBACK, NEVER A DEFAULT. The mode exists only for
# the [private-blocker] token case. Probe-derived tokens are second-class:
# they never replace a source-cited token; when both exist and conflict,
# source wins and the caller logs the conflict (never silences it). Widening
# the mode to non-blocked DSes breaks the source-first, citation-first
# contract this skill is built on.
#
# TOKEN CLASSES (diff mode). In scope: color tokens, font-family tokens, and
# base spacing/size tokens (length values). Declared and computed values are
# canonicalized in-browser before compare (hex -> rgb(), rem -> px, quote and
# whitespace normalization for font stacks), so notation differences are not
# mismatches. OUT OF SCOPE: shadow tokens, gradients, transition/animation
# values, breakpoint tokens, and every color mode other than the one the docs
# page actually renders — the probe reads exactly one rendered mode per run.
#
# READ-ONLY. Navigation only (GET); non-GET requests are aborted; no auth,
# no form interaction, no clicks.
#
# TEST HOOK. PROBE_RENDERED_BROWSERS=absent forces the browsers-unavailable
# skip path deterministically (used by scripts/tests/run-tests.sh so the
# suite never launches a real browser).

set -uo pipefail

URL=""
MANIFEST=""
OUT=""
TIMEOUT_MS="30000"
SCREENSHOT=0
COMPONENT=""
PRODUCED_URL=""
OUT_DIR=""
DOCS_SELECTOR=""
PRODUCED_SELECTOR=""
INVENTORY=0
OUT_JSON=""
RECOVER=0
OUT_MANIFEST=""
SELECTOR="html"

usage_error() {
  echo "$1" >&2
  echo "usage (diff):       probe-rendered.sh --url <docs-url> --manifest <path> [--out <file>] [--timeout-ms <n>]" >&2
  echo "usage (screenshot): probe-rendered.sh --screenshot --component <Name> --url <docs-example-url> --produced-url <url> --out-dir <dir> [--docs-selector <css>] [--produced-selector <css>] [--out <file>] [--timeout-ms <n>]" >&2
  echo "usage (inventory):  probe-rendered.sh --inventory --url <docs-url> --out-json <path> [--out <file>] [--timeout-ms <n>]" >&2
  echo "usage (recover):    probe-rendered.sh --recover --url <docs-url> --out-manifest <path> [--selector <css>] [--out <file>] [--timeout-ms <n>]" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)               URL="${2:-}"; shift 2 ;;
    --manifest)          MANIFEST="${2:-}"; shift 2 ;;
    --out)               OUT="${2:-}"; shift 2 ;;
    --timeout-ms)        TIMEOUT_MS="${2:-}"; shift 2 ;;
    --screenshot)        SCREENSHOT=1; shift ;;
    --component)         COMPONENT="${2:-}"; shift 2 ;;
    --produced-url)      PRODUCED_URL="${2:-}"; shift 2 ;;
    --out-dir)           OUT_DIR="${2:-}"; shift 2 ;;
    --docs-selector)     DOCS_SELECTOR="${2:-}"; shift 2 ;;
    --produced-selector) PRODUCED_SELECTOR="${2:-}"; shift 2 ;;
    --inventory)         INVENTORY=1; shift ;;
    --out-json)          OUT_JSON="${2:-}"; shift 2 ;;
    --recover)           RECOVER=1; shift ;;
    --out-manifest)      OUT_MANIFEST="${2:-}"; shift 2 ;;
    --selector)          SELECTOR="${2:-}"; shift 2 ;;
    *) usage_error "error: unknown argument: $1" ;;
  esac
done

# Contradictory mode flags are a caller bug — loud, before any skip path.
if [[ "$SCREENSHOT" -eq 1 && "$INVENTORY" -eq 1 ]]; then
  usage_error "error: --screenshot and --inventory are mutually exclusive"
fi
if [[ "$RECOVER" -eq 1 && "$SCREENSHOT" -eq 1 ]]; then
  usage_error "error: --recover and --screenshot are mutually exclusive"
fi
if [[ "$RECOVER" -eq 1 && "$INVENTORY" -eq 1 ]]; then
  usage_error "error: --recover and --inventory are mutually exclusive"
fi

# 1. No accepted docs URL -> clean skip (both modes). This is the documented
#    behavior for DSes without a public docs site, not an error.
if [[ -z "$URL" ]]; then
  echo "PROBE_SKIPPED=no-docs-url"
  exit 0
fi

# 2. Browser availability detection (shared). Never installs anything — see
#    the BROWSER PRECONDITION block in the header for the host-side command.
skip_browsers() {
  echo "PROBE_SKIPPED=browsers-unavailable"
  echo "# install the browser on the HOST (never inside a sandbox): npx playwright install chromium"
  exit 0
}

check_browsers() {
  [[ "${PROBE_RENDERED_BROWSERS:-}" == "absent" ]] && skip_browsers
  command -v node >/dev/null 2>&1 || skip_browsers
  node -e "require.resolve('playwright')" >/dev/null 2>&1 || skip_browsers
}

# tee the given runner function to --out when set, preserving its exit code.
run_with_out() {
  if [[ -n "$OUT" ]]; then
    "$1" | tee "$OUT"
    exit "${PIPESTATUS[0]}"
  else
    "$1"
  fi
}

# ---------------------------------------------------------------------------
# SCREENSHOT MODE — audit-phase evidence capture. Argument validation runs
# BEFORE browser detection so usage bugs surface loudly even in browserless
# sandboxes.
# ---------------------------------------------------------------------------
run_screenshot() {
  PROBE_COMPONENT="$COMPONENT" PROBE_SLUG="$SLUG" PROBE_OUT_DIR="$OUT_DIR" \
  PROBE_DOCS_URL="$URL" PROBE_PRODUCED_URL="$PRODUCED_URL" \
  PROBE_DOCS_SELECTOR="$DOCS_SELECTOR" PROBE_PRODUCED_SELECTOR="$PRODUCED_SELECTOR" \
  PROBE_TIMEOUT_MS="$TIMEOUT_MS" node - <<'NODE_SCREENSHOT'
const path = require('path');
const { chromium } = require('playwright');

const component = process.env.PROBE_COMPONENT;
const slug = process.env.PROBE_SLUG;
const outDir = process.env.PROBE_OUT_DIR;
const timeoutMs = parseInt(process.env.PROBE_TIMEOUT_MS || '30000', 10);
const targets = [
  { name: 'docs', url: process.env.PROBE_DOCS_URL, selector: process.env.PROBE_DOCS_SELECTOR || '' },
  { name: 'produced', url: process.env.PROBE_PRODUCED_URL, selector: process.env.PROBE_PRODUCED_SELECTOR || '' },
];

const firstLine = (err) => String((err && err.message) || err).split('\n')[0];

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (/Executable doesn't exist|playwright install|Failed to launch/i.test(String(err))) {
      console.log('PROBE_SKIPPED=browsers-unavailable');
      console.log('# install the browser on the HOST (never inside a sandbox): npx playwright install chromium');
      process.exit(0);
    }
    throw err;
  }

  let exitCode = 0;
  const captured = {};
  try {
    const page = await browser.newPage();
    // Read-only guarantee: navigation and subresources are GETs; abort
    // anything else (beacons, analytics POSTs, form submits).
    await page.route('**/*', (route) =>
      route.request().method() === 'GET' ? route.continue() : route.abort()
    );
    for (const t of targets) {
      try {
        await page.goto(t.url, { waitUntil: 'load', timeout: timeoutMs });
      } catch (err) {
        console.log(`PROBE_FAILED=navigation target=${t.name} url=${t.url} error=${firstLine(err)}`);
        exitCode = 1;
        continue;
      }
      const png = path.join(outDir, `${slug}--${t.name}.png`);
      let clipped = false;
      if (t.selector) {
        try {
          const loc = page.locator(t.selector).first();
          if ((await loc.count()) > 0) {
            await loc.screenshot({ path: png, timeout: timeoutMs });
            clipped = true;
          } else {
            console.log(
              `PROBE_SCREENSHOT_NOTE=selector-not-found target=${t.name} selector='${t.selector}' — captured full page instead`
            );
          }
        } catch (err) {
          console.log(
            `PROBE_SCREENSHOT_NOTE=selector-capture-failed target=${t.name} selector='${t.selector}' error=${firstLine(err)} — captured full page instead`
          );
        }
      }
      if (!clipped) {
        await page.screenshot({ path: png, fullPage: true });
      }
      captured[t.name] = png;
      console.log(`PROBE_SCREENSHOT_TARGET=${t.name} png=${png} url=${t.url}`);
    }
    if (captured.docs && captured.produced) {
      // The ONE audit entry line. Evidence only — no verdict, no score, no
      // visual claim; the [needs-human-review] tag travels verbatim.
      console.log(
        `PROBE_SCREENSHOT=captured component=${component} docs-png=${captured.docs} produced-png=${captured.produced} docs-url=${targets[0].url} produced-url=${targets[1].url} [needs-human-review]`
      );
      console.log('# evidence for the human reviewer — the probe asserts nothing about visual fidelity');
    }
  } catch (err) {
    console.log(`PROBE_FAILED=internal error=${firstLine(err)}`);
    exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
})();
NODE_SCREENSHOT
}

if [[ "$SCREENSHOT" -eq 1 ]]; then
  [[ -n "$COMPONENT" ]] || usage_error "error: --component is required in screenshot mode"
  [[ -n "$PRODUCED_URL" ]] || usage_error "error: --produced-url is required in screenshot mode"
  [[ -n "$OUT_DIR" ]] || usage_error "error: --out-dir is required in screenshot mode"
  check_browsers
  mkdir -p "$OUT_DIR"
  SLUG="$(printf '%s' "$COMPONENT" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]+/-/g')"
  run_with_out run_screenshot
  exit $?
fi

# ---------------------------------------------------------------------------
# INVENTORY MODE — Phase 1 ground-truth asset enumeration. Argument
# validation runs BEFORE browser detection so usage bugs surface loudly even
# in browserless sandboxes.
# ---------------------------------------------------------------------------
run_inventory() {
  PROBE_URL="$URL" PROBE_OUT_JSON="$OUT_JSON" PROBE_TIMEOUT_MS="$TIMEOUT_MS" node - <<'NODE_INVENTORY'
const fs = require('fs');
const { chromium } = require('playwright');

const url = process.env.PROBE_URL;
const outJson = process.env.PROBE_OUT_JSON;
const timeoutMs = parseInt(process.env.PROBE_TIMEOUT_MS || '30000', 10);

const firstLine = (err) => String((err && err.message) || err).split('\n')[0];

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (/Executable doesn't exist|playwright install|Failed to launch/i.test(String(err))) {
      console.log('PROBE_SKIPPED=browsers-unavailable');
      console.log('# install the browser on the HOST (never inside a sandbox): npx playwright install chromium');
      process.exit(0);
    }
    throw err;
  }

  let exitCode = 0;
  try {
    const page = await browser.newPage();
    // Read-only guarantee: navigation and subresources are GETs; abort
    // anything else (beacons, analytics POSTs, form submits).
    await page.route('**/*', (route) =>
      route.request().method() === 'GET' ? route.continue() : route.abort()
    );
    try {
      await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    } catch (err) {
      console.log(`PROBE_FAILED=navigation url=${url} error=${firstLine(err)}`);
      exitCode = 1;
    }

    if (exitCode === 0) {
      const inv = await page.evaluate(async () => {
        // Fonts: FontFaceSet entries with status "loaded" — webfonts the page
        // actually fetched. System-stack fallbacks never appear here, which
        // is the point: the inventory reports what loaded, not what CSS asks
        // for. Wait for in-flight loads so lazy @font-face rules count.
        await document.fonts.ready;
        const fonts = new Set();
        document.fonts.forEach((f) => {
          if (f.status === 'loaded') fonts.add(String(f.family).replace(/^["']|["']$/g, ''));
        });

        // Icons: best-effort identifiers, priority order documented in the
        // script header. The hash fallback (djb2 over whitespace-normalized
        // markup) keeps anonymous inline SVGs dedup-able without naming them.
        const icons = new Map();
        const add = (id, kind) => {
          const key = `${kind}:${id}`;
          icons.set(key, (icons.get(key) || 0) + 1);
        };
        document.querySelectorAll('svg').forEach((svg) => {
          const use = svg.querySelector('use');
          const href = use && (use.getAttribute('href') || use.getAttribute('xlink:href'));
          if (href && href.includes('#')) return add(href.slice(href.indexOf('#') + 1), 'sprite');
          const label = svg.getAttribute('aria-label') || svg.getAttribute('data-testid');
          if (label) return add(label, 'labeled');
          const cls = (svg.getAttribute('class') || '')
            .split(/\s+/)
            .find((c) => /icon/i.test(c));
          if (cls) return add(cls, 'class');
          let h = 5381;
          const s = svg.outerHTML.replace(/\s+/g, ' ');
          for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
          add(`svg-${h.toString(16)}`, 'hash');
        });
        document.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || '';
          if (!/\.svg(\?|#|$)/i.test(src)) return;
          add(src.split('/').pop().split(/[?#]/)[0], 'file');
        });

        return {
          fonts: [...fonts].sort(),
          icons: [...icons.entries()]
            .map(([key, count]) => {
              // ids may contain the separator (aria-labels are free text) —
              // split on the FIRST ':' only; kind is a fixed enum.
              const cut = key.indexOf(':');
              return { id: key.slice(cut + 1), kind: key.slice(0, cut), count };
            })
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
        };
      });

      const manifest = {
        url,
        fonts: inv.fonts,
        icons: inv.icons,
        counts: { fonts: inv.fonts.length, icons: inv.icons.length },
      };
      fs.mkdirSync(require('path').dirname(outJson), { recursive: true });
      fs.writeFileSync(outJson, JSON.stringify(manifest, null, 2) + '\n');
      console.log(
        `PROBE_INVENTORY=captured fonts=${manifest.counts.fonts} icons=${manifest.counts.icons} json=${outJson} url=${url}`
      );
    }
  } catch (err) {
    console.log(`PROBE_FAILED=internal error=${firstLine(err)}`);
    exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
})();
NODE_INVENTORY
}

if [[ "$INVENTORY" -eq 1 ]]; then
  [[ -n "$OUT_JSON" ]] || usage_error "error: --out-json is required in inventory mode"
  check_browsers
  run_with_out run_inventory
  exit $?
fi

# ---------------------------------------------------------------------------
# RECOVER MODE — Phase 2 fallback token recovery for source-blocked DSes.
# Argument validation runs BEFORE browser detection so usage bugs surface
# loudly even in browserless sandboxes.
# ---------------------------------------------------------------------------
run_recover() {
  PROBE_URL="$URL" PROBE_OUT_MANIFEST="$OUT_MANIFEST" PROBE_SELECTOR="$SELECTOR" \
  PROBE_TIMEOUT_MS="$TIMEOUT_MS" node - <<'NODE_RECOVER'
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const url = process.env.PROBE_URL;
const outManifest = process.env.PROBE_OUT_MANIFEST;
const selector = process.env.PROBE_SELECTOR || 'html';
const timeoutMs = parseInt(process.env.PROBE_TIMEOUT_MS || '30000', 10);

const firstLine = (err) => String((err && err.message) || err).split('\n')[0];

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (/Executable doesn't exist|playwright install|Failed to launch/i.test(String(err))) {
      console.log('PROBE_SKIPPED=browsers-unavailable');
      console.log('# install the browser on the HOST (never inside a sandbox): npx playwright install chromium');
      process.exit(0);
    }
    throw err;
  }

  let exitCode = 0;
  try {
    const page = await browser.newPage();
    // Read-only guarantee: navigation and subresources are GETs; abort
    // anything else (beacons, analytics POSTs, form submits).
    await page.route('**/*', (route) =>
      route.request().method() === 'GET' ? route.continue() : route.abort()
    );
    try {
      await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    } catch (err) {
      console.log(`PROBE_FAILED=navigation url=${url} error=${firstLine(err)}`);
      exitCode = 1;
    }

    if (exitCode === 0) {
      const rec = await page.evaluate((sel) => {
        const rootEl = document.querySelector(sel) || document.documentElement;
        const cs = getComputedStyle(rootEl);

        // Candidate custom-property names: computed-style iteration
        // (Chromium exposes custom properties there) PLUS a same-origin
        // stylesheet walk for properties the iteration misses. Cross-origin
        // sheets throw on cssRules access — counted, never fatal.
        const names = new Set();
        for (let i = 0; i < cs.length; i++) {
          if (cs[i].startsWith('--')) names.add(cs[i]);
        }
        let crossOriginSkipped = 0;
        const walk = (rules) => {
          for (const r of rules) {
            if (r.style) {
              for (let i = 0; i < r.style.length; i++) {
                if (r.style[i].startsWith('--')) names.add(r.style[i]);
              }
            }
            if (r.cssRules) walk(r.cssRules);
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            walk(sheet.cssRules);
          } catch (e) {
            crossOriginSkipped += 1;
          }
        }

        // Classifier — same probe-div trick as diff mode. Recoverable
        // classes only: color, length, font. Everything else (shadows,
        // gradients, transitions, breakpoints, free text) is skipped.
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        document.documentElement.appendChild(probe);
        const classify = (name, value) => {
          probe.style.color = '';
          probe.style.color = value;
          if (probe.style.color !== '') return 'color';
          probe.style.width = '';
          probe.style.width = value;
          if (probe.style.width !== '') return 'length';
          if (/font/i.test(name) || /\b(serif|sans-serif|monospace|system-ui)\b/i.test(value)) return 'font';
          return 'other';
        };

        const customProps = [];
        let skippedOther = 0;
        for (const name of [...names].sort()) {
          const value = cs.getPropertyValue(name).trim();
          if (value === '') continue; // unset at the read element
          // The pipe-delimited manifest cannot carry a literal '|'.
          if (value.includes('|') || classify(name, value) === 'other') {
            skippedOther += 1;
            continue;
          }
          customProps.push({ token: name, value });
        }

        // Synthetic --probe-* base rows: recovered VALUES with NO semantic
        // names — the loss the produced skill documents. Fixed order.
        const base = [];
        const push = (token, el, prop) => {
          if (!el) return;
          const v = String(getComputedStyle(el)[prop] || '').trim();
          if (v === '' || v.includes('|')) return;
          const elSel = el === document.documentElement ? 'html' : (el.tagName || '').toLowerCase();
          base.push({ token, value: v, selector: elSel });
        };
        push('--probe-body-color', document.body, 'color');
        push('--probe-body-background', document.body, 'backgroundColor');
        push('--probe-body-font-family', document.body, 'fontFamily');
        push('--probe-root-font-size', document.documentElement, 'fontSize');
        push('--probe-link-color', document.querySelector('a[href]'), 'color');
        push('--probe-heading-font-family', document.querySelector('h1, h2, h3'), 'fontFamily');

        return { customProps, base, skippedOther, crossOriginSkipped };
      }, selector);

      const lines = [];
      lines.push('# PROBE-DERIVED TOKEN MANIFEST — recovered from the rendered docs page.');
      lines.push('# NOT source-cited: provenance is [probe-derived] (no file:line exists — the');
      lines.push('# token source was [private-blocker]). Values are computed CSS from ONE page');
      lines.push('# load in ONE rendered mode. SECOND-CLASS: never replaces a source-cited');
      lines.push('# token; on conflict, source wins and the conflict is logged.');
      lines.push(`# url: ${url}`);
      lines.push('# <token> | <computed-value> | [probe-derived] | <selector>');
      for (const r of rec.customProps) {
        lines.push(`${r.token} | ${r.value} | [probe-derived] | ${selector}`);
      }
      for (const r of rec.base) {
        lines.push(`${r.token} | ${r.value} | [probe-derived] | ${r.selector}`);
      }
      fs.mkdirSync(path.dirname(outManifest), { recursive: true });
      fs.writeFileSync(outManifest, lines.join('\n') + '\n');
      if (rec.crossOriginSkipped > 0) {
        console.log(`PROBE_RECOVER_NOTE=cross-origin-stylesheets-skipped:${rec.crossOriginSkipped}`);
      }
      if (rec.skippedOther > 0) {
        console.log(`PROBE_RECOVER_NOTE=skipped-other:${rec.skippedOther}`);
      }
      console.log(
        `PROBE_RECOVER=captured tokens=${rec.customProps.length + rec.base.length} custom-props=${rec.customProps.length} base=${rec.base.length} manifest=${outManifest} url=${url}`
      );
    }
  } catch (err) {
    console.log(`PROBE_FAILED=internal error=${firstLine(err)}`);
    exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
})();
NODE_RECOVER
}

if [[ "$RECOVER" -eq 1 ]]; then
  [[ -n "$OUT_MANIFEST" ]] || usage_error "error: --out-manifest is required in recover mode"
  check_browsers
  run_with_out run_recover
  exit $?
fi

# ---------------------------------------------------------------------------
# DIFF MODE — Phase 2 computed-vs-declared token cross-check.
# ---------------------------------------------------------------------------
[[ -n "$MANIFEST" ]] || usage_error "error: --manifest is required"
if [[ ! -f "$MANIFEST" ]]; then
  echo "MANIFEST_ERROR=$MANIFEST: file not found"
  exit 2
fi

# 3. Parse + validate the manifest BEFORE browser detection, so manifest
#    bugs surface loudly even in sandboxes without browser binaries.
TSV="$(mktemp)"
trap 'rm -f "$TSV"' EXIT

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

LINENO_M=0
ENTRIES=0
MANIFEST_BAD=0
while IFS= read -r line || [[ -n "$line" ]]; do
  LINENO_M=$((LINENO_M + 1))
  stripped="$(trim "$line")"
  [[ -z "$stripped" || "$stripped" == \#* ]] && continue
  IFS='|' read -r f1 f2 f3 f4 extra <<<"$line"
  token="$(trim "${f1:-}")"
  declared="$(trim "${f2:-}")"
  source_cite="$(trim "${f3:-}")"
  selector="$(trim "${f4:-}")"
  [[ -z "$selector" ]] && selector="html"
  if [[ -n "$(trim "${extra:-}")" ]]; then
    echo "MANIFEST_ERROR=$MANIFEST:$LINENO_M too many fields (values containing '|' are not supported)"
    MANIFEST_BAD=1
    continue
  fi
  if [[ ! "$token" =~ ^--[A-Za-z0-9_-]+$ ]]; then
    echo "MANIFEST_ERROR=$MANIFEST:$LINENO_M token must be a CSS custom property (leading --), got: '${token:-<empty>}'"
    MANIFEST_BAD=1
    continue
  fi
  if [[ -z "$declared" || -z "$source_cite" ]]; then
    echo "MANIFEST_ERROR=$MANIFEST:$LINENO_M expected '<token> | <declared-value> | <source-cite file:line> [| <selector>]'"
    MANIFEST_BAD=1
    continue
  fi
  printf '%s\t%s\t%s\t%s\n' "$token" "$declared" "$source_cite" "$selector" >>"$TSV"
  ENTRIES=$((ENTRIES + 1))
done <"$MANIFEST"

if [[ "$MANIFEST_BAD" -ne 0 ]]; then
  exit 2
fi
if [[ "$ENTRIES" -eq 0 ]]; then
  echo "MANIFEST_ERROR=$MANIFEST: no token rows found"
  exit 2
fi

check_browsers

# 4. Run the probe. The node runner re-checks the chromium binary at launch
#    time (the module can be installed while the binary cache is empty) and
#    converts that case into the same graceful skip.
run_probe() {
  PROBE_URL="$URL" PROBE_TSV="$TSV" PROBE_TIMEOUT_MS="$TIMEOUT_MS" node - <<'NODE_RUNNER'
const fs = require('fs');
const { chromium } = require('playwright');

const url = process.env.PROBE_URL;
const timeoutMs = parseInt(process.env.PROBE_TIMEOUT_MS || '30000', 10);
const entries = fs
  .readFileSync(process.env.PROBE_TSV, 'utf8')
  .split('\n')
  .filter((l) => l.trim() !== '')
  .map((l) => {
    const [token, declared, source, selector] = l.split('\t');
    return { token, declared, source, selector };
  });

const firstLine = (err) => String((err && err.message) || err).split('\n')[0];

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (/Executable doesn't exist|playwright install|Failed to launch/i.test(String(err))) {
      console.log('PROBE_SKIPPED=browsers-unavailable');
      console.log('# install the browser on the HOST (never inside a sandbox): npx playwright install chromium');
      process.exit(0);
    }
    throw err;
  }

  let exitCode = 0;
  try {
    const page = await browser.newPage();
    // Read-only guarantee: navigation and subresources are GETs; abort
    // anything else (beacons, analytics POSTs, form submits).
    await page.route('**/*', (route) =>
      route.request().method() === 'GET' ? route.continue() : route.abort()
    );
    try {
      await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    } catch (err) {
      console.log(`PROBE_FAILED=navigation url=${url} error=${firstLine(err)}`);
      exitCode = 1;
    }

    if (exitCode === 0) {
      const results = await page.evaluate((rows) => {
        // In-browser canonicalizer: both sides of the diff pass through the
        // SAME normalization, so notation differences (hex vs rgb, rem vs px,
        // quoted vs bare font names) are not reported as mismatches.
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        document.documentElement.appendChild(probe);
        const canonical = (raw) => {
          if (raw == null) return '';
          const v = String(raw).trim();
          if (v === '') return '';
          probe.style.color = '';
          probe.style.color = v;
          if (probe.style.color !== '') {
            const c = getComputedStyle(probe).color;
            probe.style.color = '';
            return c; // colors canonicalize to rgb()/rgba()
          }
          probe.style.width = '';
          probe.style.width = v;
          if (probe.style.width !== '') {
            const w = getComputedStyle(probe).width;
            probe.style.width = '';
            return w; // lengths canonicalize to px
          }
          // font stacks and everything else: case/quote/space normalization
          return v
            .toLowerCase()
            .replace(/["']/g, '')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s+/g, ' ');
        };
        return rows.map((r) => {
          const target = document.querySelector(r.selector);
          if (!target) {
            return { ...r, computed: '', note: 'selector-not-found' };
          }
          const computed = getComputedStyle(target).getPropertyValue(r.token).trim();
          return {
            ...r,
            computed,
            computedCanon: canonical(computed),
            declaredCanon: canonical(r.declared),
          };
        });
      }, entries);

      let match = 0;
      let mismatch = 0;
      let unresolved = 0;
      for (const r of results) {
        let verdict;
        if (r.note === 'selector-not-found' || r.computed === '') {
          verdict = 'UNRESOLVED';
          unresolved += 1;
        } else if (r.declaredCanon === r.computedCanon) {
          verdict = 'MATCH';
          match += 1;
        } else {
          verdict = 'MISMATCH';
          mismatch += 1;
        }
        const shown = r.computed === '' ? '<unset>' : r.computed;
        console.log(
          `PROBE_DIFF token=${r.token} declared='${r.declared}' computed='${shown}' verdict=${verdict} source=${r.source} url=${url} selector=${r.selector}`
        );
        if (verdict === 'MISMATCH') {
          console.log(
            `[VERIFY: rendered-probe mismatch — ${r.token} declared '${r.declared}' (${r.source}) but computes '${r.computed}' at '${r.selector}' on ${url}]`
          );
        } else if (verdict === 'UNRESOLVED') {
          const why =
            r.note === 'selector-not-found'
              ? `selector '${r.selector}' not found`
              : `custom property unset at '${r.selector}'`;
          console.log(
            `[VERIFY: rendered-probe unresolved — ${r.token} (${r.source}): ${why} on ${url}]`
          );
        }
      }
      console.log(
        `PROBE_RESULT=checked:${results.length} match:${match} mismatch:${mismatch} unresolved:${unresolved}`
      );
    }
  } catch (err) {
    console.log(`PROBE_FAILED=internal error=${firstLine(err)}`);
    exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
})();
NODE_RUNNER
}

run_with_out run_probe
