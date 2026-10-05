import { test, expect } from '@playwright/test';

test('home defers strength bundle; skip link and walkthrough work by keyboard', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  expect(requests.some(url => url.includes('passwordStrength'))).toBe(false);
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to content')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Demo guide', exact: true }).click();
  await page.getByText('Before presenting: check this browser', { exact: true }).click();
  await page.getByRole('button', { name: 'Check demo readiness' }).click();
  await expect(page.getByText('Browser cryptography: ready')).toBeVisible();
  await page.getByRole('link', { name: 'Open signup', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});

test('offline signup labels mock verdict, sends nothing and mode change clears it', async ({ page }) => {
  let external = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { external++; return route.abort(); });
  await page.goto('/#signup');
  await page.getByLabel('Check source', { exact: true }).selectOption('practice');
  await page.getByRole('button', { name: 'Load breached demo' }).click();
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await expect(page.getByText('Mock corpus match', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
  await page.getByText('See actual processing stages', { exact: true }).click();
  await expect(page.getByText('Decision complete', { exact: true })).toBeVisible();
  expect(external).toBe(0);
  await page.getByLabel('Check source', { exact: true }).selectOption('live');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  await expect(page.getByText('Not checked', { exact: true })).toBeVisible();
});

test('explicit cancellation keeps signup closed after a late response', async ({ page }) => {
  let release;
  const gate = new Promise(r => { release = r; });
  await page.route('https://api.pwnedpasswords.com/**', async route => { await gate; await route.fulfill({ status: 200, body: `${'0'.repeat(35)}:0\r\n` }).catch(() => {}); });
  await page.goto('/#signup');
  await page.getByLabel('Email address').fill('judge@example.test');
  await page.getByLabel('Password', { exact: true }).fill('copper valley orbit falcon 782961');
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await page.getByRole('button', { name: 'Cancel check' }).click();
  release();
  await page.getByText('See actual processing stages', { exact: true }).click();
  await expect(page.getByText('Cancelled — submission blocked')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
});

test('mock export roundtrip, compatibility checks and print coverage', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.getByLabel('Check source', { exact: true }).selectOption('practice');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(page.getByText('1000 of 1000 processed')).toBeVisible({ timeout: 20000 });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report' }).click();
  const stream = await (await download).createReadStream();
  let body = ''; for await (const chunk of stream) body += chunk;
  const upload = text => ({ name: 'report.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await page.getByLabel('Report 1', { exact: true }).setInputFiles(upload(body));
  await page.getByLabel('Report 2', { exact: true }).setInputFiles(upload(body));
  await expect(page.getByText(/second minus first = 0 percentage points/)).toBeVisible();
  const changed = JSON.parse(body); changed.datasetId = 'different';
  await page.getByLabel('Report 2', { exact: true }).setInputFiles(upload(JSON.stringify(changed)));
  await expect(page.getByText(/Comparison blocked: different datasets/)).toBeVisible();
  if (process.env.HELLO_WORLD_VISUAL_QA) await page.screenshot({ path: '/tmp/hello-world-dashboard.png', fullPage: true });
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('region', { name: 'Printable security report' })).toBeVisible();
  await expect(page.getByText(/Coverage: 1000\/1000/)).toBeVisible();
  if (process.env.HELLO_WORLD_VISUAL_QA) await page.screenshot({ path: '/tmp/hello-world-print.png', fullPage: true });
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Account results' })).toBeHidden();
});
