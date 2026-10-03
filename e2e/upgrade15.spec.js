import { test, expect } from '@playwright/test';

const noMatch = route => route.fulfill({ status: 200, body: `${'0'.repeat(35)}:0\r\n` });

test('system theme follows OS; manual themes preserve a pending check and keep storage empty', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  await page.route('https://api.pwnedpasswords.com/**', async route => { await pending; await noMatch(route); });
  await page.goto('/#signup');
  await expect(page.getByLabel('Color theme')).toHaveValue('system');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(12, 22, 37)');
  await page.getByLabel('Email address').fill('judge@example.test');
  await page.getByLabel('Password', { exact: true }).fill('copper valley orbit falcon 782961');
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await page.getByLabel('Color theme').selectOption('light');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('copper valley orbit falcon 782961');
  await expect(page.getByRole('button', { name: 'Cancel check', exact: true })).toBeVisible();
  finish();
  await expect(page.getByText('No known breach found', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeEnabled();
  await page.getByRole('link', { name: 'Security dashboard', exact: true }).click();
  await expect(page.getByLabel('Color theme')).toHaveValue('light');
  await page.getByLabel('Color theme').selectOption('dark');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('dashboard explains 100 and 20 input mixes without claiming employee access', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.getByText('Why does the percentage often repeat?', { exact: true }).click();
  const mix = page.getByRole('region', { name: 'Dataset composition' });
  await expect(mix.getByRole('heading', { name: 'Synthetic accounts. No employee passwords.' })).toBeVisible();
  await expect(mix.getByText('23', { exact: true })).toBeVisible();
  await expect(mix.getByText('77', { exact: true })).toBeVisible();
  await page.getByLabel('Dataset size', { exact: true }).selectOption('20');
  await expect(mix.getByText('5', { exact: true })).toBeVisible();
  await expect(mix.getByText('15', { exact: true })).toBeVisible();
  await expect(mix.getByText(/yields 25%/)).toBeVisible();
  await page.getByLabel('Offline demonstration mode').check();
  await page.getByText('Why does the percentage often repeat?', { exact: true }).click();
  await expect(mix.getByText('230', { exact: true })).toBeVisible();
  await expect(mix.getByText('LOCAL MOCK RESPONSES', { exact: true })).toBeVisible();
});

test('a delayed expiry timer cannot permit a stale simulated submission', async ({ page }) => {
  await page.clock.install();
  await page.route('https://api.pwnedpasswords.com/**', noMatch);
  await page.goto('/#signup');
  await page.getByLabel('Email address').fill('judge@example.test');
  await page.getByLabel('Password', { exact: true }).fill('copper valley orbit falcon 782961');
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeEnabled();
  const time = await page.evaluate(() => Date.now());
  // Change wall-clock time without running timeout callbacks (background-tab delay).
  await page.clock.setSystemTime(time + 300001);
  await page.getByRole('button', { name: 'Simulate account creation' }).click();
  await expect(page.getByText('Check expired', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
  await expect(page.getByText('Account creation simulated', { exact: true })).toHaveCount(0);
});

test('one lab scenario reports one test, exports honest scope and makes no network request', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.goto('/#lab');
  await page.getByRole('button', { name: 'Run scenario: Strong, but already exposed', exact: true }).click();
  await expect(page.getByText('1 of 1 completed · 1 passed · complete.', { exact: true })).toBeVisible();
  await expect(page.getByText('PASS: the expected rejection and all scenario checks matched.', { exact: true })).toBeVisible();
  await expect(page.getByText('NOT RUN', { exact: true })).toHaveCount(8);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export evidence' }).click();
  const stream = await (await download).createReadStream();
  let body = ''; for await (const chunk of stream) body += chunk;
  expect(JSON.parse(body).totalScenarios).toBe(1);
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Run tests again', exact: true }).click();
  await expect(page.getByText('9 of 9 completed · 9 passed · complete.', { exact: true })).toBeVisible();
});

test('dark mode fits phone routes and print stays white', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Color theme').selectOption('dark');
  for (const route of ['signup', 'reset', 'dashboard', 'lab', 'architecture', 'privacy', 'policy', 'home']) {
    await page.evaluate(route => { location.hash = route; }, route);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.evaluate(() => { location.hash = 'dashboard'; });
  await expect(page.getByRole('region', { name: 'Printable security report' })).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  expect(await page.getByRole('region', { name: 'Printable security report' }).evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
  await expect(page.getByLabel('Color theme')).toBeHidden();
});

// Optional local visual review; never enabled in the normal CI suite.
if (process.env.HELLO_WORLD_V15_VISUAL_QA) test('visual review of every route in both themes', async ({ page }) => {
  test.setTimeout(60000);
  await page.route('https://api.pwnedpasswords.com/**', noMatch);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.getByLabel('Color theme').selectOption(theme);
    for (const route of ['home', 'signup', 'reset', 'dashboard', 'lab', 'architecture', 'privacy', 'policy']) {
      await page.evaluate(route => { location.hash = route; }, route);
      await expect(page.locator('h1')).toBeVisible();
      if (route === 'signup') {
        await page.getByRole('button', { name: 'Load breached demo' }).click();
        await page.getByRole('button', { name: 'Check password securely' }).click();
        await expect(page.getByText('No known breach found', { exact: true })).toBeVisible();
      }
      if (route === 'lab') {
        await page.getByRole('button', { name: 'Run security tests', exact: true }).click();
        await expect(page.getByText('9 of 9 completed · 9 passed · complete.', { exact: true })).toBeVisible();
      }
      await page.screenshot({ path: `/tmp/hello-v15-${theme}-${route}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['home', 'signup', 'dashboard', 'lab']) {
    await page.evaluate(route => { location.hash = route; }, route);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: `/tmp/hello-v15-phone-${route}.png`, fullPage: true });
  }
});
