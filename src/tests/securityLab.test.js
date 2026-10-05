import packageInfo from '../../package.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_SCENARIOS, runLabScenario, runSecurityLab, labReport, requestContract } from '../services/securityLab.js';

for (const scenario of LAB_SCENARIOS) test(`security lab: ${scenario.id}`, async () => {
  const row = await runLabScenario(scenario.id);
  assert.equal(row.passed, true);
  assert.equal(row.allowed, scenario.expectedAllowed);
  assert.equal(row.breachStatus, scenario.expectedStatus);
  assert.equal(row.requestContractPassed, true);
});
test('lab completes without accessing global fetch and exports only evidence fields', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('External requests forbidden'); };
  try {
    const rows = await runSecurityLab();
    assert.equal(rows.length, 9);
    assert.ok(rows.every(row => row.passed));
    const report = labReport(rows.map(row => ({ ...row, password: 'SECRET', suffix: 'SECRET', fullHash: 'SECRET', email: 'SECRET', prefix: 'SECRET' })), 'complete');
    assert.equal(report.completed, 9);
    assert.equal(report.version, packageInfo.version);
    assert.equal(report.passed, 9);
    assert.equal(JSON.stringify(report).includes('SECRET'), false);
    assert.ok(report.source.includes('NOT LIVE HIBP'));
  } finally { globalThis.fetch = original; }
});
test('cancelling a lab run stops further results', async () => {
  const controller = new AbortController();
  const rows = [];
  await assert.rejects(runSecurityLab({ signal: controller.signal, onResult: row => { rows.push(row); controller.abort(); } }), { name: 'AbortError' });
  assert.equal(rows.length, 1);
  assert.equal(labReport(rows, 'cancelled').completed, 1);
});
test('cancelling a pending timeout is cancellation, not a passing failure scenario', async () => {
  const controller = new AbortController();
  const task = runLabScenario('timeout', { signal: controller.signal });
  setTimeout(() => controller.abort(), 10);
  await assert.rejects(task, { name: 'AbortError' });
});
test('request contract rejects bodies, extra headers, credentials, query strings and full hashes', () => {
  const url = 'https://api.pwnedpasswords.com/range/ABCDE';
  const options = { method: 'GET', headers: { 'Add-Padding': 'true' }, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', redirect: 'error' };
  assert.equal(requestContract(url, options), true);
  for (const mutation of [{ body: 'secret' }, { credentials: 'include' }, { referrer: 'secret' }, { headers: { ...options.headers, 'X-Password': 'secret' } }]) assert.equal(requestContract(url, { ...options, ...mutation }), false);
  assert.equal(requestContract(`${url}?password=secret`, options), false);
  assert.equal(requestContract(url + 'A'.repeat(35), options), false);
});
test('unknown scenario never executes', async () => {
  await assert.rejects(runLabScenario('untrusted-input'), /Unknown lab scenario/);
});
