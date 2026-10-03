import { useEffect, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import Icon from '../components/Icon.jsx';
import { LAB_SCENARIOS, runSecurityLab, runLabScenario, labReport } from '../services/securityLab.js';
import { downloadReport } from '../utils/reporting.js';
import './SecurityLab.css';

export default function SecurityLab() {
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [selected, setSelected] = useState(null);
  const targetCount = selected ? 1 : LAB_SCENARIOS.length;
  const active = useRef(null);
  const revision = useRef(0);
  useEffect(() => () => { revision.current++; active.current?.abort(); }, []);
  const running = phase === 'running';
  const passed = results.filter(row => row.passed).length;
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
    <PageHeading eyebrow="SECURITY TEST LAB · V1.7" title="Show the decision. Test the failure." description="Nine controlled scenarios exercise the same security engine used by signup and reset.">
      <button className="button secondary" disabled={!results.length || running} onClick={() => downloadReport(labReport(results, phase, selected), 'security-lab-evidence.json')}><Icon name="download" size={17} /> Export evidence</button>
    </PageHeading>
    <div className="dataset-banner"><Icon name="info" size={20} /><p><strong>Local simulations. No live HIBP requests.</strong> Public synthetic fixtures and mock responses make this demo reproducible. Signup and reset follow the explicitly selected demonstration mode above.</p></div>
    <section className="panel lab-lesson" aria-label="How to read test results">
      <span className="eyebrow">START HERE</span><h2>PASS means the checker got it right.</h2>
      <p>A test asks: “Did the application make the expected decision?” It does not ask whether every password was accepted.</p>
      <div className="lesson-equation"><span>Breached example<strong>Expected: BLOCK</strong></span><span aria-hidden="true">→</span><span>Application blocks it<strong>Observed: BLOCK</strong></span><span aria-hidden="true">→</span><span className="lesson-pass">PASS<strong>Correct rejection</strong></span></div>
      <p className="fine-print">Real hashing and decision code + a local pretend service response. Start with one scenario below, then run all nine. Every new run replaces the previous run’s results.</p>
    </section>
    <section className="panel lab-control" aria-label="Lab controls">
      <div><span className="eyebrow">VERIFY BEHAVIOR</span><h2>Does the gate make the right call?</h2><p className="muted">A passing test can mean the password was correctly rejected. It does not mean a password is safe.</p></div>
      <div className="lab-actions">{running ? <button className="button secondary" onClick={() => active.current?.abort()}>Cancel tests</button> : <button className="button primary" onClick={() => run()}><Icon name="bolt" size={18} />{phase === 'idle' ? 'Run security tests' : 'Run tests again'}</button>}</div>
      <progress max={targetCount} value={results.length} aria-label="Security test progress" />
      <p role="status" aria-live="polite">{phase === 'idle' ? 'Ready. No tests have run yet.' : `${results.length} of ${targetCount} completed · ${passed} passed · ${phase}.`}</p>
      {['cancelled', 'error'].includes(phase) && <p className="notice warning">This run is incomplete. Unfinished scenarios have no verdict.</p>}
    </section>
    <div className="lab-summary">
      <article className="panel"><span>TESTS PASSED</span><strong>{phase === 'idle' ? '—' : `${passed} / ${targetCount}`}</strong><p>Observed results versus expected decisions</p></article>
      <article className="panel"><span>REQUEST CONTRACT</span><strong>{phase === 'idle' ? '—' : `${results.filter(row => row.requestContractPassed).length} / ${results.length}`}</strong><p>Five-character path, no body, no credentials</p></article>
      <article className="panel"><span>RESPONSE SOURCE</span><strong>Local mock</strong><p>Actual engine; controlled test responses</p></article>
    </div>
    <section className="lab-grid" aria-label="Security scenarios">
      {LAB_SCENARIOS.map((scenario, index) => {
        const result = results.find(row => row.id === scenario.id);
        return <article className="panel lab-card" key={scenario.id}>
          <div className="spread"><span className="small-label">CASE {String(index + 1).padStart(2, '0')}</span><span className={`lab-verdict ${result ? result.passed ? 'pass' : 'fail' : ''}`}>{result ? result.passed ? 'PASS' : 'FAIL' : 'NOT RUN'}</span></div>
          <h2>{scenario.title}</h2><p>{scenario.explanation}</p>
          <dl><div><dt>Expected gate</dt><dd>{scenario.expectedAllowed ? 'Allow simulation' : 'Block submission'}</dd></div>
            <div><dt>Observed gate</dt><dd>{result ? result.allowed ? 'Allow simulation' : 'Block submission' : '—'}</dd></div>
            <div><dt>Strength</dt><dd>{result?.strength ?? '—'}</dd></div>
            <div><dt>Mock breach check</dt><dd>{result ? ({ breached: 'Exact mock match', clear: 'No mock match', error: 'Unknown / error' })[result.breachStatus] : '—'}</dd></div>
            <div><dt>Local policy</dt><dd>{result ? result.policyPassed ? 'Passed' : 'Rejected' : '—'}</dd></div>
          </dl>
          {result && <p className={result.passed ? "test-explanation good" : "test-explanation bad"}>{result.passed ? (result.allowed ? "PASS: the expected permission and all scenario checks matched." : "PASS: the expected rejection and all scenario checks matched.") : "FAIL: the observed behavior did not match all scenario expectations."}</p>}
          <button className="button secondary scenario-run" disabled={running} onClick={() => run(scenario.id)} aria-label={`Run scenario: ${scenario.title}`}>Run this scenario <Icon name="arrow" size={16} /></button>
          {result && <p className="lab-reason">{result.errorCode ? `Service result: ${result.errorCode}. ` : ''}{result.reason}</p>}
        </article>;
      })}
    </section>
    <section className="panel prose section-block"><h2>Evidence you can explain</h2><div className="two-grid"><div><h3>What these tests check</h3><p>The lab executes browser hashing, the five-character request builder, response parsing, strength scoring and the policy decision. Only the service response is simulated. The exported report excludes passwords, hashes, suffixes and prefixes.</p></div><div><h3>What they do not prove</h3><p>This is not a live network capture, a test of every UI interaction, or proof of production authentication security. Client-side checks can be bypassed. Use <a href="#privacy">Privacy & proof</a> to inspect a live signup check in DevTools.</p></div></div></section>
  </>;
}
