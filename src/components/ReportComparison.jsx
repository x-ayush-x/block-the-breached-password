import { useRef, useState } from 'react';
import { parseReport, compareReports } from '../utils/reporting.js';
export default function ReportComparison() {
  const revisions = useRef([0, 0]);
  const [reports, setReports] = useState([null, null]);
  const [errors, setErrors] = useState(['', '']);
  async function read(file, index) {
    const revision = ++revisions.current[index];
    setErrors(old => old.map((r, i) => i === index ? "" : r));
    setReports(old => old.map((r, i) => i === index ? null : r));
    try {
      if (!file) return;
      if (file.size > 1_000_000) throw new Error('File exceeds 1 MB.');
      const report = parseReport(await file.text());
      if (revision !== revisions.current[index]) return;
      setReports(old => old.map((r, i) => i === index ? report : r));
      setErrors(old => old.map((r, i) => i === index ? '' : r));
    } catch { if (revision !== revisions.current[index]) return; setErrors(old => old.map((r, i) => i === index ? 'Invalid or unsupported report. Choose a v1.4 or newer JSON export (maximum 1 MB).' : r)); }
  }
  return <section className="panel report-comparison no-print"><h2>Compare exported reports</h2><p>Files stay in your browser. Matching dataset, source, policy, scenario and full coverage are required. Live runs use fresh datasets, so separate live runs cannot be compared.</p>
    {[0,1].map(i => <div className="field" key={i}><label htmlFor={`report-${i}`}>Report {i + 1}</label><input id={`report-${i}`} type="file" accept=".json,application/json" onChange={e => read(e.target.files?.[0], i)} /><p role="status">{errors[i] || (reports[i] && `${reports[i].mode === 'benchmark' ? 'MOCK' : 'LIVE'} · ${reports[i].finishedAt} · coverage ${reports[i].summary.tested}/${reports[i].summary.total}`)}</p></div>)}
    <p role="status">{reports.every(Boolean) ? compareReports(...reports) : 'Choose two reports to compare.'}</p>
  </section>;
}
