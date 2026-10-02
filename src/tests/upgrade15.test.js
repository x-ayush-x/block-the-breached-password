import test from 'node:test';
import assert from 'node:assert/strict';
import { freshResult, RESULT_TTL_MS } from '../utils/resultFreshness.js';
import { demoComposition, generateDemoAccounts } from '../data/demoAccounts.js';
import { labReport, runLabScenario } from '../services/securityLab.js';

const now = Date.parse('2026-10-02T10:00:00Z');
const clear = age => ({ status: 'clear', count: 0, checkedAt: new Date(now - age).toISOString() });
test('fresh result is accepted only before the exact five-minute boundary', () => {
  const valid = clear(RESULT_TTL_MS - 1);
  assert.equal(freshResult(valid, now), valid);
  assert.equal(freshResult(clear(RESULT_TTL_MS), now).status, 'expired');
  assert.equal(freshResult(clear(RESULT_TTL_MS + 60000), now).status, 'expired');
});
test('missing, invalid and future timestamps cannot authorize submission', () => {
  for (const checkedAt of [undefined, '', 'invalid', new Date(now + 1000).toISOString()])
    assert.equal(freshResult({ status: 'clear', checkedAt }, now).status, 'expired');
});
test('freshness never promotes error, unchecked or breached results to clear', () => {
  for (const status of ['idle', 'checking', 'error', 'expired']) {
    const result = { status }; assert.equal(freshResult(result, now), result);
  }
  assert.equal(freshResult({ ...clear(0), status: 'breached' }, now).status, 'breached');
});
test('displayed live composition matches generated inputs at both supported sizes', () => {
  for (const total of [20, 100]) {
    const { common, random } = demoComposition(total);
    const rows = [...generateDemoAccounts(total)];
    assert.equal(common, total === 20 ? 5 : 23);
    assert.equal(common + random, total);
    assert.ok(rows.slice(0, common).every(row => ['passwordpassword', 'password', '123456', 'qwerty', 'letmein'].includes(row.password)));
    assert.ok(rows.slice(common).every(row => /^[a-f0-9]{36}$/.test(row.password)));
  }
  assert.throws(() => demoComposition(1000));
});
test('single-scenario evidence identifies its actual scope and excludes sensitive fields', async () => {
  const row = await runLabScenario('strong-breached');
  const report = labReport([{ ...row, password: 'secret', hash: 'secret' }], 'complete', 'strong-breached');
  assert.equal(report.totalScenarios, 1);
  assert.equal(report.completed, 1);
  assert.deepEqual(report.scenarioIds, ['strong-breached']);
  assert.equal(report.results[0].allowed, false);
  assert.equal(report.passed, 1);
  assert.equal(JSON.stringify(report).includes('secret'), false);
});
