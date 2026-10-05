import test from 'node:test';
import assert from 'node:assert/strict';
import { REPORT_SCHEMA, parseReport, compareReports, reportCompatibility } from '../utils/reporting.js';
import { checkBreachedPassword } from '../services/hibpService.js';
const report = () => ({ schema: REPORT_SCHEMA, mode: 'benchmark', datasetId: 'fixed-v1', policyVersion: '1.4', scenario: 'normal', phase: 'complete', finishedAt: new Date().toISOString(), summary: { total: 1000, tested: 1000, breached: 230, clear: 770, unknown: 0, pending: 0, percentage: 23 } });
test('compatible complete mock reports compare with honest units and limitations', () => {
  const a = parseReport(JSON.stringify(report()));
  assert.match(compareReports(a, a), /0 percentage points/);
  assert.match(compareReports(a, a), /MOCK/);
});
test('different sources, datasets, policies, scenarios and incomplete runs never compare', () => {
  for (const change of [{ mode: 'live' }, { datasetId: 'fresh' }, { policyVersion: 'other' }, { scenario: 'outage' }, { phase: 'cancelled' }]) {
    assert.match(compareReports(report(), { ...report(), ...change }), /blocked/);
  }
});
test('malformed and inconsistent report imports fail; unrecognized metadata is discarded', () => {
  for (const value of ['null', '{}', 'not-json', JSON.stringify({ ...report(), summary: { ...report().summary, tested: 999 } })]) assert.throws(() => parseReport(value));
  const parsed = parseReport(JSON.stringify({ ...report(), password: 'should not retain', rows: [], summary: { ...report().summary, secret: 'ignored' } }));
  assert.equal(parsed.password, undefined); assert.equal(parsed.rows, undefined); assert.equal(parsed.summary.secret, undefined);
});
test('processing stages come from actual operations and contain no credential material', async () => {
  const stages = [];
  await checkBreachedPassword('public stage test fixture', { onStage: s => stages.push(s), fetchImpl: async () => ({ ok: true, status: 200, text: async () => `${'0'.repeat(35)}:0\r\n` }) });
  assert.deepEqual(stages, ['Hashing locally with SHA-1', 'Looking up five-character prefix', 'Valid response parsed; comparing suffix locally', 'Decision complete']);
  assert.ok(stages.every(s => !s.includes('public stage test fixture')));
});

test('compatibility checklist reports every mismatch and agrees with blocked comparison', () => {
  const a = report();
  const b = { ...report(), mode: 'live', scenario: null, datasetId: 'other', policyVersion: 'other', phase: 'cancelled' };
  assert.equal(reportCompatibility(a, b).filter(row => !row.passed).length, 5);
  assert.match(compareReports(a, b), /blocked/);
  assert.ok(reportCompatibility(a, a).every(row => row.passed));
});
test('parser rejects invalid scalar metadata and normalizes absent live scenarios', () => {
  for (const change of [{ policyVersion: ' ' }, { datasetId: ' ' }, { mode: 'live', scenario: { arbitrary: 'data' } }]) {
    assert.throws(() => parseReport(JSON.stringify({ ...report(), ...change })));
  }
  const live = { ...report(), mode: 'live', scenario: null };
  const absent = { ...live }; delete absent.scenario;
  assert.equal(parseReport(JSON.stringify(absent)).scenario, null);
  assert.match(compareReports(parseReport(JSON.stringify(live)), parseReport(JSON.stringify(absent))), /0 percentage points/);
});
