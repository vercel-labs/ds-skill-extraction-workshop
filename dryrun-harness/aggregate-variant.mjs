// Assemble one comparison row for a single variant from its artifacts.
// Applied identically to dryrun-24 (skill) and dryrun-25 (no-skill).
//
// Usage:
//   node aggregate-variant.mjs --label sonnet-effort-low --arm no-skill \
//     --cost out-25/sonnet-effort-low/cost-report.json \
//     --shots out-25/sonnet-effort-low/shots/report.json \
//     --component <path-or-"-"> --layout <path-or-"-"> --typecheck PASS
import { readFileSync } from "node:fs";

const a = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);
const rd = (p) => { try { return readFileSync(p, "utf8"); } catch { return null; } };
const rj = (p) => { const s = rd(p); if (!s) return null; try { return JSON.parse(s); } catch { return null; } };

// ---- component DS-reach ----
function measureComponent(src) {
  if (!src) return null;
  const primer = new Set();
  const re = /import\s+(?:type\s+)?\{([^{}]*)\}\s+from\s+["']@primer\/react(?:\/[^"']*)?["']/g;
  let m;
  while ((m = re.exec(src)) !== null)
    for (let n of m[1].split(",")) {
      n = n.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (n) primer.add(n);
    }
  const comps = [...primer].filter((n) => /^[A-Z]/.test(n) && !/^use[A-Z]/.test(n));
  const oct = new Set();
  const ore = /import\s+(?:type\s+)?\{([^{}]*)\}\s+from\s+["']@primer\/octicons-react["']/g;
  while ((m = ore.exec(src)) !== null)
    for (let n of m[1].split(",")) { n = n.trim().split(/\s+as\s+/)[0].trim(); if (n) oct.add(n); }
  return {
    loc: src.split("\n").length,
    primerCount: comps.length,
    primerComponents: comps.sort(),
    usesTimeline: comps.includes("Timeline"),
    usesRelativeTime: comps.includes("RelativeTime"),
    octiconCount: oct.size,
    sxCount: (src.match(/\bsx=\{/g) || []).length,
    styleCount: (src.match(/\bstyle=\{/g) || []).length,
    hexColors: (src.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length,
    pxLiterals: (src.match(/\b\d+px\b/g) || []).length,
  };
}

// ---- color-mode wiring (how the model drove dark mode WITHOUT the skill's recipe) ----
function measureLayout(src) {
  if (!src) return null;
  return {
    usesThemeProvider: /\bThemeProvider\b/.test(src),
    usesBaseStyles: /\bBaseStyles\b/.test(src),
    colorModeAuto: /colorMode=["']auto["']|data-color-mode=["']auto["']/.test(src),
    dataColorModeAttr: /data-color-mode=/.test(src),
    dataLightDarkTheme: /data-(light|dark)-theme=/.test(src),
  };
}

const cost = rj(a.cost) || {};
const shots = rj(a.shots) || {};
const comp = measureComponent(rd(a.component));
const layout = measureLayout(rd(a.layout));

const tg = shots.toggle || {};
const light = (shots.stages && shots.stages.light) || {};
const dark = (shots.stages && shots.stages.dark) || {};
const consoleErrCount = (light.consoleErrors?.length || 0) + (dark.consoleErrors?.length || 0);

const row = {
  label: a.label,
  arm: a.arm,
  // cost
  cost_usd: cost.total_cost_usd ?? null,
  turns: cost.num_turns ?? null,
  out_tok: cost.output_tokens ?? null,
  in_tok: cost.input_tokens ?? null,
  cache_read_tok: cost.cache_read_input_tokens ?? null,
  cache_create_tok: cost.cache_creation_input_tokens ?? null,
  duration_ms: cost.duration_ms ?? null,
  build_error: cost.is_error ?? null,
  // integrity
  typecheck: a.typecheck ?? "NA",
  consoleErrors: consoleErrCount,
  editableForm: light.editableFormVisible ?? dark.editableFormVisible ?? null,
  // DS reach
  loc: comp?.loc ?? null,
  primerCount: comp?.primerCount ?? null,
  usesTimeline: comp?.usesTimeline ?? null,
  usesRelativeTime: comp?.usesRelativeTime ?? null,
  octiconCount: comp?.octiconCount ?? null,
  sxCount: comp?.sxCount ?? null,
  styleCount: comp?.styleCount ?? null,
  hexColors: comp?.hexColors ?? null,
  pxLiterals: comp?.pxLiterals ?? null,
  primerComponents: comp?.primerComponents ?? null,
  // dark-mode toggle (DOM-verified)
  toggleFound: tg.found ?? null,
  toggleName: tg.accessibleName ?? null,
  toggleDiscoverable: tg.discoverableByAccessibleName ?? null,
  toggleTestid: tg.testid ?? null,
  toggleFlipped: tg.flipped ?? null,
  toggleRootObservable: tg.resolvedModeObservable ?? null,
  // a11y merge gating during checks (light stage DOM)
  mergeKeyboardBlocked: light.mergeKeyboardBlocked ?? null,
  mergeBtnTag: light.mergeBtnAttrs?.tag ?? null,
  mergeBtnDisabledAttr: light.mergeBtnAttrs?.disabledAttr ?? null,
  mergeBtnAriaDisabled: light.mergeBtnAttrs?.ariaDisabled ?? null,
  mergeBtnDataInactive: light.mergeBtnAttrs?.dataInactive ?? null,
  mergeRenderedDuringChecks: light.mergeBtnAttrs ? true : false,
  // color-mode wiring
  layoutThemeProvider: layout?.usesThemeProvider ?? null,
  layoutDataColorMode: layout?.dataColorModeAttr ?? null,
  // merge completion (auto-clicked)
  reachedMergedLight: light.reachedMerged ?? null,
  reachedMergedDark: dark.reachedMerged ?? null,
};
console.log(JSON.stringify(row));
