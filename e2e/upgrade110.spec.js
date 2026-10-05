import { test, expect } from '@playwright/test';
const demo = 'synthetic valley copper orbit 782961';
const clear = route => route.fulfill({ status: 200, body: `${'0'.repeat(35)}:0\r\n` });

test('whole-form guidance explains email blockers and clears approval on password edits', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return clear(route); });
  await page.goto('/#signup');
  const next = page.locator('#submission-next-step');
  await page.getByLabel('Password', { exact: true }).fill(demo);
  await expect(next).toContainText('Typing alone never starts a breach lookup');
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await expect(next).toContainText('Enter a valid email address');
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
  await page.getByLabel('Email address', { exact: true }).fill('judge@example.test');
  await expect(next).toContainText('You can run the simulation');
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeEnabled();
  await page.getByLabel('Password', { exact: true }).fill(demo + 'x');
  await expect(next).toContainText('Select Check password securely');
  await expect(page.getByRole('button', { name: 'Simulate account creation' })).toBeDisabled();
  expect(requests).toBe(1);
});

test('reset guidance handles confirmation and unknown service result without permission', async ({ page }) => {
  await page.route('https://api.pwnedpasswords.com/**', clear);
  await page.goto('/#reset');
  await page.getByLabel('New password', { exact: true }).fill(demo);
  await page.getByRole('button', { name: 'Check password securely' }).click();
  const next = page.locator('#submission-next-step');
  await expect(next).toContainText('Confirm the same password');
  await page.getByLabel('Confirm password', { exact: true }).fill(demo);
  await expect(page.getByRole('button', { name: 'Simulate password reset' })).toBeEnabled();
  await page.route('https://api.pwnedpasswords.com/**', route => route.fulfill({status:503, body:''}));
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await expect(next).toContainText('No approval is granted by a failed check');
  await expect(page.getByRole('button', { name: 'Simulate password reset' })).toBeDisabled();
});

test('mock checklist and actual stages remain readable on small phones', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.setViewportSize({ width:320, height:900 });
  await page.goto('/#signup');
  await page.getByLabel('Check source', { exact: true }).selectOption('practice');
  await page.getByRole('button', { name: 'Load breached demo' }).click();
  await page.getByRole('button', { name: 'Check password securely' }).click();
  await expect(page.getByRole('region', { name:'Submission requirements' })).toContainText('Mock match found');
  await page.getByText('See actual processing stages', { exact:true }).click();
  await expect(page.getByText('Decision complete', { exact:true })).toBeVisible();
  for (const theme of ['light','dark']) {
    await page.getByLabel('Color theme').selectOption(theme);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(requests).toBe(0);
});
