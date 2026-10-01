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

export function reportSentence(summary) {
  if (!summary.tested)
    return "No successful checks yet. Exposure rate is not available.";
  if (summary.pending || summary.unknown)
    return `${summary.percentage}% of successfully checked test accounts use a breached password (${summary.tested}/${summary.total} checked). This report is incomplete.`;
  return `${summary.percentage}% of test accounts use a breached password.`;
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
  if (text.length > 1_000_000) throw new Error('Report is too large (maximum 1 MB).');
  const r = JSON.parse(text);
  if (!r || r.schema !== REPORT_SCHEMA || !['live', 'benchmark'].includes(r.mode) ||
      typeof r.datasetId !== 'string' || !r.datasetId || r.datasetId.length > 160 || typeof r.policyVersion !== 'string' || r.policyVersion.length > 80 ||
      !Number.isFinite(Date.parse(r.finishedAt)) || !['complete', 'cancelled', 'interrupted'].includes(r.phase) ||
      (r.mode === 'benchmark' && !['normal', 'outage'].includes(r.scenario))) throw new Error('Unsupported report. Export a v1.4 report first.');
  const s = r.summary;
  if (!s || !['total','tested','breached','clear','unknown','pending'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0) ||
      !s.total || s.total > 1000 || s.tested !== s.breached + s.clear || s.total !== s.tested + s.unknown + s.pending ||
      s.percentage !== (s.tested ? Math.round(s.breached / s.tested * 1000) / 10 : null)) throw new Error('Invalid report counts or coverage.');
  // Allowlisted metadata only; imported rows and arbitrary fields are never retained/rendered.
  return { schema: r.schema, datasetId: r.datasetId.slice(0, 160), policyVersion: r.policyVersion.slice(0, 80), mode: r.mode, scenario: r.scenario, phase: r.phase, finishedAt: r.finishedAt, summary: Object.fromEntries(["total", "tested", "breached", "clear", "unknown", "pending", "percentage"].map(k => [k, s[k]])) };
}
export function compareReports(a, b) {
  if (a.mode !== b.mode) return 'Comparison blocked: mock and live sources differ.';
  if (a.datasetId !== b.datasetId || a.summary.total !== b.summary.total) return 'Comparison blocked: different datasets. Fresh live runs generate different random accounts.';
  if (a.policyVersion !== b.policyVersion || a.scenario !== b.scenario) return 'Comparison blocked: policy versions or scenarios differ.';
  if ([a,b].some(r => r.phase !== 'complete' || r.summary.pending || r.summary.unknown)) return 'Comparison blocked: both reports need complete successful coverage.';
  const delta = Math.round((b.summary.percentage - a.summary.percentage) * 10) / 10;
  return `${a.mode === 'benchmark' ? 'MOCK corpus only' : 'Live HIBP snapshots'}: second minus first = ${delta} percentage points. This is not evidence of real-world security improvement. Imported files are self-reported and not authenticated.`;
}
