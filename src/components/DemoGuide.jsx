import { useState } from 'react';
const steps = [
  ['signup', '1. Signup', 'Load the public breached demo, then explicitly check it. Inspect each decision rule.'],
  ['signup', '2. Rejection', 'Confirm the breached result blocks submission. Generate a random demo and check again; absence from a corpus is not a safety guarantee.'],
  ['privacy', '3. Privacy evidence', 'Before leaving signup, expand its privacy evidence and inspect Network → range. Only five hash characters leave. Offline mode makes no HIBP request.'],
  ['dashboard', '4. Dashboard', 'Run an analysis, inspect coverage, export JSON and use Print / Save as PDF. Compare two compatible mock reports.'],
  ['lab', '5. Security Test Lab', 'Run the deterministic tests to demonstrate malformed responses, cancellation and fail-closed behavior.'],
];
export default function DemoGuide({ offline, setOffline }) {
  const [step, setStep] = useState(0);
  const [readiness, setReadiness] = useState(null);
  function inspect() {
    setReadiness({ secure: window.isSecureContext, crypto: !!globalThis.crypto?.subtle, online: navigator.onLine });
  }
  return <section className="demo-guide no-print" aria-label="Demonstration controls">
    <label><input type="checkbox" checked={offline} onChange={e => setOffline(e.target.checked)} /> Offline demonstration mode (explicit mock results)</label>
    <p role="status">{offline ? 'OFFLINE / MOCK — signup, reset and dashboard use a local synthetic corpus. No real breach verdicts.' : 'LIVE — signup, reset and live dashboard use HIBP. Errors block submission; mock fallback is never automatic.'}</p>
    <details><summary>Guided hackathon walkthrough & readiness</summary>
      <button className="button secondary" onClick={inspect}>Check demo readiness</button>
      {readiness && <ul role="status"><li>Secure context: {readiness.secure ? 'ready' : 'use localhost or HTTPS'}</li><li>Browser cryptography: {readiness.crypto ? 'ready' : 'unavailable — checks blocked'}</li><li>Network hint: {readiness.online ? 'online' : 'offline'} — does not prove HIBP availability. Use an explicit signup check to verify live service.</li><li>Offline preparation: keep the local server running; open signup, dashboard and lab once while connected to cache loaded page modules. No service worker or guaranteed offline hosted reload.</li></ul>}
      <p><strong>{steps[step][1]}</strong> — {steps[step][2]}</p>
      <a className="button secondary" href={`#${steps[step][0]}`}>Open this step</a>{' '}
      <button className="button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous step</button>{' '}
      <button className="button secondary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next step</button>
    </details>
  </section>;
}
