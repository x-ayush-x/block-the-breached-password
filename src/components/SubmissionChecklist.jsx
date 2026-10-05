import './SubmissionChecklist.css';

export default function SubmissionChecklist({ policy, breach, hasPassword, contextOK, reset, matches, ready, offline }) {
  const rows = [
    ['Password length', !hasPassword ? 'waiting' : policy.lengthOK ? 'pass' : 'blocked', !hasPassword ? 'Enter 15–128 characters.' : policy.lengthOK ? 'Within 15–128 characters.' : 'Use 15–128 characters. Spaces are welcome.'],
    ['Common and account-related values', !hasPassword ? 'waiting' : policy.blocked ? 'blocked' : 'pass', !hasPassword ? 'Checked locally as you type.' : policy.blocked ? 'Choose a different whole password.' : 'Not on the local whole-value blocklist.'],
    ['Breach check', breach.status === 'clear' ? 'pass' : ['breached', 'error', 'expired'].includes(breach.status) ? 'blocked' : 'waiting', {
      idle: 'Run an explicit check for this password.', checking: 'In progress. Submission stays blocked.',
      clear: offline ? 'No match in the mock corpus only.' : 'No known match in the completed HIBP lookup.',
      breached: offline ? 'Mock match found. Choose a different demo password.' : 'Breach match found. Choose a different password.',
      error: 'Unknown result. Retry the check; an error cannot approve it.', expired: 'Result expired. Check this password again.',
    }[breach.status]],
    [reset ? 'Optional email context' : 'Email address', contextOK ? 'pass' : 'blocked', contextOK ? reset ? 'Valid or left empty.' : 'Valid format; used locally only.' : reset ? 'Enter a valid email address or clear the optional field.' : 'Enter a valid email address to continue.'],
    ...(reset ? [['Password confirmation', hasPassword && matches ? 'pass' : 'waiting', hasPassword && matches ? 'Both entries match after normalization.' : 'Confirm the same password to continue.']] : []),
  ];
  let next;
  if (!hasPassword) next = 'Enter a demonstration password, or load an example from the demo panel.';
  else if (!policy.valid) next = policy.reason;
  else if (breach.status === 'checking') next = 'Wait for this check to finish, or cancel it. You cannot submit while the result is unknown.';
  else if (breach.status === 'breached') next = 'Choose a different password, then run a new check. A high strength score cannot override a match.';
  else if (breach.status === 'error') next = 'Retry the breach check when the service is available. No approval is granted by a failed check.';
  else if (breach.status === 'expired') next = 'Run Check password securely again. A result is valid for five minutes for the unchanged password.';
  else if (breach.status !== 'clear') next = 'Select Check password securely. Typing alone never starts a breach lookup.';
  else if (!contextOK) next = reset ? 'Enter a valid email address or clear the optional field.' : 'Enter a valid email address to continue.';
  else if (reset && !matches) next = 'Confirm the same password to continue.';
  else next = offline ? 'You can run the simulation using mock evidence. This is not a real breach verdict or a real account.' : 'You can run the simulation. No known match is not a guarantee of safety, and no real account is created.';
  return <section className="submission-checklist" aria-label="Submission requirements">
    <div className="submission-heading"><h3>What is needed to continue?</h3><span className={ready ? 'ready' : ''}>{ready ? 'Ready to simulate' : 'Not ready yet'}</span></div>
    <ul>{rows.map(([label, state, explanation]) => <li key={label}><div><strong>{label}</strong><span className={`requirement-state ${state}`}>{state === 'pass' ? 'Met' : state === 'blocked' ? 'Needs attention' : 'Pending'}</span></div><p>{explanation}</p></li>)}</ul>
    <div id="submission-next-step" className="submission-next" role="status" aria-live="polite"><strong>{ready ? 'Ready for the next step' : 'What to do next'}</strong><p>{next}</p></div>
  </section>;
}
