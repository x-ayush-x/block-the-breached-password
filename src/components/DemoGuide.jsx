import { useEffect, useRef, useState } from 'react';
import './DemoGuide.css';

const steps = [
  { page: 'signup', title: 'Block a known example', action: 'Open signup', task: 'Select Load breached demo, then Check password securely.', live: 'A positive HIBP match blocks submission. This public example is also on the local blocklist.', mock: 'The local corpus matches this public fixture and blocks the simulation. This is practice evidence only.' },
  { page: 'signup', title: 'Try a different password', action: 'Open the checker', task: 'Select Generate random demo, then run an explicit check. Use only demonstration inputs.', live: 'A successful no-match plus the local rules and valid email enables simulated signup. A random value is not guaranteed absent from HIBP.', mock: 'A no-match means absent from the tiny mock corpus only. Passing the demo does not establish real-world safety.' },
  { page: 'signup', title: 'Inspect what leaves the browser', action: 'Open signup evidence', task: 'Keep signup open. Expand its privacy evidence. In browser DevTools, choose Network, filter range, then explicitly check again.', live: 'Inspect a GET path ending in five hexadecimal characters, with no password or request body. The application panel is not independent proof.', mock: 'Practice mode sends no HIBP request and has no live prefix evidence. Choose Live HIBP first to demonstrate a real request; changing source clears the current form.' },
  { page: 'dashboard', title: 'Explain the report', action: 'Open dashboard', task: 'Choose a dashboard source, run an analysis, then explain the match-rate formula and coverage. Export before leaving.', live: 'Dashboard source is chosen separately. Live runs check synthetic inputs, never employee credentials. Unknown and pending inputs are excluded from the rate.', mock: 'Practice mode uses the local mock benchmark. Its 23% result describes a designed test corpus, not an organization.' },
  { page: 'lab', title: 'Show a correct rejection', action: 'Open Security Test Lab', task: 'Select Strong, but already exposed, run it, then compare Expected decision with Actual decision.', live: 'The Lab always mocks service responses. PASS means the checker made the expected decision—including correctly blocking a password.', mock: 'The Lab always mocks service responses. PASS means the checker made the expected decision—including correctly blocking a password.' },
];

export default function DemoGuide({ offline, setOffline, page }) {
  const [open, setOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const cue = useRef(null);
  const startCue = useRef(false);
  const [step, setStep] = useState(0);
  const [readiness, setReadiness] = useState(null);
  const [changed, setChanged] = useState(false);
  const toggle = useRef(null);
  const current = steps[step];
  useEffect(() => {
    if (presenting && startCue.current) { cue.current?.focus(); startCue.current = false; }
  }, [presenting]);
  function openStep(event) {
    if (presenting) setOpen(false);
    if (page === current.page) {
      event.preventDefault();
      // A same-page link must not clear a checked password or reset a report.
      document.querySelector('main h1')?.focus();
    }
  }
  function endPresentation() {
    setPresenting(false);
    toggle.current?.focus();
  }
  function inspect() {
    setReadiness({ at: new Date().toLocaleTimeString(), secure: window.isSecureContext, crypto: !!globalThis.crypto?.subtle, online: navigator.onLine });
  }
  return <section className="presentation-controls no-print" aria-label="Demonstration controls" onKeyDown={event => {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }}>
    <div className="presentation-toolbar">
      <div className="source-choice">
        <label htmlFor="demo-source">Check source</label>
        <select id="demo-source" value={offline ? 'practice' : 'live'} aria-describedby="source-scope" onChange={event => { setOffline(event.target.value === 'practice'); setChanged(true); }}>
          <option value="live">Live HIBP</option>
          <option value="practice">Practice · mock data</option>
        </select>
      </div>
      <p id="source-scope" className={offline ? 'source-scope mock' : 'source-scope'}>
        {page === 'lab' ? 'This Lab always uses mock responses.' : page === 'dashboard' ? (offline ? 'Practice only · no HIBP requests.' : 'Choose this dashboard’s source below.') : offline ? 'Mock results only · not real breach evidence.' : 'Signup & reset use HIBP when you check.'}
      </p>
      <button ref={toggle} className="button secondary guide-toggle" aria-expanded={open} aria-controls="presentation-guide" onClick={() => setOpen(!open)}>{open ? 'Close demo guide' : 'Demo guide'}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
    </div>
    <p className="source-change-hint">Changing source clears signup, reset and dashboard results. {changed && <span role="status">Source changed to {offline ? 'practice with mock data' : 'live HIBP'}; previous inputs and results were cleared.</span>}</p>
    {presenting && <section className="presenter-cue" aria-label="Presentation cue">
      <div><p className="eyebrow" role="status" aria-live="polite">Manual guide · Step {step + 1} of {steps.length} · {offline ? 'PRACTICE / MOCK' : current.page === 'lab' ? 'LAB / MOCK' : current.page === 'dashboard' ? 'DASHBOARD SOURCE IS SEPARATE' : 'LIVE HIBP SELECTED'}</p><h2 ref={cue} tabIndex={-1}>{current.title}</h2><p>{current.task}</p></div>
      <div className="presenter-cue-actions"><a className="button primary" href={`#${current.page}`} onClick={openStep}>{page === current.page ? 'Go to page content' : current.action}</a><button className="button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous cue</button><button className="button secondary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next cue</button><button className="button secondary" onClick={endPresentation}>End presentation</button></div>
      <details key={`${step}-${offline}`}><summary>Talking point and evidence limits</summary><p>{offline ? current.mock : current.live}</p><p>Moving through this guide does not run or verify a check. Leaving a page clears its form or run; export reports first.</p></details>
    </section>}
    {open && <div id="presentation-guide" className="presentation-guide">
      <div className="guide-intro"><span className="eyebrow">YOUR TWO-MINUTE DEMO</span><h2>Show it. Explain it. Verify it.</h2><p>Follow five stops using public demo inputs. Nothing runs automatically; you control every check.</p>{!presenting && <button className="button secondary" onClick={() => { startCue.current = true; setPresenting(true); setOpen(false); }}>Use compact presentation cues</button>}<p className="fine-print">Optional cues stay between pages for this session. They track your selected step, not completed tests. Reload clears them.</p></div>
      <ol className="guide-steps" aria-label="Demo steps">{steps.map((item, i) => <li key={item.title}><button aria-current={step === i ? 'step' : undefined} onClick={() => setStep(i)}><span>{i + 1}</span>{item.title}</button></li>)}</ol>
      <article className="guide-task" aria-label="Current demo step">
        <p className="eyebrow">STEP {step + 1} OF {steps.length} · {offline ? 'PRACTICE / MOCK' : 'LIVE SELECTED — LAB ALWAYS MOCK'}</p>
        <h3>{current.title}</h3><p><strong>Do this:</strong> {current.task}</p><p><strong>Explain this:</strong> {offline ? current.mock : current.live}</p>
        <div className="guide-actions"><a className="button primary" href={`#${current.page}`} onClick={openStep}>{current.action}</a><button className="button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button className="button secondary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next</button></div>
        <p className="fine-print">Selecting a step is a presentation aid, not evidence that a test passed. Leaving a page clears its form or run. Export any report first.</p>
      </article>
      <details className="guide-readiness"><summary>Before presenting: check this browser</summary><p>This check makes no network request. It cannot confirm that HIBP is available.</p><button className="button secondary" onClick={inspect}>Check demo readiness</button>
        {readiness && <ul role="status"><li>Browser snapshot checked at {readiness.at}. Recheck if conditions change.</li><li>Secure context: {readiness.secure ? 'ready' : 'use localhost or HTTPS'}</li><li>Browser cryptography: {readiness.crypto ? 'ready' : 'unavailable — password checks blocked'}</li><li>Network hint: {readiness.online ? 'online' : 'offline'} — only a hint, not a live service test.</li></ul>}
        <p>For live evidence, use an explicit signup check and inspect Network. If it fails, submission stays blocked. Practice is a separate, manual choice.</p><p>For practice without internet, keep the local server running. There is no service worker or guaranteed offline hosted reload.</p>
      </details>
      <details className="guide-readiness"><summary>How this meets the challenge</summary><ul><li>Signup/reset: local policy, strength feedback and breach rejection; account creation remains simulated.</li><li>Privacy: five-character lookup prefix, local exact match; verify the observed request in DevTools.</li><li>Report: generated test accounts, honest coverage and source-labelled exports.</li><li>Failure handling: unknown results block submission; use the mock Lab to demonstrate failures.</li></ul><p>Client-side checks can be bypassed. These demonstrations are not production authentication or a security certification.</p></details>
    </div>}
  </section>;
}
