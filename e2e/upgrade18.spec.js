import { test, expect } from '@playwright/test';

test('compact guide is optional, navigable and readiness makes no HIBP request', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Demo guide', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('article', { name: 'Current demo step' })).toHaveCount(0);
  await toggle.click();
  await page.getByRole('button', { name: '3 Inspect what leaves the browser' }).click();
  await expect(page.getByRole('article', { name: 'Current demo step' })).toContainText('Keep signup open');
  await expect(page.getByRole('link', { name: 'Open signup evidence' })).toHaveAttribute('href', '#signup');
  await page.getByText('Before presenting: check this browser', { exact: true }).click();
  await page.getByRole('button', { name: 'Check demo readiness' }).click();
  await expect(page.getByText('Browser cryptography: ready')).toBeVisible();
  expect(requests).toBe(0);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('source change aborts live work and never reuses approval in practice', async ({ page }) => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('https://api.pwnedpasswords.com/**', async route => { await pending; await route.fulfill({status:200,body:`${'0'.repeat(35)}:0\r\n`}).catch(()=>{}); });
  await page.goto('/#signup');
  await page.getByRole('button', { name: 'Generate random demo' }).click();
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await page.getByRole('button', { name: 'Cancel check', exact: true }).waitFor();
  await page.getByLabel('Check source', { exact: true }).selectOption('practice');
  release();
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
  await expect(page.locator('#source-scope')).toContainText('Mock results only');
  await page.getByRole('button', { name: 'Demo guide', exact: true }).click();
  await page.getByRole('button', { name: '3 Inspect what leaves the browser' }).click();
  await expect(page.getByRole('article', { name: 'Current demo step' })).toContainText('has no live prefix evidence');
});

test('guide fits phones in both themes and source copy respects page-specific modes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#lab');
  await expect(page.locator('#source-scope')).toHaveText('This Lab always uses mock responses.');
  await page.getByRole('button', { name: 'Demo guide', exact: true }).click();
  for (const theme of ['light', 'dark']) {
    await page.getByLabel('Color theme').selectOption(theme);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: '4 Explain the report' }).click();
  await page.getByRole('link', { name: 'Open dashboard', exact: true }).click();
  await expect(page.locator('#source-scope')).toHaveText('Choose this dashboard’s source below.');
  await expect(page.locator('.release-info')).toHaveText(/v1\.9\.0 · Policy hello-world-1\.5 · Build (local|[a-f0-9]{12})$/);
});
