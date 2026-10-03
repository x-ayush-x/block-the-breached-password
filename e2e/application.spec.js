import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
const base = "http://127.0.0.1:4173";
const good = "copper valley orbit falcon 782961";
const second = "silver galaxy autumn orchard 183741";
const hash = (value) =>
  createHash("sha1").update(value.normalize("NFC")).digest("hex").toUpperCase();
const rangeBody = (value, count = 10) =>
  `${hash(value).slice(5)}:${count}\r\n${"0".repeat(35)}:0\r\n`;
const noMatch = `${"F".repeat(35)}:1\r\n${"0".repeat(35)}:0\r\n`;

// Block every external connection by default. Specific tests replace this with mock HIBP routes.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) =>
    route.request().url().startsWith(base) ? route.continue() : route.abort(),
  );
});
async function mock(page, body = noMatch) {
  await page.route("https://api.pwnedpasswords.com/range/*", (route) =>
    route.fulfill({ status: 200, contentType: "text/plain", body }),
  );
}
async function signup(page, password = good) {
  await page.goto("/#signup");
  await page.getByLabel("Email address").fill("judge@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
}
const check = (page) =>
  page.getByRole("button", { name: "Check password securely" }).click();

test("signup requires an explicit check and does not leak secret material", async ({
  page,
}) => {
  const seen = [];
  const consoleText = [];
  page.on("console", (m) => consoleText.push(m.text()));
  await page.route("https://api.pwnedpasswords.com/range/*", (route) => {
    seen.push(route.request());
    return route.fulfill({ status: 200, body: noMatch });
  });
  await signup(page);
  expect(seen).toHaveLength(0);
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
  await check(page);
  await expect(
    page.getByText("No known breach found", { exact: true }),
  ).toBeVisible();
  expect(seen).toHaveLength(1);
  expect(seen[0].url()).toBe(
    `https://api.pwnedpasswords.com/range/${hash(good).slice(0, 5)}`,
  );
  expect(seen[0].postData()).toBeNull();
  expect(seen[0].headers()["add-padding"]).toBe("true");
  expect(seen[0].headers()["referer"]).toBeUndefined();
  expect(seen[0].headers()["cookie"]).toBeUndefined();
  expect(JSON.stringify(seen[0].headers())).not.toContain(good);
  expect(consoleText.join(" ")).not.toContain(good);
  expect(consoleText.join(" ")).not.toContain(hash(good));
  const storage = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  expect(storage).toEqual({ local: [], session: [] });
  await page.getByRole("button", { name: "Simulate account creation" }).click();
  await expect(
    page.getByRole("heading", { name: "Account creation simulated" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try another demonstration" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});
test("strong strength does not override a positive breach match", async ({
  page,
}) => {
  await mock(page, rangeBody(good));
  await signup(page);
  await check(page);
  await expect(page.getByText("Strong", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Compromised password", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("short but clear password is still rejected", async ({ page }) => {
  await mock(page);
  await signup(page, "tiny");
  await check(page);
  await expect(
    page.getByText("No known breach found", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("editing an approved password immediately invalidates the result", async ({
  page,
}) => {
  await mock(page);
  await signup(page);
  await check(page);
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeEnabled();
  await page.getByLabel("Password", { exact: true }).fill(second);
  await expect(page.getByText("Not checked", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("late old response cannot overwrite the result for a new password", async ({
  page,
}) => {
  let release;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("https://api.pwnedpasswords.com/range/*", async (route) => {
    if (route.request().url().endsWith(hash(good).slice(0, 5))) {
      await waiting;
      await route.fulfill({ status: 200, body: noMatch }).catch(() => {});
    } else await route.fulfill({ status: 200, body: rangeBody(second) });
  });
  await signup(page);
  await check(page);
  await expect(
    page.getByText("Checking breach database securely…", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(second);
  await check(page);
  await expect(
    page.getByText("Compromised password", { exact: true }),
  ).toBeVisible();
  release();
  await page.waitForTimeout(150);
  await expect(
    page.getByText("Compromised password", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("network failure fails closed", async ({ page }) => {
  await signup(page);
  await check(page);
  await expect(
    page.getByText("Check unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("malformed API response fails closed", async ({ page }) => {
  await mock(page, "garbage");
  await signup(page);
  await check(page);
  await expect(
    page.getByText("Check unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("reset requires matching confirmation and clears fields on success", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/#reset");
  await page.getByLabel("New password", { exact: true }).fill(good);
  await page.getByLabel("Confirm password", { exact: true }).fill(second);
  await check(page);
  await expect(
    page.getByRole("button", { name: "Simulate password reset" }),
  ).toBeDisabled();
  await page.getByLabel("Confirm password", { exact: true }).fill(good);
  await page.getByRole("button", { name: "Simulate password reset" }).click();
  await expect(
    page.getByRole("heading", { name: "Password reset simulated" }),
  ).toBeVisible();
});
test("reset rejects a breached password even with matching confirmation", async ({
  page,
}) => {
  await mock(page, rangeBody(good));
  await page.goto("/#reset");
  await page.getByLabel("New password", { exact: true }).fill(good);
  await page.getByLabel("Confirm password", { exact: true }).fill(good);
  await check(page);
  await expect(
    page.getByText("Compromised password", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate password reset" }),
  ).toBeDisabled();
});
test("five-minute expiration invalidates a previously clear check", async ({
  page,
}) => {
  await page.clock.install();
  await mock(page);
  await signup(page);
  await check(page);
  await expect(
    page.getByText("No known breach found", { exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(300001);
  await expect(page.getByText("Check expired", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate account creation" }),
  ).toBeDisabled();
});
test("100-account dashboard computes 23 percent using mocked HIBP and exports no secrets", async ({
  page,
}) => {
  const fixtures = [
    "passwordpassword",
    "password",
    "123456",
    "qwerty",
    "letmein",
  ];
  const known = new Map(
    fixtures.map((x) => [hash(x).slice(0, 5), rangeBody(x)]),
  );
  await page.route("https://api.pwnedpasswords.com/range/*", (route) =>
    route.fulfill({
      status: 200,
      body: known.get(route.request().url().split("/").pop()) ?? noMatch,
    }),
  );
  await page.goto("/#dashboard");
  await page.getByRole("button", { name: "Run analysis", exact: true }).click();
  await expect(
    page.getByText("23% of test accounts use a breached password.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("100 of 100 processed", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText("passwordpassword");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk;
  const report = JSON.parse(text);
  expect(report.summary.percentage).toBe(23);
  expect(report.rows).toHaveLength(100);
  for (const row of report.rows)
    expect(Object.keys(row).sort()).toEqual(["checkedAt", "id", "status"]);
  expect(text).not.toContain("passwordpassword");
});
test("dashboard stops after repeated failures and labels unknowns", async ({
  page,
}) => {
  await page.goto("/#dashboard");
  await page.getByRole("button", { name: "Run analysis", exact: true }).click();
  await expect(
    page.getByText(/Analysis stopped after repeated errors/),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No successful checks yet. Exposure rate is not available.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("3 of 100 processed", { exact: true }),
  ).toBeVisible();
});
test("oversized input is not silently truncated or sent", async ({ page }) => {
  let requests = 0;
  await page.route("https://api.pwnedpasswords.com/range/*", (route) => {
    requests++;
    return route.fulfill({ status: 200, body: noMatch });
  });
  await signup(page, "a".repeat(129));
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "a".repeat(129),
  );
  await expect(
    page.getByRole("button", { name: "Check password securely" }),
  ).toBeDisabled();
  expect(requests).toBe(0);
});
test("mobile pages fit the viewport and navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "home",
    "signup",
    "reset",
    "dashboard",
    "architecture",
    "privacy",
    "policy",
  ]) {
    await page.goto(`/#${route}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("production content security policy blocks unintended destinations", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute("content"),
  ).toContain("connect-src https://api.pwnedpasswords.com");
  const allowed = await page.evaluate(async () => {
    try {
      await fetch("https://example.com");
      return true;
    } catch {
      return false;
    }
  });
  expect(allowed).toBe(false);
});

test('privacy evidence shows only the current prefix and clears on edit', async ({ page }) => {
  await mock(page);
  await signup(page);
  await page.getByText('Inspect this check’s privacy evidence').click();
  await check(page);
  await expect(page.getByTestId('lookup-prefix')).toHaveText(hash(good).slice(0, 5));
  const panel = page.locator('.privacy-evidence');
  await expect(panel).not.toContainText(good);
  await expect(panel).not.toContainText(hash(good));
  await expect(panel).toContainText('Valid response received');
  await page.getByLabel('Password', { exact: true }).fill(second);
  await expect(page.getByTestId('lookup-prefix')).toHaveText('Run a check to inspect its prefix');
  await expect(panel).not.toContainText(hash(good).slice(0, 5));
});
test('performance report matches intercepted requests and exported counters', async ({ page }) => {
  let calls = 0;
  await page.route('https://api.pwnedpasswords.com/range/*', route => {
    calls++;
    return route.fulfill({ status: 200, body: noMatch });
  });
  await page.goto('/#dashboard');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(page.getByText('100 of 100 processed')).toBeVisible();
  await page.getByText('Technical details: requests, reuse and timing', { exact: true }).click();
  const panel = page.getByRole('region', { name: 'Run performance' });
  const metric = label => panel.locator('.performance-grid > div').filter({ has: page.getByText(label, { exact: true }) }).locator('dd');
  await expect(metric('API requests started')).toHaveText(String(calls));
  await expect(metric('Requests avoided by reuse')).toHaveText(String(100 - calls));
  await expect(metric('Completed checks')).toHaveText('100');
  await expect(metric('Failed checks')).toHaveText('0');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let content = ''; for await (const chunk of stream) content += chunk;
  const report = JSON.parse(content);
  expect(report.performance.requestsStarted).toBe(calls);
  expect(report.performance.reusedResults).toBe(100 - calls);
  expect(Object.values(report.performance).every(Number.isFinite)).toBe(true);
  await page.getByLabel('Dataset size').selectOption('20');
  await expect(metric('API requests started')).toHaveText('—');
});

test('mock benchmark completes without HIBP traffic and exports honest provenance', async ({ page }) => {
  const outbound = [];
  page.on('request', r => { if (r.url().includes('pwnedpasswords.com')) outbound.push(r.url()); });
  await page.goto('/#dashboard');
  await page.getByLabel('Analysis mode').selectOption('benchmark');
  await expect(page.getByText('MOCK BENCHMARK — NO LIVE HIBP REQUESTS')).toBeVisible();
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(page.getByText('1000 of 1000 processed')).toBeVisible({ timeout: 20000 });
  expect(outbound).toHaveLength(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report' }).click();
  const stream = await (await downloadPromise).createReadStream();
  let body = ''; for await (const chunk of stream) body += chunk;
  const report = JSON.parse(body);
  expect(report.mode).toBe('benchmark');
  expect(report.source).toContain('NOT LIVE HIBP');
  expect(report.summary.breached).toBe(230);
  expect(report.summary.clear).toBe(770);
  expect(report.performance.requestsStarted + report.performance.reusedResults).toBe(1000);
  expect(body).not.toContain('synthetic-benchmark-only-');
  await page.getByLabel('Analysis mode').selectOption('live');
  await expect(page.getByText('MOCK BENCHMARK — NO LIVE HIBP REQUESTS')).toHaveCount(0);
  await expect(page.getByLabel('Dataset size')).toHaveValue('100');
  await expect(page.getByText('0 of 100 processed')).toBeVisible();
});
test('mock failure and cancellation remain incomplete; signup stays live', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.getByLabel('Analysis mode').selectOption('benchmark');
  await page.getByLabel('Benchmark scenario').selectOption('outage');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await expect(page.getByText('Analysis stopped after repeated errors', { exact: false })).toBeVisible();
  await expect(page.getByText('3 unknown', { exact: true })).toBeVisible();
  await page.getByLabel('Benchmark scenario').selectOption('normal');
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel analysis' }).click();
  await expect(page.getByText('Analysis cancelled.', { exact: false })).toBeVisible();
  let liveRequests = 0;
  await page.route('https://api.pwnedpasswords.com/range/*', r => { liveRequests++; return r.fulfill({ status: 200, body: noMatch }); });
  await signup(page);
  await check(page);
  await expect(page.getByText('No known breach found', { exact: true })).toBeVisible();
  expect(liveRequests).toBe(1);
});
