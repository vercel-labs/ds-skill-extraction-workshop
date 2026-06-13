import { chromium } from 'playwright';
const url = 'http://localhost:3001';
const b = await chromium.launch();
for (const scheme of ['light','dark']) {
  const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(8000);
  await p.screenshot({ path: `/tmp/theater18-${scheme}.png`, fullPage: true });
  console.log(scheme, 'shot done');
  await ctx.close();
}
await b.close();
