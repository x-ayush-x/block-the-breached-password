import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBreachedPassword } from '../services/hibpService.js';
import { analyzeDemo } from '../services/analyzeDemo.js';
const body = `${'F'.repeat(35)}:1\r\n`;
const fetchImpl = async () => ({ ok: true, status: 200, text: async () => body });

test('evidence exposes only prefix and lifecycle; reuse emits no new request', async () => {
  const events = [], rangeCache = new Map();
  const options = { rangeCache, fetchImpl, onLookup: e => events.push(e) };
  await checkBreachedPassword('public demonstration fixture', options);
  await checkBreachedPassword('public demonstration fixture', options);
  assert.deepEqual(events.map(e => e.status), ['requesting', 'received', 'reused']);
  for (const event of events) {
    assert.deepEqual(Object.keys(event).sort(), ['prefix', 'status']);
    assert.match(event.prefix, /^[A-F0-9]{5}$/);
  }
});
test('aggregate counters reconcile real lookup calls and cache hits without retaining prefixes', async () => {
  const snapshots = [], rows = [];
  await analyzeDemo(100, { onRow: row => rows.push(row), onMetrics: m => snapshots.push(m), check: (password, options) => checkBreachedPassword(password, { ...options, fetchImpl }) });
  const m = snapshots.at(-1);
  assert.equal(rows.length, 100);
  assert.equal(m.requestsStarted + m.reusedResults, 100);
  assert.ok(m.reusedResults >= 18);
  assert.equal(m.responsesReceived, m.requestsStarted);
  assert.equal(m.requestsFailed, 0);
  assert.equal(m.requestsCancelled, 0);
  assert.ok(m.elapsedMs >= 0);
  assert.ok(Object.values(m).every(Number.isFinite));
});
test('three failed requests stop analysis and leave no successful or reused responses', async () => {
  let latest;
  const rows = [];
  const outcome = await analyzeDemo(20, { onRow: row => rows.push(row), onMetrics: m => latest = m, check: (password, options) => checkBreachedPassword(password, { ...options, fetchImpl: async () => { throw Error('offline'); } }) });
  assert.equal(outcome.stoppedEarly, true);
  assert.equal(latest.requestsStarted, 3);
  assert.equal(latest.requestsFailed, 3);
  assert.equal(latest.responsesReceived, 0);
  assert.equal(latest.reusedResults, 0);
  assert.ok(rows.every(row => row.status === 'unknown'));
});
test('cancellation is reported separately and never becomes a clear account result', async () => {
  const controller = new AbortController();
  let latest;
  const rows = [];
  await assert.rejects(analyzeDemo(20, { signal: controller.signal, onRow: row => rows.push(row), onMetrics: m => latest = m, check: (password, options) => checkBreachedPassword(password, { ...options, fetchImpl: async () => { controller.abort(); throw Error('aborted'); } }) }), { name: 'AbortError' });
  assert.equal(latest.requestsStarted, 1);
  assert.equal(latest.requestsCancelled, 1);
  assert.equal(latest.requestsFailed, 0);
  assert.equal(rows.length, 0);
});
