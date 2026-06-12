#!/usr/bin/env node
// audit-craft.mjs — rapid, deterministic craft audit.
//
// Inspiration: the removed `audit-primer-fidelity` skill's audit-static.sh
// (deterministic tier, file:line evidence, greppable footer, exit-as-data).
// This tool re-points that DNA at the design-craft rubric: it reads the
// canonical design-craft.md, runs the subset of its rules that are
// mechanically checkable over generated source, and prints a colorful table.
//
// Honesty: composition/taste rules (macrostructure, density, distinctiveness,
// data-state coverage, fabricated content, fake chrome) cannot be judged from
// static source — they are listed as `– needs eyes`, never faked to PASS.
//
// Usage:  node scripts/audit-craft.mjs [path ...]      (default: app components)
//         pnpm audit:craft

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";

// ── ANSI (hand-rolled, zero-dep) ───────────────────────────────────────────
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", gray: "\x1b[90m",
};
const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const paint = (s, ...codes) => (NO_COLOR ? s : codes.join("") + s + C.reset);
const visLen = (s) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
const padEnd = (s, w) => s + " ".repeat(Math.max(0, w - visLen(s)));

// ── result vocabulary (mirrors the old skill: ✅ ⚠️ ❌ –) ────────────────────
const PASS = "pass", FAIL = "fail", WARN = "warn", EYES = "eyes";
const GLYPH = { [PASS]: "✓", [FAIL]: "✗", [WARN]: "⚠", [EYES]: "○" };
const COLOR = { [PASS]: C.green, [FAIL]: C.red, [WARN]: C.yellow, [EYES]: C.gray };
const WORD  = { [PASS]: "PASS", [FAIL]: "FAIL", [WARN]: "WARN", [EYES]: "EYES" };

// ── file discovery ──────────────────────────────────────────────────────────
const EXT = /\.(tsx?|css)$/;
const SKIP = /node_modules|\.next|\.git/;
function walk(p, out = []) {
  if (!existsSync(p)) return out;
  const st = statSync(p);
  if (st.isFile()) { if (EXT.test(p) && !SKIP.test(p)) out.push(p); return out; }
  if (st.isDirectory() && !SKIP.test(p))
    for (const e of readdirSync(p)) walk(join(p, e), out);
  return out;
}

// ── scanners: each maps to a real design-craft rule ──────────────────────────
// A scanner returns hits: [{file, line, text}]. `sev` is how a hit is scored.
// Per-line regex helpers strip nothing — hex in a var() fallback is still a
// raw value (this project bans hex fallbacks), so we flag it, unlike the old
// audit-static.sh which skipped `var(--` lines wholesale.
function perLine(files, re, opts = {}) {
  const hits = [];
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((ln, i) => {
      if (opts.requires && !opts.requires.test(ln)) return;
      const m = re.exec(ln); re.lastIndex = 0;
      if (m && (!opts.filter || opts.filter(m, ln)))
        hits.push({ file: f, line: i + 1, text: ln.trim().slice(0, 80) });
    });
  }
  return hits;
}
function perFile(files, fn) { // file-level predicate → at most one hit per file
  const hits = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    const h = fn(t, f);
    if (h) hits.push({ file: f, line: h.line || 1, text: h.text || "" });
  }
  return hits;
}

const HEX = /#(?:[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?|[0-9a-fA-F]{3,4})\b/;
const hexReal = (m) => m[0].length >= 7 || /[a-fA-F]/.test(m[0].slice(1)); // skip #482-style ids

const CHECKS = [
  // ── Color ──────────────────────────────────────────────────────────────
  { section: "Color", level: "MUST", rule: "no raw hex / rgb / oklch — use a token",
    sev: FAIL, scan: (f) => [
      ...perLine(f, HEX, { filter: hexReal }),
      ...perLine(f, /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\s*\(/),
    ] },
  { section: "Color", level: "NEVER", rule: "no rainbow / multi-stop gradient heroes",
    sev: WARN, scan: (f) => perLine(f, /\b(?:linear|radial|conic)-gradient\s*\(/) },

  // ── Typography ───────────────────────────────────────────────────────────
  { section: "Typography", level: "MUST", rule: "font size from scale, not arbitrary px",
    sev: FAIL, scan: (f) => perLine(f, /font-?size\s*[:=]\s*["']?\s*\d+(?:\.\d+)?px/i) },

  // ── Spacing ──────────────────────────────────────────────────────────────
  { section: "Spacing", level: "MUST", rule: "gap / margin / padding from scale, not px",
    sev: WARN, scan: (f) => perLine(f, /\b(?:gap|margin|padding)\s*[:=]\s*["']?\s*\d+(?:\.\d+)?px/i) },

  // ── Motion ───────────────────────────────────────────────────────────────
  { section: "Motion", level: "NEVER", rule: "no `transition: all`",
    sev: FAIL, scan: (f) => perLine(f, /transition(?:-property)?\s*[:=]\s*["']?\s*all\b/) },
  { section: "Motion", level: "NEVER", rule: "no transition on layout properties",
    sev: FAIL, scan: (f) => perLine(f, /\b(?:width|height|top|left|right|bottom|margin|padding|inset)\b/, { requires: /transition/ }) },
  { section: "Motion", level: "NEVER", rule: "no bounce / elastic easing",
    sev: WARN, scan: (f) => perLine(f, /cubic-bezier\([^)]*-[\d.]|bounce|elastic/i, { requires: /transition|animation|cubic-bezier|easing/i }) },
  { section: "Motion", level: "MUST", rule: "honor prefers-reduced-motion when animating",
    sev: WARN, scan: (f) => perFile(f, (t) =>
      /transition|animation|@keyframes|animate\(/.test(t) && !/prefers-reduced-motion/.test(t)
        ? { text: "motion present, no reduced-motion guard" } : null) },

  // ── Hierarchy ────────────────────────────────────────────────────────────
  { section: "Hierarchy", level: "MUST", rule: "one primary action per screen",
    sev: WARN, scan: (f) => perFile(f, (t, file) => {
      const n = (t.match(/variant\s*=\s*["']primary["']/g) || []).length;
      return n > 1 ? { text: `${n} primary buttons in one file` } : null; }) },

  // ── Accessibility floor ──────────────────────────────────────────────────
  { section: "Accessibility", level: "MUST", rule: "never remove the focus ring",
    sev: FAIL, scan: (f) => perLine(f, /outline\s*[:=]\s*["']?\s*(?:none|0)\b|outlineStyle\s*[:=]\s*["']none/) },
  { section: "Accessibility", level: "NEVER", rule: "no emoji as icons / bullets",
    sev: FAIL, scan: (f) => perLine(f, /\p{Extended_Pictographic}/u) },

  // ── Manual rows — honest `needs eyes`, never auto-passed ──────────────────
  { section: "Layout", level: "NEVER", rule: "deliberate macrostructure (not hero→cards→CTA)", eyes: 1 },
  { section: "Layout", level: "NEVER", rule: "no cards-in-cards / identical icon-tile grids", eyes: 1 },
  { section: "Hierarchy", level: "MUST", rule: "all four data states (loading/empty/error/full)", eyes: 1 },
  { section: "Hierarchy", level: "MUST", rule: "~three prominence levels, lead resolves <2s", eyes: 1 },
  { section: "Accessibility", level: "NEVER", rule: "no horizontal scroll on mobile widths", eyes: 1 },
  { section: "Honesty", level: "NEVER", rule: "no fabricated metrics / testimonials / logos", eyes: 1 },
  { section: "Honesty", level: "NEVER", rule: "no fake browser/phone/IDE chrome", eyes: 1 },
  { section: "Honesty", level: "MUST", rule: "self-critique: hierarchy · restraint · distinctiveness", eyes: 1 },
];

// ── locate + hash the rubric (footer provenance, like the old skill) ─────────
function findRubric() {
  const candidates = [
    ".claude/skills/primer-react/references/design-craft.md",
    ".claude/skills/primer/references/design-craft.md",
    ".claude/skills/extract-ds-skill/assets/design-craft.md",
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

// ── run ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const roots = args.length ? args : ["app", "components"];
const files = roots.flatMap((r) => walk(resolve(r)));
const rubric = findRubric();
const rubricHash = rubric
  ? createHash("sha1").update(readFileSync(rubric)).digest("hex").slice(0, 10)
  : "missing";

const rows = CHECKS.map((c) => {
  if (c.eyes) return { ...c, result: EYES, hits: [] };
  const hits = files.length ? c.scan(files) : [];
  const result = hits.length ? c.sev : PASS;
  return { ...c, result, hits };
});

// ── render: header ────────────────────────────────────────────────────────
const W = 64;
const bar = (ch) => paint(ch.repeat(W), C.gray);
console.log();
console.log("  " + paint("◆ DESIGN-CRAFT AUDIT", C.bold, C.magenta));
console.log("  " + paint(`rubric design-craft@${rubricHash} · ${files.length} files · ${roots.join(" ")}`, C.dim));
if (!rubric) console.log("  " + paint("⚠ design-craft.md not found — checks ran, provenance unknown", C.yellow));
if (!files.length) console.log("  " + paint("⚠ no .tsx/.ts/.css files found — generate a UI first, then re-run", C.yellow));
console.log();

// ── render: table grouped by section ────────────────────────────────────────
const RULE_W = 54, RES_W = 6, NOTE_W = 4;
const PREFIX_W = 8; // glyph + space + level(5) + space
const fitRule = (s) => (s.length > RULE_W - PREFIX_W ? s.slice(0, RULE_W - PREFIX_W - 1) + "…" : s);
const sectionsOrder = [...new Set(CHECKS.map((c) => c.section))];
const top = "  ┌" + "─".repeat(RULE_W + 2) + "┬" + "─".repeat(RES_W + 2) + "┬" + "─".repeat(NOTE_W + 2) + "┐";
const mid = "  ├" + "─".repeat(RULE_W + 2) + "┼" + "─".repeat(RES_W + 2) + "┼" + "─".repeat(NOTE_W + 2) + "┤";
const bot = "  └" + "─".repeat(RULE_W + 2) + "┴" + "─".repeat(RES_W + 2) + "┴" + "─".repeat(NOTE_W + 2) + "┘";
const V = paint("│", C.gray);
console.log(paint(top, C.gray));
console.log(`  ${V} ${paint(padEnd("RULE", RULE_W), C.bold)} ${V} ${paint(padEnd("CHECK", RES_W), C.bold)} ${V} ${paint(padEnd("#", NOTE_W), C.bold)} ${V}`);

const evidence = [];
sectionsOrder.forEach((sec) => {
  console.log(paint(mid, C.gray));
  console.log(`  ${V} ${paint(padEnd("▸ " + sec.toUpperCase(), RULE_W + RES_W + NOTE_W + 6), C.cyan, C.bold)} ${V}`);
  rows.filter((r) => r.section === sec).forEach((r) => {
    const g = paint(GLYPH[r.result], COLOR[r.result]);
    const lvl = paint(r.level.padEnd(5), C.dim);
    const label = `${g} ${lvl} ${fitRule(r.rule)}`;
    const note = r.hits.length ? paint(String(r.hits.length), COLOR[r.result]) : paint(r.result === EYES ? "–" : "·", C.gray);
    console.log(`  ${V} ${padEnd(label, RULE_W)} ${V} ${paint(padEnd(WORD[r.result], RES_W), COLOR[r.result])} ${V} ${padEnd(note, NOTE_W)} ${V}`);
    if (r.hits.length) evidence.push(r);
  });
});
console.log(paint(bot, C.gray));

// ── render: evidence (file:line, capped) ────────────────────────────────────
if (evidence.length) {
  console.log();
  console.log("  " + paint("EVIDENCE", C.bold));
  for (const r of evidence) {
    console.log("  " + paint(`${GLYPH[r.result]} ${r.rule}`, COLOR[r.result]));
    r.hits.slice(0, 5).forEach((h) => {
      const rel = relative(process.cwd(), h.file);
      const shown = rel.startsWith("..") ? h.file : rel;
      console.log("    " + paint(`${shown}:${h.line}`, C.dim) + paint(`  ${h.text}`, C.gray));
    });
    if (r.hits.length > 5) console.log("    " + paint(`… +${r.hits.length - 5} more`, C.dim));
  }
}

// ── render: footer (greppable, mirrors old skill) ───────────────────────────
const auto = rows.filter((r) => !r.eyes);
const cnt = (s) => auto.filter((r) => r.result === s).length;
const pass = cnt(PASS), fail = cnt(FAIL), warn = cnt(WARN), eyes = rows.length - auto.length;
const verdict = fail === 0 ? PASS : FAIL;

console.log();
console.log(bar("─"));
const chip = (label, n, col) => paint(` ${label} ${n} `, col, C.bold);
console.log("  " +
  chip("✓", pass, C.green) + chip("✗", fail, C.red) +
  chip("⚠", warn, C.yellow) + chip("○ eyes", eyes, C.gray));
console.log();
console.log("  " + paint(`RUBRIC=design-craft@${rubricHash}`, C.dim));
console.log("  " + paint(`AUTO_RULES=${auto.length} PASS=${pass} FAIL=${fail} WARN=${warn} NEEDS_EYES=${eyes}`, C.dim));
console.log("  " + paint(`CRAFT_RESULT=${verdict.toUpperCase()}`,
  verdict === PASS ? C.green : C.red, C.bold) +
  paint("   (deterministic tier only — composition rows need a human or a judge)", C.dim));
console.log(bar("─"));
console.log();

process.exit(fail); // exit code = MUST/NEVER violations, 0 = clean (CI-friendly)
