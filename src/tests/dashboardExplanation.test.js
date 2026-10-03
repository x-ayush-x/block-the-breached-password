import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, reportSentence } from '../utils/reporting.js';
import { explainDashboard } from '../utils/dashboardExplanation.js';
const rows = (breached, clear, unknown) => [
  ...Array.from({ length: breached }, () => ({ status: 'breached' })),
  ...Array.from({ length: clear }, () => ({ status: 'clear' })),
  ...Array.from({ length: unknown }, () => ({ status: 'unknown' })),
];
test('partial example keeps rate and coverage denominators separate', () => {
  const s = summarize(rows(3, 9, 2), 20);
  const e = explainDashboard(s, 'interrupted');
  assert.equal(e.coverage, 60);
  assert.equal(e.formula, '3 matches ÷ 12 successful checks × 100 = 25%');
  assert.equal(e.complete, false);
  assert.match(e.countsText, /2 unknown \+ 6 pending = 20/);
  assert.match(e.next, /unresolved/);
});
test('no successful results is unavailable, never zero percent', () => {
  for (const phase of ['idle', 'cancelled', 'interrupted']) {
    const e = explainDashboard(summarize(rows(0, 0, 3), 20), phase);
    assert.match(e.formula, /cannot be calculated/);
    assert.equal(e.coverage, 0);
    assert.equal(e.complete, false);
  }
});
test('complete clear run still warns against a safety guarantee', () => {
  const e = explainDashboard(summarize(rows(0, 20, 0), 20), 'complete');
  assert.equal(e.complete, true);
  assert.equal(e.coverage, 100);
  assert.match(e.next, /not a guarantee/);
});
test('in-progress and cancelling summaries remain provisional', () => {
  for (const phase of ['running', 'cancelling']) {
    const e = explainDashboard(summarize(rows(3, 9, 0), 20), phase);
    assert.match(e.title, /provisional/);
    assert.match(e.next, /Wait/);
  }
});
test('mock report wording does not imply real breaches, including partial exports', () => {
  for (const total of [10, 20]) {
    const s = summarize(rows(3, 7, 0), total);
    assert.match(reportSentence(s, true), /match the local mock corpus/);
    assert.doesNotMatch(reportSentence(s, true), /use a breached password/);
    assert.match(reportSentence(s), /use a breached password/);
    assert.match(explainDashboard(s, 'complete', true).formula, /mock matches/);
  }
});
