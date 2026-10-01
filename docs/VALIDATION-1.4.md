# HELLO WORLD v1.4 validation

Validated on macOS / Chromium on 2026-10-01.

- ESLint: passed.
- Unit/service tests: 74 passed, including request privacy, strict parsing, normalization, fail-closed policy, cache/cancellation, lab scenarios, report compatibility, rejected malformed imports and actual processing stages.
- Full Playwright browser suite: 25 passed. After final report placement and lab branding adjustments, all 6 affected upgrade/lab tests passed again.
- Standard production build: passed.
- GitHub Pages production build: passed; repository base remains `/block-the-breached-password/`.
- Visual inspection: dashboard and print stylesheet screenshots reviewed with public mock data. Print shows aggregate coverage, source, timestamp, dataset, policy and recommended actions without navigation or paginated table content.
- Archives: ZIP integrity checked; applying update-only files to the supplied source reconstructs complete-project source. Existing Pages workflow and Vite configuration verified byte-for-byte unchanged.

Browser regression coverage includes explicit-only requests, exact five-character URLs, no request body/cookies/referrer, no password or full hash in logs, no local/session storage, strong-but-breached rejection, stale responses, expiry, reset confirmation, network/malformed failures, phone layout, CSP, mock provenance, cancellation, lazy-loading route cleanup, keyboard skip navigation, readiness UI, offline signup, import roundtrip and print visibility.

Network responses in automated browser tests were intercepted or local mocks. These tests establish application behavior, not current HIBP availability. The print stylesheet was tested; the macOS native Save as PDF dialog was not automated. No deployment, push or account creation was performed.

The strength dictionary remains an approximately 820 kB minified (398 kB gzip) deferred chunk, causing Vite's chunk-size advisory. The home entry is approximately 232 kB minified (73 kB gzip); browser tests verify the strength chunk is not requested on initial home load. This is bundle verification, not a measured real-network loading-time benchmark.

The system Node v26 Playwright installer stalled extracting Chromium. The downloaded official archive was extracted into a temporary directory and used through the existing `BBP_CHROMIUM_PATH` option. No machine-specific browser paths were added to project configuration. The macOS instructions recommend Node 24 and the normal Playwright installation command.
