import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark } from '../services/benchmark.js';
import { summarize } from '../utils/reporting.js';

test('1,000 fixture benchmark uses no global fetch and computes 230/770 results', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Network forbidden'); };
  try {
    const rows = []; let metrics;
    const result = await runBenchmark({ onRow: r => rows.push(r), onMetrics: m => metrics = m });
    assert.equal(result.stoppedEarly, false);
    assert.equal(rows.length, 1000);
    assert.deepEqual([summarize(rows, 1000).breached, summarize(rows, 1000).clear], [230, 770]);
    assert.equal(metrics.requestsStarted + metrics.reusedResults, 1000);
    assert.ok(metrics.reusedResults >= 225);
    assert.ok(!JSON.stringify(rows).includes('password'));
  } finally { globalThis.fetch = original; }
});
test('mock outage stops after three errors and reports unknown accounts', async () => {
  const rows = []; let metrics;
  const outcome = await runBenchmark({ scenario: 'outage', onRow: r => rows.push(r), onMetrics: m => metrics = m });
  assert.equal(outcome.stoppedEarly, true);
  assert.equal(rows.filter(r => r.status === 'unknown').length, 3);
  assert.equal(metrics.requestsFailed, 3);
  assert.ok(rows.length < 1000);
});
test('mock benchmark cancellation aborts without finishing the dataset', async () => {
  const controller = new AbortController(); const rows = [];
  await assert.rejects(runBenchmark({ signal: controller.signal, onRow: r => { rows.push(r); controller.abort(); } }), { name: 'AbortError' });
  assert.equal(rows.length, 1);
});
