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
