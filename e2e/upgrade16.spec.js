import { test, expect } from '@playwright/test';
const clear = route => route.fulfill({ status: 200, body: `${'0'.repeat(35)}:0\r\n` });

test('mobile navigation exposes every page and supports Escape and focus after routing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Explore pages' });
  await expect(page.getByRole('navigation')).toBeHidden();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(8);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation')).toBeHidden();
  await toggle.click();
  await page.getByRole('link', { name: 'Security dashboard', exact: true }).click();
  await expect(page.locator('main')).toBeFocused();
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.locator('h1')).toHaveText('Real checks. Demonstration data.');
});

test('reset with invalid optional email explains why submission is blocked', async ({ page }) => {
  await page.route('https://api.pwnedpasswords.com/**', clear);
  await page.goto('/#reset');
  const password = 'synthetic copper valley falcon 782961';
  await page.getByLabel('New password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await page.getByLabel('Email address').fill('invalid');
  await page.getByRole('button', { name: 'Check password securely' }).click();
  const submit = page.getByRole('button', { name: 'Simulate password reset' });
  await expect(submit).toBeDisabled();
  await expect(page.getByText(/Enter a valid email address or clear the optional field/)).toBeVisible();
  await page.getByLabel('Email address').fill('');
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText('Password reset simulated', { exact: true })).toBeVisible();
});

test('dashboard empty filter is explained and configuration clears dataset identity', async ({ page }) => {
  await page.route('https://api.pwnedpasswords.com/**', clear);
  await page.goto('/#dashboard');
  await page.getByLabel('Dataset size', { exact: true }).selectOption('20');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(page.getByText('20 of 20 processed')).toBeVisible();
  await page.getByLabel('Filter account results').selectOption('breached');
  await expect(page.getByRole('heading', { name: 'No results match this filter' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all results' }).click();
  await expect(page.getByRole('region', { name: 'Account results table' }).locator('tbody tr')).toHaveCount(10);
  await page.getByLabel('Dataset size', { exact: true }).selectOption('100');
  await expect(page.getByRole('region', { name: 'Printable security report' })).toContainText('Dataset: Not run');
  await expect(page.getByLabel('Filter account results')).toHaveValue('all');
  await expect(page.getByRole('button', { name: 'Export report', exact: true })).toBeDisabled();
});

test('mock filters and chart announce their actual source', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.getByLabel('Offline demonstration mode').check();
  await expect(page.getByLabel('Filter account results').locator('option[value="breached"]')).toHaveText('Mock match');
  await expect(page.getByRole('img', { name: /mock matches/ })).toBeVisible();
});

test('all routes fit small phones, tablets and desktop in both themes', async ({ page }) => {
  test.setTimeout(60000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://api.pwnedpasswords.com/**', clear);
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('Color theme').selectOption(theme);
      for (const route of ['home', 'signup', 'reset', 'dashboard', 'lab', 'architecture', 'privacy', 'policy']) {
        await page.evaluate(route => { location.hash = route; }, route);
        await expect(page.locator('h1')).toBeVisible();
        const layout = await page.evaluate(() => ({
          viewport: innerWidth,
          width: document.documentElement.scrollWidth,
          overflowing: [...document.querySelectorAll('body *')]
            .filter(el => el.getBoundingClientRect().right > innerWidth || el.scrollWidth > el.clientWidth + 1)
            .map(el => ({ tag: el.tagName, className: el.className, right: el.getBoundingClientRect().right, width: el.clientWidth, scrollWidth: el.scrollWidth })),
        }));
        expect(layout.width, `${width} ${theme} ${route}: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(layout.viewport);
        if (process.env.HELLO_WORLD_V16_VISUAL_QA && [390, 1440].includes(width)) {
          await page.screenshot({ path: `/tmp/hello-v16-${width}-${theme}-${route}.png`, fullPage: true });
        }
      }
    }
  }
  expect(errors).toEqual([]);
});

// Exercise larger mask glyphs so font-dependent overflow is reproducible on macOS too.
test('illustrative mask stays inside its card with wide fallback glyphs', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const mask = page.locator('.flow-secret > span');
  await mask.evaluate(el => { el.style.fontFamily = 'monospace'; el.style.fontSize = '26px'; });
  expect(await mask.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
