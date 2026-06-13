import { chromium } from 'playwright';
const url = 'http://localhost:3001';
const b = await chromium.launch();
for (const scheme of ['light','dark']) {
  const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(8000); // let checks resolve to ready
  // click the primary merge button (text varies with method: "... and merge")
  const btn = p.getByRole('button', { name: /merge/i }).last();
  await btn.click().catch(async () => {
    // fallback: any button containing "merge"
    await p.locator('button:has-text("merge")').last().click();
  });
  await p.waitForTimeout(2500); // let the Open->Merged flip + confirmation settle
  await p.screenshot({ path: `/tmp/theater18-merged-${scheme}.png`, fullPage: true });
  console.log(scheme, 'merged shot done');
  await ctx.close();
}
await b.close();
