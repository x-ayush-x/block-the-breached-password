export function summarize(rows, total) {
  const breached = rows.filter((row) => row.status === "breached").length;
  const clear = rows.filter((row) => row.status === "clear").length;
  const unknown = rows.filter((row) => row.status === "unknown").length;
  const tested = breached + clear;
  return {
    total,
    tested,
    breached,
    clear,
    unknown,
    pending: Math.max(0, total - rows.length),
    percentage: tested ? Math.round((breached / tested) * 1000) / 10 : null,
  };
}

export function reportSentence(summary, mockMode = false) {
  const outcome = mockMode ? "match the local mock corpus" : "use a breached password";
  if (!summary.tested)
    return "No successful checks yet. Exposure rate is not available.";
  if (summary.pending || summary.unknown)
    return `${summary.percentage}% of successfully checked test accounts ${outcome} (${summary.tested}/${summary.total} checked). This report is incomplete.`;
  return `${summary.percentage}% of test accounts ${outcome}.`;
}

export function downloadReport(report, filename = "breach-exposure-demo-report.json") {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const REPORT_SCHEMA = 'hello-world-report-1';
export function parseReport(text) {
  if (typeof text !== 'string' || text.length > 1_000_000) throw new Error('Report is too large (maximum 1 MB).');
  const r = JSON.parse(text);
  if (!r || r.schema !== REPORT_SCHEMA || !['live', 'benchmark'].includes(r.mode) ||
      typeof r.datasetId !== 'string' || !r.datasetId.trim() || r.datasetId.length > 160 || typeof r.policyVersion !== 'string' || !r.policyVersion.trim() || r.policyVersion.length > 80 ||
      !Number.isFinite(Date.parse(r.finishedAt)) || !['complete', 'cancelled', 'interrupted'].includes(r.phase) ||
      (r.mode === 'benchmark' && !['normal', 'outage'].includes(r.scenario)) ||
      (r.mode === 'live' && r.scenario != null)) throw new Error('Unsupported report. Export a supported v1.4 or newer report first.');
  const s = r.summary;
  if (!s || !['total','tested','breached','clear','unknown','pending'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0) ||
      !s.total || s.total > 1000 || s.tested !== s.breached + s.clear || s.total !== s.tested + s.unknown + s.pending ||
      s.percentage !== (s.tested ? Math.round(s.breached / s.tested * 1000) / 10 : null)) throw new Error('Invalid report counts or coverage.');
  // Allowlisted metadata only; imported rows and arbitrary fields are never retained/rendered.
  return { schema: r.schema, datasetId: r.datasetId.slice(0, 160), policyVersion: r.policyVersion.slice(0, 80), mode: r.mode, scenario: r.mode === 'live' ? null : r.scenario, phase: r.phase, finishedAt: r.finishedAt, summary: Object.fromEntries(["total", "tested", "breached", "clear", "unknown", "pending", "percentage"].map(k => [k, s[k]])) };
}
export function reportCompatibility(a, b) {
  return [
    { label: 'Same source', passed: a.mode === b.mode, detail: 'Live HIBP results and local mock results must not be mixed.' },
    { label: 'Same dataset and size', passed: a.datasetId === b.datasetId && a.summary.total === b.summary.total, detail: 'Fresh live runs have different random inputs and dataset identities.' },
    { label: 'Same policy', passed: a.policyVersion === b.policyVersion, detail: 'Both reports must use the same password policy version.' },
    { label: 'Same scenario', passed: a.scenario === b.scenario, detail: 'Normal runs and simulated outages answer different questions.' },
    { label: 'Complete successful coverage', passed: [a,b].every(r => r.phase === 'complete' && !r.summary.pending && !r.summary.unknown), detail: 'Both runs must finish with no unknown or pending inputs.' },
  ];
}
export function compareReports(a, b) {
  const checks = reportCompatibility(a, b);
  if (!checks[0].passed) return 'Comparison blocked: mock and live sources differ.';
  if (!checks[1].passed) return 'Comparison blocked: different datasets. Fresh live runs generate different random accounts.';
  if (!checks[2].passed || !checks[3].passed) return 'Comparison blocked: policy versions or scenarios differ.';
  if (!checks[4].passed) return 'Comparison blocked: both reports need complete successful coverage.';
  const delta = Math.round((b.summary.percentage - a.summary.percentage) * 10) / 10;
  return `${a.mode === 'benchmark' ? 'MOCK corpus only' : 'Live HIBP snapshots'}: second minus first = ${delta} percentage points. This is not evidence of real-world security improvement. Imported files are self-reported and not authenticated.`;
}
