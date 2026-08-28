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

test('routes update metadata, focus headings, and support back navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveTitle('Privacy — Milkdrop Web');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://milkdrop-web.sociobot.in/privacy');
  await page.goBack();
  await expect(page).toHaveTitle('Milkdrop Web — room music visualizer');
  await expect(page.locator('h1')).toBeFocused();
  await page.goto('/this-route-does-not-exist');
  await expect(page).toHaveTitle('Page not found — Milkdrop Web');
  await expect(page.locator('h1')).toHaveText('This page is not in the field guide.');
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});

for (const route of ['/', '/demo', '/privacy', '/terms', '/about', '/missing-page']) {
  test(`axe and document structure pass on ${route}`, async ({ page }) => {
    await page.goto(route);
    if (route === '/demo') await expect(page.locator('#stage')).toHaveAttribute('data-started', 'true');
    expect(await page.locator('main').count()).toBe(1);
    expect(await page.locator('h1:visible').count()).toBe(1);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
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
