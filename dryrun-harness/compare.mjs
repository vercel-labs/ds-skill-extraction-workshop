// compare.mjs <arm24.json> <arm25.json>
// Emits the markdown comparison body for the skill-vs-no-skill report.
import { readFileSync } from "node:fs";
const A = JSON.parse(readFileSync(process.argv[2], "utf8")); // skill (24)
const B = JSON.parse(readFileSync(process.argv[3], "utf8")); // no-skill (25)
const byLabel = (arr) => Object.fromEntries(arr.map((r) => [r.label, r]));
const S = byLabel(A), N = byLabel(B);
const ORDER = ["opus-effort-low","opus-effort-medium","opus-effort-high","opus-effort-xhigh","opus-effort-max","sonnet-effort-low","sonnet-effort-medium","sonnet-effort-high","sonnet-effort-xhigh","sonnet-effort-max"];
const nm = (l) => l.replace("-effort-", " · ");
const d2 = (x) => (x == null ? "—" : x.toFixed(2));
const yn = (b) => (b == null ? "—" : b ? "✅" : "❌");
const pct = (a, b) => (a == null || b == null || a === 0 ? "—" : `${(((b - a) / a) * 100).toFixed(0)}%`);
const tok = (x) => (x == null ? "—" : x >= 1000 ? `${Math.round(x / 1000)}k` : `${x}`);

let out = "";
const P = (s = "") => (out += s + "\n");

// 1. cost + tokens
P("### Cost & tokens — skill (dryrun-24) vs no-skill (dryrun-25)\n");
P("| variant | skill $ | no-skill $ | Δ$ | Δ% | skill out-tok | no-skill out-tok | Δtok% | skill turns | no-skill turns |");
P("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
let sSkill = 0, sNo = 0, tSkill = 0, tNo = 0;
for (const l of ORDER) {
  const s = S[l] || {}, n = N[l] || {};
  if (s.cost_usd != null) sSkill += s.cost_usd;
  if (n.cost_usd != null) sNo += n.cost_usd;
  if (s.out_tok != null) tSkill += s.out_tok;
  if (n.out_tok != null) tNo += n.out_tok;
  const dd = s.cost_usd != null && n.cost_usd != null ? (n.cost_usd - s.cost_usd).toFixed(2) : "—";
  P(`| ${nm(l)} | ${d2(s.cost_usd)} | ${d2(n.cost_usd)} | ${dd} | ${pct(s.cost_usd, n.cost_usd)} | ${tok(s.out_tok)} | ${tok(n.out_tok)} | ${pct(s.out_tok, n.out_tok)} | ${s.turns ?? "—"} | ${n.turns ?? "—"} |`);
}
P(`| **total** | **${sSkill.toFixed(2)}** | **${sNo.toFixed(2)}** | **${(sNo - sSkill).toFixed(2)}** | **${pct(sSkill, sNo)}** | **${tok(tSkill)}** | **${tok(tNo)}** | **${pct(tSkill, tNo)}** | | |`);

// 2. integrity
P("\n### Build integrity\n");
P("| variant | skill typecheck | no-skill typecheck | skill console-err | no-skill console-err | no-skill editable form |");
P("| --- | --- | --- | --- | --- | --- |");
for (const l of ORDER) {
  const s = S[l] || {}, n = N[l] || {};
  P(`| ${nm(l)} | ${s.typecheck ?? "—"} | ${n.typecheck ?? "—"} | ${s.consoleErrors ?? "—"} | ${n.consoleErrors ?? "—"} | ${yn(n.editableForm)} |`);
}

// 3. dark-mode toggle
P("\n### Dark-mode toggle (DOM-verified) — the undocumented capability\n");
P("| variant | found (s/n) | accessible name (s/n) | root-observable (s/n) |");
P("| --- | --- | --- | --- |");
for (const l of ORDER) {
  const s = S[l] || {}, n = N[l] || {};
  const nameS = s.toggleName ? "✅" : "❌", nameN = n.toggleName ? "✅" : "❌";
  P(`| ${nm(l)} | ${yn(s.toggleFound)} / ${yn(n.toggleFound)} | ${nameS} / ${nameN} | ${yn(s.toggleRootObservable)} / ${yn(n.toggleRootObservable)} |`);
}

// 4. a11y merge gating
P("\n### Accessibility — merge unavailable while checks run (light stage DOM)\n");
const gate = (r) => {
  if (!r) return "—";
  if (r.mergeBtnTag == null && r.mergeRenderedDuringChecks === false) return "not rendered ✅";
  if (r.mergeBtnDisabledAttr) return "disabled ✅";
  if (r.mergeBtnAriaDisabled === "true") return "aria-disabled ✅";
  if (r.mergeBtnDataInactive != null) return "inactive only ❌";
  return (r.mergeKeyboardBlocked ? "blocked ✅" : "actionable ❌");
};
P("| variant | skill gating | no-skill gating |");
P("| --- | --- | --- |");
for (const l of ORDER) P(`| ${nm(l)} | ${gate(S[l])} | ${gate(N[l])} |`);

// 5. DS reach + token discipline
P("\n### Design-system reach & token discipline\n");
P("| variant | skill #prim | no-skill #prim | skill TL | no-skill TL | skill sx/hex/px | no-skill sx/hex/px | skill LOC | no-skill LOC |");
P("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const l of ORDER) {
  const s = S[l] || {}, n = N[l] || {};
  const esc = (r) => (r && r.primerCount != null ? `${r.sxCount}/${r.hexColors}/${r.pxLiterals}` : "—");
  P(`| ${nm(l)} | ${s.primerCount ?? "—"} | ${n.primerCount ?? "—"} | ${yn(s.usesTimeline)} | ${yn(n.usesTimeline)} | ${esc(s)} | ${esc(n)} | ${s.loc ?? "—"} | ${n.loc ?? "—"} |`);
}

// aggregate verdict
P("\n### Aggregate\n");
const passRate = (arr) => `${arr.filter((r) => r.typecheck === "PASS").length}/${arr.length}`;
const rootObs = (arr) => `${arr.filter((r) => r.toggleRootObservable).length}/${arr.length}`;
const tlCount = (arr) => `${arr.filter((r) => r.usesTimeline).length}/${arr.length}`;
const found = (arr) => `${arr.filter((r) => r.toggleFound).length}/${arr.length}`;
const sumEsc = (arr) => arr.reduce((a, r) => a + (r.hexColors || 0) + (r.pxLiterals || 0), 0);
P("| metric | skill (24) | no-skill (25) |");
P("| --- | --- | --- |");
P(`| total build cost | $${sSkill.toFixed(2)} | $${sNo.toFixed(2)} |`);
P(`| total output tokens | ${tok(tSkill)} | ${tok(tNo)} |`);
P(`| typecheck pass | ${passRate(A)} | ${passRate(B)} |`);
P(`| toggle found | ${found(A)} | ${found(B)} |`);
P(`| toggle root-observable | ${rootObs(A)} | ${rootObs(B)} |`);
P(`| uses Timeline | ${tlCount(A)} | ${tlCount(B)} |`);
P(`| raw hex+px literals (sum) | ${sumEsc(A)} | ${sumEsc(B)} |`);

console.log(out);
