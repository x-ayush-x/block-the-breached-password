import { test, expect } from '@playwright/test';

test('lab runs offline, explains rejection and exports only non-sensitive evidence', async ({ page }) => {
  const external = [];
  await page.route('https://api.pwnedpasswords.com/**', route => { external.push(route.request().url()); return route.abort(); });
  await page.goto('/#lab');
  await expect(page.getByRole('heading', { name: 'Show the decision. Test the failure.' })).toBeVisible();
  await page.getByRole('button', { name: 'Run security tests', exact: true }).click();
  await expect(page.getByText('9 of 9 completed · 9 passed · complete.', { exact: true })).toBeVisible();
  expect(external).toEqual([]);
  const card = page.locator('.lab-card').filter({ has: page.getByRole('heading', { name: 'Strong, but already exposed' }) });
  await expect(card.getByText('Strong', { exact: true })).toBeVisible();
  await expect(card.getByText('Block submission', { exact: true })).toHaveCount(2);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export evidence' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('security-lab-evidence.json');
  const stream = await file.createReadStream();
  let text = ''; for await (const chunk of stream) text += chunk.toString();
  const report = JSON.parse(text);
  expect(report.passed).toBe(9);
  expect(report.source).toContain('NOT LIVE HIBP');
  for (const row of report.results) for (const key of ['password', 'prefix', 'suffix', 'hash', 'email']) expect(row).not.toHaveProperty(key);
  await page.getByRole('button', { name: 'Run tests again' }).click();
  await expect(page.getByText('9 of 9 completed · 9 passed · complete.', { exact: true })).toBeVisible();
});

test('lab fits a phone and clears results after leaving', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#lab');
  await page.getByRole('button', { name: 'Run security tests', exact: true }).click();
  await expect(page.getByText('9 of 9 completed · 9 passed · complete.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await page.getByRole('link', { name: 'Security test lab', exact: true }).click();
  await expect(page.getByText('Ready. No tests have run yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export evidence' })).toBeDisabled();
});
