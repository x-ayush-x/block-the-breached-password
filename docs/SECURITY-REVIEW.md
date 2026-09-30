## Version 1.2 verification (September 28, 2026)

56 core tests passed. All 19 browser cases passed across the regression run and the targeted rerun after fixing a duplicate accessibility label. Mock mode does not call global fetch. Tests verify fixture results, mock export provenance, safe interruption and live signup isolation. No live-service speed or scalability claim is made.

## September 28, 2026 update

Version 1.1: 53 core tests and 17 mocked browser tests pass. Lint and production build pass. Prefix-only evidence clears on password edits, and aggregate performance exports exclude secrets. Dashboard counters are checked against intercepted mock requests. The September 24 audit and live-service observations below remain historical; they were not rerun for this upgrade.

# Security review and verification record

Review date: September 24, 2026. Scope: this frontend demonstration, its source, production build and automated tests. This is a development verification record, not an independent penetration test or compliance certificate.

## Verification completed

| Check | Result |
|---|---|
| Core tests | 49 passed, using mocked network responses |
| Browser tests | 15 passed in headless Chromium against a production preview |
| ESLint | Passed without application errors |
| Production build | Passed; a bundle-size advisory is expected from the zxcvbn dictionary |
| Production dependency audit | npm audit reported zero known production-dependency vulnerabilities at review time; this is not proof of vulnerability absence |
| Live HIBP HTTP smoke test | HTTP 200, actual range response parsed, public test fixture matched locally |
| Direct live browser smoke test | The environment returned an unavailable check. No successful direct browser-to-HIBP result is claimed; verify on your Mac before judging |
| Visual inspection | Overview, dashboard and mobile form inspected; viewport checks at 390px, 1440px and 1920px widths |
| Browser runtime errors during visual capture | None observed |

The browser suite uses mock HIBP responses and disables external requests by default. Its 23% dashboard result is synthetic test evidence, not a measured live result. The independent live HTTP smoke test used a public fixture; it does not establish browser CORS connectivity on every network.

## Acceptance criteria mapped to evidence

| Requirement | Implementation / evidence |
|---|---|
| Signup and reset | Shared AccountPage and checker; successful simulations and rejection tested |
| Strength meter | zxcvbn wrapper, local generic feedback, independent from breach outcome |
| Browser SHA-1 | Web Crypto hashing utility; standard abc vector and prefix/suffix tests |
| Only five hash characters sent | Sole external fetch call; browser test asserts URL, no body, no referrer/cookies |
| Local exact match | Strict suffix parser and matching utility; padded zero-count entries ignored |
| Reject on breach | Both UI eligibility and current submit-handler decision are checked |
| Non-breached can proceed | Valid length/blocklist/form plus current clear result required |
| No app password storage | Source review and empty local/session storage assertions |
| Dashboard and percentage | 100-account fixture test, incomplete-report unit tests and export-field assertions |
| Architecture explanation | How it works and privacy screens; fake illustrative hashes only |
| NIST section | Final official SP 800-63B-4 reference, narrow alignment wording |
| Responsive design | Mobile no-overflow browser check across all seven routes and visual inspection |
| Error handling | Network, malformed, timeout, cancellation, stale response, 429, 404 and 500 tests |
| Documentation | README, beginner walkthrough, demo, presentation and judge Q&A |

## Trust boundaries

1. Input, normalization, strength estimation, hashing and matching run in the browser.
2. HIBP receives a prefix over HTTPS plus ordinary connection metadata. It does not receive an email, full password hash or plaintext password from application code.
3. No backend receives a credential or creates an account. The only persisted deliverable the app can produce is a user-requested non-sensitive JSON report.
4. A browser is not a trusted enforcement boundary. A modified client can bypass the simulation. Production authentication must independently establish the required security properties.

## Protective implementation choices

- Exact five-hex-character validation before fetch.
- Credential omission, no referrer, no request body and no redirects.
- Explicit checks rather than incremental prefix disclosure while typing.
- Per-request abort and timeout; revision counters prevent stale responses.
- Bounded policy/strength inputs, full-length checks and no silent truncation.
- Five-minute results expire and input changes invalidate results immediately.
- Strict whole-response parsing and safe error messages; errors never become clear results.
- No app analytics, remote font requests or intentional password-bearing logs.
- Strength-library outputs are reduced to safe summary fields.
- Dashboard keeps unknown and pending rows distinct and explicitly identifies its denominator.
- Per-run range cache and password references are released after use; no memory-wipe guarantee.
- Restrictive production CSP, denied form submission destinations and optional hosting headers.

## Limitations and residual risks

- A malicious extension, XSS vulnerability, compromised dependency or modified browser can read local inputs. CSP is one layer, not complete protection.
- SHA-1 hash prefixes leak partial information. HIBP/its infrastructure can observe timing, IP address and metadata. We do not promise absolute anonymity or a fixed candidate-set size.
- The corpus is incomplete and changes. TLS protects transport; a syntactically valid but misleading response from a compromised trusted service cannot be detected by our parser.
- The normal app blocks unavailable checks, but a hostile client can change the logic. There is no trusted server-side rejection proof.
- Plaintext public fixtures exist in source. They are labelled test-only. This exception never authorizes storing actual credentials.
- The admin-style dashboard is not authenticated and must not be used for real organization data.
- Session activity is capped, volatile and mutable, not a compliance-grade audit log.
- No real reset-token verification, email ownership check, login throttling, session security or password storage exists.
- NFC lookup checks the normalized password. It does not separately query all alternative representations.
- There is no intentional offline approval mode. A venue without HIBP access cannot demonstrate live acceptance.

## Repeat the checks on your Mac

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

The browser suite normally downloads its own Chromium. Our build environment used a separately supplied Chromium binary because the standard browser download was unavailable; the test configuration supports an optional BBP_CHROMIUM_PATH environment variable for that purpose. You do not need that variable on your Mac.

Then run `npm run dev`, use a public fixture and inspect Chrome's Network tab. Confirm the actual service is reachable from your connection. Keep actual user passwords out of recordings, shared logs and screenshots.

## Screenshot provenance

- overview-desktop.png and overview-1080p.png: actual rendered overview, no breach data.
- signup-mobile.png: actual empty form at a 390px viewport.
- architecture-desktop.png: actual architecture screen with fictional hash illustrations.
- dashboard-mocked.png: actual rendered dashboard with MOCKED HIBP responses; not a live measurement.
- signup-fail-closed.png: actual unavailable state in the development verification environment.

Use a fresh live dashboard screenshot from your own connection for judging. If you use a mocked screenshot, label it clearly.
