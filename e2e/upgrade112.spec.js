import { test, expect } from '@playwright/test';

test('compact cues use keyboard focus and preserve same-page input without sending requests', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.pwnedpasswords.com/**', route => { requests++; return route.abort(); });
  await page.goto('/#signup');
  await page.getByLabel('Password', { exact:true }).fill('synthetic valley copper orbit 782961');
  await page.getByRole('button',{name:'Demo guide',exact:true}).click();
  const start = page.getByRole('button',{name:'Use compact presentation cues'});
  await start.focus(); await page.keyboard.press('Enter');
  const cue = page.getByRole('region',{name:'Presentation cue',exact:true});
  await expect(cue.getByRole('heading',{name:'Block a known example'})).toBeFocused();
  await expect(page.getByRole('article',{name:'Current demo step'})).toHaveCount(0);
  await cue.getByRole('link',{name:'Go to page content'}).click();
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
  await expect(page.getByLabel('Password',{exact:true})).toHaveValue('synthetic valley copper orbit 782961');
  await cue.getByRole('button',{name:'Next cue'}).click();
  await expect(cue).toContainText('Step 2 of 5');
  await cue.getByRole('button',{name:'End presentation'}).click();
  await expect(page.getByRole('button',{name:'Demo guide',exact:true})).toBeFocused();
  await expect(cue).toHaveCount(0);
  await expect(page.getByLabel('Password',{exact:true})).toHaveValue('synthetic valley copper orbit 782961');
  expect(requests).toBe(0);
});

test('cues persist across routes, label mock evidence and reset on reload', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Check source',{exact:true}).selectOption('practice');
  await page.getByRole('button',{name:'Demo guide',exact:true}).click();
  await page.getByRole('button',{name:'Use compact presentation cues'}).click();
  const cue = page.getByRole('region',{name:'Presentation cue',exact:true});
  await cue.getByRole('button',{name:'Next cue'}).click();
  await cue.getByRole('button',{name:'Next cue'}).click();
  await cue.getByText('Talking point and evidence limits',{exact:true}).click();
  await expect(cue).toContainText('has no live prefix evidence');
  await cue.getByRole('button',{name:'Next cue'}).click();
  await cue.getByRole('link',{name:'Open dashboard'}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Real checks. Demonstration data.');
  await expect(cue).toContainText('Step 4 of 5');
  await cue.getByRole('button',{name:'Next cue'}).click();
  await cue.getByRole('link',{name:'Open Security Test Lab'}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Would our checker make the right decision?');
  await expect(cue.getByRole('button',{name:'Next cue'})).toBeDisabled();
  await expect(page.getByText('NOT RUN',{exact:true})).toHaveCount(9);
  expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  await page.reload();
  await expect(cue).toHaveCount(0);
});

test('expanded cue notes fit 320px in both themes and readiness is a dated snapshot', async ({ page }) => {
  await page.setViewportSize({width:320,height:900});
  await page.goto('/');
  await page.getByRole('button',{name:'Demo guide',exact:true}).click();
  await page.getByText('Before presenting: check this browser',{exact:true}).click();
  await page.getByRole('button',{name:'Check demo readiness'}).click();
  await expect(page.getByText(/Browser snapshot checked at/)).toBeVisible();
  await page.getByRole('button',{name:'Use compact presentation cues'}).click();
  const cue = page.getByRole('region',{name:'Presentation cue',exact:true});
  await cue.getByText('Talking point and evidence limits',{exact:true}).click();
  for(const theme of ['light','dark']){
    await page.getByLabel('Color theme').selectOption(theme);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
