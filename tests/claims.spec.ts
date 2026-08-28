import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { installMicrophoneStub } from './helpers';

test('@claim:demo-sample sample signal runs and changes the visual', async ({ page }) => {
  await page.goto('/?demo=1');
  const stage = page.locator('#stage');
  await expect(stage).toHaveAttribute('data-mode', 'demo');
  await expect(page.locator('#input-label')).toHaveText('Sample track · 120 BPM');
  await expect(page.locator('#tempo-value')).toHaveText('120 BPM');
  await expect.poll(async () => Number(await stage.getAttribute('data-frame-count'))).toBeGreaterThan(5);
  expect(await page.locator('#visual-canvas').evaluate((canvas: HTMLCanvasElement) => Boolean(canvas.getContext('webgl')))).toBe(true);
  await expect.poll(async () => Number(await stage.getAttribute('data-beat-count')), { timeout: 12_000 }).toBeGreaterThanOrEqual(16);
  await expect(page.locator('#preset-name')).toHaveText('Pollen orbit');
  await page.locator('#next-preset').click();
  await expect(page.locator('#preset-name')).toHaveText('Moss tide');
});

test('@claim:demo-isolation demo does not touch real data or other origins', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.addInitScript(() => {
    localStorage.setItem('milkdrop:preset', '6');
    localStorage.setItem('milkdrop:preferences', '{"palette":"coral"}');
    localStorage.setItem('sb_license:milkdrop-web', 'real-license');
  });
  await page.goto('/?demo=1');
  await page.locator('#next-preset').click();
  await page.locator('#controls-button').click();
  await page.locator('#palette-select').selectOption('plum');
  await page.locator('#controls-dialog button[value="default"]').click();
  const stored = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
  expect(stored).toEqual({
    'milkdrop:preset': '6',
    'milkdrop:preferences': '{"palette":"coral"}',
    'sb_license:milkdrop-web': 'real-license',
  });
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  await page.locator('#reset-demo').click();
  await expect(page.locator('#preset-name')).toHaveText('Fern echo');
  await page.locator('#start-real').click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('#demo-banner')).toBeHidden();
});

test('@claim:microphone-privacy microphone uses local analysis without recording or uploads', async ({ page }) => {
  await installMicrophoneStub(page);
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/');
  await page.locator('#start-button').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'microphone');
  const evidence = await page.evaluate(() => {
    const scope = window as typeof window & { __micConstraints?: MediaStreamConstraints; __mediaRecorderCalls?: number; __speechRecognitionCalls?: number };
    return { constraints: scope.__micConstraints, mediaRecorderCalls: scope.__mediaRecorderCalls || 0, speechCalls: scope.__speechRecognitionCalls || 0, indexedDB: 'databases' in indexedDB };
  });
  expect(evidence.constraints).toEqual({ audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false, channelCount: 1 }, video: false });
  expect(evidence.mediaRecorderCalls).toBe(0);
  expect(evidence.speechCalls).toBe(0);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await page.evaluate(() => Object.keys(localStorage).every((key) => !/audio|record|blob/i.test(key)))).toBe(true);
  await page.locator('#stop-button').evaluate((button: HTMLButtonElement) => button.click());
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => Boolean((window as typeof window & { __microphoneStopped?: boolean }).__microphoneStopped))).toBe(true);
});

test('@claim:offline-reload demo reloads and remains usable offline', async ({ page, context }) => {
  const cdp = await context.newCDPSession(page);
  await page.goto('/?demo=1');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => {
    const script = document.querySelector<HTMLScriptElement>('script[type="module"]');
    return Boolean(script && await caches.match(new URL(script.src).pathname));
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await cdp.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'demo');
  await page.locator('#next-preset').click();
  await expect(page.locator('#preset-name')).toHaveText('Pollen orbit');
  await expect(page.locator('#offline-banner')).toBeVisible();
});

test('@claim:visual-count eight visuals are free and Venue Pack adds four', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('.preset-chip')).toHaveCount(12);
  await expect(page.locator('.preset-chip.locked')).toHaveCount(4);
  await expect(page.locator('.preset-chip:not(.locked)')).toHaveCount(8);
  await page.locator('.preset-chip').nth(7).click();
  await expect(page.locator('#preset-name')).toHaveText('Lichen rings');
  await page.locator('.preset-chip').nth(8).click();
  await expect(page.locator('#venue-dialog')).toBeVisible();
});

test('@claim:venue-pack paid tools produce the stated local outcomes', async ({ page }) => {
  await installMicrophoneStub(page);
  const verificationRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/products/milkdrop-web/verify')) verificationRequests.push(request.url());
  });
  await page.goto('/?demo=1');
  await page.locator('#start-real').click();
  await page.evaluate(() => {
    localStorage.setItem('sb_license:milkdrop-web', 'sandbox-license');
    localStorage.setItem('sb_license:milkdrop-web:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await page.locator('#start-button').click();
  await page.locator('#controls-button').click();
  await expect(page.locator('#venue-tools')).toBeVisible();
  await page.locator('#logo-file').setInputFiles({ name: 'sample-logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="green"/></svg>') });
  await expect(page.locator('#venue-logo')).toBeVisible();
  expect(await page.locator('#venue-logo').getAttribute('src')).toMatch(/^blob:/);
  await page.locator('#four-k').check();
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls-dialog')).toBeHidden();
  await expect(page.locator('#visual-canvas')).toHaveAttribute('data-resolution-cap', '3840x2160');
  await page.locator('#venue-dialog').evaluate((dialog: HTMLDialogElement) => dialog.showModal());
  await expect(page.locator('#venue-dialog')).toContainText('One-time license · $19 USD');
  await expect(page.locator('#venue-dialog')).toContainText('Sociobot/Dodo is the merchant of record');
  await expect(page.locator('#venue-dialog a[href*="/checkout"]')).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/milkdrop-web/checkout');
  expect(verificationRequests).toHaveLength(0);
  await page.evaluate(() => {
    localStorage.setItem('sb_license:milkdrop-web:verdict', JSON.stringify({ valid: false, checkedAt: Date.now() }));
  });
  await page.reload();
  await page.locator('#start-button').click();
  await page.locator('#controls-button').click();
  await expect(page.locator('#venue-tools')).toBeHidden();
  await expect(page.locator('.preset-chip.locked')).toHaveCount(4);
});

test('@claim:controls-access controls work by touch and keyboard', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#next-preset').click();
  await expect(page.locator('#preset-name')).toHaveText('Pollen orbit');
  await page.locator('#controls-button').click();
  await page.locator('#palette-select').selectOption('coral');
  await page.locator('#intensity').fill('60');
  await page.locator('#sensitivity').fill('65');
  await page.locator('#auto-rotate').uncheck();
  await page.locator('#controls-dialog button[value="default"]').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-palette', 'coral');
  await expect(page.locator('#stage')).toHaveAttribute('data-intensity', '60');
  await expect(page.locator('#stage')).toHaveAttribute('data-sensitivity', '65');
  await expect(page.locator('#palette-select option')).toHaveCount(4);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#preset-name')).toHaveText('Fern echo');
  await page.keyboard.press('h');
  await expect(page.locator('#stage')).toHaveClass(/chrome-hidden/);
  await page.keyboard.press('h');
  await page.keyboard.press('c');
  await expect(page.locator('#controls-dialog')).toBeVisible();
  await page.locator('#controls-dialog button[value="cancel"]').click();
  await page.keyboard.press('f');
  await expect(page.locator('#stage')).toHaveAttribute('data-fullscreen', 'true');
  await page.keyboard.press('f');
  await page.keyboard.press('Space');
  await expect(page).toHaveURL('/');
  await expect(page.locator('#start-button')).toBeFocused();
});

test('@claim:phone-pairing pairing controls the screen and has a recoverable failure path', async ({ page, context }) => {
  test.setTimeout(45_000);
  await page.goto('/?demo=1');
  await page.locator('#remote-button').click();
  const code = await page.locator('#room-code').textContent();
  expect(code).toMatch(/^[A-Z2-9]{6}$/);
  const phone = await context.newPage();
  await phone.goto(`/?remote=${code}`);
  await expect(page.locator('#remote-status')).toContainText('Phone connected', { timeout: 15_000 });
  await expect(phone.locator('#phone-status')).toContainText('Connected to the display');
  await phone.getByRole('button', { name: 'Next visual' }).click();
  await expect(page.locator('#preset-name')).toHaveText('Pollen orbit');
  await phone.close();
  await page.locator('#remote-dialog .dialog-close').click();
  await page.reload();
  await context.setOffline(true);
  await page.locator('#remote-button').click();
  await expect(page.locator('#remote-dialog')).toBeVisible();
  await expect(page.locator('#room-code')).not.toHaveText('Preparing…');
  await expect(page.locator('#remote-status')).toContainText('needs internet access');
  await expect(page.locator('#stage')).toHaveAttribute('data-started', 'true');
});

test('@claim:art-provenance art notes expose the shipped provenance', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#start-real').click();
  await page.locator('footer a[href="/about"]').click();
  await expect(page).toHaveURL('/about');
  await expect(page.locator('main')).toContainText('Azure OpenAI image generator');
  await expect(page.locator('main')).toContainText('27 August 2026');
  await expect(page.locator('main')).toContainText('assets/src/');
  await expect(page.locator('main')).toContainText('public/assets/');
});

test('@claim:static-build production build emits the static deploy contract', async ({ page }) => {
  await page.goto('/?demo=1');
  expect(existsSync('dist/index.html')).toBe(true);
  expect(existsSync('dist/staticwebapp.config.json')).toBe(true);
  expect(existsSync('dist/sw.js')).toBe(true);
  const staticConfig = JSON.parse(readFileSync('dist/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: Array<{ rewrite?: string; statusCode?: number }>;
    responseOverrides: Record<string, { rewrite: string }>;
  };
  expect(staticConfig.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(staticConfig.responseOverrides['404'].rewrite).toBe('/404.html');
  expect(staticConfig.routes.every((route) => !(route.rewrite && route.statusCode))).toBe(true);
  const initialJs = readdirSync('dist/assets').filter((name) => /^index-.*\.js$/.test(name));
  expect(initialJs).toHaveLength(1);
  expect(statSync(`dist/assets/${initialJs[0]}`).size).toBeLessThan(200_000);
});
