import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = await mkdtemp(join(tmpdir(), 'milkdrop-pwa-'));
const first = join(root, 'first');
const second = join(root, 'second');
await cp('dist', first, { recursive: true });
await cp('dist', second, { recursive: true });
const secondIndex = join(second, 'index.html');
await writeFile(secondIndex, (await readFile(secondIndex, 'utf8')).replace('Milkdrop Web — sound grows here', 'Milkdrop Web — updated field guide'));
const regeneration = spawnSync(process.execPath, ['scripts/generate-sw.mjs', second], { encoding: 'utf8' });
if (regeneration.status !== 0) throw new Error(regeneration.stderr || 'Could not generate the update worker');

let active = first;
const mimes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp' };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    const body = await readFile(join(active, file));
    response.writeHead(200, { 'Content-Type': mimes[extname(file)] || 'application/octet-stream', 'Cache-Control': file === 'sw.js' ? 'no-cache' : 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('No local test address');
const base = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl'] });
const context = await browser.newContext();
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.clearBrowserCache');
const failures = [];
page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
page.on('pageerror', (error) => failures.push(error.message));

try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await cdp.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#page-title').waitFor();
  const assetUrls = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"], script[type="module"]')].map((element) => element instanceof HTMLScriptElement ? element.src : element.href));
  const cachedTypes = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url);
      return { url, ok: response.ok, type: response.headers.get('content-type') || '' };
    } catch (error) {
      return { url, ok: false, type: String(error) };
    }
  })), assetUrls);
  if (cachedTypes.some((result) => !result.ok || !/^(text\/css|text\/javascript|application\/javascript)/.test(result.type))) {
    throw new Error(`Offline shell assets have incorrect MIME types: ${JSON.stringify(cachedTypes)}`);
  }

  await context.setOffline(false);
  active = second;
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting), undefined, { timeout: 10_000 });
  await page.locator('#update-banner:not([hidden])').waitFor();
  await page.locator('#update-button').click();
  await page.waitForFunction(() => document.title === 'Milkdrop Web — updated field guide', undefined, { timeout: 10_000 });
  if (failures.length) throw new Error(`Browser errors: ${failures.join('; ')}`);
  console.log(JSON.stringify({ offlineReload: 'passed', cachedAssetMimeTypes: cachedTypes, appOnlyUpdate: 'passed' }, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
