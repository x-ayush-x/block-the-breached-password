import { useEffect, useRef, useState } from 'react';
import { parseReport, compareReports, reportCompatibility } from '../utils/reporting.js';
import './ReportComparison.css';

export default function ReportComparison() {
  const revisions = useRef([0, 0]);
  const inputs = useRef([]);
  const [reports, setReports] = useState([null, null]);
  const [errors, setErrors] = useState(['', '']);
  const [loading, setLoading] = useState([false, false]);
  useEffect(() => () => { revisions.current = revisions.current.map(n => n + 1); }, []);
  function clear(index) {
    revisions.current[index]++;
    setReports(old => old.map((r, i) => i === index ? null : r));
    setErrors(old => old.map((r, i) => i === index ? '' : r));
    setLoading(old => old.map((r, i) => i === index ? false : r));
    if (inputs.current[index]) inputs.current[index].value = '';
  }
  async function read(file, index) {
    const revision = ++revisions.current[index];
    setErrors(old => old.map((r, i) => i === index ? '' : r));
    setReports(old => old.map((r, i) => i === index ? null : r));
    setLoading(old => old.map((r, i) => i === index ? !!file : r));
    try {
      if (!file) return;
      if (file.size > 1_000_000) throw new Error('File exceeds 1 MB.');
      const report = parseReport(await file.text());
      if (revision !== revisions.current[index]) return;
      setReports(old => old.map((r, i) => i === index ? report : r));
    } catch {
      if (revision !== revisions.current[index]) return;
      setErrors(old => old.map((r, i) => i === index ? 'Invalid or unsupported report. Choose a dashboard JSON export from v1.4 or newer (maximum 1 MB). Lab evidence and PDFs cannot be compared here.' : r));
    } finally {
      if (revision === revisions.current[index]) setLoading(old => old.map((r, i) => i === index ? false : r));
    }
  }
  const complete = reports.every(Boolean);
  const checks = complete ? reportCompatibility(...reports) : [];
  return <section className="panel report-comparison no-print" aria-label="Compare exported reports">
    <span className="eyebrow">4 · UNDERSTAND TWO REPORTS</span><h2>Compare exported reports</h2>
    <p>Choose two dashboard JSON exports. Files are read locally; nothing is uploaded. Matching metadata allows a numerical comparison, not proof of security improvement.</p>
    <div className="comparison-files">{[0,1].map(i => <section className="comparison-file" aria-label={`Report ${i + 1} summary`} key={i}>
      <div className="comparison-file-heading"><label htmlFor={`report-${i}`}>Report {i + 1} · {i === 0 ? 'baseline' : 'comparison'}</label><button type="button" className="button secondary" aria-label={`Remove report ${i + 1}`} disabled={!reports[i] && !errors[i] && !loading[i]} onClick={() => clear(i)}>Remove</button></div>
      <input ref={el => { inputs.current[i] = el; }} id={`report-${i}`} aria-label={`Report ${i + 1}`} type="file" accept=".json,application/json" aria-describedby={`report-status-${i}`} onChange={e => read(e.target.files?.[0], i)} />
      <p id={`report-status-${i}`} role="status">{loading[i] ? 'Reading and validating…' : errors[i] || (reports[i] ? 'Report loaded. Summary below.' : 'No report selected.')}</p>
      {reports[i] && <><strong className="comparison-source">{reports[i].mode === 'benchmark' ? 'MOCK · local synthetic corpus' : 'LIVE · HIBP lookup results'}</strong><dl>
        <div><dt>Timestamp</dt><dd>{reports[i].finishedAt}</dd></div>
        <div><dt>Dataset identity</dt><dd>{reports[i].datasetId}</dd></div>
        <div><dt>Policy</dt><dd>{reports[i].policyVersion}</dd></div>
        <div><dt>Scenario / status</dt><dd>{reports[i].scenario ?? 'live'} / {reports[i].phase}</dd></div>
        <div><dt>Successful coverage</dt><dd>{reports[i].summary.tested} / {reports[i].summary.total}</dd></div>
        <div><dt>Unknown / pending</dt><dd>{reports[i].summary.unknown} / {reports[i].summary.pending}</dd></div>
        <div><dt>{reports[i].mode === 'benchmark' ? 'Mock match rate' : 'Breach match rate'}</dt><dd>{reports[i].summary.percentage === null ? 'Unavailable' : `${reports[i].summary.percentage}%`} · successful checks only</dd></div>
      </dl></>}
    </section>)}</div>
    {complete && <section className="comparison-checks" aria-label="Comparison compatibility"><h3>Can these reports be compared?</h3><ul>{checks.map(check => <li key={check.label}><strong>{check.passed ? 'Match' : 'Blocked'} · {check.label}</strong><p>{check.detail}</p></li>)}</ul></section>}
    <div className="comparison-result" role="status"><h3>{complete ? checks.every(c => c.passed) ? 'Compatible metadata' : 'Comparison unavailable' : 'Choose two reports to compare'}</h3><p>{complete ? compareReports(...reports) : 'The checklist will explain whether their source, dataset, policy, scenario and coverage match.'}</p></div>
    <details className="comparison-help"><summary>What can I compare, and what does the difference mean?</summary><p>Two complete exports from the same fixed mock dataset and scenario can be compared. Importing the same file twice yields zero; that demonstrates the tool, not an improvement.</p><p>Separate live runs generate fresh random test inputs and different dataset IDs. They cannot be compared as the same population. We do not collect employee credentials.</p><p>The difference is Report 2 minus Report 1, measured in percentage points. For example, 25% minus 23% is +2 percentage points, not a 2% relative increase.</p><p>Even matching imported metadata is self-reported and unauthenticated. It does not prove the files are genuine or that they describe the same underlying population. Clear, partial and mock results retain their original limits.</p></details>
  </section>;
}
