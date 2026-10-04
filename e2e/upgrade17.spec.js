import { test, expect } from '@playwright/test';

test('dashboard explains zero and partial coverage without classifying unknown as clear', async ({ page }) => {
  let calls = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => {
    calls++;
    return route.fulfill(calls === 1 ? { status: 200, body: `${'0'.repeat(35)}:0\r\n` } : { status: 503, body: 'unavailable' });
  });
  await page.goto('/#dashboard');
  const explanation = page.getByRole('region', { name: 'Understand this result' });
  await expect(explanation).toContainText('a percentage cannot be calculated');
  await expect(page.getByRole('region', { name: 'Run performance' })).toBeHidden();
  await page.getByLabel('Dataset size', { exact: true }).selectOption('20');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(explanation).toContainText('This report is incomplete');
  await expect(explanation).toContainText('0 matches ÷ 1 successful checks × 100 = 0%');
  await expect(explanation).toContainText('1 of 20 successfully checked (5% coverage)');
  await explanation.getByText('What do these numbers mean?', { exact: true }).click();
  await expect(explanation).toContainText('0 matches + 1 no match + 3 unknown + 16 pending = 20');
  await page.getByText('Technical details: requests, reuse and timing', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Run performance' })).toBeVisible();
});

test('complete mock explanation, JSON and print agree without live-breach claims', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.goto('/#dashboard');
  await page.getByLabel('Check source', { exact: true }).selectOption('practice');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  const explanation = page.getByRole('region', { name: 'Understand this result' });
  await expect(explanation).toContainText('230 mock matches ÷ 1000 successful checks × 100 = 23%', { timeout: 20000 });
  await expect(explanation).toContainText('1000 of 1000 successfully checked (100% coverage)');
  await expect(page.locator('.donut-label strong')).toHaveText('1000/1000');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report', exact: true }).click();
  const stream = await (await download).createReadStream();
  let body = ''; for await (const chunk of stream) body += chunk;
  expect(JSON.parse(body).report).toContain('match the local mock corpus');
  expect(JSON.parse(body).policyVersion).toBe('hello-world-1.5');
  await page.emulateMedia({ media: 'print' });
  const report = page.getByRole('region', { name: 'Printable security report' });
  await expect(report).toContainText('23% of test accounts match the local mock corpus');
  await expect(report).toBeVisible();
  await expect(explanation).toBeHidden();
  expect(requests).toBe(0);
});
