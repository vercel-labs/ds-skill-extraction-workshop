// Measure design-system reach + craft signals from a generated component file.
// Used identically on dryrun-24 (with skill) and dryrun-25 (no skill) components
// so the comparison is apples-to-apples.
//
// Usage: node measure-component.mjs <file.tsx>   -> prints JSON row to stdout
import { readFileSync } from "node:fs";

const file = process.argv[2];
let src = "";
try { src = readFileSync(file, "utf8"); } catch {
  console.log(JSON.stringify({ file, error: "unreadable" })); process.exit(0);
}

const loc = src.split("\n").length;

// Collect named imports from any @primer/react path (incl. /experimental, /deprecated).
// Handles multiline import blocks.
const primer = new Set();
const importRe = /import\s+(?:type\s+)?\{([^{}]*)\}\s+from\s+["']@primer\/react(?:\/[^"']*)?["']/g;
let m;
while ((m = importRe.exec(src)) !== null) {
  for (let name of m[1].split(",")) {
    name = name.trim().replace(/^type\s+/, "");
    if (!name) continue;
    // handle `Foo as Bar` -> count the imported (left) name
    const orig = name.split(/\s+as\s+/)[0].trim();
    if (orig) primer.add(orig);
  }
}
// A "component" = Capitalized identifier; hooks (use*) and lowercase utilities excluded,
// matching the audit's "distinct Primer components" count.
const components = [...primer].filter((n) => /^[A-Z]/.test(n) && !/^use[A-Z]/.test(n));
const hooks = [...primer].filter((n) => /^use[A-Z]/.test(n));

// Octicons (distinct icon components imported from @primer/octicons-react)
const octicons = new Set();
const octRe = /import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["']@primer\/octicons-react["']/g;
while ((m = octRe.exec(src)) !== null) {
  for (let name of m[1].split(",")) {
    name = name.trim().split(/\s+as\s+/)[0].trim();
    if (name) octicons.add(name);
  }
}

// Hand-styling escape hatches (raw values that the DS-token discipline discourages).
const sxCount = (src.match(/\bsx=\{/g) || []).length;
const styleCount = (src.match(/\bstyle=\{/g) || []).length;
const hexColors = (src.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
const pxLiterals = (src.match(/\b\d+px\b/g) || []).length;

const row = {
  file,
  loc,
  primerCount: components.length,
  primerComponents: components.sort(),
  primerHooks: hooks.sort(),
  usesTimeline: components.includes("Timeline"),
  usesRelativeTime: components.includes("RelativeTime"),
  usesStateLabel: components.includes("StateLabel"),
  octiconCount: octicons.size,
  sxCount,
  styleCount,
  hexColors,
  pxLiterals,
};
console.log(JSON.stringify(row));
