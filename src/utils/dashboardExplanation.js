// Pure presentation of actual aggregate counts; never performs or approves a check.
export function explainDashboard(summary, phase, mockMode = false) {
  const { total, tested, breached, clear, unknown, pending, percentage } = summary;
  const coverage = Math.round(tested / total * 1000) / 10;
  const complete = tested === total && unknown === 0 && pending === 0;
  const running = phase === 'running' || phase === 'cancelling';
  const title = phase === 'idle' ? 'Ready for your first analysis'
    : running ? 'Analysis in progress — results are provisional'
    : complete ? 'Every test account has a result' : 'This report is incomplete';
  const formula = tested
    ? `${breached} ${mockMode ? 'mock matches' : 'matches'} ÷ ${tested} successful checks × 100 = ${percentage}%`
    : 'No successful checks yet — a percentage cannot be calculated.';
  const next = phase === 'idle' ? 'Choose a source and dataset size above, then select Run analysis.'
    : running ? 'Wait for the run to finish, or cancel to keep only the completed portion.'
    : !complete ? 'Unknown and pending inputs remain unresolved. Wait before starting a fresh run; rerunning replaces this report.'
    : breached ? 'Reject matched passwords in the demonstration. A no-match still needs the remaining password-policy checks.'
    : 'No matches were found in this run. Apply the remaining policy checks; this is not a guarantee of safety.';
  return { title, formula, coverage, complete, next,
    coverageText: `${tested} of ${total} successfully checked (${coverage}% coverage).`,
    countsText: `${breached} matches + ${clear} no match + ${unknown} unknown + ${pending} pending = ${total} test accounts.`,
  };
}
