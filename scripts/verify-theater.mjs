import { chromium } from "playwright";

const URL = "http://localhost:3987/";
const results = [];
function check(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await chromium.launch();

// Open with system dark preference to confirm "opens in the reader's mode".
const ctx = await browser.newContext({ colorScheme: "dark" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });

const rootMode = () =>
  page.evaluate(() => document.documentElement.getAttribute("data-color-mode"));
const bodyBg = () =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

check("opens in system dark mode (document root)", (await rootMode()) === "dark", await rootMode());
const darkBg = await bodyBg();

// State capsule starts Open.
const stateText0 = await page.getByTestId("pr-state").innerText();
check("capsule starts Open", /open/i.test(stateText0), stateText0);

// Merge button absent while checks run (genuinely unavailable).
check(
  "merge button NOT present while running",
  (await page.getByTestId("merge-button").count()) === 0,
);

// Wait for checks to resolve and the merge box to open.
await page.getByTestId("merge-button").waitFor({ state: "visible", timeout: 12000 });
check("merge box opens after checks pass", true);

// Ready cue is a live region.
const readyRole = await page
  .locator('[role="status"]')
  .first()
  .getAttribute("aria-live");
check("ready cue is an aria-live status region", readyRole === "polite", `aria-live=${readyRole}`);

// Form controls present and labelled.
const mergeMethodLabelled = await page.getByLabel("Merge method").count();
check("merge-method picker labelled", mergeMethodLabelled === 1);
check("commit headline labelled", (await page.getByLabel("Commit headline").count()) === 1);
check("extended description labelled", (await page.getByLabel("Extended description").count()) === 1);
check(
  "delete-branch checkbox labelled",
  (await page.getByLabel(/Delete .* after merge/).count()) === 1,
);

// Primary action reflects the method.
const btnMerge = await page.getByTestId("merge-button").innerText();
check("primary action label = merge method (merge)", /Merge pull request/.test(btnMerge), btnMerge);
await page.getByLabel("Merge method").selectOption("squash");
const btnSquash = await page.getByTestId("merge-button").innerText();
check("primary action follows method (squash)", /Squash and merge/.test(btnSquash), btnSquash);
// Rebase hides commit fields.
await page.getByLabel("Merge method").selectOption("rebase");
check("rebase hides commit headline", (await page.getByLabel("Commit headline").count()) === 0);
await page.getByLabel("Merge method").selectOption("merge");

// Click merge -> flips to Merged.
await page.getByTestId("merge-button").click();
await page.getByTestId("pr-state").filter({ hasText: "Merged" }).waitFor({ timeout: 4000 });
const stateText1 = await page.getByTestId("pr-state").innerText();
check("capsule flips to Merged", /merged/i.test(stateText1), stateText1);

// Branch follow-up honors the delete choice (defaulted to delete -> restore offered).
const branchBtn = await page.getByTestId("branch-action").innerText();
check("offers to restore the deleted branch", /Restore branch/.test(branchBtn), branchBtn);

// Color-mode toggle: flips resolved mode on the document root AND recolors body.
const toggle = page.getByTestId("color-mode-toggle");
const toggleName = await toggle.evaluate((n) => {
  const labelledby = n.getAttribute("aria-labelledby");
  return (
    n.getAttribute("aria-label") ||
    (labelledby ? document.getElementById(labelledby)?.textContent : null)
  );
});
check("toggle has accessible name", /switch to .* mode/i.test(toggleName || ""), toggleName);
await toggle.click();
await page.waitForTimeout(200);
const modeAfter1 = await rootMode();
const bgAfter1 = await bodyBg();
check("toggle flips document-root mode to light", modeAfter1 === "light", modeAfter1);
check("toggle recolors the page background", bgAfter1 !== darkBg, `${darkBg} -> ${bgAfter1}`);
await toggle.click();
await page.waitForTimeout(200);
const modeAfter2 = await rootMode();
const bgAfter2 = await bodyBg();
check("toggle flips back to dark", modeAfter2 === "dark", modeAfter2);
check("background returns to dark value", bgAfter2 === darkBg, `${bgAfter2}`);

check("no console / page errors", errors.length === 0, errors.join(" | "));

// --- Keep-branch path: uncheck delete before merging -> offers to delete. ---
const ctx2 = await browser.newContext({ colorScheme: "light" });
const page2 = await ctx2.newPage();
await page2.goto(URL, { waitUntil: "networkidle" });
check(
  "opens in system light mode (document root)",
  (await page2.evaluate(() => document.documentElement.getAttribute("data-color-mode"))) === "light",
);
await page2.getByTestId("merge-button").waitFor({ state: "visible", timeout: 12000 });
await page2.getByLabel(/Delete .* after merge/).uncheck();
await page2.getByTestId("merge-button").click();
await page2.getByTestId("branch-action").waitFor({ timeout: 4000 });
const branchBtn2 = await page2.getByTestId("branch-action").innerText();
check("keep-branch path offers to delete the branch", /Delete branch/.test(branchBtn2), branchBtn2);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
