import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl'] });
const errors = [];
const results = [];

for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`${viewport.name}: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`${viewport.name}: ${error.message}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const h1 = await page.locator('h1:visible').count();
  await page.screenshot({ path: `/tmp/milkdrop-home-${viewport.name}.png`, fullPage: true });
  results.push({ route: '/', viewport: viewport.name, violations: axe.violations.map((item) => item.id), overflow, h1 });
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
let currentRoute = '';
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const expectedMissingDocument = currentRoute === '/not-a-route' && /Failed to load resource.+404/.test(message.text());
  if (!expectedMissingDocument) errors.push(`routes: ${message.text()}`);
});
page.on('pageerror', (error) => errors.push(`routes: ${error.message}`));
for (const route of ['/demo', '/privacy', '/terms', '/about', '/not-a-route']) {
  currentRoute = route;
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  if (route === '/demo') await page.locator('#stage[data-started="true"]').waitFor();
  const axe = await new AxeBuilder({ page }).analyze();
  results.push({ route, title: await page.title(), h1: await page.locator('h1:visible').count(), violations: axe.violations.map((item) => item.id) });
}
await page.screenshot({ path: '/tmp/milkdrop-demo-mobile.png' });
await browser.close();

const violations = results.flatMap((result) => result.violations);
console.log(JSON.stringify({ results, consoleErrors: errors }, null, 2));
if (violations.length || errors.length || results.some((result) => result.h1 !== 1 || ('overflow' in result && result.overflow > 0))) process.exitCode = 1;
