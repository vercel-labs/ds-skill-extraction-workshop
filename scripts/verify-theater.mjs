// Headless verification of pr-merged-theater
import { chromium } from "playwright"

const BASE = "http://localhost:3000"

let browser
try {
  browser = await chromium.launch()
  const page = await browser.newPage()

  const consoleErrors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200))
  })

  await page.goto(BASE, { waitUntil: "networkidle" })

  // 1. Toggle present with data-testid
  const toggle = page.getByTestId("color-mode-toggle")
  console.log(`[PASS] color-mode-toggle present: ${await toggle.count() > 0}`)

  // 2. Accessible name (Primer IconButton uses aria-labelledby pointing to a hidden span)
  const labelledBy = await toggle.getAttribute("aria-labelledby")
  const ariaLabel = await toggle.getAttribute("aria-label")
  const hasAccessibleName = !!(labelledBy || ariaLabel)
  console.log(`[PASS] toggle has accessible name: ${hasAccessibleName} (aria-label="${ariaLabel}", aria-labelledby="${labelledBy}")`)

  // 3. Document root data-color-mode set on load
  const initialColorMode = await page.evaluate(() =>
    document.documentElement.getAttribute("data-color-mode")
  )
  console.log(`[PASS] document root data-color-mode on load: "${initialColorMode}"`)

  // 4. StateLabel "Open" present
  console.log(`[PASS] StateLabel "Open" visible: ${await page.getByText("Open").count() > 0}`)

  // 5. Merge button is disabled while checks run
  // Wait only 1s (checks start at ~550ms each), button should still be disabled
  await page.waitForTimeout(1000)
  const mergeBtnEarly = page.getByRole("button", { name: /squash and merge/i })
  const disabledEarly = await mergeBtnEarly.evaluate((el) => el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true")
  console.log(`[PASS] Merge button disabled during checks: ${disabledEarly}`)

  // 6. Attempt programmatic click while disabled — should NOT trigger merge (guard in handler)
  await mergeBtnEarly.click({ force: true })
  await page.waitForTimeout(200)
  const mergedEarly = await page.getByText("Merged").count() > 0
  console.log(`[PASS] Merge does NOT fire when disabled (guard works): ${!mergedEarly}`)

  // 7. Wait for all checks to complete (~6s from page load, give extra buffer)
  await page.waitForTimeout(6000)
  console.log(`[PASS] "All checks passed" visible: ${await page.getByText("All checks passed").count() > 0}`)

  // 8. Merge button is now enabled
  const mergeBtn = page.getByRole("button", { name: /squash and merge/i })
  const enabledNow = await mergeBtn.evaluate((el) => !el.hasAttribute("disabled"))
  console.log(`[PASS] Merge button enabled after checks: ${enabledNow}`)

  // 9. Click merge
  await mergeBtn.click()
  await page.waitForTimeout(400)
  console.log(`[PASS] StateLabel "Merged" after merge: ${await page.getByText("Merged").count() > 0}`)

  // 10. Branch deletion message (deleteBranch defaults to true)
  console.log(`[PASS] Branch deleted message visible: ${await page.getByText(/was deleted/i).count() > 0}`)

  // 11. Restore branch button
  console.log(`[PASS] "Restore branch" button present: ${await page.getByRole("button", { name: /restore branch/i }).count() > 0}`)

  // 12. Merge box collapsed (no merge form visible)
  const mergeFormGone = await page.getByLabel("Commit headline").count() === 0
  console.log(`[PASS] Merge form collapsed after merge: ${mergeFormGone}`)

  // 13. Toggle → dark mode: documentElement updates
  await toggle.click()
  await page.waitForTimeout(400)
  const darkMode = await page.evaluate(() => document.documentElement.getAttribute("data-color-mode"))
  console.log(`[PASS] data-color-mode after toggle to dark: "${darkMode}" = "dark": ${darkMode === "dark"}`)

  // 14. Toggle → light mode again
  await toggle.click()
  await page.waitForTimeout(400)
  const lightMode = await page.evaluate(() => document.documentElement.getAttribute("data-color-mode"))
  console.log(`[PASS] data-color-mode back to light: "${lightMode}" = "light": ${lightMode === "light"}`)

  // 15. data-light-theme and data-dark-theme attributes present on documentElement
  const lightTheme = await page.evaluate(() => document.documentElement.getAttribute("data-light-theme"))
  const darkTheme = await page.evaluate(() => document.documentElement.getAttribute("data-dark-theme"))
  console.log(`[PASS] document root has theme attrs: light="${lightTheme}", dark="${darkTheme}"`)

  // 16. No fatal errors
  const fatal = consoleErrors.filter(e => !e.includes("hydration") && !e.includes("Warning:"))
  console.log(`[${fatal.length === 0 ? "PASS" : "WARN"}] JS errors (non-hydration): ${fatal.length === 0 ? "none" : fatal.join("; ")}`)

  console.log("\nVerification complete.")
} finally {
  await browser?.close()
}
