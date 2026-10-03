> Historical release notes. These describe this version at release time. Current behavior, including explicit offline signup/reset mode added in v1.4, is documented in [the README](../README.md).

# Version 1.2: local 1,000-account benchmark

## Run locally

Keep the old project folder as a backup. Extract this ZIP into a fresh folder, open the extracted project in VS Code, stop your old server with Control+C, then run:

```bash
npm install
npm run dev
```

Node.js 24+ is required. Open the localhost URL printed by Vite.

## Judge walkthrough

1. Open Security dashboard.
2. Change Analysis mode to Local mock benchmark · 1,000 accounts.
3. Read the MOCK BENCHMARK banner. This mode makes no live HIBP calls.
4. Select Normal, then Run analysis. Watch progress and performance counters.
5. A complete run calculates 230 matches and 770 non-matches (23%) against the synthetic mock corpus. These are test fixtures, not real breach statistics.
6. Export the JSON report. Its source, mode, scenario and timing scope explicitly identify mock results.
7. Select Service outage and run again. The mock service begins returning 503 on the eighth uncached request. Three consecutive failures stop the run. Unknown/pending results never become clear.
8. Try cancellation. Partial results remain labelled incomplete.
9. Switch to Live HIBP to restore the 20/100-account live demo. Prior metrics and results clear. Signup and reset always use live HIBP regardless of dashboard mode.

## What the benchmark verifies

The mock adapter supplies range-shaped responses to the SAME browser SHA-1, prefix split, parser, cache and suffix-matching code as the live application. It never replaces the final verdict with a preset percentage. Five public synthetic fixtures form the mock corpus. The first 230 accounts cycle through them; the remaining 770 use distinct, deterministic public test strings absent from that corpus. No generated test password is rendered in the dashboard or exported.

Each uncached mock request uses a 2ms local timer so progress and cancellation remain observable. Actual browser timer scheduling varies. Elapsed time includes processing and mock waits, excludes mock corpus setup, and is NOT evidence of live HIBP latency or production throughput. Cache-hit counts are measured. Prefix collisions may cause additional legitimate cache hits, so do not hardcode expected request totals.

This is a functional workload benchmark, not a comparison of optimized versus unoptimized implementations. We do not claim a speedup percentage. Running locally does not prove production scalability.

## Testing and limitations

56 core tests passed. The existing 17 browser tests passed, and both new benchmark browser tests passed after correcting a duplicate accessibility label. Tests block live network traffic and assert zero HIBP requests in mock mode, correct 230/770 results, labelled exports, safe outage/cancellation behaviour and continued live-check routing in signup. Lint and production build passed. Desktop and phone layouts were inspected.

Real authentication and public hosting remain separate future steps. The prototype still simulates account creation and reset. An unavailable live service still blocks submission.
