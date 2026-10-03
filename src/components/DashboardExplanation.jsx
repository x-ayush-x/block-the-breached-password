import { explainDashboard } from '../utils/dashboardExplanation.js';

export default function DashboardExplanation({ summary, phase, mockMode }) {
  const explanation = explainDashboard(summary, phase, mockMode);
  return <section className="dashboard-explanation" aria-label="Understand this result">
    <h3>{explanation.title}</h3>
    <p className="calculation">{explanation.formula}</p>
    <p><strong>Coverage:</strong> {explanation.coverageText}</p>
    <p className="muted">Unknown and pending inputs are excluded from the match-rate calculation, never treated as safe.</p>
    <p><strong>Next step:</strong> {explanation.next}</p>
    <details className="result-help">
      <summary>What do these numbers mean?</summary>
      <dl>
        <div><dt>{mockMode ? 'Mock match' : 'Breach match'}</dt><dd>{mockMode ? 'Found in the local synthetic corpus only. No claim about real breaches.' : 'This password value matches HIBP data. This does not prove a particular person’s account was breached.'}</dd></div>
        <div><dt>No match</dt><dd>A successful lookup with no match. This does not mean a password is completely safe.</dd></div>
        <div><dt>Unknown</dt><dd>A check failed. Its exposure is unresolved, so it cannot be approved.</dd></div>
        <div><dt>Pending</dt><dd>No completed result yet, including work left after cancellation.</dd></div>
      </dl>
      <p>{explanation.countsText}</p>
      <p>The ring shows all test accounts. The match rate uses only successful checks. These are two different denominators.</p>
    </details>
    {mockMode && <p className="source-reminder">MOCK ONLY · These results do not measure employee exposure or real-world breach rates.</p>}
  </section>;
}
