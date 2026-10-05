import { test, expect } from '@playwright/test';
const report = (overrides = {}) => ({ schema:'hello-world-report-1', mode:'benchmark', datasetId:'fixed-demo', policyVersion:'hello-world-1.5', scenario:'normal', phase:'complete', finishedAt:'2026-10-05T00:00:00Z', summary:{total:1000,tested:1000,breached:230,clear:770,unknown:0,pending:0,percentage:23}, ...overrides });
const file = value => ({name:'demo-report.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});

test('comparison explains all blockers, clears files and replaces stale results on invalid import', async ({ page }) => {
  await page.goto('/#dashboard');
  const panel = page.getByRole('region',{name:'Compare exported reports',exact:true});
  await panel.getByLabel('Report 1',{exact:true}).setInputFiles(file(report()));
  await panel.getByLabel('Report 2',{exact:true}).setInputFiles(file(report({mode:'live',scenario:null,datasetId:'other',policyVersion:'other',phase:'cancelled'})));
  await expect(panel.getByRole('heading',{name:'Comparison unavailable'})).toBeVisible();
  await expect(panel.getByRole('region',{name:'Comparison compatibility'}).getByText(/^Blocked ·/)).toHaveCount(5);
  await expect(panel.getByText(/second minus first/)).toHaveCount(0);
  await panel.getByLabel('Report 2',{exact:true}).setInputFiles(file(report()));
  await expect(panel.getByText(/second minus first = 0 percentage points/)).toBeVisible();
  await panel.getByLabel('Report 2',{exact:true}).setInputFiles(file({schema:'wrong'}));
  await expect(panel.getByText(/Invalid or unsupported report/)).toBeVisible();
  await expect(panel.getByText(/second minus first/)).toHaveCount(0);
  await panel.getByRole('button',{name:'Remove report 2'}).click();
  await expect(panel.getByRole('region',{name:'Report 2 summary'})).toContainText('No report selected.');
  await expect(panel.getByLabel('Report 2',{exact:true})).toHaveValue('');
});

test('comparison handles partial coverage and long identities on a phone without network calls', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => {requests++;return route.abort();});
  await page.setViewportSize({width:320,height:900});
  await page.goto('/#dashboard');
  const panel = page.getByRole('region',{name:'Compare exported reports',exact:true});
  const partial = report({datasetId:'x'.repeat(160), phase:'interrupted', summary:{total:1000,tested:0,breached:0,clear:0,unknown:1,pending:999,percentage:null}});
  await panel.getByLabel('Report 1',{exact:true}).setInputFiles(file(partial));
  await panel.getByLabel('Report 2',{exact:true}).setInputFiles(file(partial));
  await expect(panel.getByText('Blocked · Complete successful coverage',{exact:true})).toBeVisible();
  await expect(panel.getByText('Unavailable · successful checks only',{exact:true})).toHaveCount(2);
  for(const theme of ['light','dark']){
    await page.getByLabel('Color theme').selectOption(theme);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(requests).toBe(0);
});

test('removing a report while its file is reading prevents a late result from returning', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      const value = original.call(this);
      return new Promise(resolve => { window.finishDemoRead = async () => resolve(await value); });
    };
  });
  const panel = page.getByRole('region',{name:'Compare exported reports',exact:true});
  await panel.getByLabel('Report 1',{exact:true}).setInputFiles(file(report()));
  await expect(panel.getByText('Reading and validating…',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Remove report 1'}).click();
  await page.evaluate(async () => { await window.finishDemoRead(); });
  await expect(panel.getByRole('region',{name:'Report 1 summary'})).toContainText('No report selected.');
  await expect(panel.getByText('MOCK · local synthetic corpus',{exact:true})).toHaveCount(0);
});
