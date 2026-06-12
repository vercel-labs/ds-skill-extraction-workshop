#!/usr/bin/env bash
# scripts/probe-rendered.sh — opt-in rendered-site probe. Renders the DS's
# public docs site headless (playwright + chromium) and diffs the COMPUTED
# CSS custom-property values against the DECLARED token values Phase 2
# extracted from source. The gap between declared and rendered surfaces
# theme overrides, build-time transforms, and stale source declarations.
#
# ROLE — ANNOTATE, NEVER OVERRIDE. Source extraction stays authoritative.
# Every MISMATCH / UNRESOLVED row is emitted as a ready-made `[VERIFY: ...]`
# line for the same Phase 2 stream the rest of validation feeds. A mismatch
# is a finding, not a probe failure: the script exits 0 on a completed run
# regardless of verdicts.
#
# OPT-IN CONTRACT (enforced by the caller — Phase 2 of the meta-skill):
# run only when (a) the DS has a public docs URL accepted in Phase 1, and
# (b) the user has not opted out (opt-out phrase: "skip rendered probe").
# Default for CI and tests is skip.
#
# USAGE
#   bash probe-rendered.sh --url <docs-url> --manifest <path> \
#       [--out <report-file>] [--timeout-ms <n=30000>]
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
# SKIP / FAILURE CONTRACT (greppable, one line each):
#   PROBE_SKIPPED=no-docs-url            no --url given — the DS had no
#                                        accepted public docs URL (exit 0)
#   PROBE_SKIPPED=browsers-unavailable   node, playwright, or the chromium
#                                        binary is missing (exit 0)
#   MANIFEST_ERROR=<file>:<line> ...     malformed manifest row (exit 2)
#   PROBE_FAILED=navigation ...          the docs site did not load (exit 1 —
#                                        the caller logs one [VERIFY] line and
#                                        Phase 2 continues; never a blocker)
#
# MANIFEST FORMAT (--manifest) — one token per line, pipe-delimited:
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
# OUTPUT (stdout; duplicated to --out when given):
#   PROBE_DIFF token=<t> declared='<v>' computed='<v>' verdict=MATCH|MISMATCH|UNRESOLVED source=<file:line> url=<url> selector=<sel>
#   [VERIFY: rendered-probe ...]        one per MISMATCH / UNRESOLVED row
#   PROBE_RESULT=checked:<n> match:<n> mismatch:<n> unresolved:<n>
#
# TOKEN CLASSES. In scope: color tokens, font-family tokens, and base
# spacing/size tokens (length values). Declared and computed values are
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

usage_error() {
  echo "$1" >&2
  echo "usage: probe-rendered.sh --url <docs-url> --manifest <path> [--out <file>] [--timeout-ms <n>]" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)        URL="${2:-}"; shift 2 ;;
    --manifest)   MANIFEST="${2:-}"; shift 2 ;;
    --out)        OUT="${2:-}"; shift 2 ;;
    --timeout-ms) TIMEOUT_MS="${2:-}"; shift 2 ;;
    *) usage_error "error: unknown argument: $1" ;;
  esac
done

# 1. No accepted docs URL -> clean skip. This is the documented Phase 2
#    behavior for DSes without a public docs site, not an error.
if [[ -z "$URL" ]]; then
  echo "PROBE_SKIPPED=no-docs-url"
  exit 0
fi

[[ -n "$MANIFEST" ]] || usage_error "error: --manifest is required"
if [[ ! -f "$MANIFEST" ]]; then
  echo "MANIFEST_ERROR=$MANIFEST: file not found"
  exit 2
fi

# 2. Parse + validate the manifest BEFORE browser detection, so manifest
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

# 3. Browser availability detection. Never installs anything — see the
#    BROWSER PRECONDITION block in the header for the host-side command.
skip_browsers() {
  echo "PROBE_SKIPPED=browsers-unavailable"
  echo "# install the browser on the HOST (never inside a sandbox): npx playwright install chromium"
  exit 0
}

[[ "${PROBE_RENDERED_BROWSERS:-}" == "absent" ]] && skip_browsers
command -v node >/dev/null 2>&1 || skip_browsers
node -e "require.resolve('playwright')" >/dev/null 2>&1 || skip_browsers

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

if [[ -n "$OUT" ]]; then
  run_probe | tee "$OUT"
  exit "${PIPESTATUS[0]}"
else
  run_probe
fi
