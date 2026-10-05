import { test, expect } from '@playwright/test';

test('scenario browsing preserves evidence and export scope until a new run', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.goto('/#lab');
  const detail = page.getByRole('region', { name: 'Selected scenario', exact: true });
  const picker = page.getByRole('region', { name: 'Choose a scenario' });
  await expect(detail.getByText('Not tested yet', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run scenario: Strong, but already exposed', exact: true }).click();
  await expect(detail.getByRole('heading', { name: 'PASS · Correct rejection' })).toBeVisible();
  await picker.getByRole('button', { name: /Policy passes; no match/ }).click();
  await expect(detail.getByText('Not tested yet', { exact: true })).toBeVisible();
  await expect(page.getByText(/Export scope: one scenario · 1 completed/)).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export evidence' }).click();
  const stream = await (await download).createReadStream();
  let body = ''; for await (const part of stream) body += part;
  const report = JSON.parse(body);
  expect(report.version).toBe('1.9.0');
  expect(report.scenarioIds).toEqual(['strong-breached']);
  expect(report.results.map(row => row.id)).toEqual(['strong-breached']);
  await picker.getByRole('button', { name: /Strong, but already exposed/ }).click();
  await expect(detail.getByRole('heading', { name: 'PASS · Correct rejection' })).toBeVisible();
  await picker.getByRole('button', { name: /Policy passes; no match/ }).click();
  await page.getByRole('button', { name: 'Run scenario: Policy passes; no match', exact: true }).click();
  await expect(detail.getByRole('heading', { name: 'PASS · Correct permission' })).toBeVisible();
  await picker.getByRole('button', { name: /Strong, but already exposed/ }).click();
  await expect(detail.getByText('Not tested yet', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('cancelled lab run stays incomplete and never grants unrun scenarios a verdict', async ({ page }) => {
  await page.clock.install();
  await page.goto('/#lab');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.getByRole('button', { name: 'Run security tests', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel tests', exact: true }).click();
  await page.clock.runFor(100);
  await expect(page.getByText('0 of 9 completed · 0 passed · cancelled.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export evidence' })).toBeDisabled();
  await expect(page.getByText('NOT RUN', { exact: true })).toHaveCount(9);
});

test('Lab explanations and technical evidence fit 320px in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#lab');
  for (const theme of ['light', 'dark']) {
    await page.getByLabel('Color theme').selectOption(theme);
    await page.getByRole('region', { name: 'Choose a scenario' }).getByRole('button', { name: /Service unavailable/ }).click();
    await page.getByRole('button', { name: 'Run scenario: Service unavailable', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'PASS · Correct rejection' })).toBeVisible();
    const technical = page.locator('.lab-technical');
    if ((await technical.getAttribute('open')) === null) await technical.locator('summary').click();
    await expect(technical.getByText('UNAVAILABLE', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
