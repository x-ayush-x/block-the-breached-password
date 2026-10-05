import { useEffect, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import Icon from '../components/Icon.jsx';
import { LAB_SCENARIOS, runSecurityLab, runLabScenario, labReport } from '../services/securityLab.js';
import { downloadReport } from '../utils/reporting.js';
import './SecurityLab.css';

const lessons = {
  'strong-breached': ['A password can be hard to guess and still appear in a breach.', 'The pretend service returns an exact match with a positive count.', 'A breach match blocks submission, even when the strength score is high.'],
  clear: ['What if the local rules pass and the check finds no match?', 'The pretend service returns a valid response without a matching entry.', 'The password gate allows a simulation. This is not proof that a password is safe or that a real account was created.'],
  common: ['Can a common password pass just because it has no breach match?', 'A public common-password fixture gets a no-match response.', 'The local blocklist still rejects the whole password. A no-match alone is not enough.'],
  short: ['Can a short password pass just because it has no breach match?', 'A short public fixture gets a no-match response.', 'The local minimum length still applies. All required conditions must pass.'],
  unavailable: ['What happens if the breach service is down?', 'The pretend service returns HTTP 503: service unavailable.', 'The breach status stays unknown and submission stays blocked. An outage is not a clean result.'],
  'rate-limit': ['What happens if the service asks us to slow down?', 'The pretend service returns HTTP 429: too many requests.', 'The check remains unknown. The user must try a fresh check later; no permission is granted.'],
  malformed: ['What if the service response cannot be understood?', 'The pretend service returns text in an invalid format.', 'The parser rejects it. Unreadable data must never be interpreted as no breach match.'],
  timeout: ['What if the service never answers?', 'The pretend service waits until the Lab’s shortened 60 ms timeout.', 'The request times out and submission stays blocked. Live checks use their normal, longer timeout.'],
  padding: ['Does every matching line mean a breached password?', 'The pretend response contains the matching suffix with a count of zero.', 'Zero-count entries are padding. They do not establish exposure, so this valid fixture can pass the password gate.'],
};
const breachLabel = { breached: 'Exact mock match', clear: 'No mock match', error: 'Unknown / error' };

export default function SecurityLab() {
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [selected, setSelected] = useState(null);
  const [viewed, setViewed] = useState(LAB_SCENARIOS[0].id);
  const active = useRef(null);
  const revision = useRef(0);
  useEffect(() => () => { revision.current++; active.current?.abort(); }, []);
  const running = phase === 'running';
  const targetCount = selected ? 1 : LAB_SCENARIOS.length;
  const passed = results.filter(row => row.passed).length;
  const scenario = LAB_SCENARIOS.find(row => row.id === viewed);
  const result = results.find(row => row.id === viewed);
  const [question, setup, explanation] = lessons[viewed];
  async function run(scenarioId = null) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const id = ++revision.current;
    setSelected(scenarioId); setResults([]); setPhase('running');
    try {
      const onResult = row => {
        if (revision.current === id) setResults(previous => [...previous, row]);
      };
      if (scenarioId) onResult(await runLabScenario(scenarioId, { signal: controller.signal }));
      else await runSecurityLab({ signal: controller.signal, onResult });
      if (revision.current === id) setPhase('complete');
    } catch {
      if (revision.current === id) setPhase(controller.signal.aborted ? 'cancelled' : 'error');
    } finally {
      if (revision.current === id) active.current = null;
    }
  }
  return <>
    <PageHeading eyebrow="SECURITY TEST LAB · V1.10" title="Would our checker make the right decision?" description="Choose a situation. Run a controlled test. See why the password gate allows or blocks it.">
      <button className="button secondary" disabled={!results.length || running} onClick={() => downloadReport(labReport(results, phase, selected), 'security-lab-evidence.json')}><Icon name="download" size={17} /> Export evidence</button>
    </PageHeading>
    <div className="dataset-banner"><Icon name="info" size={20} /><p><strong>Always a simulation. No live HIBP requests.</strong> Real checking functions run against public test inputs and pretend service responses. No employee passwords or real accounts are used.</p></div>
    <section className="panel lab-start" aria-label="How to read test results">
      <div><span className="eyebrow">THE ONE THING TO REMEMBER</span><h2>Blocked password. Successful test.</h2><p>If a breached password is rejected, the checker did its job. <strong>PASS means correct behavior</strong> — it does not mean the password was accepted.</p></div>
      <div className="lab-example"><span>We expect: <strong>Block</strong></span><span>Checker says: <strong>Block</strong></span><span className="good">Test result: <strong>PASS</strong></span></div>
    </section>
    <div className="lab-workbench">
      <section className="panel lab-picker" aria-label="Choose a scenario">
        <span className="eyebrow">1 · CHOOSE A SITUATION</span><h2>What should we test?</h2>
        <p>Start with the first example. Choose another whenever you’re ready.</p>
        <ol>{LAB_SCENARIOS.map((item, index) => {
          const row = results.find(value => value.id === item.id);
          return <li key={item.id}><button type="button" aria-pressed={viewed === item.id} onClick={() => setViewed(item.id)} aria-controls="lab-scenario-detail"><span className="lab-number">{index + 1}</span><span>{item.title}</span><span className={`lab-verdict ${row ? row.passed ? 'pass' : 'fail' : ''}`}>{row ? row.passed ? 'PASS' : 'FAIL' : 'NOT RUN'}</span></button></li>;
        })}</ol>
      </section>
      <section id="lab-scenario-detail" className="panel lab-card lab-detail" aria-label="Selected scenario" key={viewed}>
        <span className="eyebrow">2 · RUN AND UNDERSTAND</span><h2>{scenario.title}</h2><p className="lab-question">{question}</p>
        <div className="lab-setup"><h3>What we pretend</h3><p>{setup}</p></div>
        <div className="lab-decision-grid"><div><span>Expected decision</span><strong>{scenario.expectedAllowed ? 'Allow simulation' : 'Block submission'}</strong></div><div><span>Actual decision</span><strong>{result ? result.allowed ? 'Allow simulation' : 'Block submission' : 'Not tested yet'}</strong></div></div>
        <button className="button primary scenario-run" disabled={running} onClick={() => run(scenario.id)} aria-label={`Run scenario: ${scenario.title}`}><Icon name="bolt" size={18} />{result ? 'Run this scenario again' : 'Run this scenario'}</button>
        {!result && <p className="fine-print">{running ? 'A test run is in progress. Completed results appear here.' : 'Run this scenario to see an actual engine result. The expected decision above is a prediction.'}</p>}
        {result && <div className={`lab-outcome ${result.passed ? 'good' : 'bad'}`} role="status"><h3>{result.passed ? result.allowed ? 'PASS · Correct permission' : 'PASS · Correct rejection' : 'FAIL · Investigate this result'}</h3><p>{result.passed ? explanation : 'The observed behavior did not match every scenario expectation. Inspect the evidence below; do not present this as a passing test.'}</p></div>}
        <details className="lab-technical"><summary>Under the hood: what was checked?</summary><p>These are results from shared functions, not a live network capture. Passing requires the expected decision, breach status, error type and request checks to agree.</p><dl>
          <div><dt>Strength estimate</dt><dd>{result?.strength ?? 'Not run'}</dd></div>
          <div><dt>Mock breach result</dt><dd>{result ? breachLabel[result.breachStatus] : 'Not run'}</dd></div>
          <div><dt>Local password rules</dt><dd>{result ? result.policyPassed ? 'Passed' : 'Rejected' : 'Not run'}</dd></div>
          <div><dt>Request arguments</dt><dd>{result ? result.requestContractPassed ? 'Passed' : 'Failed' : 'Not run'}</dd></div>
          <div><dt>Service error code</dt><dd>{result ? result.errorCode ?? 'None' : 'Not run'}</dd></div>
        </dl><p>The mock transport checks a five-character prefix path, no request body, omitted credentials and the required privacy options. It sends nothing to HIBP.</p>{result && <p className="lab-reason">Decision reason: {result.reason}</p>}</details>
      </section>
    </div>
    <section className="panel lab-control" aria-label="Lab controls">
      <div><span className="eyebrow">3 · CHECK THE WHOLE SUITE</span><h2>Ready to test all nine?</h2><p>Run every scenario and select any row above to inspect its result. Each new run replaces the previous evidence; browsing scenarios does not.</p></div>
      <div className="lab-actions">{running ? <button className="button secondary" onClick={() => active.current?.abort()}>Cancel tests</button> : <button className="button secondary" onClick={() => run()}>{phase === 'idle' ? 'Run security tests' : 'Run tests again'}</button>}</div>
      <progress max={targetCount} value={results.length} aria-label="Security test progress" />
      <p role="status" aria-live="polite">{phase === 'idle' ? 'Ready. No tests have run yet.' : `${results.length} of ${targetCount} completed · ${passed} passed · ${phase}.`}</p>
      {['cancelled', 'error'].includes(phase) && <p className="notice warning">This run is incomplete. Unfinished scenarios have no verdict.</p>}
      {results.length > 0 && <p className="fine-print">Export scope: {selected ? 'one scenario' : 'all nine scenarios'} · {results.length} completed · {results.length - passed} failed · {targetCount - results.length} unfinished. Selecting another scenario does not change this scope.</p>}
    </section>
    <details className="panel lab-evidence"><summary>What does exported evidence prove?</summary><div className="two-grid"><div><h3>What it records</h3><p>Application version, timestamp, mock source, run scope and the engine’s observed results. No passwords, hashes, prefixes or suffixes are exported. Incomplete runs stay labelled incomplete.</p></div><div><h3>What it cannot establish</h3><p>It is not proof of a live HIBP lookup, independent certification or real authentication. Browser code can be changed. For live evidence, open <a href="#signup">signup</a>, select Live HIBP, explicitly check a demo input and inspect the request in DevTools. Leaving this page clears this run; export first.</p></div></div></details>
  </>;
}
