// Variant-agnostic capture for the pr-merged-switch-dark-mode dry-runs.
// 3 stages (initial / all-checks-green / post-merge) in BOTH a light and a dark
// system context, plus a deterministic toggle test (find the model's color-mode
// control, click it, assert the resolved mode on <html> + body bg flips).
//
// Usage: node screenshot.mjs --url http://localhost:PORT/ --outdir DIR --label LABEL
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);
const URL = args.url;
const OUT = args.outdir;
const LABEL = args.label ?? "variant";
await mkdir(OUT, { recursive: true });

const report = {
  label: LABEL,
  url: URL,
  capturedAt: new Date().toISOString(),
  stages: { light: {}, dark: {} },
  toggle: {},
  errors: [],
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Primary merge action. Buttons only (the merge-method picker is a combobox, so it's excluded).
// Covers GitHub's real phrasings: "Merge pull request", "Create a merge commit",
// "Squash and merge", "Rebase and merge", "Confirm merge", etc.
function mergeAction(page) {
  return page.getByRole("button", { name: /merge|squash|rebase|confirm/i }).first();
}
async function isActionable(loc) {
  try {
    if ((await loc.count()) === 0) return false;
    const disabled = await loc.isDisabled().catch(() => true);
    const aria = await loc.getAttribute("aria-disabled").catch(() => null);
    return !disabled && aria !== "true";
  } catch {
    return false;
  }
}

async function readMode(page) {
  return page.evaluate(() => {
    const h = document.documentElement;
    return {
      dataColorMode: h.getAttribute("data-color-mode"),
      dataLightTheme: h.getAttribute("data-light-theme"),
      dataDarkTheme: h.getAttribute("data-dark-theme"),
      colorScheme: getComputedStyle(h).colorScheme,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
}

async function capture(browser, scheme) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 1024 } });
  const page = await ctx.newPage();
  const st = report.stages[scheme];
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(String(e)));
  try {
    const loadStart = Date.now();
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("main, [class]", { timeout: 30000 }).catch(() => {});
    await wait(900);

    // Stage 1 (checks running). Record whether merge is GENUINELY unavailable now.
    const mergeBtn = mergeAction(page);
    const haveMerge = (await mergeBtn.count()) > 0;
    st.mergeBtnAttrs = haveMerge
      ? await mergeBtn.evaluate((el) => ({
          tag: el.tagName,
          disabledAttr: el.hasAttribute("disabled"),
          ariaDisabled: el.getAttribute("aria-disabled"),
          dataInactive: el.getAttribute("data-inactive"),
          tabindex: el.getAttribute("tabindex"),
          ariaLabel: el.getAttribute("aria-label"),
        })).catch(() => null)
      : null;
    // PRD: keyboard cannot trigger AND SR not actionable -> needs disabled attr OR aria-disabled=true.
    st.mergeKeyboardBlocked = st.mergeBtnAttrs
      ? (st.mergeBtnAttrs.disabledAttr || st.mergeBtnAttrs.ariaDisabled === "true")
      : null;
    st.mergeDisabledWhileRunning = haveMerge ? !(await isActionable(mergeBtn)) : null;
    st.initial = `${OUT}/${scheme}-1-initial.png`;
    await page.screenshot({ path: st.initial, fullPage: true });

    // Stage 2 (all checks green / merge box opened). Signal: editable form (textbox) appears;
    // floor at ~9s since checks resolve over ~6s, so we don't fire early on a faux-disabled button.
    await page.getByRole("textbox").first().waitFor({ state: "visible", timeout: 12000 }).catch(() => {});
    const elapsed = Date.now() - loadStart;
    if (elapsed < 9000) await wait(9000 - elapsed);
    st.mergeActionableWhenGreen = await isActionable(mergeBtn);
    st.editableFormVisible = (await page.getByRole("textbox").count()) > 0;
    st.checksGreen = `${OUT}/${scheme}-2-checks-green.png`;
    await page.screenshot({ path: st.checksGreen, fullPage: true });

    // Stage 3 (post-merge). Click merge (only if actionable), handle a possible confirm step.
    let merged = false;
    if (await isActionable(mergeBtn)) {
      await mergeBtn.click().catch((e) => errs.push("merge click: " + e.message));
      await wait(700);
      for (let i = 0; i < 5; i++) {
        if ((await page.getByText(/\bmerged\b/i).count().catch(() => 0)) > 0) { merged = true; break; }
        await wait(400);
      }
      if (!merged) {
        const confirm = page.getByRole("button", { name: /confirm|^\s*merge\b|squash|rebase/i }).first();
        if (await confirm.isVisible().catch(() => false)) await confirm.click().catch(() => {});
        for (let i = 0; i < 12; i++) {
          if ((await page.getByText(/\bmerged\b/i).count().catch(() => 0)) > 0) { merged = true; break; }
          await wait(400);
        }
      }
    }
    st.reachedMerged = merged;
    await wait(500);
    st.merged = `${OUT}/${scheme}-3-merged.png`;
    await page.screenshot({ path: st.merged, fullPage: true });
  } catch (e) {
    report.errors.push(`[${scheme}] ${e.message}`);
  }
  if (errs.length) st.consoleErrors = errs.slice(0, 10);
  await ctx.close();
}

async function accessibleName(loc) {
  return loc.evaluate((el) => {
    const t = (s) => (s || "").trim();
    if (t(el.getAttribute("aria-label"))) return el.getAttribute("aria-label").trim();
    const lb = el.getAttribute("aria-labelledby");
    if (lb) {
      const j = t(lb.split(/\s+/).map((id) => (document.getElementById(id)?.textContent) || "").join(" "));
      if (j) return j;
    }
    if (t(el.getAttribute("title"))) return el.getAttribute("title").trim();
    const innerAL = el.querySelector("[aria-label]");
    if (innerAL && t(innerAL.getAttribute("aria-label"))) return innerAL.getAttribute("aria-label").trim();
    const innerTitle = el.querySelector("title");
    if (innerTitle && t(innerTitle.textContent)) return innerTitle.textContent.trim();
    if (t(el.textContent)) return el.textContent.trim();
    return null;
  }).catch(() => null);
}

async function toggleTest(browser) {
  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 1280, height: 1024 } });
  const page = await ctx.newPage();
  const t = report.toggle;
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("main, [class]", { timeout: 30000 }).catch(() => {});
    await wait(900);

    let toggle = null;
    const testids = await page.$$eval("[data-testid]", (els) =>
      els.map((e) => e.getAttribute("data-testid")).filter(Boolean));
    t.allTestids = testids;
    const tid = testids.find((x) => /color|theme|mode|dark|light|appearance|scheme/i.test(x));
    if (tid) { toggle = page.locator(`[data-testid="${tid}"]`).first(); t.testid = tid; }

    // Discoverable purely by accessible name? (PRD requires a real accessible name.)
    let discoverable = false;
    for (const role of ["button", "switch", "checkbox"]) {
      if ((await page.getByRole(role, { name: /theme|color ?mode|dark|light|appearance/i }).count()) > 0) {
        discoverable = true;
        if (!toggle) { toggle = page.getByRole(role, { name: /theme|color ?mode|dark|light|appearance/i }).first(); t.foundByRole = role; }
        break;
      }
    }
    t.discoverableByAccessibleName = discoverable;
    t.found = Boolean(toggle);
    if (!toggle) { report.errors.push("toggle: NOT FOUND"); await ctx.close(); return; }

    t.accessibleName = await accessibleName(toggle);

    const before = await readMode(page);
    await page.screenshot({ path: `${OUT}/toggle-before.png`, fullPage: true });
    await toggle.scrollIntoViewIfNeeded().catch(() => {});
    await toggle.click({ timeout: 5000 }).catch((e) => report.errors.push("toggle click: " + e.message));
    await wait(700);
    const after = await readMode(page);
    await page.screenshot({ path: `${OUT}/toggle-after.png`, fullPage: true });

    t.before = before;
    t.after = after;
    t.htmlModeChanged =
      before.dataColorMode !== after.dataColorMode ||
      before.colorScheme !== after.colorScheme;
    t.bodyBgChanged = before.bodyBg !== after.bodyBg;
    t.flipped = t.htmlModeChanged || t.bodyBgChanged;
    t.resolvedModeObservable = t.htmlModeChanged; // PRD: resolved mode on doc root must reflect the choice
  } catch (e) {
    report.errors.push(`[toggle] ${e.message}`);
  }
  await ctx.close();
}

const browser = await chromium.launch();
try {
  await capture(browser, "light");
  await capture(browser, "dark");
  await toggleTest(browser);
} finally {
  await browser.close();
}
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  label: LABEL,
  toggle: { found: report.toggle.found, flipped: report.toggle.flipped, name: report.toggle.accessibleName, testid: report.toggle.testid, discoverable: report.toggle.discoverableByAccessibleName },
  light: report.stages.light, dark: report.stages.dark,
  errors: report.errors,
}, null, 2));
