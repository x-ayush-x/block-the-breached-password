# Version 1.1: Privacy evidence and performance reporting

## Run on your Mac

Keep your previous project folder as a backup. Extract this ZIP into a new folder and open that extracted project folder in VS Code. In Terminal > New Terminal run:

```bash
npm install
npm run dev
```

Open the localhost address Vite prints. Node.js 24 or later is required, as in the previous version. Stop the old development server with Control+C before starting this one.

## Try the privacy evidence

1. Open Sign up or Reset password.
2. Enter a test-only password and expand “Inspect this check’s privacy evidence”.
3. Click “Check password securely”.
4. The panel shows the actual five-character prefix, request URL and lifecycle status. It never shows the full hash or plaintext password.
5. Edit the password. The evidence clears immediately along with the prior approval. Late responses cannot restore old evidence.
6. Verify independently in Chrome DevTools > Network, filtering “range”. An OPTIONS preflight may appear in addition to GET. The panel itself is an application display, not independent security proof.

Prefixes reveal partial hash information. HIBP still sees ordinary connection metadata. Evidence lives only in memory. This application still simulates authentication.

## Try the performance report

1. Open Security dashboard and select 20 or 100 accounts.
2. Run analysis and watch the performance section.
3. Export the JSON report after the run to include aggregate performance counters.
4. Rerunning or changing dataset size resets counters. Cancelling retains the completed portion and counts an aborted in-flight request separately.

Definitions:
- Completed checks: accounts classified breached or no known match.
- Failed checks: accounts with an unknown result. Pending/cancelled work is not counted as clear.
- API requests started: application GET fetch attempts. This is not guaranteed server arrival and excludes browser-managed OPTIONS preflights/retries.
- Requests avoided by reuse: successful per-run prefix-cache hits. No measured percentage improvement is assumed.
- Valid API responses: successfully parsed range responses, including responses with no match.
- Failed API requests: network, timeout, HTTP or malformed-response failures.
- Cancelled API requests: attempts aborted by the caller, tracked separately from failures.
- Elapsed time: wall-clock duration measured with a monotonic browser timer, including processing and waiting. It is not a server latency benchmark.

No passwords, full hashes or prefixes appear in the exported performance counters. Prefix caches clear after completion or cancellation. Original 20/100 live datasets remain unchanged. The 1,000-account benchmark and deployment are future steps, not included in this upgrade.

## Verification

53 core tests and 17 mocked browser tests passed. Lint and production build passed. Automated tests make no live HIBP calls. No new live service connectivity claim is made.

If the page looks like the old version, stop the old server, verify VS Code has opened the new folder, run the commands above, and refresh Chrome. If HIBP is unavailable, the panel will show failure and submission stays blocked.
