import { useEffect, useRef, useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import DashboardCards from "../components/DashboardCards.jsx";
import Icon from "../components/Icon.jsx";
import { runBenchmark } from "../services/benchmark.js";
import { analyzeDemo } from "../services/analyzeDemo.js";
import {
  summarize,
  reportSentence,
  downloadReport,
} from "../utils/reporting.js";

export default function Dashboard({ onAudit }) {
  const [mode, setMode] = useState("live");
  const [scenario, setScenario] = useState("normal");
  const mockMode = mode === "benchmark";
  const [metrics, setMetrics] = useState(null);
  const started = useRef(null);
  const [total, setTotal] = useState(100);
  const [rows, setRows] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [finishedAt, setFinishedAt] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const active = useRef(null);
  const revision = useRef(0);
  useEffect(
    () => () => {
      revision.current++;
      active.current?.abort();
    },
    [],
  );
  const running = phase === "running" || phase === "cancelling";
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setMetrics((previous) => previous && ({ ...previous, elapsedMs: Math.round(performance.now() - started.current) })), 250);
    return () => clearInterval(timer);
  }, [running]);
  const summary = summarize(rows, total);
  const visible = rows.filter(
    (row) => filter === "all" || row.status === filter,
  );
  const pageRows = visible.slice(page * 10, page * 10 + 10);
  const pageCount = Math.max(1, Math.ceil(visible.length / 10));
  const progress = Math.round((rows.length / total) * 100);
  async function run() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const id = ++revision.current;
    setRows([]);
    setMetrics(null);
    started.current = performance.now();
    setPhase("running");
    setFinishedAt(null);
    setPage(0);
    setFilter("all");
    onAudit("Dataset analysis", "Started");
    try {
      const execute = mockMode ? (options) => runBenchmark({ ...options, scenario }) : (options) => analyzeDemo(total, options);
      const outcome = await execute({
        signal: controller.signal,
        onMetrics: (value) => {
          if (revision.current === id) setMetrics(value);
        },
        onRow: (row) => {
          if (revision.current === id)
            setRows((previous) => [...previous, row]);
        },
      });
      if (revision.current !== id) return;
      setPhase(outcome.stoppedEarly ? "interrupted" : "complete");
      setFinishedAt(new Date().toISOString());
      onAudit(
        "Dataset analysis",
        outcome.stoppedEarly ? "Interrupted" : "Completed",
      );
    } catch {
      if (revision.current === id) {
        setPhase(controller.signal.aborted ? "cancelled" : "interrupted");
        setFinishedAt(new Date().toISOString());
        onAudit("Dataset analysis", "Interrupted");
      }
    } finally {
      if (revision.current === id) active.current = null;
    }
  }
  function cancel() {
    active.current?.abort();
    setPhase("cancelling");
    setFinishedAt(new Date().toISOString());
    onAudit("Dataset analysis", "Cancelled");
  }
  function exportReport() {
    downloadReport({
      project: "Block the Breached Password",
      dataset: "Demonstration test dataset — not real user credentials",
      source: mockMode ? "LOCAL MOCK CORPUS — NOT LIVE HIBP" : "Live HIBP Pwned Passwords API",
      mode,
      scenario: mockMode ? scenario : null,
      timingScope: mockMode ? "Local processing plus simulated 2ms request delay; excludes mock corpus setup. Not a network benchmark." : "Local processing and live network waits",
      phase,
      finishedAt,
      summary,
      performance: metrics,
      denominator:
        "Successfully checked accounts; excludes unknown and pending",
      report: (mockMode ? "SYNTHETIC MOCK RESULTS: " : "") + reportSentence(summary),
      rows,
    });
    onAudit("Aggregate report export", "Downloaded");
  }
  const labels = {
    breached: mockMode ? "Mock match" : "Breached",
    clear: mockMode ? "No mock match" : "Not found",
    unknown: "Unknown",
  };
  const circle = 2 * Math.PI * 70;
  const breachedArc = (summary.breached / total) * circle;
  const clearArc = (summary.clear / total) * circle;
  const unknownArc = (summary.unknown / total) * circle;
  return (
    <>
      <PageHeading
        eyebrow="SECURITY OPERATIONS · DEMONSTRATION"
        title="Understand your exposure."
        description="Measure breached-password use across a temporary set of test accounts."
      >
        <button
          className="button secondary"
          onClick={exportReport}
          disabled={!rows.length || running}
        >
          <Icon name="download" size={17} />
          Export report
        </button>
      </PageHeading>
      <div className="dataset-banner">
        <Icon name="info" size={19} />
        <p>
          <strong>
            Demonstration test dataset — not real user credentials.
          </strong>{" "}
          Generated locally for each run. No passwords appear in reports.
        </p>
      </div>
      <section className="panel performance-panel" aria-label="Analysis configuration">
        <label htmlFor="analysis-mode"><strong>Analysis mode</strong></label>
        <select id="analysis-mode" value={mode} disabled={running} onChange={(event) => {
          const next = event.target.value;
          setMode(next); setTotal(next === "benchmark" ? 1000 : 100);
          setRows([]); setMetrics(null); setPhase("idle"); setFinishedAt(null); setPage(0); setFilter("all");
        }}>
          <option value="live">Live HIBP · 20 or 100 accounts</option>
          <option value="benchmark">Local mock benchmark · 1,000 accounts</option>
        </select>
        {mockMode && <div className="notice warning" role="status"><strong>MOCK BENCHMARK — NO LIVE HIBP REQUESTS</strong><p>Results come from a fixed synthetic corpus. They do not measure real-world breach exposure or HIBP speed. Signup and reset still use live HIBP.</p></div>}
        {mockMode && <div className="field"><label htmlFor="benchmark-scenario">Benchmark scenario</label><select id="benchmark-scenario" value={scenario} disabled={running} onChange={(event) => {setScenario(event.target.value); setRows([]); setMetrics(null); setPhase("idle"); setFinishedAt(null); setPage(0); setFilter("all");}}><option value="normal">Normal · complete 1,000 checks</option><option value="outage">Service outage · demonstrate safe failure</option></select></div>}
      </section>
      <DashboardCards mockMode={mockMode} summary={summary} hasRun={phase !== "idle"} />
      <section className="panel performance-panel" aria-label="Run performance">
        <h2>Run performance</h2>
        <p className="muted">{mockMode ? "Local mock measurements. No external requests. Each mock request includes a 2ms timer." : "Measured for this run. Reused results avoid another HIBP request."}</p>
        <dl className="performance-grid">
          {[
            ["Completed checks", summary.tested],
            ["Failed checks", summary.unknown],
            [(mockMode ? "Mock requests started" : "API requests started"), metrics?.requestsStarted],
            ["Requests avoided by reuse", metrics?.reusedResults],
            [(mockMode ? "Valid Mock responses" : "Valid API responses"), metrics?.responsesReceived],
            [(mockMode ? "Failed Mock requests" : "Failed API requests"), metrics?.requestsFailed],
            [(mockMode ? "Cancelled Mock requests" : "Cancelled API requests"), metrics?.requestsCancelled],
            ["Elapsed time", metrics ? `${(metrics.elapsedMs / 1000).toFixed(1)} s` : null],
          ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{phase === "idle" ? "—" : value ?? "—"}</dd></div>)}
        </dl>
        <p className="fine-print">{mockMode ? "Mock requests stay in memory. Elapsed time includes artificial timer delays and excludes mock corpus setup." : "Requests started counts application fetch attempts, not guaranteed server arrivals."} {!mockMode && "Time includes local processing and network waits."} Reuse counts successful cache hits within this run. Failed and cancelled requests are separate from completed account checks.</p>
      </section>
      <div className="dashboard-grid">
        <section className="panel analysis-panel">
          <div className="section-header">
            <div>
              <h2>Run an exposure analysis</h2>
              <p className="muted">
                {mockMode ? "The same hashing, parsing and matching engine, with local mock responses." : "A live check for each test account. No invented results."}
              </p>
            </div>
            <span className={`pill ${running ? "working" : ""}`}>
              {running
                ? "Processing"
                : phase === "complete"
                  ? "Run finished"
                  : "Ready to inspect"}
            </span>
          </div>
          <div className="dataset-controls">
            <div className="field">
              <label htmlFor="dataset-size">Dataset size</label>
              <select
                id="dataset-size"
                value={total}
                disabled={running}
                onChange={(e) => {
                  setTotal(Number(e.target.value));
                  setRows([]);
                  setMetrics(null);
                  setPhase("idle");
                  setFinishedAt(null);
                  setPage(0);
                }}
              >
                {mockMode ? <option value={1000}>1,000 synthetic accounts · Mock only</option> : <><option value={20}>20 test accounts · Quick demo</option>
                <option value={100}>100 test accounts · Full report</option></>}
              </select>
            </div>
            {running ? (
              <button className="button secondary" onClick={cancel}>
                Cancel analysis
              </button>
            ) : (
              <button className="button primary" onClick={run}>
                <Icon name="bolt" size={17} />
                {phase === "idle" ? "Run analysis" : "Run again"}
              </button>
            )}
          </div>
          <div className="spread progress-label">
            <span>
              {rows.length} of {total} processed
            </span>
            <strong>{progress}%</strong>
          </div>
          <progress
            max={total}
            value={rows.length}
            aria-label="Analysis progress"
          />
          <div className="run-detail">
            <span>
              <i className="legend-dot safe" />
              {summary.tested} checked
            </span>
            <span>
              <i className="legend-dot warning" />
              {summary.unknown} unknown
            </span>
            <span>
              <i className="legend-dot neutral" />
              {summary.pending} pending
            </span>
          </div>
          <p className="analysis-explanation">
            {mockMode ? "Fixed dataset: 230 entries repeat five mock-listed fixtures, and 770 distinct synthetic strings are absent from the mock corpus. Expected complete result: 23% mock matches. The app calculates the result using exact suffix comparison; it does not insert a preset percentage." : "The full dataset combines 23 public common-password fixtures with 77 fresh random strings. HIBP determines the outcome; the 20-account demo uses 5 common fixtures. Duplicate prefixes are reused within one run."}
          </p>
          {(phase === "interrupted" || phase === "cancelled") && (
            <div className="notice warning" role="status">
              {phase === "cancelled"
                ? "Analysis cancelled."
                : "Analysis stopped after repeated errors or a rate-limit response."}{" "}
              Results are incomplete. Unknown and pending accounts are not
              counted as clear. Wait before running again.
            </div>
          )}
          <div className="report-callout" role="status">
            <span className="small-label">{mockMode ? "SYNTHETIC MOCK REPORT" : "EXPOSURE REPORT"}</span>
            <p>
              {phase === "idle"
                ? "Run an analysis to calculate the breach exposure rate."
                : (mockMode ? "Mock corpus: " : "") + reportSentence(summary)}
            </p>
            {finishedAt && (
              <small>Finished {new Date(finishedAt).toLocaleString()}</small>
            )}
          </div>
          <p className="fine-print">
            Navigating away cancels the run and clears its report. Export first
            if you want to keep the non-sensitive results.
          </p>
        </section>
        <section className="panel distribution-panel">
          <h2>{mockMode ? "Mock result breakdown" : "Exposure breakdown"}</h2>
          <p className="muted">All {total} accounts, including pending</p>
          <div className="donut-wrap">
            <svg
              viewBox="0 0 180 180"
              role="img"
              aria-label={`${summary.breached} breached, ${summary.clear} not found, ${summary.unknown} unknown, ${summary.pending} pending`}
            >
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#edf0f5"
                strokeWidth="17"
              />
              {[
                [breachedArc, 0, "#d85560"],
                [clearArc, breachedArc, "#1d9a78"],
                [unknownArc, breachedArc + clearArc, "#db9b32"],
              ].map(([arc, offset, color]) => (
                <circle
                  key={color}
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke={color}
                  strokeWidth="17"
                  strokeDasharray={`${arc} ${circle - arc}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 90 90)"
                />
              ))}
            </svg>
            <div className="donut-label">
              <strong>
                {summary.percentage === null ? "—" : `${summary.percentage}%`}
              </strong>
              <span>
                of checked accounts
                <br />
                {mockMode ? "match the mock corpus" : "are breached"}
              </span>
            </div>
          </div>
          <ul className="chart-legend">
            {[
              ["danger", mockMode ? "Mock match" : "Breached", summary.breached],
              ["safe", mockMode ? "No mock match" : "Not found", summary.clear],
              ["warning", "Unknown", summary.unknown],
              ["neutral", "Pending", summary.pending],
            ].map(([tone, label, count]) => (
              <li key={label}>
                <span>
                  <i className={`legend-dot ${tone}`} />
                  {label}
                </span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="panel results-panel">
        <div className="section-header">
          <div>
            <h2>Account results</h2>
            <p className="muted">
              Test IDs and decisions only. Passwords and hashes are excluded.
            </p>
          </div>
          <select
            aria-label="Filter account results"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All results</option>
            <option value="breached">Breached</option>
            <option value="clear">Not found</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        {rows.length ? (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>TEST ACCOUNT</th>
                    <th>BREACH STATUS</th>
                    <th>CHECKED AT</th>
                    <th>RECOMMENDED ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.id}>
                      <td className="mono">{row.id}</td>
                      <td>
                        <span className={`result-pill ${row.status}`}>
                          {labels[row.status]}
                        </span>
                      </td>
                      <td>{new Date(row.checkedAt).toLocaleTimeString()}</td>
                      <td>
                        {row.status === "breached"
                          ? "Reject password"
                          : row.status === "clear"
                            ? "Apply remaining policy checks"
                            : "Retry; keep gate closed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                {visible.length} matching results · Page {page + 1} of{" "}
                {pageCount}
              </span>
              <div>
                <button
                  className="button small secondary"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="button small secondary"
                  disabled={page + 1 >= pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Icon name="chart" size={30} />
            <h3>Your results will appear here</h3>
            <p>Start an analysis to see account-level decisions.</p>
          </div>
        )}
      </section>
    </>
  );
}
