import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('first screen explains the job, audience, actions, and facts at 390px', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Turn room music into full-screen visuals.');
  await expect(page.locator('.lede')).toContainText('party hosts, musicians, and venues');
  await expect(page.getByRole('button', { name: 'Listen to the room' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.locator('.hero-facts li')).toHaveCount(3);
  const bodyWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(bodyWidth.scroll).toBeLessThanOrEqual(bodyWidth.client);
});

test('complete first-screen guidance fits a 1440 by 900 display', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const visibleGuidance = await page.locator('.next-step, .hero-facts').evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom };
  }));
  expect(visibleGuidance).toHaveLength(2);
  for (const bounds of visibleGuidance) {
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(900);
  }
});

test('routes update metadata and Back and Forward restore focus and scroll', async ({ page }) => {
  await page.goto('/');
  const footerPrivacy = page.locator('footer a[href="/privacy"]');
  await footerPrivacy.scrollIntoViewIfNeeded();
  await footerPrivacy.focus();
  const homeScroll = await page.evaluate(() => window.scrollY);
  expect(homeScroll).toBeGreaterThan(500);
  await footerPrivacy.click();
  await expect(page).toHaveTitle('Privacy — Milkdrop Web');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://milkdrop-web.sociobot.in/privacy');
  await page.evaluate(() => window.scrollTo(0, 320));
  await expect.poll(async () => await page.evaluate(() => window.scrollY)).toBe(320);
  const privacyScroll = await page.evaluate(() => window.scrollY);
  await expect.poll(async () => await page.evaluate(() => history.state?.milkdropRoute?.scrollY)).toBe(privacyScroll);
  await page.goBack();
  await expect(page).toHaveTitle('Milkdrop Web — room music visualizer');
  await expect(footerPrivacy).toBeFocused();
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - homeScroll)).toBeLessThanOrEqual(2);
  await page.goForward();
  await expect(page).toHaveTitle('Privacy — Milkdrop Web');
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - privacyScroll)).toBeLessThanOrEqual(2);
});

test('server-returned 404 has complete metadata and the standard shell', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Milkdrop Web');
  await expect(page.locator('h1')).toHaveText('This page could not be found.');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Milkdrop Web');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://milkdrop-web.sociobot.in/assets/social-preview.jpg');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});

for (const route of ['/', '/demo', '/privacy', '/terms', '/about', '/missing-page']) {
  test(`axe and document structure pass on ${route}`, async ({ page }) => {
    await page.goto(route);
    if (route === '/demo') await expect(page.locator('#stage')).toHaveAttribute('data-started', 'true');
    expect(await page.locator('main').count()).toBe(1);
    expect(await page.locator('h1:visible').count()).toBe(1);
    expect(await page.locator('header:visible').count()).toBe(1);
    expect(await page.locator('footer:visible').count()).toBe(1);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    const undersizedTargets = await page.locator('a:visible, button:visible, input:visible, select:visible, summary:visible').evaluateAll((elements) => elements.filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width < 44 || bounds.height < 44;
    }).map((element) => element.textContent?.trim() || element.getAttribute('aria-label')));
    expect(undersizedTargets).toEqual([]);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
  });
}

test('demo dialogs return focus and all touch targets are large enough', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#controls-button').click();
  await expect(page.locator('#controls-dialog')).toBeVisible();
  await page.locator('#controls-dialog button[value="cancel"]').click();
  await expect(page.locator('#controls-button')).toBeFocused();
  const undersized = await page.locator('button:visible, a:visible').evaluateAll((elements) => elements.filter((element) => {
    const box = element.getBoundingClientRect();
    return box.width < 44 || box.height < 44;
  }).map((element) => ({ text: element.textContent?.trim(), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
  expect(undersized).toEqual([]);
});
