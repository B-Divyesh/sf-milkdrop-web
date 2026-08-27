import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(base, { waitUntil: 'networkidle' });
const landing = await new AxeBuilder({ page }).analyze();
await page.screenshot({ path: '/tmp/milkdrop-landing-mobile.png', fullPage: true });
await page.getByRole('button', { name: 'Preview without a mic' }).evaluate((button) => {
  const help = document.querySelector('#permission-help');
  help?.removeAttribute('hidden');
  button.click();
});
await page.locator('#stage:not([hidden])').waitFor({ timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/milkdrop-stage-mobile.png' });
const stage = await new AxeBuilder({ page }).analyze();

for (const route of ['/privacy', '/terms', '/about']) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const h1Count = await page.locator('h1').count();
  if (h1Count !== 1) errors.push(`${route} has ${h1Count} h1 elements`);
}

await browser.close();
const serious = [...landing.violations, ...stage.violations].filter((result) => result.impact === 'serious' || result.impact === 'critical');
console.log(JSON.stringify({ landingViolations: landing.violations.length, stageViolations: stage.violations.length, serious: serious.map((item) => item.id), consoleErrors: errors }, null, 2));
if (serious.length || errors.length) process.exitCode = 1;
